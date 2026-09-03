# QBC Workboard

QBC Workboard is a responsive, single-user Scrum workspace for Quinntyne Brown Consulting Inc. It manages initiatives, epics, stories, optional tasks, assistants, backlog grooming, two-week sprint planning, and active sprint delivery.

## Technology

- .NET 10 controller API with Clean Architecture, MediatR 12.5.0, EF Core, and SQL Server Express
- Angular 21 with Signals and interface-driven service consumption
- xUnit integration acceptance tests through the ASP.NET Core host
- Playwright Page Objects across Chromium, Firefox, and WebKit, with axe accessibility checks

## Frontend workspace

The Angular workspace separates the runnable product from its reusable libraries:

- `frontend/projects/api` publishes `@qbc/api`, which contains typed backend DTOs, services, interfaces, and injection tokens.
- `frontend/projects/components` publishes `@qbc/components`, which contains reusable presentational UI components.
- `frontend/projects/qbc-workboard` contains the runnable application, feature logic, routing, and Signal state.

The application depends on both libraries through their public entry points. The libraries remain independent of the application and each other.

## Run locally

The development environment seeds the representative workspace from the HTML mocks. Production starts empty.

```powershell
dotnet run --project backend/src/Qbc.Workboard.Api/Qbc.Workboard.Api.csproj --urls http://localhost:5050
```

In another terminal:

```powershell
Set-Location frontend
npm ci
npm start
```

Open `http://localhost:4200`. Development data is stored in the `QbcWorkboard` database on the local `SQLEXPRESS` instance.

## Verify

```powershell
dotnet test backend/Qbc.Workboard.slnx --configuration Release
Set-Location frontend
npm ci
npm run build
npm run test:e2e
```

Individual Angular projects can also be verified with `npm run build:api`, `npm run build:components`, and `npm run build:app` from `frontend/`.

The Playwright command uses the isolated `QbcWorkboardPlaywright` SQL Express database, resets it before the test host starts, and provisions deterministic test data.

## Publish as one application

Publishing the API installs locked frontend dependencies, builds Angular, and copies the browser bundle into the ASP.NET output:

```powershell
dotnet publish backend/src/Qbc.Workboard.Api/Qbc.Workboard.Api.csproj --configuration Release --output artifacts/publish
artifacts/publish/Qbc.Workboard.Api.exe --urls http://localhost:5050
```

The SQL Server connection string can be overridden with `ConnectionStrings__Workboard`. EF Core applies pending migrations at startup. Set `SeedDevelopmentData=true` only when representative development data is wanted.

## Maintain the local database

The installable .NET tool initializes or resets the configured local SQL Express database through the same infrastructure used by the API. Create the package and install it globally from the local package source:

```powershell
dotnet pack backend/src/Qbc.Workboard.Cli/Qbc.Workboard.Cli.csproj --configuration Release --output artifacts/packages
dotnet tool install --global Qbc.Workboard.Cli --add-source artifacts/packages
qbc-workboard --help
```

After installation, use the `qbc-workboard` command:

```powershell
# Apply migrations without deleting existing records
qbc-workboard database initialize

# Apply migrations and seed representative development records when empty
qbc-workboard database initialize --seed

# Permanently delete all records and recreate an empty, fully migrated database
qbc-workboard database reset --force

# Reset and then add representative development records
qbc-workboard database reset --force --seed
```

The CLI reads `appsettings.json`, environment variables, and other standard Microsoft configuration providers. Override the target with `ConnectionStrings__Workboard`. The `DatabaseReset__RequireForce` option defaults to `true`.

Upgrade or remove the globally installed tool with `dotnet tool update --global Qbc.Workboard.Cli --add-source artifacts/packages` or `dotnet tool uninstall --global Qbc.Workboard.Cli`.

## Design system

The design system is a first-class deliverable in its own right. `design-system/` is a standalone,
deployable static web app documenting the tokens, components, dialogs, and screen patterns of QBC
Workboard. It has no runtime dependency on `backend/`, `frontend/`, or `docs/`.

```powershell
Set-Location design-system
npm ci
npm start
```

See the [design system README](design-system/README.md) for the contract gate, the test suite, and
the GitHub Pages deployment.

## Product documentation

- [High-level requirements](docs/specs/L1.md)
- [Detailed requirements and acceptance criteria](docs/specs/L2.md)
- [Detailed designs](docs/detailed-designs)
- [Acceptance evidence](docs/acceptance-evidence.md)
- [Design system](design-system/README.md)
