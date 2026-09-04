import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import type { DeploymentVersion } from '@qbc/api';

const commitLength = 7;
const frontendPackage = JSON.parse(readFileSync('package.json', 'utf8')) as { version: string };
const backendProperties = readFileSync('../backend/Directory.Build.props', 'utf8');
const backendVersion = /<Version>([^<]+)<\/Version>/.exec(backendProperties)?.[1];

if (!backendVersion) throw new Error('Backend Version was not found in Directory.Build.props.');

function expectedRevision(): string | null {
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

function label(name: string, version: string, commit: string | null): string {
  const revision = commit ? ` · ${commit.slice(0, commitLength)}` : '';
  return `${name} ${version}${revision}`;
}

test('the published UI reports its real backend and frontend builds', async ({ page, request }) => {
  const revision = expectedRevision();
  const response = await request.get('/api/version');
  expect(response.ok()).toBe(true);
  const backend = (await response.json()) as DeploymentVersion;
  expect(backend).toEqual({ version: backendVersion, commit: revision });

  const backendLabel = label('Backend', backendVersion, revision);
  const frontendLabel = label('Frontend', frontendPackage.version, revision);

  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Enter your passcode' })).toBeVisible();
  await expect(page.getByLabel('Build versions')).toContainText(backendLabel);
  await expect(page.getByLabel('Build versions')).toContainText(frontendLabel);

  await page.getByLabel('Workspace passcode').fill('2846');
  await expect(page.getByRole('heading', { level: 1, name: 'Sprint board' })).toBeVisible();
  await expect(page.locator('qbc-sidebar')).toContainText(backendLabel);
  await expect(page.locator('qbc-sidebar')).toContainText(frontendLabel);
});
