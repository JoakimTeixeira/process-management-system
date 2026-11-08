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

void test("resolveDiagnosticsChecks selects fast, sonar, and all check lists", () => {
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

void test("runDiagnostics executes checks and reports clean status when all succeed", () => {
  const logged: string[] = [];
  const invokedArgs: (readonly string[])[] = [];

  const result = runDiagnostics({
    mode: "sonar",
    npmCli: "/usr/local/lib/npm-cli.js",
    logger: {
      log: (msg) => logged.push(msg),
      error: (msg) => logged.push(msg),
    },
    spawnSyncImpl: (_cmd, args) => {
      invokedArgs.push(args);
      return { status: 0, error: undefined };
    },
  });

  assert.equal(result.clean, true);
  assert.deepEqual(result.failures, []);
  assert.equal(invokedArgs.length, 2);
  assert.ok(logged.some((msg) => msg.includes("All sonar diagnostics passed.")));
});

void test("runDiagnostics records spawn errors and non-zero exit statuses", () => {
  const errors: string[] = [];
  let callIndex = 0;

  const result = runDiagnostics({
    mode: "fast",
    npmCli: "/usr/local/lib/npm-cli.js",
    logger: {
      log: () => {},
      error: (msg) => errors.push(msg),
    },
    spawnSyncImpl: () => {
      callIndex += 1;
      if (callIndex === 1) {
        return { status: null, error: new Error("spawn EACCES") };
      }
      if (callIndex === 2) {
        return { status: 1, error: undefined };
      }
      return { status: 0, error: undefined };
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

void test("runDiagnostics rejects missing npm_execpath", () => {
  assert.throws(
    () => runDiagnostics({ mode: "fast", npmCli: "" }),
    /Run diagnostics through npm/u,
  );
});

void test("diagnostics-regression helpers build properties and guard fixture paths", () => {
  const props = sonarProperties("src");
  assert.match(props, /sonar\.sources=src/u);
  assert.match(props, /sonar\.scm\.exclusions\.disabled=true/u);

  assertInsideRoot(resolve(process.cwd(), ".diagnostics-fixtures", "sonar"));
  assert.throws(
    () => assertInsideRoot(resolve(process.cwd(), "outside")),
    /Unsafe fixture path/u,
  );
});

