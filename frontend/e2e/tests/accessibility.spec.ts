import { test } from '../fixtures/workboard.fixture';
import { AccessibilityPage } from '../pages/accessibility.page';
import { AssistantHoursPage } from '../pages/assistant-hours.page';
import { AssistantsPage } from '../pages/assistants.page';
import { BacklogPage } from '../pages/backlog.page';
import { BoardPage } from '../pages/board.page';
import { EpicSummaryPage } from '../pages/epic-summary.page';
import { AttachmentsPage } from '../pages/attachments.page';
import { InitiativeBriefPage } from '../pages/initiative-brief.page';
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
  await accessibility.scanDialogOpenedBy('Delete', /Delete .+\?/);

  await workboard.navigateTo('assistants');
  await accessibility.scanDialogOpenedBy(/New assistant/, 'New assistant');
  await accessibility.scanDialogOpenedBy('Delete', 'Reassign work first');
});

test('L2-040 · Verify accessibility on assistant hours', async ({ page }) => {
  const workboard = new WorkboardPage(page);
  const accessibility = new AccessibilityPage(page);
  const hours = new AssistantHoursPage(page);

  await workboard.navigateTo('assistants');
  await hours.openFromDirectory('Noah Williams');
  await accessibility.expectNoSeriousViolations();

  // The disclosed entries and the logging dialog are both part of the page's surface.
  await hours.expandStory('Publish a concise engagement health summary');
  await accessibility.expectNoSeriousViolations();
  await accessibility.scanDialogOpenedBy(/Log hours/, 'Log hours');

  // The empty state is its own layout, and nobody should meet a meter with nothing to measure.
  await workboard.navigateTo('assistants');
  await hours.openFromDirectory('Amara Okafor');
  await accessibility.expectNoSeriousViolations();
});

test('L2-040 · Verify accessibility on the epic summary', async ({ page }) => {
  const workboard = new WorkboardPage(page);
  const accessibility = new AccessibilityPage(page);
  const epic = new EpicSummaryPage(page);

  await workboard.navigateTo('initiatives');

  // A new epic is written on the same route, so the scan covers it before an existing one.
  await epic.startNewUnder('Client delivery excellence');
  await accessibility.expectNoSeriousViolationsOutside('app-markdown-editor');
  await epic.leaveForInitiatives();

  await epic.openFrom('Client delivery portal');
  await accessibility.expectNoSeriousViolationsOutside('app-markdown-editor');
});

test('L2-040 · Verify accessibility on work item attachments', async ({ page }) => {
  const workboard = new WorkboardPage(page);
  const accessibility = new AccessibilityPage(page);
  const brief = new InitiativeBriefPage(page);
  const attachments = new AttachmentsPage(page);

  await workboard.navigateTo('initiatives');
  await brief.openFrom('Client delivery excellence');

  // The panel is scanned empty, holding a file, and with its removal question open, because each
  // state introduces controls the others do not have.
  await attachments.expectEmptyState();
  await accessibility.expectNoSeriousViolationsOutside('app-markdown-editor');

  await attachments.attach({ name: 'planning-outcome-brief.pdf' });
  await attachments.expectFiles('planning-outcome-brief.pdf');
  await accessibility.expectNoSeriousViolationsOutside('app-markdown-editor');
});

test('L2-040 · Verify accessibility on the initiative brief', async ({ page }) => {
  test.slow();
  const workboard = new WorkboardPage(page);
  const accessibility = new AccessibilityPage(page);
  const brief = new InitiativeBriefPage(page);

  await workboard.navigateTo('initiatives');

  // A new initiative is written on the same route, so the scan covers it before an existing one.
  await brief.startNew();
  await accessibility.expectNoSeriousViolationsOutside('app-markdown-editor');
  await brief.leaveForInitiatives();

  await brief.openFrom('Client delivery excellence');
  // The markdown editor is a third-party control with an accessibility mode of its own, so the
  // scan covers the page around it rather than its internals.
  await accessibility.expectNoSeriousViolationsOutside('app-markdown-editor');

  // The unsaved-changes question is the one dialog this route raises.
  await brief.writeBrief('# Outcome');
  await brief.leaveForBacklog();
  await accessibility.expectNoSeriousViolationsOutside('app-markdown-editor');
  await brief.chooseFromGuard('Discard changes');
});
