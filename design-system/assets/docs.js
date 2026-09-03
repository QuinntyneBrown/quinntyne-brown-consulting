// QBC Workboard Design System — documentation application.
//
// No framework and no router library. Everything on screen is derived from
// component-manifest.json: navigation, search, cards, API tables, the playground
// controls, the variant matrix, and the code panels.
//
// Routing is hash-based rather than History API. The built site is served from a
// GitHub Pages project subpath with no server-side rewrite, so a fragment route is
// the only form that survives a deep link and a refresh without a fallback trick.
// It also matches the mocks, which route on location.hash already.

import { componentMarkup, dialogMarkup, patternMarkup, iconNames } from './catalog-content.js';

const manifest = await fetch(new URL('../component-manifest.json', import.meta.url)).then(response => {
  if (!response.ok) throw new Error(`Unable to load the component manifest (${response.status}).`);
  return response.json();
});

const main = document.querySelector('#main');
const nav = document.querySelector('#docs-nav');
const searchInput = document.querySelector('#search');
const searchResults = document.querySelector('#search-results');
const dialogHost = document.querySelector('#dialog-host');
const statusRegion = document.querySelector('#status');
const menuButton = document.querySelector('#menu');
const navScrim = document.querySelector('#nav-scrim');

const COMPONENT_TABS = ['overview', 'api', 'examples'];
const PATTERN_TABS = ['overview', 'examples'];

let lastDialogOpener = null;
let statusTimer = 0;

/* ------------------------------------------------------------------ utilities */

const esc = (value) => String(value ?? '')
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&#39;');

const route = (href, label, className = '') =>
  `<a href="#${href}"${className ? ` class="${className}"` : ''}>${label}</a>`;

const previewUrl = (type, item, scenario = '') =>
  `preview.html?type=${encodeURIComponent(type)}&item=${encodeURIComponent(item)}&scenario=${encodeURIComponent(scenario)}`;

/** Parse an example markup string into a live element so controls can read its state. */
function exampleElement(markup) {
  const template = document.createElement('template');
  template.innerHTML = markup;
  return template.content.firstElementChild;
}

/** Re-serialise an example with one attribute changed, so the variant matrix stays honest. */
function markupWithAttribute(markup, attribute, value) {
  const element = exampleElement(markup);
  if (!element) return markup;
  if (attribute.type === 'boolean') element.toggleAttribute(attribute.name, Boolean(value));
  else if (value === '' || value === null) element.removeAttribute(attribute.name);
  else element.setAttribute(attribute.name, String(value));
  return element.outerHTML;
}

function announce(message) {
  statusRegion.textContent = message;
  statusRegion.classList.add('show');
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => statusRegion.classList.remove('show'), 1800);
}

const dialogScenarioCount = manifest.dialogs.reduce((total, item) => total + item.scenarios.length, 0);
const patternScenarioCount = manifest.patterns.reduce((total, item) => total + item.scenarios.length, 0);

/* ---------------------------------------------------------------- navigation */

function navGroup(title, href, items) {
  return `
    <div class="nav-group">
      <div class="nav-group-title">${route(href, esc(title))}<span>${items.length}</span></div>
      ${items.map(item => route(item.href, esc(item.label))).join('')}
    </div>`;
}

function renderNavigation() {
  nav.innerHTML = [
    navGroup('System', '/', [
      { href: '/', label: 'Overview' },
      { href: '/foundations', label: 'Foundations' },
    ]),
    ...manifest.categories.map(category => navGroup(
      category.label,
      '/components',
      manifest.components
        .filter(component => component.category === category.id)
        .map(component => ({ href: `/components/${component.selector}/overview`, label: component.name })),
    )),
    navGroup('Dialogs', '/dialogs', manifest.dialogs.map(dialog => ({
      href: `/dialogs/${dialog.id}/overview`, label: dialog.name,
    }))),
    navGroup('Patterns', '/patterns', manifest.patterns.map(pattern => ({
      href: `/patterns/${pattern.id}/overview`, label: pattern.name,
    }))),
  ].join('');
}

function updateActiveNavigation() {
  const current = normalizedRoute();
  nav.querySelectorAll('.nav-group > a').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
}

/* -------------------------------------------------------------------- search */

const searchIndex = [
  { label: 'Foundations', description: 'Colour, type, space, shape, elevation, motion, and icons', type: 'System', href: '/foundations' },
  ...manifest.components.map(component => ({
    label: component.name,
    description: `${component.selector} · ${component.description}`,
    type: 'Component',
    href: `/components/${component.selector}/overview`,
  })),
  ...manifest.dialogs.map(dialog => ({
    label: dialog.name,
    description: `${dialog.scenarios.length} rendered scenario${dialog.scenarios.length === 1 ? '' : 's'} · ${dialog.description}`,
    type: 'Dialog',
    href: `/dialogs/${dialog.id}/overview`,
  })),
  ...manifest.patterns.map(pattern => ({
    label: pattern.name,
    description: `${pattern.scenarios.length} responsive state${pattern.scenarios.length === 1 ? '' : 's'} · ${pattern.description}`,
    type: 'Pattern',
    href: `/patterns/${pattern.id}/overview`,
  })),
];

