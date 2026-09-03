# QBC Workboard Design System

The standalone, first-class reference for QBC Workboard: design tokens, 35 native components,
7 dialog families across 10 scenarios, and 5 product patterns across 10 responsive states.

It has no runtime, validation, test, or build dependency on another folder in this repository and
can be copied or versioned independently.

The Angular application consumes the separately packaged
[`@qbc/components`](../frontend/projects/components/README.md) implementation.
Its manifest is checked against this catalog, while both implementations remain
independently buildable and have no runtime dependency on each other.

## Run locally

```powershell
npm ci
npm start
```

Open `http://127.0.0.1:5175/`. Component, dialog, and pattern URLs support direct navigation and
browser refresh.

## Validate and test

```powershell
npm run validate
npx playwright install chromium
npm test
```

`npm run validate` is the contract gate. `npm test` runs it and then the Playwright suite across
mobile, tablet, and desktop viewports.

## Build and deploy

```powershell
npm run build
```

`dist/` is a self-contained static site. It deploys to GitHub Pages from
`.github/workflows/deploy-design-system.yml` on any push to `main` that touches this folder.

**One manual step is required before the first deploy:** in the repository settings, set
Pages → Build and deployment → Source to **GitHub Actions**. The workflow cannot enable this itself
and will fail until it is set.

Routing is hash-based (`#/components/qbc-button/api`) and the Vite `base` is `./`, so the site works
unchanged from a domain root or from a project subpath such as
`https://quinntynebrown.github.io/quinntyne-brown-consulting/`. `staticwebapp.config.json` ships in
the build so a move to Azure Static Web Apps is a one-line change to the workflow.

## Where the design comes from

`docs/mocks/styles.css` is the source of truth for this system, and requirement L2-026 makes that
binding: the product *"shall preserve the mock's restrained visual language, generous whitespace,
clear typography, progressive disclosure, and explicit feedback."*

The mock stylesheet is a superset of what the Angular application shipped. Avatars, drag-over
feedback, row hover, task strikethrough, empty-state icons, the narrow confirm dialog, card
elevation, and both entrance animations exist in the mock and were lost in the port. This system
recovers them rather than redesigning them.

Fixture content, including the assistants, initiatives, and stories QBC-097 through QBC-106, is
copied once from the mock's seed workspace. Nothing here reads that folder at runtime, and the
validator enforces it.

## What this system corrects

Three status vocabularies render unstyled or indistinguishable in the sources. `qbc-pill` and
`qbc-availability` fix all three, and the catalog documents each one:

| Defect | Where | Fix |
| --- | --- | --- |
| Sprint `completed` has no rule, so the pill renders unstyled | `docs/mocks/styles.css` | Added to the neutral tone group |
| Board values `toDo` and `inProgress` do not match the class names `.todo` and `.progress` | Angular model versus mock CSS | Both spellings resolve to the same tone |
| The availability dot is hard-coded green for all three states | `docs/mocks/styles.css` | Green, amber, and grey per state |

Two accessibility gaps are also closed: the progress meter gains a full `role="progressbar"` value
triplet, and a `prefers-reduced-motion` block neutralises the three animations the mock declares
without a guard.

Two gaps are documented rather than fixed, because fixing either is a product decision.

**Inter is requested by the font stack but never shipped anywhere in this repository**, so the
non-standard weights 620, 680, and 750 only render as drawn where a reader already has Inter
installed.

**The `title` attribute also produces a native tooltip.** Nine components take a `title`, and because
`title` is a global HTML attribute a browser shows its text on hover over the host in addition to
rendering it as the heading. The name is kept because it reads correctly across the whole catalog and
keeps the API consistent; renaming it to `heading` or `label` would remove the tooltip at the price of
a less natural attribute name on components such as `qbc-task-item`. Every affected component page
states the tradeoff.

## Ownership

- `assets/tokens.css` is authoritative for this product, and is the only file that declares a
  `--qbc-*` token.
- `assets/components/` contains the complete native component implementation.
- `component-manifest.json` is the versioned public inventory: API metadata, examples, dialog
  scenarios, and pattern states. The documentation site derives everything from it.
- `assets/catalog-content.js` owns the dialog and pattern fixtures.

Other products may duplicate these values. They must not import them at runtime.

## Architecture

No framework and no runtime dependencies. Two devDependencies: Vite and Playwright.

- Components are native custom elements extending `QbcElement` in `assets/components/qbc-base.js`:
  an open shadow root, a `styles()` and `template()` pair, and an optional `afterRender()`.
- **Attributes are the whole API.** There are no property accessors and no reflection. Variants are
  `:host([attr="value"])` selectors and booleans are attribute presence, so styling cannot drift out
  of sync with state.
- Design tokens cross the shadow boundary by custom-property inheritance, so components never import
  a stylesheet.
- Overlays accept a `static` attribute, which renders the same element inline without a scrim. That
  is how a dialog is documented in place and launched live from one definition.
- `preview.html` loads the tokens but not `docs.css`, so an iframed screen is a real product screen
  rather than a documentation page wearing product clothes.

## What the contract gate checks

`scripts/validate.mjs` collects every failure and exits non-zero with the full list:

- Manifest version matches `package.json`, and the inventory counts match the declared contract.
- Selectors, categories, and source files resolve; every attribute declares a type, a description,
  and an explicit default; every example renders its own selector.
- **Source-to-manifest drift**: `observedAttributes()` is scraped from each component file, and any
  attribute the manifest does not document fails the build.
- The registry barrel and the manifest agree in both directions.
- `--qbc-ink` is declared exactly once, so there is one token source.
- No file resolves a reference to `../frontend`, `../backend`, or the mocks, and no relative import
  escapes this folder.
- Every `href` and `src` in the HTML entry points resolves to a real file.
