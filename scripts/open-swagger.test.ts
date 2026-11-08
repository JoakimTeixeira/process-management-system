import assert from "node:assert/strict";
import type { ChildProcess } from "node:child_process";
import { test } from "node:test";
import {
  openSwaggerUrl,
  resolveSwaggerOpenCommand,
} from "../api/scripts/open-swagger.ts";

void test("resolveSwaggerOpenCommand selects platform-specific browser launcher", () => {
  assert.deepEqual(
    resolveSwaggerOpenCommand("win32", "http://localhost:3000/docs"),
    {
      command: "cmd",
      args: ["/c", "start", "", "http://localhost:3000/docs"],
    },
  );
  assert.deepEqual(
    resolveSwaggerOpenCommand("darwin", "http://localhost:3000/docs"),
    {
      command: "open",
      args: ["http://localhost:3000/docs"],
    },
  );
  assert.deepEqual(
    resolveSwaggerOpenCommand("linux", "http://localhost:3000/docs"),
    {
      command: "xdg-open",
      args: ["http://localhost:3000/docs"],
    },
  );
});

void test("openSwaggerUrl spawns detached browser launcher and unrefs child process", () => {
  let spawnedCommand = "";
  let spawnedArgs: readonly string[] = [];
  let unrefCalled = false;

  const url = openSwaggerUrl({
    environment: { PORT: "3100", SWAGGER_PATH: "api-docs" },
    platform: "linux",
    spawnImpl: ((command: string, args: readonly string[] = []) => {
      spawnedCommand = command;
      spawnedArgs = args;
      return {
        unref: () => {
          unrefCalled = true;
        },
      } as unknown as ChildProcess;
    }) as typeof import("node:child_process").spawn,
  });

  assert.equal(url, "http://localhost:3100/api-docs");
  assert.equal(spawnedCommand, "xdg-open");
  assert.deepEqual(spawnedArgs, ["http://localhost:3100/api-docs"]);
  assert.equal(unrefCalled, true);
});

