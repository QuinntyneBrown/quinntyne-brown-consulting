# Project governance

QBC Workboard uses a maintainer-led governance model. The model keeps decisions
clear while accepting evidence-backed community input.

## Roles

### Users

Users run the product, report defects, request improvements, and provide feedback
about requirements and usability.

### Contributors

Contributors submit issues, documentation, tests, designs, or code. A merged
change does not grant repository administration or release authority.

### Maintainers

Maintainers triage issues, review changes, protect project scope, merge pull
requests, manage releases, moderate community spaces, and handle security
reports. [@QuinntyneBrown](https://github.com/QuinntyneBrown) is the current
maintainer.

Additional maintainers may be invited after sustained, constructive
contributions that demonstrate technical judgment, reliable review, respect for
the project's values, and familiarity with its requirements.

## Decision process

Routine decisions are made through public issues and pull-request review. The
maintainer considers requirements, user impact, acceptance evidence,
accessibility, security, maintainability, and implementation cost.

Substantial changes should include:

1. a problem statement and affected users;
2. relevant L1 and L2 requirements;
3. alternatives and trade-offs;
4. acceptance criteria;
5. migration or compatibility impact; and
6. updates to the affected detailed design.

The maintainer makes the final decision when consensus does not emerge. A
decision may defer work, request a smaller experiment, or decline a change that
does not fit the current product scope.

## Requirements and architecture

[`docs/specs`](docs/specs/) is authoritative for product obligations.
[`docs/detailed-designs`](docs/detailed-designs/) refines those requirements into
feature designs. A pull request that changes behavior should update both levels
when their statements would otherwise become inaccurate.

Architecture changes should preserve inward backend dependencies, typed
frontend service boundaries, server-authoritative state, and acceptance tests at
public boundaries unless an approved requirement explicitly changes those
constraints.

## Merge policy

A maintainer merges a pull request after required review concerns are resolved
and applicable checks pass. The maintainer may use squash, rebase, or merge
commits based on the shape of the contribution and the clarity of repository
history.

Direct pushes to `main` should be limited to repository recovery or urgent
security work. Normal product work should arrive through a pull request.

## Releases

The repository currently has no tagged release. Maintainers own version changes,
release notes, tags, packages, and deployment approval. Future releases should
use semantic versioning where a published package or compatibility contract
exists.

User-visible changes are collected under `Unreleased` in
[CHANGELOG.md](CHANGELOG.md) and moved into a dated release section when a
version is published.

## Conduct and security

All participants follow [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). Security
reports follow the private process in [SECURITY.md](SECURITY.md). Maintainers may
temporarily depart from the public decision process when confidentiality is
required to protect users.

## Governance changes

Changes to this governance model use the same public pull-request process. A
governance proposal should explain the problem, affected roles, transition plan,
and safeguards against concentrated or unclear authority.
