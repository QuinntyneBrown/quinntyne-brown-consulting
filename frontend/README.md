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
Signals, service calls, routing, and workflow decisions. The library mirrors all
35 components in the standalone catalog and adds Angular-specific composition
helpers; see its [package guide](projects/components/README.md).

Feature components inject application service contracts through typed tokens.
Signal-backed application services delegate transport operations through a
second contract boundary in `@qbc/api`. `HttpClient` Observables terminate as
Promises inside the API library.

## Prerequisites

- Node.js 22 with npm
- .NET 10 SDK for local full-stack development
- SQL Server Express available as `.\SQLEXPRESS` for local full-stack development

The end-to-end suite requires only Node.js and the installed Playwright browsers.

## Install and run

```powershell
Set-Location frontend
npm ci
npm start
```

The development server listens on `http://localhost:4200` and proxies `/api`
and `/openapi` to `http://localhost:5050`. Start the backend separately or use
`pwsh ./eng/Start-Workboard.ps1` from the repository root.

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

Install Playwright browsers once, then run the acceptance suite:

```powershell
npx playwright install
npm run typecheck:e2e
npm run test:e2e
```

The command starts the Angular server and runs the Page Object Model suite. A
Playwright fixture intercepts every backend API request with a fresh, stateful
mock for each test, so reload and CRUD scenarios remain deterministic without
starting .NET or creating a test database. The mocked backend version is
test-only; the frontend identity still comes from the metadata compiled into the
Angular development build.

Every applicable acceptance criterion in
[`docs/specs/L2.md`](../docs/specs/L2.md) has one test, named for the
requirement and the scenario it proves, so coverage can be audited by reading
the suite. Specifications are grouped by requirement:

| File                       | Requirements                        |
| -------------------------- | ----------------------------------- |
| `navigation.spec.ts`       | `L2-001`                            |
| `hierarchy.spec.ts`        | `L2-002`, `L2-003`, `L2-004`        |
| `stories.spec.ts`          | `L2-005` – `L2-008`                 |
| `assistants.spec.ts`       | `L2-009`, `L2-010`                  |
| `backlog.spec.ts`          | `L2-011`, `L2-012`                  |
| `sprint-planning.spec.ts`  | `L2-013` – `L2-016`                 |
| `board.spec.ts`            | `L2-017` – `L2-020`                 |
| `persistence.spec.ts`      | `L2-021`, `L2-032`                  |
| `api-boundary.spec.ts`     | `L2-034`                            |
| `interaction.spec.ts`      | `L2-026`                            |
| `responsive.spec.ts`       | `L2-024`, `L2-040`                  |
| `accessibility.spec.ts`    | `L2-025`, `L2-040`                  |
| `access.spec.ts`           | `L2-042`, `L2-043`                  |
| `deployment.spec.ts`       | `L2-045`                            |
| `delivery-journey.spec.ts` | `L2-038` critical-workflow coverage |

Chromium carries the whole suite. Firefox and WebKit run the `@smoke` subset,
which proves each workflow works in every supported engine without repeating
every scenario three times. Scenarios own their workspace state through the
`seed` fixture option, so the suite runs in parallel and no test depends on
another test's changes.

Every backend route has an explicit mock handler. An unhandled API request fails
the test, making contract growth visible instead of silently reaching a developer
backend. The mock enforces the same relationship, grooming, and lifecycle rules
the real API exposes, because the specification's rejection scenarios are
observed through the feedback those rules produce. Mock and fixture files are
excluded from the application TypeScript configuration and are never included in
a production bundle.

Acceptance criteria that describe backend enforcement, infrastructure, or code
organisation get no browser test; `L2-039` prohibits tests that inspect source,
and backend integration tests own the rules a browser cannot reach.

## Conventions

- Keep component `.ts`, `.html`, and `.scss` files separate.
- Use Signals as the primary feature-state and template-reactivity mechanism.
- Keep RxJS inside APIs that require it and convert at the service boundary.
- Inject behavioral interfaces through typed tokens.
- Keep product data server-authoritative.
- Preserve keyboard access and layouts from 320 CSS pixels upward.
- Put selectors, interactions, and observations in Page Objects rather than test
  specifications.

The binding requirements are `L2-031` through `L2-034` and `L2-038` through
`L2-040` in [`docs/specs/L2.md`](../docs/specs/L2.md). See
[CONTRIBUTING.md](../CONTRIBUTING.md) for the full workflow.
