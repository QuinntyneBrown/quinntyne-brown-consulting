# Implementation and detailed-design alignment

## Purpose

This document records differences between the current QBC Workboard
implementation and the ten existing feature designs under
[`docs/detailed-designs`](detailed-designs/). It also defines the work needed to
make the implementation, detailed-design prose, PlantUML sources, rendered
diagrams, and acceptance evidence describe the same system.

The audit uses the current worktree on 2026-09-02. The baseline includes the
database-maintenance CLI and its integration tests. Those files are present in
the worktree even though the detailed designs predate them.

The L1 and L2 specifications remain the authority for product behavior. The
implementation should change when it conflicts with a requirement or a
requirement-backed design behavior. A detailed design should change when the
implementation uses a simpler structure that still satisfies the requirements.

## Summary

The implementation preserves the designs' principal architecture:

- The Angular workspace contains the `qbc-workboard`, `@qbc/api`, and
  `@qbc/components` projects.
- Feature pages consume Signal-backed application services through typed
  injection tokens.
- Application services call Promise-based HTTP clients in `@qbc/api`.
- Controller-based ASP.NET Core endpoints dispatch commands and queries through
  MediatR 12.5.0.
- Application handlers use `IWorkboardDbContext`, and EF Core persists the
  workspace in SQL Server Express.
- Backend integration tests and Playwright Page Objects exercise public product
  boundaries.

Most drift comes from implementation-time consolidation. The detailed designs
show separate form, card, dialog, filter, and store classes. The implementation
keeps those responsibilities inside six page or feature components and their
Signal-backed services. This consolidation is consistent with `L2-036` and
should remain unless a separate reuse or maintenance requirement emerges.

Five confirmed behavior gaps require implementation changes. Three
implementation surfaces also lack requirement-traced design coverage. The
remaining differences require design and evidence updates.

## Traceability and design-coverage gaps

The existing detailed-design tree covers all identifiers from `L2-001` through
`L2-043`; `L2-041` through `L2-043` are covered by
[Gate workspace access](detailed-designs/platform/gate-workspace-access/). The
current implementation also contains three surfaces that no L1 or L2 requirement
names.

| Implementation surface | Difference | Required disposition |
|---|---|---|
| [`Qbc.Workboard.Cli`](../backend/src/Qbc.Workboard.Cli/) | The CLI initializes, seeds, and permanently resets a database. The backend platform design still describes four production projects and no maintenance host. | Classify the CLI as product behavior or engineering operations. A product classification shall add L1 and L2 requirements before a feature design is created. An operations classification shall document the commands outside the requirement-traced design tree and show only their infrastructure integration in the platform design. |
| [`design-system`](../design-system/) | The root README calls the standalone Web Component catalog a first-class deliverable. The specifications and detailed designs cover the separate Angular `@qbc/components` library only. | Classify the catalog as a product deliverable or reference tooling. A product classification shall add requirements before a detailed design is created. A tooling classification shall remove the first-class product implication and retain its standalone README. |
| [`eng/Start-Workboard.ps1`](../eng/Start-Workboard.ps1) | The development launcher orchestrates the API, Angular server, proxy, browser, logging, and shutdown. No detailed design describes it. | Treat the launcher as engineering tooling unless the requirements baseline expands. Its operational contract should remain in script help and the root README rather than a product feature design. |

No new detailed-design feature should be invented for these surfaces before the
classification and requirements decisions are recorded.

## Confirmed behavior gaps

