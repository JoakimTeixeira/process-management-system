export class SonarDiagnosticError extends Error {
  constructor(category, message, options) {
    super(message, options);
    this.name = "SonarDiagnosticError";
    this.category = category;
  }
}

export async function assertServerReady(baseUrl, authToken, fetchImpl = fetch) {
  let statusResponse;
  try {
    statusResponse = await sonarRequest(
      baseUrl,
      undefined,
      "api/system/status",
      fetchImpl,
    );
  } catch (error) {
    throw new SonarDiagnosticError(
      "infrastructure",
      `SonarQube server is unavailable at ${baseUrl}.`,
      { cause: error },
    );
  }

  if (statusResponse.status !== "UP") {
    throw new SonarDiagnosticError(
      "infrastructure",
      `SonarQube server is not ready (status: ${statusResponse.status ?? "unknown"}).`,
    );
  }

  let validation;
  try {
    validation = await sonarRequest(
      baseUrl,
      authToken,
      "api/authentication/validate",
      fetchImpl,
    );
  } catch (error) {
    if (
      error instanceof SonarDiagnosticError &&
      error.category === "authentication"
    ) {
      throw error;
    }
    throw new SonarDiagnosticError(
      "authentication",
      "Could not validate the SonarQube token.",
      { cause: error },
    );
  }

  if (!validation.valid) {
    throw new SonarDiagnosticError(
      "authentication",
      "The SonarQube token is invalid.",
    );
  }
}

export async function waitForComputeTask(
  taskUrl,
  baseUrl,
  authToken,
  {
    fetchImpl = fetch,
    intervalMilliseconds = 2_000,
    maxAttempts = 120,
    sleep = delay,
  } = {},
) {
  const url = new URL(taskUrl);
  if (url.origin !== new URL(baseUrl).origin) {
    throw new SonarDiagnosticError(
      "api",
      "Scanner compute-task URL does not match the configured server.",
    );
  }

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const response = await sonarRequest(
      baseUrl,
      authToken,
      url.toString(),
      fetchImpl,
    );
    const { task } = response;
    if (task?.status === "SUCCESS") {
      if (!task.analysisId) {
        throw new SonarDiagnosticError(
          "api",
          "SonarQube completed the task without returning an analysis ID.",
        );
      }
      return task;
    }
    if (task?.status === "FAILED" || task?.status === "CANCELED") {
      throw new SonarDiagnosticError(
        "analysis",
        `SonarQube analysis ${task.status.toLowerCase()}: ${task.errorMessage ?? "unknown error"}`,
      );
    }
    await sleep(intervalMilliseconds);
  }

  throw new SonarDiagnosticError(
    "timeout",
    `Timed out waiting for SonarQube after ${maxAttempts} status checks.`,
  );
}

export async function fetchPages(
  baseUrl,
  authToken,
  endpoint,
  resultKey,
  parameters,
  fetchImpl = fetch,
) {
  const results = [];
  for (let page = 1; ; page += 1) {
    const query = new URLSearchParams({
      ...parameters,
      p: String(page),
      ps: "500",
    });
    const response = await sonarRequest(
      baseUrl,
      authToken,
      `${endpoint}?${query.toString()}`,
      fetchImpl,
    );
    const pageResults = response[resultKey] ?? [];
    results.push(...pageResults);
    const total = response.paging?.total ?? response.total ?? results.length;
    if (results.length >= total || pageResults.length === 0) {
      return results;
    }
  }
}

export async function sonarRequest(
  baseUrl,
  authToken,
  path,
  fetchImpl = fetch,
  init = {},
) {
  const requestUrl = new URL(path, `${baseUrl}/`);
  if (requestUrl.origin !== new URL(baseUrl).origin) {
    throw new SonarDiagnosticError(
      "api",
      "Refusing to send the SonarQube token to another server.",
    );
  }

  let response;
  try {
    response = await fetchImpl(requestUrl, {
      ...init,
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
    });
  } catch (error) {
    throw new SonarDiagnosticError(
      "infrastructure",
      `SonarQube request could not reach ${requestUrl}.`,
      { cause: error },
    );
  }

  if (!response.ok) {
    const category =
      response.status === 401 || response.status === 403
        ? "authentication"
        : "api";
    throw new SonarDiagnosticError(
      category,
      `SonarQube request failed (${response.status} ${response.statusText}): ${requestUrl}`,
    );
  }

  if (response.status === 204) {
    return {};
  }

  try {
    return await response.json();
  } catch (error) {
    throw new SonarDiagnosticError(
      "api",
      `SonarQube returned invalid JSON for ${requestUrl}.`,
      { cause: error },
    );
  }
}

export function parseProperties(contents) {
  return Object.fromEntries(
    contents
      .split(/\r?\n/u)
      .filter((line) => line.includes("="))
      .map((line) => {
        const separator = line.indexOf("=");
        return [line.slice(0, separator), line.slice(separator + 1)];
      }),
  );
}

export function assertSameServer(configuredUrl, reportedUrl) {
  if (new URL(configuredUrl).origin !== new URL(reportedUrl).origin) {
    throw new SonarDiagnosticError(
      "scanner",
      `Scanner reported an unexpected server (${reportedUrl}); refusing to send its token.`,
    );
  }
}

export function formatLocation(component, line, key) {
  const prefix = `${key}:`;
  const path = component?.startsWith(prefix)
    ? component.slice(prefix.length)
    : component || key;
  return line ? `${path}:${line}` : path;
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
