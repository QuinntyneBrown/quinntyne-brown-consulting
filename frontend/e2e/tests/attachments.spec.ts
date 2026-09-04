import { test } from '../fixtures/workboard.fixture';
import { AttachmentsPage } from '../pages/attachments.page';
import { BacklogPage } from '../pages/backlog.page';
import { EpicSummaryPage } from '../pages/epic-summary.page';
import { HierarchyPage } from '../pages/hierarchy.page';
import { InitiativeBriefPage } from '../pages/initiative-brief.page';
import { StoryEditorPage } from '../pages/story-editor.page';
import { WorkboardPage } from '../pages/workboard.page';

const INITIATIVE = 'Client delivery excellence';
const EPIC = 'Client delivery portal';
const STORY = 'Publish a concise engagement health summary';

const BRIEF = 'planning-outcome-brief.pdf';
const MODEL = 'capacity-model.xlsx';

test('L2-053 · Attach a file from the work item', { tag: '@smoke' }, async ({ page }) => {
  await new WorkboardPage(page).navigateTo('initiatives');
  await new InitiativeBriefPage(page).openFrom(INITIATIVE);

  const attachments = new AttachmentsPage(page);
  await attachments.expectVisible();
  await attachments.attach({ name: BRIEF });

  // The list reports the new file without the reader reloading the page.
  await attachments.expectFiles(BRIEF);
});

test('L2-053 · Read the files attached to a work item', async ({ page }) => {
  await new WorkboardPage(page).navigateTo('initiatives');
  await new InitiativeBriefPage(page).openFrom(INITIATIVE);

  const attachments = new AttachmentsPage(page);
  await attachments.attach({ name: BRIEF, contents: 'A brief.' });
  await attachments.attach({ name: MODEL, contents: 'A model that is a little longer.' });

  await attachments.expectFiles(MODEL, BRIEF);
  await attachments.expectSize(BRIEF, '8 B');
  await attachments.expectFileDetail(BRIEF, /\w{3} \d{1,2}, \d{4}/);
});

test('L2-053 · Download an attached file', async ({ page }) => {
  await new WorkboardPage(page).navigateTo('initiatives');
  await new InitiativeBriefPage(page).openFrom(INITIATIVE);

  const attachments = new AttachmentsPage(page);
  await attachments.attach({ name: BRIEF });

  // The file is delivered under the name it was attached with.
  const savedAs = await attachments.download(BRIEF);
  await test.expect(savedAs).toBe(BRIEF);
});

test('L2-053 · Remove an attached file', async ({ page }) => {
  await new WorkboardPage(page).navigateTo('initiatives');
  await new InitiativeBriefPage(page).openFrom(INITIATIVE);

  const attachments = new AttachmentsPage(page);
  await attachments.attach({ name: BRIEF });
  await attachments.attach({ name: MODEL });

  // Cancelling the confirmation leaves the file exactly where it was.
  await attachments.remove(BRIEF, { confirm: false });
  await attachments.expectFiles(MODEL, BRIEF);

  await attachments.remove(BRIEF);
  await attachments.expectFiles(MODEL);
});

test('L2-053 · Guide a work item with no attachments', async ({ page }) => {
  await new WorkboardPage(page).navigateTo('initiatives');
  await new InitiativeBriefPage(page).openFrom(INITIATIVE);

  await new AttachmentsPage(page).expectEmptyState();
});

test('L2-053 · Report a refused file', async ({ page }) => {
  await new WorkboardPage(page).navigateTo('initiatives');
  await new InitiativeBriefPage(page).openFrom(INITIATIVE);

  const attachments = new AttachmentsPage(page);
  await attachments.attach({ name: BRIEF });

  // A program is turned away, and the reason is announced rather than silently swallowed.
  await attachments.attach({ name: 'setup.exe', contentType: 'application/octet-stream' });
  await attachments.expectRefused(/Programs and scripts cannot be attached/);
  await attachments.expectFiles(BRIEF);
});

test('L2-053 · Keep a work item’s files to itself', async ({ page }) => {
  const workboard = new WorkboardPage(page);
  const attachments = new AttachmentsPage(page);

  await workboard.navigateTo('initiatives');
  await new InitiativeBriefPage(page).openFrom(INITIATIVE);
  await attachments.attach({ name: BRIEF });
  await attachments.expectFiles(BRIEF);

  // An epic does not show its initiative's files, and does not contribute its own upward.
  await new HierarchyPage(page).returnToHierarchy();
  await new EpicSummaryPage(page).openFrom(EPIC);
  await attachments.expectEmptyState();
  await attachments.attach({ name: 'portal-wireframes.pdf' });
  await attachments.expectFiles('portal-wireframes.pdf');

  await new HierarchyPage(page).returnToHierarchy();
  await new InitiativeBriefPage(page).openFrom(INITIATIVE);
  await attachments.expectFiles(BRIEF);
});

test('L2-053 · Attach a file to a story', async ({ page }) => {
  await new WorkboardPage(page).navigateTo('backlog');
  await new BacklogPage(page).openStory(STORY);

  const attachments = new AttachmentsPage(page);
  await attachments.expectEmptyState();
  await attachments.attach({ name: 'health-summary-card.png', contentType: 'image/png' });
  await attachments.expectFiles('health-summary-card.png');
});

test('L2-053 · Leave a closed story editor out of another work item', async ({ page }) => {
  const workboard = new WorkboardPage(page);
  const attachments = new AttachmentsPage(page);

  // Moving from a story to an initiative shows the initiative's own files. The story editor is a
  // dialog that stays in the DOM once closed, so this pins that its panel does not follow the
  // reader to the next work item.
  await workboard.navigateTo('backlog');
  await new BacklogPage(page).openStory(STORY);
  await attachments.attach({ name: 'health-summary-card.png', contentType: 'image/png' });
  await attachments.expectFiles('health-summary-card.png');
  await new StoryEditorPage(page).close();

  await workboard.navigateTo('initiatives');
  await new InitiativeBriefPage(page).openFrom(INITIATIVE);
  await attachments.expectEmptyState();
  await attachments.attach({ name: BRIEF });
  await attachments.expectFiles(BRIEF);
});
