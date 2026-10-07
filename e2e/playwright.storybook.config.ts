import { defineConfig, devices } from '@playwright/test';

/**
 * The Storybook catalog suite runs against the static build in `frontend/dist/storybook`, so what
 * it proves is what deploys; `npm run build-storybook` in `frontend` produces it first.
 */
export default defineConfig({
  testDir: './storybook',
  fullyParallel: true,
  forbidOnly: Boolean(process.env['CI']),
  workers: 4,
  retries: 0,
  reporter: 'list',
  expect: { timeout: 10_000 },
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://127.0.0.1:6006',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npx http-server dist/storybook -a 127.0.0.1 -p 6006 -c-1 --silent',
    cwd: '../frontend',
    url: 'http://127.0.0.1:6006/index.json',
    reuseExistingServer: false,
  },
});