function runSearch(term) {
  const query = term.trim().toLowerCase();
  if (!query) {
    searchResults.hidden = true;
    searchInput.setAttribute('aria-expanded', 'false');
    return;
  }
  const matches = searchIndex
    .filter(entry => `${entry.label} ${entry.description} ${entry.type}`.toLowerCase().includes(query))
    .slice(0, 12);

  searchResults.innerHTML = matches.length
    ? matches.map(entry => `
        <a class="search-result" role="option" href="#${entry.href}">
          <strong>${esc(entry.label)}</strong><em>${esc(entry.type)}</em>
          <span>${esc(entry.description)}</span>
        </a>`).join('')
    : '<div class="search-empty">Nothing matches that search.</div>';

  searchResults.hidden = false;
  searchInput.setAttribute('aria-expanded', 'true');
}

/* ------------------------------------------------------------------- home */

function renderHome() {
  const featuredComponents = ['qbc-button', 'qbc-story-card', 'qbc-pill']
    .map(selector => manifest.components.find(component => component.selector === selector))
    .filter(Boolean);

  main.innerHTML = `
    <section class="page-hero">
      <p class="eyebrow">${esc(manifest.product.name)} · v${esc(manifest.product.version)}</p>
      <h1>A quiet, spacious system for consulting delivery.</h1>
      <p>${esc(manifest.product.description)} Every token, component, and screen here is drawn from
      <code>docs/mocks</code>, the visual baseline the product is required to preserve.</p>
      <div class="hero-actions">
        ${route('/components', 'Browse components', 'doc-button primary')}
        ${route('/foundations', 'Foundations', 'doc-button')}
        ${route('/patterns', 'Product patterns', 'doc-button')}
      </div>
    </section>

    <div class="metrics">
      <div class="metric"><strong>${manifest.components.length}</strong><span>Components</span></div>
      <div class="metric"><strong>${dialogScenarioCount}</strong><span>Dialog scenarios</span></div>
      <div class="metric"><strong>${patternScenarioCount}</strong><span>Responsive pattern states</span></div>
      <div class="metric"><strong>${manifest.categories.length}</strong><span>Categories</span></div>
    </div>

    <section class="section-block">
      <div class="section-heading">
        <div><h2>Components</h2><p>Native custom elements with an attribute-only API.</p></div>
        ${route('/components', 'See all', 'doc-button small')}
      </div>
      <div class="card-grid">${featuredComponents.map(componentCard).join('')}</div>
    </section>

    <section class="section-block">
      <div class="section-heading">
        <div><h2>Product patterns</h2><p>Whole screens, rendered at real widths in an isolated frame.</p></div>
        ${route('/patterns', 'See all', 'doc-button small')}
      </div>
      <div class="card-grid">${manifest.patterns.slice(0, 3).map(patternCard).join('')}</div>
    </section>

    <section class="section-block">
      <div class="section-heading">
        <div><h2>Dialogs</h2><p>Focused modal tasks, documented inline and launchable live.</p></div>
        ${route('/dialogs', 'See all', 'doc-button small')}
      </div>
      <div class="card-grid">${manifest.dialogs.slice(0, 3).map(dialogCard).join('')}</div>
    </section>`;
}

function componentCard(component) {
  return `
    <a class="catalog-card" data-component-card="${esc(component.selector)}" href="#/components/${esc(component.selector)}/overview">
      <div class="card-preview">${componentMarkup(component)}</div>
      <div class="card-body">
        <h3>${esc(component.name)}</h3>
        <code>${esc(component.selector)}</code>
        <p>${esc(component.description)}</p>
      </div>
    </a>`;
}

function patternCard(pattern) {
  return `
    <a class="catalog-card" data-pattern-card="${esc(pattern.id)}" href="#/patterns/${esc(pattern.id)}/overview">
      <div class="card-preview">
        <iframe title="${esc(pattern.name)} preview" loading="lazy" src="${previewUrl('pattern', pattern.id, pattern.scenarios[0].id)}"
                style="width:100%;height:100%;min-height:150px;border:0;border-radius:8px"></iframe>
      </div>
      <div class="card-body">
        <h3>${esc(pattern.name)}</h3>
        <code>${pattern.scenarios.length} responsive state${pattern.scenarios.length === 1 ? '' : 's'}</code>
        <p>${esc(pattern.description)}</p>
      </div>
    </a>`;
}

function dialogCard(dialog) {
  return `
    <a class="catalog-card" data-dialog-card="${esc(dialog.id)}" href="#/dialogs/${esc(dialog.id)}/overview">
      <div class="card-preview">
        <iframe title="${esc(dialog.name)} preview" loading="lazy" src="${previewUrl('dialog', dialog.id, dialog.scenarios[0].id)}"
                style="width:100%;height:100%;min-height:150px;border:0;border-radius:8px"></iframe>
      </div>
      <div class="card-body">
        <h3>${esc(dialog.name)}</h3>
        <code>${dialog.scenarios.length} scenario${dialog.scenarios.length === 1 ? '' : 's'}</code>
        <p>${esc(dialog.description)}</p>
      </div>
    </a>`;
}

/* ------------------------------------------------------------- foundations */

