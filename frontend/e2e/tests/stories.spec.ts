import { test } from '../fixtures/workboard.fixture';
import { readyUnscheduledStory } from '../mocks/workspace-scenarios';
import { BacklogPage } from '../pages/backlog.page';
import { BoardPage } from '../pages/board.page';
import { StoryEditorPage } from '../pages/story-editor.page';
import { WorkboardPage } from '../pages/workboard.page';

const HEALTH_SUMMARY = 'Publish a concise engagement health summary';
const MILESTONE_NOTES = 'Share milestone notes with the client';
const RISK_CANVAS = 'Create an AI engagement risk canvas';
const KICKOFF_AGENDA = 'Agree the engagement kickoff agenda';
const LEGACY_WORKSHEET = 'Retire the legacy kickoff worksheet';

test('L2-005 · Save a new draft', { tag: '@smoke' }, async ({ page }) => {
  const workboard = new WorkboardPage(page);
  const editor = new StoryEditorPage(page);
  const backlog = new BacklogPage(page);
  await workboard.navigateTo('backlog');

  await editor.createStory({ title: 'Draft a delivery risk register', epic: 'Delivery playbook' });
  await workboard.expectFeedback('QBC-107 saved.');
  await backlog.expectRowDetail('Draft a delivery risk register', {
    key: 'QBC-107',
    initiative: 'Client delivery excellence',
    epic: 'Delivery playbook',
    state: 'draft',
    points: 'Not estimated',
    sprint: 'Backlog',
  });

  // A second story takes the next key in the sequence, and neither one is Ready.
  await editor.createStory({ title: 'Draft an escalation path', epic: 'Delivery playbook' });
  await backlog.expectState('Draft an escalation path', 'draft');
  await backlog.filterBy('Ready');
  await backlog.expectNoStory('Draft a delivery risk register');
  await backlog.expectNoStory('Draft an escalation path');
});

test('L2-005 · View a story', async ({ page }) => {
  const workboard = new WorkboardPage(page);
  const editor = new StoryEditorPage(page);
  const detail = {
    title: HEALTH_SUMMARY,
    epic: 'Client delivery portal',
    owner: 'Maya Chen',
    description:
      'As a client, I want a concise health summary so that I can steer the engagement quickly.',
    acceptanceCriteria: 'Status, risks, and next milestone are visible in one place.',
    points: '5',
  };

  await workboard.navigateTo('backlog');
  await new BacklogPage(page).openStory(HEALTH_SUMMARY);
  await editor.expectStoryDetail(detail);
  await editor.expectTaskCount(2);
  await editor.expectTask(1, {
    title: 'Draft the engagement summary',
    assignee: 'Maya Chen',
    complete: true,
  });
  await editor.expectTask(2, {
    title: 'Validate status with the delivery lead',
    assignee: 'Noah Williams',
    complete: false,
  });
  await editor.close();

  // The same story opens with the same detail from the board.
  await workboard.usePrimaryNavigation('Board');
  await new BoardPage(page).openStory(HEALTH_SUMMARY);
  await editor.expectStoryDetail(detail);
  await editor.expectTaskCount(2);
});

test('L2-005 · Update a story', async ({ page }) => {
  const workboard = new WorkboardPage(page);
  const editor = new StoryEditorPage(page);
  const backlog = new BacklogPage(page);
  await workboard.navigateTo('backlog');

  await backlog.openStory(RISK_CANVAS);
  await editor.fill({
    title: 'Create a responsible AI risk canvas',
    epic: 'Delivery playbook',
    owner: 'Noah Williams',
    points: '8',
  });
  await editor.save();

  await backlog.expectRowDetail('Create a responsible AI risk canvas', {
    key: 'QBC-105',
    initiative: 'Client delivery excellence',
    epic: 'Delivery playbook',
    state: 'ready',
    points: '8 story points',
    sprint: 'Backlog',
  });

  // Every view reflects the change, including after the browser reloads the workspace.
  await workboard.usePrimaryNavigation('Initiatives');
  await workboard.reload();
  await workboard.usePrimaryNavigation('Backlog');
  await backlog.openStory('Create a responsible AI risk canvas');
  await editor.expectStoryDetail({
    title: 'Create a responsible AI risk canvas',
    epic: 'Delivery playbook',
    owner: 'Noah Williams',
    points: '8',
  });
});