| ID | Requirement or design behavior | Current implementation | Alignment action |
|---|---|---|---|
| `A1` | `L2-004` defines hierarchy story counts and completion from non-archived stories. | [`GetHierarchyQueryHandler`](../backend/src/Qbc.Workboard.Application/Features/Hierarchy/Queries/GetHierarchyQueryHandler.cs) loads all stories and includes archived stories in each count and percentage. | Add an API acceptance case containing archived and active stories. Filter archived stories from hierarchy roll-ups. |
| `A2` | `L2-004` provides contextual story creation from an epic. `L2-005` provides story opening from the hierarchy. | [`HierarchyPageComponent`](../frontend/projects/qbc-workboard/src/app/features/hierarchy/hierarchy-page.component.ts) creates initiatives and epics only. Its template neither renders stories nor opens `StoryEditorService` with a preselected epic. | Add a Playwright acceptance scenario. Expose story links beneath each epic and pass the epic identity into the new-story editor. |
| `A3` | `L2-012` identifies every missing or invalid grooming field. The backlog design presents field-specific validation details and an edit action. | [`presentApiError`](../frontend/projects/api/src/lib/errors/present-api-error.ts) returns only the first entry from a Problem Details `errors` object. [`BacklogService`](../frontend/projects/qbc-workboard/src/app/features/backlog/backlog.service.ts) stores that single string. | Add a Playwright scenario with multiple missing grooming fields. Preserve structured validation errors and render every field message with the existing story-open action. |
| `A4` | `L2-011` and the backlog design expose unscheduled, planned, active, or historically completed sprint disposition. | The [backlog template](../frontend/projects/qbc-workboard/src/app/features/backlog/backlog-page.component.html) omits completed sprints from its selector. A completed story therefore has no matching option for its retained `sprintId`. | Add a Playwright assertion for a completed story. Render completed sprint name and status as read-only disposition while retaining editable selectors for eligible stories. |
| `A5` | The workspace design announces a recoverable bootstrap failure. `L2-026` provides actionable feedback after an API operation fails. | [`WorkspaceService`](../frontend/projects/qbc-workboard/src/app/core/workspace.service.ts) catches a bootstrap error and sets `loadingState` to `failed`, but it discards the error and does not call `FeedbackService`. | Add a route-bootstrap failure scenario. Present the API error through the existing `presentApiError` and `FeedbackService` path while leaving the activated route usable. |

`L2-026` also requires duplicate-submission prevention during pending operations.
The save forms and backlog mutations expose pending state, but sprint lifecycle
and board transition controls do not use a pending guard. The alignment work
should audit every mutating control and add one acceptance matrix for this
cross-cutting behavior.

## Detailed-design differences

### Workspace — navigate the workspace

The [workspace design](detailed-designs/workspace/navigate-workspace/README.md)
matches the four routes, application shell, navigation component, workspace
controller, and query handler.

The following structural details differ:

- `WorkspaceRoute` does not exist. Angular routes and backend bootstrap requests
  use string route values.
- Two `IWorkspaceService` and `WorkspaceService` pairs form separate application
  and `@qbc/api` boundaries. The feature design presents one service boundary.
- `menuOpen` belongs to `AppShellComponent`, not
  `WorkspaceNavigationComponent`.
- `ProblemDetailsPresenter` does not exist. The API library exports the
  `presentApiError` function, and the application owns `FeedbackService`.
- The component, class, and sequence diagrams show the missing route type and
  error presenter. They also omit the API-library service layer.

The design should adopt the string route representation and the two service
boundaries. Gap `A5` should add the missing error behavior to the implementation.

### Work items — manage the work hierarchy

The [hierarchy design](detailed-designs/work-items/manage-work-hierarchy/README.md)
matches the controllers, MediatR handlers, entity relationships, deletion
guards, and hierarchy query.

The following details differ:

- `HierarchyPageComponent` owns both reactive forms and both native dialogs.
  `InitiativeFormComponent` and `EpicFormComponent` do not exist.
- The application `HierarchyService` owns Signals and calls the separate
  `@qbc/api` hierarchy client. The design collapses those layers.
- The implementation returns `HierarchyDto`, `InitiativeHierarchyDto`, and
  `EpicHierarchyDto`. The class diagram names conceptual
  `HierarchyProjection`, `InitiativeProjection`, and `EpicProjection` types.
- `Initiative.Update` and `Epic.Update` replace the diagram's separate
  `Rename`, `Describe`, and `MoveTo` methods.
- Save operations return an initiative or epic DTO. The frontend then reloads
  the hierarchy instead of receiving a hierarchy projection from the command.
- Delete conflicts contain an actionable reason but no child count.

The design should reflect the consolidated page, real DTOs, entity methods, and
reload flow. Gaps `A1` and `A2` should change the implementation first.

### Work items — manage stories and tasks

The [story design](detailed-designs/work-items/manage-stories-and-tasks/README.md)
matches story identity, lifecycle, readiness, board state, task ownership,
archive, restore, and guarded deletion.

The following details differ:

- `StoryEditorComponent` combines the designed `StoryFormComponent`,
  `StoryDetailsComponent`, and `StoryActionsComponent` responsibilities.
- The same editor renders owner and task-assignee selectors. A separate
  `AssistantPickerComponent` does not exist.
- The application `IStoryService` owns selected-story Signals. It delegates to
  a second `IStoryService` in `@qbc/api`.
