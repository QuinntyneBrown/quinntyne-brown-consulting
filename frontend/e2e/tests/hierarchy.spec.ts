import { test } from '../fixtures/workboard.fixture';
import {
  epicWithoutStories,
  initiativeCountingOne,
  initiativeWithoutEpics,
} from '../mocks/workspace-scenarios';
import { BacklogPage } from '../pages/backlog.page';
import { EpicSummaryPage } from '../pages/epic-summary.page';
import { HierarchyPage } from '../pages/hierarchy.page';
import { InitiativeBriefPage } from '../pages/initiative-brief.page';
import { WorkboardPage } from '../pages/workboard.page';

const OUTCOME = 'Sustainable delivery economics';
const OUTCOME_BRIEF = [
  '# Sustainable delivery economics',
  '',
  'Make every engagement profitable without eroding quality.',
].join('\n');
const OUTCOME_SUMMARY = 'Make every engagement profitable without eroding quality.';
const CAPABILITY = 'Engagement margin insight';
const CAPABILITY_SUMMARY = [
  '# Engagement margin insight',
  '',
  'Show where an engagement earns and where it leaks.',
].join('\n');
const CAPABILITY_PROSE = 'Show where an engagement earns and where it leaks.';

test.beforeEach(async ({ page }) => {
  await new WorkboardPage(page).navigateTo('initiatives');
});

test('L2-002 · Create an initiative', { tag: '@smoke' }, async ({ page }) => {
  const hierarchy = new HierarchyPage(page);
  const editor = new InitiativeBriefPage(page);
  await editor.startNew();
  await editor.writeInitiative(OUTCOME, OUTCOME_BRIEF);

  await hierarchy.returnToHierarchy();
  await new WorkboardPage(page).reload();
  await hierarchy.expectInitiativeRollUp(OUTCOME, 0, 0);
});

test('L2-002 · Author the description only as markdown', async ({ page }) => {
  const hierarchy = new HierarchyPage(page);
  const editor = new InitiativeBriefPage(page);

  // Creating one offers the markdown editor and no plain-text description anywhere.
  await editor.startNew();
  await editor.expectNoPlainDescriptionField();
  await editor.writeInitiative(OUTCOME, OUTCOME_BRIEF);

  // Updating one arrives at the same surface.
  await hierarchy.returnToHierarchy();
  await editor.openFrom(OUTCOME);
  await editor.expectNoPlainDescriptionField();

  // The hierarchy reads the brief rather than reprinting its markdown source.
  await hierarchy.returnToHierarchy();
  await hierarchy.expectInitiativeSummarised(OUTCOME, OUTCOME_SUMMARY);
  await hierarchy.expectInitiativeNotMarkdownSource(OUTCOME, '# Sustainable delivery economics');
});

test('L2-002 · Reject an invalid initiative', async ({ page }) => {
  const hierarchy = new HierarchyPage(page);
  const editor = new InitiativeBriefPage(page);
  await editor.startNew();
  await editor.clearBrief();
  await editor.saveExpectingRejection('Initiative name', 'Outcome brief');

  // Nothing was stored, and leaving the refused draft asks before discarding it.
  await editor.leaveForInitiatives({ guarded: true });
  await hierarchy.expectInitiativeCount(2);
});

test('L2-002 · Update an initiative', async ({ page }) => {
  const hierarchy = new HierarchyPage(page);
  const editor = new InitiativeBriefPage(page);
  const workboard = new WorkboardPage(page);
  await editor.openFrom('Applied AI advantage');
  await editor.writeInitiative(OUTCOME, OUTCOME_BRIEF);

  await hierarchy.returnToHierarchy();
  await workboard.reload();
  await hierarchy.expectEpicUnder(OUTCOME, 'Engagement copilot');

  // The new name reaches every view that names the initiative.
  await workboard.usePrimaryNavigation('Backlog');
  await new BacklogPage(page).expectRowDetail('Create an AI engagement risk canvas', {
    key: 'QBC-105',
    initiative: OUTCOME,
    epic: 'Engagement copilot',
    state: 'ready',
    points: '3 story points',
    sprint: 'Backlog',
  });
});

test.describe(initiativeWithoutEpics.name, () => {
  test.use({ seed: initiativeWithoutEpics });

  test('L2-002 · Delete an empty initiative', async ({ page }) => {
    const hierarchy = new HierarchyPage(page);
    await hierarchy.deleteInitiative('Retired advisory practice');
    await new WorkboardPage(page).reload();
    await hierarchy.expectInitiativeCount(2);
  });
});

test('L2-002 · Protect an initiative with epics', async ({ page }) => {
  const hierarchy = new HierarchyPage(page);
  await hierarchy.expectInitiativeDeletionRejected(
    'Client delivery excellence',
    'Delete or move the initiative epics first.',
  );
});

