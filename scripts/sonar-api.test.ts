import assert from "node:assert/strict";
import { test } from "node:test";
import {
  SonarDiagnosticError,
  assertSameServer,
  assertServerReady,
  fetchPages,
  formatLocation,
  sonarRequest,
  waitForComputeTask,
  type SonarDiagnosticCategory,
  type SonarFetch,
  type SonarResponse,
} from "./sonar-api.ts";
import {
  runSonarCheck,
  type SonarMeasure,
  type SonarQualityGateCondition,
} from "./sonar-check.ts";

const serverUrl = "http://localhost:9000";
const token = "fixture-token";

void test("classifies an unavailable server as infrastructure failure", async () => {
  await assert.rejects(
    assertServerReady(serverUrl, token, () => {
      return Promise.reject(new Error("connection refused"));
    }),
    hasCategory("infrastructure"),
  );
});

void test("classifies invalid authentication", async () => {
  await assert.rejects(
    assertServerReady(
      serverUrl,
      token,
      routeFetch({ authenticationValid: false }),
    ),
    hasCategory("authentication"),
  );
});

void test("times out when compute processing never completes", async () => {
  let calls = 0;
  await assert.rejects(
    waitForComputeTask(
      `${serverUrl}/api/ce/task?id=pending`,
      serverUrl,
      token,
      {
        fetchImpl: () => {
          calls += 1;
          return Promise.resolve(jsonResponse({ task: { status: "PENDING" } }));
        },
        maxAttempts: 2,
        sleep: () => Promise.resolve(),
      },
    ),
    hasCategory("timeout"),
  );
  assert.equal(calls, 2);
});

void test("collects every API page", async () => {
  const requestedPages: number[] = [];
  const issues = await fetchPages<{ key: string }>(
    serverUrl,
    token,
    "api/issues/search",
    "issues",
    { componentKeys: "fixture", resolved: "false" },
    (url) => {
      const page = Number(new URL(String(url)).searchParams.get("p"));
      requestedPages.push(page);
      return Promise.resolve(
        jsonResponse({
          issues:
            page === 1
              ? [{ key: "one" }, { key: "two" }]
              : [{ key: "three" }],
          paging: { total: 3 },
        }),
      );
    },
  );

  assert.deepEqual(
    issues.map(({ key }) => key),
    ["one", "two", "three"],
  );
  assert.deepEqual(requestedPages, [1, 2]);
});

void test("rejects missing authentication configuration", async () => {
  const missingFile = Object.assign(new Error("missing"), { code: "ENOENT" });
  await assert.rejects(
    runSonarCheck({
      environment: {},
      readFileImpl: () => Promise.reject(missingFile),
    }),
    hasCategory("authentication"),
  );
});

void test("classifies scanner execution failures", async () => {
  await assert.rejects(
    runSonarCheck({
      environment: configuredEnvironment(),
      fetchImpl: routeFetch(),
      scanImpl: () => Promise.reject(new Error("scanner crashed")),
    }),
    hasCategory("scanner"),
  );
});

void test("rejects a scan without its report configuration", async () => {
  const missingFile = Object.assign(new Error("missing"), { code: "ENOENT" });
  await assert.rejects(
    runSonarCheck({
      environment: configuredEnvironment(),
      fetchImpl: routeFetch(),
      readFileImpl: () => Promise.reject(missingFile),
      scanImpl: () => Promise.resolve(),
    }),
    hasCategory("scanner"),
  );
});

void test("returns a genuine clean analysis result", async () => {
  const logged: string[] = [];
  const result = await runSonarCheck({
    environment: configuredEnvironment(),
    fetchImpl: routeFetch(),
    logger: {
      error: (message) => logged.push(message),
      log: (message) => logged.push(message),
    },
    readFileImpl: () =>
      Promise.resolve(
        [
          `serverUrl=${serverUrl}`,
          `ceTaskUrl=${serverUrl}/api/ce/task?id=clean`,
          `${serverUrl}/dashboard?id=fixture`,
        ].join("\n"),
      ),
    scanImpl: () => Promise.resolve(),
  });

  assert.equal(result.clean, true);
  assert.equal(result.gateStatus, "OK");
  assert.deepEqual(result.issues, []);
  assert.deepEqual(result.hotspots, []);
  assert.ok(
    logged.some((message) => message.includes("No unresolved issues")),
  );
});

