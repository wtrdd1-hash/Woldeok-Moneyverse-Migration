# Backend B v732 — member authentication Telegram privacy

## Before work — 2026-11-01 21:35 KST
- Source: fresh `origin/main` (recorded in host start log); QA issue #2231, planning v1618 draft #2375, latest QA #2378, concurrent A/C/B branches reviewed.
- P1 reproduction target: registration Telegram alert transmits unverified email/name before verification; login alert includes UUID and untrusted forwarded IP without checking `consentCurrent`.
- Safety: no production DB, financial ledger, migrations, shared runtime, or other developer worktrees touched. Preserve login, verification, CSRF, session and email dispatch.
- Scope: fail closed on unverified registration notifications; emit only anonymous generic login notification after current user consent; ensure Telegram service never forwards member-supplied identifiers.

## Planned verification
- RED: controller registration/login consent tests and service transport PII minimization tests.
- GREEN: same tests, auth/Telegram regression, typecheck, lint, build, security, app-api, CI; isolated PostgreSQL if applicable.
- Release gates: full suites and official Test exact-SHA, authenticated E2E, recovery and GitOps required before merge or production. No bypass.

## In progress
- Worktree created from fresh main. Implementation not yet started.

## Finished
- Pending.

### RED evidence — 2026-11-01 21:37 KST
- `pnpm --dir backend exec vitest run src/auth/local-auth-telegram-privacy.test.ts src/telegram/member-auth-privacy.test.ts`: 6 FAIL / 0 PASS before production change, showing unverified registration alert, non-current-consent login alert, forwarded IP/user metadata and external PII serialization.
- RED commit `faaff2175cb43584ab8b48324c51e556e97ab787` pushed to independent branch.
- The unconfigured-transport test needed an explicit mocked credentials loader because the host can have a paired Telegram configuration; no real outbound network was called.

### In-progress implementation
- Controller no longer emits pre-verification registration alert; current-consent login emits only generic event without forwarding headers or user data.
- Service ignores legacy login payload and rejects all registration notifications until verified-account policy exists.

## Finished — 2026-11-01 21:50 KST — PARTIAL / RELEASE HOLD
- Start/mid/pre-PR `origin/main`: `3d5e321c3d1221febff677469fecdfcb3cf42e7d`; branch `auto/hourly-b-v732-telegram-privacy-20261101-2135`.
- RED tests: 6/6 failed before source correction. GREEN tests: 6/6 passed. Extended auth/Telegram: 24/24 passed.
- Code SHA `125bafe321a8cdeec18c4f9a37eb053721f6a6af`. Controller blocks pre-verification registration notification; only consent-current login can request anonymous Telegram event; service ignores legacy member payload, never exports member identifiers or forwarded IP; registration notification methods fail closed.
- API: `/api/v1/auth/local/register` retains accepted/verificationRequired and verification email; `/api/v1/auth/local/login` retains session cookie, CSRF token and consentCurrent. No route/schema/DB/ledger/WLD changes. Third-party Telegram member event contract becomes generic and non-identifying; pre-verification registration alert intentionally suppressed.
- PASS: auth/Telegram 24; lint 0 errors/1026 warnings; full typecheck; backend build; full frontend build on retry (initial 120s timeout); contract 41; database 62 PASS/4 SKIP; app-api 184; security/release; frontend 2904; production dependency audit 0.
- Isolated PostgreSQL 17.11: 319 numbered migrations 002..320 applied; app role balance UPDATE and ledger DELETE denied; real session integration 17 PASS. Two earlier scratch attempts failed due to isolated DB role ownership setup; corrected by using migrator as schema owner. Isolated container removed; no shared DB touched.
- BLOCKED: root test backend 2974 PASS/2 FAIL/518 SKIP (existing profile HTTP fixture 401 vs expected 200, repair Draft #2265); full dependency audit 9 (1 low/8 moderate); official Test exact-SHA backend/frontend unverified; host Test identity gate EACCES protected env. Authenticated Test E2E, independent restore, GitOps gates not approved. No merge, Test deployment or Production promotion.
- A/C/QA worktrees and other agents protected; no branch cleanup. Existing hourly A/B/C/planning/QA reservations unchanged. Runtime services remain active.
- Release HOLD: Draft PR required, no auto-merge or deployment. Resolve profile suite and exact-SHA Test identity, run full CI/E2E and review before integration.