test('L2-003 · Create an epic', { tag: '@smoke' }, async ({ page }) => {
  const hierarchy = new HierarchyPage(page);
  const editor = new EpicSummaryPage(page);
  await editor.startNewUnder('Applied AI advantage');
  await editor.writeEpic(CAPABILITY, CAPABILITY_SUMMARY);

  await hierarchy.returnToHierarchy();
  await new WorkboardPage(page).reload();
  await hierarchy.expectEpicUnder('Applied AI advantage', CAPABILITY);
});

test('L2-003 · Author the summary only as markdown', async ({ page }) => {
  const hierarchy = new HierarchyPage(page);
  const editor = new EpicSummaryPage(page);

  // Creating one offers the markdown editor and no plain-text summary anywhere.
  await editor.startNewUnder('Applied AI advantage');
  await editor.expectNoPlainSummaryField();
  await editor.writeEpic(CAPABILITY, CAPABILITY_SUMMARY);

  // Updating one arrives at the same surface.
  await hierarchy.returnToHierarchy();
  await editor.openFrom(CAPABILITY);
  await editor.expectNoPlainSummaryField();

  // The hierarchy reads the summary rather than reprinting its markdown source.
  await hierarchy.returnToHierarchy();
  await hierarchy.expectEpicSummarised(CAPABILITY, CAPABILITY_PROSE);
  await hierarchy.expectEpicNotMarkdownSource(CAPABILITY, '# Engagement margin insight');
});

test('L2-003 · Update or move an epic', async ({ page }) => {
  const hierarchy = new HierarchyPage(page);
  const editor = new EpicSummaryPage(page);
  const workboard = new WorkboardPage(page);
  await editor.openFrom('Engagement copilot');
  await editor.renameTo(CAPABILITY);
  await editor.write(CAPABILITY_SUMMARY);
  await editor.chooseInitiative('Client delivery excellence');
  await editor.save();
  await editor.expectSaved();

  await hierarchy.returnToHierarchy();
  await workboard.reload();
  await hierarchy.expectEpicUnder('Client delivery excellence', CAPABILITY);

  // Moving the epic keeps the stories that belong to it.
  await workboard.usePrimaryNavigation('Backlog');
  await new BacklogPage(page).expectRowDetail('Evaluate answers against engagement evidence', {
    key: 'QBC-103',
    initiative: 'Client delivery excellence',
    epic: CAPABILITY,
    state: 'ready',
    points: '5 story points',
    sprint: 'Sprint 14',
  });
});

test.describe(epicWithoutStories.name, () => {
  test.use({ seed: epicWithoutStories });

  test('L2-003 · Delete an empty epic', async ({ page }) => {
    const hierarchy = new HierarchyPage(page);
    await hierarchy.deleteEpic('Retired onboarding kit');
    await new WorkboardPage(page).reload();
    await hierarchy.expectInitiativeRollUp('Client delivery excellence', 2, 5);
  });
});

test('L2-003 · Protect an epic with stories', async ({ page }) => {
  await new HierarchyPage(page).expectEpicDeletionRejected(
    'Client delivery portal',
    'Delete or move the epic stories first.',
  );
});

test('L2-004 · View hierarchy roll-ups', async ({ page }) => {
  const hierarchy = new HierarchyPage(page);
  // The archived QBC-97 is excluded everywhere: roll-ups describe current work.
  await hierarchy.expectInitiativeRollUp('Client delivery excellence', 2, 5);
  await hierarchy.expectInitiativeRollUp('Applied AI advantage', 1, 2);
  await hierarchy.expectEpicUnder('Client delivery excellence', 'Client delivery portal');
  await hierarchy.expectEpicUnder('Client delivery excellence', 'Delivery playbook');
  await hierarchy.expectEpicUnder('Applied AI advantage', 'Engagement copilot');
  await hierarchy.expectEpicRollUp('Client delivery portal', 3, 0);
  await hierarchy.expectEpicRollUp('Delivery playbook', 2, 100);
  await hierarchy.expectEpicRollUp('Engagement copilot', 2, 0);
});

test.describe(initiativeCountingOne.name, () => {
  test.use({ seed: initiativeCountingOne });

  /** A roll-up is read as a sentence, so a count of one takes the singular noun. */
  test('L2-004 · Count a single epic and story in the singular', async ({ page }) => {
    const hierarchy = new HierarchyPage(page);
    await hierarchy.expectInitiativeRollUpText('Single-count outcome', '1 epic · 1 story');
    await hierarchy.expectEpicRollUpText('Single-count capability', '1 story');
  });
});

test('L2-004 · Add nested work in context', async ({ page }) => {
  const editor = new EpicSummaryPage(page);
  await editor.startNewUnder('Applied AI advantage');
  await editor.expectInitiative('Applied AI advantage');
});
