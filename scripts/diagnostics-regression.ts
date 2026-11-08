import assert from "node:assert/strict";
import { spawnSync, type SpawnSyncReturns } from "node:child_process";
import { mkdir, rm, unlink, writeFile } from "node:fs/promises";
import { basename, isAbsolute, join, relative, resolve } from "node:path";

const root = process.cwd();

export async function runDiagnosticsRegression({
  mode = process.argv[2] ?? "all",
  npmCli = process.env.npm_execpath,
}: {
  mode?: string;
  npmCli?: string;
} = {}): Promise<void> {
  if (!npmCli) {
    throw new Error("Run diagnostics regression tests through npm.");
  }
  if (!new Set(["all", "fast", "sonar"]).has(mode)) {
    throw new Error(`Unknown diagnostics regression mode: ${mode}`);
  }

  if (mode !== "sonar") {
    runUnitTests();
    await testFastDiagnostics(npmCli);
  }
  if (mode !== "fast") {
    await testSonarDiagnostics();
  }

  console.log(`[diagnostics-regression] ${mode} regression coverage passed.`);
}

function runUnitTests(): void {
  const result = run(process.execPath, [
    "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
    "--test",
    "scripts/sonar-api.test.ts",
  ]);
  assertSuccess(result, "SonarQube API unit tests");
  console.log("[diagnostics-regression] SonarQube API failure paths passed.");
}

async function testFastDiagnostics(npmCli: string): Promise<void> {
  const rootError = join(root, "scripts", "diagnostics-fixture-error.ts");
  const apiWarning = join(
    root,
    "api",
    "scripts",
    "diagnostics-fixture-warning.ts",
  );
  const typeError = join(root, "e2e", "diagnostics-fixture-type-error.ts");
  const testError = join(
    root,
    "web",
    "public",
    "src",
    "app",
    "diagnostics-fixture.spec.ts",
  );
  const fixtures = [rootError, apiWarning, typeError, testError];

  try {
    await writeFile(
      rootError,
      "const unusedRootFixture = 1;\nexport {};\n",
      "utf8",
    );
    assertUntracked(rootError);
    assertDiagnostic(runNpm(npmCli, "lint:root"), [
      "diagnostics-fixture-error.ts",
      "no-unused-vars",
    ]);
    await unlink(rootError);

    await writeFile(apiWarning, "Promise.resolve();\nexport {};\n", "utf8");
    assertDiagnostic(runNpm(npmCli, "lint:check", "api"), [
      "diagnostics-fixture-warning.ts",
      "@typescript-eslint/no-floating-promises",
      "warning",
    ]);
    await unlink(apiWarning);

    await writeFile(
      typeError,
      "export const diagnosticsFixture: string = 123;\n",
      "utf8",
    );
    assertDiagnostic(runNpm(npmCli, "typecheck:root"), [
      "diagnostics-fixture-type-error.ts",
      "TS2322",
    ]);
    await unlink(typeError);

    await writeFile(
      testError,
      "const unusedTestFixture = 1;\nexport {};\n",
      "utf8",
    );
    assertDiagnostic(runNpm(npmCli, "lint:check", "web/public"), [
      "diagnostics-fixture.spec.ts",
      "no-unused-vars",
    ]);
    await unlink(testError);
  } finally {
    await Promise.all(fixtures.map((fixture) => removeFile(fixture)));
  }

  assertSuccess(runNpm(npmCli, "diagnostics:fast"), "clean fast diagnostics");
  console.log(
    "[diagnostics-regression] ESLint warning/error, TypeScript, root, test, and uncommitted fixtures passed.",
  );
}

async function testSonarDiagnostics(): Promise<void> {
  const fixtureRoot = resolve(root, ".diagnostics-fixtures", "sonar");
  assertInsideRoot(fixtureRoot);
  await rm(fixtureRoot, { force: true, recursive: true });
  await mkdir(fixtureRoot, { recursive: true });

  try {
    assertDiagnostic(
      runSonar({
        SONAR_HOST_URL: "http://127.0.0.1:65534",
        SONAR_TOKEN: "unreachable-server-fixture",
      }),
      ["[sonar][infrastructure]", "127.0.0.1:65534"],
    );

    assertDiagnostic(runSonar({ SONAR_TOKEN: "invalid-token-fixture" }), [
      "[sonar][authentication]",
      "invalid",
    ]);

    await writeFile(
      join(fixtureRoot, "sonar-project.properties"),
      sonarProperties("missing-source"),
      "utf8",
    );
    assertDiagnostic(runSonarFixture(fixtureRoot), [
      "[sonar][scanner]",
      "execution failed",
    ]);

    await writeSonarViolationFixture(fixtureRoot);
    assertNotTracked(join(fixtureRoot, "fixture.ts"));
    const findings = runSonarFixture(fixtureRoot);
    assertDiagnostic(findings, [
      "Dockerfile",
      "docker:S6471",
      "fixture.ts",
      "typescript:S7059",
    ]);

    await writeSonarCleanFixture(fixtureRoot);
    const clean = runSonarFixture(fixtureRoot);
    assertSuccess(clean, "clean SonarQube fixture");
    assert.match(outputOf(clean), /No unresolved issues/u);
    console.log(
      "[diagnostics-regression] Docker, independent TypeScript, scanner, authentication, infrastructure, and clean SonarQube fixtures passed.",
    );
  } finally {
    await rm(fixtureRoot, { force: true, recursive: true });
  }
}

