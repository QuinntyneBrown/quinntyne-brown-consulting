# QBC Workboard frontend

The frontend is an Angular 21 multi-project workspace. It separates the runnable
application, typed API access, and reusable presentation components.

## Projects

| Project                  | Responsibility                                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------------------ |
| `projects/qbc-workboard` | Routes, feature components, forms, orchestration, and Signal state                               |
| `projects/api`           | Backend models, Promise-based HTTP clients, service interfaces, and injection tokens             |
| `projects/components`    | Versioned Angular UI system: tokens, controls, overlays, shell, cards, rows, and work-item views |

The application depends on both libraries through their public entry points.
Neither library imports application source, and the libraries remain independent
of each other.

The application composes all buttons, form controls, dialogs, navigation, and
reusable work-item surfaces from `@qbc/components`. Feature pages retain forms,
Signals, service calls, routing, and workflow decisions. The library documents
every component in its Storybook design-system catalog; see its
[package guide](projects/components/README.md).

Feature components inject application service contracts through typed tokens.
Signal-backed application services delegate transport operations through a
second contract boundary in `@qbc/api`. `HttpClient` Observables terminate as
Promises inside the API library.

## Prerequisites

- Node.js 22 with npm
- .NET 10 SDK for local full-stack development
- SQL Server Express available as `.\SQLEXPRESS` for local full-stack development

The end-to-end suite in [`e2e`](../e2e/README.md) requires only Node.js and the
installed Playwright browsers.

## Install and run

```powershell
Set-Location frontend
npm ci
npm start
```

The development server listens on `http://localhost:4200` and proxies `/api`
and `/openapi` to `http://localhost:5050`. Start the backend separately or use
`pwsh ./eng/scripts/Start-Workboard.ps1` from the repository root.

## Build

```powershell
npm run build
```

The command builds `@qbc/api`, `@qbc/components`, and `qbc-workboard` in
dependency order. Individual builds are also available:

```powershell
npm run build:api
npm run build:components
npm run build:app
```

Application output is written to `frontend/dist/qbc-workboard/browser`.
The application build embeds the version from `package.json` and the source
revision from `QBC_SOURCE_REVISION_ID`, falling back to the checkout's `HEAD`.

Validate and unit-test the reusable component boundary independently:

```powershell
npm run validate:components
npm run test:components
```

Browse and verify the Storybook design-system catalog:

```powershell
npm run storybook        # http://localhost:6006
npm run build-storybook  # static site in dist/storybook
```

The catalog test suite lives in the root [`e2e`](../e2e/README.md) package. After building
Storybook, run `npm run test:storybook` there to visit every story and docs page
in Chromium.

## Formatting

Prettier is the authoritative formatter for authored frontend TypeScript,
Angular templates, SCSS, JSON, JavaScript, and Markdown. Format locally and run
the same non-mutating check used by CI with:

```powershell
npm run format
npm run format:check
```

Editor-independent whitespace defaults are defined in `.editorconfig`.
Generated output, dependencies, reports, lockfiles, logs, HAR files, and binary
icons are excluded by `.prettierignore`.

## End-to-end tests

The browser acceptance suite lives in [`e2e`](../e2e/README.md), beside this
folder. It serves the build this folder produces, so run `npm run build` before
running it.

## Conventions

- Keep component `.ts`, `.html`, and `.scss` files separate.
- Use Signals as the primary feature-state and template-reactivity mechanism.
- Keep RxJS inside APIs that require it and convert at the service boundary.
- Inject behavioral interfaces through typed tokens.
- Keep product data server-authoritative.
- Preserve keyboard access and layouts from 320 CSS pixels upward.

The binding requirements are `L2-031` through `L2-034` and `L2-038` through
`L2-040` in [`docs/specs/L2.md`](../docs/specs/L2.md). See
[CONTRIBUTING.md](../CONTRIBUTING.md) for the full workflow.
