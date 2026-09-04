import { test } from '../fixtures/workboard.fixture';
import { BacklogPage } from '../pages/backlog.page';
import { StoryEditorPage } from '../pages/story-editor.page';
import { WorkboardPage } from '../pages/workboard.page';

test('L2-001 · Navigate between work areas', { tag: '@smoke' }, async ({ page }) => {
  const workboard = new WorkboardPage(page);
  await workboard.navigateTo('board');
  await workboard.markBrowsingContext();

  for (const item of ['Backlog', 'Initiatives', 'Assistants', 'Board'] as const) {
    await workboard.usePrimaryNavigation(item);
    await workboard.expectSameBrowsingContext();
    await workboard.expectSelectedNavigation(item);
  }
  await workboard.expectRoute('board');
});

test('L2-001 · Open a route directly', async ({ page }) => {
  // Only the backend knows these stories, so seeing them proves the deep link loaded state.
  const workboard = new WorkboardPage(page);
  const backlog = new BacklogPage(page);
  await workboard.navigateTo('backlog');
  await workboard.expectView('Backlog');
  await backlog.expectStory('Create an AI engagement risk canvas');

  await workboard.reload();
  await workboard.expectView('Backlog');
  await backlog.expectStory('Create an AI engagement risk canvas');
});

test('L2-001 · Create a story from the global action', async ({ page }) => {
  const workboard = new WorkboardPage(page);
  const editor = new StoryEditorPage(page);
  for (const route of ['board', 'backlog', 'initiatives', 'assistants'] as const) {
    await workboard.navigateTo(route);
    await workboard.openNewStory();
    await workboard.expectRoute(route);
    await editor.close();
  }
});
