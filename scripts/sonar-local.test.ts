import assert from "node:assert/strict";
import type { SpawnSyncReturns } from "node:child_process";
import { test } from "node:test";
import {
  basicAuth,
  compose,
  ensureStrictQualityGate,
  findCompose,
  loadLocalToken,
  printServerStatus,
  readOptionalSecret,
  removeTrailingSlashes,
  runSonarLocal,
  waitUntilReady,
  writeSecret,
  type SonarLocalFs,
} from "./sonar-local.ts";

const serverUrl = "http://localhost:9000";

function mockResponse(body: unknown, status = 200): Response {
  return {
    json: () => Promise.resolve(body),
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "ERROR",
  } as unknown as Response;
}

function resolveRequestUrl(input: RequestInfo | URL): URL {
  if (typeof input === "string") {
    return new URL(input);
  }
  if (input instanceof URL) {
    return input;
  }
  return new URL(input.url);
}

function createMemoryFs(
  initialFiles: Record<string, string> = {},
): SonarLocalFs & { files: Map<string, string>; chmodCalls: string[] } {
  const files = new Map<string, string>(Object.entries(initialFiles));
  const chmodCalls: string[] = [];
  return {
    chmodCalls,
    files,
    chmod: (path) => {
      chmodCalls.push(path);
      return Promise.resolve();
    },
    mkdir: () => Promise.resolve(undefined),
    readFile: (path) => {
      const key = path.replaceAll("\\", "/");
      for (const [storedKey, value] of files.entries()) {
        if (key.endsWith(storedKey)) {
          return Promise.resolve(value);
        }
      }
      return Promise.reject(
        Object.assign(new Error("ENOENT"), { code: "ENOENT" }),
      );
    },
    writeFile: (path, data) => {
      files.set(path.replaceAll("\\", "/"), data);
      return Promise.resolve();
    },
  };
}

function createComposeSpawner(status = 0, failDockerComposePlugin = false) {
  const calls: { command: string; args: readonly string[] }[] = [];
  const spawner = ((command: string, args: readonly string[] = []) => {
    calls.push({ command, args });
    if (
      failDockerComposePlugin &&
      command === "docker" &&
      args[0] === "compose"
    ) {
      return { status: 1 } as SpawnSyncReturns<string>;
    }
    return { status } as SpawnSyncReturns<string>;
  }) as unknown as typeof import("node:child_process").spawnSync;
  return { calls, spawner };
}

void test("should findCompose and compose select working docker compose binary and handle failures", () => {
  const plugin = createComposeSpawner(0, false);
  assert.deepEqual(findCompose(plugin.spawner), {
    command: "docker",
    prefix: ["compose"],
  });

  const standalone = createComposeSpawner(0, true);
  assert.deepEqual(findCompose(standalone.spawner), {
    command: "docker-compose",
    prefix: [],
  });

  const unavailable = createComposeSpawner(1, false);
  assert.throws(
    () => findCompose(unavailable.spawner),
    /Docker Compose is unavailable/u,
  );

  compose(["ps", "sonarqube"], { spawnSyncImpl: plugin.spawner });
  assert.ok(plugin.calls.some((call) => call.args.includes("ps")));
});

void test("should waitUntilReady and printServerStatus handle readiness and HTTP failures", async () => {
  let attempts = 0;
  await waitUntilReady(serverUrl, {
    fetchImpl: () => {
      attempts += 1;
      return Promise.resolve(
        mockResponse({ status: attempts < 2 ? "STARTING" : "UP" }),
      );
    },
    maxAttempts: 3,
    sleep: () => Promise.resolve(),
  });
  assert.equal(attempts, 2);

  await assert.rejects(
    waitUntilReady(serverUrl, {
      fetchImpl: () => Promise.resolve(mockResponse({ status: "STARTING" })),
      maxAttempts: 1,
      sleep: () => Promise.resolve(),
    }),
    /Timed out after four minutes/u,
  );

  const logs: string[] = [];
  await printServerStatus(
    serverUrl,
    () => Promise.resolve(mockResponse({ status: "UP", version: "26.11" })),
    { log: (msg: string) => logs.push(msg) },
  );
  assert.ok(logs.some((msg) => msg.includes("UP (26.11)")));

  await assert.rejects(
    printServerStatus(serverUrl, () => Promise.resolve(mockResponse({}, 503))),
    /Server is unavailable/u,
  );
});

