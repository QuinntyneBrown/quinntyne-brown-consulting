# @qbc/components

Reusable Angular 21 presentation components for QBC Workboard. The package contains the complete Angular counterpart of the 35-component standalone catalog, plus small Angular composition helpers for pages, forms, loading state, and compatibility with earlier app selectors.

The library owns visual tokens, native-control wrappers, overlays, navigation, cards, rows, and work-item presentation. It does not import `@qbc/api`, application services, feature state, or product workflows.

## Consume the library

Import standalone components from the public entry point:

```ts
import { ButtonComponent, DialogComponent, TextInputComponent } from '@qbc/components';
```

Load the packaged theme once in the consuming application. Inside this workspace, `angular.json` loads `projects/components/src/styles.scss`; published consumers can load `@qbc/components/styles.scss`.

Controls implement `ControlValueAccessor`, so `qbc-text-input`, `qbc-textarea`, `qbc-select`, and `qbc-checkbox` work with Angular reactive forms. `qbc-dialog` exposes `open()` and `close()` and restores focus to its invoker. Inputs and outputs use Angular signal APIs.

The public inventory is versioned in `component-manifest.json`. The standalone native implementation and interactive documentation remain in [`design-system`](../../../design-system/README.md).

## Verify

From `frontend/`:

```powershell
npm run build:components
npm run test:components
npm run validate:components
```

The boundary validator checks catalog parity, public exports, library independence, and that application templates do not bypass the library with raw buttons, form controls, dialogs, or navigation anchors.
