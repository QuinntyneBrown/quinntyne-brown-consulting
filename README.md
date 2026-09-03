# QBC Workboard

QBC Workboard is a responsive, single-user Scrum workspace for Quinntyne Brown Consulting Inc. It manages initiatives, epics, stories, optional tasks, assistants, backlog grooming, two-week sprint planning, and active sprint delivery.

## Technology

- .NET 10 controller API with Clean Architecture, MediatR 12.5.0, EF Core, and SQLite
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

Open `http://localhost:4200`. Development data is stored in `backend/src/Qbc.Workboard.Api/data/qbc-workboard.db` and is ignored by Git.

## Verify

```powershell
dotnet test backend/Qbc.Workboard.slnx --configuration Release
Set-Location frontend
npm ci
npm run build
npm run test:e2e
```

Individual Angular projects can also be verified with `npm run build:api`, `npm run build:components`, and `npm run build:app` from `frontend/`.

The Playwright command uses an isolated SQLite database, resets it before the test host starts, and provisions deterministic test data.

## Publish as one application

Publishing the API installs locked frontend dependencies, builds Angular, and copies the browser bundle into the ASP.NET output:

```powershell
dotnet publish backend/src/Qbc.Workboard.Api/Qbc.Workboard.Api.csproj --configuration Release --output artifacts/publish
artifacts/publish/Qbc.Workboard.Api.exe --urls http://localhost:5050
```

The SQLite connection string can be overridden with `ConnectionStrings__Workboard`. EF Core applies pending migrations at startup. Set `SeedDevelopmentData=true` only when representative development data is wanted.

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
