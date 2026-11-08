import { spawnSync, type SpawnSyncReturns } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const repoRoot = process.cwd();
const scriptDir = resolve(repoRoot, "verification", "scripts");
const composeFile = resolve(repoRoot, "docker-compose.yml");
const composeOverrideFile = resolve(scriptDir, "docker-compose.verify.yml");
const envFile = resolve(repoRoot, ".env");
const projectName =
  process.env.VERIFY_COMPOSE_PROJECT ?? "process-management-system-verify";
const keepStack = process.env.VERIFY_KEEP_STACK === "1";
const apiBaseUrl =
  process.env.API_BASE_URL ??
  `http://localhost:${process.env.VERIFY_API_PORT ?? "3100"}`;
const runId = new Date()
  .toISOString()
  .replace(/[-:]/g, "")
  .replace(/\..+/, "")
  .replace("T", "-");

export interface RunCommandOptions {
  capture?: boolean;
  allowFailure?: boolean;
  env?: NodeJS.ProcessEnv;
}

export function fail(message: string): never {
  throw new Error(message);
}

export function validateProjectName(name: string): string {
  if (!/^[a-z0-9][a-z0-9_-]*$/.test(name)) {
    fail(
      "VERIFY_COMPOSE_PROJECT must contain only lowercase letters, numbers, underscores, and hyphens.",
    );
  }
  return name;
}

export function displayCommand(
  command: string,
  args: readonly string[],
): string {
  return [command, ...args]
    .map((part) => (/\s/.test(part) ? JSON.stringify(part) : part))
    .join(" ");
}

function run(
  command: string,
  args: readonly string[],
  options: RunCommandOptions = {},
): SpawnSyncReturns<string> {
  const { capture = false, allowFailure = false, env = {} } = options;
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    encoding: "utf8",
    env: { ...process.env, ...env },
    stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
  });

  if (result.error) {
    if (allowFailure) return result;
    fail(
      `Unable to run ${displayCommand(command, args)}: ${result.error.message}`,
    );
  }
  if (result.status !== 0 && !allowFailure) {
    const detail = capture ? `\n${result.stderr || result.stdout}` : "";
    fail(
      `${displayCommand(command, args)} exited with status ${result.status}.${detail}`,
    );
  }
  return result;
}

function compose(
  args: readonly string[],
  options: RunCommandOptions = {},
): SpawnSyncReturns<string> {
  return run(
    "docker",
    [
      "compose",
      "--project-name",
      projectName,
      "--file",
      composeFile,
      "--file",
      composeOverrideFile,
      ...args,
    ],
    options,
  );
}

export function resolveBash({
  platform = process.platform,
  bashPath = process.env.BASH_PATH,
  existsSyncImpl = existsSync,
}: {
  platform?: NodeJS.Platform;
  bashPath?: string;
  existsSyncImpl?: (path: string) => boolean;
} = {}): string {
  const candidates =
    platform === "win32"
      ? [
          bashPath,
          "C:\\Program Files\\Git\\bin\\bash.exe",
          "C:\\Program Files\\Git\\usr\\bin\\bash.exe",
        ]
      : [bashPath, "bash"];

  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }
    if (candidate === "bash" || existsSyncImpl(candidate)) {
      return candidate;
    }
  }
  fail(
    "A POSIX Bash shell is required. Install Git for Windows or set BASH_PATH.",
  );
}

export function parseRuntimeEnvContent(
  content: string,
): Record<string, string> {
  const entries: Record<string, string> = {};
  for (const line of content.split(/\r?\n/)) {
    const match = /^([A-Z0-9_]+)=(.*)$/.exec(line);
    if (!match) continue;
    entries[match[1]] = match[2].replace(/^'(.*)'$/, "$1");
  }
  return entries;
}

export function parseRuntimeEnv(file: string): Record<string, string> {
  return parseRuntimeEnvContent(readFileSync(file, "utf8"));
}

export function requireUuid(value: string | undefined, name: string): string {
  if (
    !value ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  ) {
    fail(
      `${name} was missing or was not a UUID in the verification runtime file.`,
    );
  }
  return value;
}

function queryScalar(sql: string): string {
  const result = compose(
    [
      "exec",
      "-T",
      "postgres",
      "sh",
      "-c",
      'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Atqc "$1"',
      "verify-query",
      sql,
    ],
    { capture: true },
  );
  return result.stdout.trim();
}

