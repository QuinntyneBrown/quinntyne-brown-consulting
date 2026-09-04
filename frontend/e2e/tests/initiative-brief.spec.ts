import { test } from '../fixtures/workboard.fixture';
import { initiativeWithMarkdownBrief } from '../mocks/workspace-scenarios';
import { HierarchyPage } from '../pages/hierarchy.page';
import { InitiativeBriefPage } from '../pages/initiative-brief.page';
import { StoragePage } from '../pages/storage.page';
import { WorkboardPage } from '../pages/workboard.page';

const INITIATIVE = 'Client delivery excellence';
const SHORT_BRIEF = '# Outcome\n\nCommit a sprint in under ten minutes.';

/** Every block an outcome brief uses, so one round trip proves the structure survives storage. */
const STRUCTURED_BRIEF = [
  '# Zero-friction sprint planning',
  '',
  '## Success signals',
  '',
  '| Signal | Baseline | Target |',
  '| --- | --- | --- |',
  '| Time to commit a sprint | 46 min | under 10 min |',
  '',
  '## Guardrails',
  '',
  '- Keep the workspace usable on a phone',
  '  - Committing a sprint stays a desktop action',
  '',
  '## Epics',
  '',
  '- [x] Groom the backlog into a ready queue',
  '- [ ] Roll sprint scope up to the initiative',
].join('\n');

test.use({ seed: initiativeWithMarkdownBrief });

test.beforeEach(async ({ page }) => {
  await new WorkboardPage(page).navigateTo('initiatives');
});

test('L2-046 · Open the brief for an initiative', { tag: '@smoke' }, async ({ page }) => {
  const brief = new InitiativeBriefPage(page);
  await brief.openFrom(INITIATIVE);
  await brief.expectName(INITIATIVE);
  await brief.show('Preview');
  await brief.expectPreviewHeading('Zero-friction sprint planning');

  // The address identifies the initiative, so the brief can be opened directly.
  const address = brief.currentAddress();
  await brief.openAddress(address);
  await brief.expectName(INITIATIVE);
});

test('L2-046 · Save an edited brief', { tag: '@smoke' }, async ({ page }) => {
  const brief = new InitiativeBriefPage(page);
  const workboard = new WorkboardPage(page);
  await brief.openFrom(INITIATIVE);
  await brief.renameTo('Zero-friction sprint planning');
  await brief.writeBrief(SHORT_BRIEF);
  await brief.save();
  await brief.expectSaved();

  await workboard.reload();
  await brief.expectName('Zero-friction sprint planning');
  await brief.show('Preview');
  await brief.expectPreviewText('Commit a sprint in under ten minutes.');

  // The new name reaches the hierarchy the brief was opened from.
  await workboard.usePrimaryNavigation('Initiatives');
  await new HierarchyPage(page).expectInitiativeRollUp('Zero-friction sprint planning', 2, 5);
});

test('L2-046 · Preserve markdown structure', async ({ page }) => {
  const brief = new InitiativeBriefPage(page);
  await brief.openFrom(INITIATIVE);
  await brief.writeBrief(STRUCTURED_BRIEF);
  await brief.save();
  await new WorkboardPage(page).reload();

  // The source came back the same length, and every block still renders as itself.
  await brief.expectCharacterCount(STRUCTURED_BRIEF.length);
  await brief.show('Preview');
  await brief.expectPreviewHeading('Success signals');
  await brief.expectPreviewTableRow('Time to commit a sprint', '46 min', 'under 10 min');
  await brief.expectPreviewNestedItem('Committing a sprint stays a desktop action');
  await brief.expectPreviewTaskList(
    'Groom the backlog into a ready queue',
    'Roll sprint scope up to the initiative',
  );
});

test('L2-046 · Reject a blank brief', async ({ page }) => {
  const brief = new InitiativeBriefPage(page);
  await brief.openFrom(INITIATIVE);
  await brief.renameTo('');
  await brief.clearBrief();
  await brief.saveExpectingRejection('Initiative name', 'Outcome brief');
});

test('L2-047 · Apply markdown formatting', async ({ page }) => {
  const brief = new InitiativeBriefPage(page);
  await brief.openFrom(INITIATIVE);
  await brief.writeBrief('Commit a sprint quickly.');
  await brief.selectWholeBrief();

  await brief.applyFormatting('Bold');
  await brief.show('Preview');
  await brief.expectPreviewEmphasises('Commit a sprint quickly.');

  // The same command again takes the marks back off.
  await brief.show('Write');
  await brief.selectWholeBrief();
  await brief.applyFormatting('Bold');
  await brief.show('Preview');
  await brief.expectPreviewHasNoEmphasis();
});

