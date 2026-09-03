# Security policy

QBC Workboard takes vulnerability reports seriously. Coordinated private
disclosure protects users while a report is validated and remediated.

## Supported versions

The project is under active development and has no tagged release. Security
fixes are applied to the current `main` branch.

| Version | Supported |
|---|---|
| Current `main` | Yes |
| Older commits and forks | No |

This policy will move to the latest supported release after versioned releases
begin.

## Report a vulnerability

Do not disclose a suspected vulnerability in a public issue, pull request,
discussion, or social-media post.

Email the maintainer at
[`quinntynebrown@gmail.com`](mailto:quinntynebrown@gmail.com) with the subject
`[SECURITY] QBC Workboard`. Include:

- the affected component, endpoint, version, or commit;
- the vulnerability class and potential impact;
- minimal reproduction steps or a proof of concept;
- required configuration or preconditions;
- any known mitigation; and
- whether the report has been shared elsewhere.

Remove credentials, personal data, customer information, and unrelated secrets
from logs or screenshots. Request a secure exchange method before sending
sensitive supporting material.

## What to expect

The maintainer will make a best-effort response to:

1. acknowledge the report;
2. reproduce and assess its severity;
3. coordinate a remediation and disclosure timeline with the reporter;
4. prepare fixes for supported code; and
5. publish an advisory when disclosure benefits users.

No response-time or remediation-time service level is guaranteed. Complex
reports and upstream dependency issues may require additional coordination.

## Security model and scope

QBC Workboard currently supports one trusted workspace. Authentication,
authorization, multiple organizations, and hostile-network deployment are
outside the current requirements baseline. An instance should remain behind a
trusted boundary until those controls exist.

The following may qualify as security vulnerabilities:

- unintended access to workspace or database data;
- injection, path traversal, or unsafe deserialization;
- a destructive operation that bypasses its documented confirmation boundary;
- cross-site scripting or unsafe HTML handling;
- exposure of secrets or internal exception details; and
- vulnerable dependencies with a demonstrated path through this product.

General bugs, feature requests, setup questions, and unsupported deployment
scenarios belong in the public issue tracker as described in
[SUPPORT.md](SUPPORT.md).

## Repository security

Never commit connection strings containing credentials, access tokens, signing
keys, production data, or vulnerability proofs. Use environment variables or an
appropriate secret store for deployment configuration.