- `Story.ReplaceTasks` replaces the full child collection during save.
  `StoryTask.Update` replaces the diagram's `Rename`, `SetCompletion`, and
  `Assign` operations.
- Backend response types are `StoryDto`, not `StoryDetails` or `Result`.
- The hierarchy does not currently provide the designed story-detail entry
  point described by gap `A2`.

The design should retain the consolidated editor and document both service
boundaries and the replace-on-save task model.

### Work items — manage assistants and assignments

The [assistant design](detailed-designs/work-items/manage-assistants-and-assignments/README.md)
matches profile persistence, workload projection, assignment references, and
guarded deletion.

The following details differ:

- `AssistantsPageComponent` owns the assistant form and blocking-assignment
  dialog. The designed `AssistantFormComponent` and
  `AssistantAssignmentsDialogComponent` do not exist.
- Story and task selectors live in `StoryEditorComponent`; there is no reusable
  `AssistantPickerComponent`.
- Assignment changes travel through `StoryService`, `StoriesController`, and
  `SaveStoryCommandHandler` as part of a story save. The sequence diagram sends
  a dedicated assignment operation through `IAssistantService` and
  `AssistantsController`.
- The assistant list already contains `blockingAssignments`. The page opens the
  blocking dialog before issuing a delete request. The backend delete handler
  independently returns `409 Conflict` for direct clients.
- `AssistantProjection` builds `AssistantDto` and `AssignmentLinkDto`; no
  `AssistantWorkloadProjection` type exists.

The design should adopt the story-aggregate assignment path and document the
frontend pre-check plus backend guard.

### Work items — log hours against a story

The [logged-hours design](detailed-designs/work-items/log-hours-against-a-story/README.md)
was written alongside the implementation, so its prose, class structure, and
sequence name the types that exist. The two are aligned today.

Two decisions in it are worth restating, because a later reader could reasonably
expect the opposite:

- Completion is read at projection time, not stamped on the entry. No story
  carries a completed-at moment, so "hours on completed stories" means hours
  against stories whose board status is Done when the report is read. Moving a
  story off Done moves its hours out of the completed total with it.
- `AssistantHoursProjection` sums hours in memory over loaded records. The
  acceptance suite runs on SQLite, which stores a `decimal` as text and would
  sum it as text, so a database-side aggregate would be correct in production
  and wrong under test.

`AssistantProjection` gained a fourth parameter for the entries, because
deleting an assistant must be refused while any of their hours remain. Without
it the delete meets the foreign key and answers `500` where `L2-050` requires
`409`.

### Planning — groom the backlog

The [backlog design](detailed-designs/planning/groom-backlog/README.md) matches
client-side search and filtering, server-authoritative grooming, and the
`StoryReadinessPolicy`.

The following details differ:

- `BacklogFilter` is a TypeScript string-union type, not a component or enum.
- `BacklogPageComponent` owns the search and filter controls.
- `BacklogService` owns source, criteria, loading, error, and computed result
  Signals. A separate `BacklogStore` does not exist.
- The application service delegates HTTP work to the `@qbc/api` story service.
  The feature diagrams omit this boundary.
- Grooming and readiness reversal refetch the complete backlog after the
  command succeeds. They do not replace one story in a separate store.

The design should reflect the consolidated Signal service and refetch flow.
Gaps `A3` and `A4` should change the implementation first.

### Planning — plan two-week sprints

The [sprint-planning design](detailed-designs/planning/plan-two-week-sprints/README.md)
matches sprint duration, lifecycle, assignment rules, completed-sprint
corrections, and planned-sprint deletion.

The following details differ:

- `SprintManagerComponent` owns the manager and edit dialogs. The designed
  `SprintManagerDialogComponent` and `SprintFormComponent` do not exist.
- `BacklogPageComponent` owns sprint assignment controls. A separate
  `SprintAssignmentComponent` does not exist.
- `SprintPlanningService` owns Signals and delegates to `@qbc/api`'s
  `ISprintService`.
- The delete use case is `DeleteSprintCommand` with
  `DeleteSprintCommandHandler`, not `DeletePlannedSprintCommand`.
- `StartSprintCommandHandler` checks the single-active-sprint invariant before
  calling parameterless `Sprint.Start`. `Story.AssignToSprint` accepts a sprint
  identity rather than a `Sprint` aggregate.
- Each mutation refetches the sprint list. Backlog assignment then reloads the
  backlog independently.

The design should adopt these concrete types and flows.

### Delivery — execute the active sprint

