import { test } from '../fixtures/workboard.fixture';
import { AssistantHoursPage } from '../pages/assistant-hours.page';
import { AttachmentsPage } from '../pages/attachments.page';
import { BacklogPage } from '../pages/backlog.page';
import { BoardPage } from '../pages/board.page';
import { StoryEditorPage } from '../pages/story-editor.page';
import { WorkboardPage, type WorkspaceRoute } from '../pages/workboard.page';

const ROUTES: readonly WorkspaceRoute[] = ['board', 'backlog', 'initiatives', 'assistants'];

test.describe('a phone-sized viewport', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('L2-024 · Use the product on a narrow viewport', async ({ page }) => {
    const workboard = new WorkboardPage(page);
    const board = new BoardPage(page);
    const backlog = new BacklogPage(page);

    await workboard.navigateTo('board');
    await workboard.expectCompactMenu();
    await board.expectSingleColumnLayout();
    await workboard.expectContentWithinViewport();

    await workboard.useCompactMenu('Backlog');
    await backlog.expectSingleColumnRows();
    await workboard.expectContentWithinViewport();

    // A form opened on a phone keeps its actions reachable.
    await workboard.openNewStory();
    await workboard.expectDialogActionsWithinViewport('New story');
    await new StoryEditorPage(page).close();
  });
});

test.describe('a desktop viewport', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('L2-024 · Use the product on a wide viewport', async ({ page }) => {
    const workboard = new WorkboardPage(page);
    await workboard.navigateTo('board');
    await workboard.expectPersistentNavigation();
    await new BoardPage(page).expectThreeColumnLayout();
    await workboard.expectNoHorizontalOverflow();
  });
});

test.describe('a touch device', () => {
  test.use({ viewport: { width: 768, height: 1024 }, hasTouch: true });

  test('L2-024 · Use touch controls', async ({ page, browserName }) => {
    test.skip(browserName === 'firefox', 'Firefox does not emulate touch input.');
    const workboard = new WorkboardPage(page);
    const board = new BoardPage(page);

    // The whole movement workflow completes with taps: no hover, no drag.
    await workboard.navigateTo('board');
    await workboard.expectCompactMenu();
    await board.tapStoryForward('Capture a client decision');
    await board.expectStoryInColumn('Capture a client decision', 'In progress');
    await workboard.useCompactMenu('Backlog');
  });
});

for (const width of [320, 390, 768, 1024, 1440]) {
  test.describe(`a ${width} CSS-pixel viewport`, () => {
    test.use({ viewport: { width, height: 900 } });

    test(`L2-040 · Verify representative viewports at ${width}px`, async ({ page }) => {
      const workboard = new WorkboardPage(page);
      for (const route of ROUTES) {
        await workboard.navigateTo(route);
        await workboard.expectNoHorizontalOverflow();
        await workboard.expectContentWithinViewport();
      }

      // The hours row carries six columns beside the rail, and an expanded story adds a fourth
      // column inside it, so it is checked in the state that has the most to fit.
      const hours = new AssistantHoursPage(page);
      await hours.openFromDirectory('Noah Williams');
      await hours.expandStory('Publish a concise engagement health summary');
      await workboard.expectNoHorizontalOverflow();
      await workboard.expectContentWithinViewport();

      // An attachment row carries a badge, a file name that can be long, and two actions,
      // so it is checked holding a file rather than empty.
      await workboard.navigateTo('backlog');
      await new BacklogPage(page).openStory('Publish a concise engagement health summary');
      const attachments = new AttachmentsPage(page);
      await attachments.attach({ name: 'a-rather-long-attachment-file-name.pdf' });
      await attachments.expectFiles('a-rather-long-attachment-file-name.pdf');
      await workboard.expectNoHorizontalOverflow();
      await workboard.expectContentWithinViewport();
    });
  });
}

test.describe('a desktop viewport with more page than screen', () => {
  // Past the widest tablet, and short enough that the board scrolls beneath the bar. Vertical
  // room, not width, is what the pinned bar answers to, and a desktop window runs out of it too.
  test.use({ viewport: { width: 1600, height: 800 } });

  test('L2-024 · Keep the bar in reach on a desktop', async ({ page }) => {
    const workboard = new WorkboardPage(page);
    await workboard.navigateTo('board');
    await workboard.expectTopbarPinnedWhileScrolling();
  });
});

test.describe('a tablet in landscape', () => {
  // Wide enough to keep the three board columns, short enough that the board scrolls away
  // from the top bar.
  test.use({ viewport: { width: 1024, height: 768 } });

  test('L2-024 · Keep the bar and card actions usable on a tablet', async ({ page }) => {
    const workboard = new WorkboardPage(page);
    await workboard.navigateTo('board');
    await new BoardPage(page).expectStoryActionsOnOneLine();
    await workboard.expectTopbarPinnedWhileScrolling();
  });
});
