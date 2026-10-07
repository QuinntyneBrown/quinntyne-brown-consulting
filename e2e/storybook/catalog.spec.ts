import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';
import { managerTokens } from '../../frontend/projects/components/.storybook/theme';

type Entry = { id: string; title: string; name: string; type: 'story' | 'docs' };

const workspace = resolve(__dirname, '../../frontend');
const componentSource = resolve(workspace, 'projects/components/src');
const entries: Entry[] = Object.values(
  JSON.parse(readFileSync(resolve(workspace, 'dist/storybook/index.json'), 'utf8')).entries,
);

test('every public Angular component has a default example and API documentation', () => {
  const publicApi = readFileSync(resolve(componentSource, 'public-api.ts'), 'utf8');
  const modules = [...publicApi.matchAll(/export \* from '\.\/(lib\/[^']+)'/g)].map(
    ([, module]) => module,
  );
  for (const module of modules) {
    const source = readFileSync(resolve(componentSource, `${module}.ts`), 'utf8');
    if (!source.includes('@Component(')) continue;
    const component = source.match(/export class (\w+)Component\b/)?.[1];
    expect(component, module).toBeTruthy();
    const stories = entries.filter(
      (entry) => entry.title.replaceAll(' ', '') === `Components/${component}`,
    );
    expect(
      stories.some((entry) => entry.type === 'story' && entry.name === 'Default'),
      `${component} default`,
    ).toBe(true);
    expect(
      stories.some((entry) => entry.type === 'docs'),
      `${component} docs`,
    ).toBe(true);
  }
  for (const section of ['Concepts', 'Theme', 'Patterns']) {
    expect(
      entries.some((entry) => entry.title.startsWith(`${section}/`)),
      section,
    ).toBe(true);
  }
});

test('the manager theme mirrors the shipped tokens', () => {
  const styles = readFileSync(resolve(componentSource, 'styles.scss'), 'utf8').toLowerCase();
  for (const [name, value] of Object.entries(managerTokens)) {
    expect(styles, name).toContain(`: ${value.toLowerCase()};`);
  }
});

// Compile-time success does not prove Angular can instantiate a story. Visit every indexed example
// to catch template, provider and runtime failures.
for (const entry of entries) {
  test(`${entry.title}: ${entry.name}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    await page.goto(`/iframe.html?id=${entry.id}&viewMode=${entry.type}`, {
      waitUntil: 'domcontentloaded',
    });
    const root = page.locator(entry.type === 'docs' ? '#storybook-docs' : '#storybook-root');
    // Icon-only stories legitimately have no textContent.
    await expect(root.locator(':scope > *').first()).toBeAttached();
    await expect(page.locator('body')).toHaveClass(/sb-show-main/);
    await expect(page.locator('.sb-errordisplay')).not.toBeVisible();
    expect(errors).toEqual([]);
  });
}
