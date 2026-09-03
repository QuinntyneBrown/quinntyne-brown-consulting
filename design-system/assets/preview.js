// Controller for the isolated specimen frame.
//
// Driven entirely by the query string, so the documentation site can point an iframe
// at any component, dialog, or pattern without this page knowing anything about the
// catalog beyond the manifest.

import { componentMarkup, dialogMarkup, patternMarkup } from './catalog-content.js';

const manifest = await fetch(new URL('../component-manifest.json', import.meta.url)).then(response => {
  if (!response.ok) throw new Error(`Unable to load the component manifest (${response.status}).`);
  return response.json();
});

const params = new URLSearchParams(location.search);
const type = params.get('type') ?? 'pattern';
const item = params.get('item') ?? '';
const scenario = params.get('scenario') ?? '';
const root = document.querySelector('#preview');
root.dataset.type = type;

if (type === 'component') {
  const component = manifest.components.find(entry => entry.selector === item);
  root.innerHTML = componentMarkup(component);
  document.title = `${component?.name ?? 'Component'} specimen · QBC Workboard`;
} else if (type === 'dialog') {
  const dialog = manifest.dialogs.find(entry => entry.id === item);
  root.innerHTML = dialogMarkup(item, scenario, { staticPreview: true });
  document.title = `${dialog?.name ?? 'Dialog'} specimen · QBC Workboard`;
} else {
  const pattern = manifest.patterns.find(entry => entry.id === item);
  root.innerHTML = patternMarkup(item, scenario);
  document.title = `${pattern?.name ?? 'Pattern'} specimen · QBC Workboard`;
}

// Specimens are illustrations, not a working application: links must not navigate the
// frame away from the screen being documented.
document.addEventListener('click', event => {
  const path = event.composedPath();
  if (path.some(node => node?.tagName === 'A')) event.preventDefault();
});