test('L2-005 · Validate story points', async ({ page }) => {
  // The UI can only offer the product's scale; the backend integration suite owns the refusal
  // of a value submitted outside it.
  const editor = new StoryEditorPage(page);
  await new WorkboardPage(page).navigateTo('backlog');
  await editor.openNewStory();
  await editor.expectEstimateOptions('Not estimated', '1', '2', '3', '5', '8', '13');
});

test('L2-006 · Draft behavior', async ({ page }) => {
  const backlog = new BacklogPage(page);
  await new WorkboardPage(page).navigateTo('backlog');
  await backlog.expectState(MILESTONE_NOTES, 'draft');
  await backlog.expectSprintAssignmentUnavailable(MILESTONE_NOTES);
});

test('L2-006 · Mark a story Ready', async ({ page }) => {
  const workboard = new WorkboardPage(page);
  const editor = new StoryEditorPage(page);
  const backlog = new BacklogPage(page);
  await workboard.navigateTo('backlog');

  await backlog.openStory(MILESTONE_NOTES);
  await editor.fill({
    title: MILESTONE_NOTES,
    epic: 'Client delivery portal',
    description: 'As a consultant, I want to share milestone notes so that clients stay informed.',
    acceptanceCriteria: 'The notes name the milestone, its date, and its owner.',
    points: '3',
  });
  await editor.save();
  await backlog.groomStory(MILESTONE_NOTES);

  await workboard.reload();
  await backlog.expectState(MILESTONE_NOTES, 'ready');
  await backlog.filterBy('Draft');
  await backlog.expectNoStory(MILESTONE_NOTES);
});

test.describe(readyUnscheduledStory.name, () => {
  test.use({ seed: readyUnscheduledStory });

  test('L2-006 · Mark a story unready', async ({ page }) => {
    const workboard = new WorkboardPage(page);
    const backlog = new BacklogPage(page);
    await workboard.navigateTo('backlog');
    await backlog.markUnready(RISK_CANVAS);
    await workboard.reload();
    await backlog.expectState(RISK_CANVAS, 'active');
  });
});

test('L2-006 · Protect planned readiness', async ({ page }) => {
  const workboard = new WorkboardPage(page);
  const backlog = new BacklogPage(page);
  await workboard.navigateTo('backlog');
  await backlog.expectUnreadyRejected(
    HEALTH_SUMMARY,
    'Remove the story from its sprint before marking it unready.',
  );
  await workboard.reload();
  await backlog.expectState(HEALTH_SUMMARY, 'ready');
});

test('L2-007 · Add a task', async ({ page }) => {
  const workboard = new WorkboardPage(page);
  const editor = new StoryEditorPage(page);
  await workboard.navigateTo('backlog');

  await editor.openNewStory();
  await editor.fill({ title: 'Prepare a delivery retrospective', epic: 'Delivery playbook' });
  await editor.addTask({ title: 'Collect the sprint signals', assignee: 'Amara Okafor' });
  await editor.expectTaskIncomplete(1);
  await editor.save();

  await new BacklogPage(page).openStory('Prepare a delivery retrospective');
  await editor.expectTask(1, {
    title: 'Collect the sprint signals',
    assignee: 'Amara Okafor',
    complete: false,
  });
});

test('L2-007 · Update a task', async ({ page }) => {
  const workboard = new WorkboardPage(page);
  const editor = new StoryEditorPage(page);
  const backlog = new BacklogPage(page);
  await workboard.navigateTo('backlog');

  await backlog.openStory(HEALTH_SUMMARY);
  await editor.updateTask(2, {
    title: 'Confirm status with the engagement lead',
    assignee: 'Amara Okafor',
    complete: true,
  });
  await editor.save();

  await workboard.reload();
  await backlog.openStory(HEALTH_SUMMARY);
  await editor.expectTask(2, {
    title: 'Confirm status with the engagement lead',
    assignee: 'Amara Okafor',
    complete: true,
  });
});

