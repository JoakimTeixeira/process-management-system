export type SonarDiagnosticCategory =
  | "analysis"
  | "api"
  | "authentication"
  | "configuration"
  | "infrastructure"
  | "scanner"
  | "timeout"
  | "unexpected";

export interface SonarResponse {
  ok: boolean;
  status: number;
  statusText: string;
  json?: () => Promise<unknown>;
}

export type SonarFetch = (
  input: URL | string,
  init?: RequestInit,
) => Promise<SonarResponse>;

export interface SonarComputeTask {
  status?: string;
  analysisId?: string;
  errorMessage?: string;
}

export interface SonarPagingResponse {
  paging?: { total?: number };
  total?: number;
  [key: string]: unknown;
}

export class SonarDiagnosticError extends Error {
  readonly category: SonarDiagnosticCategory;

  constructor(
    category: SonarDiagnosticCategory,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "SonarDiagnosticError";
    this.category = category;
  }
}

export async function assertServerReady(
  baseUrl: string,
  authToken: string,
  fetchImpl: SonarFetch = fetch,
): Promise<void> {
  let statusResponse: { status?: string };
  try {
    statusResponse = await sonarRequest<{ status?: string }>(
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

  let validation: { valid?: boolean };
  try {
    validation = await sonarRequest<{ valid?: boolean }>(
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
  taskUrl: string,
  baseUrl: string,
  authToken: string,
  {
    fetchImpl = fetch,
    intervalMilliseconds = 2_000,
    maxAttempts = 120,
    sleep = delay,
  }: {
    fetchImpl?: SonarFetch;
    intervalMilliseconds?: number;
    maxAttempts?: number;
    sleep?: (milliseconds: number) => Promise<void>;
  } = {},
): Promise<SonarComputeTask & { analysisId: string }> {
  const url = new URL(taskUrl);
  if (url.origin !== new URL(baseUrl).origin) {
    throw new SonarDiagnosticError(
      "api",
      "Scanner compute-task URL does not match the configured server.",
    );
  }

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const response = await sonarRequest<{ task?: SonarComputeTask }>(
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
      return { ...task, analysisId: task.analysisId };
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

export async function fetchPages<T>(
  baseUrl: string,
  authToken: string,
  endpoint: string,
  resultKey: string,
  parameters: Record<string, string>,
  fetchImpl: SonarFetch = fetch,
): Promise<T[]> {
  const results: T[] = [];
  for (let page = 1; ; page += 1) {
    const query = new URLSearchParams({
      ...parameters,
      p: String(page),
      ps: "500",
    });
    const response = await sonarRequest<SonarPagingResponse>(
      baseUrl,
      authToken,
      `${endpoint}?${query.toString()}`,
      fetchImpl,
    );
    const pageResults = (response[resultKey] as T[] | undefined) ?? [];
    results.push(...pageResults);
    const total = response.paging?.total ?? response.total ?? results.length;
    if (results.length >= total || pageResults.length === 0) {
      return results;
    }
  }
}

export async function sonarRequest<T = Record<string, unknown>>(
  baseUrl: string,
  authToken: string | undefined,
  path: string,
  fetchImpl: SonarFetch = fetch,
  init: RequestInit = {},
): Promise<T> {
  const requestUrl = new URL(path, `${baseUrl}/`);
  if (requestUrl.origin !== new URL(baseUrl).origin) {
    throw new SonarDiagnosticError(
      "api",
      "Refusing to send the SonarQube token to another server.",
    );
  }

  let response: SonarResponse;
  try {
    response = await fetchImpl(requestUrl, {
      ...init,
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
    });
  } catch (error) {
    throw new SonarDiagnosticError(
      "infrastructure",
      `SonarQube request could not reach ${requestUrl.toString()}.`,
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
      `SonarQube request failed (${response.status} ${response.statusText}): ${requestUrl.toString()}`,
    );
  }

  if (response.status === 204 || !response.json) {
    return {} as T;
  }

  try {
    return (await response.json()) as T;
  } catch (error) {
    throw new SonarDiagnosticError(
      "api",
      `SonarQube returned invalid JSON for ${requestUrl.toString()}.`,
      { cause: error },
    );
  }
}

export function parseProperties(contents: string): Record<string, string> {
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

export function assertSameServer(
  configuredUrl: string,
  reportedUrl: string,
): void {
  if (new URL(configuredUrl).origin !== new URL(reportedUrl).origin) {
    throw new SonarDiagnosticError(
      "scanner",
      `Scanner reported an unexpected server (${reportedUrl}); refusing to send its token.`,
    );
  }
}

export function formatLocation(
  component: string | undefined,
  line: number | undefined,
  key: string,
): string {
  const prefix = `${key}:`;
  const path = component?.startsWith(prefix)
    ? component.slice(prefix.length)
    : component || key;
  return line ? `${path}:${line}` : path;
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

