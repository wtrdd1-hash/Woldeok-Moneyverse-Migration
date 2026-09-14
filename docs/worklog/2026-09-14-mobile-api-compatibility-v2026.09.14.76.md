# Internal worklog — v2026.09.14.76

## Cause
The app surface mixed camelCase and database-shaped snake_case, and parts of the documentation named only DTO classes, forcing another AI/client to guess fields. Native-relevant cache/range/retry headers and transport-failure behavior were also incomplete.

## Changes
- Audited all 139 app endpoints against current NestJS OpenAPI operations: zero missing and zero duplicates.
- Added additive recursive camelCase compatibility at the app BFF; binary bodies are never transformed.
- Added `meta/contract`, contract headers, and stable 502/504 problem JSON.
- Generated detailed EN/KO schema references and a machine contract from actual OpenAPI request DTOs and TypeScript controller return types.
- Included the profile null/email fix and corrected raw-image upload calling conventions.
- Added CI drift detection for generated API contract artifacts.

## Validation/deployment order
Re-check plan → implement → re-check plan mid-work → regenerate contract → lint/typecheck/build/test → GitHub CI including DB migrations → exact-SHA Test deployment → Test API/backend smoke → same-SHA Production promotion → production smoke.
