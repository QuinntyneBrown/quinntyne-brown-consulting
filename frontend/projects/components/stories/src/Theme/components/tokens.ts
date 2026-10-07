/**
 * The Theme pages read the library's own stylesheet — `src/styles.scss`, the
 * file `angular.json` loads for the app and for Storybook — as raw text (the
 * `?raw` rule in `.storybook/main.ts`) and parse its `--qbc-*` declarations.
 * There is no second copy of the tokens to drift: rename or retune a token in
 * `styles.scss` and these pages follow.
 */
import stylesSource from '../../../../src/styles.scss?raw';

export interface Token {
  /** Full custom property name, e.g. `--qbc-accent`. */
  readonly name: string;
  /** Declared value, whitespace collapsed. */
  readonly value: string;
  /** One-line note on the token's role, where the name alone does not say. */
  readonly note: string;
}

export interface TokenOverride {
  readonly query: string;
  readonly name: string;
  readonly value: string;
}

/** Usage notes, written against what the components actually consume. */
const notes: Record<string, string> = {
  '--qbc-ink': 'Body text and headings',
  '--qbc-ink-soft': 'Secondary text, metadata, breadcrumbs, quiet buttons',
  '--qbc-ink-faint': 'Tertiary labels — story keys, row captions, input icons',
  '--qbc-line': 'Default 1px border and divider',
  '--qbc-line-strong': 'Control borders (inputs, selects) that must read on white',
  '--qbc-line-dashed': 'Dashed outline of the empty state',
  '--qbc-line-card': 'Story card border',
  '--qbc-panel': 'Page, cards, dialogs and inputs',
  '--qbc-soft': 'Board columns, hover fill, muted pills and tags',
  '--qbc-surface-raised': 'Sidebar, initiative cards, dialog surfaces',
  '--qbc-surface-hover': 'Hover fill on interactive cards',
  '--qbc-sprint-hero-bg': 'Gradient behind the current-sprint summary',
  '--qbc-accent': 'Primary button, progress bar, brand mark, focused field border',
  '--qbc-accent-dark': 'Primary hover; ink on accent-soft (pills, active nav item)',
  '--qbc-accent-soft': 'Ready / active / done pills, active nav fill, avatar disc',
  '--qbc-blue': 'Draft / to-do pill ink',
  '--qbc-blue-soft': 'Draft / to-do pill fill',
  '--qbc-amber': 'In-progress / planned / limited pill ink',
  '--qbc-amber-soft': 'In-progress / planned / limited pill fill',
  '--qbc-danger': 'Destructive buttons, required asterisks, error text',
  '--qbc-danger-soft': 'Form error banner and destructive confirmation fill',
  '--qbc-nav-ink': 'Sidebar nav label',
  '--qbc-nav-icon': 'Sidebar nav icon',
  '--qbc-placeholder': 'Input placeholder text',
  '--qbc-focus-ring': 'Global :focus-visible outline (3px, 2px offset)',
  '--qbc-focus-ring-field': 'Focus halo inside text inputs, selects and textareas',
  '--qbc-scrim': 'Backdrop behind qbc-dialog',
  '--qbc-font-sans': 'Everything — body, controls, headings',
  '--qbc-font-mono': 'Code and identifiers',
  '--qbc-shadow-card': 'Story cards, cards, the selected segment',
  '--qbc-shadow-overlay': 'Dialogs, toasts, the mobile sidebar drawer',
  '--qbc-r-xs': 'Story-point badge',
  '--qbc-r-sm': 'Form error banner, skip link',
  '--qbc-r-control': 'Buttons, inputs, selects, nav items, task rows',
  '--qbc-r-md': 'Brand mark, progress track, sprint rows',
  '--qbc-r-lg': 'Story cards and data rows',
  '--qbc-r-xl': 'Board columns, sprint hero, initiative cards, empty states',
  '--qbc-r-2xl': 'Dialog panel',
  '--qbc-r-pill': 'Status pills and counts',
  '--qbc-button-h': 'Minimum height of qbc-button',
  '--qbc-control-h': 'Height of text inputs and selects',
  '--qbc-sidebar-w': 'Fixed sidebar width; the workspace is offset by it above 900px',
  '--qbc-topbar-h': 'Top bar height',
  '--qbc-page-max': 'Maximum width of qbc-page content',
  '--qbc-gutter': 'Horizontal page padding, fluid with the viewport',
};

const declaration = /(--qbc-[\w-]+)\s*:\s*([^;]+);/g;

function parse(block: string): { name: string; value: string }[] {
  return [...block.matchAll(declaration)].map(([, name, value]) => ({
    name,
    value: value.replace(/\s+/g, ' ').trim(),
  }));
}

/** The first top-level `:root { … }` block — the token definitions. */
const rootBlock = /(?:^|\n):root\s*\{([^}]*)\}/.exec(stylesSource)?.[1] ?? '';

/** Every `--qbc-*` token declared on `:root`, in stylesheet order. */
export const tokens: readonly Token[] = parse(rootBlock).map((t) => ({
  ...t,
  note: notes[t.name] ?? '',
}));

/** Retunes inside `@media (…) { :root { … } }` blocks. */
export const overrides: readonly TokenOverride[] = [
  ...stylesSource.matchAll(/@media\s*([^{]+)\{\s*:root\s*\{([^}]*)\}/g),
].flatMap(([, query, block]) => parse(block).map((t) => ({ query: query.trim(), ...t })));

export function overridesFor(name: string): readonly TokenOverride[] {
  return overrides.filter((o) => o.name === name);
}

/** Tokens whose name (without `--qbc-`) is listed. Unknown names are skipped. */
export function pick(...names: string[]): readonly Token[] {
  return names
    .map((n) => tokens.find((t) => t.name === `--qbc-${n}`))
    .filter((t): t is Token => t !== undefined);
}

/** Tokens whose name (without `--qbc-`) starts with any prefix. */
export function byPrefix(...prefixes: string[]): readonly Token[] {
  return tokens.filter((t) => prefixes.some((p) => t.name.startsWith(`--qbc-${p}`)));
}
