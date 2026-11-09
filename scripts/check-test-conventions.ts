import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

export interface TestTitleViolation {
  file: string;
  line: number;
  title: string;
  insertOffset: number;
  contentEndOffset: number;
}

const repositoryRoot = process.cwd();
const defaultRoots = [
  "api/src",
  "api/test",
  "web/public/src",
  "web/backoffice/src",
  "scripts",
  "e2e",
];

function testApiRoot(expression: ts.Expression): string | undefined {
  if (ts.isIdentifier(expression)) {
    return expression.text;
  }
  if (ts.isPropertyAccessExpression(expression)) {
    return testApiRoot(expression.expression);
  }
  if (ts.isElementAccessExpression(expression)) {
    return testApiRoot(expression.expression);
  }
  if (ts.isCallExpression(expression)) {
    return testApiRoot(expression.expression);
  }
  return undefined;
}

export function findTestTitleViolations(
  sourceText: string,
  file = "fixture.test.ts",
): TestTitleViolation[] {
  const sourceFile = ts.createSourceFile(
    file,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const violations: TestTitleViolation[] = [];

  function visit(node: ts.Node): void {
    if (ts.isCallExpression(node)) {
      const root = testApiRoot(node.expression);
      const title = node.arguments[0];
      if (
        (root === "it" || root === "test") &&
        title &&
        (ts.isStringLiteral(title) || ts.isNoSubstitutionTemplateLiteral(title)) &&
        !title.text.startsWith("should ")
      ) {
        const { line } = sourceFile.getLineAndCharacterOfPosition(title.getStart(sourceFile));
        violations.push({
          file,
          line: line + 1,
          title: title.text,
          insertOffset: title.getStart(sourceFile) + 1,
          contentEndOffset: title.end - 1,
        });
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return violations;
}

export function fixTestTitles(sourceText: string, file?: string): string {
  const violations = [...findTestTitleViolations(sourceText, file)].sort(
    (left, right) => right.insertOffset - left.insertOffset,
  );
  let fixed = sourceText;
  for (const violation of violations) {
    const normalizedTitle = normalizeTestTitle(violation.title);
    fixed = `${fixed.slice(0, violation.insertOffset)}${normalizedTitle}${fixed.slice(violation.contentEndOffset)}`;
  }
  return fixed;
}

function normalizeTestTitle(title: string): string {
  if (title.startsWith("does not ")) {
    return `should not ${title.slice("does not ".length)}`;
  }
  if (title.startsWith("is ")) {
    return `should be ${title.slice("is ".length)}`;
  }

  const firstSpace = title.indexOf(" ");
  const firstToken = firstSpace === -1 ? title : title.slice(0, firstSpace);
  const remainder = firstSpace === -1 ? "" : title.slice(firstSpace);
  const [, firstWord = firstToken, punctuation = ""] =
    /^([a-z]+)([^a-z]*)$/u.exec(firstToken) ?? [];
  let baseForm = firstWord;

  if (/^[a-z]+ies$/u.test(firstWord)) {
    baseForm = `${firstWord.slice(0, -3)}y`;
  } else if (/^[a-z]+(?:sses|shes|ches|xes|oes)$/u.test(firstWord)) {
    baseForm = firstWord.slice(0, -2);
  } else if (/^[a-z]+s$/u.test(firstWord) && !firstWord.endsWith("ss")) {
    baseForm = firstWord.slice(0, -1);
  }

  return `should ${baseForm}${punctuation}${remainder}`;
}

async function collectTestFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectTestFiles(entryPath)));
    } else if (/\.(?:spec|test)\.ts$/u.test(entry.name)) {
      files.push(entryPath);
    }
  }
  return files;
}

export async function runTestConventionAudit({
  fix = false,
  logger = console,
  root = repositoryRoot,
  roots = defaultRoots,
}: {
  fix?: boolean;
  logger?: { log: (message: string) => void; error: (message: string) => void };
  root?: string;
  roots?: readonly string[];
} = {}): Promise<{ checkedFiles: number; violations: TestTitleViolation[] }> {
  const files = (
    await Promise.all(roots.map((directory) => collectTestFiles(path.resolve(root, directory))))
  )
    .flat()
    .sort();
  const violations: TestTitleViolation[] = [];

  for (const file of files) {
    const sourceText = await readFile(file, "utf8");
    const fileViolations = findTestTitleViolations(sourceText, path.relative(root, file));
    if (fix && fileViolations.length > 0) {
      await writeFile(file, fixTestTitles(sourceText, file), "utf8");
    }
    violations.push(...fileViolations);
  }

  if (fix) {
    logger.log(
      `[test-conventions] Updated ${violations.length} title(s) across ${files.length} test files.`,
    );
    return { checkedFiles: files.length, violations: [] };
  }

  for (const violation of violations) {
    logger.error(
      `${violation.file}:${violation.line} [test-conventions] Title must start with "should ": ${violation.title}`,
    );
  }
  if (violations.length > 0) {
    process.exitCode = 1;
  } else {
    logger.log(
      `[test-conventions] Checked ${files.length} files; all static test titles passed.`,
    );
  }
  return { checkedFiles: files.length, violations };
}

if (path.basename(process.argv[1] ?? "") === "check-test-conventions.ts") {
  void runTestConventionAudit({ fix: process.argv.includes("--fix") });
}