const colorTokens = [
  ['ink', 'Primary ink'], ['ink-soft', 'Secondary ink'], ['ink-faint', 'Faint ink'],
  ['line', 'Divider'], ['line-strong', 'Field border'], ['line-card', 'Card border'],
  ['panel', 'Canvas'], ['soft', 'Recessed surface'], ['surface-raised', 'Raised surface'],
  ['accent', 'Primary action'], ['accent-dark', 'Action hover'], ['accent-soft', 'Action wash'],
  ['blue', 'Draft and to do'], ['blue-soft', 'Draft wash'],
  ['amber', 'In progress and planned'], ['amber-soft', 'In progress wash'],
  ['danger', 'Destructive'], ['danger-soft', 'Destructive wash'],
  ['nav-ink', 'Navigation idle'], ['dot-available', 'Availability dot'],
];

const typeTokens = [
  ['display', 'Give clients a calm view'], ['4xl', 'Sprint goal heading'], ['3xl', 'Dialog heading'],
  ['2xl', 'Empty state heading'], ['xl', 'Initiative title'], ['lg', 'Assistant name'],
  ['base', 'Comfortable body copy for product guidance.'], ['md', 'Board column heading'],
  ['sm', 'Breadcrumb and supporting text'], ['xs', 'Field label and dense controls'],
  ['2xs', 'PILL, TAG, AND EYEBROW'],
];

const radiusTokens = [
  ['2xs', 'Tag'], ['xs', 'Points chip'], ['sm', 'Skip link'], ['control', 'Buttons and fields'],
  ['md', 'Brand mark'], ['lg', 'Story card'], ['tile', 'Empty icon'], ['xl', 'Cards and columns'],
  ['2xl', 'Dialog'], ['pill', 'Pill and count'],
];

const spacingTokens = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function renderFoundations() {
  const read = (token) => getComputedStyle(document.documentElement).getPropertyValue(`--qbc-${token}`).trim();

  main.innerHTML = `
    <div class="breadcrumb">${route('/', 'Design system')} / Foundations</div>
    <header class="detail-header">
      <h1>Foundations</h1>
      <p>The design language of QBC Workboard: one accent colour, warm neutral greys with a green cast,
      generous radii on containers and tighter ones on controls, a single soft shadow reserved for overlays,
      and near-zero motion. Every value is preserved from <code>docs/mocks/styles.css</code>.</p>
    </header>

    <section class="section-block">
      <div class="section-heading"><div><h2>Colour</h2><p>Light only. There is no dark mode and no requirement for one.</p></div></div>
      <div class="token-grid">
        ${colorTokens.map(([token, label]) => `
          <div class="token-card">
            <div class="token-swatch" style="background:var(--qbc-${token})"></div>
            <div><strong>${esc(label)}</strong><code>--qbc-${token}</code></div>
          </div>`).join('')}
      </div>
    </section>

    <section class="section-block">
      <div class="section-heading"><div><h2>Typography</h2><p>One family, eleven sizes, and six weights.</p></div></div>
      <p class="callout"><strong>Inter is requested but never shipped.</strong>
      No stylesheet in this repository loads a webfont and there is no font file to serve, so the stack falls
      through to <code>system-ui</code> unless a reader happens to have Inter installed. The design leans on
      the non-standard weights 620, 680, and 750, which only a variable font renders as drawn. Self-hosting
      Inter is the single highest-leverage fix to this system.</p>
      <div class="type-scale">
        ${typeTokens.map(([token, sample]) => `
          <div class="type-row">
            <code>--qbc-fs-${token} · ${esc(read(`fs-${token}`))}</code>
            <span style="font-size:var(--qbc-fs-${token})">${esc(sample)}</span>
          </div>`).join('')}
      </div>
    </section>

    <section class="section-block">
      <div class="section-heading"><div><h2>Space</h2><p>A 4px scale for new work. The mock's own rhythm is freely tuned, so components keep its literal values where they fall off scale.</p></div></div>
      <div class="scale-grid">
        ${spacingTokens.map(step => `
          <div class="scale-card">
            <div class="measure" style="width:var(--qbc-s-${step})"></div>
            <code>--qbc-s-${step} · ${esc(read(`s-${step}`))}</code>
          </div>`).join('')}
      </div>
    </section>

    <section class="section-block">
      <div class="section-heading"><div><h2>Shape</h2><p>Containers are round; controls are tighter.</p></div></div>
      <div class="scale-grid">
        ${radiusTokens.map(([token, label]) => `
          <div class="scale-card">
            <div class="shape" style="border-radius:var(--qbc-r-${token})"></div>
            <strong style="font-size:var(--qbc-fs-xs)">${esc(label)}</strong>
            <code>--qbc-r-${token} · ${esc(read(`r-${token}`))}</code>
          </div>`).join('')}
      </div>
    </section>

    <section class="section-block">
      <div class="section-heading"><div><h2>Elevation</h2><p>Two shadows. One lifts a card a hair; the other belongs to overlays alone.</p></div></div>
      <div class="elevation-grid">
        <div class="elevation-card" style="box-shadow:var(--qbc-shadow-card)">
          <strong>Card</strong><br><code>--qbc-shadow-card</code>
        </div>
        <div class="elevation-card" style="box-shadow:var(--qbc-shadow-overlay)">
          <strong>Overlay</strong><br><code>--qbc-shadow-overlay</code>
        </div>
      </div>
    </section>

    <section class="section-block">
      <div class="section-heading"><div><h2>Motion</h2><p>Three short movements, and nothing else.</p></div></div>
      <div class="scale-grid">
        <div class="scale-card"><strong style="font-size:var(--qbc-fs-xs)">Page enter</strong><code>--qbc-dur-fast</code></div>
        <div class="scale-card"><strong style="font-size:var(--qbc-fs-xs)">Toast, drawer</strong><code>--qbc-dur-base</code></div>
        <div class="scale-card"><strong style="font-size:var(--qbc-fs-xs)">Easing</strong><code>--qbc-ease</code></div>
      </div>
      <p class="callout"><strong>Reduced motion is honoured here, and is not in the mock.</strong>
      The mock declares a page entrance, a toast entrance, and a drawer slide with no
      <code>prefers-reduced-motion</code> guard. This system collapses both duration tokens to 1ms under that
      query, so every component inherits the fix without its own media query.</p>
    </section>

    <section class="section-block">
      <div class="section-heading"><div><h2>Icons</h2><p>Fourteen marks, each a literal Unicode glyph.</p></div></div>
      <p class="callout"><strong>These glyphs are font-dependent.</strong>
      They render differently across platforms, and the command and board marks vary the most. They are
      centralised in <code>qbc-icon</code> so that redrawing the set as inline SVG is a change to one file.
      The 18px box is the sizing contract to preserve if that happens.</p>
      <div class="icon-grid">
        ${iconNames.map(name => `
          <div class="icon-card">
            <qbc-icon name="${esc(name)}" size="20"></qbc-icon>
            <code>${esc(name)}</code>
          </div>`).join('')}
      </div>
    </section>

    <section class="section-block">
      <div class="section-heading"><div><h2>Responsive and accessible</h2><p>Two breakpoints, and behaviour that never depends on colour alone.</p></div></div>
      <div class="prose">
        <p>Layout changes at <code>1000px</code> and <code>760px</code>, both as <code>max-width</code> queries.
        These are the mock's values; the Angular application drifted to 999 and 759, which this system does not follow.
        The responsive retune happens on <code>:root</code>, so components read tokens and stay free of media queries
        wherever that is possible.</p>
        <ul>
          <li>Every status is conveyed by visible text as well as by colour.</li>
          <li>Focus is a single 3px accent ring at <code>--qbc-focus-ring</code>, never removed or overridden per component.</li>
          <li>Dialogs trap focus, close on Escape, and restore focus to whatever opened them.</li>
          <li>Icon-only controls carry an explicit label; decorative glyphs are hidden from assistive technology.</li>
          <li>Drag and drop always has an equivalent button control, so no workflow requires a pointer.</li>
        </ul>
      </div>
    </section>`;
}

