import { test as base } from '@playwright/test';
import { WorkboardApiMock } from '../mocks/workboard-api.mock';
import { seededWorkspace, type WorkspaceScenario } from '../mocks/workspace-scenarios';

const TOKEN_KEY = 'qbc.workboard.access-token';

interface WorkboardFixtures {
  readonly workboardApi: WorkboardApiMock;
  /** Start the browser without a workspace session, at the passcode page. */
  readonly locked: boolean;
  /** The workspace this scenario starts from, applied before the application loads. */
  readonly seed: WorkspaceScenario;
}

export const test = base.extend<WorkboardFixtures>({
  locked: [false, { option: true }],
  seed: [seededWorkspace, { option: true }],
  workboardApi: [
    async ({ page, locked, seed }, use, testInfo) => {
      const workboardApi = new WorkboardApiMock();
      workboardApi.seed(seed.apply);
      const pageErrors: string[] = [];
      page.on('pageerror', (error) => pageErrors.push(error.message));
      if (!locked) {
        await page.addInitScript(
          ([key, expiresAtUtc]) => {
            window.localStorage.setItem(
              key,
              JSON.stringify({ token: 'e2e-workspace-token', expiresAtUtc }),
            );
          },
          [TOKEN_KEY, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()] as const,
        );
      }
      await workboardApi.install(page);
      await use(workboardApi);
      if (testInfo.status === 'skipped') return;
      if (pageErrors.length > 0)
        throw new Error(`Unhandled browser page errors: ${pageErrors.join(', ')}`);
      if (workboardApi.requestCount === 0)
        throw new Error('The browser did not exercise the mocked API boundary.');
      if (workboardApi.unexpectedRequests.length > 0) {
        throw new Error(
          `Unhandled frontend API requests: ${workboardApi.unexpectedRequests.join(', ')}`,
        );
      }
    },
    { auto: true },
  ],
});
