# Render the Angular workspace

## Overview

The frontend is a responsive Angular application that renders server-authoritative
workspace data. Each feature consumes a behavioral service interface through a
typed injection token. Concrete HTTP services remain composition-root details.

*Signal store* — root- or route-scoped service that owns writable Signals and
exposes read-only and computed Signals

*service contract* — `I`-prefixed behavioral interface paired with a typed
Angular `InjectionToken`

*interface-driven consumption* — dependency rule in which consumers inject a
contract token without importing the concrete implementation

Angular Signals hold feature data, loading, errors, selection, filters, and
derived presentation. `HttpClient` Observables terminate inside service
implementations and update Signals. Components do not coordinate long-lived
subscriptions.

## Description

The `frontend/` workspace uses standalone Angular components with external
templates and styles. Standalone describes Angular composition; it does not mean
single-file components.

- **`AppComponent`** — application root that hosts `AppShellComponent` and the
  Angular router outlet.
- **`AppConfig`** — composition root that aliases each typed token to its
  root-provided implementation with `useExisting`.
- **`IResourceService`** — pattern implemented by feature-specific contracts such
  as `IStoryService`; each contract exposes read-only Signals and commands.
- **`ResourceService`** — pattern implemented by feature-specific HTTP services;
  each implementation owns writable state and implements one contract.
- **`ApiProblem`** — typed DTO for RFC 9457 responses.
- **`ApiErrorPresenter`** — service that maps transport failures to feature error
  state and accessible user feedback.
- **`LoadingState`** — data type representing idle, loading, loaded, and failed
  request conditions.
- **`provideWorkboardServices`** — provider factory that binds every service token
  with `useExisting`.

Each component occupies a `.ts` file and references sibling `.html` and `.scss`
files. Each declared interface, class, type alias, and enum has its own matching
TypeScript file. Feature services treat backend responses as authoritative and
do not persist product records in browser storage.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each L2
requirement refines one level-1 (L1) requirement.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-031` | `L1-011` | The `frontend/` folder shall contain an Angular application organized by feature. Components shall use separate `.ts`, `.html`, and style files; inline templates and inline styles are prohibited. |
| `L2-032` | `L1-011` | Angular Signals shall be the primary mechanism for feature state, derived state, loading state, selection, and template reactivity. RxJS shall be confined to APIs that require it, such as `HttpClient`, and converted at the service or store boundary. |
| `L2-033` | `L1-011` | Frontend consumers shall depend on behavioral service interfaces and typed Angular `InjectionToken`s, not concrete service classes, following the referenced interface-driven service-consumption pattern. |
| `L2-034` | `L1-011` | The Angular application shall consume the documented backend API through typed, feature-oriented service contracts and shall not use localStorage as the product data repository. |

## Diagrams

### System context

The consultant operates QBC Workboard through the Angular web application. The
frontend communicates only with the product API.

![C4 system context for the Angular workspace](diagrams/c4-context.png)

### Containers

The browser loads the Angular application, which calls the ASP.NET Core API over
JSON and HTTPS. The API owns persistent data.

![C4 container view for the Angular workspace](diagrams/c4-container.png)

### Components

Components inject typed tokens. Each token aliases one concrete HTTP service that
updates Signal state from API responses.

![C4 component view for the Angular workspace](diagrams/c4-component.png)

### Class structure

The contract and implementation relationship creates a test seam while
preserving one shared Signal graph per feature service.

![Class diagram for the Angular workspace](diagrams/class-structure.png)

### Behaviour — load and mutate feature state

The sequence shows a component reading Signals, calling the contract, and
receiving an authoritative API result through the concrete service.

![Sequence diagram for the Angular workspace](diagrams/sequence-consume-service.png)
