import { test } from '../fixtures/workboard.fixture';
import { unreachableVersionResource } from '../mocks/workspace-scenarios';
import { BoardPage } from '../pages/board.page';
import { UnlockPage } from '../pages/unlock.page';
import { WorkboardPage } from '../pages/workboard.page';
import { expectedFrontendBuild } from '../support/expected-frontend-build';

/** The build the mocked contract reports, with its commit shortened for reading. */
const BACKEND_BUILD = 'Backend 1.4.2 · a1b2c3d';

test('L2-045 · Read the deployed builds from the workspace', async ({ page }) => {
  const workboard = new WorkboardPage(page);
  for (const route of ['board', 'backlog', 'initiatives', 'assistants'] as const) {
    await workboard.navigateTo(route);
    await workboard.expectBuildVersions(BACKEND_BUILD, expectedFrontendBuild);
  }
});

test.describe('a visitor who has not unlocked the workspace', () => {
  test.use({ locked: true });

  test('L2-045 · Read the deployed build while locked out', async ({ page }) => {
    const unlock = new UnlockPage(page);
    await unlock.open();
    await unlock.expectBuildVersions(BACKEND_BUILD, expectedFrontendBuild);
  });
});

test.describe(unreachableVersionResource.name, () => {
  test.use({ seed: unreachableVersionResource });

  test('L2-045 · Keep the workspace usable when the backend build is unknown', async ({ page }) => {
    const workboard = new WorkboardPage(page);
    await workboard.navigateTo('board');

    await workboard.expectNoBackendBuildVersion();
    await workboard.expectBuildVersions(expectedFrontendBuild);
    await workboard.expectNoErrorPresented();

    // Everything else still works.
    const board = new BoardPage(page);
    await board.expectActiveSprint();
    await board.moveStoryForward('Capture a client decision');
    await board.expectStoryInColumn('Capture a client decision', 'In progress');
  });
});

test.describe('a locked visitor whose backend build cannot be read', () => {
  test.use({ locked: true, seed: unreachableVersionResource });

  test('L2-045 · Keep the passcode screen usable when the backend build is unknown', async ({
    page,
  }) => {
    const unlock = new UnlockPage(page);
    await unlock.open();
    await unlock.expectNoBackendBuildVersion();
    await unlock.expectBuildVersions(expectedFrontendBuild);
    await unlock.expectNoErrorPresented();
    await unlock.enter('2846');
    await unlock.expectUnlockedWorkspace();
  });
});
