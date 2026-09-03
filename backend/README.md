# QBC Workboard backend

The backend is a .NET 10 solution that exposes the QBC Workboard HTTP API,
persists workspace data in SQL Server, and packages database maintenance as a
global .NET tool.

## Solution structure

| Project | Responsibility |
|---|---|
| `src/Qbc.Workboard.Domain` | Entities, enumerations, and domain transitions |
| `src/Qbc.Workboard.Application` | MediatR requests, handlers, validation, projections, and `IWorkboardDbContext` |
| `src/Qbc.Workboard.Infrastructure` | EF Core SQL Server context, migrations, and initialization |
| `src/Qbc.Workboard.Api` | Controller-based HTTP API, Problem Details, OpenAPI, and frontend hosting |
| `src/Qbc.Workboard.Cli` | Installable database initialization and reset tool |
| `tests/Qbc.Workboard.Api.IntegrationTests` | Acceptance tests through the real ASP.NET Core host |
| `tests/Qbc.Workboard.Cli.IntegrationTests` | Database command acceptance tests |

Dependencies point inward:

```text
Api ───────────────> Application ──> Domain
 │                         ▲
 └──> Infrastructure ──────┘
              ▲
Cli ──────────┘
```

Infrastructure implements the Application persistence contract. Domain has no
framework or persistence dependency.

## Prerequisites

- .NET 10 SDK
- SQL Server Express available as `.\SQLEXPRESS`

Override `ConnectionStrings__Workboard` to use another accessible SQL Server
instance. Integration-test fixtures use the local `SQLEXPRESS` instance with
Windows authentication by default. Set `QBC_TEST_SQLSERVER_CONNECTION_STRING`
to an instance-level connection string to run them against another SQL Server.

## Restore, build, and test

Run commands from the repository root:

```powershell
dotnet restore backend/Qbc.Workboard.slnx
dotnet build backend/Qbc.Workboard.slnx --configuration Release
dotnet test backend/Qbc.Workboard.slnx --configuration Release --no-build
```

The integration suites create uniquely named databases and delete them during
fixture disposal.

## Run the API

```powershell
dotnet run --project backend/src/Qbc.Workboard.Api/Qbc.Workboard.Api.csproj --urls http://localhost:5050
```

The API applies pending migrations at startup. Set `SeedDevelopmentData=true`
only when representative records are wanted in an empty database.

| Resource | Route |
|---|---|
| Workspace bootstrap | `/api/workspace` |
| Initiatives and hierarchy | `/api/initiatives` |
| Epics | `/api/epics` |
| Stories and backlog | `/api/stories` |
| Assistants | `/api/assistants` |
| Sprints and active board | `/api/sprints` |
| OpenAPI | `/openapi/v1.json` |

Known failures are returned as RFC Problem Details with validation, not-found,
or conflict status codes.

## Maintain a database

```powershell
dotnet run --project backend/src/Qbc.Workboard.Cli/Qbc.Workboard.Cli.csproj -- database initialize
dotnet run --project backend/src/Qbc.Workboard.Cli/Qbc.Workboard.Cli.csproj -- database initialize --seed
dotnet run --project backend/src/Qbc.Workboard.Cli/Qbc.Workboard.Cli.csproj -- database reset --force
```

`database reset --force` permanently deletes the configured database. The force
guard is enabled by default through `DatabaseReset:RequireForce`.

Create a local global-tool package with:

```powershell
dotnet pack backend/src/Qbc.Workboard.Cli/Qbc.Workboard.Cli.csproj --configuration Release --output artifacts/packages
dotnet tool install --global Qbc.Workboard.Cli --add-source artifacts/packages
```

The installed command is `qbc-workboard`.

## Publish the product

```powershell
dotnet publish backend/src/Qbc.Workboard.Api/Qbc.Workboard.Api.csproj --configuration Release --output artifacts/publish
```

The API project runs the locked Angular build and copies
`frontend/dist/qbc-workboard/browser` into `wwwroot`. Set
`SkipFrontendBuild=true` only when a separately verified frontend bundle is
already being supplied by the publishing workflow.

## Conventions

Backend changes follow the architecture and ATDD rules in
[`docs/specs/L2.md`](../docs/specs/L2.md). See the repository
[contribution guide](../CONTRIBUTING.md) before opening a pull request.
