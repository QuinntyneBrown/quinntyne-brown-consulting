import { chromium, request, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const run = process.env.DEMO_RUN_DIR;
const baseURL = process.env.DEMO_BASE_URL;
if (!run || !baseURL || !process.env.Access__InitialPasscode)
  throw new Error('Run through Record-GroupHoursDemo.ps1.');
const assistantId = '10000000-0000-0000-0000-000000000002';
const note = 'Shared delivery review and follow-up';
const date = '2026-09-21';
const chapters = [];
const captions = [];
const api = await request.newContext({ baseURL, timeout: 15000 });
let browser;
let context;
let page;
let start;
const deadline = setTimeout(() => {
  console.error('Whole-take deadline exceeded.');
  process.exit(1);
}, 240000);
try {
  const unlock = await api.post('/api/access/unlock', {
    data: { passcode: process.env.Access__InitialPasscode },
  });
  expect(unlock.status()).toBe(200);
  const session = await unlock.json();
  const headers = { Authorization: `Bearer ${session.token}` };
  const report = async () => {
    const result = await api.get(`/api/assistants/${assistantId}/hours`, { headers });
    expect(result.status()).toBe(200);
    return result.json();
  };
  expect((await report()).hoursLogged).toBe(8.5);
  await mkdir(path.join(run, 'raw'), { recursive: true });
  browser = await chromium.launch({ headless: true, slowMo: 160 });
  context = await browser.newContext({
    baseURL,
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: path.join(run, 'raw'), size: { width: 1280, height: 720 } },
    storageState: {
      cookies: [],
      origins: [
        {
          origin: baseURL,
          localStorage: [{ name: 'qbc.workboard.access-token', value: JSON.stringify(session) }],
        },
      ],
    },
  });
  context.setDefaultTimeout(15000);
  context.setDefaultNavigationTimeout(30000);
  start = Date.now();
  page = await context.newPage();
  const video = page.video();
  const quiet = (ms) => page.waitForTimeout(ms); // Reading time, never readiness.
  const elapsed = () => (Date.now() - start) / 1000;
  async function caption(title, body, seconds = 6, chapter = false) {
    const time = elapsed();
    if (chapter) chapters.push({ seconds: time, title });
    captions.push({ start: time, end: time + seconds, title, body });
    await page.evaluate(
      ({ title, body }) => {
        document.getElementById('demo-caption')?.remove();
        const card = document.createElement('aside');
        card.id = 'demo-caption';
        card.style.cssText =
          'position:fixed;z-index:2147483647;left:16px;bottom:85px;width:210px;box-sizing:border-box;padding:18px;background:#102a43;color:#fff;border:1px solid #57cdb3;border-radius:12px;box-shadow:0 8px 30px #0003;font-family:Arial,sans-serif;pointer-events:none;';
        const heading = document.createElement('div');
        heading.textContent = title;
        heading.style.cssText =
          'font-size:17px;font-weight:700;line-height:1.35;color:#8cebd4;margin-bottom:10px';
        const text = document.createElement('div');
        text.textContent = body;
        text.style.cssText = 'font-size:16px;line-height:1.5';
        card.append(heading, text);
        (document.querySelector('dialog[open]') || document.body).append(card);
      },
      { title, body },
    );
    await quiet(1000);
    await page.screenshot({
      path: path.join(run, `scene-${String(captions.length).padStart(2, '0')}.png`),
    });
    await quiet((seconds - 1) * 1000);
    await page.evaluate(() => document.getElementById('demo-caption')?.remove());
  }
  const totals = async (logged, completed, stories) => {
    await expect(page.locator('.stat-value')).toHaveText([
      `${logged} h`,
      `${completed} h`,
      String(stories),
      '1',
    ]);
  };
  await page.goto('/assistants');
  await expect(page.getByRole('heading', { level: 1, name: 'Assistants' })).toBeVisible();
  await caption(
    'Log hours across stories',
    'Record one total, preview each share, and save the whole group.',
    7,
    true,
  );
  await page
    .locator('.assistant-card')
    .filter({ hasText: 'Noah Williams' })
    .getByRole('button', { name: 'Hours', exact: true })
    .click();
  await expect(page.getByRole('heading', { name: 'Noah Williams', level: 1 })).toBeVisible();
  await totals(8.5, 2, 2);
  await caption(
    'Start with the assistant',
    'Noah has 8.5 hours logged. Add a shared block of work from this page.',
    7,
    true,
  );
  await page.getByRole('button', { name: 'Log across stories', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Log hours across stories' });
  await expect(dialog).toBeVisible();
  await caption(
    'Choose the stories',
    'Select the three stories the work covered. The list order controls the remainder.',
    7,
    true,
  );
  for (const key of ['QBC-101', 'QBC-102', 'QBC-104']) {
    await dialog.getByRole('checkbox', { name: new RegExp(key) }).check();
    await quiet(1000);
  }
  await dialog.getByLabel('Date worked *').fill(date);
  await dialog.getByLabel('Total hours *').fill('3');
  await expect(dialog.locator('.split-summary')).toHaveText('3 h across 3 stories: 1 h each.');
  await caption(
    'Preview equal shares',
    'Three hours across three stories gives each story one hour.',
    6,
    true,
  );
  await dialog.getByLabel('Total hours *').fill('5');
  await expect(dialog.locator('.split-summary')).toHaveText(
    '5 h across 3 stories: 2 h on the first, then 1.5 h each.',
  );
  for (const [key, hours] of [
    ['QBC-101', '2 h'],
    ['QBC-102', '1.5 h'],
    ['QBC-104', '1.5 h'],
  ]) {
    await expect(dialog.locator('.pick-row').filter({ hasText: key }).locator('.share')).toHaveText(
      hours,
    );
  }
  await caption(
    'Keep the total exact',
    'Five hours becomes 2 + 1.5 + 1.5. The first listed selection receives the remainder.',
    8,
    true,
  );
  await dialog.getByRole('textbox', { name: 'Note', exact: true }).fill(note);
  await dialog.locator('.split-summary').scrollIntoViewIfNeeded();
  await caption(
    'One date and note',
    'The date and this note will be recorded on all three entries.',
    6,
  );
  const savedResponse = page.waitForResponse(
    (r) => r.url().endsWith('/api/time-entries/batch') && r.request().method() === 'POST',
  );
  await dialog.getByRole('button', { name: 'Log across stories', exact: true }).click();
  const saved = await savedResponse;
  expect(saved.status()).toBe(201);
  const entries = await saved.json();
  expect(entries.map((e) => e.hours)).toEqual([2, 1.5, 1.5]);
  expect(entries.every((e) => e.note === note && e.workedOn === date)).toBe(true);
  await expect(dialog).toBeHidden();
  await totals(13.5, 3.5, 3);
  await caption(
    'All three entries saved',
    'The total is now 13.5 hours. Completed work accounts for 3.5 hours.',
    7,
    true,
  );
  for (const [key, hours] of [
    ['QBC-101', '2 h'],
    ['QBC-102', '1.5 h'],
    ['QBC-104', '1.5 h'],
  ]) {
    const row = page.locator('.hours-row').filter({ hasText: key });
    await row.getByRole('button', { name: /^Entries/ }).click();
    const entry = row.locator('.entry').filter({ hasText: note });
    await expect(entry.locator('qbc-count')).toHaveText(hours);
    await expect(entry.locator('.entry-date')).toHaveText(date);
    await entry.scrollIntoViewIfNeeded();
    await caption(
      `${key}: ${hours}`,
      'Each share is an ordinary time entry, with the shared date and note.',
      6,
    );
    await row.getByRole('button', { name: /^Hide/ }).click();
  }
  await page.reload();
  await totals(13.5, 3.5, 3);
  const persisted = await report();
  const newEntries = persisted.stories
    .flatMap((story) => story.entries)
    .filter((e) => e.note === note);
  expect(newEntries).toHaveLength(3);
  expect(newEntries.reduce((sum, entry) => sum + entry.hours, 0)).toBe(5);
  await caption(
    'Still there after reload',
    'The saved entries and totals are loaded again from the workspace.',
    7,
    true,
  );
  await page.getByRole('button', { name: 'Completed', exact: true }).click();
  await expect(page.locator('.result-count')).toHaveText('1 of 3 stories');
  await expect(page.locator('.hours-row')).toHaveCount(1);
  await caption(
    'Read completed work',
    'Filter to the completed story while the overall totals remain visible.',
    6,
  );
  await page.getByRole('button', { name: 'All', exact: true }).click();
  await expect(page.locator('.hours-row')).toHaveCount(3);
  await caption(
    'One total. Three stories.',
    'Five hours recorded together, with every quarter hour accounted for.',
    7,
    true,
  );
  await quiet(2000);
  await context.close();
  context = null;
  await video.saveAs(path.join(run, 'workboard-group-hours.webm'));
  await writeFile(
    path.join(run, 'take.json'),
    JSON.stringify(
      {
        revision: process.env.DEMO_SOURCE_REVISION,
        chapters,
        captions,
        assertions: {
          startingHours: 8.5,
          addedHours: 5,
          finalHours: 13.5,
          hoursOnCompleted: 3.5,
          entries: newEntries.map(({ storyKey, hours, workedOn, note }) => ({
            storyKey,
            hours,
            workedOn,
            note,
          })),
        },
      },
      null,
      2,
    ),
  );
  console.log(
    'Continuous take passed: three persisted entries, five added hours, 13.5 hours total.',
  );
} catch (error) {
  if (page && !page.isClosed())
    await page.screenshot({ path: path.join(run, 'failure.png') }).catch(() => {});
  throw error;
} finally {
  clearTimeout(deadline);
  await context?.close();
  await browser?.close();
  await api.dispose();
}
