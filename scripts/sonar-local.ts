import { spawnSync, type SpawnSyncReturns } from "node:child_process";
import { randomBytes } from "node:crypto";
import { chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";

const defaultRoot = process.cwd();
const projectName = "process-management-system";

export interface ComposeInvocation {
  command: string;
  prefix: string[];
}

export interface SonarLocalFs {
  chmod: (path: string, mode: number) => Promise<void>;
  mkdir: (
    path: string,
    options?: { recursive?: boolean },
  ) => Promise<string | undefined>;
  readFile: (path: string, encoding: BufferEncoding) => Promise<string>;
  writeFile: (
    path: string,
    data: string,
    options?: { encoding?: BufferEncoding; mode?: number },
  ) => Promise<void>;
}

const defaultFs: SonarLocalFs = {
  chmod: (path, mode) => chmod(path, mode),
  mkdir: (path, options) => mkdir(path, options),
  readFile: (path, encoding) => readFile(path, encoding),
  writeFile: (path, data, options) => writeFile(path, data, options),
};

export interface SonarLocalOptions {
  action?: string;
  environment?: NodeJS.ProcessEnv;
  fetchImpl?: typeof fetch;
  fsImpl?: SonarLocalFs;
  logger?: {
    log: (message: string) => void;
    warn: (message: string) => void;
    error: (message: string) => void;
  };
  platform?: NodeJS.Platform;
  root?: string;
  sleep?: (milliseconds: number) => Promise<void>;
  spawnSyncImpl?: typeof spawnSync;
}

export async function runSonarLocal(
  options: SonarLocalOptions = {},
): Promise<void> {
  const {
    action = process.argv[2] ?? "status",
    environment = process.env,
    fetchImpl = fetch,
    fsImpl = defaultFs,
    logger = console,
    platform = process.platform,
    root = defaultRoot,
    sleep = delay,
    spawnSyncImpl = spawnSync,
  } = options;

  const stateDirectory = join(root, ".sonarqube");
  const tokenPath = join(stateDirectory, "token");
  const passwordPath = join(stateDirectory, "admin-password");
  const composeFile = join(root, "docker-compose.yml");
  const port = environment.SONAR_PORT?.trim() || "9000";
  const serverUrl =
    environment.SONAR_HOST_URL?.trim() || `http://localhost:${port}`;
  const normalizedServerUrl = removeTrailingSlashes(serverUrl);

  const runCompose = (args: readonly string[]): void => {
    compose(args, { composeFile, root, spawnSyncImpl });
  };

  if (action === "start") {
    runCompose(["--profile", "diagnostics", "up", "-d", "sonarqube"]);
    logger.log(`[sonar-local] Waiting for ${normalizedServerUrl} ...`);
    await waitUntilReady(normalizedServerUrl, { fetchImpl, sleep });

    const configuredToken = environment.SONAR_TOKEN?.trim();
    if (configuredToken) {
      await assertValidToken(normalizedServerUrl, configuredToken, fetchImpl);
      await ensureStrictQualityGate(
        normalizedServerUrl,
        configuredToken,
        fetchImpl,
      );
      logger.log("[sonar-local] Server is ready; SONAR_TOKEN is valid.");
      return;
    }

    const storedToken = await readOptionalSecret(tokenPath, fsImpl);
    if (storedToken) {
      if (await isValidToken(normalizedServerUrl, storedToken, fetchImpl)) {
        await ensureStrictQualityGate(
          normalizedServerUrl,
          storedToken,
          fetchImpl,
        );
        logger.log(
          `[sonar-local] Server is ready; using the token stored at ${tokenPath}.`,
        );
        return;
      }
      logger.warn(
        "[sonar-local] The stored token is stale; rotating local credentials.",
      );
    }

    const token = await bootstrapLocalCredentials({
      environment,
      fetchImpl,
      fsImpl,
      normalizedServerUrl,
      passwordPath,
      platform,
      stateDirectory,
      tokenPath,
    });
    await ensureStrictQualityGate(normalizedServerUrl, token, fetchImpl);
    logger.log(
      `[sonar-local] Server is ready; a user token was stored at ${tokenPath}.`,
    );
    logger.log(
      "[sonar-local] Run `npm run sonar:token` to copy it into VS Code Connected Mode.",
    );
  } else if (action === "stop") {
    runCompose(["stop", "sonarqube"]);
    logger.log(
      "[sonar-local] SonarQube stopped; local data volumes were preserved.",
    );
  } else if (action === "status") {
    runCompose(["ps", "sonarqube"]);
    await printServerStatus(normalizedServerUrl, fetchImpl, logger);
  } else if (action === "token") {
    logger.log(await loadLocalToken(environment, tokenPath, fsImpl));
  } else {
    throw new Error(`Unknown sonar-local action: ${action}`);
  }
}

export function compose(
  args: readonly string[],
  {
    composeFile = join(defaultRoot, "docker-compose.yml"),
    root = defaultRoot,
    spawnSyncImpl = spawnSync,
  }: {
    composeFile?: string;
    root?: string;
    spawnSyncImpl?: typeof spawnSync;
  } = {},
): void {
  const invocation = findCompose(spawnSyncImpl);
  const result = spawnSyncImpl(
    invocation.command,
    [
      ...invocation.prefix,
      "--project-name",
      projectName,
      "--file",
      composeFile,
      ...args,
    ],
    { cwd: root, stdio: "inherit" },
  );

  if (result.error) {
    throw new Error(`Docker Compose could not start: ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(
      `Docker Compose exited with status ${String(result.status)}.`,
    );
  }
}

export function findCompose(
  spawnSyncImpl: typeof spawnSync = spawnSync,
): ComposeInvocation {
  const candidates: ComposeInvocation[] = [
    { command: "docker", prefix: ["compose"] },
    { command: "docker-compose", prefix: [] },
  ];

  for (const candidate of candidates) {
    const result: SpawnSyncReturns<string> = spawnSyncImpl(
      candidate.command,
      [...candidate.prefix, "version"],
      {
        encoding: "utf8",
        stdio: "pipe",
      },
    );
    if (result.status === 0) {
      return candidate;
    }
  }

  throw new Error(
    "Docker Compose is unavailable. Start Docker Desktop and install Compose.",
  );
}

export async function waitUntilReady(
  normalizedServerUrl: string,
  {
    fetchImpl = fetch,
    maxAttempts = 120,
    sleep = delay,
  }: {
    fetchImpl?: typeof fetch;
    maxAttempts?: number;
    sleep?: (milliseconds: number) => Promise<void>;
  } = {},
): Promise<void> {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      const response = await fetchImpl(
        `${normalizedServerUrl}/api/system/status`,
      );
      if (response.ok) {
        const { status } = (await response.json()) as { status?: string };
        if (status === "UP") {
          return;
        }
      }
    } catch {
      // Startup connection failures are expected while the container initializes.
    }
    await sleep(2_000);
  }

  throw new Error(
    "Timed out after four minutes waiting for SonarQube Community Build.",
  );
}

export async function printServerStatus(
  normalizedServerUrl: string,
  fetchImpl: typeof fetch = fetch,
  logger: { log: (message: string) => void } = console,
): Promise<void> {
  try {
    const response = await fetchImpl(
      `${normalizedServerUrl}/api/system/status`,
    );
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    const status = (await response.json()) as {
      status?: string;
      version?: string;
    };
    logger.log(
      `[sonar-local] Server status: ${status.status ?? "unknown"} (${status.version ?? "unknown"}).`,
    );
  } catch (error) {
    throw new Error(
      `Server is unavailable at ${normalizedServerUrl}: ${error instanceof Error ? error.message : String(error)}`,
      { cause: error },
    );
  }
}

async function bootstrapLocalCredentials({
  environment,
  fetchImpl,
  fsImpl,
  normalizedServerUrl,
  passwordPath,
  platform,
  stateDirectory,
  tokenPath,
}: {
  environment: NodeJS.ProcessEnv;
  fetchImpl: typeof fetch;
  fsImpl: SonarLocalFs;
  normalizedServerUrl: string;
  passwordPath: string;
  platform: NodeJS.Platform;
  stateDirectory: string;
  tokenPath: string;
}): Promise<string> {
  await fsImpl.mkdir(stateDirectory, { recursive: true });
  const configuredPassword = environment.SONAR_ADMIN_PASSWORD?.trim();
  const storedPassword = await readOptionalSecret(passwordPath, fsImpl);
  let adminPassword = configuredPassword || storedPassword;

  if (
    adminPassword &&
    !(await isValidAdminPassword(normalizedServerUrl, adminPassword, fetchImpl))
  ) {
    if (configuredPassword) {
      throw new Error("SONAR_ADMIN_PASSWORD is invalid.");
    }
    adminPassword = undefined;
  }

  if (!adminPassword) {
    const generatedPassword = `Pms!${randomBytes(24).toString("base64url")}`;
    const body = new URLSearchParams({
      login: "admin",
      password: generatedPassword,
      previousPassword: "admin",
    });
    const response = await fetchImpl(
      `${normalizedServerUrl}/api/users/change_password`,
      {
        method: "POST",
        headers: {
          Authorization: basicAuth("admin", "admin"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      },
    );
    if (!response.ok) {
      throw new Error(
        "Could not initialize the local admin account. Set SONAR_ADMIN_PASSWORD or reset the local SonarQube volumes.",
      );
    }
    adminPassword = generatedPassword;
    await writeSecret(passwordPath, adminPassword, fsImpl, platform);
  }

  const tokenName = "process-management-system-local";
  const revokeResponse = await fetchImpl(
    `${normalizedServerUrl}/api/user_tokens/revoke`,
    {
      method: "POST",
      headers: {
        Authorization: basicAuth("admin", adminPassword),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ name: tokenName }),
    },
  );
  if (!revokeResponse.ok && revokeResponse.status !== 404) {
    throw new Error(
      `Could not revoke the stale local token (${revokeResponse.status}).`,
    );
  }
  const response = await fetchImpl(
    `${normalizedServerUrl}/api/user_tokens/generate`,
    {
      method: "POST",
      headers: {
        Authorization: basicAuth("admin", adminPassword),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ name: tokenName, type: "USER_TOKEN" }),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Could not generate a local user token (${response.status}).`,
    );
  }

  const { token } = (await response.json()) as { token: string };
  await writeSecret(tokenPath, token, fsImpl, platform);
  return token;
}

export async function ensureStrictQualityGate(
  normalizedServerUrl: string,
  token: string,
  fetchImpl: typeof fetch = fetch,
): Promise<void> {
  const gateName = "Process Management System";
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };
  const listResponse = await fetchImpl(
    `${normalizedServerUrl}/api/qualitygates/list`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!listResponse.ok) {
    throw new Error(
      `Could not list SonarQube quality gates (${listResponse.status}).`,
    );
  }
  const { qualitygates = [] } = (await listResponse.json()) as {
    qualitygates?: { name: string }[];
  };
  if (!qualitygates.some((gate) => gate.name === gateName)) {
    const createResponse = await fetchImpl(
      `${normalizedServerUrl}/api/qualitygates/create`,
      {
        method: "POST",
        headers,
        body: new URLSearchParams({ name: gateName }),
      },
    );
    if (!createResponse.ok) {
      throw new Error(
        `Could not create quality gate "${gateName}" (${createResponse.status}).`,
      );
    }
  }

  const showResponse = await fetchImpl(
    `${normalizedServerUrl}/api/qualitygates/show?${new URLSearchParams({ name: gateName }).toString()}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!showResponse.ok) {
    throw new Error(
      `Could not inspect quality gate "${gateName}" (${showResponse.status}).`,
    );
  }
  const existingGate = (await showResponse.json()) as {
    isDefault?: boolean;
    conditions?: {
      id: number | string;
      metric: string;
      op: string;
      error: string;
    }[];
  };
  const existingConditions = new Map(
    (existingGate.conditions ?? []).map((condition) => [
      condition.metric,
      condition,
    ]),
  );

  const desiredConditions = [
    { metric: "new_violations", op: "GT", error: "0" },
    { metric: "violations", op: "GT", error: "0" },
    { metric: "new_coverage", op: "LT", error: "80" },
    { metric: "coverage", op: "LT", error: "80" },
    { metric: "new_duplicated_lines_density", op: "GT", error: "0" },
    { metric: "duplicated_lines_density", op: "GT", error: "0" },
    { metric: "new_security_hotspots_reviewed", op: "LT", error: "100" },
    { metric: "security_hotspots_reviewed", op: "LT", error: "100" },
  ];

  for (const desired of desiredConditions) {
    const current = existingConditions.get(desired.metric);
    if (!current) {
      const response = await fetchImpl(
        `${normalizedServerUrl}/api/qualitygates/create_condition`,
        {
          method: "POST",
          headers,
          body: new URLSearchParams({
            gateName,
            metric: desired.metric,
            op: desired.op,
            error: desired.error,
          }),
        },
      );
      if (!response.ok) {
        throw new Error(
          `Could not create condition ${desired.metric} on "${gateName}" (${response.status}).`,
        );
      }
    } else if (current.op !== desired.op || current.error !== desired.error) {
      const response = await fetchImpl(
        `${normalizedServerUrl}/api/qualitygates/update_condition`,
        {
          method: "POST",
          headers,
          body: new URLSearchParams({
            id: String(current.id),
            metric: desired.metric,
            op: desired.op,
            error: desired.error,
          }),
        },
      );
      if (!response.ok) {
        throw new Error(
          `Could not update condition ${desired.metric} on "${gateName}" (${response.status}).`,
        );
      }
    }
  }

  if (!existingGate.isDefault) {
    const defaultResponse = await fetchImpl(
      `${normalizedServerUrl}/api/qualitygates/set_as_default`,
      {
        method: "POST",
        headers,
        body: new URLSearchParams({ name: gateName }),
      },
    );
    if (!defaultResponse.ok) {
      throw new Error(
        `Could not set "${gateName}" as the default quality gate (${defaultResponse.status}).`,
      );
    }
  }
}

async function assertValidToken(
  normalizedServerUrl: string,
  token: string,
  fetchImpl: typeof fetch,
): Promise<void> {
  if (await isValidToken(normalizedServerUrl, token, fetchImpl)) {
    return;
  }
  throw new Error("The configured SonarQube token is invalid.");
}

async function isValidToken(
  normalizedServerUrl: string,
  token: string,
  fetchImpl: typeof fetch,
): Promise<boolean> {
  const response = await fetchImpl(
    `${normalizedServerUrl}/api/authentication/validate`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  const result = response.ok
    ? ((await response.json()) as { valid?: boolean })
    : { valid: false };
  return result.valid === true;
}

async function isValidAdminPassword(
  normalizedServerUrl: string,
  password: string,
  fetchImpl: typeof fetch,
): Promise<boolean> {
  const response = await fetchImpl(
    `${normalizedServerUrl}/api/authentication/validate`,
    {
      headers: { Authorization: basicAuth("admin", password) },
    },
  );
  const result = response.ok
    ? ((await response.json()) as { valid?: boolean })
    : { valid: false };
  return result.valid === true;
}

export async function loadLocalToken(
  environment: NodeJS.ProcessEnv = process.env,
  tokenPath: string = join(defaultRoot, ".sonarqube", "token"),
  fsImpl: SonarLocalFs = defaultFs,
): Promise<string> {
  const token =
    environment.SONAR_TOKEN?.trim() ||
    (await readOptionalSecret(tokenPath, fsImpl));
  if (!token) {
    throw new Error("No token is configured. Run `npm run sonar:start` first.");
  }
  return token;
}

export async function readOptionalSecret(
  path: string,
  fsImpl: Pick<SonarLocalFs, "readFile"> = defaultFs,
): Promise<string | undefined> {
  try {
    return (await fsImpl.readFile(path, "utf8")).trim();
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: unknown }).code === "ENOENT"
    ) {
      return undefined;
    }
    throw error;
  }
}

export async function writeSecret(
  path: string,
  value: string,
  fsImpl: Pick<SonarLocalFs, "writeFile" | "chmod"> = defaultFs,
  platform: NodeJS.Platform = process.platform,
): Promise<void> {
  await fsImpl.writeFile(path, `${value}\n`, {
    encoding: "utf8",
    mode: 0o600,
  });
  if (platform !== "win32") {
    await fsImpl.chmod(path, 0o600);
  }
}

export function basicAuth(username: string, password: string): string {
  return `Basic ${Buffer.from(`${username}:${password}`, "utf8").toString("base64")}`;
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export function removeTrailingSlashes(value: string): string {
  let end = value.length;
  while (end > 0 && value[end - 1] === "/") {
    end -= 1;
  }
  return value.slice(0, end);
}

async function main(): Promise<void> {
  try {
    await runSonarLocal();
  } catch (error) {
    console.error(
      `[sonar-local] ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exitCode = 1;
  }
}

if (basename(process.argv[1] ?? "") === "sonar-local.ts") {
  void main();
}

