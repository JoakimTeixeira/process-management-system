import assert from "node:assert/strict";
import { test } from "node:test";
import {
  SonarDiagnosticError,
  assertServerReady,
  fetchPages,
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

function configuredEnvironment() {
  return {
    SONAR_HOST_URL: serverUrl,
    SONAR_PROJECT_KEY: "fixture",
    SONAR_TOKEN: token,
  };
}

function routeFetch({ authenticationValid = true } = {}) {
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
      return jsonResponse({ projectStatus: { status: "OK" } });
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
