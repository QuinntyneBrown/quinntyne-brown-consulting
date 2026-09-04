import { defineConfig, devices } from '@playwright/test';

/**
 * The acceptance suite runs against the built application and a per-test mock of the `/api`
 * contract, so no backend process or database takes part. Every scenario owns its workspace state,
 * which lets the suite run in parallel. The suite reads the bundle that gets deployed rather than
 * the development server, so what it proves is what ships; `npm run build` produces it first.
 */
export default defineConfig({
  testDir: './e2e/tests',
  timeout: 45_000,
  expect: { timeout: 8_000 },
  fullyParallel: true,
  // A stray `test.only` would otherwise green the suite and ship.
  forbidOnly: Boolean(process.env['CI']),
  workers: 4,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4200',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run serve:dist',
    url: 'http://127.0.0.1:4200/board',
    reuseExistingServer: false,
    timeout: 30_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
