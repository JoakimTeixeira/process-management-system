import { readFile } from "node:fs/promises";
import { scan } from "@sonar/scan";

const defaultProjectKey = "process-management-system";
const serverUrl = (process.env.SONAR_HOST_URL ?? "http://localhost:9000")
  .trim()
  .replace(/\/+$/, "");
const token = process.env.SONAR_TOKEN?.trim();
const projectKey = process.env.SONAR_PROJECT_KEY?.trim() || defaultProjectKey;
const organization = process.env.SONAR_ORGANIZATION?.trim();

if (!token) {
  console.error(
    "[sonar] SONAR_TOKEN is required. Generate a SonarQube user token, set " +
      "SONAR_HOST_URL when the server is not http://localhost:9000, and rerun diagnostics.",
  );
  process.exit(1);
}

const options = {
  "sonar.projectKey": projectKey,
};

if (organization) {
  options["sonar.organization"] = organization;
}

console.log(`[sonar] Scanning ${projectKey} with ${serverUrl}`);
await scan({ serverUrl, token, options });

const report = parseProperties(
  await readFile(".scannerwork/report-task.txt", "utf8"),
);
const reportServerUrl = (report.serverUrl || serverUrl).replace(/\/+$/, "");

assertSameServer(serverUrl, reportServerUrl);

const task = await waitForComputeTask(report.ceTaskUrl, reportServerUrl, token);
const issues = await fetchPages(
  reportServerUrl,
  token,
  "api/issues/search",
  "issues",
  { componentKeys: projectKey, resolved: "false" },
);
const hotspots = await fetchPages(
  reportServerUrl,
  token,
  "api/hotspots/search",
  "hotspots",
  { projectKey, status: "TO_REVIEW" },
);
const qualityGate = await sonarRequest(
  reportServerUrl,
  token,
  `api/qualitygates/project_status?analysisId=${encodeURIComponent(task.analysisId)}`,
);

printIssues(issues, projectKey);
printHotspots(hotspots, projectKey);

const gateStatus = qualityGate.projectStatus?.status ?? "UNKNOWN";
console.log(`[sonar] Quality gate: ${gateStatus}`);
console.log(`[sonar] Dashboard: ${report.dashboardUrl}`);

if (issues.length > 0 || hotspots.length > 0 || gateStatus !== "OK") {
  console.error(
    `[sonar] Failed with ${issues.length} unresolved issue(s), ` +
      `${hotspots.length} unreviewed hotspot(s), and quality gate ${gateStatus}.`,
  );
  process.exitCode = 1;
} else {
  console.log("[sonar] No unresolved issues or unreviewed hotspots.");
}

function parseProperties(contents) {
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

function assertSameServer(configuredUrl, reportedUrl) {
  if (new URL(configuredUrl).origin !== new URL(reportedUrl).origin) {
    throw new Error(
      `Scanner reported an unexpected server (${reportedUrl}); refusing to send its token.`,
    );
  }
}

async function waitForComputeTask(taskUrl, baseUrl, authToken) {
  const url = new URL(taskUrl);

  if (url.origin !== new URL(baseUrl).origin) {
    throw new Error(
      "Scanner compute-task URL does not match the configured server.",
    );
  }

  for (let attempt = 0; attempt < 60; attempt += 1) {
    const response = await sonarRequest(baseUrl, authToken, url.toString());
    const { task } = response;

    if (task.status === "SUCCESS") {
      return task;
    }

    if (task.status === "FAILED" || task.status === "CANCELED") {
      throw new Error(
        `SonarQube analysis ${task.status.toLowerCase()}: ${task.errorMessage ?? "unknown error"}`,
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 2_000));
  }

  throw new Error("Timed out waiting for SonarQube to process the analysis.");
}

async function fetchPages(baseUrl, authToken, endpoint, resultKey, parameters) {
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
    );
    const pageResults = response[resultKey] ?? [];
    results.push(...pageResults);

    const total = response.paging?.total ?? response.total ?? results.length;
    if (results.length >= total || pageResults.length === 0) {
      return results;
    }
  }
}

async function sonarRequest(baseUrl, authToken, path) {
  const requestUrl = new URL(path, `${baseUrl}/`);

  if (requestUrl.origin !== new URL(baseUrl).origin) {
    throw new Error("Refusing to send the SonarQube token to another server.");
  }

  const response = await fetch(requestUrl, {
    headers: { Authorization: `Bearer ${authToken}` },
  });

  if (!response.ok) {
    throw new Error(
      `SonarQube request failed (${response.status} ${response.statusText}): ${requestUrl}`,
    );
  }

  return response.json();
}

function printIssues(issues, key) {
  for (const issue of issues) {
    const location = formatLocation(issue.component, issue.line, key);
    console.error(
      `${location} [SonarQube ${issue.severity ?? "ISSUE"} ${issue.rule}] ${issue.message}`,
    );
  }
}

function printHotspots(hotspots, key) {
  for (const hotspot of hotspots) {
    const location = formatLocation(hotspot.component, hotspot.line, key);
    console.error(
      `${location} [SonarQube HOTSPOT ${hotspot.ruleKey}] ${hotspot.message}`,
    );
  }
}

function formatLocation(component, line, key) {
  const prefix = `${key}:`;
  const path = component?.startsWith(prefix)
    ? component.slice(prefix.length)
    : component || key;
  return line ? `${path}:${line}` : path;
}