void test("reports the metric details for a failed quality gate", async () => {
  const logged: string[] = [];
  const result = await runSonarCheck({
    environment: configuredEnvironment(),
    fetchImpl: routeFetch({
      qualityGate: {
        conditions: [
          {
            actualValue: "0.0",
            comparator: "LT",
            errorThreshold: "80",
            metricKey: "new_coverage",
            status: "ERROR",
          },
        ],
        status: "ERROR",
      },
    }),
    logger: {
      error: (message) => logged.push(message),
      log: (message) => logged.push(message),
    },
    readFileImpl: () =>
      Promise.resolve(
        [
          `serverUrl=${serverUrl}`,
          `ceTaskUrl=${serverUrl}/api/ce/task?id=failed-gate`,
          `${serverUrl}/dashboard?id=fixture`,
        ].join("\n"),
      ),
    scanImpl: () => Promise.resolve(),
  });

  assert.equal(result.clean, false);
  assert.equal(result.gateStatus, "ERROR");
  assert.ok(
    logged.some((message) =>
      message.includes("new_coverage LT 80 (actual 0.0)"),
    ),
  );
});

void test("fails when overall coverage is below 80 percent or duplication is above 0", async () => {
  const logged: string[] = [];
  const result = await runSonarCheck({
    environment: configuredEnvironment(),
    fetchImpl: routeFetch({
      measures: [
        { metric: "coverage", value: "63.8" },
        { metric: "lines_to_cover", value: "9974" },
        { metric: "duplicated_lines", value: "11242" },
        { metric: "duplicated_lines_density", value: "23.1" },
      ],
    }),
    logger: {
      error: (message) => logged.push(message),
      log: (message) => logged.push(message),
    },
    readFileImpl: () =>
      Promise.resolve(
        [
          `serverUrl=${serverUrl}`,
          `ceTaskUrl=${serverUrl}/api/ce/task?id=overall-measures`,
          `${serverUrl}/dashboard?id=fixture`,
        ].join("\n"),
      ),
    scanImpl: () => Promise.resolve(),
  });

  assert.equal(result.clean, false);
  assert.equal(result.gateStatus, "ERROR");
  assert.ok(
    logged.some((message) => message.includes("coverage LT 80 (actual 63.8)")),
  );
  assert.ok(
    logged.some((message) =>
      message.includes("duplicated_lines_density GT 0 (actual 23.1)"),
    ),
  );
});

void test("covers sonar-api error branches and formatting helpers", async () => {
  await assert.rejects(
    assertServerReady(serverUrl, token, () =>
      Promise.resolve(jsonResponse({ status: "STARTING" })),
    ),
    hasCategory("infrastructure"),
  );

  await assert.rejects(
    assertServerReady(serverUrl, token, (url) => {
      if (new URL(String(url)).pathname === "/api/system/status") {
        return Promise.resolve(jsonResponse({ status: "UP" }));
      }
      return Promise.resolve(jsonResponse({}, 401));
    }),
    hasCategory("authentication"),
  );

  await assert.rejects(
    waitForComputeTask("http://other:9000/api/ce/task", serverUrl, token),
    hasCategory("api"),
  );

  await assert.rejects(
    waitForComputeTask(`${serverUrl}/api/ce/task`, serverUrl, token, {
      fetchImpl: () =>
        Promise.resolve(jsonResponse({ task: { status: "SUCCESS" } })),
    }),
    hasCategory("api"),
  );

  await assert.rejects(
    waitForComputeTask(`${serverUrl}/api/ce/task`, serverUrl, token, {
      fetchImpl: () =>
        Promise.resolve(
          jsonResponse({
            task: { status: "FAILED", errorMessage: "out of memory" },
          }),
        ),
    }),
    hasCategory("analysis"),
  );

  await assert.rejects(
    sonarRequest(serverUrl, token, "http://evil.example.com/steal"),
    hasCategory("api"),
  );

  await assert.rejects(
    sonarRequest(serverUrl, token, "api/system/status", () =>
      Promise.resolve(jsonResponse({}, 500)),
    ),
    hasCategory("api"),
  );

  assert.deepEqual(
    await sonarRequest(serverUrl, token, "api/system/status", () =>
      Promise.resolve({
        ok: true,
        status: 204,
        statusText: "No Content",
      }),
    ),
    {},
  );

  await assert.rejects(
    sonarRequest(serverUrl, token, "api/system/status", () =>
      Promise.resolve({
        ok: true,
        status: 200,
        statusText: "OK",
        json: () => Promise.reject(new SyntaxError("bad json")),
      }),
    ),
    hasCategory("api"),
  );

  assert.throws(
    () => assertSameServer(serverUrl, "http://other:9000"),
    hasCategory("scanner"),
  );

  assert.equal(formatLocation("fixture:src/a.ts", 12, "fixture"), "src/a.ts:12");
  assert.equal(formatLocation("other/b.ts", undefined, "fixture"), "other/b.ts");
});

