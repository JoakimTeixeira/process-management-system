import assert from "node:assert/strict";
import { test } from "node:test";
import {
  assertDbEvidence,
  displayCommand,
  parseRuntimeEnvContent,
  requireUuid,
  resolveBash,
  validateProjectName,
} from "../verification/scripts/verify.ts";

void test("should accept lowercase Compose project names and reject invalid characters", () => {
  assert.equal(
    validateProjectName("process-management-system_verify-1"),
    "process-management-system_verify-1",
  );
  assert.throws(
    () => validateProjectName("Invalid_Project_Name!"),
    /VERIFY_COMPOSE_PROJECT must contain only lowercase/u,
  );
});

void test("should displayCommand quotes arguments with whitespace", () => {
  assert.equal(
    displayCommand("docker", ["compose", "--project-name", "my project"]),
    'docker compose --project-name "my project"',
  );
});

void test("should parseRuntimeEnvContent and requireUuid validate runtime verification artifacts", () => {
  const parsed = parseRuntimeEnvContent(
    [
      "# comment",
      "WORKFLOW_REOPEN_VERSION_ID='fcf2391c-fc49-47fc-a6d3-341cfdc06288'",
      "TEMP_USER_ID=88d131b0-12ac-4957-9917-dde3b3ae908e",
    ].join("\n"),
  );

  assert.equal(
    requireUuid(
      parsed.WORKFLOW_REOPEN_VERSION_ID,
      "WORKFLOW_REOPEN_VERSION_ID",
    ),
    "fcf2391c-fc49-47fc-a6d3-341cfdc06288",
  );
  assert.throws(
    () => requireUuid("not-a-uuid", "TEMP_USER_ID"),
    /TEMP_USER_ID was missing or was not a UUID/u,
  );
});

void test("should resolveBash locates bash on Windows and POSIX platforms", () => {
  assert.equal(
    resolveBash({
      platform: "linux",
      bashPath: undefined,
      existsSyncImpl: () => false,
    }),
    "bash",
  );
  assert.equal(
    resolveBash({
      platform: "win32",
      bashPath: "C:\\Custom\\bash.exe",
      existsSyncImpl: (candidate) => candidate === "C:\\Custom\\bash.exe",
    }),
    "C:\\Custom\\bash.exe",
  );
  assert.throws(
    () =>
      resolveBash({
        platform: "win32",
        bashPath: undefined,
        existsSyncImpl: () => false,
      }),
    /A POSIX Bash shell is required/u,
  );
});

void test("should assertDbEvidence verifies lifecycle transition rows and audit logs", () => {
  const logs: string[] = [];
  const runtimeEnv = {
    WORKFLOW_REOPEN_VERSION_ID: "fcf2391c-fc49-47fc-a6d3-341cfdc06288",
    TEMP_USER_ID: "88d131b0-12ac-4957-9917-dde3b3ae908e",
  };

  assertDbEvidence("runtime.env", {
    parseRuntimeEnvImpl: () => runtimeEnv,
    queryScalarImpl: () => "2",
    logger: { log: (msg) => logs.push(msg) },
  });

  assert.ok(logs.some((msg) => msg.includes("DB evidence passed")));

  assert.throws(
    () =>
      assertDbEvidence("runtime.env", {
        parseRuntimeEnvImpl: () => runtimeEnv,
        queryScalarImpl: () => "0",
        logger: { log: () => {} },
      }),
    /Missing Draft -> In Review lifecycle evidence/u,
  );
});

