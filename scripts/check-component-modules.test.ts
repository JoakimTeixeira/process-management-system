import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import {
  auditComponentModules,
  runComponentModuleAudit,
  type ComponentAuditFileSystem,
} from "../web/backoffice/scripts/check-component-modules.ts";

function createMockComponentFs(
  files: Record<string, string>,
  directories: Record<string, { name: string; isDirectory: boolean }[]>,
): ComponentAuditFileSystem {
  const normalizedFiles = new Map(
    Object.entries(files).map(([key, value]) => [
      key.replaceAll("\\", "/"),
      value,
    ]),
  );
  const normalizedDirs = new Map(
    Object.entries(directories).map(([key, value]) => [
      key.replaceAll("\\", "/"),
      value,
    ]),
  );

  return {
    existsSync: (filePath) =>
      normalizedFiles.has(filePath.replaceAll("\\", "/")),
    readdirSync: (dirPath) => {
      const entries =
        normalizedDirs.get(dirPath.replaceAll("\\", "/")) ?? [];
      return entries.map((entry) => ({
        name: entry.name,
        isDirectory: () => entry.isDirectory,
      }));
    },
    readFileSync: (filePath) => {
      const content = normalizedFiles.get(filePath.replaceAll("\\", "/"));
      if (content === undefined) {
        throw new Error(`Missing file: ${filePath}`);
      }
      return content;
    },
  };
}

void test("runComponentModuleAudit passes when all component modules have external companions", () => {
  const root = "/workspace/web/backoffice";
  const appDir = join(root, "src", "app");
  const compBase = join(appDir, "example.component");
  const fs = createMockComponentFs(
    {
      [`${compBase}.ts`]: [
        "@Component({",
        "  selector: 'app-example',",
        "  templateUrl: './example.component.html',",
        "  styleUrl: './example.component.scss',",
        "})",
        "export class ExampleComponent {}",
      ].join("\n"),
      [`${compBase}.html`]: "<div></div>",
      [`${compBase}.scss`]: ":host {}",
      [`${compBase}.spec.ts`]: "describe('ExampleComponent', () => {});",
    },
    {
      [appDir]: [
        { name: "example.component.ts", isDirectory: false },
        { name: "example.component.spec.ts", isDirectory: false },
      ],
    },
  );

  const logs: string[] = [];
  const passed = runComponentModuleAudit({
    workingDirectory: root,
    fsImpl: fs,
    logger: {
      log: (msg) => logs.push(msg),
      error: (msg) => logs.push(msg),
    },
  });

  assert.equal(passed, true);
  assert.ok(
    logs.some((msg) =>
      msg.includes("Component module audit passed: 1 complete modules."),
    ),
  );
});

void test("auditComponentModules reports missing companion files and inline metadata violations", () => {
  const root = "/workspace/web/backoffice";
  const appDir = join(root, "src", "app");
  const nestedDir = join(appDir, "features");
  const brokenBase = join(nestedDir, "broken.component");
  const fs = createMockComponentFs(
    {
      [`${brokenBase}.ts`]: [
        "@Component({",
        "  template: '<p>inline</p>',",
        "  styles: ['p {}'],",
        "})",
        "export class BrokenComponent {}",
      ].join("\n"),
    },
    {
      [appDir]: [{ name: "features", isDirectory: true }],
      [nestedDir]: [{ name: "broken.component.ts", isDirectory: false }],
    },
  );

  const { componentCount, errors } = auditComponentModules({
    workingDirectory: root,
    fsImpl: fs,
  });

  assert.equal(componentCount, 1);
  assert.equal(errors.length, 7);
  assert.ok(errors.some((err) => err.includes("missing broken.component.html")));
  assert.ok(errors.some((err) => err.includes("missing broken.component.scss")));
  assert.ok(
    errors.some((err) => err.includes("missing broken.component.spec.ts")),
  );
  assert.ok(
    errors.some((err) =>
      err.includes("inline template metadata is not allowed"),
    ),
  );
  assert.ok(
    errors.some((err) => err.includes("inline style metadata is not allowed")),
  );

  const errorLogs: string[] = [];
  const passed = runComponentModuleAudit({
    workingDirectory: root,
    fsImpl: fs,
    logger: {
      log: () => {},
      error: (msg) => errorLogs.push(msg),
    },
  });
  process.exitCode = 0;

  assert.equal(passed, false);
  assert.ok(
    errorLogs.some((msg) => msg.includes("Component module audit failed:")),
  );
});

