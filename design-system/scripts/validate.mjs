// Contract gate for the QBC Workboard design system.
//
// Pure Node, no dependencies. Cross-checks the manifest against the component
// sources, the registry barrel, the token file, and the HTML entry points, then
// exits non-zero with every failure listed at once rather than only the first.
//
// The counts below are deliberately hard-coded. Changing the catalog should be a
// conscious update to the contract, not something that slips through unnoticed.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];
const fail = (message) => failures.push(message);

const read = (relative) => readFileSync(join(root, relative), 'utf8');
const exists = (relative) => { try { statSync(join(root, relative)); return true; } catch { return false; } };

const EXPECTED = {
  schemaVersion: 1,
  components: 35,
  categories: 7,
  dialogs: 7,
  dialogScenarios: 10,
  patterns: 5,
  patternScenarios: 10,
};

const manifest = JSON.parse(read('component-manifest.json'));
const pkg = JSON.parse(read('package.json'));
const { components, categories, dialogs, patterns } = manifest;

/* ------------------------------------------------- 1. shape and inventory */

if (manifest.schemaVersion !== EXPECTED.schemaVersion) {
  fail(`schemaVersion is ${manifest.schemaVersion}, expected ${EXPECTED.schemaVersion}.`);
}
if (manifest.product?.version !== pkg.version) {
  fail(`manifest product.version (${manifest.product?.version}) does not match package.json version (${pkg.version}).`);
}

const dialogScenarios = dialogs.reduce((total, item) => total + item.scenarios.length, 0);
const patternScenarios = patterns.reduce((total, item) => total + item.scenarios.length, 0);
const counted = {
  components: components.length,
  categories: categories.length,
  dialogs: dialogs.length,
  dialogScenarios,
  patterns: patterns.length,
  patternScenarios,
};
for (const [key, expected] of Object.entries(EXPECTED)) {
  if (key === 'schemaVersion') continue;
  if (counted[key] !== expected) fail(`Expected ${expected} ${key}, found ${counted[key]}.`);
}

/* ------------------------------------------ 2. uniqueness and family metadata */

const selectors = new Set();
for (const component of components) {
  if (selectors.has(component.selector)) fail(`Duplicate selector: ${component.selector}.`);
  selectors.add(component.selector);
}

const categoryIds = new Set(categories.map(category => category.id));
for (const category of categories) {
  for (const key of ['id', 'label', 'description']) {
    if (!category[key]) fail(`Category ${category.id ?? '(unnamed)'} is missing ${key}.`);
  }
}

for (const family of [...dialogs, ...patterns]) {
  for (const key of ['id', 'name', 'description']) {
    if (!family[key]) fail(`Family ${family.id ?? '(unnamed)'} is missing ${key}.`);
  }
  const scenarioIds = new Set();
  for (const scenario of family.scenarios ?? []) {
    if (!scenario.id || !scenario.name) fail(`Family ${family.id} has a scenario missing id or name.`);
    if (scenarioIds.has(scenario.id)) fail(`Family ${family.id} has a duplicate scenario id: ${scenario.id}.`);
    scenarioIds.add(scenario.id);
  }
  if (!scenarioIds.size) fail(`Family ${family.id} declares no scenarios.`);
}

/* --------------------------------------------------- 3. per-component rules */

for (const component of components) {
  const where = component.selector ?? '(unnamed component)';

  if (!/^qbc-[a-z0-9-]+$/.test(component.selector ?? '')) fail(`${where}: selector must match ^qbc-[a-z0-9-]+$.`);
  if (!categoryIds.has(component.category)) fail(`${where}: unknown category "${component.category}".`);
  if (!/^qbc-[a-z0-9-]+\.js$/.test(component.source ?? '')) fail(`${where}: source must be a qbc-*.js filename.`);
  else if (!exists(join('assets', 'components', component.source))) fail(`${where}: source file assets/components/${component.source} does not exist.`);
  if (!component.name) fail(`${where}: missing name.`);
  if (!component.description) fail(`${where}: missing description.`);

  for (const key of ['attributes', 'slots', 'events', 'examples']) {
    if (!Array.isArray(component[key])) fail(`${where}: ${key} must be an array.`);
  }
  if (!component.examples?.length) fail(`${where}: needs at least one example.`);

  for (const example of component.examples ?? []) {
    for (const key of ['id', 'title', 'description', 'markup']) {
      if (!example[key]) fail(`${where}: example ${example.id ?? '(unnamed)'} is missing ${key}.`);
    }
    if (example.markup && !example.markup.includes(`<${component.selector}`)) {
      fail(`${where}: example ${example.id} does not render <${component.selector}>.`);
    }
  }

  const attributeNames = new Set();
  for (const attribute of component.attributes ?? []) {
    if (attributeNames.has(attribute.name)) fail(`${where}: duplicate attribute "${attribute.name}".`);
    attributeNames.add(attribute.name);
    if (!attribute.type) fail(`${where}: attribute "${attribute.name}" is missing a type.`);
    if (!attribute.description) fail(`${where}: attribute "${attribute.name}" is missing a description.`);
    if (!('default' in attribute)) fail(`${where}: attribute "${attribute.name}" must declare an explicit default.`);
    if (attribute.type === 'enum' && !attribute.values?.length) {
      fail(`${where}: enum attribute "${attribute.name}" must list its values.`);
    }
  }

  for (const slot of component.slots ?? []) {
    if (!slot.name || !slot.description) fail(`${where}: every slot needs a name and a description.`);
  }
  for (const event of component.events ?? []) {
    if (!event.name || !event.description) fail(`${where}: every event needs a name and a description.`);
  }
}

