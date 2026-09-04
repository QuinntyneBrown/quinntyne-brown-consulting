import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const commitLength = 7;
const packageMetadata = JSON.parse(readFileSync('package.json', 'utf8')) as { version: string };

function revision(): string | null {
  const supplied = process.env['QBC_SOURCE_REVISION_ID']?.trim();
  if (supplied) return supplied;

  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return null;
  }
}

const commit = revision();
const suffix = commit ? ` · ${commit.slice(0, commitLength)}` : '';

/** Expected identity compiled into the Angular development build exercised by Playwright. */
export const expectedFrontendBuild = `Frontend ${packageMetadata.version}${suffix}`;