The [sprint-execution design](detailed-designs/delivery/execute-active-sprint/README.md)
matches the three board states, explicit movement controls, optional drag
interaction, progress projection, and sprint-completion disposition.

The following details differ:

- `BoardPageComponent` renders the summary, columns, and story cards. The
  designed `SprintBoardPageComponent`, `BoardColumnComponent`, and
  `SprintStoryCardComponent` do not exist.
- `SprintExecutionService` owns the board Signal. A separate
  `SprintBoardStore` does not exist.
- The execution service delegates reads and completion to the `@qbc/api` sprint
  service. It delegates movement to the `@qbc/api` story service.
- A move returns `StoryDto`, after which the frontend reloads the active-board
  projection. A completion returns `SprintDto`, after which the same reload
  produces the no-active-sprint state.
- The class diagram gives `MoveStoryCommandHandler` an active-board return type;
  the implementation returns the changed story.

The design should adopt the consolidated board component, Signal service, split
API clients, and reload behavior.

### Platform — serve the persistent workspace

The [backend platform design](detailed-designs/platform/serve-persistent-workspace/README.md)
matches Clean Architecture dependency direction, controllers, MediatR 12.5.0,
EF Core, SQL Server Express, Problem Details, and the file-per-type convention.

The following details differ:

- `Qbc.Workboard.Cli` is a fifth production project in the solution. It exposes
  guarded `database initialize` and `database reset` operations through
  `DatabaseMaintenanceService` and `WorkboardDbInitializer`.
- Infrastructure contains `WorkboardDbContext`, migrations, and initialization
  support. It contains no repository types.
- `WorkboardDbContext` directly implements `IWorkboardDbContext`. Handlers call
  its queryables, `Add`, `Remove`, and `SaveChangesAsync` methods.
- The Application exception is `ConflictException`, not
  `DomainConflictException`. Domain entities use `DomainRuleException`.
- `ValidationBehavior` invokes validation only for requests implementing
  `IValidatableRequest`. Lifecycle invariants remain in handlers and entities.
- No explicit transaction pipeline behavior exists. Each command handler uses
  one EF Core `SaveChangesAsync` call for its write set.
- `Qbc.Workboard.Api` builds the Angular workspace during publish and serves its
  static files with an `index.html` fallback. The platform designs omit this
  production packaging relationship.

The design should record the CLI integration after the traceability decision.
It should add deployment responsibilities, remove repository claims, and use
the real exception and persistence types.

### Platform — render the Angular workspace

The [Angular platform design](detailed-designs/platform/render-angular-workspace/README.md)
is the closest representation of the current frontend. It already documents the
application facade, API client, Signal, token, provider, and component-library
boundaries.

Two diagram details differ. `provideQbcServices` and `provideQbcWorkboard` are
exported provider functions rather than `QbcServicesProviders` and
`QbcWorkboardProviders` classes. API error presentation is the exported
`presentApiError` function plus application `FeedbackService`, not a presenter
class.

The README and diagrams should use the function names and show the shared error
path.

### Quality — deliver vertical slices with ATDD

The [quality design](detailed-designs/quality/deliver-with-atdd/README.md)
matches the two acceptance boundaries and the Page Object Model rule.

The following concrete structure differs:

- `WorkboardApiFactory` directly configures and drops a uniquely named SQL
  Express database per xUnit test class. `IntegrationDatabase` and `ApiAcceptanceTest` do not
  exist.
- Four xUnit acceptance classes use `HttpClient` directly through the factory.
- [`workspace.spec.ts`](../frontend/e2e/tests/workspace.spec.ts) contains the
  Playwright scenarios. `AcceptanceSpec` and a common `FeaturePage` base class do
  not exist.
- `AccessibilityPage` owns axe and keyboard checks. Responsive verification is
  a viewport loop in `workspace.spec.ts`; `AccessibilityScan` and
  `ResponsiveWorkflow` are not declared types.
- [`acceptance-evidence.md`](acceptance-evidence.md) is the evidence record. It
  is not an `AcceptanceEvidence` code type or external system.
- The acceptance evidence states that the solution test command runs four
  tests. The current solution command runs four API tests and seven CLI tests.

The quality README and all three structural diagrams should describe the real
fixtures, specifications, page objects, and Markdown evidence record. The
release-check counts should be refreshed after the alignment changes pass.

## Alignment plan

### Phase 0 — resolve design coverage

