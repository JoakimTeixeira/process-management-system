import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, join, relative } from 'node:path';
import process from 'node:process';

const appRoot = join(process.cwd(), 'src', 'app');
const componentFiles = [];

function collectTypeScriptFiles(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const entryPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      collectTypeScriptFiles(entryPath);
    } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.spec.ts')) {
      const source = readFileSync(entryPath, 'utf8');
      if (source.includes('@Component(')) {
        componentFiles.push({ path: entryPath, source });
      }
    }
  }
}

collectTypeScriptFiles(appRoot);

const errors = [];

for (const component of componentFiles) {
  const componentBase = component.path.slice(0, -'.ts'.length);
  const componentName = basename(componentBase);
  const displayPath = relative(process.cwd(), component.path).replaceAll('\\', '/');

  for (const companion of ['html', 'scss', 'spec.ts']) {
    const companionPath = `${componentBase}.${companion}`;
    if (!existsSync(companionPath)) {
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

if (errors.length > 0) {
  console.error('Component module audit failed:');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exitCode = 1;
} else {
  console.log(`Component module audit passed: ${componentFiles.length} complete modules.`);
}