/* --------------------------------------------------------------- components */

function renderComponentsIndex() {
  main.innerHTML = `
    <div class="breadcrumb">${route('/', 'Design system')} / Components</div>
    <header class="detail-header">
      <h1>Components</h1>
      <p>${manifest.components.length} native custom elements. Attributes are the whole API: there are no
      property accessors and no reflection, so variants are CSS state and booleans are attribute presence.</p>
    </header>
    ${manifest.categories.map(category => {
      const items = manifest.components.filter(component => component.category === category.id);
      return `
        <section class="section-block">
          <div class="section-heading"><div><h2>${esc(category.label)}</h2><p>${esc(category.description)}</p></div></div>
          <div class="card-grid">${items.map(componentCard).join('')}</div>
        </section>`;
    }).join('')}`;
}

function renderComponentDetail(component, tab) {
  const tabs = COMPONENT_TABS.map(name =>
    `<a href="#/components/${esc(component.selector)}/${name}" class="${name === tab ? 'active' : ''}">${name[0].toUpperCase()}${name.slice(1)}</a>`).join('');

  let body = '';
  if (tab === 'api') body = renderApi(component);
  else if (tab === 'examples') body = renderExamples(component);
  else body = renderComponentOverview(component);

  main.innerHTML = `
    <div class="breadcrumb">${route('/', 'Design system')} / ${route('/components', 'Components')} / ${esc(component.name)}</div>
    <header class="detail-header">
      <h1>${esc(component.name)}</h1>
      <p>${esc(component.description)}</p>
      <span class="selector-badge">&lt;${esc(component.selector)}&gt;</span>
    </header>
    <nav class="page-tabs" aria-label="Component sections">${tabs}</nav>
    ${body}`;
}

