import { test } from '../fixtures/workboard.fixture';
import { assistantWithOnlyLoggedHours } from '../mocks/workspace-scenarios';
import { AssistantHoursPage } from '../pages/assistant-hours.page';
import { AssistantsPage } from '../pages/assistants.page';
import { WorkboardPage } from '../pages/workboard.page';

const HEALTH_SUMMARY = 'Publish a concise engagement health summary';
const CHECKLIST = 'Create a weekly delivery checklist';
const DECISION = 'Capture a client decision';
const EVIDENCE = 'Evaluate answers against engagement evidence';
const RISK_CANVAS = 'Create an AI engagement risk canvas';

test.beforeEach(async ({ page }) => {
  await new WorkboardPage(page).navigateTo('assistants');
});

test('L2-051 · Open an assistant’s hours', { tag: '@smoke' }, async ({ page }) => {
  const hours = new AssistantHoursPage(page);
  await hours.openFromDirectory('Noah Williams');
  await hours.expectAssistant('Noah Williams', 'Software development assistant');
  // 4 h and 2.5 h on the health summary, 6 h on the checklist, which is the only one that is done.
  await hours.expectTotals({
    hoursLogged: '12.5 h',
    hoursOnCompleted: '6 h',
    storiesWorkedOn: '2',
    storiesCompleted: '1',
  });
  await hours.expectStories(CHECKLIST, HEALTH_SUMMARY);
  await hours.goBackToDirectory();
});

test('L2-051 · Trace hours to completed stories', async ({ page }) => {
  const hours = new AssistantHoursPage(page);
  await hours.openFromDirectory('Noah Williams');
  await hours.expectCompletedShare(48);
  await hours.expectShareWithinTotal();
  await hours.expectStoryState(CHECKLIST, 'Done');
  await hours.expectStoryState(HEALTH_SUMMARY, 'In progress');
});

test('L2-051 · Filter to completed or in-flight work', async ({ page }) => {
  const hours = new AssistantHoursPage(page);
  await hours.openFromDirectory('Noah Williams');
  await hours.expectResultCount(2, 2);

  await hours.filterBy('Completed');
  await hours.expectStories(CHECKLIST);
  await hours.expectResultCount(1, 2);
  // The totals describe every logged hour, so narrowing the list must not move them.
  await hours.expectTotals({
    hoursLogged: '12.5 h',
    hoursOnCompleted: '6 h',
    storiesWorkedOn: '2',
    storiesCompleted: '1',
  });

  await hours.filterBy('In flight');
  await hours.expectStories(HEALTH_SUMMARY);
  await hours.expectResultCount(1, 2);

  await hours.filterBy('All');
  await hours.expectStories(CHECKLIST, HEALTH_SUMMARY);
  await hours.expectResultCount(2, 2);
});

test('L2-051 · Read the entries behind a story', async ({ page }) => {
  const hours = new AssistantHoursPage(page);
  await hours.openFromDirectory('Noah Williams');
  await hours.expandStory(HEALTH_SUMMARY);
  await hours.expectEntries(
    HEALTH_SUMMARY,
    { date: '2026-08-24', hours: '4 h', note: 'Built the summary card' },
    { date: '2026-08-25', hours: '2.5 h', note: 'Wired the health signals' },
  );
  // Maya logged an hour and a half against the same story, so the story holds more than his share.
  await hours.expectStoryHours(HEALTH_SUMMARY, '6.5 h', '8 h');
});

test('L2-051 · Guide an assistant with no logged hours', async ({ page }) => {
  const hours = new AssistantHoursPage(page);
  await hours.openFromDirectory('Amara Okafor');
  await hours.expectTotals({
    hoursLogged: '0 h',
    hoursOnCompleted: '0 h',
    storiesWorkedOn: '0',
    storiesCompleted: '0',
  });
  await hours.expectEmptyState();
});

test('L2-050 · Log hours against a story', { tag: '@smoke' }, async ({ page }) => {
  const workboard = new WorkboardPage(page);
  const hours = new AssistantHoursPage(page);
  await hours.openFromDirectory('Noah Williams');
  // Half hours are ordinary: the field must accept a quarter-hour increment.
  await hours.expectHoursFieldAcceptsQuarters();
  await hours.logHours({
    story: `QBC-102 · ${DECISION}`,
    workedOn: '2026-08-27',
    hours: '2.5',
    note: 'Drafted the decision format',
  });

  await hours.expectTotals({
    hoursLogged: '15 h',
    hoursOnCompleted: '6 h',
    storiesWorkedOn: '3',
    storiesCompleted: '1',
  });
  await hours.expectStories(DECISION, CHECKLIST, HEALTH_SUMMARY);

  await workboard.reload();
  await hours.expandStory(DECISION);
  await hours.expectEntries(DECISION, {
    date: '2026-08-27',
    hours: '2.5 h',
    note: 'Drafted the decision format',
  });
});

