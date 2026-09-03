# QBC Workboard frontend

The frontend is an Angular 21 multi-project workspace. It separates the runnable
application, typed API access, and reusable presentation components.

## Projects

| Project | Responsibility |
|---|---|
| `projects/qbc-workboard` | Routes, feature components, forms, orchestration, and Signal state |
| `projects/api` | Backend models, Promise-based HTTP clients, service interfaces, and injection tokens |
| `projects/components` | Reusable Angular presentation components without product workflow state |

The application depends on both libraries through their public entry points.
Neither library imports application source, and the libraries remain independent
of each other.

Feature components inject application service contracts through typed tokens.
Signal-backed application services delegate transport operations through a
second contract boundary in `@qbc/api`. `HttpClient` Observables terminate as
Promises inside the API library.

## Prerequisites

- Node.js 22 with npm
- .NET 10 SDK
- SQL Server Express available as `.\SQLEXPRESS` for end-to-end tests

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

## End-to-end tests

Install Playwright browsers once, then run the acceptance suite:

```powershell
npx playwright install
npm run test:e2e
```

The command builds the backend, resets the dedicated
`QbcWorkboardPlaywright` SQL Server database, starts the API and Angular server,
and runs the Page Object Model suite in Chromium, Firefox, and WebKit.

The reset is destructive only to the database named in
`ConnectionStrings__Workboard` inside `playwright.config.ts`. Confirm that value
before running tests after a local configuration change.

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