1. Classify `Qbc.Workboard.Cli` as product behavior or engineering operations.
2. Classify the standalone `design-system` as a product deliverable or reference
   tooling.
3. Record `eng/Start-Workboard.ps1` as engineering tooling unless an L1/L2 scope
   change explicitly promotes it.
4. Add requirement identifiers and acceptance criteria before creating a new
   detailed-design feature for any promoted product surface.

Phase 0 exits when every implementation surface has either a requirement-backed
design destination or an explicit non-product documentation destination.

### Phase 1 — close requirement-backed behavior gaps

Each behavior change shall follow the red-green-refactor workflow in `L2-035`
and `L2-036`.

1. Add backend acceptance coverage for non-archived hierarchy roll-ups, then
   implement gap `A1`.
2. Add a Playwright flow for contextual story creation and hierarchy story
   opening, then implement gap `A2`.
3. Add a Playwright flow for multi-field grooming failures, then implement gap
   `A3` with structured error state.
4. Add a completed-sprint backlog assertion, then implement gap `A4`.
5. Add a route-bootstrap failure assertion, then implement gap `A5`.
6. Add a mutation-control matrix for `L2-026`, then guard every uncovered
   sprint and board action against duplicate submission.

Phase 1 exits when the new acceptance cases pass and all existing API and
Playwright acceptance tests remain green.

### Phase 2 — align feature designs to the retained implementation structure

The feature READMEs should replace speculative class names with current source
names. Each component, class, and sequence diagram should show the two frontend
service boundaries and the actual refresh behavior.

The update order should follow shared architectural impact:

1. Update `render-angular-workspace` as the canonical frontend boundary model.
2. Update `navigate-workspace` and the three work-item designs.
3. Update both planning designs and the sprint-execution design.
4. Update `serve-persistent-workspace` with the CLI's decided integration scope,
   direct context contract, exception types, and production static-file hosting.
5. Update `deliver-with-atdd` with the actual test fixtures and evidence file.

Phase 2 shall preserve every exact requirement identifier and requirement text
already copied from [`docs/specs`](specs/).

### Phase 3 — regenerate and verify design artifacts

1. Render every changed `.puml` source to its sibling `.png`.
2. Verify that all 70 PlantUML sources have rendered PNG siblings.
3. Verify that every README image link resolves.
4. Verify that C4 sources retain C4 macros and contain no raw replacement
   shapes or arrows.
5. Scan prose for the detailed-design house style and unresolved
   `<TO SUPPLY>` markers.
6. Search design prose and diagrams for every removed speculative type name.

Phase 3 exits when the diagram renderer succeeds and all documentation checks
return no unresolved reference.

### Phase 4 — refresh acceptance evidence and release checks

Run the complete verification set after code and design alignment:

```powershell
dotnet test backend/Qbc.Workboard.slnx --configuration Release
Set-Location frontend
npm run build
npm run test:e2e
```

The acceptance evidence should record each new red state and final green result.
Its release-check section should then report the current API, CLI, and
Playwright totals instead of the earlier four-test solution total.

## Completion criteria

Alignment is complete when all of the following statements are true:

- Gaps `A1` through `A5` and the `L2-026` pending-state audit have passing
  acceptance coverage.
- Every design uses concrete implementation names unless a label is explicitly
  marked as conceptual.
- Every sequence diagram matches the implemented endpoint, handler result, and
  frontend refresh path.
- The CLI, standalone design system, and development launcher have explicit
  requirement or engineering-tooling classifications.
- The backend platform design records the decided CLI integration and production
  frontend-hosting responsibilities.
- The quality design matches the test source tree and acceptance-evidence
  mechanism.
- All `.puml` files render, all PNG links resolve, and all requirement references
  remain exact.
- Backend tests, the Angular production build, and the Playwright suite pass from
  a clean checkout.

## Audit evidence

The audit inspected detailed-design READMEs and PlantUML sources, production
declarations, controller routes, command handlers, Angular templates and
services, backend integration tests, Playwright specifications, and Page
Objects. Two non-browser checks passed against the audited worktree:

- `dotnet test backend/Qbc.Workboard.slnx --configuration Release --no-restore`:
  11 passed, comprising 4 API and 7 CLI integration tests.
- `npm run build` in `frontend/`: `@qbc/api`, `@qbc/components`, and
  `qbc-workboard` built successfully.

The Playwright suite was not rerun during this documentation-only audit. The
existing [acceptance evidence](acceptance-evidence.md) records its latest stated
result.
