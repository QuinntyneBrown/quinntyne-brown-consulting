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

### Changed

- The Azure Workboard is publicly accessible with anonymous read/write access;
  visitor-facing Microsoft Entra authentication has been removed while
  passwordless deployment and database identities remain in place.
- The root README now documents the current SQL Server architecture, database
  CLI, combined publish, test suites, design system, and project limitations.
- QBC Workboard now composes every button, form control, dialog, navigation
  element, card, and reusable row from `@qbc/components`; feature pages retain
  only application state and workflow orchestration.

### Fixed

- Backlog sprint selectors now show the story's assigned sprint when sprint
  options finish loading after story data.

No tagged release has been published.
