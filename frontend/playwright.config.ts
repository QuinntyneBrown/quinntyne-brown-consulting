import { defineConfig, devices } from '@playwright/test';

/**
 * The acceptance suite runs against the Angular application and a per-test mock of the `/api`
 * contract, so no backend process or database takes part. Every scenario owns its workspace state,
 * which lets the suite run in parallel. Chromium carries the full requirement coverage; the other
 * engines run the `@smoke` subset that proves the product works in each of them.
 */
export default defineConfig({
  testDir: './e2e/tests',
  timeout: 45_000,
  expect: { timeout: 8_000 },
  fullyParallel: true,
  workers: 4,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4200',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm start -- --host 127.0.0.1 --port 4200',
    url: 'http://127.0.0.1:4200/board',
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', grep: /@smoke/, use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', grep: /@smoke/, use: { ...devices['Desktop Safari'] } },
  ],
});
