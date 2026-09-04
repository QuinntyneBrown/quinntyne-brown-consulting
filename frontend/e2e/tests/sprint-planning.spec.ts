import { test } from '../fixtures/workboard.fixture';
import { noActiveSprint } from '../mocks/workspace-scenarios';
import { BacklogPage } from '../pages/backlog.page';
import { BoardPage } from '../pages/board.page';
import { SprintManagerPage } from '../pages/sprint-manager.page';
import { WorkboardPage } from '../pages/workboard.page';

const RISK_CANVAS = 'Create an AI engagement risk canvas';
const MILESTONE_NOTES = 'Share milestone notes with the client';
const KICKOFF_AGENDA = 'Agree the engagement kickoff agenda';
const LEGACY_WORKSHEET = 'Retire the legacy kickoff worksheet';

test.beforeEach(async ({ page }) => {
  await new WorkboardPage(page).navigateTo('board');
});

test('L2-013 · Create a sprint', { tag: '@smoke' }, async ({ page }) => {
  const sprints = new SprintManagerPage(page);
  await sprints.open();
  await sprints.createSprint('Sprint 16', 'Prove the margin insight increment.', '2026-10-05');
  // The inclusive range ends 13 calendar days after it starts.
  await sprints.expectDates('Sprint 16', 'Oct 5, 2026 – Oct 18, 2026');
  await sprints.close();

  await new WorkboardPage(page).reload();
  await sprints.open();
  await sprints.expectStatus('Sprint 16', 'planned');
});

test('L2-013 · Reject an invalid sprint', async ({ page }) => {
  const sprints = new SprintManagerPage(page);
  await sprints.open();
  await sprints.expectFormRejects(['Name', 'Goal']);
  await sprints.expectDuplicateNameRejected(
    'Sprint 14',
    'A goal that duplicates a name.',
    '2026-10-05',
  );
  await sprints.expectSprintCount(3);
});

test('L2-013 · Update a sprint', async ({ page }) => {
  const sprints = new SprintManagerPage(page);
  await sprints.open();
  await sprints.updateSprint('Sprint 15', {
    goal: 'Prove the next responsible AI increment end to end.',
    startDate: '2026-09-07',
  });
  await sprints.expectGoal('Sprint 15', 'Prove the next responsible AI increment end to end.');
  // Moving the start date moves the derived end date with it.
  await sprints.expectDates('Sprint 15', 'Sep 7, 2026 – Sep 20, 2026');
  await sprints.close();

  await new WorkboardPage(page).reload();
  await sprints.open();
  await sprints.expectDates('Sprint 15', 'Sep 7, 2026 – Sep 20, 2026');
});

test('L2-013 · Correct completed sprint metadata', async ({ page }) => {
  const sprints = new SprintManagerPage(page);
  const backlog = new BacklogPage(page);
  await sprints.open();
  await sprints.expectStartDateReadOnly('Sprint 13');
  await sprints.updateSprint('Sprint 13', {
    name: 'Sprint 13 — baseline',
    goal: 'Establish a useful client delivery baseline for the account.',
  });

  await sprints.expectStatus('Sprint 13 — baseline', 'completed');
  await sprints.expectDates('Sprint 13 — baseline', 'Aug 3, 2026 – Aug 16, 2026');
  await sprints.expectStoryCount('Sprint 13 — baseline', 1);
  await sprints.close();

  await new WorkboardPage(page).usePrimaryNavigation('Backlog');
  await backlog.expectSprintAssignment(KICKOFF_AGENDA, 'Sprint 13 — baseline');
});

test.describe(noActiveSprint.name, () => {
  test.use({ seed: noActiveSprint });

  test('L2-014 · Start a sprint', { tag: '@smoke' }, async ({ page }) => {
    const workboard = new WorkboardPage(page);
    const backlog = new BacklogPage(page);
    const board = new BoardPage(page);
    const sprints = new SprintManagerPage(page);

    await workboard.usePrimaryNavigation('Backlog');
    await backlog.assignStory(RISK_CANVAS, 'Sprint 20');
    await workboard.usePrimaryNavigation('Board');

    await sprints.open();
    await sprints.startSprint('Sprint 20');
    await sprints.close();

    await board.expectActiveSprint();
    await board.expectStoryInColumn(RISK_CANVAS, 'To do');
  });
});

