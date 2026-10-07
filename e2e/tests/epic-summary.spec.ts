import { test } from '../fixtures/workboard.fixture';
import { MARKDOWN_SUMMARY, epicWithMarkdownSummary } from '../mocks/workspace-scenarios';
import { EpicSummaryPage } from '../pages/epic-summary.page';
import { HierarchyPage } from '../pages/hierarchy.page';
import { StoragePage } from '../pages/storage.page';
import { WorkboardPage } from '../pages/workboard.page';

const EPIC = 'Client delivery portal';
const INITIATIVE = 'Client delivery excellence';
const NEW_EPIC = 'Engagement margin insight';
const SHORT_SUMMARY = '# Scope\n\nShow where an engagement earns.';

test.use({ seed: epicWithMarkdownSummary });

test.beforeEach(async ({ page }) => {
  await new WorkboardPage(page).navigateTo('initiatives');
});

test('L2-049 · Open an epic and its summary', { tag: '@smoke' }, async ({ page }) => {
  const epic = new EpicSummaryPage(page);
  await epic.openFrom(EPIC);
  await epic.expectName(EPIC);
  await epic.expectInitiative(INITIATIVE);
  await epic.show('Preview');
  await epic.expectPreviewHeading('Client delivery portal');

  // The address identifies the epic, so it can be opened directly.
  await epic.openAddress(epic.currentAddress());
  await epic.expectName(EPIC);
});

test('L2-049 · Create an epic from the editor', { tag: '@smoke' }, async ({ page }) => {
  const epic = new EpicSummaryPage(page);
  const hierarchy = new HierarchyPage(page);

  await epic.startNewUnder(INITIATIVE);
  await epic.expectInitiative(INITIATIVE);
  await epic.writeEpic(NEW_EPIC, SHORT_SUMMARY);
  await epic.expectSaved();

  // The address now identifies the epic that was just created.
  await epic.openAddress(epic.currentAddress());
  await epic.expectName(NEW_EPIC);

  await hierarchy.returnToHierarchy();
  await hierarchy.expectEpicUnder(INITIATIVE, NEW_EPIC);
});

test('L2-049 · Save an edited summary', async ({ page }) => {
  const epic = new EpicSummaryPage(page);
  const workboard = new WorkboardPage(page);
  await epic.openFrom(EPIC);
  await epic.renameTo(NEW_EPIC);
  await epic.write(SHORT_SUMMARY);
  await epic.save();
  await epic.expectSaved();

  await workboard.reload();
  await epic.expectName(NEW_EPIC);
  await epic.show('Preview');
  await epic.expectPreviewText('Show where an engagement earns.');
});

test('L2-049 · Preserve markdown structure', async ({ page }) => {
  const epic = new EpicSummaryPage(page);
  await epic.openFrom(EPIC);
  await epic.write(MARKDOWN_SUMMARY);
  await epic.save();
  await new WorkboardPage(page).reload();

  // The source came back the same length, and every block still renders as itself.
  await epic.expectCharacterCount(MARKDOWN_SUMMARY.length);
  await epic.show('Preview');
  await epic.expectPreviewHeading('Scope');
  await epic.expectPreviewEmphasises('calm, shared view');
  await epic.expectPreviewNestedItem('Decisions carry the date they were taken');
});

test('L2-049 · Reject a blank summary', async ({ page }) => {
  const epic = new EpicSummaryPage(page);
  await epic.openFrom(EPIC);
  await epic.renameTo('');
  await epic.clear();
  await epic.saveExpectingRejection('Epic name', 'Summary');
});

test('L2-047 · Guide an empty summary', async ({ page }) => {
  const epic = new EpicSummaryPage(page);
  await epic.openFrom(EPIC);
  await epic.clear();
  await epic.expectEmptySummaryGuidance();
  // An epic has no house shape, so nothing is offered to insert.
  await epic.expectNoTemplateOffered();
});

test('L2-048 · Guard a navigation away from an unsaved summary', async ({ page }) => {
  const epic = new EpicSummaryPage(page);
  await epic.openFrom(EPIC);
  await epic.write(SHORT_SUMMARY);

  await epic.leaveForBacklog();
  await epic.expectGuardOffersEveryChoice();

  // Keeping the epic open leaves the unsaved work exactly where it was.
  await epic.chooseFromGuard('Keep editing');
  await epic.expectOpen();
  await epic.expectUnsavedChanges();
});

test('L2-048 · Save and continue from a new epic', async ({ page }) => {
  const epic = new EpicSummaryPage(page);
  const hierarchy = new HierarchyPage(page);

  // An epic that has never been saved leaves through the same question, and the save it makes on
  // the way out must not replace the navigation the writer asked for.
  await epic.startNewUnder(INITIATIVE);
  await epic.renameTo(NEW_EPIC);
  await epic.write(SHORT_SUMMARY);

  await epic.leaveForBacklog();
  await epic.chooseFromGuard('Save and continue');
  await epic.expectLeftForBacklog();

  await new WorkboardPage(page).usePrimaryNavigation('Initiatives');
  await hierarchy.expectEpicUnder(INITIATIVE, NEW_EPIC);
});

test('L2-048 · Keep the summary out of browser storage', async ({ page }) => {
  const epic = new EpicSummaryPage(page);
  await epic.openFrom(EPIC);
  await epic.write(SHORT_SUMMARY);
  await epic.expectUnsavedChanges();

  await new StoragePage(page).expectOnlyCredentialStored();
});