async function writeSonarViolationFixture(fixtureRoot: string): Promise<void> {
  await Promise.all([
    writeFile(
      join(fixtureRoot, "sonar-project.properties"),
      sonarProperties("."),
      "utf8",
    ),
    writeFile(
      join(fixtureRoot, "tsconfig.json"),
      `${JSON.stringify(
        {
          compilerOptions: {
            module: "NodeNext",
            moduleResolution: "NodeNext",
            strict: true,
            target: "ES2022",
          },
          include: ["fixture.ts"],
        },
        undefined,
        2,
      )}\n`,
      "utf8",
    ),
    writeFile(
      join(fixtureRoot, "fixture.ts"),
      [
        "export class DiagnosticsFixture {",
        "  constructor() {",
        "    void this.initialize();",
        "  }",
        "",
        "  async initialize(): Promise<void> {",
        "    await Promise.resolve();",
        "  }",
        "}",
        "",
      ].join("\n"),
      "utf8",
    ),
    writeFile(
      join(fixtureRoot, "Dockerfile"),
      'FROM alpine:3.20\nENTRYPOINT ["id"]\n',
      "utf8",
    ),
  ]);
}

async function writeSonarCleanFixture(fixtureRoot: string): Promise<void> {
  await Promise.all([
    writeFile(
      join(fixtureRoot, "fixture.ts"),
      [
        "export async function diagnosticsFixture(): Promise<void> {",
        "  await Promise.resolve();",
        "}",
        "",
      ].join("\n"),
      "utf8",
    ),
    writeFile(
      join(fixtureRoot, "Dockerfile"),
      [
        "FROM alpine:3.20",
        "RUN addgroup -S nonroot && adduser -S nonroot -G nonroot",
        "USER nonroot",
        'ENTRYPOINT ["id"]',
        "",
      ].join("\n"),
      "utf8",
    ),
  ]);
}

export function sonarProperties(sources: string): string {
  return [
    "sonar.projectKey=process-management-system-diagnostics-fixture",
    "sonar.projectName=Diagnostics Regression Fixture",
    "sonar.sourceEncoding=UTF-8",
    `sonar.sources=${sources}`,
    "sonar.scm.exclusions.disabled=true",
    "sonar.exclusions=.scannerwork/**",
    "sonar.coverage.exclusions=fixture.ts",
    "sonar.typescript.tsconfigPaths=tsconfig.json",
    "",
  ].join("\n");
}

function runSonarFixture(fixtureRoot: string): SpawnSyncReturns<string> {
  return runSonar({
    SONAR_PROJECT_BASE_DIR: fixtureRoot,
    SONAR_PROJECT_KEY: "process-management-system-diagnostics-fixture",
  });
}

function runSonar(environment: NodeJS.ProcessEnv): SpawnSyncReturns<string> {
  return run(
    process.execPath,
    [
      "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
      "scripts/sonar-check.ts",
    ],
    environment,
  );
}

function runNpm(
  npmCli: string,
  script: string,
  prefix?: string,
): SpawnSyncReturns<string> {
  const args = [npmCli, "run", script];
  if (prefix) {
    args.push("--prefix", prefix);
  }
  return run(process.execPath, args);
}

function run(
  command: string,
  args: readonly string[],
  environment: NodeJS.ProcessEnv = {},
): SpawnSyncReturns<string> {
  return spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, ...environment },
    timeout: 300_000,
  });
}

function assertDiagnostic(
  result: SpawnSyncReturns<string>,
  fragments: readonly string[],
): void {
  const output = outputOf(result);
  assert.notEqual(
    result.status,
    0,
    `Expected diagnostic failure, received success:\n${output}`,
  );
  for (const fragment of fragments) {
    assert.ok(
      output.toLowerCase().includes(fragment.toLowerCase()),
      `Expected diagnostic output to include ${fragment}:\n${output}`,
    );
  }
  const evidence = output
    .split(/\r?\n/u)
    .filter((line) => fragments.some((fragment) => line.includes(fragment)))
    .slice(-3)
    .map((line) => line.trim())
    .join(" | ");
  console.log(`[diagnostics-regression] detected ${evidence}`);
}

function assertSuccess(result: SpawnSyncReturns<string>, name: string): void {
  assert.equal(
    result.status,
    0,
    `${name} failed with status ${result.status}:\n${outputOf(result)}`,
  );
}

function outputOf(result: SpawnSyncReturns<string>): string {
  if (result.error) {
    return `${result.stdout ?? ""}\n${result.stderr ?? ""}\n${result.error.message}`;
  }
  return `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
}

function assertUntracked(path: string): void {
  const result = run("git", ["status", "--short", "--", relative(root, path)]);
  assertSuccess(result, "git status for uncommitted fixture");
  assert.match(result.stdout, /^\?\?/u);
}

function assertNotTracked(path: string): void {
  const result = run("git", [
    "ls-files",
    "--error-unmatch",
    relative(root, path),
  ]);
  assert.notEqual(result.status, 0, "SonarQube fixture must remain uncommitted");
}

export function assertInsideRoot(path: string): void {
  const fixturesRoot = resolve(root, ".diagnostics-fixtures");
  const childPath = relative(fixturesRoot, path);
  assert.ok(
    childPath && !childPath.startsWith("..") && !isAbsolute(childPath),
    `Unsafe fixture path: ${path}`,
  );
}

async function removeFile(path: string): Promise<void> {
  try {
    await unlink(path);
  } catch (error) {
    if (
      !error ||
      typeof error !== "object" ||
      !("code" in error) ||
      (error as { code?: unknown }).code !== "ENOENT"
    ) {
      throw error;
    }
  }
}

if (basename(process.argv[1] ?? "") === "diagnostics-regression.ts") {
  void runDiagnosticsRegression();
}

