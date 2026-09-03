import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const manifest = JSON.parse(readFileSync(
  fileURLToPath(new URL('../component-manifest.json', import.meta.url)), 'utf8'));

const SELECTORS = manifest.components.map(component => component.selector);
const DIALOG_SCENARIOS = manifest.dialogs.reduce((total, item) => total + item.scenarios.length, 0);
const PATTERN_SCENARIOS = manifest.patterns.reduce((total, item) => total + item.scenarios.length, 0);

// The product fixes its supported viewport matrix at these five widths.
const VIEWPORT_MATRIX = [320, 390, 768, 1024, 1440];

const ROUTES = [
  '/#/',
  '/#/foundations',
  '/#/components',
  '/#/components/qbc-button/overview',
  '/#/components/qbc-dialog/api',
  '/#/dialogs/confirm/overview',
  '/#/patterns/board/examples',
];

async function ready(page, route = '/#/') {
  await page.goto(route);
  await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
}

test('home presents the complete live catalog coverage', async ({ page }) => {
  await ready(page);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('quiet, spacious system');

  const metrics = page.locator('.metric strong');
  await expect(metrics.nth(0)).toHaveText(String(SELECTORS.length));
  await expect(metrics.nth(1)).toHaveText(String(DIALOG_SCENARIOS));
  await expect(metrics.nth(2)).toHaveText(String(PATTERN_SCENARIOS));
  await expect(metrics.nth(3)).toHaveText(String(manifest.categories.length));

  await expect(page.locator('[data-component-card]')).toHaveCount(3);
  await expect(page.locator('[data-pattern-card]')).toHaveCount(3);
  await expect(page.locator('[data-dialog-card]')).toHaveCount(3);
});

test('component index renders and upgrades every public component', async ({ page }) => {
  await ready(page, '/#/components');

  await expect(page.locator('[data-component-card]')).toHaveCount(SELECTORS.length);
  for (const selector of SELECTORS) {
    await expect(page.locator(`[data-component-card="${selector}"]`)).toHaveCount(1);
  }

  // A component that fails to register would still render an empty custom element,
  // so assert the upgrade itself rather than merely the presence of a tag.
  const unregistered = await page.evaluate(
    (tags) => tags.filter(tag => !customElements.get(tag)),
    SELECTORS,
  );
  expect(unregistered).toEqual([]);

  // Every specimen must actually draw something.
  const emptyPreviews = await page.evaluate(() =>
    [...document.querySelectorAll('.card-preview')]
      .filter(preview => !preview.firstElementChild)
      .length);
  expect(emptyPreviews).toBe(0);
});

test('component details provide overview, API, examples, and a live playground', async ({ page }) => {
  await ready(page, '/#/components/qbc-button/overview');
  await expect(page.locator('.page-tabs a.active')).toHaveText('Overview');
  await expect(page.locator('.selector-badge')).toHaveText('<qbc-button>');

  await page.locator('.page-tabs a', { hasText: 'Api' }).click();
  // Attributes, slots, and events each get their own table.
  await expect(page.locator('.api-table')).toHaveCount(3);
  await expect(page.locator('.api-table td code', { hasText: 'variant' }).first()).toBeVisible();

  await page.locator('.page-tabs a', { hasText: 'Examples' }).click();
  const playground = page.locator('[data-playground]');
  await expect(playground).toBeVisible();

  // Changing a control must mutate the live element AND the code read back from it.
  await playground.locator('select[data-control="variant"]').selectOption('danger');
  await expect(playground.locator('[data-playground-preview] qbc-button')).toHaveAttribute('variant', 'danger');
  await expect(playground.locator('[data-playground-code]')).toContainText('variant="danger"');

  await playground.locator('input[data-control="disabled"]').check();
  await expect(playground.locator('[data-playground-preview] qbc-button')).toHaveAttribute('disabled', '');

  await playground.locator('[data-playground-reset]').click();
  await expect(playground.locator('[data-playground-preview] qbc-button')).not.toHaveAttribute('variant', 'danger');

  // The matrix is enumerated from the contract, so it must cover every enum value.
  const variantValues = manifest.components
    .find(component => component.selector === 'qbc-button')
    .attributes.filter(attribute => attribute.type === 'enum')
    .reduce((total, attribute) => total + attribute.values.length, 0);
  const booleanValues = manifest.components
    .find(component => component.selector === 'qbc-button')
    .attributes.filter(attribute => attribute.type === 'boolean').length * 2;
  await expect(page.locator('.variant-card')).toHaveCount(variantValues + booleanValues);
});

