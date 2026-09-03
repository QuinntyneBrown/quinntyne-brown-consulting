# QBC Workboard frontend

The frontend is an Angular 21 multi-project workspace. It separates the runnable
application, typed API access, and reusable presentation components.

## Projects

| Project | Responsibility |
|---|---|
| `projects/qbc-workboard` | Routes, feature components, forms, orchestration, and Signal state |
| `projects/api` | Backend models, Promise-based HTTP clients, service interfaces, and injection tokens |
| `projects/components` | Versioned Angular UI system: tokens, controls, overlays, shell, cards, rows, and work-item views |

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

Validate and unit-test the reusable component boundary independently:

```powershell
npm run validate:components
npm run test:components
```

## End-to-end tests

Install Playwright browsers once, then run the acceptance suite:

```powershell
npx playwright install
npm run typecheck:e2e
npm run test:e2e
```

The command starts the Angular server and runs the Page Object Model suite in
Chromium, Firefox, and WebKit. A Playwright fixture intercepts every `/api`
request with a fresh, stateful mock for each test, so reload and CRUD scenarios
remain deterministic without starting .NET or creating a test database.

Every frontend service route has an explicit handler. An unhandled API request
fails the test, making contract growth visible instead of silently reaching a
developer backend.

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
