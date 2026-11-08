import { readFile, writeFile } from "node:fs/promises";
import { basename, isAbsolute, relative, resolve } from "node:path";

export interface CoverageReportConfig {
  reportPath: string;
  sourceRoot: string;
  sourceMarkerText?: string;
}

const repositoryRoot = process.cwd();
const defaultReports: readonly CoverageReportConfig[] = [
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
  content: string,
  sourceRoot: string,
  root: string = repositoryRoot,
  sourceMarkerText = "src/",
): string {
  const absoluteSourceRoot = resolve(root, sourceRoot);
  const records = content.split(/end_of_record\s*/u);
  const normalizedRecords: string[] = [];

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
  reports: readonly CoverageReportConfig[] = defaultReports,
  root: string = repositoryRoot,
): Promise<void> {
  for (const { reportPath, sourceRoot, sourceMarkerText } of reports) {
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

if (basename(process.argv[1] ?? "") === "normalize-lcov.ts") {
  void normalizeCoverageReports();
}

