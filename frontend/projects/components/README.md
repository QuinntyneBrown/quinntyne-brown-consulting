# @qbc/components

Reusable Angular 21 presentation components for QBC Workboard: tokens, controls, overlays, navigation, cards, rows, work-item views, and small composition helpers for pages, forms, and loading state.

The library owns visual tokens, native-control wrappers, overlays, navigation, cards, rows, and work-item presentation. It does not import `@qbc/api`, application services, feature state, or product workflows.

## Consume the library

Import standalone components from the public entry point:

```ts
import { ButtonComponent, DialogComponent, TextInputComponent } from '@qbc/components';
```

Load the packaged theme once in the consuming application. Inside this workspace, `angular.json` loads `projects/components/src/styles.scss`; published consumers can load `@qbc/components/styles.scss`.

Controls implement `ControlValueAccessor`, so `qbc-text-input`, `qbc-textarea`, `qbc-select`, and `qbc-checkbox` work with Angular reactive forms. `qbc-dialog` exposes `open()` and `close()` and restores focus to its invoker. Inputs and outputs use Angular signal APIs.

The public inventory is versioned in `component-manifest.json`.

## Storybook

Storybook is the design-system catalog. `.storybook/` holds the configuration, manager theme and branding; `stories/src/` holds the Concepts and Theme MDX pages, one folder per component (`index.stories.ts` owns the meta and re-exports `<Name><Story>.stories.ts`, with `<Name>Description.md` and `<Name>BestPractices.md` prose for the docs page), and Patterns that compose whole screens. API tables come from compodoc.

From `frontend/`:

```powershell
npm run storybook        # http://localhost:6006
npm run build-storybook  # static site in dist/storybook
```

The catalog test suite lives in the root [`e2e`](../../../e2e/README.md) package. After building
Storybook, run `npm run test:storybook` there to visit every story and docs page
in Chromium.

## Verify

From `frontend/`:

```powershell
npm run build:components
npm run test:components
npm run validate:components
```

The boundary validator checks the manifest inventory, that every component has a Storybook entry with a `Default` story, public exports, library independence, and that application templates do not bypass the library with raw buttons, form controls, dialogs, or navigation anchors.
