import { test } from '../fixtures/workboard.fixture';
import { emptyWorkspace, slowAssistantSave } from '../mocks/workspace-scenarios';
import { AssistantsPage } from '../pages/assistants.page';
import { BacklogPage } from '../pages/backlog.page';
import { BoardPage } from '../pages/board.page';
import { HierarchyPage } from '../pages/hierarchy.page';
import { SprintManagerPage } from '../pages/sprint-manager.page';
import { WorkboardPage } from '../pages/workboard.page';

test('L2-026 · Confirm a destructive action', async ({ page }) => {
  const workboard = new WorkboardPage(page);
  const hierarchy = new HierarchyPage(page);
  const board = new BoardPage(page);

  // Each confirmation names the record it affects and explains what happens, and Cancel
  // leaves the record exactly as it was.
  await workboard.navigateTo('initiatives');
  await hierarchy.expectDeletionCancelKeepsInitiative('Client delivery excellence');

  await workboard.usePrimaryNavigation('Board');
  await board.expectCompletionCancelKeepsSprint('Sprint 14');
});

test.describe(slowAssistantSave.name, () => {
  test.use({ seed: slowAssistantSave });

  test('L2-026 · Show operation state', async ({ page }) => {
    await new WorkboardPage(page).navigateTo('assistants');
    await new AssistantsPage(page).expectDuplicateSubmissionPrevented({
      name: 'Jordan Adeyemi',
      role: 'Delivery assurance assistant',
    });
  });
});

test.describe(emptyWorkspace.name, () => {
  test.use({ seed: emptyWorkspace });

  test('L2-026 · Show an empty collection', async ({ page }) => {
    const workboard = new WorkboardPage(page);
    const sprints = new SprintManagerPage(page);

    await workboard.navigateTo('initiatives');
    await new HierarchyPage(page).expectEmptyState();

    await workboard.usePrimaryNavigation('Assistants');
    await new AssistantsPage(page).expectEmptyState();

    await workboard.usePrimaryNavigation('Backlog');
    await new BacklogPage(page).expectEmptyState();

    await workboard.usePrimaryNavigation('Board');
    await new BoardPage(page).expectNoActiveSprint();
    await sprints.open();
    await sprints.expectEmptyState();
  });
});
