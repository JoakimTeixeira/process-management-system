import { readFile, writeFile } from "node:fs/promises";
import { isAbsolute, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const repositoryRoot = resolve(import.meta.dirname, "..");
const defaultReports = [
  { reportPath: "api/coverage/lcov.info", sourceRoot: "api" },
  {
    reportPath: "web/backoffice/coverage/lcov.info",
    sourceRoot: "web/backoffice",
  },
  { reportPath: "web/public/coverage/lcov.info", sourceRoot: "web/public" },
  {
    reportPath: "scripts/coverage/lcov.info",
    sourceRoot: ".",
    sourceMarkerText: "scripts/",
  },
];

export function normalizeLcov(
  content,
  sourceRoot,
  root = repositoryRoot,
  sourceMarkerText = "src/",
) {
  const absoluteSourceRoot = resolve(root, sourceRoot);
  const records = content.split(/end_of_record\s*/u);
  const normalizedRecords = [];

  for (const record of records) {
    const trimmedRecord = record.trim();
    if (!trimmedRecord) {
      continue;
    }

    const lines = trimmedRecord.split(/\r?\n/u);
    const sourceIndex = lines.findIndex((line) => line.startsWith("SF:"));
    if (sourceIndex === -1) {
      continue;
    }

    const sourcePath = lines[sourceIndex].slice(3).replaceAll("\\", "/");
    const sourceMarker = sourcePath.indexOf(sourceMarkerText);
    if (sourceMarker === -1) {
      continue;
    }

    const relativeSource = sourcePath.slice(sourceMarker);
    const absoluteSource = resolve(absoluteSourceRoot, relativeSource);
    const sourceRootRelativePath = relative(absoluteSourceRoot, absoluteSource);
    if (
      !sourceRootRelativePath ||
      sourceRootRelativePath.startsWith("..") ||
      isAbsolute(sourceRootRelativePath)
    ) {
      continue;
    }

    lines[sourceIndex] = `SF:${absoluteSource.replaceAll("\\", "/")}`;
    normalizedRecords.push(`${lines.join("\n")}\nend_of_record`);
  }

  return `${normalizedRecords.join("\n")}\n`;
}

export async function normalizeCoverageReports(
  reports = defaultReports,
  root = repositoryRoot,
) {
  for (const entry of reports) {
    const { reportPath, sourceRoot, sourceMarkerText } = Array.isArray(entry)
      ? {
          reportPath: entry[0],
          sourceRoot: entry[1],
          sourceMarkerText: entry[2],
        }
      : entry;
    const absoluteReportPath = resolve(root, reportPath);
    const content = await readFile(absoluteReportPath, "utf8");
    const normalized = normalizeLcov(
      content,
      sourceRoot,
      root,
      sourceMarkerText,
    );
    await writeFile(absoluteReportPath, normalized, "utf8");
    console.log(`[coverage] Normalized ${reportPath}`);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await normalizeCoverageReports();
}
