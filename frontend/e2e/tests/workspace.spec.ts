import { test } from '../fixtures/workboard.fixture';
import { AccessibilityPage } from '../pages/accessibility.page';
import { AssistantsPage } from '../pages/assistants.page';
import { BacklogPage } from '../pages/backlog.page';
import { BoardPage } from '../pages/board.page';
import { HierarchyPage } from '../pages/hierarchy.page';
import { StoryEditorPage } from '../pages/story-editor.page';
import { WorkboardPage } from '../pages/workboard.page';

test('navigate, discover work, and execute an active story', async ({ page, browserName }) => {
  const workboard = new WorkboardPage(page);
  await workboard.navigateTo('board');
  const board = new BoardPage(page);
  await board.expectWorkspace();
  if (browserName === 'chromium')
    await board.moveStoryForwardIfPresent('Capture a client decision');

  await workboard.usePrimaryNavigation('Backlog');
  const backlog = new BacklogPage(page);
  await backlog.expectSprintAssignment('Publish a concise engagement health summary', 'Sprint 14');
  await backlog.search('risk canvas');
  await backlog.expectStory('Create an AI engagement risk canvas');

  await workboard.usePrimaryNavigation('Assistants');
  await new AssistantsPage(page).expectAssistant('Maya Chen');
});

test('create and delete an empty initiative', async ({ page }) => {
  const workboard = new WorkboardPage(page);
  await workboard.navigateTo('initiatives');
  await new HierarchyPage(page).createAndDeleteInitiative(`Acceptance outcome ${Date.now()}`);
});

test('deliver a story from hierarchy through a completed sprint', async ({ page, browserName }) => {
  test.slow();
  test.skip(browserName !== 'chromium', 'The complete state-changing workflow runs once.');
  const suffix = Date.now();
  const initiativeName = `Verified outcome ${suffix}`;
  const epicName = `Verified capability ${suffix}`;
  const assistantName = `Jordan ${suffix}`;
  const storyTitle = `Deliver verified increment ${suffix}`;
  const sprintName = `Verified sprint ${suffix}`;
  const workboard = new WorkboardPage(page);

  await workboard.navigateTo('initiatives');
  const hierarchy = new HierarchyPage(page);
  await hierarchy.createInitiative(
    initiativeName,
    'An outcome created entirely through the acceptance boundary.',
  );
  await hierarchy.createEpic(initiativeName, epicName, 'A coherent delivery capability.');

  await workboard.usePrimaryNavigation('Assistants');
  const assistants = new AssistantsPage(page);
  await assistants.createAssistant(assistantName);
  await new StoryEditorPage(page).createStory(
    storyTitle,
    epicName,
    assistantName,
    `Implement ${storyTitle}`,
  );

  await workboard.usePrimaryNavigation('Backlog');
  const backlog = new BacklogPage(page);
  await backlog.expectStory(storyTitle);
  await backlog.reloadAndExpectStory(storyTitle);
  await backlog.openStory(storyTitle);
  const editor = new StoryEditorPage(page);
  await editor.archiveOpenStory();
  await backlog.expectState(storyTitle, 'archived');
  await backlog.openStory(storyTitle);
  await editor.restoreOpenStory();
  await backlog.expectState(storyTitle, 'draft');
  await backlog.groomStory(storyTitle);

  await workboard.usePrimaryNavigation('Assistants');
  await assistants.expectGuardedDeletion(assistantName, storyTitle);

  await workboard.usePrimaryNavigation('Board');
  const board = new BoardPage(page);
  await board.createSprint(sprintName, 'Deliver the verified acceptance increment.', '2026-10-05');
  await workboard.usePrimaryNavigation('Backlog');
  await backlog.assignStory(storyTitle, sprintName);
  await workboard.usePrimaryNavigation('Board');
  await board.completeActiveSprintIfPresent();
  await board.startSprint(sprintName);
  await board.moveStoryForward(storyTitle);
  await board.moveStoryForward(storyTitle);
  await board.reloadAndExpectStoryInDone(storyTitle);
  await board.completeActiveSprintIfPresent();
});

test('shows actionable feedback when an API save fails', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'The failure behavior is browser-independent.');
  await new WorkboardPage(page).navigateTo('assistants');
  await new AssistantsPage(page).expectSaveFailureFeedback(`Unavailable ${Date.now()}`);
});

test('primary routes have no serious accessibility violations', async ({ page }) => {
  test.slow();
  const workboard = new WorkboardPage(page);
  const accessibility = new AccessibilityPage(page);
  for (const route of ['board', 'backlog', 'initiatives', 'assistants'] as const) {
    await workboard.navigateTo(route);
    await accessibility.expectNoSeriousViolations();
  }
});

test('keyboard navigation and dialog types remain accessible', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'The keyboard and dialog matrix runs once.');
  test.slow();
  await new AccessibilityPage(page).expectKeyboardAndDialogAccess();
});

test('responsive workflows do not overflow supported viewports', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'Viewport matrix runs once in Chromium.');
  const workboard = new WorkboardPage(page);
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['board', 'backlog', 'initiatives', 'assistants'] as const) {
      await workboard.navigateTo(route);
      await workboard.expectNoHorizontalOverflow();
    }
  }
});

test('a dialog keeps its actions on screen on a phone', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'Viewport matrix runs once in Chromium.');
  const workboard = new WorkboardPage(page);
  // A phone-sized viewport, short enough that the story editor has to scroll its body.
  await page.setViewportSize({ width: 390, height: 664 });
  await workboard.navigateTo('board');
  await workboard.openNewStory();
  await workboard.expectDialogActionsWithinViewport('New story');
});
