## Project Overview

QBC Workboard is a responsive Scrum workspace for planning and delivering
software, product, and AI consulting work: initiatives, epics, stories, tasks,
assistants and their logged hours, backlog grooming, two-week sprint planning,
and active-sprint execution. The ASP.NET Core API (Clean Architecture, MediatR,
EF Core on SQL Server) and the Angular app publish as one deployable output. The
deployment is gated by a single shared passcode, not user accounts.

- `backend/` — .NET solution (`Qbc.Workboard.Domain`, `.Application`,
  `.Infrastructure`, `.Api`, `.Cli`) and its tests
- `frontend/` — Angular workspace (`qbc-workboard` app, `api` clients,
  `components` UI library)
- `e2e/` — Playwright browser acceptance suite for the frontend (its own npm
  package, run with `npm test` after building `frontend/`)
- `docs/specs/` — L1/L2 requirements; `docs/detailed-designs/` — per-feature
  designs; `docs/mocks/` — static design reference

See `README.md` for setup and development commands.

## Frontend conventions

- Prettier (`frontend/.prettierrc.json`) owns formatting and angular-eslint (`frontend/eslint.config.js`) owns lint; CI fails on either. Run `npm run lint` and `npm run format:check` in `frontend/`. The husky pre-commit hook fixes staged frontend files.

## Incremental Implementation and ATDD - mandatory

Mocks and the design system are design artifacts. ATDD does not apply to their
development. Do not write tests for mocks or the design system.

Every new feature or change to production behavior MUST have a requirement, a
detailed design, and a mock before implementation begins. This includes
behavioral changes to existing features, such as changing how a page behaves.
This requirement applies to production-code changes only; documentation-only,
design-system-only, mock-only, and test-only changes are out of scope unless
they are part of implementing a production behavior change.

Every production behavior implementation MUST invoke and follow the
`incremental-implementation` skill (`.claude/skills/incremental-implementation`
and `.agents/skills/incremental-implementation`) before any code is written,
combined with acceptance test-driven development (ATDD). Plan small,
reviewable slices, then complete one slice at a time: write Given-When-Then
acceptance criteria, write the acceptance test, and run it to prove it fails for
the expected reason BEFORE writing production code. Implement only what satisfies
that slice, refactor with tests green, and run the relevant regression checks.
Do not move to the next slice until those checks pass. No bulk implementation,
no tests added afterward, and no weakening tests to manufacture a pass. Keep
the requirement, detailed design, mock, criteria, tests, and implementation
aligned until the entire feature or behavior change is complete.

Back end: integration tests against the API. Front end: Playwright in `e2e/`,
using the Page Object Model - one page object per screen, owning the selectors and the
interactions. Tests state intent; page objects know the DOM. Never put a
selector in a test.

Run frontend tests in Chromium only. Do not configure or run Firefox, WebKit,
or any other browser for frontend testing.

### Never write architecture tests

Never add a test that asserts the shape of the codebase rather than its behavior:
no structure, layout, or naming tests; no banned-API scans; no traceability tests
that parse the specifications. Those constraints belong to the compiler, the
formatter, and review. A test suite exists to prove behavior.
