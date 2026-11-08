import { scan } from "@sonar/scan";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import {
  SonarDiagnosticError,
  assertSameServer,
  assertServerReady,
  fetchPages,
  formatLocation,
  parseProperties,
  sonarRequest,
  waitForComputeTask,
} from "./sonar-api.mjs";

const defaultProjectKey = "process-management-system";

export async function runSonarCheck({
  environment = process.env,
  fetchImpl = fetch,
  logger = console,
  readFileImpl = readFile,
  scanImpl = scan,
  workingDirectory = process.cwd(),
} = {}) {
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

  const options = {
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

  let report;
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
    await fetchPages(
      reportServerUrl,
      token,
      "api/issues/search",
      "issues",
      { componentKeys: projectKey, resolved: "false" },
      fetchImpl,
    ),
  );
  const hotspots = deduplicate(
    await fetchPages(
      reportServerUrl,
      token,
      "api/hotspots/search",
      "hotspots",
      { project: projectKey, status: "TO_REVIEW" },
      fetchImpl,
    ),
  );
  const qualityGate = await sonarRequest(
    reportServerUrl,
    token,
    `api/qualitygates/project_status?analysisId=${encodeURIComponent(task.analysisId)}`,
    fetchImpl,
  );
  const measureResponse = await sonarRequest(
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

async function main() {
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

async function loadToken(environment, workingDirectory, readFileImpl) {
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
    if (!error || typeof error !== "object" || error.code !== "ENOENT") {
      throw error;
    }
  }

  throw new SonarDiagnosticError(
    "authentication",
    "SONAR_TOKEN is missing and .sonarqube/token does not exist. Run `npm run sonar:start`.",
  );
}

function printIssues(issues, key, logger) {
  for (const issue of issues) {
    const location = formatLocation(issue.component, issue.line, key);
    logger.error(
      `${location} [SonarQube ${issue.severity ?? "ISSUE"} ${issue.rule}] ${issue.message}`,
    );
  }
}

function printHotspots(hotspots, key, logger) {
  for (const hotspot of hotspots) {
    const location = formatLocation(hotspot.component, hotspot.line, key);
    logger.error(
      `${location} [SonarQube HOTSPOT ${hotspot.ruleKey}] ${hotspot.message}`,
    );
  }
}

function printFailedGateConditions(conditions, logger) {
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

function toMeasureMap(measures) {
  return Object.fromEntries(
    measures.map((measure) => [measure.metric, measure.value]),
  );
}

function evaluateOverallMeasures(measures) {
  const failures = [];
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

function mergeConditions(serverConditions, measureFailures) {
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

function deduplicate(results) {
  return [...new Map(results.map((result) => [result.key, result])).values()];
}

function parsePositiveInteger(value, fallback) {
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

function removeTrailingSlashes(value) {
  let end = value.length;
  while (end > 0 && value[end - 1] === "/") {
    end -= 1;
  }
  return value.slice(0, end);
}

const invokedPath = process.argv[1]
  ? pathToFileURL(resolve(process.argv[1])).href
  : undefined;
if (invokedPath === import.meta.url) {
  await main();
}
