import { scan } from "@sonar/scan";
import { readFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import {
  SonarDiagnosticError,
  assertSameServer,
  assertServerReady,
  fetchPages,
  formatLocation,
  parseProperties,
  sonarRequest,
  waitForComputeTask,
  type SonarFetch,
} from "./sonar-api.ts";

const defaultProjectKey = "process-management-system";

export interface SonarIssue {
  key: string;
  component?: string;
  line?: number;
  severity?: string;
  rule?: string;
  message?: string;
}

export interface SonarHotspot {
  key: string;
  component?: string;
  line?: number;
  ruleKey?: string;
  message?: string;
}

export interface SonarQualityGateCondition {
  actualValue?: string;
  comparator?: string;
  errorThreshold?: string;
  metricKey?: string;
  status?: string;
}

export interface SonarMeasure {
  metric: string;
  value?: string;
}

export interface SonarLogger {
  log: (message: string) => void;
  error: (message: string) => void;
}

export interface SonarCheckResult {
  clean: boolean;
  gateStatus: "OK" | "ERROR";
  hotspots: SonarHotspot[];
  issues: SonarIssue[];
}

export async function runSonarCheck({
  environment = process.env,
  fetchImpl = fetch,
  logger = console,
  readFileImpl = readFile,
  scanImpl = scan,
  workingDirectory = process.cwd(),
}: {
  environment?: NodeJS.ProcessEnv;
  fetchImpl?: SonarFetch;
  logger?: SonarLogger;
  readFileImpl?: (path: string, encoding: BufferEncoding) => Promise<string>;
  scanImpl?: (parameters: {
    serverUrl: string;
    token: string;
    options: Record<string, string>;
  }) => Promise<unknown>;
  workingDirectory?: string;
} = {}): Promise<SonarCheckResult> {
  const serverUrl = removeTrailingSlashes(
    (environment.SONAR_HOST_URL ?? "http://localhost:9000").trim(),
  );
  const projectKey = environment.SONAR_PROJECT_KEY?.trim() || defaultProjectKey;
  const organization = environment.SONAR_ORGANIZATION?.trim();
  const projectBaseDirectory = resolve(
    workingDirectory,
    environment.SONAR_PROJECT_BASE_DIR?.trim() || ".",
  );
  const token = await loadToken(environment, workingDirectory, readFileImpl);

  await assertServerReady(serverUrl, token, fetchImpl);

  const options: Record<string, string> = {
    "sonar.projectBaseDir": projectBaseDirectory,
    "sonar.projectKey": projectKey,
  };
  if (organization) {
    options["sonar.organization"] = organization;
  }

  logger.log(`[sonar] Scanning ${projectKey} with ${serverUrl}`);
  try {
    await scanImpl({ serverUrl, token, options });
  } catch (error) {
    throw new SonarDiagnosticError(
      "scanner",
      "SonarScanner execution failed.",
      {
        cause: error,
      },
    );
  }

  let report: Record<string, string>;
  try {
    report = parseProperties(
      await readFileImpl(
        join(projectBaseDirectory, ".scannerwork", "report-task.txt"),
        "utf8",
      ),
    );
  } catch (error) {
    throw new SonarDiagnosticError(
      "scanner",
      "SonarScanner did not produce .scannerwork/report-task.txt.",
      { cause: error },
    );
  }

  if (!report.ceTaskUrl || !report.serverUrl) {
    throw new SonarDiagnosticError(
      "scanner",
      "SonarScanner report is missing its server or compute-task URL.",
    );
  }

  const reportServerUrl = removeTrailingSlashes(report.serverUrl);
  assertSameServer(serverUrl, reportServerUrl);

  const timeoutMilliseconds = parsePositiveInteger(
    environment.SONAR_ANALYSIS_TIMEOUT_MS,
    240_000,
  );
  const pollMilliseconds = parsePositiveInteger(
    environment.SONAR_POLL_INTERVAL_MS,
    2_000,
  );
  const task = await waitForComputeTask(
    report.ceTaskUrl,
    reportServerUrl,
    token,
    {
      fetchImpl,
      intervalMilliseconds: pollMilliseconds,
      maxAttempts: Math.max(
        1,
        Math.ceil(timeoutMilliseconds / pollMilliseconds),
      ),
    },
  );
  const issues = deduplicate(
    await fetchPages<SonarIssue>(
      reportServerUrl,
      token,
      "api/issues/search",
      "issues",
      { componentKeys: projectKey, resolved: "false" },
      fetchImpl,
    ),
  );
  const hotspots = deduplicate(
    await fetchPages<SonarHotspot>(
      reportServerUrl,
      token,
      "api/hotspots/search",
      "hotspots",
      { project: projectKey, status: "TO_REVIEW" },
      fetchImpl,
    ),
  );
  const qualityGate = await sonarRequest<{
    projectStatus?: {
      status?: string;
      conditions?: SonarQualityGateCondition[];
    };
  }>(
    reportServerUrl,
    token,
    `api/qualitygates/project_status?analysisId=${encodeURIComponent(task.analysisId)}`,
    fetchImpl,
  );
  const measureResponse = await sonarRequest<{
    component?: { measures?: SonarMeasure[] };
  }>(
    reportServerUrl,
    token,
    `api/measures/component?component=${encodeURIComponent(projectKey)}&metricKeys=coverage,lines_to_cover,duplicated_lines,duplicated_lines_density`,
    fetchImpl,
  );

  printIssues(issues, projectKey, logger);
  printHotspots(hotspots, projectKey, logger);

  const projectStatus = qualityGate.projectStatus;
  const measures = toMeasureMap(measureResponse.component?.measures ?? []);
  const measureFailures = evaluateOverallMeasures(measures);
  const conditions = mergeConditions(
    projectStatus?.conditions ?? [],
    measureFailures,
  );
  const gateStatus =
    (projectStatus?.status ?? "UNKNOWN") === "OK" &&
    measureFailures.length === 0
      ? "OK"
      : "ERROR";
  if (
    measures.coverage !== undefined ||
    measures.duplicated_lines_density !== undefined
  ) {
    logger.log(
      `[sonar] Measures: coverage=${measures.coverage ?? "n/a"}%, ` +
        `duplications=${measures.duplicated_lines_density ?? "0.0"}% ` +
        `(${measures.duplicated_lines ?? "0"} lines)`,
    );
  }
  printFailedGateConditions(conditions, logger);
  logger.log(`[sonar] Quality gate: ${gateStatus}`);
  logger.log(
    `[sonar] Dashboard: ${report.dashboardUrl ?? `${serverUrl}/dashboard?id=${projectKey}`}`,
  );

  const clean =
    issues.length === 0 && hotspots.length === 0 && gateStatus === "OK";
  if (clean) {
    logger.log("[sonar] No unresolved issues or unreviewed hotspots.");
  } else {
    logger.error(
      `[sonar] Failed with ${issues.length} unresolved issue(s), ` +
        `${hotspots.length} unreviewed hotspot(s), and quality gate ${gateStatus}.`,
    );
  }

  return { clean, gateStatus, hotspots, issues };
}

export async function main(): Promise<void> {
  try {
    const result = await runSonarCheck();
    if (!result.clean) {
      process.exitCode = 1;
    }
  } catch (error) {
    const category =
      error instanceof SonarDiagnosticError ? error.category : "unexpected";
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[sonar][${category}] ${message}`);
    if (error instanceof Error && error.cause instanceof Error) {
      console.error(`[sonar][${category}] Cause: ${error.cause.message}`);
    }
    process.exitCode = 1;
  }
}

async function loadToken(
  environment: NodeJS.ProcessEnv,
  workingDirectory: string,
  readFileImpl: (path: string, encoding: BufferEncoding) => Promise<string>,
): Promise<string> {
  const configured = environment.SONAR_TOKEN?.trim();
  if (configured) {
    return configured;
  }

  try {
    const stored = await readFileImpl(
      join(workingDirectory, ".sonarqube", "token"),
      "utf8",
    );
    if (stored.trim()) {
      return stored.trim();
    }
  } catch (error) {
    if (!isMissingFileError(error)) {
      throw error;
    }
  }

  throw new SonarDiagnosticError(
    "authentication",
    "SONAR_TOKEN is missing and .sonarqube/token does not exist. Run `npm run sonar:start`.",
  );
}

function isMissingFileError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "ENOENT"
  );
}

function printIssues(
  issues: readonly SonarIssue[],
  key: string,
  logger: SonarLogger,
): void {
  for (const issue of issues) {
    const location = formatLocation(issue.component, issue.line, key);
    logger.error(
      `${location} [SonarQube ${issue.severity ?? "ISSUE"} ${issue.rule ?? "unknown"}] ${issue.message ?? ""}`,
    );
  }
}

function printHotspots(
  hotspots: readonly SonarHotspot[],
  key: string,
  logger: SonarLogger,
): void {
  for (const hotspot of hotspots) {
    const location = formatLocation(hotspot.component, hotspot.line, key);
    logger.error(
      `${location} [SonarQube HOTSPOT ${hotspot.ruleKey ?? "unknown"}] ${hotspot.message ?? ""}`,
    );
  }
}

function printFailedGateConditions(
  conditions: readonly SonarQualityGateCondition[],
  logger: SonarLogger,
): void {
  for (const condition of conditions) {
    if (condition.status !== "ERROR") {
      continue;
    }
    logger.error(
      `[sonar] Quality gate condition failed: ${condition.metricKey ?? "unknown metric"} ` +
        `${condition.comparator ?? "?"} ${condition.errorThreshold ?? "?"} ` +
        `(actual ${condition.actualValue ?? "unknown"}).`,
    );
  }
}

function toMeasureMap(
  measures: readonly SonarMeasure[],
): Record<string, string | undefined> {
  return Object.fromEntries(
    measures.map((measure) => [measure.metric, measure.value]),
  );
}

function evaluateOverallMeasures(
  measures: Record<string, string | undefined>,
): SonarQualityGateCondition[] {
  const failures: SonarQualityGateCondition[] = [];
  const linesToCover = Number.parseInt(measures.lines_to_cover ?? "0", 10);
  const coverage = Number.parseFloat(measures.coverage ?? "0");
  if (linesToCover > 0 && (!Number.isFinite(coverage) || coverage < 80)) {
    failures.push({
      actualValue: measures.coverage ?? "0.0",
      comparator: "LT",
      errorThreshold: "80",
      metricKey: "coverage",
      status: "ERROR",
    });
  }

  const duplicatedLines = Number.parseInt(measures.duplicated_lines ?? "0", 10);
  const duplicatedDensity = Number.parseFloat(
    measures.duplicated_lines_density ?? "0",
  );
  if (duplicatedLines > 0 || duplicatedDensity > 0) {
    failures.push({
      actualValue:
        measures.duplicated_lines_density ?? String(measures.duplicated_lines),
      comparator: "GT",
      errorThreshold: "0",
      metricKey: "duplicated_lines_density",
      status: "ERROR",
    });
  }

  return failures;
}

function mergeConditions(
  serverConditions: readonly SonarQualityGateCondition[],
  measureFailures: readonly SonarQualityGateCondition[],
): SonarQualityGateCondition[] {
  const seenErrorMetrics = new Set(
    serverConditions
      .filter((condition) => condition.status === "ERROR")
      .map((condition) => condition.metricKey),
  );
  return [
    ...serverConditions,
    ...measureFailures.filter(
      (failure) => !seenErrorMetrics.has(failure.metricKey),
    ),
  ];
}

function deduplicate<T extends { key: string }>(results: readonly T[]): T[] {
  return [...new Map(results.map((result) => [result.key, result])).values()];
}

function parsePositiveInteger(
  value: string | undefined,
  fallback: number,
): number {
  if (!value) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new SonarDiagnosticError(
      "configuration",
      `Expected a positive integer, received: ${value}`,
    );
  }
  return parsed;
}

function removeTrailingSlashes(value: string): string {
  let end = value.length;
  while (end > 0 && value[end - 1] === "/") {
    end -= 1;
  }
  return value.slice(0, end);
}

if (basename(process.argv[1] ?? "") === "sonar-check.ts") {
  void main();
}

