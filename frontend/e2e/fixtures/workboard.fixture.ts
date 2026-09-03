import { test as base } from '@playwright/test';
import { WorkboardApiMock } from '../mocks/workboard-api.mock';

interface WorkboardFixtures {
  readonly workboardApi: WorkboardApiMock;
}

export const test = base.extend<WorkboardFixtures>({
  workboardApi: [async ({ page }, use, testInfo) => {
    const workboardApi = new WorkboardApiMock();
    await workboardApi.install(page);
    await use(workboardApi);
    if (testInfo.status === 'skipped') return;
    if (workboardApi.requestCount === 0) throw new Error('The browser did not exercise the mocked API boundary.');
    if (workboardApi.unexpectedRequests.length > 0) {
      throw new Error(`Unhandled frontend API requests: ${workboardApi.unexpectedRequests.join(', ')}`);
    }
  }, { auto: true }]
});
