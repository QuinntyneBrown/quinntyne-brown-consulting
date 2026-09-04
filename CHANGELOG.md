# Changelog

This file records notable user-visible changes to QBC Workboard.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioned releases will follow [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Work item attachments. An initiative, an epic, and a story each carry their
  own list of files, attached by dropping them on the work item or choosing
  them from the computer, downloaded under the name they arrived with, and
  removed once the removal is confirmed. A file belongs to the work item it was
  attached to and is inherited neither up nor down the hierarchy, so an epic
  never shows its initiative's files. Four kinds of file are turned away, each
  saying which rule it met: an empty file or a dropped folder, a file over
  25 MB, a program or script, and a name already attached to that work item.
  Deleting a work item deletes its files with it; deleting an assistant leaves
  the files they attached in place, without an uploader.
- Recorded hours. A time entry names a story, an assistant, a date, an amount of
  hours in quarter-hour increments, and an optional note.
  `/assistants/{assistantId}` reports one assistant's totals, the share of their
  logged time that sits on stories which are now done, and every story they
  worked on, filtered to completed or in-flight work and expandable to the
  individual entries. **Edit** on a disclosed entry reopens the same form on what
  was recorded, so the story, the date, the hours, or the note can be corrected in
  place; **Delete** removes the entry outright. An assistant has worked on a story
  when they have hours logged against it, so the record survives the story being
  reassigned. Deleting an assistant is refused while any of their hours remain,
  listing the stories holding them.
- Project-level contribution, security, support, governance, and conduct
  policies.
- GitHub issue and pull-request templates.
- A navigable documentation index and expanded repository quick start.
- The MIT License and machine-readable package license metadata.
- A versioned 44-component Angular UI-system package with theme tokens, control
  value accessors, overlays, navigation, work-item views, unit tests, and a
  catalog-parity manifest.
- An automated component-boundary gate that rejects raw application controls,
  unexported components, catalog drift, and API/application coupling.
- A gated GitHub Actions deployment from `main` to the zero-cost Azure
  Workboard environment using OpenID Connect.
- Explicit local and Azure database targets in the Workboard CLI, including an
  in-place guarded reset that preserves the Azure SQL free-offer resource.
- A shared passcode gate in front of the whole workspace. Entering the passcode
  returns a signed session credential that authorizes every API request for
  seven days, repeated attempts from one address are throttled, and the passcode
  hash and signing key are created with the database rather than configured.
- The same page for writing an epic: its parent initiative, its name, and its
  summary, always markdown, saved together. **＋ Epic** on an initiative opens it
  at `/epics/new` with that initiative already chosen, and **Edit** on an epic row
  opens it at `/epics/{id}`; the modal with its plain summary box is gone, so an
  epic has one way to be written and no plain-text field anywhere. An epic can be
  moved to another initiative from the same page, and the hierarchy row shows the
  summary's first line of prose rather than its markdown source. An epic has no
  house shape, so a new summary opens empty rather than from a template. The API
  now bounds a summary at 100,000 characters, as it already bounded a brief.
- One page for writing an initiative: its name and its outcome brief, always
  markdown, saved together. **New initiative** opens it at `/initiatives/new` and
  **Edit** opens an existing one at `/initiatives/{id}`; there is no plain-text
  description field anywhere, and no separate form beside the hierarchy. The
  brief carries headings, lists, task lists, tables, quotes, and fenced code; a
  formatting toolbar composes it; write, split, and preview views show the
  source, both, or the rendered brief, and `Alt+1`, `Alt+2`, and `Alt+3` reach
  the same three. The page reports the word and character count as the brief
  grows, a new initiative starts from the outcome brief template, and the
  hierarchy shows a brief's first line of prose rather than its markdown source.
  Saving stores both on the initiative, so a renamed initiative is renamed
  everywhere. Leaving the page with unsaved markdown asks whether to keep
  editing, discard the changes, or save and continue; nothing is kept in the
  browser. The markdown editor is bundled with the application and loaded only
  when the page is opened; a brief is markdown whichever control carries it, so
  an editor that cannot be loaded is reported rather than replaced by a plainer
  field.
- An interaction study for the passcode screen at `docs/mocks/pin-auth.html`,
  showing the entry, error, lockout, and unlocked states offline.
- An interaction study for logging hours against a story at
  `docs/mocks/assistant-hours.html`. It shows an assistant's page: the hours they logged,
  how many of those hours are on completed stories, and every story they worked on, filtered
  to completed or in-flight work and expandable to the individual entries. The product mock
  gains the surfaces that feed it — a **Time logged** panel in the story editor, a quick
  **Log hours** action on a board card, and an hours total on each assistant card. Time
  tracking is outside the requirements baseline, so this is a proposal rather than a
  specification.
- An interaction study for writing a record at
  `docs/mocks/initiative-editor.html`. A Monaco editor carries the outcome brief
  beside the initiative name, with a markdown toolbar, live preview, and an
  unsaved-changes guard; `?new` starts an initiative on the same page, and
  `?kind=epic` writes an epic there, parent and all.
- A deployed-build report. `GET /api/version` names the backend artifact, the
  Angular bundle carries its own version and commit, and the workspace shows the
  two identities separately in the sidebar footer and on the passcode screen.
- Isolated browser coverage verifies both labels with a test-only backend
  response and the identity compiled into the Angular test build; production
  continues to read only artifact-derived identities.
- The empty backlog result now offers **New story**, so a search that matches
  nothing is a place to start work rather than a dead end.
- A story already planned into a sprint now offers **Mark unready** and explains
  that it has to leave the sprint first, instead of hiding the action without
  saying why.

### Changed

- The workspace header bar now stays at the top of the viewport at every width.
  It carried the breadcrumb and **New story** out of reach on a desktop window
  whenever the page ran longer than the screen; it was already pinned on tablets
  and phones, where the bar is also the only route back to the navigation. The
  standalone design-system catalog and the reference mock pin their bar to match.
- The Azure Workboard now requires a shared passcode before any workspace record
  can be read or changed. Deployment and database access remain passwordless and
  identity-based; the gate replaces anonymous read/write access without
  introducing individual user accounts.
- The root README now documents the current SQL Server architecture, database
  CLI, combined publish, test suites, design system, and project limitations.
- Every applicable acceptance criterion in `docs/specs/L2.md` now has its own
  Playwright test, named for the requirement and scenario it proves. The suite
  runs in parallel from per-scenario workspace state: Chromium carries all 98
  scenarios and Firefox and WebKit run the critical-workflow subset.
- Every applicable acceptance criterion also has its own backend integration
  test, named for the requirement it proves. The API acceptance suite now runs
  the real application over an isolated in-process database, so it needs no SQL
  Server and no configuration; the CLI suite still uses a real database, because
  creating and resetting one is what it verifies.
- QBC Workboard now composes every button, form control, dialog, navigation
  element, card, and reusable row from `@qbc/components`; feature pages retain
  only application state and workflow orchestration.

### Fixed

- A number field now carries its range and increment. `qbc-text-input` supported
  `type="number"` but emitted no `min` or `step`, so the browser kept its default
  step of 1 and silently refused two and a half hours.
- A back control is a link again. The initiative and epic editors each carried a
  raw anchor, which the component-boundary gate forbids; `qbc-back-link` wraps it
  the way the skip link already wraps its own.
- `eng/scripts/Start-Workboard.ps1` starts the workspace again. It waited on
  `/api/workspace`, which the passcode gate answers `401`, and PowerShell threw
  on that status instead of reporting it, so the wait never ended. It also ran
  `ng serve` directly rather than through `scripts/build-app.mjs`, leaving
  `QBC_FRONTEND_VERSION` undefined and the application throwing on boot.
- Backlog sprint selectors now show the story's assigned sprint when sprint
  options finish loading after story data.
- A form that refuses to save now names every field that stopped it. Saving a
  blank initiative, epic, assistant, sprint, or story task previously did
  nothing visible at all.
- Grooming feedback now reports every unmet requirement. A story missing both
  acceptance criteria and an estimate previously named only one of them.
- The backlog now names the completed sprint a finished story is kept in. Its
  sprint column was previously blank, because the control offered only sprints
  that could still be planned into.
- Hierarchy roll-ups and assistant workload counts now exclude archived stories,
  matching what those numbers claim to describe.
- Deleting an assistant whose only story is archived is now refused with the same
  explanation as any other assigned assistant. It previously passed the guard and
  then failed against the database, reporting an unexpected server error.

No tagged release has been published.