test('L2-047 · Insert a brief building block', async ({ page }) => {
  const brief = new InitiativeBriefPage(page);
  await brief.openFrom(INITIATIVE);
  await brief.writeBrief('Commit a sprint quickly.');
  await brief.insertBuildingBlock('Success signals table');
  await brief.expectUnsavedChanges();

  await brief.show('Preview');
  await brief.expectPreviewHeading('Success signals');
  await brief.expectPreviewTableRow('Signal', 'Baseline', 'Target');
});

test('L2-047 · Preview the rendered brief', { tag: '@smoke' }, async ({ page }) => {
  const brief = new InitiativeBriefPage(page);
  await brief.openFrom(INITIATIVE);
  await brief.show('Preview');
  await brief.expectPreviewHeading('Zero-friction sprint planning');
  await brief.expectPreviewEmphasises('spreadsheet archaeology');
  await brief.expectPreviewTableRow('Time to commit a sprint', 'under 10 min');
  await brief.expectPreviewCodeBlock('SELECT i.Id');

  // The markdown source is one click away again.
  await brief.show('Write');
  await brief.expectOpen();
});

test('L2-047 · Navigate the brief by heading', async ({ page }) => {
  const brief = new InitiativeBriefPage(page);
  await brief.openFrom(INITIATIVE);
  await brief.expectOutlineLists('Zero-friction sprint planning', 'Outcome', 'Guardrails', 'Epics');
  await brief.selectOutlineHeading('Epics');
  await brief.expectCurrentOutlineHeading('Epics');
});

test('L2-047 · Report the size of a brief', async ({ page }) => {
  const brief = new InitiativeBriefPage(page);
  await brief.openFrom(INITIATIVE);
  await brief.writeBrief('Commit a sprint in under ten minutes.');
  await brief.expectSize(7, 37);
});

test('L2-047 · Guide an empty brief', async ({ page }) => {
  const brief = new InitiativeBriefPage(page);
  await brief.openFrom(INITIATIVE);
  await brief.clearBrief();
  await brief.expectEmptyBriefGuidance();

  await brief.acceptTheEmptyBriefTemplate();
  await brief.show('Preview');
  await brief.expectPreviewHeading('Outcome');
  await brief.expectPreviewHeading('Success signals');
});

test('L2-048 · Report unsaved changes', async ({ page }) => {
  const brief = new InitiativeBriefPage(page);
  await brief.openFrom(INITIATIVE);
  await brief.expectSaved();
  await brief.writeBrief(SHORT_BRIEF);
  await brief.expectUnsavedChanges();
});

test('L2-048 · Discard unsaved changes', async ({ page }) => {
  const brief = new InitiativeBriefPage(page);
  await brief.openFrom(INITIATIVE);
  await brief.writeBrief(SHORT_BRIEF);
  await brief.discard();

  await brief.expectSaved();
  await brief.show('Preview');
  await brief.expectPreviewHeading('Zero-friction sprint planning');
});

test(
  'L2-048 · Guard a navigation away from unsaved changes',
  { tag: '@smoke' },
  async ({ page }) => {
    const brief = new InitiativeBriefPage(page);
    await brief.openFrom(INITIATIVE);
    await brief.writeBrief(SHORT_BRIEF);

    await brief.leaveForBacklog();
    await brief.expectGuardOffersEveryChoice();

    // Keeping the brief open leaves the unsaved work exactly where it was.
    await brief.chooseFromGuard('Keep editing');
    await brief.expectOpen();
    await brief.expectUnsavedChanges();
  },
);

test('L2-048 · Save and continue from the guard', async ({ page }) => {
  const brief = new InitiativeBriefPage(page);
  await brief.openFrom(INITIATIVE);
  await brief.renameTo('Zero-friction sprint planning');
  await brief.writeBrief(SHORT_BRIEF);

  await brief.leaveForBacklog();
  await brief.chooseFromGuard('Save and continue');
  await brief.expectLeftForBacklog();

  // The brief was persisted on the way out.
  await new WorkboardPage(page).usePrimaryNavigation('Initiatives');
  await new HierarchyPage(page).expectInitiativeRollUp('Zero-friction sprint planning', 2, 5);
});

test('L2-048 · Keep the brief out of browser storage', async ({ page }) => {
  const brief = new InitiativeBriefPage(page);
  await brief.openFrom(INITIATIVE);
  await brief.writeBrief(SHORT_BRIEF);
  await brief.expectUnsavedChanges();

  await new StoragePage(page).expectOnlyCredentialStored();
});
