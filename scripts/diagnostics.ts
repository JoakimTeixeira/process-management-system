import { spawnSync, type SpawnSyncReturns } from "node:child_process";
import { basename } from "node:path";

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

export function runDiagnostics({
  mode = process.argv[2] ?? "all",
  npmCli = process.env.npm_execpath,
  spawnSyncImpl = spawnSync,
  logger = console,
}: {
  mode?: string;
  npmCli?: string;
  spawnSyncImpl?: (
    command: string,
    args: readonly string[],
    options: { stdio: "inherit" },
  ) => Pick<SpawnSyncReturns<Buffer>, "error" | "status">;
  logger?: DiagnosticsLogger;
} = {}): { clean: boolean; failures: string[] } {
  if (!npmCli) {
    throw new Error(
      "Run diagnostics through npm so npm_execpath is available.",
    );
  }
  const checks = resolveDiagnosticsChecks(mode);
  const failures: string[] = [];

  for (const { name, script, prefix } of checks) {
    logger.log(`\n[diagnostics] ${name}`);

    const args = [npmCli, "run", script];
    if (prefix) {
      args.push("--prefix", prefix);
    }

    const result = spawnSyncImpl(process.execPath, args, { stdio: "inherit" });

    if (result.error) {
      logger.error(
        `[diagnostics] ${name} could not start: ${result.error.message}`,
      );
      failures.push(name);
      continue;
    }

    if (result.status !== 0) {
      failures.push(name);
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
  runDiagnostics();
}

