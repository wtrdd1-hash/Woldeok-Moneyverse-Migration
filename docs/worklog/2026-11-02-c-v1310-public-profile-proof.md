# C v1310 — Verified member profile source (English canonical)

Status: DRAFT / RELEASE HOLD. No main merge, official Test or Production change.

## Start (2026-11-02 21:39 KST)
- Debian 13.6 miniPC and seven core services healthy; development PostgreSQL connected. GitHub `origin/main` at `305d7c7fec2e5fe6d6b3ae67a9fe54a20ba1758b`. Main checkout is dirty with other agents' work; untouched.
- Read AGENTS.md, README.md, README/README.ko.md and English/Korean living plans; inspected active PRs/QA/A/B/C. No active public-member-profile source proof PR found. New independent worktree `auto/hourly-c-public-profile-proof-v1310-20261102-2145`.
- Existing `/profile/[userId]` trusted the TypeScript assertion for the API profile; Android `/app-api/v1/profile/:id` forwarded upstream data, extra private fields and cache headers. Existing Nest session guard and PostgreSQL `member_profile_view(actor,subject)` are the source of access control.

## Midpoint (2026-11-02 21:44 KST)
- TDD RED: new parser import and gateway privacy assertions failed. GREEN: 17/17 focused tests passed after a test expectation correction.
- Implemented strict DTO parsing for joined date, bounded strings, job level, exact bigint completion count, visibility, image URL and featured title; strips unapproved fields. Invalid source returns unavailable rather than a fabricated profile. Accessible retry/status on web, noindex metadata retained.
- Android gateway validates successful profile responses and emits only allowlisted DTO fields, maps unverified 200 to 503, sanitizes upstream failures, and enforces private/no-store/noindex/no-referrer. No new DB grants, migrations, balances or writes.
- `origin/main` re-fetched at midpoint: unchanged. Typecheck PASS; first lint had one new test literal precision violation; corrected. Frontend/backend build PASS.

## Release discipline
- Exact final SHA, full lint/test/contract/security/real PostgreSQL/E2E/CI evidence recorded in PR and execution logs as each gate finishes. Any unverified gate remains BLOCKED; no PR merge or deployment.
- Other A/B/Gemini/QA branches and core recurring automations preserved. Worktree and draft PR retained pending review.

## HTTP finding and repair (2026-11-02 22:02 KST)
- An isolated Next.js server exposed `X-Robots-Tag: index, follow` on `/profile/:id`, `/en/profile/:id` and `/app-api/v1/profile/:id` despite route-level private policy. Global `next.config.ts` security headers overrode the route's response headers. The `/frontend-version` endpoint returned a timestamp, not the Git SHA, so it is **not** exact-SHA evidence.
- Added eight explicit edge header rules for base/localized profile routes and Android/API gateway routes, with `noindex, nofollow`, `private, no-store`, and `no-referrer`. New TDD RED 8 failures; GREEN 16/16 security/header tests. Rebuild and real HTTP recheck required before release.
- At the first committed candidate, frontend full suite 2,955 PASS, backend full suite 2,983 PASS / 518 SKIP, fresh PostgreSQL 17.11 323 migrations and 24 profile DB tests PASS, lint 0 errors/1,027 warnings, typecheck/build/184-endpoint contract PASS. Full dependency audit FAIL (8 moderate, 1 low); full-route QA ledger missing; authenticated E2E and official exact-SHA Test BLOCKED.
