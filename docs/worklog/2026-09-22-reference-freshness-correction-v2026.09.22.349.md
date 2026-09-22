# Reference freshness correction worklog — v2026.09.22.349

Date: 2026-09-22
Scope: documentation/planning only

- Final external-source verification found OpenAPI Specification 3.2.1, published 2026-09-10, is newer than the 3.1.1 target initially recorded in v348.
- Corrected current integrated authority to v2026.09.22.349.
- Replaced the API evolution target with OAS 3.2.1 while preserving the implementation fact that v347 currently emits an OpenAPI 3.0-compatible contract.
- Added a staged compatibility rule: retain 3.0 consumers until contract, tooling, codegen and schema tests prove migration.
- No runtime, code, database or deployment change was made.
