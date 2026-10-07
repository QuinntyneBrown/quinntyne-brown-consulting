import { test } from '../fixtures/workboard.fixture';
import { BacklogPage } from '../pages/backlog.page';
import { BoardPage } from '../pages/board.page';
import { HierarchyPage } from '../pages/hierarchy.page';
import { StoragePage } from '../pages/storage.page';
import { StoryEditorPage } from '../pages/story-editor.page';
import { WorkboardPage } from '../pages/workboard.page';

const DECISION = 'Capture a client decision';
const REGISTER = 'Draft a delivery risk register';

test('L2-021 · Persist across browser sessions', { tag: '@smoke' }, async ({ page }) => {
  const workboard = new WorkboardPage(page);
  const editor = new StoryEditorPage(page);
  const backlog = new BacklogPage(page);
  await workboard.navigateTo('backlog');

  await editor.createStory({
    title: REGISTER,
    epic: 'Delivery playbook',
    owner: 'Noah Williams',
    description: 'As a delivery lead, I want a risk register so that surprises stay small.',
    acceptanceCriteria: 'Each risk names an owner, an impact, and a response.',
    points: '5',
  });

  await workboard.reload();
  await backlog.expectStory(REGISTER);
  await backlog.openStory(REGISTER);
  await editor.expectStoryDetail({
    title: REGISTER,
    epic: 'Delivery playbook',
    owner: 'Noah Williams',
    points: '5',
  });
});

test('L2-021 · Avoid browser storage as the source of truth', async ({ page }) => {
  const workboard = new WorkboardPage(page);
  const storage = new StoragePage(page);
  const backlog = new BacklogPage(page);
  await workboard.navigateTo('backlog');
  await backlog.expectStoryCount(8);

  // Only the workspace credential may live in the browser, and nothing else is needed to
  // render the workspace again.
  await storage.expectOnlyCredentialStored();
  await storage.clearEverythingExceptTheCredential();
  await workboard.reload();
  await backlog.expectStoryCount(8);
  await backlog.expectStory(DECISION);
});

test('L2-032 · Update after a mutation', async ({ page }) => {
  const workboard = new WorkboardPage(page);
  const board = new BoardPage(page);
  const backlog = new BacklogPage(page);
  const hierarchy = new HierarchyPage(page);
  await workboard.navigateTo('board');

  // One movement updates the card, both column counts, and the derived progress at once, with
  // no reload in between.
  await workboard.markBrowsingContext();
  await board.moveStoryForward(DECISION);
  await board.expectStoryInColumn(DECISION, 'In progress');
  await board.expectColumnCount('To do', 1);
  await board.expectColumnCount('In progress', 2);
  await board.expectCompletionPercentage(25);
  await workboard.expectSameBrowsingContext();

  await board.moveStoryForward(DECISION);
  await board.expectCompletionPercentage(50);

  // The same change reaches every other view that derives from it.
  await workboard.usePrimaryNavigation('Initiatives');
  await hierarchy.expectEpicRollUp('Client delivery portal', 3, 33);
  await workboard.usePrimaryNavigation('Backlog');
  await backlog.expectSprintAssignment(DECISION, 'Sprint 14');
});