test('foundations visibly renders every foundation family and icon', async ({ page }) => {
  await ready(page, '/#/foundations');
  for (const heading of ['Colour', 'Typography', 'Space', 'Shape', 'Elevation', 'Motion', 'Icons']) {
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
  }
  await expect(page.locator('.token-card')).toHaveCount(20);
  await expect(page.locator('.icon-card')).toHaveCount(14);

  // The unshipped-font and reduced-motion gaps are documented, not silently inherited.
  await expect(page.locator('.callout', { hasText: 'Inter is requested but never shipped' })).toBeVisible();
  await expect(page.locator('.callout', { hasText: 'Reduced motion is honoured here' })).toBeVisible();
});

test('every dialog family renders inline through the static attribute', async ({ page }) => {
  await ready(page, '/#/dialogs');
  await expect(page.locator('[data-dialog-card]')).toHaveCount(manifest.dialogs.length);

  for (const dialog of manifest.dialogs) {
    await ready(page, `/#/dialogs/${dialog.id}/examples`);
    await expect(page.locator('[data-dialog-scenario]')).toHaveCount(dialog.scenarios.length);
    const inline = page.locator('.dialog-inline > *');
    await expect(inline.first()).toHaveAttribute('static', '');
    await expect(inline.first()).toHaveAttribute('open', '');
  }
});

test('live dialogs trap interaction, close with Escape, and restore focus', async ({ page }) => {
  await ready(page, '/#/dialogs/confirm/examples');

  const opener = page.locator('[data-launch-dialog="confirm"][data-scenario="delete"]').first();
  await opener.click();

  const dialog = page.getByRole('dialog', { name: /Delete QBC-104/ });
  await expect(dialog).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(opener).toBeFocused();

  // Clicking the scrim closes too. The scrim lives inside the shadow root.
  await opener.click();
  await expect(page.getByRole('dialog', { name: /Delete QBC-104/ })).toBeVisible();
  await page.evaluate(() => {
    const host = document.querySelector('#dialog-host qbc-confirm-dialog');
    host.shadowRoot.querySelector('.scrim').click();
  });
  await expect(page.getByRole('dialog', { name: /Delete QBC-104/ })).toHaveCount(0);
  await expect(opener).toBeFocused();
});

test('all pattern families and declared states have responsive renderings', async ({ page }) => {
  await ready(page, '/#/patterns');
  await expect(page.locator('[data-pattern-card]')).toHaveCount(manifest.patterns.length);

  for (const pattern of manifest.patterns) {
    await ready(page, `/#/patterns/${pattern.id}/examples`);
    await expect(page.locator('[data-pattern-scenario]')).toHaveCount(pattern.scenarios.length);
    await expect(page.locator('iframe.pattern-frame')).toHaveCount(pattern.scenarios.length);
  }

  await ready(page, '/#/patterns/board/examples');
  const frame = page.locator('iframe.pattern-frame').first();
  await expect(frame).toHaveAttribute('data-viewport', 'desktop');
  await page.locator('.viewport-controls button[data-viewport="mobile"]').first().click();
  await expect(frame).toHaveAttribute('data-viewport', 'mobile');
});