export function assertDbEvidence(
  runtimeEnvFile: string,
  {
    parseRuntimeEnvImpl = parseRuntimeEnv,
    queryScalarImpl = queryScalar,
    logger = console,
  }: {
    parseRuntimeEnvImpl?: (file: string) => Record<string, string>;
    queryScalarImpl?: (sql: string) => string;
    logger?: { log: (message: string) => void };
  } = {},
): void {
  logger.log("\n[verify] Asserting database evidence");
  const runtime = parseRuntimeEnvImpl(runtimeEnvFile);
  const versionId = requireUuid(
    runtime.WORKFLOW_REOPEN_VERSION_ID,
    "WORKFLOW_REOPEN_VERSION_ID",
  );
  const userId = requireUuid(runtime.TEMP_USER_ID, "TEMP_USER_ID");

  const expectedTransitions: readonly [string, string][] = [
    ["Draft", "In Review"],
    ["In Review", "Approved"],
    ["Approved", "Draft"],
  ];
  for (const [fromState, toState] of expectedTransitions) {
    const count = Number(
      queryScalarImpl(
        `SELECT count(*) FROM version_state_history WHERE process_version_id = '${versionId}'::uuid AND from_state = '${fromState}' AND to_state = '${toState}';`,
      ),
    );
    if (count < 1) {
      fail(
        `Missing ${fromState} -> ${toState} lifecycle evidence for ${versionId}.`,
      );
    }
  }

  const versionAuditCount = Number(
    queryScalarImpl(
      `SELECT count(*) FROM audit_logs WHERE entity_type = 'process_version' AND entity_id = '${versionId}'::uuid;`,
    ),
  );
  if (versionAuditCount < 1) {
    fail(`Missing process-version audit evidence for ${versionId}.`);
  }

  const userAuditCount = Number(
    queryScalarImpl(
      `SELECT count(*) FROM audit_logs WHERE entity_type = 'user' AND entity_id = '${userId}'::uuid;`,
    ),
  );
  if (userAuditCount < 1) {
    fail(`Missing user audit evidence for ${userId}.`);
  }

  logger.log(
    `[verify] DB evidence passed: 3 lifecycle transitions, ${versionAuditCount} version audit row(s), ${userAuditCount} user audit row(s).`,
  );
}

async function waitForPostgres(): Promise<void> {
  console.log("[verify] Waiting for PostgreSQL health");
  for (let attempt = 1; attempt <= 60; attempt += 1) {
    const id = compose(["ps", "--quiet", "postgres"], {
      capture: true,
    }).stdout.trim();
    if (id) {
      const state = run(
        "docker",
        [
          "inspect",
          "--format",
          "{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}",
          id,
        ],
        { capture: true },
      ).stdout.trim();
      if (state === "healthy") return;
      if (state === "unhealthy" || state === "exited" || state === "dead") {
        fail(`PostgreSQL entered terminal state '${state}'.`);
      }
    }
    await delay(1000);
  }
  fail("PostgreSQL did not become healthy within 60 seconds.");
}

async function waitForApi(): Promise<void> {
  console.log(`[verify] Waiting for API health at ${apiBaseUrl}/health`);
  for (let attempt = 1; attempt <= 90; attempt += 1) {
    try {
      const response = await fetch(`${apiBaseUrl}/health`, {
        signal: AbortSignal.timeout(2000),
      });
      const body = (await response.json()) as { status?: string };
      if (response.status === 200 && body?.status === "UP") return;
    } catch {
      // The service is expected to refuse connections while containers start.
    }
    await delay(1000);
  }
  fail("API health did not report UP within 90 seconds.");
}

function cleanup(): void {
  console.log(`\n[verify] Cleaning Compose project '${projectName}'`);
  const result = compose(["down", "--volumes", "--remove-orphans"], {
    allowFailure: true,
  });
  if (result.status !== 0) {
    console.error(
      "[verify] Cleanup failed; run the documented cleanup command manually.",
    );
  }
}

async function main(): Promise<void> {
  validateProjectName(projectName);
  let stackWasPrepared = false;

  try {
    console.log(`[verify] Compose project: ${projectName}`);
    console.log("[verify] Checking prerequisites");
    if (!existsSync(composeFile))
      fail(`Compose file not found: ${composeFile}`);
    if (!existsSync(composeOverrideFile)) {
      fail(`Compose override file not found: ${composeOverrideFile}`);
    }
    if (!existsSync(envFile)) {
      fail(
        "Missing .env. Copy .env.example to .env and supply the required secrets.",
      );
    }
    const bash = resolveBash();
    run("docker", ["--version"], { capture: true });
    run("docker", ["compose", "version"], { capture: true });
    run("docker", ["info"], { capture: true });
    compose(["config", "--quiet"]);

    cleanup();
    stackWasPrepared = true;

    console.log("\n[verify] Building API image");
    compose(["build", "api"]);
    console.log("\n[verify] Starting PostgreSQL");
    compose(["up", "--detach", "postgres"]);
    await waitForPostgres();

    console.log("\n[verify] Applying migrations");
    compose(["run", "--rm", "api", "npm", "run", "migrate"]);
    console.log("\n[verify] Seeding deterministic demo data");
    compose(["run", "--rm", "api", "npm", "run", "seed"]);

    console.log("\n[verify] Starting API and load balancer");
    compose(["up", "--detach", "api", "api-lb"]);
    await waitForApi();

    console.log("\n[verify] Running curl assertions");
    run(bash, ["./verification/scripts/backoffice_validation_curl_commands.sh"], {
      env: { API_BASE_URL: apiBaseUrl, RUN_ID: runId },
    });

    const runtimeEnvFile = resolve(
      repoRoot,
      "verification",
      "logs",
      `backoffice-validation-${runId}`,
      "backoffice-validation.runtime.env",
    );
    if (!existsSync(runtimeEnvFile)) {
      fail(`Curl verification did not write ${runtimeEnvFile}.`);
    }
    assertDbEvidence(runtimeEnvFile);

    console.log(
      "\n[verify] PASS — compose, migrations, seed, curl, RBAC, visibility, and DB evidence are green.",
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`\n[verify] FAIL — ${message}`);
    process.exitCode = 1;
  } finally {
    if (stackWasPrepared && !keepStack) cleanup();
    if (keepStack) {
      console.log(
        `[verify] VERIFY_KEEP_STACK=1; Compose project '${projectName}' was left running.`,
      );
    }
  }
}

if (basename(process.argv[1] ?? "") === "verify.ts") {
  void main();
}