test('L2-007 · Delete a task', async ({ page }) => {
  const workboard = new WorkboardPage(page);
  const editor = new StoryEditorPage(page);
  const backlog = new BacklogPage(page);
  await workboard.navigateTo('backlog');

  await backlog.openStory(HEALTH_SUMMARY);
  await editor.removeTask(1);
  await editor.save();

  await workboard.reload();
  await backlog.expectStory(HEALTH_SUMMARY);
  await backlog.openStory(HEALTH_SUMMARY);
  await editor.expectTaskCount(1);
  await editor.expectTask(1, { title: 'Validate status with the delivery lead' });
});

test('L2-007 · Reject a blank task', async ({ page }) => {
  const workboard = new WorkboardPage(page);
  const editor = new StoryEditorPage(page);
  await workboard.navigateTo('backlog');

  await editor.openNewStory();
  await editor.fill({ title: 'Prepare a delivery retrospective', epic: 'Delivery playbook' });
  await editor.addEmptyTask();
  await editor.expectSaveRejected('Task 1 title');
  await editor.close();
  await new BacklogPage(page).expectNoStory('Prepare a delivery retrospective');
});

test('L2-008 · Archive a story', { tag: '@smoke' }, async ({ page }) => {
  const workboard = new WorkboardPage(page);
  const editor = new StoryEditorPage(page);
  const backlog = new BacklogPage(page);
  await workboard.navigateTo('backlog');

  await backlog.openStory(HEALTH_SUMMARY);
  await editor.archiveOpenStory();
  await backlog.expectState(HEALTH_SUMMARY, 'archived');
  await backlog.expectSprintAssignment(HEALTH_SUMMARY, 'Backlog');

  // The board no longer carries it, and the Archived filter still finds it.
  await workboard.usePrimaryNavigation('Board');
  await new BoardPage(page).expectColumnCount('In progress', 0);
  await workboard.usePrimaryNavigation('Backlog');
  await backlog.filterBy('Archived');
  await backlog.expectOnlyStories(HEALTH_SUMMARY, LEGACY_WORKSHEET);
});

test('L2-008 · Restore a story', async ({ page }) => {
  const workboard = new WorkboardPage(page);
  const editor = new StoryEditorPage(page);
  const backlog = new BacklogPage(page);
  await workboard.navigateTo('backlog');

  await backlog.filterBy('Archived');
  await backlog.openStory(LEGACY_WORKSHEET);
  await editor.restoreOpenStory();
  await backlog.filterBy('Draft');
  await backlog.expectState(LEGACY_WORKSHEET, 'draft');
  await backlog.expectSprintAssignment(LEGACY_WORKSHEET, 'Backlog');
});

test('L2-008 · Permanently delete a story', async ({ page }) => {
  const workboard = new WorkboardPage(page);
  const editor = new StoryEditorPage(page);
  const backlog = new BacklogPage(page);
  await workboard.navigateTo('backlog');

  await backlog.openStory(RISK_CANVAS);
  await editor.deleteOpenStory();
  await workboard.expectFeedback('Story permanently deleted.');
  await workboard.reload();
  await backlog.filterBy('All stories');
  await backlog.expectNoStory(RISK_CANVAS);
});

test('L2-008 · Preserve sprint history', async ({ page }) => {
  const workboard = new WorkboardPage(page);
  const editor = new StoryEditorPage(page);
  const backlog = new BacklogPage(page);
  const refusal = 'A story recorded in a completed sprint cannot be changed.';
  await workboard.navigateTo('backlog');

  await backlog.openStory(KICKOFF_AGENDA);
  await editor.expectArchiveRejected(refusal);
  await editor.expectDeleteRejected(refusal);
  await editor.close();

  await workboard.reload();
  await backlog.expectState(KICKOFF_AGENDA, 'ready');
  await backlog.expectSprintAssignment(KICKOFF_AGENDA, 'Sprint 13');
});
