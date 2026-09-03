import { readFileSync, readdirSync } from 'node:fs';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const workspace = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const componentRoot = join(workspace, 'projects', 'components');
const componentSource = join(componentRoot, 'src');
const appSource = join(workspace, 'projects', 'qbc-workboard', 'src', 'app');
const manifest = JSON.parse(readFileSync(join(componentRoot, 'component-manifest.json'), 'utf8'));
const catalog = JSON.parse(readFileSync(resolve(componentRoot, manifest.catalogSource), 'utf8'));
const packageMetadata = JSON.parse(readFileSync(join(componentRoot, 'package.json'), 'utf8'));
const failures = [];

function filesUnder(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(path) : [path];
  });
}

const componentFiles = filesUnder(join(componentSource, 'lib')).filter((file) =>
  file.endsWith('.component.ts'),
);
const selectorFiles = new Map();
for (const file of componentFiles) {
  const match = readFileSync(file, 'utf8').match(/selector:\s*['"]([^'"]+)['"]/);
  if (match) selectorFiles.set(match[1], file);
}

const expectedCatalog = catalog.components.map((component) => component.selector).sort();
const declaredCatalog = [...manifest.catalogComponents].sort();
if (manifest.version !== packageMetadata.version) {
  failures.push(
    `Component manifest version ${manifest.version} does not match package version ${packageMetadata.version}.`,
  );
}
if (JSON.stringify(expectedCatalog) !== JSON.stringify(declaredCatalog)) {
  failures.push(
    'Angular manifest catalogComponents does not match design-system/component-manifest.json.',
  );
}

for (const selector of [...manifest.catalogComponents, ...manifest.angularExtensions]) {
  if (!selectorFiles.has(selector)) failures.push(`Missing Angular component for ${selector}.`);
}

const publicApi = readFileSync(join(componentSource, 'public-api.ts'), 'utf8');
for (const [selector, file] of selectorFiles) {
  const exportPath =
    './' + relative(componentSource, file).split(sep).join('/').replace(/\.ts$/, '');
  if (!publicApi.includes(`'${exportPath}'`))
    failures.push(`${selector} is not exported from the public API.`);
}

const appFiles = filesUnder(appSource);
const forbiddenElement = /<(button|input|select|textarea|dialog|a)(?:\s|>)/gi;
const legacyClass =
  /\b(primary-button|secondary-button|quiet-button|danger-button|icon-button|dialog-shell|dialog-head|dialog-body|dialog-actions)\b/g;
const legacyToken =
  /var\(--(ink|muted|line|soft|panel|accent|accent-dark|accent-soft|danger|danger-soft|radius|shadow)\b/g;

for (const file of appFiles) {
  const extension = extname(file);
  const source = readFileSync(file, 'utf8');
  const display = relative(workspace, file).split(sep).join('/');
  if (extension === '.html') {
    const native = [...source.matchAll(forbiddenElement)].map((match) => match[1]);
    if (native.length)
      failures.push(`${display} contains native UI elements: ${[...new Set(native)].join(', ')}.`);
    const classes = [...source.matchAll(legacyClass)].map((match) => match[1]);
    if (classes.length)
      failures.push(
        `${display} contains legacy component classes: ${[...new Set(classes)].join(', ')}.`,
      );
  }
  if (extension === '.scss' && legacyToken.test(source))
    failures.push(`${display} consumes legacy design tokens.`);
  legacyToken.lastIndex = 0;
}

for (const file of filesUnder(componentSource)) {
  if (!['.ts', '.html', '.scss'].includes(extname(file))) continue;
  const source = readFileSync(file, 'utf8');
  if (source.includes('@qbc/api') || source.includes('qbc-workboard')) {
    failures.push(
      `${relative(workspace, file)} couples @qbc/components to application or API code.`,
    );
  }
}

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log(
    `Component boundary valid: ${selectorFiles.size} exported Angular components, including all ${expectedCatalog.length} catalog components.`,
  );
}
