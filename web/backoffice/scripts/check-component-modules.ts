import { existsSync, readdirSync, readFileSync, type Dirent } from 'node:fs';
import { basename, join, relative } from 'node:path';
import process from 'node:process';

export interface ComponentFileEntry {
  path: string;
  source: string;
}

export interface ComponentAuditFileSystem {
  existsSync: (path: string) => boolean;
  readdirSync: (
    path: string,
    options: { withFileTypes: true },
  ) => readonly Pick<Dirent, 'name' | 'isDirectory'>[];
  readFileSync: (path: string, encoding: BufferEncoding) => string;
}

export interface ComponentAuditLogger {
  log: (message: string) => void;
  error: (message: string) => void;
}

const defaultFs: ComponentAuditFileSystem = {
  existsSync,
  readdirSync: (directory, options) => readdirSync(directory, options),
  readFileSync: (filePath, encoding) => readFileSync(filePath, encoding),
};

export function collectComponentFiles(
  directory: string,
  fsImpl: ComponentAuditFileSystem = defaultFs,
): ComponentFileEntry[] {
  const componentFiles: ComponentFileEntry[] = [];

  function visit(currentDirectory: string): void {
    for (const entry of fsImpl.readdirSync(currentDirectory, { withFileTypes: true })) {
      const entryPath = join(currentDirectory, entry.name);

      if (entry.isDirectory()) {
        visit(entryPath);
      } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.spec.ts')) {
        const source = fsImpl.readFileSync(entryPath, 'utf8');
        if (source.includes('@Component(')) {
          componentFiles.push({ path: entryPath, source });
        }
      }
    }
  }

  visit(directory);
  return componentFiles;
}

export function auditComponentModules({
  workingDirectory = process.cwd(),
  fsImpl = defaultFs,
}: {
  workingDirectory?: string;
  fsImpl?: ComponentAuditFileSystem;
} = {}): { componentCount: number; errors: string[] } {
  const appRoot = join(workingDirectory, 'src', 'app');
  const componentFiles = collectComponentFiles(appRoot, fsImpl);
  const errors: string[] = [];

  for (const component of componentFiles) {
    const componentBase = component.path.slice(0, -'.ts'.length);
    const componentName = basename(componentBase);
    const displayPath = relative(workingDirectory, component.path).replaceAll('\\', '/');

    for (const companion of ['html', 'scss', 'spec.ts']) {
      const companionPath = `${componentBase}.${companion}`;
      if (!fsImpl.existsSync(companionPath)) {
        errors.push(`${displayPath}: missing ${basename(companionPath)}`);
      }
    }

    if (/\btemplate\s*:/.test(component.source)) {
      errors.push(`${displayPath}: inline template metadata is not allowed`);
    }

    if (/\bstyles?\s*:/.test(component.source)) {
      errors.push(`${displayPath}: inline style metadata is not allowed`);
    }

    if (!component.source.includes(`templateUrl: './${componentName}.html'`)) {
      errors.push(`${displayPath}: templateUrl must target ./${componentName}.html`);
    }

    if (!component.source.includes(`styleUrl: './${componentName}.scss'`)) {
      errors.push(`${displayPath}: styleUrl must target ./${componentName}.scss`);
    }
  }

  return { componentCount: componentFiles.length, errors };
}

export function runComponentModuleAudit({
  workingDirectory = process.cwd(),
  fsImpl = defaultFs,
  logger = console,
}: {
  workingDirectory?: string;
  fsImpl?: ComponentAuditFileSystem;
  logger?: ComponentAuditLogger;
} = {}): boolean {
  const { componentCount, errors } = auditComponentModules({
    workingDirectory,
    fsImpl,
  });

  if (errors.length > 0) {
    logger.error('Component module audit failed:');
    for (const error of errors) {
      logger.error(`- ${error}`);
    }
    process.exitCode = 1;
    return false;
  }

  logger.log(`Component module audit passed: ${componentCount} complete modules.`);
  return true;
}

if (basename(process.argv[1] ?? '') === 'check-component-modules.ts') {
  runComponentModuleAudit();
}

