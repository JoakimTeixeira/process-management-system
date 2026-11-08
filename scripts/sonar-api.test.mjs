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
} from "./sonar-api.mjs";
import { runSonarCheck } from "./sonar-check.mjs";

const serverUrl = "http://localhost:9000";
const token = "fixture-token";

await test("classifies an unavailable server as infrastructure failure", async () => {
  await assert.rejects(
    assertServerReady(serverUrl, token, async () => {
      throw new Error("connection refused");
    }),
    hasCategory("infrastructure"),
  );
});

await test("classifies invalid authentication", async () => {
  await assert.rejects(
    assertServerReady(
      serverUrl,
      token,
      routeFetch({ authenticationValid: false }),
    ),
    hasCategory("authentication"),
  );
});

await test("times out when compute processing never completes", async () => {
  let calls = 0;
  await assert.rejects(
    waitForComputeTask(
      `${serverUrl}/api/ce/task?id=pending`,
      serverUrl,
      token,
      {
        fetchImpl: async () => {
          calls += 1;
          return jsonResponse({ task: { status: "PENDING" } });
        },
        maxAttempts: 2,
        sleep: async () => {},
      },
    ),
    hasCategory("timeout"),
  );
  assert.equal(calls, 2);
});

await test("collects every API page", async () => {
  const requestedPages = [];
  const issues = await fetchPages(
    serverUrl,
    token,
    "api/issues/search",
    "issues",
    { componentKeys: "fixture", resolved: "false" },
    async (url) => {
      const page = Number(new URL(url).searchParams.get("p"));
      requestedPages.push(page);
      return jsonResponse({
        issues:
          page === 1
            ? [{ key: "one" }, { key: "two" }]
            : [{ key: "three" }],
        paging: { total: 3 },
      });
    },
  );

  assert.deepEqual(
    issues.map(({ key }) => key),
    ["one", "two", "three"],
  );
  assert.deepEqual(requestedPages, [1, 2]);
});

await test("rejects missing authentication configuration", async () => {
  const missingFile = Object.assign(new Error("missing"), { code: "ENOENT" });
  await assert.rejects(
    runSonarCheck({
      environment: {},
      readFileImpl: async () => {
        throw missingFile;
      },
    }),
    hasCategory("authentication"),
  );
});

await test("classifies scanner execution failures", async () => {
  await assert.rejects(
    runSonarCheck({
      environment: configuredEnvironment(),
      fetchImpl: routeFetch(),
      scanImpl: async () => {
        throw new Error("scanner crashed");
      },
    }),
    hasCategory("scanner"),
  );
});

await test("rejects a scan without its report configuration", async () => {
  const missingFile = Object.assign(new Error("missing"), { code: "ENOENT" });
  await assert.rejects(
    runSonarCheck({
      environment: configuredEnvironment(),
      fetchImpl: routeFetch(),
      readFileImpl: async () => {
        throw missingFile;
      },
      scanImpl: async () => {},
    }),
    hasCategory("scanner"),
  );
});

await test("returns a genuine clean analysis result", async () => {
  const logged = [];
  const result = await runSonarCheck({
    environment: configuredEnvironment(),
    fetchImpl: routeFetch(),
    logger: {
      error: (message) => logged.push(message),
      log: (message) => logged.push(message),
    },
    readFileImpl: async () =>
      [
        `serverUrl=${serverUrl}`,
        `ceTaskUrl=${serverUrl}/api/ce/task?id=clean`,
        `${serverUrl}/dashboard?id=fixture`,
      ].join("\n"),
    scanImpl: async () => {},
  });

  assert.equal(result.clean, true);
  assert.equal(result.gateStatus, "OK");
  assert.deepEqual(result.issues, []);
  assert.deepEqual(result.hotspots, []);
  assert.ok(
    logged.some((message) => message.includes("No unresolved issues")),
  );
});

await test("reports the metric details for a failed quality gate", async () => {
  const logged = [];
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
    readFileImpl: async () =>
      [
        `serverUrl=${serverUrl}`,
        `ceTaskUrl=${serverUrl}/api/ce/task?id=failed-gate`,
        `${serverUrl}/dashboard?id=fixture`,
      ].join("\n"),
    scanImpl: async () => {},
  });

  assert.equal(result.clean, false);
  assert.equal(result.gateStatus, "ERROR");
  assert.ok(
    logged.some((message) =>
      message.includes("new_coverage LT 80 (actual 0.0)"),
    ),
  );
});

