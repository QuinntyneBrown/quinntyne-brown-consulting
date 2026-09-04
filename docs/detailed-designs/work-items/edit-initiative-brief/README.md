# Edit the initiative brief

## Overview

An initiative's description carries the outcome the organization is pursuing. The initiative
form saves it as one line of text, which is enough to name an outcome and not enough to
argue for one. This feature gives the description a route of its own and treats it as a
markdown document, so an outcome can carry success signals, guardrails, and planned epics
beside the sentence that names it.

*outcome brief* — the initiative description, written and read as a markdown document

*editor adapter* — the single surface the toolbar, outline, and status bar act through,
satisfied by both the code editor and the plain markdown field

*unsaved-changes guard* — the question raised before a navigation would discard markdown that
has not been saved

The brief is the initiative's description rather than a record of its own, so saving one is an
ordinary initiative update and every projection that names the initiative sees the change. The
description column already stores an unbounded string, so the document needed no schema change;
the API bounds its length instead.

Nothing about the brief is written to browser storage. A draft lives in the page's signals for
as long as the page does, which keeps the workspace's single stored value the session credential
required by `L2-021`.

## Description

- **`InitiativeBriefPageComponent`** — the routed page carrying the name field, the markdown
  toolbar, the write, split, and preview views, the initiative and outline rails, the size
  report, and the unsaved-changes question.
- **`InitiativeBriefService`** and **`IInitiativeBriefService`** — token-backed contract and
  Signal implementation that reads one initiative and saves its name and brief together.
- **`unsavedBriefGuard`** — `CanDeactivateFn` that asks the page whether a navigation away may
  proceed.
- **`BriefEditorComponent`** — hosts the markdown source, preferring the code editor and falling
  back to a plain markdown field when that editor cannot be loaded.
- **`BriefEditorAdapter`** — the contract both editors satisfy, covering source, selection,
  cursor, and revealing a line.
- **`createMonacoEditor`** and **`createTextareaEditor`** — the two adapter implementations.
- **`briefEditorWorker`** — the worker entry that lets the application bundler own and emit the
  code editor's background worker.
- **`renderMarkdown`** — escape-first renderer for the block and inline markdown a brief uses.
- **`readOutline`** — the brief's headings in document order, for the outline rail.
- **`MARKDOWN_COMMANDS`** and **`insertBlock`** — pure transforms over the source and its
  selection, so one implementation drives both editors.
- **`BRIEF_SNIPPETS`** — the insertable building blocks of a brief.
- **`SegmentedComponent`** — `@qbc/components` control presenting the write, split, and preview
  choice with `aria-pressed`.
- **`HierarchyService.getInitiative`** — reads one initiative through the documented API.
- **`SaveInitiativeCommand`** — bounds the description at 100,000 characters and reports the
  refusal against the `description` field.

The renderer escapes every value before it reaches the output and admits only http, mail,
in-page, and repository-relative link targets. The template binds its result through
`innerHTML`, so the framework sanitizes the same markup a second time.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each L2 requirement refines one
level-1 (L1) requirement.

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-046` | `L1-002` | An initiative's description shall be authored and read as a markdown outcome brief on its own addressable route. The application shall present the brief for one initiative, shall save the initiative name and its brief together, and shall preserve the brief's markdown structure. A brief shall remain required, and the API shall reject a brief longer than the supported length. |
| `L2-047` | `L1-002` | The brief editor shall provide markdown authoring aids: formatting commands that act on the current selection, insertable brief building blocks, a rendered preview of the brief, an outline of its headings, and a report of its size. It shall present the markdown source in a code editor and shall fall back to a plain markdown field when that editor cannot be loaded. |
| `L2-048` | `L1-002` | The brief editor shall report whether the brief holds unsaved changes, shall let the user discard them, and shall not allow a navigation away from the brief to discard them silently. Unsaved brief content shall be held in memory for the life of the page and shall not be written to browser storage. |

## Diagrams

### System context

A consultant writes the outcome an initiative is pursuing, and the workspace keeps that brief
with the initiative it belongs to.

![C4 system context for editing the initiative brief](diagrams/c4-context.png)

### Containers

The Angular application reads one initiative and saves the edited name and brief back through
the same initiative resource the hierarchy uses.

![C4 container view for editing the initiative brief](diagrams/c4-container.png)

### Components

The page drives one editor adapter through pure markdown transforms, renders the brief for the
preview and the outline, and asks the unsaved-changes question before a navigation proceeds.

![C4 component view for editing the initiative brief](diagrams/c4-component.png)

### Class structure

The class model separates the markdown transforms from the editor that carries the source, so
the code editor and the plain markdown field are interchangeable behind one adapter.

![Class diagram for editing the initiative brief](diagrams/class-structure.png)

### Behaviour — edit an initiative brief

The sequence follows a brief from opening through formatting and preview to saving, and covers
the unsaved-changes question raised when a navigation would discard the draft.

![Sequence diagram for editing an initiative brief](diagrams/sequence-edit-brief.png)
