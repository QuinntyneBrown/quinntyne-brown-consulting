import { test } from '../fixtures/workboard.fixture';
import { groomableDraftStory } from '../mocks/workspace-scenarios';
import { BacklogPage } from '../pages/backlog.page';
import { StoryEditorPage } from '../pages/story-editor.page';
import { WorkboardPage } from '../pages/workboard.page';

const HEALTH_SUMMARY = 'Publish a concise engagement health summary';
const DECISION = 'Capture a client decision';
const EVIDENCE = 'Evaluate answers against engagement evidence';
const CHECKLIST = 'Create a weekly delivery checklist';
const RISK_CANVAS = 'Create an AI engagement risk canvas';
const MILESTONE_NOTES = 'Share milestone notes with the client';
const KICKOFF_AGENDA = 'Agree the engagement kickoff agenda';
const LEGACY_WORKSHEET = 'Retire the legacy kickoff worksheet';

test.beforeEach(async ({ page }) => {
  await new WorkboardPage(page).navigateTo('backlog');
});

test('L2-011 · View backlog context', async ({ page }) => {
  const backlog = new BacklogPage(page);
  await backlog.expectRowDetail(HEALTH_SUMMARY, {
    key: 'QBC-101',
    initiative: 'Client delivery excellence',
    epic: 'Client delivery portal',
    state: 'ready',
    points: '5 story points',
    sprint: 'Sprint 14',
  });
  await backlog.expectRowDetail(MILESTONE_NOTES, {
    key: 'QBC-106',
    initiative: 'Client delivery excellence',
    epic: 'Client delivery portal',
    state: 'draft',
    points: 'Not estimated',
    sprint: 'Backlog',
  });
  // A story kept in a completed sprint still names the sprint that holds it.
  await backlog.expectRowDetail(KICKOFF_AGENDA, {
    key: 'QBC-99',
    initiative: 'Client delivery excellence',
    epic: 'Delivery playbook',
    state: 'ready',
    points: '2 story points',
    sprint: 'Sprint 13',
  });
});

test('L2-011 · Search stories', async ({ page }) => {
  const backlog = new BacklogPage(page);

  await backlog.search('qbc-10');
  await backlog.expectOnlyStories(
    HEALTH_SUMMARY,
    DECISION,
    EVIDENCE,
    CHECKLIST,
    RISK_CANVAS,
    MILESTONE_NOTES,
  );

  await backlog.search('RISK canvas');
  await backlog.expectOnlyStories(RISK_CANVAS);

  await backlog.search('engagement COPILOT');
  await backlog.expectOnlyStories(EVIDENCE, RISK_CANVAS);

  await backlog.clearSearch();
  await backlog.expectStoryCount(8);
});

test('L2-011 · Filter stories', async ({ page }) => {
  const backlog = new BacklogPage(page);

  await backlog.filterBy('Unscheduled');
  await backlog.expectOnlyStories(RISK_CANVAS, MILESTONE_NOTES);

  await backlog.filterBy('Ready');
  await backlog.expectOnlyStories(
    HEALTH_SUMMARY,
    DECISION,
    EVIDENCE,
    CHECKLIST,
    RISK_CANVAS,
    KICKOFF_AGENDA,
  );

  await backlog.filterBy('Draft');
  await backlog.expectOnlyStories(MILESTONE_NOTES);

  await backlog.filterBy('Archived');
  await backlog.expectOnlyStories(LEGACY_WORKSHEET);

  await backlog.filterBy('All stories');
  await backlog.expectStoryCount(8);
});

test('L2-011 · Empty result', async ({ page }) => {
  const backlog = new BacklogPage(page);
  await backlog.search('nothing matches this');
  await backlog.expectEmptyState();
  await backlog.createStoryFromEmptyState();
  await new StoryEditorPage(page).close();
});

test.describe(groomableDraftStory.name, () => {
  test.use({ seed: groomableDraftStory });

  test('L2-012 · Complete grooming', { tag: '@smoke' }, async ({ page }) => {
    const workboard = new WorkboardPage(page);
    const backlog = new BacklogPage(page);
    await backlog.groomStory(MILESTONE_NOTES);
    await workboard.reload();
    await backlog.expectState(MILESTONE_NOTES, 'ready');
    // Readiness is what makes the story eligible for a sprint.
    await backlog.assignStory(MILESTONE_NOTES, 'Sprint 15');
    await backlog.expectSprintAssignment(MILESTONE_NOTES, 'Sprint 15');
  });
});

test('L2-012 · Reject incomplete grooming', async ({ page }) => {
  const backlog = new BacklogPage(page);
  const editor = new StoryEditorPage(page);
  // QBC-106 has no acceptance criteria and no estimate.
  await backlog.expectGroomingRejected(
    MILESTONE_NOTES,
    /Enter acceptance criteria\. Estimate the story before marking it Ready\./,
  );
  await backlog.expectState(MILESTONE_NOTES, 'draft');

  // The story can be corrected straight away, and then it grooms.
  await backlog.openStory(MILESTONE_NOTES);
  await editor.fill({
    title: MILESTONE_NOTES,
    epic: 'Client delivery portal',
    acceptanceCriteria: 'The notes name the milestone, its date, and its owner.',
    points: '3',
  });
  await editor.save();
  await backlog.groomStory(MILESTONE_NOTES);
});
