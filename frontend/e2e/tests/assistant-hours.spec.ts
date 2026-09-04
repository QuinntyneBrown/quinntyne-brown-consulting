import { test } from '../fixtures/workboard.fixture';
import { assistantWithOnlyLoggedHours } from '../mocks/workspace-scenarios';
import { AssistantHoursPage } from '../pages/assistant-hours.page';
import { AssistantsPage } from '../pages/assistants.page';
import { WorkboardPage } from '../pages/workboard.page';

const HEALTH_SUMMARY = 'Publish a concise engagement health summary';
const CHECKLIST = 'Create a weekly delivery checklist';
const DECISION = 'Capture a client decision';

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
