# v2026.09.15.105 — Identity privacy/auth parity audit

> Date: 2026-09-15
> Scope: documentation/planning only; no runtime/API/DB/infrastructure/security-code change

## External research decisions

- OWASP ASVS 5.0.0 (2025-05-30): **DIRECT ADOPT** as the authentication/session verification baseline.
- OWASP API Security Top 10 2023: **DIRECT ADOPT** for Broken Authentication, BOLA, resource-consumption and sensitive-business-flow abuse testing.
- Korea PIPC 2026 privacy-policy guidance/standard-policy materials: **DIRECT ADOPT** for keeping published processing purpose, processed data items, retention and user-rights procedures aligned with the actual service.
- Google Search Central technical/indexing guidance: **DIRECT ADOPT** for keeping auth/verification URLs out of search with authentication/noindex and for not relying on robots.txt as confidentiality control.
- FTC 2026 subscription enforcement/rulemaking: **REFERENCE** only for future real-money recurring billing; no real-money billing is inferred from the current WLD economy.

## Findings and decisions

- Added **P0 AUTH-105-01**: `main` contains first-party email/password registration, email verification, Argon2id credentials and mobile app API contracts, while Production `/login`, `/guide` and the current public privacy notice still describe the consumer login model as Discord/Google OAuth only. Public/local-auth rollout is blocked until processing notice, consent version, retention/deletion/recovery, channel UX and QA evidence are synchronized. Current Production exposure of the mutation endpoint was not destructively tested, so runtime availability is recorded as unverified rather than assumed.
- Added **P1 AUTH-105-02**: `docs/app-auth-api-guide.md` still describes `verify-email` as requiring the original prelogin cookie and CSRF, while current controller/migration contracts intentionally support a single-use cross-browser bearer verification token without those guards. Canonical app-auth documentation must be synchronized before another mobile release.
- Kept **P0 QA-104-01** OPEN: Production `/guide` still claims unlimited full profession-work reward despite authoritative per-task daily quota.
- Kept **P0 REL-104-02** OPEN and **P1 REL-104-03** TODO. The current SHA has no legacy combined status entries; a Production Release workflow for this docs SHA completed as `skipped`, so no Production promotion success is claimed.

## Planning changes

- Added endpoint-level local-auth contracts, privacy/data lifecycle, token-URL handling, credential-stuffing/account-enumeration defenses, SEO/noindex rules, analytics/KPIs, profitability/cost model, QA matrix and rollout/rollback gates.
- Verification-token URLs must not load ads or third-party analytics before token consumption; use a noindex verification surface, strict referrer policy, immediate token exchange and redirect to a clean URL.
- Added a release rule that a new authentication data category cannot become generally available until the published privacy version and consent flow describe the actual processing.

## Repository integration

- Updated `docs/planning/PROJECT_PLAN.md` and `PROJECT_PLAN.ko.md` in the same version.
- Added English/Korean changelog and worklog.
- No runtime code, database migration, API implementation, infrastructure, branch protection or security control was changed by this planning run.
