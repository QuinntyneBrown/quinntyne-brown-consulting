# QBC Workboard acceptance suite

Browser acceptance tests for the Angular frontend in [`frontend`](../frontend),
written with Playwright and the Page Object Model. The suite is its own npm
package so it sits beside `frontend` and `backend` rather than inside either.

| Folder       | Contents                                                  |
| ------------ | --------------------------------------------------------- |
| `tests/`     | Specifications, one per requirement group                 |
| `pages/`     | Page Objects holding selectors and interactions           |
| `fixtures/`  | Playwright fixtures that seed and mock each test          |
| `mocks/`     | The stateful mock of the `/api` contract                  |
| `support/`   | Helpers shared across specifications                      |
| `storybook/` | Storybook catalog checks, run by `npm run test:storybook` |

The mocks import their types from `@qbc/api`, which `tsconfig.json` maps to the
frontend's API library source, so the suite needs the frontend's dependencies
installed as well as its own. It requires only Node.js 22 and the installed
Playwright browsers; no backend or database takes part.

The suite reads the frontend build, so build it first, then install the suite's
dependencies and Playwright browsers once and run it:

```powershell
Set-Location frontend
npm ci
npm run build
Set-Location ../e2e
npm ci
npx playwright install
npm run typecheck
npm test
```

The command serves the build and runs the Page Object Model suite. A
Playwright fixture intercepts every backend API request with a fresh, stateful
mock for each test, so reload and CRUD scenarios remain deterministic without
starting .NET or creating a test database. The mocked backend version is
test-only; the frontend identity still comes from the metadata compiled into the
Angular build under test.

Every applicable acceptance criterion in
[`docs/specs/L2.md`](../docs/specs/L2.md) has one test, named for the
requirement and the scenario it proves, so coverage can be audited by reading
the suite. Specifications are grouped by requirement:

| File                       | Requirements                        |
| -------------------------- | ----------------------------------- |
| `navigation.spec.ts`       | `L2-001`                            |
| `hierarchy.spec.ts`        | `L2-002`, `L2-003`, `L2-004`        |
| `initiative-brief.spec.ts` | `L2-046` – `L2-048`                 |
| `stories.spec.ts`          | `L2-005` – `L2-008`, `L2-056`       |
| `assistants.spec.ts`       | `L2-009`, `L2-010`                  |
| `assistant-hours.spec.ts`  | `L2-050`, `L2-051`                  |
| `attachments.spec.ts`      | `L2-053`                            |
| `backlog.spec.ts`          | `L2-011`, `L2-012`, `L2-057`        |
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

Chromium carries the whole suite. The `@smoke` tags mark the critical workflows
and remain in place, so a second engine can be restored by adding it back to
`playwright.config.ts`. Scenarios own their workspace state through the `seed`
fixture option, so the suite runs in parallel and no test depends on another
test's changes.

The suite reads the built application rather than the development server, so
what it proves is what gets deployed. Run `npm run build` in `frontend` first; the server that
carries the build refuses to start without one.

The backend is mocked out completely; it never needs to be running. The mock is
installed on the whole browser context before the application loads. It answers
every `/api` request from the server that hosts the build. Every other origin,
including a locally running API, is refused. A refused request or an `/api` route
without a handler fails the test, so no scenario can pass by reaching a real
backend, and contract growth shows up instead of silently reaching one. The mock enforces the same relationship, grooming, and lifecycle rules
the real API exposes, because the specification's rejection scenarios are
observed through the feedback those rules produce. Mock and fixture files are
excluded from the application TypeScript configuration and are never included in
a production bundle.

Acceptance criteria that describe backend enforcement, infrastructure, or code
organisation get no browser test; `L2-039` prohibits tests that inspect source,
and backend integration tests own the rules a browser cannot reach.

## Storybook catalog

`playwright.storybook.config.ts` runs `storybook/` against the static Storybook
build in `frontend/dist/storybook`. Build it first, then run the catalog suite:

```powershell
Set-Location frontend
npm run build-storybook
Set-Location ../e2e
npm run test:storybook
```

Put selectors, interactions, and observations in Page Objects rather than test
specifications.
