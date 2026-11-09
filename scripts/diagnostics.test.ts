import assert from "node:assert/strict";
import { resolve } from "node:path";
import { test } from "node:test";
import {
  fastDiagnosticsChecks,
  resolveDiagnosticsChecks,
  runDiagnostics,
  sonarDiagnosticsChecks,
} from "./diagnostics.ts";
import {
  assertInsideRoot,
  sonarProperties,
} from "./diagnostics-regression.ts";

void test("should select fast, sonar, and all diagnostic check lists", () => {
  assert.deepEqual(resolveDiagnosticsChecks("fast"), fastDiagnosticsChecks);
  assert.deepEqual(resolveDiagnosticsChecks("sonar"), sonarDiagnosticsChecks);
  assert.deepEqual(resolveDiagnosticsChecks("all"), [
    ...fastDiagnosticsChecks,
    ...sonarDiagnosticsChecks,
  ]);
  assert.throws(
    () => resolveDiagnosticsChecks("invalid"),
    /Unknown diagnostics mode: invalid/u,
  );
});

void test("should execute diagnostic checks and report clean status when all succeed", async () => {
  const logged: string[] = [];
  const invokedChecks: string[] = [];

  const result = await runDiagnostics({
    mode: "sonar",
    npmCli: "/usr/local/lib/npm-cli.js",
    logger: {
      log: (msg) => logged.push(msg),
      error: (msg) => logged.push(msg),
    },
    runCheckImpl: (check) => {
      invokedChecks.push(check.name);
      return Promise.resolve({ status: 0 });
    },
  });

  assert.equal(result.clean, true);
  assert.deepEqual(result.failures, []);
  assert.deepEqual(invokedChecks, sonarDiagnosticsChecks.map(({ name }) => name));
  assert.ok(logged.some((msg) => msg.includes("All sonar diagnostics passed.")));
});

void test("should record diagnostic spawn errors and non-zero exit statuses", async () => {
  const errors: string[] = [];
  let callIndex = 0;

  const result = await runDiagnostics({
    mode: "fast",
    npmCli: "/usr/local/lib/npm-cli.js",
    logger: {
      log: () => {},
      error: (msg) => errors.push(msg),
    },
    runCheckImpl: () => {
      callIndex += 1;
      if (callIndex === 1) {
        return Promise.resolve({ status: null, error: new Error("spawn EACCES") });
      }
      if (callIndex === 2) {
        return Promise.resolve({ status: 1, error: undefined });
      }
      return Promise.resolve({ status: 0, error: undefined });
    },
  });
  process.exitCode = 0;

  assert.equal(result.clean, false);
  assert.deepEqual(result.failures, [
    "Repository ESLint and SonarJS",
    "API ESLint and SonarJS",
  ]);
  assert.ok(errors.some((msg) => msg.includes("could not start: spawn EACCES")));
  assert.ok(errors.some((msg) => msg.includes("Failed checks:")));
});

void test("should reject a missing npm_execpath", async () => {
  await assert.rejects(
    runDiagnostics({ mode: "fast", npmCli: "" }),
    /Run diagnostics through npm/u,
  );
});

void test("should bound fast checks and keep SonarQube phases serial", async () => {
  let active = 0;
  let maximumActive = 0;
  const completed: string[] = [];

  const result = await runDiagnostics({
    mode: "all",
    npmCli: "/usr/local/lib/npm-cli.js",
    logger: { log: () => {}, error: () => {} },
    runCheckImpl: async (check) => {
      active += 1;
      maximumActive = Math.max(maximumActive, active);
      await new Promise((resolvePromise) => setTimeout(resolvePromise, 1));
      active -= 1;
      completed.push(check.name);
      return { status: 0 };
    },
  });

  assert.equal(result.clean, true);
  assert.equal(maximumActive, 4);
  assert.deepEqual(completed.slice(-2), sonarDiagnosticsChecks.map(({ name }) => name));
});

void test("should build diagnostic properties and guard regression fixture paths", () => {
  const props = sonarProperties("src");
  assert.match(props, /sonar\.sources=src/u);
  assert.match(props, /sonar\.scm\.exclusions\.disabled=true/u);

  assertInsideRoot(resolve(process.cwd(), ".diagnostics-fixtures", "sonar"));
  assert.throws(
    () => assertInsideRoot(resolve(process.cwd(), "outside")),
    /Unsafe fixture path/u,
  );
});