void test("should create the strict gate, update its conditions, and set it as default", async () => {
  const requests: string[] = [];
  await ensureStrictQualityGate(serverUrl, "tok", (input) => {
    const url = resolveRequestUrl(input);
    requests.push(url.pathname);
    if (url.pathname === "/api/qualitygates/list") {
      return Promise.resolve(mockResponse({ qualitygates: [] }));
    }
    if (url.pathname === "/api/qualitygates/show") {
      return Promise.resolve(
        mockResponse({
          isDefault: false,
          conditions: [{ id: 1, metric: "coverage", op: "LT", error: "50" }],
        }),
      );
    }
    return Promise.resolve(mockResponse({}));
  });

  assert.ok(requests.includes("/api/qualitygates/create"));
  assert.ok(requests.includes("/api/qualitygates/update_condition"));
  assert.ok(requests.includes("/api/qualitygates/create_condition"));
  assert.ok(requests.includes("/api/qualitygates/set_as_default"));
});

void test("should handle stop, status, token, and start credential bootstrap", async () => {
  const fs = createMemoryFs({ ".sonarqube/token": "stale-token" });
  const { spawner } = createComposeSpawner(0);
  const logs: string[] = [];
  const logger = {
    log: (msg: string) => logs.push(msg),
    warn: (msg: string) => logs.push(msg),
    error: (msg: string) => logs.push(msg),
  };

  await runSonarLocal({
    action: "stop",
    logger,
    spawnSyncImpl: spawner,
  });
  assert.ok(logs.some((msg) => msg.includes("SonarQube stopped")));

  await runSonarLocal({
    action: "token",
    environment: { SONAR_TOKEN: "env-token" },
    fsImpl: fs,
    logger,
  });
  assert.ok(logs.includes("env-token"));

  await runSonarLocal({
    action: "start",
    environment: {},
    fetchImpl: (input, init) => {
      const url = resolveRequestUrl(input);
      if (url.pathname === "/api/system/status") {
        return Promise.resolve(mockResponse({ status: "UP" }));
      }
      if (url.pathname === "/api/authentication/validate") {
        const auth =
          (init?.headers as Record<string, string> | undefined)
            ?.Authorization ?? "";
        const valid = auth !== "Bearer stale-token";
        return Promise.resolve(mockResponse({ valid }));
      }
      if (url.pathname === "/api/users/change_password") {
        return Promise.resolve(mockResponse({}, 204));
      }
      if (url.pathname === "/api/user_tokens/revoke") {
        return Promise.resolve(mockResponse({}, 204));
      }
      if (url.pathname === "/api/user_tokens/generate") {
        return Promise.resolve(mockResponse({ token: "fresh-token" }));
      }
      if (url.pathname === "/api/qualitygates/list") {
        return Promise.resolve(
          mockResponse({
            qualitygates: [{ name: "Process Management System" }],
          }),
        );
      }
      if (url.pathname === "/api/qualitygates/show") {
        return Promise.resolve(
          mockResponse({
            isDefault: true,
            conditions: [
              { id: 1, metric: "new_violations", op: "GT", error: "0" },
              { id: 2, metric: "violations", op: "GT", error: "0" },
              { id: 3, metric: "new_coverage", op: "LT", error: "80" },
              { id: 4, metric: "coverage", op: "LT", error: "80" },
              {
                id: 5,
                metric: "new_duplicated_lines_density",
                op: "GT",
                error: "0",
              },
              {
                id: 6,
                metric: "duplicated_lines_density",
                op: "GT",
                error: "0",
              },
              {
                id: 7,
                metric: "new_security_hotspots_reviewed",
                op: "LT",
                error: "100",
              },
              {
                id: 8,
                metric: "security_hotspots_reviewed",
                op: "LT",
                error: "100",
              },
            ],
          }),
        );
      }
      return Promise.resolve(mockResponse({}));
    },
    fsImpl: fs,
    logger,
    platform: "linux",
    sleep: () => Promise.resolve(),
    spawnSyncImpl: spawner,
  });

  assert.ok(logs.some((msg) => msg.includes("rotating local credentials")));
  assert.ok(fs.chmodCalls.length >= 2);

  await assert.rejects(
    runSonarLocal({ action: "unknown" }),
    /Unknown sonar-local action: unknown/u,
  );
});

void test("should secret and URL helpers handle missing files, permissions, and trailing slashes", async () => {
  const fs = createMemoryFs();
  assert.equal(await readOptionalSecret("/missing", fs), undefined);
  await assert.rejects(
    loadLocalToken({}, "/missing", fs),
    /No token is configured/u,
  );
  await writeSecret("/tmp/secret", "val", fs, "linux");
  assert.equal(fs.chmodCalls.length, 1);
  assert.equal(basicAuth("admin", "pw"), "Basic YWRtaW46cHc=");
  assert.equal(
    removeTrailingSlashes("http://localhost:9000///"),
    "http://localhost:9000",
  );
});
