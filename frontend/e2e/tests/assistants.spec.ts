import { test } from '../fixtures/workboard.fixture';
import { unassignedAssistant } from '../mocks/workspace-scenarios';
import { AssistantsPage } from '../pages/assistants.page';
import { BacklogPage } from '../pages/backlog.page';
import { StoryEditorPage } from '../pages/story-editor.page';
import { WorkboardPage } from '../pages/workboard.page';

const HEALTH_SUMMARY = 'Publish a concise engagement health summary';
const CHECKLIST = 'Create a weekly delivery checklist';

test.beforeEach(async ({ page }) => {
  await new WorkboardPage(page).navigateTo('assistants');
});

test('L2-009 · Create an assistant', { tag: '@smoke' }, async ({ page }) => {
  const assistants = new AssistantsPage(page);
  const detail = {
    name: 'Jordan Adeyemi',
    role: 'Delivery assurance assistant',
    specialties: 'Quality, Testing',
    availability: 'Limited' as const,
  };
  await assistants.createAssistant(detail);
  await new WorkboardPage(page).reload();
  await assistants.expectAssistantDetail(detail);
  await assistants.expectWorkload(detail.name, 0, 0);
});

test('L2-009 · View assistant workload', async ({ page }) => {
  const assistants = new AssistantsPage(page);
  // Maya owns QBC-101 and QBC-102 and has one incomplete task; her completed task does not count.
  await assistants.expectWorkload('Maya Chen', 2, 1);
  await assistants.expectWorkload('Noah Williams', 1, 1);
  await assistants.expectWorkload('Amara Okafor', 2, 0);
});

test('L2-009 · Update an assistant', async ({ page }) => {
  const workboard = new WorkboardPage(page);
  const assistants = new AssistantsPage(page);
  const detail = {
    name: 'Maya Chen-Alvarez',
    role: 'Principal delivery assistant',
    specialties: 'Discovery, Delivery, Facilitation',
    availability: 'Unavailable' as const,
  };
  await assistants.updateAssistant('Maya Chen', detail);
  await workboard.reload();
  await assistants.expectAssistantDetail(detail);

  // The new identity reaches the work she owns.
  await workboard.usePrimaryNavigation('Backlog');
  const backlog = new BacklogPage(page);
  await backlog.openStory(HEALTH_SUMMARY);
  await new StoryEditorPage(page).expectStoryDetail({
    title: HEALTH_SUMMARY,
    epic: 'Client delivery portal',
    owner: detail.name,
  });
});

test.describe(unassignedAssistant.name, () => {
  test.use({ seed: unassignedAssistant });

  test('L2-009 · Delete an unassigned assistant', async ({ page }) => {
    const assistants = new AssistantsPage(page);
    await assistants.deleteAssistant('Priya Raman');
    await new WorkboardPage(page).reload();
    await assistants.expectNoAssistant('Priya Raman');
  });
});

test('L2-010 · Assign an assistant', async ({ page }) => {
  const workboard = new WorkboardPage(page);
  const editor = new StoryEditorPage(page);
  await workboard.usePrimaryNavigation('Backlog');
  const backlog = new BacklogPage(page);

  await backlog.openStory('Create an AI engagement risk canvas');
  await editor.setOwner('Noah Williams');
  await editor.addTask({ title: 'Review the canvas with delivery', assignee: 'Maya Chen' });
  await editor.save();

  await backlog.expectRowDetail('Create an AI engagement risk canvas', {
    key: 'QBC-105',
    initiative: 'Applied AI advantage',
    epic: 'Engagement copilot',
    state: 'ready',
    points: '3 story points',
    sprint: 'Backlog',
  });
  await backlog.openStory('Create an AI engagement risk canvas');
  await editor.expectTask(1, { title: 'Review the canvas with delivery', assignee: 'Maya Chen' });
  await editor.close();

  await workboard.usePrimaryNavigation('Assistants');
  const assistants = new AssistantsPage(page);
  await assistants.expectWorkload('Noah Williams', 2, 1);
  await assistants.expectWorkload('Maya Chen', 2, 2);
});

test('L2-010 · Unassign work', async ({ page }) => {
  const workboard = new WorkboardPage(page);
  const editor = new StoryEditorPage(page);
  const assistants = new AssistantsPage(page);
  await workboard.usePrimaryNavigation('Backlog');
  const backlog = new BacklogPage(page);

  await backlog.openStory(CHECKLIST);
  await editor.setOwner('Unassigned');
  await editor.updateTask(1, {
    title: 'Review the checklist with a delivery lead',
    assignee: 'Unassigned',
  });
  await editor.save();

  // Both records survive: only the assignment is gone.
  await backlog.openStory(CHECKLIST);
  await editor.expectStoryDetail({
    title: CHECKLIST,
    epic: 'Delivery playbook',
    owner: 'Unassigned',
  });
  await editor.expectTask(1, {
    title: 'Review the checklist with a delivery lead',
    assignee: 'Unassigned',
  });
  await editor.close();

  await workboard.usePrimaryNavigation('Assistants');
  await assistants.expectAssistant('Noah Williams');
  // Noah keeps the incomplete task he still holds on another story.
  await assistants.expectWorkload('Noah Williams', 0, 1);
});

test('L2-010 · Protect an assigned assistant', async ({ page }) => {
  const assistants = new AssistantsPage(page);
  await assistants.expectGuardedDeletion(
    'Maya Chen',
    HEALTH_SUMMARY,
    'Capture a client decision',
    'Confirm the decision format',
  );
  await assistants.openBlockingAssignment('Maya Chen', 'QBC-101');
  await new StoryEditorPage(page).expectStoryDetail({
    title: HEALTH_SUMMARY,
    epic: 'Client delivery portal',
    owner: 'Maya Chen',
  });
});
