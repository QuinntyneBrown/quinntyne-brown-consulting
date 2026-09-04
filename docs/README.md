# QBC Workboard documentation

This directory contains the product requirements, feature designs, deployment
planning, acceptance evidence, and original interaction baseline for QBC
Workboard.

## Start here

| Document | Audience | Purpose |
| --- | --- | --- |
| [L1 product requirements](specs/L1.md) | Product owners and contributors | Defines goals, scope, architecture constraints, and quality obligations |
| [L2 detailed requirements](specs/L2.md) | Implementers and reviewers | Defines traceable requirements and Given/When/Then acceptance criteria |
| [Detailed designs](detailed-designs/) | Implementers and maintainers | Describes each vertical feature with C4, class, and sequence diagrams |
| [Cheapest Azure deployment plan](azure-deployment-plan.md) | Operators and maintainers | Defines the zero-cost App Service and Azure SQL deployment, safeguards, limits, and priced upgrade triggers |
| [Acceptance evidence](acceptance-evidence.md) | Reviewers and release owners | Records selected ATDD red states and green regression evidence |
| [Implementation alignment](implementation-design-alignment.md) | Maintainers | Tracks differences between current source and detailed designs |

The root [README](../README.md) contains setup, operation, test, and publish
instructions. [CONTRIBUTING.md](../CONTRIBUTING.md) defines the change workflow.

## Detailed-design map

| Subsystem | Feature design | Requirements |
| --- | --- | --- |
| Workspace | [Navigate the workspace](detailed-designs/workspace/navigate-workspace/) | `L2-001`, `L2-024`–`L2-026` |
| Work items | [Manage the work hierarchy](detailed-designs/work-items/manage-work-hierarchy/) | `L2-002`–`L2-004` |
| Work items | [Manage stories and tasks](detailed-designs/work-items/manage-stories-and-tasks/) | `L2-005`–`L2-008` |
| Work items | [Manage assistants and assignments](detailed-designs/work-items/manage-assistants-and-assignments/) | `L2-009`–`L2-010` |
| Work items | [Edit the initiative brief](detailed-designs/work-items/edit-initiative-brief/) | `L2-046`–`L2-048` |
| Planning | [Groom the backlog](detailed-designs/planning/groom-backlog/) | `L2-011`–`L2-012` |
| Planning | [Plan two-week sprints](detailed-designs/planning/plan-two-week-sprints/) | `L2-013`–`L2-016` |
| Delivery | [Execute the active sprint](detailed-designs/delivery/execute-active-sprint/) | `L2-017`–`L2-020` |
| Platform | [Serve the persistent workspace](detailed-designs/platform/serve-persistent-workspace/) | `L2-021`–`L2-023`, `L2-027`–`L2-030` |
| Platform | [Render the Angular workspace](detailed-designs/platform/render-angular-workspace/) | `L2-031`–`L2-034` |
| Platform | [Gate workspace access](detailed-designs/platform/gate-workspace-access/) | `L2-041`–`L2-043` |
| Quality | [Deliver vertical slices with ATDD](detailed-designs/quality/deliver-with-atdd/) | `L2-035`–`L2-040` |

Each detailed-design directory contains one `README.md`, five PlantUML sources,
and five rendered PNG diagrams.

## Supporting material

- [`mocks/index.html`](mocks/index.html), [`mocks/styles.css`](mocks/styles.css),
  and [`mocks/app.js`](mocks/app.js) form the original product interaction and
  visual baseline.
- [`mocks/pin-auth.html`](mocks/pin-auth.html) is the self-contained interaction
  study behind the passcode gate. It carries its own copy of the design tokens
  and accepts any four digits; the working gate is described in
  [Gate workspace access](detailed-designs/platform/gate-workspace-access/).
- [`mocks/initiative-editor.html`](mocks/initiative-editor.html) is the
  self-contained interaction study for writing an initiative: its name and its
  outcome brief, authored as markdown in a Monaco editor on one page. It covers
  creating an initiative and editing an existing one, the write, split, and
  preview views, a markdown toolbar, save and discard with an unsaved-changes
  guard, and the empty brief. Open it with `?new` to start an initiative. The
  study established treating the initiative description as markdown rather than
  as the single line of text an earlier form saved; that behavior is specified by
  `L2-002` and `L2-046` through `L2-048` and described in
  [Edit the initiative brief](detailed-designs/work-items/edit-initiative-brief/).
  The study loads Monaco from a CDN, while the working editor bundles it with the
  application; neither offers a plainer field when the editor cannot be loaded.
- The standalone [design-system guide](../design-system/README.md) documents the
  native Web Component catalog derived from that baseline.
- The [backend guide](../backend/README.md) describes the .NET solution and
  database tooling.
- The [frontend guide](../frontend/README.md) describes the Angular workspace and
  browser tests.

## Documentation changes

Product behavior starts in the requirements. An L2 change should preserve its
L1 trace and update affected acceptance criteria. An architecture or behavior
change should update the corresponding feature README, PlantUML source, rendered
PNG, and acceptance evidence in the same pull request.

Detailed-design prose uses third-person, present-tense, neutral language.
Unknown design facts are marked `<TO SUPPLY>` rather than invented.
