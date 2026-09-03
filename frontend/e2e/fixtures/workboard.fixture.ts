import { test as base } from '@playwright/test';
import { WorkboardApiMock } from '../mocks/workboard-api.mock';

interface WorkboardFixtures {
  readonly workboardApi: WorkboardApiMock;
}

export const test = base.extend<WorkboardFixtures>({
  workboardApi: [
    async ({ page }, use, testInfo) => {
      const workboardApi = new WorkboardApiMock();
      const pageErrors: string[] = [];
      page.on('pageerror', (error) => pageErrors.push(error.message));
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