test('L2-058 · Record from the assistant hours page', { tag: '@smoke' }, async ({ page }) => {
  const workboard = new WorkboardPage(page);
  const hours = new AssistantHoursPage(page);
  await hours.openFromDirectory('Noah Williams');

  await hours.openGroupLog();
  await hours.pickStory(`QBC-102 · ${DECISION}`);
  await hours.pickStory(`QBC-105 · ${RISK_CANVAS}`);
  await hours.fillGroupLog({ workedOn: '2026-09-01', total: '3', note: 'Paired on the portal' });
  await hours.expectSplitPreview(
    { story: DECISION, hours: '1.5 h' },
    { story: RISK_CANVAS, hours: '1.5 h' },
  );
  await hours.submitGroupLog();

  // Both stories carry an ordinary entry each, and the totals moved by the whole amount.
  await hours.expectTotals({
    hoursLogged: '15.5 h',
    hoursOnCompleted: '6 h',
    storiesWorkedOn: '4',
    storiesCompleted: '1',
  });
  await hours.expectStories(DECISION, RISK_CANVAS, CHECKLIST, HEALTH_SUMMARY);
  await hours.expectStoryHours(DECISION, '1.5 h', '1.5 h');
  await hours.expectStoryHours(RISK_CANVAS, '1.5 h', '1.5 h');

  await workboard.reload();
  await hours.expandStory(RISK_CANVAS);
  await hours.expectEntries(RISK_CANVAS, {
    date: '2026-09-01',
    hours: '1.5 h',
    note: 'Paired on the portal',
  });
});

test('L2-058 · Preview the division before submitting', async ({ page }) => {
  const hours = new AssistantHoursPage(page);
  await hours.openFromDirectory('Noah Williams');

  await hours.openGroupLog();
  await hours.pickStory(`QBC-102 · ${DECISION}`);
  await hours.pickStory(`QBC-103 · ${EVIDENCE}`);
  await hours.pickStory(`QBC-105 · ${RISK_CANVAS}`);
  await hours.fillGroupLog({ total: '5' });
  // The remainder lands on the first story chosen, in the order the list shows them.
  await hours.expectSplitPreview(
    { story: DECISION, hours: '2 h' },
    { story: EVIDENCE, hours: '1.5 h' },
    { story: RISK_CANVAS, hours: '1.5 h' },
  );
  await hours.expectSplitSummary('5 h across 3 stories');

  // The preview follows the total and the chosen stories.
  await hours.fillGroupLog({ total: '3' });
  await hours.expectSplitPreview(
    { story: DECISION, hours: '1 h' },
    { story: EVIDENCE, hours: '1 h' },
    { story: RISK_CANVAS, hours: '1 h' },
  );
  await hours.unpickStory(`QBC-103 · ${EVIDENCE}`);
  await hours.expectSplitPreview(
    { story: DECISION, hours: '1.5 h' },
    { story: RISK_CANVAS, hours: '1.5 h' },
  );

  // Nothing was sent.
  await hours.cancelGroupLog();
  await hours.expectTotals({
    hoursLogged: '12.5 h',
    hoursOnCompleted: '6 h',
    storiesWorkedOn: '2',
    storiesCompleted: '1',
  });
});

test('L2-058 · Reject an invalid group entry', async ({ page }) => {
  const hours = new AssistantHoursPage(page);
  await hours.openFromDirectory('Noah Williams');

  // The form refuses an empty group before anything is sent.
  await hours.openGroupLog();
  await hours.fillGroupLog({ total: '2' });
  await hours.expectGroupLogRejected(/at least one story/);

  // A total that cannot give every story a quarter hour is refused by the server.
  await hours.pickStory(`QBC-102 · ${DECISION}`);
  await hours.pickStory(`QBC-103 · ${EVIDENCE}`);
  await hours.pickStory(`QBC-105 · ${RISK_CANVAS}`);
  await hours.fillGroupLog({ total: '0.5' });
  await hours.expectGroupLogRejected(/quarter hour/);
  await hours.cancelGroupLog();

  await hours.expectTotals({
    hoursLogged: '12.5 h',
    hoursOnCompleted: '6 h',
    storiesWorkedOn: '2',
    storiesCompleted: '1',
  });
});

