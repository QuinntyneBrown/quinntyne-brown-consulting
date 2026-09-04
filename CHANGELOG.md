# Changelog

This file records notable user-visible changes to QBC Workboard.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioned releases will follow [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

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
- An outcome brief for every initiative, written as markdown on its own page at
  **Edit brief**. The brief carries headings, lists, task lists, tables, quotes,
  and fenced code; a formatting toolbar and insertable building blocks compose
  it; and write, split, and preview views show the source, both, or the rendered
  brief. An outline lists the brief's headings and moves the editor to any of
  them, and the page reports the word and character count as the brief grows.
  Saving stores the brief on the initiative it belongs to, so a renamed
  initiative is renamed everywhere. Leaving the page with unsaved markdown asks
  whether to keep editing, discard the changes, or save and continue; nothing is
  kept in the browser.
- An interaction study for the passcode screen at `docs/mocks/pin-auth.html`,
  showing the entry, error, lockout, and unlocked states offline.
- An interaction study for editing an initiative outcome brief as markdown at
  `docs/mocks/initiative-editor.html`. A Monaco editor carries the brief with a
  markdown toolbar, snippet completions, an outline, live preview, and an
  unsaved-changes guard, and falls back to a plain markdown text area offline.
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
