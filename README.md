# QBC Workboard

[![CI](https://github.com/QuinntyneBrown/quinntyne-brown-consulting/actions/workflows/ci.yml/badge.svg)](https://github.com/QuinntyneBrown/quinntyne-brown-consulting/actions/workflows/ci.yml)
[![Design system](https://github.com/QuinntyneBrown/quinntyne-brown-consulting/actions/workflows/deploy-design-system.yml/badge.svg)](https://github.com/QuinntyneBrown/quinntyne-brown-consulting/actions/workflows/deploy-design-system.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

QBC Workboard is a responsive Scrum workspace for planning and delivering
software, product, and AI consulting work. It connects initiatives, epics,
stories, tasks, assistants, backlog grooming, sprint planning, and active-sprint
execution in one persistent application.

> [!IMPORTANT]
> QBC Workboard currently targets one trusted workspace and does not implement
> authentication or authorization. Do not expose an instance to an untrusted
> network.

The project is under active development and does not yet publish tagged
releases. Requirements and data migrations may change before the first release.

## Features

- Navigate among the sprint board, backlog, initiative hierarchy, and assistant
  directory without a full-page reload.
- Manage initiatives, epics, stories, checklist tasks, and assistant assignments.
- Groom and estimate stories before assigning them to a 14-day sprint.
- Move active work through To do, In progress, and Done with pointer, keyboard,
  and touch-friendly controls.
- Persist workspace state in SQL Server and protect hierarchy, assignment, and
  completed-sprint history.
- Publish the Angular application and ASP.NET Core API as one deployable output.
- Explore a standalone design-system catalog with reusable components, dialogs,
  and responsive product patterns.

## Architecture

QBC Workboard uses a browser application, controller-based API, Clean
Architecture backend, and SQL Server persistence.

```mermaid
flowchart LR
    Browser[Browser] --> App[Angular application]
    App --> Client[Typed API clients]
    Client --> Api[ASP.NET Core controllers]
    Api --> Application[Application commands and queries]
    Application --> Domain[Domain model]
    Application --> Contract[IWorkboardDbContext]
    Infrastructure[EF Core infrastructure] -. implements .-> Contract
    Infrastructure --> Database[(SQL Server)]
    Cli[QBC Workboard CLI] --> Infrastructure
```

| Area | Responsibility |
|---|---|
| `backend/src/Qbc.Workboard.Domain` | Entities, lifecycle rules, and enumerations |
| `backend/src/Qbc.Workboard.Application` | MediatR commands, queries, handlers, validation, and persistence contracts |
| `backend/src/Qbc.Workboard.Infrastructure` | EF Core mappings, SQL Server migrations, and database initialization |
| `backend/src/Qbc.Workboard.Api` | HTTP controllers, Problem Details, dependency injection, and production frontend hosting |
| `backend/src/Qbc.Workboard.Cli` | Installable .NET tool for database initialization and reset |
| `frontend/projects/qbc-workboard` | Routes, feature pages, orchestration, and Signal state |
| `frontend/projects/api` | Typed models, service interfaces, injection tokens, and HTTP clients |
| `frontend/projects/components` | Versioned Angular UI system aligned with the standalone component catalog |
| `design-system` | Standalone native Web Component catalog and contract tests |
| `docs` | Requirements, detailed designs, acceptance evidence, and prototypes |

The [detailed designs](docs/detailed-designs/) describe each vertical feature.
The [implementation alignment record](docs/implementation-design-alignment.md)
tracks known differences between those designs and the current source.

## Prerequisites

The default local workflow targets Windows because the application and tests use
the local `SQLEXPRESS` instance with Windows authentication.

- [Git](https://git-scm.com/)
- [PowerShell 7](https://learn.microsoft.com/powershell/scripting/install/installing-powershell)
- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
- [Node.js 22](https://nodejs.org/) with npm
- [SQL Server Express](https://www.microsoft.com/sql-server/sql-server-downloads)

An accessible SQL Server instance may replace local SQL Server Express by
overriding `ConnectionStrings__Workboard`. Backend integration tests use
`Server=.\SQLEXPRESS` by default and accept an instance-level connection string
through `QBC_TEST_SQLSERVER_CONNECTION_STRING`; every test host assigns its own
unique database name.

## Quick start

Clone the repository and restore the locked dependencies:

```powershell
git clone https://github.com/QuinntyneBrown/quinntyne-brown-consulting.git
Set-Location quinntyne-brown-consulting

dotnet restore backend/Qbc.Workboard.slnx
Set-Location frontend
npm ci
Set-Location ..
```

Initialize the database with representative development data:

```powershell
dotnet run --project backend/src/Qbc.Workboard.Cli/Qbc.Workboard.Cli.csproj -- database initialize --seed
```

Start the API and Angular development server:

```powershell
pwsh ./eng/Start-Workboard.ps1
```

The launcher waits for both servers, opens the application, writes logs under
`eng/logs`, and stops its child processes on exit.

| Service | URL |
|---|---|
| Web application | `http://localhost:4200` |
| API | `http://localhost:5050/api/workspace?route=board` |
| OpenAPI document | `http://localhost:5050/openapi/v1.json` |

### Run the servers manually

Start the API from the repository root:

```powershell
dotnet run --project backend/src/Qbc.Workboard.Api/Qbc.Workboard.Api.csproj --urls http://localhost:5050
```

Start Angular in a second terminal:

```powershell
Set-Location frontend
npm start
```

## Configuration

ASP.NET Core and the CLI read `appsettings.json`, environment variables, and the
standard .NET configuration providers.

| Setting | Default | Purpose |
|---|---|---|
| `ConnectionStrings__Workboard` | `Server=.\SQLEXPRESS;Database=QbcWorkboard;...` | Selects the SQL Server database |
| `SeedDevelopmentData` | `false` | Adds representative records when the database is empty |
| `DatabaseReset__RequireForce` | `true` | Requires `--force` before the CLI deletes a database |
| `AllowedOrigins__0` | unset | Adds an allowed CORS origin when the frontend uses a separate host |

EF Core applies pending migrations when the API or initialization command
starts. Production environments should provide their connection string through
environment-specific configuration or a secret store, not a committed file.

## Database maintenance CLI

The CLI runs through the same infrastructure and migrations as the API.

```powershell
# Preserve records and apply pending migrations
dotnet run --project backend/src/Qbc.Workboard.Cli/Qbc.Workboard.Cli.csproj -- database initialize

# Apply migrations and seed an empty database
dotnet run --project backend/src/Qbc.Workboard.Cli/Qbc.Workboard.Cli.csproj -- database initialize --seed

# Delete all records and recreate the database
dotnet run --project backend/src/Qbc.Workboard.Cli/Qbc.Workboard.Cli.csproj -- database reset --force
```

> [!CAUTION]
> `database reset --force` permanently deletes the configured database. Confirm
> `ConnectionStrings__Workboard` before running it.

Package and install the CLI as a global .NET tool when repeated use is needed:

```powershell
dotnet pack backend/src/Qbc.Workboard.Cli/Qbc.Workboard.Cli.csproj --configuration Release --output artifacts/packages
dotnet tool install --global Qbc.Workboard.Cli --add-source artifacts/packages
qbc-workboard --help
```

## Build and test

Run the same principal checks used by CI:

```powershell
# Backend integration tests
dotnet test backend/Qbc.Workboard.slnx --configuration Release

# Angular libraries and application
Set-Location frontend
npm ci
npm run format:check
npm run build
npm run validate:components
npm run test:components

# Browser acceptance tests
npx playwright install
npm run typecheck:e2e
npm run test:e2e

# Standalone design system
Set-Location ../design-system
npm ci
npx playwright install chromium
npm test
```

The backend tests create uniquely named SQL Server databases and delete them on
disposal. Set `QBC_TEST_SQLSERVER_CONNECTION_STRING` to run them against a SQL
Server instance other than local `SQLEXPRESS`. The Playwright suite starts only
the Angular application and uses a fresh, stateful API mock for each test while
running against Chromium, Firefox, and WebKit. No backend process or test
database is required by the browser suite.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the red-green-refactor workflow,
coding conventions, and pull-request checklist.

## Publish

Publishing the API installs locked frontend dependencies, builds all Angular
projects, and copies the browser bundle into the ASP.NET Core output:

```powershell
dotnet publish backend/src/Qbc.Workboard.Api/Qbc.Workboard.Api.csproj --configuration Release --output artifacts/publish
dotnet artifacts/publish/Qbc.Workboard.Api.dll --urls http://localhost:5050
```

The published API serves the Angular application and handles client-side route
fallback. A deployment should provide a production SQL Server connection string
and terminate TLS before exposing the application.

## Design system

The standalone catalog documents 35 native components, seven dialog families,
and five responsive product patterns. The Angular application uses the matching
35-component surface from `@qbc/components`; a manifest gate keeps both
inventories aligned without coupling their runtimes.

Browse the live catalog on GitHub Pages:
<https://quinntynebrown.github.io/quinntyne-brown-consulting/>.

To run it locally instead:

```powershell
Set-Location design-system
npm ci
npm start
```

Open `http://127.0.0.1:5175/`. See the
[design-system guide](design-system/README.md) for its architecture, contract
gate, browser tests, and GitHub Pages deployment.

## Documentation

| Document | Purpose |
|---|---|
| [Documentation index](docs/README.md) | Entry point for product and engineering documentation |
| [L1 requirements](docs/specs/L1.md) | Product goals, architecture constraints, and scope boundaries |
| [L2 requirements](docs/specs/L2.md) | Detailed requirements and Given/When/Then acceptance criteria |
| [Detailed designs](docs/detailed-designs/) | Per-feature architecture and behavior diagrams |
| [Acceptance evidence](docs/acceptance-evidence.md) | Recorded ATDD red and green boundaries |
| [Implementation alignment](docs/implementation-design-alignment.md) | Known differences and the plan to align code and designs |
| [Contributing](CONTRIBUTING.md) | Development workflow and pull-request expectations |
| [Security](SECURITY.md) | Supported versions and private vulnerability reporting |
| [Support](SUPPORT.md) | Help channels and support boundaries |
| [Governance](GOVERNANCE.md) | Maintainer roles and decision process |
| [Code of Conduct](CODE_OF_CONDUCT.md) | Community participation standards |
| [Changelog](CHANGELOG.md) | User-visible changes by release |

## Contributing

Issues and pull requests are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md)
before starting a substantial change. Participation in this repository follows
the [Code of Conduct](CODE_OF_CONDUCT.md).

## Security and support

Do not report vulnerabilities in a public issue. Follow the private process in
[SECURITY.md](SECURITY.md). Use [SUPPORT.md](SUPPORT.md) for product questions,
bug reports, and feature requests.

## License

QBC Workboard is licensed under the [MIT License](LICENSE).