test('L2-050 · Reject an invalid entry', async ({ page }) => {
  const hours = new AssistantHoursPage(page);
  await hours.openFromDirectory('Noah Williams');
  // The form catches a missing amount before anything is sent.
  await hours.expectEntryRejected('', 'Hours');
  // A day holds 24 hours, which the browser has no way to know, so the server refuses 25.
  await hours.expectEntryRejected('25', /quarter-hour increments/);
  // Neither refusal wrote anything.
  await hours.expectTotals({
    hoursLogged: '12.5 h',
    hoursOnCompleted: '6 h',
    storiesWorkedOn: '2',
    storiesCompleted: '1',
  });
});

test('L2-050 · Amend an entry', async ({ page }) => {
  const workboard = new WorkboardPage(page);
  const hours = new AssistantHoursPage(page);
  await hours.openFromDirectory('Noah Williams');
  await hours.expandStory(HEALTH_SUMMARY);
  // A correction starts from what was recorded rather than from a blank form.
  await hours.expectEditFormShows(HEALTH_SUMMARY, '4 h', {
    story: `QBC-101 · ${HEALTH_SUMMARY}`,
    workedOn: '2026-08-24',
    hours: '4',
    note: 'Built the summary card',
  });

  await hours.editEntry(HEALTH_SUMMARY, '4 h', {
    hours: '5.5',
    note: 'Built the summary card and its totals',
  });

  // The correction replaces the reading rather than adding a second one beside it.
  await hours.expectTotals({
    hoursLogged: '14 h',
    hoursOnCompleted: '6 h',
    storiesWorkedOn: '2',
    storiesCompleted: '1',
  });
  await hours.expectStoryHours(HEALTH_SUMMARY, '8 h', '9.5 h');

  await workboard.reload();
  await hours.expandStory(HEALTH_SUMMARY);
  await hours.expectEntries(
    HEALTH_SUMMARY,
    { date: '2026-08-24', hours: '5.5 h', note: 'Built the summary card and its totals' },
    { date: '2026-08-25', hours: '2.5 h', note: 'Wired the health signals' },
  );
});

test('L2-050 · Reject an invalid amendment', async ({ page }) => {
  const hours = new AssistantHoursPage(page);
  await hours.openFromDirectory('Noah Williams');
  await hours.expandStory(HEALTH_SUMMARY);
  // The form catches a cleared amount; the server catches one a day cannot hold.
  await hours.expectAmendmentRejected(HEALTH_SUMMARY, '4 h', '', 'Hours');
  await hours.expectAmendmentRejected(HEALTH_SUMMARY, '4 h', '25', /quarter-hour increments/);
  // Neither refusal moved the entry it was correcting.
  await hours.expectTotals({
    hoursLogged: '12.5 h',
    hoursOnCompleted: '6 h',
    storiesWorkedOn: '2',
    storiesCompleted: '1',
  });
});

test('L2-050 · Delete an entry', async ({ page }) => {
  const workboard = new WorkboardPage(page);
  const hours = new AssistantHoursPage(page);
  await hours.openFromDirectory('Noah Williams');
  await hours.expandStory(HEALTH_SUMMARY);
  await hours.deleteEntry(HEALTH_SUMMARY, '4 h');

  await hours.expectTotals({
    hoursLogged: '8.5 h',
    hoursOnCompleted: '6 h',
    storiesWorkedOn: '2',
    storiesCompleted: '1',
  });
  await hours.expectStoryHours(HEALTH_SUMMARY, '2.5 h', '4 h');

  await workboard.reload();
  await hours.expandStory(HEALTH_SUMMARY);
  await hours.expectEntries(HEALTH_SUMMARY, {
    date: '2026-08-25',
    hours: '2.5 h',
    note: 'Wired the health signals',
  });
});

test.describe(assistantWithOnlyLoggedHours.name, () => {
  test.use({ seed: assistantWithOnlyLoggedHours });

  test('L2-050 · Protect an assistant with logged hours', async ({ page }) => {
    const assistants = new AssistantsPage(page);
    // Priya owns no story and holds no task; only the hours she logged stand in the way.
    await assistants.expectGuardedDeletion(
      'Priya Raman',
      'Evaluate answers against engagement evidence',
    );
    await assistants.expectAssistant('Priya Raman');
  });
});
