import { test } from '../fixtures/workboard.fixture';
import { throttledUnlock } from '../mocks/workspace-scenarios';
import { BacklogPage } from '../pages/backlog.page';
import { StoragePage } from '../pages/storage.page';
import { UnlockPage } from '../pages/unlock.page';
import { WorkboardPage } from '../pages/workboard.page';

test.describe('a visitor holding no workspace session', () => {
  test.use({ locked: true });

  test('L2-043 · Send a locked visitor to the passcode screen', async ({ page, workboardApi }) => {
    const unlock = new UnlockPage(page);
    await unlock.openProtectedRoute('backlog');
    await unlock.expectPrompt();
    await unlock.expectNoWorkspaceChrome();

    // Only the credential-free version resource may be read before the passcode is accepted.
    unlock.expectNoWorkspaceDataRequested(workboardApi.gatedRequests);
  });

  test('L2-043 · Enter the passcode', { tag: '@smoke' }, async ({ page }) => {
    const unlock = new UnlockPage(page);
    await unlock.open();
    // Typing the last digit is the whole action: nothing else is pressed.
    await unlock.enter('2846');
    await unlock.expectConfirmationBeforeWorkspace();
  });

  test('L2-043 · Report a refused passcode', async ({ page }) => {
    const unlock = new UnlockPage(page);
    await unlock.open();
    await unlock.enter('1111');
    await unlock.expectRejection();
    await unlock.expectRefusalAnnouncedAndFieldReady();

    // The field is ready for another attempt without touching a pointer.
    await unlock.enter('2846');
    await unlock.expectUnlockedWorkspace();
  });

  test.describe(throttledUnlock.name, () => {
    test.use({ seed: throttledUnlock });

    test('L2-042 · Throttle repeated attempts', async ({ page }) => {
      const unlock = new UnlockPage(page);
      await unlock.open();
      await unlock.enter('2846');
      await unlock.expectThrottled();
    });
  });
});

test('L2-043 · Return to the passcode screen when a session ends', async ({
  page,
  workboardApi,
}) => {
  const workboard = new WorkboardPage(page);
  const storage = new StoragePage(page);
  const unlock = new UnlockPage(page);

  await workboard.navigateTo('backlog');
  await new BacklogPage(page).expectStory('Create an AI engagement risk canvas');

  // The server stops honouring the credential the browser is holding.
  workboardApi.expireSession();
  await workboard.selectNavigation('Board');

  await unlock.expectPrompt();
  await storage.expectNoCredentialHeld();
});