await test("fails when overall coverage is below 80 percent or duplication is above 0", async () => {
  const logged = [];
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
    readFileImpl: async () =>
      [
        `serverUrl=${serverUrl}`,
        `ceTaskUrl=${serverUrl}/api/ce/task?id=overall-measures`,
        `${serverUrl}/dashboard?id=fixture`,
      ].join("\n"),
    scanImpl: async () => {},
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

await test("covers sonar-api error branches and formatting helpers", async () => {
  await assert.rejects(
    assertServerReady(serverUrl, token, async () =>
      jsonResponse({ status: "STARTING" }),
    ),
    hasCategory("infrastructure"),
  );

  await assert.rejects(
    assertServerReady(serverUrl, token, async (url) => {
      if (new URL(url).pathname === "/api/system/status") {
        return jsonResponse({ status: "UP" });
      }
      return jsonResponse({}, 401);
    }),
    hasCategory("authentication"),
  );

  await assert.rejects(
    waitForComputeTask("http://other:9000/api/ce/task", serverUrl, token),
    hasCategory("api"),
  );

  await assert.rejects(
    waitForComputeTask(`${serverUrl}/api/ce/task`, serverUrl, token, {
      fetchImpl: async () => jsonResponse({ task: { status: "SUCCESS" } }),
    }),
    hasCategory("api"),
  );

  await assert.rejects(
    waitForComputeTask(`${serverUrl}/api/ce/task`, serverUrl, token, {
      fetchImpl: async () =>
        jsonResponse({
          task: { status: "FAILED", errorMessage: "out of memory" },
        }),
    }),
    hasCategory("analysis"),
  );

  await assert.rejects(
    sonarRequest(serverUrl, token, "http://evil.example.com/steal"),
    hasCategory("api"),
  );

  await assert.rejects(
    sonarRequest(serverUrl, token, "api/system/status", async () =>
      jsonResponse({}, 500),
    ),
    hasCategory("api"),
  );

  assert.deepEqual(
    await sonarRequest(serverUrl, token, "api/system/status", async () => ({
      ok: true,
      status: 204,
      statusText: "No Content",
    })),
    {},
  );

  await assert.rejects(
    sonarRequest(serverUrl, token, "api/system/status", async () => ({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => {
        throw new SyntaxError("bad json");
      },
    })),
    hasCategory("api"),
  );

  assert.throws(
    () => assertSameServer(serverUrl, "http://other:9000"),
    hasCategory("scanner"),
  );

  assert.equal(formatLocation("fixture:src/a.ts", 12, "fixture"), "src/a.ts:12");
  assert.equal(formatLocation("other/b.ts", undefined, "fixture"), "other/b.ts");
});

await test("loads token from file and formats unresolved issues and hotspots", async () => {
  const logged = [];
  const result = await runSonarCheck({
    environment: {
      SONAR_HOST_URL: `${serverUrl}///`,
      SONAR_ORGANIZATION: "org-1",
      SONAR_PROJECT_KEY: "fixture",
    },
    fetchImpl: async (input) => {
      const url = new URL(input);
      if (url.pathname === "/api/issues/search") {
        return jsonResponse({
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
        });
      }
      if (url.pathname === "/api/hotspots/search") {
        return jsonResponse({
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
        });
      }
      return routeFetch()(input);
    },
    logger: {
      error: (message) => logged.push(message),
      log: (message) => logged.push(message),
    },
    readFileImpl: async (filePath) => {
      if (String(filePath).endsWith("token")) {
        return `${token}\n`;
      }
      return [
        `serverUrl=${serverUrl}`,
        `ceTaskUrl=${serverUrl}/api/ce/task?id=issues`,
      ].join("\n");
    },
    scanImpl: async () => {},
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
      readFileImpl: async () =>
        `serverUrl=${serverUrl}\nceTaskUrl=${serverUrl}/api/ce/task?id=bad`,
      scanImpl: async () => {},
    }),
    hasCategory("configuration"),
  );
});

function configuredEnvironment() {
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
} = {}) {
  return async (input) => {
    const url = new URL(input);
    if (url.pathname === "/api/system/status") {
      return jsonResponse({ status: "UP" });
    }
    if (url.pathname === "/api/authentication/validate") {
      return jsonResponse({ valid: authenticationValid });
    }
    if (url.pathname === "/api/ce/task") {
      return jsonResponse({
        task: { analysisId: "analysis", status: "SUCCESS" },
      });
    }
    if (url.pathname === "/api/issues/search") {
      return jsonResponse({ issues: [], paging: { total: 0 } });
    }
    if (url.pathname === "/api/hotspots/search") {
      return jsonResponse({ hotspots: [], paging: { total: 0 } });
    }
    if (url.pathname === "/api/qualitygates/project_status") {
      return jsonResponse({ projectStatus: qualityGate });
    }
    if (url.pathname === "/api/measures/component") {
      return jsonResponse({ component: { measures } });
    }
    throw new Error(`Unexpected SonarQube route: ${url}`);
  };
}

function jsonResponse(body, status = 200) {
  return {
    json: async () => body,
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "ERROR",
  };
}

function hasCategory(category) {
  return (error) => {
    assert.ok(error instanceof SonarDiagnosticError);
    assert.equal(error.category, category);
    return true;
  };
}
