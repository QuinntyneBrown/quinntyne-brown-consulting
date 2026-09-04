import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const workspace = fileURLToPath(new URL('..', import.meta.url));
const packageMetadata = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
);
const command = process.argv[2];

if (command !== 'build' && command !== 'serve') {
  throw new Error('Expected the Angular command to be either build or serve.');
}

function checkoutRevision() {
  const supplied = process.env.QBC_SOURCE_REVISION_ID?.trim();
  if (supplied) return supplied;

  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: workspace,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return null;
  }
}

const result = spawnSync(
  process.execPath,
  [
    fileURLToPath(new URL('../node_modules/@angular/cli/bin/ng.js', import.meta.url)),
    command,
    'qbc-workboard',
    '--define',
    `QBC_FRONTEND_VERSION=${JSON.stringify(packageMetadata.version)}`,
    '--define',
    `QBC_FRONTEND_COMMIT=${JSON.stringify(checkoutRevision())}`,
    ...process.argv.slice(3),
  ],
  { cwd: workspace, stdio: 'inherit' },
);

if (result.error) throw result.error;
process.exit(result.status ?? 1);
