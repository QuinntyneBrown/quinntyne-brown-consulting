import { test } from '../fixtures/workboard.fixture';
import { AccessibilityPage } from '../pages/accessibility.page';
import { AssistantsPage } from '../pages/assistants.page';
import { BacklogPage } from '../pages/backlog.page';
import { BoardPage } from '../pages/board.page';
import { SprintManagerPage } from '../pages/sprint-manager.page';
import { WorkboardPage, type WorkspaceRoute } from '../pages/workboard.page';

const ROUTES: readonly WorkspaceRoute[] = ['board', 'backlog', 'initiatives', 'assistants'];

test('L2-025 · Navigate by keyboard', async ({ page }) => {
  const workboard = new WorkboardPage(page);
  const accessibility = new AccessibilityPage(page);

  await workboard.navigateTo('board');
  await accessibility.expectSkipLinkReachesContent();

  await workboard.navigateTo('board');
  await accessibility.expectFocusVisible();
  await accessibility.expectFocusOrderReversible();
  await accessibility.expectActionsReachableByKeyboard(
    'Skip to content',
    'Board',
    'Backlog',
    'New story',
    'Manage sprints',
    'Complete sprint',
    'Move Capture a client decision forward',
    'Edit',
  );
});

test('L2-025 · Use a dialog', { tag: '@smoke' }, async ({ page }) => {
  const workboard = new WorkboardPage(page);
  const accessibility = new AccessibilityPage(page);

  // A form dialog, opened from the bar.
  await workboard.navigateTo('board');
  await accessibility.expectDialogTrapsFocusAndReturns(/New story/, 'New story');

  // A confirmation dialog, opened from a record it names.
  await workboard.usePrimaryNavigation('Initiatives');
  await accessibility.expectDialogTrapsFocusAndReturns('Delete', /Delete .+\?/);
});

test('L2-025 · Interpret status without color', async ({ page }) => {
  const workboard = new WorkboardPage(page);

  await workboard.navigateTo('backlog');
  // Lifecycle and readiness.
  await new BacklogPage(page).expectStatusInWords('ready', 'draft');
  await new BacklogPage(page).filterBy('Archived');
  await new BacklogPage(page).expectStatusInWords('archived');

  // Availability.
  await workboard.usePrimaryNavigation('Assistants');
  const assistants = new AssistantsPage(page);
  await assistants.expectAvailabilityInWords('Maya Chen', 'Available');
  await assistants.expectAvailabilityInWords('Noah Williams', 'Limited');

  // Sprint status and board status.
  await workboard.usePrimaryNavigation('Board');
  const sprints = new SprintManagerPage(page);
  await sprints.open();
  await sprints.expectStatusInWords('planned', 'active', 'completed');
  await sprints.close();
  await new BoardPage(page).expectStoryInColumn('Capture a client decision', 'To do');
});

test('L2-025 · Announce asynchronous feedback', async ({ page }) => {
  await new WorkboardPage(page).navigateTo('board');
  await new AccessibilityPage(page).expectAnnouncementWithoutMovingFocus(
    'Move Capture a client decision forward',
    'Story moved.',
  );
});

test('L2-040 · Verify accessibility on every primary route', async ({ page }) => {
  test.slow();
  const workboard = new WorkboardPage(page);
  const accessibility = new AccessibilityPage(page);
  for (const route of ROUTES) {
    await workboard.navigateTo(route);
    await accessibility.expectNoSeriousViolations();
  }
});

test('L2-040 · Verify accessibility on every dialog type', async ({ page }) => {
  test.slow();
  const workboard = new WorkboardPage(page);
  const accessibility = new AccessibilityPage(page);

  await workboard.navigateTo('board');
  await accessibility.scanDialogOpenedBy(/New story/, 'New story');
  const sprints = new SprintManagerPage(page);
  await sprints.open();
  await accessibility.expectNoSeriousViolations();
  await accessibility.scanDialogOpenedBy(/New sprint/, 'New sprint', 'Manage sprints');
  await accessibility.scanDialogOpenedBy('Start', /Start .+\?/, 'Manage sprints');
  await sprints.close();

  await workboard.navigateTo('initiatives');
  await accessibility.scanDialogOpenedBy(/New initiative/, 'New initiative');
  await accessibility.scanDialogOpenedBy(/Epic/, 'New epic');
  await accessibility.scanDialogOpenedBy('Delete', /Delete .+\?/);

  await workboard.navigateTo('assistants');
  await accessibility.scanDialogOpenedBy(/New assistant/, 'New assistant');
  await accessibility.scanDialogOpenedBy('Delete', 'Reassign work first');
});
