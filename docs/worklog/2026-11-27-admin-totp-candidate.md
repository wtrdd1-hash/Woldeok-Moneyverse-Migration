# Independent administrator TOTP candidate — 2026-11-27
**English canonical** | [한국어](2026-11-27-admin-totp-candidate.ko.md)

Branch `security/admin-totp-candidate-20261127` (base integration `9fd5d9047d`). Owner-delegated direction v2026.11.27.2002.1 item 2. CANDIDATE only: no real enrolment, key provisioning, switch change or deployment.

## Before work
- [x] Read v2002.1/v2006.1/v2154.1 directives, AGENTS §4–§5, migrations 031/058/197, Spring step-up path.
- [x] Design: docs/superpowers/specs/2026-11-27-admin-totp-candidate-design.md; plan: docs/superpowers/plans/2026-11-27-admin-totp-candidate.md.

## In progress → finished
- [x] RFC 6238 codec (Appendix B vectors), AES-256-GCM sealer with dedicated env key and user-bound AAD, no fallback.
- [x] Migration 366: credentials (active + pending, versioned), session/scope-bound 5-minute proofs, replay (monotonic step), lockout 5/15 min, serialised per-session failed-attempt ceiling 20/15 min, superadmin/self revoke, switch `admin_totp_required` seeded disabled.
- [x] Boundary: scoped high-risk writes (treasury/fx/kdic/pension/enterprises, security/controls/operations, abuse, backups; /api/v1, /api and /admin spellings) need a proof when the actor is enforced; after role, CSRF and step-up; fail closed.
- [x] Endpoints under /api/v1/admin/security/totp (status, enrolment, confirm, verify, revoke).
- [x] Independent review: Codex REQUEST_CHANGES (4 High, 2 Medium) → fixed alias bypass, pending replacement, credential versions, serialised ceiling, enforced revoke; re-review → fixed revoke/confirm lock order; ceiling counts failures by design. Gemini REQUEST_CHANGES (1 Medium, 2 informational) → assessed not exploitable / documented; rulings recorded.

## Validation (exact SHA 86dc7a1d8af828c17938196004b47fb02fb76e77)
- Spring 1102/0/0, 0 skipped (1002 before + 100 new). Postgres-tagged test (5 cases) runs only in disposable CI; the CI guard was not bypassed locally.
- Database package 96 passed + 5 skipped (no DATABASE_URL); migration parity 6/6.
- Owned sandbox (synthetic, rolled back): `verify/366-admin-totp-candidate.sql` ALL CHECKS PASSED; concurrency: 30 parallel failure recordings → exactly 20 accepted.
- Mutation check: fail-open requirement fallback is caught by the boundary test.

## Blockers / owner decisions
- Known limit: the application DB role can mint a proof from a claimed step (it can already forge auth_sessions rows). Fix = separate verifier LOGIN principal (owner provisioning).
- Real key provisioning (MONEYVERSE_ADMIN_TOTP_KEY / _KEY_ID), enrolment, enabling the switch, frontend enrolment screen, AGENTS §5 reconciliation.
- Rollout order: migration 366 before the application.
- Not merged into integration; official Test (G8) and Production (G9) hold; CVP HOLD.