/* ---------------------------- 4. source-to-manifest attribute drift */

// A component that observes an attribute the manifest does not document would appear
// in the playground with no control and in the API table not at all.
const bySource = new Map();
for (const component of components) {
  if (!bySource.has(component.source)) bySource.set(component.source, []);
  bySource.get(component.source).push(component);
}

for (const [source, owners] of bySource) {
  if (!exists(join('assets', 'components', source))) continue;
  const contents = read(join('assets', 'components', source));
  const observed = [...contents.matchAll(/observedAttributes\(\)\s*\{[\s\S]*?return\s*\[([^\]]*)\]/g)]
    .flatMap(match => [...match[1].matchAll(/["']([^"']+)["']/g)].map(value => value[1]));
  const documented = new Set(owners.flatMap(owner => owner.attributes.map(attribute => attribute.name)));
  for (const attribute of observed) {
    if (!documented.has(attribute)) fail(`${source}: observes undocumented attribute "${attribute}".`);
  }
  if (!contents.includes('customElements.define')) fail(`${source}: never calls customElements.define.`);
}

/* --------------------------------- 5. registry and manifest agree both ways */

const registry = read(join('assets', 'components.js'));
const imported = [...registry.matchAll(/import\s+['"]\.\/components\/(qbc-[a-z0-9-]+\.js)['"]/g)].map(match => match[1]);
const importedSet = new Set(imported);
const manifestSources = new Set(components.map(component => component.source));

for (const source of manifestSources) {
  if (!importedSet.has(source)) fail(`assets/components.js does not import ${source}, which the manifest declares.`);
}
for (const source of importedSet) {
  if (!manifestSources.has(source)) fail(`assets/components.js imports ${source}, which the manifest does not declare.`);
}

/* ------------------------------------------------- 6. documentation app smoke */

const docs = read(join('assets', 'docs.js'));
for (const symbol of ['renderPlayground', 'renderVariantMatrix', 'renderFoundations', 'renderComponentDetail', 'renderPatternDetail', 'renderDialogDetail']) {
  if (!docs.includes(symbol)) fail(`assets/docs.js is missing ${symbol}.`);
}
const catalog = read(join('assets', 'catalog-content.js'));
for (const symbol of ['function dialogMarkup', 'function patternMarkup', 'function componentMarkup']) {
  if (!catalog.includes(symbol)) fail(`assets/catalog-content.js is missing ${symbol}.`);
}

// Every declared dialog and pattern scenario must actually render something.
for (const dialog of dialogs) {
  for (const scenario of dialog.scenarios) {
    const key = `${dialog.id}/${scenario.id}`;
    const isConfirm = dialog.id === 'confirm';
    // Confirm scenarios are object keys, which may be bare identifiers or quoted
    // when the id contains a hyphen. Accept either spelling.
    const present = isConfirm
      ? new RegExp(`(?:^|[{,\\s])['"]?${scenario.id}['"]?\\s*:`, 'm').test(catalog)
      : catalog.includes(`'${key}'`) || catalog.includes(`"${key}"`);
    if (!present) fail(`catalog-content.js has no fixture for dialog scenario ${key}.`);
  }
}
for (const pattern of patterns) {
  if (!catalog.includes(`'${pattern.id}'`) && !catalog.includes(`case '${pattern.id}'`)) {
    fail(`catalog-content.js has no branch for pattern ${pattern.id}.`);
  }
}

/* ----------------------------------------------------------- 7. package scripts */

for (const script of ['start', 'build', 'preview', 'serve:test', 'validate', 'test:browser', 'test']) {
  if (!pkg.scripts?.[script]) fail(`package.json is missing the ${script} script.`);
  else if (pkg.scripts[script].includes('..')) fail(`package.json script ${script} reaches outside the folder.`);
}

/* ------------------------------------------- 8. standalone: no external reach */

// The mocks are this system's design source, but that relationship belongs in prose.
// A code reference would make the design system depend on a sibling folder.
const FORBIDDEN = [
  ['docs', 'mocks'].join('/'),
  ['..', 'frontend'].join('/'),
  ['..', 'backend'].join('/'),
  ['..', 'design-system'].join('/'),
];
const SKIP_DIRS = new Set(['node_modules', 'dist', 'test-results', 'playwright-report', 'blob-report', '.playwright-cli', '.run']);
const CHECK_EXT = new Set(['.css', '.html', '.js', '.mjs', '.json', '.md']);

let tokenDeclarations = 0;

/** Remove comments so the standalone sweep only inspects code that actually resolves. */
function stripComments(source, extension) {
  if (extension === '.json') return source;
  if (extension === '.html') return source.replace(/<!--[\s\S]*?-->/g, ' ');
  let out = source.replace(/\/\*[\s\S]*?\*\//g, ' ');
  // CSS has no line comments; in JS, avoid eating the // in a protocol-relative URL.
  if (extension !== '.css') out = out.replace(/(^|[^:])\/\/[^\n]*/g, '$1');
  return out;
}

function walk(directory) {
  for (const entry of readdirSync(join(root, directory), { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walk(join(directory, entry.name));
      continue;
    }
    if (!CHECK_EXT.has(extname(entry.name))) continue;

    const relative = join(directory, entry.name).replace(/\\/g, '/');
    // The validator names the forbidden paths itself, so it must not police its own source.
    if (relative === 'scripts/validate.mjs') continue;
    const contents = read(relative);

    // What matters is that nothing *resolves* outside the folder. Naming the mocks in a
    // comment, or printing the path as prose on the Foundations page, is documentation
    // and is expected. So comments are stripped, and the remaining text is checked only
    // in reference position: an import, a from, an href, a src, a url(), or a fetch().
    const code = stripComments(contents, extname(entry.name));
    if (!relative.endsWith('.md')) {
      for (const needle of FORBIDDEN) {
        const pattern = new RegExp(
          String.raw`(?:\bfrom\s*|\bimport\s*\(?\s*|\bhref\s*=\s*|\bsrc\s*=\s*|\burl\(\s*|\bfetch\(\s*)` +
          String.raw`["']?[^"'()\s>]*` + needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        );
        if (pattern.test(code)) {
          fail(`${relative} resolves a reference to ${needle}, which breaks the standalone contract.`);
        }
      }
    }
    if (contents.includes('--qbc-ink:')) tokenDeclarations += 1;

    if (extname(entry.name) === '.js' || extname(entry.name) === '.mjs') {
      for (const match of contents.matchAll(/from\s+['"](\.[^'"]+)['"]/g)) {
        const target = resolve(root, directory, match[1]);
        if (!target.startsWith(root)) fail(`${relative} imports ${match[1]}, which escapes the folder.`);
      }
    }
  }
}
walk('.');

if (tokenDeclarations !== 1) {
  fail(`--qbc-ink is declared in ${tokenDeclarations} files; tokens.css must be the only one.`);
}

/* -------------------------------------------- 9. HTML references resolve */

for (const page of ['index.html', 'preview.html', '404.html']) {
  const contents = read(page);
  for (const match of contents.matchAll(/(?:href|src)="([^"#][^"]*)"/g)) {
    const reference = match[1];
    if (/^(?:https?:|data:|mailto:|\/\/)/.test(reference)) continue;
    const target = reference.split(/[?#]/)[0];
    if (!target || target === './') continue;
    if (!exists(target)) fail(`${page} references ${target}, which does not exist.`);
  }
}

/* --------------------------------------------------------------------- report */

if (failures.length) {
  console.error(`Design-system contract failed with ${failures.length} problem${failures.length === 1 ? '' : 's'}:`);
  for (const message of failures) console.error(`  - ${message}`);
  process.exit(1);
}

console.log(
  `Validated standalone schema v${EXPECTED.schemaVersion}: ${counted.components} components across ` +
  `${counted.categories} categories, ${counted.dialogScenarios} dialog scenarios, ` +
  `${counted.patternScenarios} responsive pattern states, and local-only assets.`,
);
