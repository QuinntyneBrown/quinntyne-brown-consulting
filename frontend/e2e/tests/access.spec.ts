import { test } from '../fixtures/workboard.fixture';
import { UnlockPage } from '../pages/unlock.page';
import { WorkboardPage } from '../pages/workboard.page';
import { expectedFrontendBuild } from '../support/expected-frontend-build';

test.describe('workspace passcode gate', () => {
  test.use({ locked: true });

  test('a locked visitor is sent to the passcode page and can unlock from there', async ({
    page,
  }) => {
    const unlock = new UnlockPage(page);
    await unlock.openProtectedRoute('backlog');
    await unlock.expectPrompt();
    await unlock.enter('2846');
    await unlock.expectUnlockedWorkspace();
  });

  test('a wrong passcode is refused and the workspace stays closed', async ({ page }) => {
    const unlock = new UnlockPage(page);
    await unlock.open();
    await unlock.enter('1111');
    await unlock.expectRejection();
  });

  test('reports backend and frontend builds before and after unlock', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'Version label rendering is browser-independent.');
    const backend = 'Backend 1.4.2 · a1b2c3d';
    const unlock = new UnlockPage(page);
    await unlock.open();
    await unlock.expectBuildVersions(backend, expectedFrontendBuild);
    await unlock.enter('2846');
    await unlock.expectUnlockedWorkspace();
    await new WorkboardPage(page).expectBuildVersions(backend, expectedFrontendBuild);
  });

  test('the correct passcode opens the workspace from the root route', async ({ page }) => {
    const unlock = new UnlockPage(page);
    await unlock.open();
    await unlock.enter('2846');
    await unlock.expectUnlockedWorkspace();
  });
});
