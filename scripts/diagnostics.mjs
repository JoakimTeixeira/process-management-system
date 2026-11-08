import { spawnSync } from 'node:child_process';

const npmCli = process.env.npm_execpath;

if (!npmCli) {
  throw new Error('Run diagnostics through npm so npm_execpath is available.');
}
const checks = [
  ['API ESLint and SonarJS', 'lint:check', 'api'],
  ['Public ESLint and SonarJS', 'lint:check', 'web/public'],
  ['Backoffice ESLint and SonarJS', 'lint:check', 'web/backoffice'],
  ['API TypeScript', 'typecheck', 'api'],
  ['Public TypeScript', 'typecheck', 'web/public'],
  ['Backoffice TypeScript', 'typecheck', 'web/backoffice'],
  ['Backoffice component modules', 'check:component-modules', 'web/backoffice'],
];

const failures = [];

for (const [name, script, prefix] of checks) {
  console.log(`\n[diagnostics] ${name}`);

  const result = spawnSync(
    process.execPath,
    [npmCli, 'run', script, '--prefix', prefix],
    { stdio: 'inherit' },
  );

  if (result.error) {
    console.error(`[diagnostics] ${name} could not start: ${result.error.message}`);
    failures.push(name);
    continue;
  }

  if (result.status !== 0) {
    failures.push(name);
  }
}

if (failures.length > 0) {
  console.error(`\n[diagnostics] Failed checks: ${failures.join(', ')}`);
  process.exitCode = 1;
} else {
  console.log('\n[diagnostics] All TypeScript, ESLint, SonarJS, and module checks passed.');
}