test('global search finds and opens components, dialogs, and patterns', async ({ page }) => {
  await ready(page);

  await page.locator('#search').fill('story card');
  await expect(page.locator('.search-result')).toHaveCount(1);
  await page.locator('.search-result').first().click();
  await expect(page).toHaveURL(/#\/components\/qbc-story-card\/overview$/);

  // Search spans all three catalogs, so a dialog and a pattern must be reachable too.
  await page.locator('#search').fill('sprint manager');
  await expect(page.locator('.search-result', { hasText: 'Dialog' })
    .filter({ hasText: 'Sprint manager' })).toHaveCount(1);

  await page.locator('#search').fill('Backlog');
  await expect(page.locator('.search-result', { hasText: 'Pattern' })
    .filter({ hasText: 'Backlog' })).toHaveCount(1);

  // "/" is a shortcut into search from anywhere that is not already a field.
  await page.keyboard.press('Escape');
  await page.locator('#main').click({ position: { x: 5, y: 5 } });
  await page.keyboard.press('/');
  await expect(page.locator('#search')).toBeFocused();
});

test('hash deep links and isolated previews load directly', async ({ page }) => {
  await ready(page, '/#/components/qbc-dialog/api');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('.api-table').first()).toBeVisible();
  await expect(page.locator('.page-tabs a.active')).toHaveText('Api');

  await page.goto('/preview.html?type=pattern&item=board&scenario=active');
  await expect(page.locator('qbc-app-shell')).toBeVisible();
  await expect(page.locator('qbc-board-column')).toHaveCount(3);

  await page.goto('/preview.html?type=component&item=qbc-story-card&scenario=');
  await expect(page.locator('qbc-story-card')).toBeVisible();
});

test('has no console, request, or horizontal-layout failures', async ({ page }, testInfo) => {
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];

  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('requestfailed', request => {
    if (request.failure()?.errorText !== 'net::ERR_ABORTED') {
      failedRequests.push(`${request.url()} ${request.failure()?.errorText}`);
    }
  });

  for (const route of ROUTES) {
    await ready(page, route);
    const overflow = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      inner: window.innerWidth,
    }));
    expect(overflow.scroll, `${route} overflows horizontally at ${testInfo.project.name}`)
      .toBeLessThanOrEqual(overflow.inner);
  }

  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
  expect(failedRequests).toEqual([]);
});

test('no supported viewport width scrolls horizontally', async ({ page }, testInfo) => {
  // The five widths are asserted inside one test rather than as five Playwright
  // projects, so the declared matrix is honoured without a five-way fan-out.
  test.skip(testInfo.project.name !== 'desktop', 'The matrix is swept once, from one project.');

  for (const width of VIEWPORT_MATRIX) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/#/', '/#/components', '/#/foundations', '/#/patterns/backlog/examples']) {
      await ready(page, route);
      const overflow = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        inner: window.innerWidth,
      }));
      expect(overflow.scroll, `${route} overflows at ${width}px`).toBeLessThanOrEqual(overflow.inner);
    }
  }
});

test('resizing across the drawer breakpoint never flashes or strands the drawer', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Resize behaviour is checked once.');

  await ready(page);
  await page.setViewportSize({ width: 820, height: 900 });

  // Before the drawer has ever been opened it must not carry a transition, or the
  // breakpoint crossing itself would animate an opaque panel across the page.
  const closed = await page.evaluate(() => {
    const drawer = document.querySelector('.docs-nav');
    return {
      duration: getComputedStyle(drawer).transitionDuration,
      offscreen: drawer.getBoundingClientRect().right <= 0,
    };
  });
  expect(closed.duration).toBe('0s');
  expect(closed.offscreen).toBe(true);

  await page.locator('#menu').click();
  await expect(page.locator('body')).toHaveClass(/nav-open/);

  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator('#nav-scrim')).toBeHidden();
});

test('mobile documentation navigation is keyboard operable', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Drawer keyboard flow is a small-screen concern.');

  await ready(page);
  await page.locator('#menu').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#menu')).toHaveAttribute('aria-expanded', 'true');

  await page.locator('.docs-nav a', { hasText: 'Foundations' }).first().click();
  await expect(page.locator('#menu')).toHaveAttribute('aria-expanded', 'false');
  await expect(page).toHaveURL(/#\/foundations$/);

  await page.locator('#menu').click();
  await expect(page.locator('#menu')).toHaveAttribute('aria-expanded', 'true');
  // The scrim spans the viewport and sits beneath the 272px drawer, so click the
  // exposed strip to its right rather than the element centre.
  await page.locator('#nav-scrim').click({ position: { x: 340, y: 400 } });
  await expect(page.locator('#menu')).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#menu')).toBeFocused();
});

test('the skip link reaches the main region', async ({ page }) => {
  await ready(page);
  await page.keyboard.press('Tab');
  const skip = page.locator('.skip-link');
  await expect(skip).toBeFocused();
  await skip.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
});
