import { test } from '../fixtures/workboard.fixture';
import { activeSprintWithoutDoneWork, onlyCompletedSprint } from '../mocks/workspace-scenarios';
import { BacklogPage } from '../pages/backlog.page';
import { BoardPage } from '../pages/board.page';
import { SprintManagerPage } from '../pages/sprint-manager.page';
import { WorkboardPage } from '../pages/workboard.page';

const HEALTH_SUMMARY = 'Publish a concise engagement health summary';
const DECISION = 'Capture a client decision';
const EVIDENCE = 'Evaluate answers against engagement evidence';
const CHECKLIST = 'Create a weekly delivery checklist';

test.beforeEach(async ({ page }) => {
  await new WorkboardPage(page).navigateTo('board');
});

test('L2-017 · Display the active sprint', { tag: '@smoke' }, async ({ page }) => {
  await new BoardPage(page).expectSprintSummary({
    name: 'Sprint 14',
    goal: 'Make engagement status and decisions effortless to understand.',
    startDate: 'Aug 17, 2026',
    endDate: 'Aug 30, 2026',
    done: 1,
    total: 4,
    percentage: 25,
  });
});

test('L2-017 · Calculate progress', async ({ page }) => {
  const board = new BoardPage(page);
  // One of four stories is Done.
  await board.expectCompletionPercentage(25);
  await board.moveStoryForward(EVIDENCE);
  await board.expectCompletionPercentage(25);
  await board.moveStoryForward(EVIDENCE);
  // Two of four rounds to a whole percentage.
  await board.expectCompletionPercentage(50);
  await board.moveStoryBackward(CHECKLIST);
  await board.expectCompletionPercentage(25);
});

test.describe(onlyCompletedSprint.name, () => {
  test.use({ seed: onlyCompletedSprint });

  test('L2-017 · Display no-active-sprint state', async ({ page }) => {
    const board = new BoardPage(page);
    await board.expectNoActiveSprint();
    await board.openSprintManagerFromEmptyState();
    await new SprintManagerPage(page).expectStatus('Sprint 13', 'completed');
  });
});

test('L2-018 · Render board stories', async ({ page }) => {
  const board = new BoardPage(page);
  await board.expectStoryInColumn(DECISION, 'To do');
  await board.expectStoryInColumn(EVIDENCE, 'To do');
  await board.expectStoryInColumn(HEALTH_SUMMARY, 'In progress');
  await board.expectStoryInColumn(CHECKLIST, 'Done');
  await board.expectColumnCount('To do', 2);
  await board.expectColumnCount('In progress', 1);
  await board.expectColumnCount('Done', 1);

  await board.expectCardDetail(HEALTH_SUMMARY, {
    key: 'QBC-101',
    epic: 'Client delivery portal',
    points: '5 story points',
    owner: 'Maya Chen',
    tasks: '1/2 tasks',
  });
  // A story with no tasks says nothing about them.
  await board.expectCardDetail(EVIDENCE, {
    key: 'QBC-103',
    epic: 'Engagement copilot',
    points: '5 story points',
    owner: 'Amara Okafor',
  });
  await board.expectNoTaskCount(EVIDENCE);
});

test.describe(activeSprintWithoutDoneWork.name, () => {
  test.use({ seed: activeSprintWithoutDoneWork });

  test('L2-018 · Render an empty column', async ({ page }) => {
    const board = new BoardPage(page);
    await board.expectEmptyColumn('Done');
    await board.expectColumnCount('To do', 3);
    await board.expectColumnCount('In progress', 1);
  });
});

test('L2-019 · Move a story with controls', { tag: '@smoke' }, async ({ page }) => {
  const board = new BoardPage(page);
  const workboard = new WorkboardPage(page);
  await workboard.markBrowsingContext();

  await board.moveStoryForward(DECISION);
  await board.expectStoryInColumn(DECISION, 'In progress');
  await board.expectColumnCount('To do', 1);
  await board.expectColumnCount('In progress', 2);
  await board.expectCompletionPercentage(25);
  await workboard.expectSameBrowsingContext();

  await board.moveStoryForward(DECISION);
  await board.expectStoryInColumn(DECISION, 'Done');
  await board.expectCompletionPercentage(50);
  await board.moveStoryBackward(DECISION);
  await board.expectStoryInColumn(DECISION, 'In progress');
  await board.reloadAndExpectStoryInColumn(DECISION, 'In progress');
});

test('L2-019 · Move a story by dragging', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'Pointer drag-and-drop is exercised once.');
  const board = new BoardPage(page);
  await board.dragStoryToColumn(DECISION, 'Done');
  await board.expectStoryInColumn(DECISION, 'Done');
  await board.expectCompletionPercentage(50);
  await board.reloadAndExpectStoryInColumn(DECISION, 'Done');
});

test('L2-020 · Complete a sprint with mixed work', { tag: '@smoke' }, async ({ page }) => {
  const board = new BoardPage(page);
  const backlog = new BacklogPage(page);
  const workboard = new WorkboardPage(page);
  const sprints = new SprintManagerPage(page);

  await board.completeActiveSprint();
  await workboard.expectFeedback('Sprint completed. Unfinished work returned to the backlog.');

  // The finished story stays with the sprint that delivered it.
  await sprints.open();
  await sprints.expectStoryCount('Sprint 14', 1);
  await sprints.close();

  await workboard.usePrimaryNavigation('Backlog');
  await backlog.expectSprintAssignment(CHECKLIST, 'Sprint 14');

  // The unfinished work returns to the backlog, Ready and at the start of the flow.
  for (const title of [HEALTH_SUMMARY, DECISION, EVIDENCE]) {
    await backlog.expectSprintAssignment(title, 'Backlog');
    await backlog.expectState(title, 'ready');
  }
  await backlog.filterBy('Unscheduled');
  await backlog.expectStory(HEALTH_SUMMARY);
  await backlog.expectStory(DECISION);
  await backlog.expectStory(EVIDENCE);
});

test('L2-020 · Review completed membership', async ({ page }) => {
  const board = new BoardPage(page);
  const backlog = new BacklogPage(page);
  const workboard = new WorkboardPage(page);
  const sprints = new SprintManagerPage(page);
  await board.completeActiveSprint();
  await workboard.reload();

  // The membership survives a reload as historical data.
  await sprints.open();
  await sprints.expectStatus('Sprint 14', 'completed');
  await sprints.expectStoryCount('Sprint 14', 1);
  await sprints.close();

  // A story kept in a completed sprint cannot be planned into another one.
  await workboard.usePrimaryNavigation('Backlog');
  await backlog.expectSprintAssignment(CHECKLIST, 'Sprint 14');
  await backlog.expectSprintAssignmentUnavailable(CHECKLIST);
});