function renderComponentOverview(component) {
  const category = manifest.categories.find(item => item.id === component.category);
  return `
    <div class="showcase">
      <div class="showcase-head"><h3>Specimen</h3><p>Rendered live, not a screenshot.</p></div>
      <div class="specimen">${componentMarkup(component)}</div>
    </div>
    <div class="content-grid">
      <div class="prose">
        <h2>When to use it</h2>
        <p>${esc(component.description)} It belongs to the ${esc(category?.label.toLowerCase() ?? 'catalog')} group,
        which covers ${esc(category?.description.toLowerCase() ?? 'the rest of the system')}</p>
        <h2>Composition</h2>
        <p>${component.slots.length
          ? `Content goes through ${component.slots.length} slot${component.slots.length === 1 ? '' : 's'}: ${component.slots.map(slot => `<code>${esc(slot.name)}</code>`).join(', ')}. Compose it with the primitives already in the catalog rather than restyling it in place.`
          : 'This component takes no slotted content. Everything it renders comes from its attributes.'}</p>
        <h2>Accessibility</h2>
        <p>Keep focus visible, labels concise, and semantic order intact. Icon-only actions need an explicit
        label, form fields need a visible one, and status must never rely on colour alone. Focus styling comes
        from the shared base class, so do not override it here.</p>
        ${component.attributes.some(attribute => attribute.name === 'title') ? `
        <p class="callout"><strong>The <code>title</code> attribute also produces a native tooltip.</strong>
        <code>title</code> is a global HTML attribute, so a browser shows its text on hover over the host as
        well as rendering it as the heading. The name is kept because it reads correctly across the whole
        catalog and matches the contract, but the redundant tooltip is the cost. Renaming it would remove the
        tooltip at the price of a less natural API.</p>` : ''}
        <h2>Responsive behaviour</h2>
        <p>Layout responds at 1000px and 760px. Prefer reading a token that the root retunes over adding a
        media query to this component.</p>
      </div>
      <aside class="guidance-card">
        <h3>Contract at a glance</h3>
        <dl>
          <dt>Attributes</dt><dd>${component.attributes.length}</dd>
          <dt>Slots</dt><dd>${component.slots.length}</dd>
          <dt>Events</dt><dd>${component.events.length}</dd>
          <dt>Examples</dt><dd>${component.examples.length}</dd>
        </dl>
        <a class="doc-button small" href="assets/components/${esc(component.source)}" target="_blank" rel="noreferrer">
          View source <span aria-hidden="true">&#x2197;</span>
        </a>
      </aside>
    </div>`;
}

function renderApi(component) {
  const table = (title, rows, columns) => `
    <div class="showcase">
      <div class="showcase-head"><h3>${title}</h3></div>
      <div class="api-table-wrap">
        ${rows.length ? `
          <table class="api-table">
            <thead><tr>${columns.map(column => `<th scope="col">${column}</th>`).join('')}</tr></thead>
            <tbody>${rows.join('')}</tbody>
          </table>` : `<p class="empty-api">This component declares no ${title.toLowerCase()}.</p>`}
      </div>
    </div>`;

  const attributeRows = component.attributes.map(attribute => `
    <tr>
      <td><code>${esc(attribute.name)}</code></td>
      <td><span class="type-pill">${esc(attribute.type)}</span></td>
      <td><code>${esc(String(attribute.default))}</code></td>
      <td>${esc(attribute.description)}${attribute.values ? `<br><code>${attribute.values.map(esc).join(' | ')}</code>` : ''}</td>
    </tr>`);

  const slotRows = component.slots.map(slot => `
    <tr><td><code>${esc(slot.name)}</code></td><td>${esc(slot.description)}</td></tr>`);

  const eventRows = component.events.map(event => `
    <tr><td><code>${esc(event.name)}</code></td><td>${esc(event.description)}</td></tr>`);

  return `
    ${table('Attributes', attributeRows, ['Name', 'Type', 'Default', 'Description'])}
    ${table('Slots', slotRows, ['Name', 'Description'])}
    ${table('Events', eventRows, ['Name', 'Description'])}`;
}

function renderExamples(component) {
  return `
    ${renderPlayground(component)}
    ${component.examples.map(example => `
      <div class="showcase">
        <div class="showcase-head"><h3>${esc(example.title)}</h3><p>${esc(example.description)}</p></div>
        <div class="specimen">${example.markup}</div>
        <div class="code-panel"><pre>${esc(example.markup)}</pre></div>
      </div>`).join('')}
    ${renderVariantMatrix(component)}`;
}

function controlMarkup(attribute, current) {
  const id = `control-${attribute.name}`;
  if (attribute.type === 'boolean') {
    return `<div class="control boolean">
      <input id="${id}" type="checkbox" data-control="${esc(attribute.name)}" data-type="boolean" ${current ? 'checked' : ''}>
      <label for="${id}"><code>${esc(attribute.name)}</code></label>
    </div>`;
  }
  if (attribute.type === 'enum' || attribute.type === 'icon') {
    const values = attribute.type === 'icon' ? iconNames : attribute.values ?? [];
    return `<div class="control">
      <label for="${id}"><code>${esc(attribute.name)}</code></label>
      <select id="${id}" data-control="${esc(attribute.name)}" data-type="enum">
        ${values.map(value => `<option value="${esc(value)}" ${String(current) === value ? 'selected' : ''}>${esc(value)}</option>`).join('')}
      </select>
    </div>`;
  }
  const inputType = attribute.type === 'number' ? 'number' : 'text';
  return `<div class="control">
    <label for="${id}"><code>${esc(attribute.name)}</code></label>
    <input id="${id}" type="${inputType}" data-control="${esc(attribute.name)}" data-type="${esc(attribute.type)}" value="${esc(current ?? '')}">
  </div>`;
}