void test("loads token from file and formats unresolved issues and hotspots", async () => {
  const logged: string[] = [];
  const defaultRouteFetch = routeFetch();
  const result = await runSonarCheck({
    environment: {
      SONAR_HOST_URL: `${serverUrl}///`,
      SONAR_ORGANIZATION: "org-1",
      SONAR_PROJECT_KEY: "fixture",
    },
    fetchImpl: (input) => {
      const url = new URL(String(input));
      if (url.pathname === "/api/issues/search") {
        return Promise.resolve(
          jsonResponse({
            issues: [
              {
                key: "i1",
                component: "fixture:src/index.ts",
                line: 5,
                severity: "MAJOR",
                rule: "typescript:S1",
                message: "Fix this",
              },
            ],
            paging: { total: 1 },
          }),
        );
      }
      if (url.pathname === "/api/hotspots/search") {
        return Promise.resolve(
          jsonResponse({
            hotspots: [
              {
                key: "h1",
                component: "fixture:Dockerfile",
                line: 2,
                ruleKey: "docker:S1",
                message: "Review this",
              },
            ],
            paging: { total: 1 },
          }),
        );
      }
      return defaultRouteFetch(input);
    },
    logger: {
      error: (message) => logged.push(message),
      log: (message) => logged.push(message),
    },
    readFileImpl: (filePath) => {
      if (String(filePath).endsWith("token")) {
        return Promise.resolve(`${token}\n`);
      }
      return Promise.resolve(
        [
          `serverUrl=${serverUrl}`,
          `ceTaskUrl=${serverUrl}/api/ce/task?id=issues`,
        ].join("\n"),
      );
    },
    scanImpl: () => Promise.resolve(),
  });

  assert.equal(result.clean, false);
  assert.equal(result.issues.length, 1);
  assert.equal(result.hotspots.length, 1);
  assert.ok(logged.some((line) => line.includes("src/index.ts:5")));
  assert.ok(logged.some((line) => line.includes("Dockerfile:2")));

  await assert.rejects(
    runSonarCheck({
      environment: {
        ...configuredEnvironment(),
        SONAR_ANALYSIS_TIMEOUT_MS: "-5",
      },
      fetchImpl: routeFetch(),
      readFileImpl: () =>
        Promise.resolve(
          `serverUrl=${serverUrl}\nceTaskUrl=${serverUrl}/api/ce/task?id=bad`,
        ),
      scanImpl: () => Promise.resolve(),
    }),
    hasCategory("configuration"),
  );
});

function configuredEnvironment(): NodeJS.ProcessEnv {
  return {
    SONAR_HOST_URL: serverUrl,
    SONAR_PROJECT_KEY: "fixture",
    SONAR_TOKEN: token,
  };
}

function routeFetch({
  authenticationValid = true,
  measures = [
    { metric: "coverage", value: "100.0" },
    { metric: "lines_to_cover", value: "10" },
    { metric: "duplicated_lines", value: "0" },
    { metric: "duplicated_lines_density", value: "0.0" },
  ],
  qualityGate = { status: "OK" },
}: {
  authenticationValid?: boolean;
  measures?: SonarMeasure[];
  qualityGate?: {
    status?: string;
    conditions?: SonarQualityGateCondition[];
  };
} = {}): SonarFetch {
  return (input) => {
    const url = new URL(String(input));
    if (url.pathname === "/api/system/status") {
      return Promise.resolve(jsonResponse({ status: "UP" }));
    }
    if (url.pathname === "/api/authentication/validate") {
      return Promise.resolve(jsonResponse({ valid: authenticationValid }));
    }
    if (url.pathname === "/api/ce/task") {
      return Promise.resolve(
        jsonResponse({
          task: { analysisId: "analysis", status: "SUCCESS" },
        }),
      );
    }
    if (url.pathname === "/api/issues/search") {
      return Promise.resolve(
        jsonResponse({ issues: [], paging: { total: 0 } }),
      );
    }
    if (url.pathname === "/api/hotspots/search") {
      return Promise.resolve(
        jsonResponse({ hotspots: [], paging: { total: 0 } }),
      );
    }
    if (url.pathname === "/api/qualitygates/project_status") {
      return Promise.resolve(jsonResponse({ projectStatus: qualityGate }));
    }
    if (url.pathname === "/api/measures/component") {
      return Promise.resolve(jsonResponse({ component: { measures } }));
    }
    return Promise.reject(new Error(`Unexpected SonarQube route: ${url.toString()}`));
  };
}

function jsonResponse(body: unknown, status = 200): SonarResponse {
  return {
    json: () => Promise.resolve(body),
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "ERROR",
  };
}

function hasCategory(
  category: SonarDiagnosticCategory,
): (error: unknown) => boolean {
  return (error: unknown) => {
    assert.ok(error instanceof SonarDiagnosticError);
    assert.equal(error.category, category);
    return true;
  };
}

