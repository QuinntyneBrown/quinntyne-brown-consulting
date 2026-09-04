import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/version-tests',
  timeout: 45_000,
  expect: { timeout: 8_000 },
  workers: 1,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report/version' }]],
  use: {
    baseURL: 'http://127.0.0.1:5051',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'dotnet ../artifacts/publish/Qbc.Workboard.Api.dll --urls http://127.0.0.1:5051',
    url: 'http://127.0.0.1:5051/api/version',
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