function renderPlayground(component) {
  const markup = component.examples[0].markup;
  const element = exampleElement(markup);
  const controls = component.attributes.map(attribute => controlMarkup(
    attribute,
    attribute.type === 'boolean' ? element?.hasAttribute(attribute.name) : element?.getAttribute(attribute.name),
  )).join('');

  return `
    <section class="playground" data-playground data-selector="${esc(component.selector)}" data-original="${esc(markup)}">
      <div>
        <div class="showcase-head"><h3>Playground</h3><p>Changes are applied to the live element, and the code is read back from it.</p></div>
        <div class="specimen" data-playground-preview>${markup}</div>
        <div class="code-panel"><pre data-playground-code>${esc(markup)}</pre></div>
      </div>
      <div class="playground-controls">
        <h3>Attributes</h3>
        ${controls || '<p class="empty-controls">This component has no attributes to vary.</p>'}
        <button class="doc-button small" type="button" data-playground-reset>Reset</button>
      </div>
    </section>`;
}

function renderVariantMatrix(component) {
  const variants = [];
  for (const attribute of component.attributes) {
    if (attribute.type === 'enum') {
      for (const value of attribute.values) {
        variants.push({ label: `${attribute.name}: ${value}`, markup: markupWithAttribute(component.examples[0].markup, attribute, value) });
      }
    } else if (attribute.type === 'boolean' && !['open', 'static'].includes(attribute.name)) {
      variants.push({ label: `${attribute.name}: false`, markup: markupWithAttribute(component.examples[0].markup, attribute, false) });
      variants.push({ label: `${attribute.name}: true`, markup: markupWithAttribute(component.examples[0].markup, attribute, true) });
    }
  }
  if (!variants.length) return '';

  return `
    <div class="showcase">
      <div class="showcase-head"><h3>Every variant</h3><p>Enumerated from the contract, so the matrix cannot drift from the API.</p></div>
      <div class="variant-grid">
        ${variants.map(variant => `
          <div class="variant-card">
            <div class="mini-specimen">${variant.markup}</div>
            <code>${esc(variant.label)}</code>
          </div>`).join('')}
      </div>
    </div>`;
}

/* ------------------------------------------------------------------ dialogs */

function renderDialogsIndex() {
  main.innerHTML = `
    <div class="breadcrumb">${route('/', 'Design system')} / Dialogs</div>
    <header class="detail-header">
      <h1>Dialogs</h1>
      <p>${manifest.dialogs.length} families across ${dialogScenarioCount} rendered scenarios. Each one is a single
      focused task with the destructive option never adjacent to the primary one, and Cancel always available.</p>
    </header>
    <div class="card-grid">${manifest.dialogs.map(dialogCard).join('')}</div>`;
}

function renderDialogDetail(dialog, tab) {
  const tabs = COMPONENT_TABS.map(name =>
    `<a href="#/dialogs/${esc(dialog.id)}/${name}" class="${name === tab ? 'active' : ''}">${name[0].toUpperCase()}${name.slice(1)}</a>`).join('');

  const gallery = `
    <div class="dialog-gallery">
      ${dialog.scenarios.map(scenario => `
        <div class="dialog-example" data-dialog-scenario="${esc(scenario.id)}">
          <header>
            <h3>${esc(scenario.name)}</h3>
            <button class="doc-button small" type="button"
                    data-launch-dialog="${esc(dialog.id)}" data-scenario="${esc(scenario.id)}">Open live</button>
          </header>
          <div class="dialog-inline">${dialogMarkup(dialog.id, scenario.id)}</div>
        </div>`).join('')}
    </div>`;

  let body = gallery;
  if (tab === 'api') {
    const component = manifest.components.find(item =>
      item.selector === (dialog.id === 'confirm' ? 'qbc-confirm-dialog' : 'qbc-dialog'));
    body = renderApi(component);
  } else if (tab === 'overview') {
    body = `
      <div class="content-grid">
        <div class="prose">
          <h2>When to use it</h2>
          <p>${esc(dialog.description)}</p>
          <h2>Behaviour</h2>
          <p>Every dialog traps focus while open, closes on Escape and on a backdrop click, and returns focus to
          the control that opened it. The inline previews below use the <code>static</code> attribute, which
          renders the same element without a scrim so it can be documented in place.</p>
          <h2>Writing the copy</h2>
          <p>Name the record and state the consequence. A confirmation that says only that an action cannot be
          undone has not told the reader what they are about to lose.</p>
        </div>
        <aside class="guidance-card">
          <h3>Contract at a glance</h3>
          <dl><dt>Scenarios</dt><dd>${dialog.scenarios.length}</dd>
          <dt>Element</dt><dd>${dialog.id === 'confirm' ? 'qbc-confirm-dialog' : 'qbc-dialog'}</dd></dl>
        </aside>
      </div>
      ${gallery}`;
  }

  main.innerHTML = `
    <div class="breadcrumb">${route('/', 'Design system')} / ${route('/dialogs', 'Dialogs')} / ${esc(dialog.name)}</div>
    <header class="detail-header"><h1>${esc(dialog.name)}</h1><p>${esc(dialog.description)}</p></header>
    <nav class="page-tabs" aria-label="Dialog sections">${tabs}</nav>
    ${body}`;
}

