import { spawn } from "node:child_process";
import { basename } from "node:path";
import { mapWithConcurrency } from "./bounded-concurrency.ts";

export type DiagnosticsMode = "all" | "fast" | "sonar";

export interface DiagnosticsCheck {
  name: string;
  script: string;
  prefix?: string;
}

export interface DiagnosticsLogger {
  log: (message: string) => void;
  error: (message: string) => void;
}

export interface DiagnosticsRunResult {
  error?: Error;
  status: number | null;
}

const FAST_DIAGNOSTICS_CONCURRENCY = 4;

export const fastDiagnosticsChecks: readonly DiagnosticsCheck[] = [
  { name: "Repository ESLint and SonarJS", script: "lint:root" },
  { name: "API ESLint and SonarJS", script: "lint:check", prefix: "api" },
  {
    name: "Public ESLint and SonarJS",
    script: "lint:check",
    prefix: "web/public",
  },
  {
    name: "Backoffice ESLint and SonarJS",
    script: "lint:check",
    prefix: "web/backoffice",
  },
  { name: "Repository TypeScript", script: "typecheck:root" },
  { name: "API TypeScript", script: "typecheck", prefix: "api" },
  { name: "Public TypeScript", script: "typecheck", prefix: "web/public" },
  {
    name: "Backoffice TypeScript",
    script: "typecheck",
    prefix: "web/backoffice",
  },
  {
    name: "Backoffice component modules",
    script: "check:component-modules",
    prefix: "web/backoffice",
  },
  { name: "Documentation links", script: "links:check:internal" },
  { name: "Test title conventions", script: "test:naming" },
];

export const sonarDiagnosticsChecks: readonly DiagnosticsCheck[] = [
  { name: "Test coverage reports", script: "test:coverage" },
  { name: "SonarQube full-project analysis", script: "sonar:check" },
];

export function resolveDiagnosticsChecks(
  mode: string,
): readonly DiagnosticsCheck[] {
  if (!new Set(["all", "fast", "sonar"]).has(mode)) {
    throw new Error(`Unknown diagnostics mode: ${mode}`);
  }
  return [
    ...(mode === "sonar" ? [] : fastDiagnosticsChecks),
    ...(mode === "fast" ? [] : sonarDiagnosticsChecks),
  ];
}

function resolveDiagnosticsPhases(mode: string): readonly (readonly DiagnosticsCheck[])[] {
  resolveDiagnosticsChecks(mode);
  return [
    ...(mode === "sonar" ? [] : [fastDiagnosticsChecks]),
    ...(mode === "fast"
      ? []
      : sonarDiagnosticsChecks.map((check) => [check] as const)),
  ];
}

function runNpmCheck(
  check: DiagnosticsCheck,
  npmCli: string,
): Promise<DiagnosticsRunResult> {
  const args = [npmCli, "run", check.script];
  if (check.prefix) {
    args.push("--prefix", check.prefix);
  }

  return new Promise((resolve) => {
    const child = spawn(process.execPath, args, { stdio: "inherit" });
    let settled = false;
    child.once("error", (error) => {
      settled = true;
      resolve({ error, status: null });
    });
    child.once("close", (status) => {
      if (!settled) {
        resolve({ status });
      }
    });
  });
}

export async function runDiagnostics({
  mode = process.argv[2] ?? "all",
  npmCli = process.env.npm_execpath,
  runCheckImpl = runNpmCheck,
  logger = console,
}: {
  mode?: string;
  npmCli?: string;
  runCheckImpl?: (
    check: DiagnosticsCheck,
    npmCli: string,
  ) => Promise<DiagnosticsRunResult>;
  logger?: DiagnosticsLogger;
} = {}): Promise<{ clean: boolean; failures: string[] }> {
  if (!npmCli) {
    throw new Error(
      "Run diagnostics through npm so npm_execpath is available.",
    );
  }
  const failures: string[] = [];

  for (const phase of resolveDiagnosticsPhases(mode)) {
    const phaseResults = await mapWithConcurrency(
      phase,
      FAST_DIAGNOSTICS_CONCURRENCY,
      async (check) => {
        logger.log(`\n[diagnostics] ${check.name}`);
        const result = await runCheckImpl(check, npmCli);
        if (result.error) {
          logger.error(
            `[diagnostics] ${check.name} could not start: ${result.error.message}`,
          );
        }
        return { check, result };
      },
    );

    for (const { check, result } of phaseResults) {
      if (result.error || result.status !== 0) {
        failures.push(check.name);
      }
    }
  }

  if (failures.length > 0) {
    logger.error(`\n[diagnostics] Failed checks: ${failures.join(", ")}`);
    process.exitCode = 1;
    return { clean: false, failures };
  }

  logger.log(`\n[diagnostics] All ${mode} diagnostics passed.`);
  return { clean: true, failures };
}

if (basename(process.argv[1] ?? "") === "diagnostics.ts") {
  void runDiagnostics();
}