test('L2-014 · Reject a second active sprint', async ({ page }) => {
  const sprints = new SprintManagerPage(page);
  await sprints.open();
  await sprints.expectStartRejected('Sprint 15', 'Sprint 14');
  await sprints.close();
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

test('L2-014 · Complete an active sprint', async ({ page }) => {
  const board = new BoardPage(page);
  const sprints = new SprintManagerPage(page);
  await board.completeActiveSprint();
  await board.expectNoActiveSprint();

  // Nothing runs again until a planned sprint is deliberately started.
  await sprints.open();
  await sprints.expectStatus('Sprint 14', 'completed');
  await sprints.expectStatus('Sprint 15', 'planned');
  await sprints.close();
  await board.expectNoActiveSprint();
});

test('L2-015 · Plan a Ready story', async ({ page }) => {
  const workboard = new WorkboardPage(page);
  const backlog = new BacklogPage(page);
  const board = new BoardPage(page);
  await workboard.usePrimaryNavigation('Backlog');

  await backlog.assignStory(RISK_CANVAS, 'Sprint 14');
  await workboard.reload();
  await backlog.expectSprintAssignment(RISK_CANVAS, 'Sprint 14');

  // The story arrives at the start of the board's flow.
  await workboard.usePrimaryNavigation('Board');
  await board.expectStoryInColumn(RISK_CANVAS, 'To do');
  await board.expectColumnCount('To do', 3);
});

test('L2-015 · Reject an ineligible story', async ({ page }) => {
  // The backlog does not offer a sprint to work that cannot be planned; the backend integration
  // suite owns the refusal of an assignment submitted anyway.
  const backlog = new BacklogPage(page);
  await new WorkboardPage(page).usePrimaryNavigation('Backlog');
  await backlog.expectSprintAssignmentUnavailable(MILESTONE_NOTES);
  await backlog.expectSprintAssignmentUnavailable(KICKOFF_AGENDA);
  await backlog.filterBy('Archived');
  await backlog.expectSprintAssignmentUnavailable(LEGACY_WORKSHEET);
});

test('L2-015 · Return planned work to the backlog', async ({ page }) => {
  const workboard = new WorkboardPage(page);
  const backlog = new BacklogPage(page);
  const board = new BoardPage(page);
  await workboard.usePrimaryNavigation('Board');
  await board.moveStoryForward('Capture a client decision');

  await workboard.usePrimaryNavigation('Backlog');
  await backlog.returnStoryToBacklog('Capture a client decision');
  await backlog.expectSprintAssignment('Capture a client decision', 'Backlog');
  await backlog.filterBy('Unscheduled');
  await backlog.expectStory('Capture a client decision');

  // It returns to the start of the flow, so replanning it starts from To do.
  await backlog.filterBy('All stories');
  await backlog.assignStory('Capture a client decision', 'Sprint 14');
  await workboard.usePrimaryNavigation('Board');
  await board.expectStoryInColumn('Capture a client decision', 'To do');
});

test('L2-016 · Delete a planned sprint', async ({ page }) => {
  const workboard = new WorkboardPage(page);
  const backlog = new BacklogPage(page);
  const sprints = new SprintManagerPage(page);

  await workboard.usePrimaryNavigation('Backlog');
  await backlog.assignStory(RISK_CANVAS, 'Sprint 15');
  await workboard.usePrimaryNavigation('Board');
  await sprints.open();
  await sprints.deleteSprint('Sprint 15');
  await sprints.close();

  await workboard.usePrimaryNavigation('Backlog');
  await backlog.expectSprintAssignment(RISK_CANVAS, 'Backlog');
  await backlog.expectState(RISK_CANVAS, 'ready');
});

test('L2-016 · Protect active and completed sprints', async ({ page }) => {
  // The UI half of the rule; the API half is a backend integration test.
  const sprints = new SprintManagerPage(page);
  await sprints.open();
  await sprints.expectNoDeleteAction('Sprint 14');
  await sprints.expectNoDeleteAction('Sprint 13');
  await sprints.expectStoryCount('Sprint 14', 4);
  await sprints.expectStoryCount('Sprint 13', 1);
});