/* ----------------------------------------------------------------- patterns */

function renderPatternsIndex() {
  main.innerHTML = `
    <div class="breadcrumb">${route('/', 'Design system')} / Patterns</div>
    <header class="detail-header">
      <h1>Product patterns</h1>
      <p>${manifest.patterns.length} families across ${patternScenarioCount} responsive states. Each screen renders in an
      isolated frame that loads the tokens but not this documentation stylesheet, so its media queries resolve
      against its own width rather than the width of this page.</p>
    </header>
    <div class="card-grid">${manifest.patterns.map(patternCard).join('')}</div>`;
}

function renderPatternDetail(pattern, tab) {
  const tabs = PATTERN_TABS.map(name =>
    `<a href="#/patterns/${esc(pattern.id)}/${name}" class="${name === tab ? 'active' : ''}">${name[0].toUpperCase()}${name.slice(1)}</a>`).join('');

  const gallery = `
    <div class="dialog-gallery">
      ${pattern.scenarios.map(scenario => `
        <div class="dialog-example" data-pattern-scenario="${esc(scenario.id)}">
          <header>
            <h3>${esc(scenario.name)}</h3>
            <div class="viewport-controls" role="group" aria-label="Preview width for ${esc(scenario.name)}">
              <button type="button" data-viewport="mobile" aria-pressed="false">390</button>
              <button type="button" data-viewport="tablet" aria-pressed="false">820</button>
              <button type="button" data-viewport="desktop" aria-pressed="true">Full</button>
            </div>
          </header>
          <div class="pattern-stage">
            <iframe class="pattern-frame" data-viewport="desktop" title="${esc(pattern.name)} — ${esc(scenario.name)}"
                    loading="lazy" src="${previewUrl('pattern', pattern.id, scenario.id)}"></iframe>
          </div>
        </div>`).join('')}
    </div>`;

  const body = tab === 'examples' ? gallery : `
    <div class="content-grid">
      <div class="prose">
        <h2>What this screen does</h2>
        <p>${esc(pattern.description)}</p>
        <h2>Responsive behaviour</h2>
        <p>Resize the frame with the controls on each scenario. The board collapses to a single column at
        1000px, the backlog sheds its estimate column there and reflows into labelled cards at 760px, and the
        sidebar becomes an off-canvas drawer below 760px.</p>
        <h2>Composition</h2>
        <p>Screens are assembled from catalog components only. If a screen needs something the catalog does not
        have, that is a signal to add a component rather than to write one-off page CSS.</p>
      </div>
      <aside class="guidance-card">
        <h3>Contract at a glance</h3>
        <dl><dt>States</dt><dd>${pattern.scenarios.length}</dd></dl>
      </aside>
    </div>
    ${gallery}`;

  main.innerHTML = `
    <div class="breadcrumb">${route('/', 'Design system')} / ${route('/patterns', 'Patterns')} / ${esc(pattern.name)}</div>
    <header class="detail-header"><h1>${esc(pattern.name)}</h1><p>${esc(pattern.description)}</p></header>
    <nav class="page-tabs" aria-label="Pattern sections">${tabs}</nav>
    ${body}`;
}

function renderNotFound() {
  main.innerHTML = `
    <div class="breadcrumb">${route('/', 'Design system')}</div>
    <header class="detail-header">
      <p class="eyebrow">404 · Not found</p>
      <h1>That page is not in the catalog.</h1>
      <p>The route did not match a component, dialog, or pattern in the manifest.</p>
    </header>
    <p>${route('/', 'Return to the design system', 'doc-button primary')}</p>`;
}

/* ------------------------------------------------------------------ routing */

