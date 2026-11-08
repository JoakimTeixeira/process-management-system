import { spawnSync } from "node:child_process";

const npmCli = process.env.npm_execpath;
const mode = process.argv[2] ?? "all";

if (!npmCli) {
  throw new Error("Run diagnostics through npm so npm_execpath is available.");
}
if (!new Set(["all", "fast", "sonar"]).has(mode)) {
  throw new Error(`Unknown diagnostics mode: ${mode}`);
}

const fastChecks = [
  ["Repository ESLint and SonarJS", "lint:root"],
  ["API ESLint and SonarJS", "lint:check", "api"],
  ["Public ESLint and SonarJS", "lint:check", "web/public"],
  ["Backoffice ESLint and SonarJS", "lint:check", "web/backoffice"],
  ["Repository TypeScript", "typecheck:root"],
  ["API TypeScript", "typecheck", "api"],
  ["Public TypeScript", "typecheck", "web/public"],
  ["Backoffice TypeScript", "typecheck", "web/backoffice"],
  ["Backoffice component modules", "check:component-modules", "web/backoffice"],
];
const sonarChecks = [["SonarQube full-project analysis", "sonar:check"]];
const checks = [
  ...(mode === "sonar" ? [] : fastChecks),
  ...(mode === "fast" ? [] : sonarChecks),
];

const failures = [];

for (const [name, script, prefix] of checks) {
  console.log(`\n[diagnostics] ${name}`);

  const args = [npmCli, "run", script];

  if (prefix) {
    args.push("--prefix", prefix);
  }

  const result = spawnSync(process.execPath, args, { stdio: "inherit" });

  if (result.error) {
    console.error(
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
  console.error(`\n[diagnostics] Failed checks: ${failures.join(", ")}`);
  process.exitCode = 1;
} else {
  console.log(`\n[diagnostics] All ${mode} diagnostics passed.`);
}
