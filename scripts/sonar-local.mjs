import { randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
import { chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const stateDirectory = join(root, ".sonarqube");
const tokenPath = join(stateDirectory, "token");
const passwordPath = join(stateDirectory, "admin-password");
const composeFile = join(root, "docker-compose.yml");
const projectName = "process-management-system";
const port = process.env.SONAR_PORT?.trim() || "9000";
const serverUrl = (
  process.env.SONAR_HOST_URL?.trim() || `http://localhost:${port}`
);
const normalizedServerUrl = removeTrailingSlashes(serverUrl);
const action = process.argv[2] ?? "status";

try {
  if (action === "start") {
    await start();
  } else if (action === "stop") {
    compose(["stop", "sonarqube"]);
    console.log(
      "[sonar-local] SonarQube stopped; local data volumes were preserved.",
    );
  } else if (action === "status") {
    compose(["ps", "sonarqube"]);
    await printServerStatus();
  } else if (action === "token") {
    console.log(await loadLocalToken());
  } else {
    throw new Error(`Unknown sonar-local action: ${action}`);
  }
} catch (error) {
  console.error(
    `[sonar-local] ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exitCode = 1;
}

async function start() {
  compose(["--profile", "diagnostics", "up", "-d", "sonarqube"]);
  console.log(`[sonar-local] Waiting for ${normalizedServerUrl} ...`);
  await waitUntilReady();

  const configuredToken = process.env.SONAR_TOKEN?.trim();
  if (configuredToken) {
    await assertValidToken(configuredToken);
    console.log("[sonar-local] Server is ready; SONAR_TOKEN is valid.");
    return;
  }

  const storedToken = await readOptionalSecret(tokenPath);
  if (storedToken) {
    if (await isValidToken(storedToken)) {
      console.log(
        `[sonar-local] Server is ready; using the token stored at ${tokenPath}.`,
      );
      return;
    }
    console.warn(
      "[sonar-local] The stored token is stale; rotating local credentials.",
    );
  }

  await bootstrapLocalCredentials();
  console.log(
    `[sonar-local] Server is ready; a user token was stored at ${tokenPath}.`,
  );
  console.log(
    "[sonar-local] Run `npm run sonar:token` to copy it into VS Code Connected Mode.",
  );
}

function compose(args) {
  const invocation = findCompose();
  const result = spawnSync(
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
    throw new Error(`Docker Compose exited with status ${result.status}.`);
  }
}

function findCompose() {
  const candidates = [
    { command: "docker", prefix: ["compose"] },
    { command: "docker-compose", prefix: [] },
  ];

  for (const candidate of candidates) {
    const result = spawnSync(
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

async function waitUntilReady() {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    try {
      const response = await fetch(`${normalizedServerUrl}/api/system/status`);
      if (response.ok) {
        const { status } = await response.json();
        if (status === "UP") {
          return;
        }
      }
    } catch {
      // Startup connection failures are expected while the container initializes.
    }
    await delay(2_000);
  }

  throw new Error(
    "Timed out after four minutes waiting for SonarQube Community Build.",
  );
}

async function printServerStatus() {
  try {
    const response = await fetch(`${normalizedServerUrl}/api/system/status`);
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    const status = await response.json();
    console.log(
      `[sonar-local] Server status: ${status.status} (${status.version}).`,
    );
  } catch (error) {
    throw new Error(
      `Server is unavailable at ${normalizedServerUrl}: ${error instanceof Error ? error.message : String(error)}`,
      { cause: error },
    );
  }
}

async function bootstrapLocalCredentials() {
  await mkdir(stateDirectory, { recursive: true });
  const configuredPassword = process.env.SONAR_ADMIN_PASSWORD?.trim();
  const storedPassword = await readOptionalSecret(passwordPath);
  let adminPassword = configuredPassword || storedPassword;

  if (adminPassword && !(await isValidAdminPassword(adminPassword))) {
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
    const response = await fetch(`${normalizedServerUrl}/api/users/change_password`, {
      method: "POST",
      headers: {
        Authorization: basicAuth("admin", "admin"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
    if (!response.ok) {
      throw new Error(
        "Could not initialize the local admin account. Set SONAR_ADMIN_PASSWORD or reset the local SonarQube volumes.",
      );
    }
    adminPassword = generatedPassword;
    await writeSecret(passwordPath, adminPassword);
  }

  const tokenName = "process-management-system-local";
  const revokeResponse = await fetch(`${normalizedServerUrl}/api/user_tokens/revoke`, {
    method: "POST",
    headers: {
      Authorization: basicAuth("admin", adminPassword),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ name: tokenName }),
  });
  if (!revokeResponse.ok && revokeResponse.status !== 404) {
    throw new Error(
      `Could not revoke the stale local token (${revokeResponse.status}).`,
    );
  }
  const response = await fetch(`${normalizedServerUrl}/api/user_tokens/generate`, {
    method: "POST",
    headers: {
      Authorization: basicAuth("admin", adminPassword),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ name: tokenName, type: "USER_TOKEN" }),
  });

  if (!response.ok) {
    throw new Error(
      `Could not generate a local user token (${response.status}).`,
    );
  }

  const { token } = await response.json();
  await writeSecret(tokenPath, token);
}

async function assertValidToken(token) {
  if (await isValidToken(token)) {
    return;
  }
  throw new Error("The configured SonarQube token is invalid.");
}

async function isValidToken(token) {
  const response = await fetch(`${normalizedServerUrl}/api/authentication/validate`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const result = response.ok ? await response.json() : { valid: false };
  return result.valid === true;
}

async function isValidAdminPassword(password) {
  const response = await fetch(`${normalizedServerUrl}/api/authentication/validate`, {
    headers: { Authorization: basicAuth("admin", password) },
  });
  const result = response.ok ? await response.json() : { valid: false };
  return result.valid === true;
}

async function loadLocalToken() {
  const token =
    process.env.SONAR_TOKEN?.trim() || (await readOptionalSecret(tokenPath));
  if (!token) {
    throw new Error("No token is configured. Run `npm run sonar:start` first.");
  }
  return token;
}

async function readOptionalSecret(path) {
  try {
    return (await readFile(path, "utf8")).trim();
  } catch (error) {
    if (error && typeof error === "object" && error.code === "ENOENT") {
      return undefined;
    }
    throw error;
  }
}

async function writeSecret(path, value) {
  await writeFile(path, `${value}\n`, { encoding: "utf8", mode: 0o600 });
  if (process.platform !== "win32") {
    await chmod(path, 0o600);
  }
}

function basicAuth(username, password) {
  return `Basic ${Buffer.from(`${username}:${password}`, "utf8").toString("base64")}`;
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function removeTrailingSlashes(value) {
  let end = value.length;
  while (end > 0 && value[end - 1] === "/") {
    end -= 1;
  }
  return value.slice(0, end);
}