function normalizedRoute() {
  const raw = location.hash.replace(/^#/, '') || '/';
  const path = raw.replace(/\/+$/, '');
  return path === '' ? '/' : path;
}

function renderRoute({ focus = false } = {}) {
  closeNavigation();
  const path = normalizedRoute();
  const parts = path.split('/').filter(Boolean);

  if (path === '/') renderHome();
  else if (path === '/foundations') renderFoundations();
  else if (path === '/components') renderComponentsIndex();
  else if (parts[0] === 'components' && parts[1]) {
    const component = manifest.components.find(entry => entry.selector === parts[1]);
    const tab = COMPONENT_TABS.includes(parts[2]) ? parts[2] : 'overview';
    if (component) renderComponentDetail(component, tab); else renderNotFound();
  } else if (path === '/dialogs') renderDialogsIndex();
  else if (parts[0] === 'dialogs' && parts[1]) {
    const dialog = manifest.dialogs.find(entry => entry.id === parts[1]);
    const tab = COMPONENT_TABS.includes(parts[2]) ? parts[2] : 'overview';
    if (dialog) renderDialogDetail(dialog, tab); else renderNotFound();
  } else if (path === '/patterns') renderPatternsIndex();
  else if (parts[0] === 'patterns' && parts[1]) {
    const pattern = manifest.patterns.find(entry => entry.id === parts[1]);
    const tab = PATTERN_TABS.includes(parts[2]) ? parts[2] : 'overview';
    if (pattern) renderPatternDetail(pattern, tab); else renderNotFound();
  } else renderNotFound();

  updateActiveNavigation();
  bindPlaygrounds();

  if (focus) {
    scrollTo({ top: 0, behavior: 'instant' });
    main.focus({ preventScroll: true });
  }
}

/* -------------------------------------------------------------- playgrounds */

function bindPlaygrounds() {
  main.querySelectorAll('[data-playground]').forEach(playground => {
    const preview = playground.querySelector('[data-playground-preview]');
    const code = playground.querySelector('[data-playground-code]');

    const updateCode = () => {
      const element = preview.firstElementChild;
      if (element) code.textContent = element.outerHTML;
    };

    playground.querySelectorAll('[data-control]').forEach(control => {
      control.dataset.initial = control.type === 'checkbox' ? String(control.checked) : control.value;
      control.addEventListener('input', () => {
        const element = preview.firstElementChild;
        if (!element) return;
        const name = control.dataset.control;
        if (control.dataset.type === 'boolean') element.toggleAttribute(name, control.checked);
        else if (control.value === '') element.removeAttribute(name);
        else element.setAttribute(name, control.value);
        updateCode();
      });
    });

    playground.querySelector('[data-playground-reset]')?.addEventListener('click', () => {
      preview.innerHTML = playground.dataset.original;
      playground.querySelectorAll('[data-control]').forEach(control => {
        if (control.type === 'checkbox') control.checked = control.dataset.initial === 'true';
        else control.value = control.dataset.initial ?? '';
      });
      updateCode();
      announce('Playground reset');
    });
  });
}

/* ------------------------------------------------------------------ drawer */

function openNavigation() {
  document.body.classList.add('nav-armed', 'nav-open');
  navScrim.hidden = false;
  menuButton.setAttribute('aria-expanded', 'true');
}

function closeNavigation() {
  document.body.classList.remove('nav-open');
  navScrim.hidden = true;
  menuButton.setAttribute('aria-expanded', 'false');
}

/* ------------------------------------------------------------------ events */

addEventListener('hashchange', () => renderRoute({ focus: true }));

menuButton.addEventListener('click', () => {
  if (document.body.classList.contains('nav-open')) closeNavigation();
  else openNavigation();
});

navScrim.addEventListener('click', () => {
  closeNavigation();
  menuButton.focus();
});

nav.addEventListener('click', event => {
  if (event.target.closest('a')) closeNavigation();
});

// Growing past the drawer breakpoint turns the drawer back into a permanent sidebar.
// Without this the toggle would keep reporting aria-expanded="true" for a control that
// is no longer on screen.
const wideViewport = matchMedia('(min-width: 861px)');
wideViewport.addEventListener('change', event => {
  if (event.matches) closeNavigation();
});

searchInput.addEventListener('input', () => runSearch(searchInput.value));
searchInput.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    searchInput.value = '';
    runSearch('');
    searchInput.blur();
  }
  if (event.key === 'Enter') {
    const first = searchResults.querySelector('.search-result');
    if (first) {
      location.hash = first.getAttribute('href').replace(/^#/, '');
      searchInput.value = '';
      runSearch('');
      searchInput.blur();
    }
  }
});

searchResults.addEventListener('click', () => {
  searchInput.value = '';
  runSearch('');
});

document.addEventListener('click', event => {
  if (!event.target.closest('.site-search')) runSearch('');

  const launch = event.target.closest('[data-launch-dialog]');
  if (launch) {
    lastDialogOpener = launch;
    dialogHost.innerHTML = dialogMarkup(launch.dataset.launchDialog, launch.dataset.scenario, { staticPreview: false });
    announce('Dialog opened');
    return;
  }

  const viewport = event.target.closest('[data-viewport]');
  if (viewport && viewport.tagName === 'BUTTON') {
    const group = viewport.closest('.dialog-example');
    group.querySelectorAll('.viewport-controls button').forEach(button => {
      button.setAttribute('aria-pressed', String(button === viewport));
    });
    group.querySelector('.pattern-frame').dataset.viewport = viewport.dataset.viewport;
    announce(`Preview width: ${viewport.textContent.trim()}`);
  }
});

// Slotted controls live inside their own shadow roots, so delegation for a live
// dialog has to walk the composed path rather than the light-DOM ancestor chain.
dialogHost.addEventListener('click', event => {
  const path = event.composedPath();
  const closer = path.some(node => node?.hasAttribute?.('data-dialog-close') || node?.hasAttribute?.('data-dialog-confirm'));
  if (closer) dialogHost.querySelector('qbc-dialog, qbc-confirm-dialog')?.removeAttribute('open');
});

dialogHost.addEventListener('qbc-close', () => {
  dialogHost.innerHTML = '';
  lastDialogOpener?.focus();
  announce('Dialog closed');
});

dialogHost.addEventListener('qbc-confirm', () => {
  dialogHost.innerHTML = '';
  lastDialogOpener?.focus();
  announce('Confirmed');
});

document.addEventListener('keydown', event => {
  if (event.key === '/' && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName ?? '')) {
    event.preventDefault();
    searchInput.focus();
  }
});

/* ---------------------------------------------------------------- bootstrap */

renderNavigation();
renderRoute();
document.documentElement.dataset.ready = 'true';
