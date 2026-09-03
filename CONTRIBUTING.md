# Contributing to QBC Workboard

Thank you for investing time in QBC Workboard. Contributions may include bug
reports, feature proposals, documentation improvements, tests, design-system
changes, and product code.

This guide describes the repository's contribution workflow. The
[Code of Conduct](CODE_OF_CONDUCT.md) applies to every project space and
interaction.

## Before starting

- Search [open and closed issues](https://github.com/QuinntyneBrown/quinntyne-brown-consulting/issues)
  before filing a new report.
- Use [SUPPORT.md](SUPPORT.md) to choose the correct help channel.
- Follow [SECURITY.md](SECURITY.md) instead of opening a public issue for a
  suspected vulnerability.
- Open an issue before a substantial feature, architecture change, dependency
  replacement, or requirements change. Early agreement prevents incompatible
  implementations.
- Small documentation corrections and narrowly scoped bug fixes may proceed
  directly to a pull request.

## Development environment

The default development and acceptance-test workflow requires Windows, .NET 10,
Node.js 22, PowerShell 7, and a local SQL Server Express instance named
`SQLEXPRESS`. The [root README](README.md#prerequisites) contains installation
links and the quick start.

Restore the repository from its root:

```powershell
dotnet restore backend/Qbc.Workboard.slnx
Set-Location frontend
npm ci
Set-Location ../design-system
npm ci
Set-Location ..
```

Initialize representative local data and start the product:

```powershell
dotnet run --project backend/src/Qbc.Workboard.Cli/Qbc.Workboard.Cli.csproj -- database initialize --seed
pwsh ./eng/Start-Workboard.ps1
```

Never point an acceptance test or `database reset --force` command at a database
containing data that should be retained.

## Contribution workflow

1. Fork the repository and create a focused branch from `main`.
2. Create or reference a GitHub issue for non-trivial work.
3. Select the relevant L2 requirement and Given/When/Then scenario under
   [`docs/specs/L2.md`](docs/specs/L2.md).
4. Add an acceptance test that fails for the missing or incorrect behavior.
5. Record the expected red result in
   [`docs/acceptance-evidence.md`](docs/acceptance-evidence.md).
6. Add the smallest coherent implementation that satisfies the scenario.
7. Refactor only after the acceptance test and existing regression suite pass.
8. Update affected requirements, detailed designs, diagrams, and user
   documentation in the same pull request.
9. Run the applicable checks and open a pull request using the repository
   template.

Executable behavior follows the ATDD rules in `L2-035` through `L2-039`.
Organization-only constraints use review, compiler checks, and static tooling
rather than behavior tests.

## Engineering conventions

### Backend conventions

- Keep dependencies pointed inward through Domain, Application, Infrastructure,
  and API.
- Use controller classes for HTTP resources and MediatR commands or queries for
  application use cases.
- Keep MediatR pinned to `12.5.0` unless the governing requirement changes.
- Put one top-level C# type in each source file and match the filename to the
  type.
- Add shared NuGet versions to `backend/Directory.Packages.props`.
- Treat compiler warnings as errors.
- Enforce relationship and lifecycle rules at the backend boundary. A frontend
  check does not replace the server rule.
- Return machine-readable Problem Details for validation, missing resources,
  conflicts, and unexpected failures.

### Frontend conventions

- Organize application code by feature under
  `frontend/projects/qbc-workboard/src/app/features`.
- Keep component TypeScript, template, and style files separate.
- Use Angular Signals for feature state, loading state, selection, and derived
  template state.
- Convert `HttpClient` Observables to Promises inside `@qbc/api`.
- Inject behavioral interfaces through typed Angular tokens. Components should
  not depend on concrete services.
- Keep product records server-authoritative. Do not use browser storage as the
  product repository.
- Preserve keyboard access, semantic structure, responsive layouts from 320 CSS
  pixels upward, and actionable error feedback.

### Design-system conventions

- Keep `design-system/` independent from `backend/`, `frontend/`, and `docs/` at
  runtime and build time.
- Update `component-manifest.json` whenever a component's public attributes or
  catalog examples change.
- Keep `assets/tokens.css` as the sole declaration point for `--qbc-*` tokens.
- Run the contract validator and browser suite before opening a pull request.

### Documentation and diagrams

- Update documentation with behavior in the same pull request.
- Keep L1 and L2 identifiers and requirement text exact when referencing the
  specifications.
- Update a feature's README, `.puml` source, and rendered `.png` together when a
  detailed design changes.
- Use concrete type and endpoint names from the current source.
- Mark genuinely undecided design details as `<TO SUPPLY>` instead of guessing.
- Add user-visible release notes to [CHANGELOG.md](CHANGELOG.md).

## Verification

Run the smallest relevant check while developing and the complete affected suite
before requesting review.

### Backend checks

```powershell
dotnet test backend/Qbc.Workboard.slnx --configuration Release
```

Backend integration tests create and remove uniquely named databases on the
local `SQLEXPRESS` instance.

### Angular checks

```powershell
Set-Location frontend
npm run format:check
npm run build
npx playwright install
npm run test:e2e
```

The format check enforces the committed Prettier configuration. The Playwright
suite starts only Angular and exercises the application with isolated, stateful
API mocks in Chromium, Firefox, and WebKit.

### Design-system checks

```powershell
Set-Location design-system
npm run validate
npx playwright install chromium
npm test
```

### Production publish

Changes to the frontend, API host, project files, or package graph should also
verify the combined publish:

```powershell
dotnet publish backend/src/Qbc.Workboard.Api/Qbc.Workboard.Api.csproj --configuration Release --output artifacts/publish
```

## Pull requests

A reviewable pull request:

- addresses one coherent concern;
- links its issue or explains why no issue is needed;
- describes user-visible behavior and architectural impact;
- records ATDD red and green evidence for executable behavior;
- includes tests at the public acceptance boundary;
- updates documentation and diagrams affected by the change;
- includes screenshots for meaningful visual changes;
- contains no credentials, customer data, generated reports, build output, or
  unrelated formatting churn; and
- passes all applicable CI checks.

Use clear, imperative commit subjects such as `Add sprint completion guard`.
Maintainers may ask for a branch to be rebased or for commits to be reorganized
when that materially improves review or history.

## Review and acceptance

Maintainers evaluate correctness, requirements traceability, test evidence,
accessibility, security, maintainability, and scope. A contribution may be
declined when it conflicts with the product scope or adds an abstraction without
a current requirement.

The decision and maintainer roles are described in
[GOVERNANCE.md](GOVERNANCE.md).

## Licensing

By submitting a contribution, you agree that it may be distributed under the
project's [MIT License](LICENSE).
