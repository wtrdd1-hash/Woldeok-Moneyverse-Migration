# C v1278 — Member profile source integrity

## Before work — 2026-11-02 00:47 KST
- Host: Debian 13.6 miniPC; backend/frontend/bot/MCP/desktop/nginx/Docker active; development PostgreSQL connected. No production changes authorized.
- Start `origin/main`: `510dbe6bf4d5c2a8089fc06b480776053da7a2e3`; independent branch `auto/hourly-c-profile-readproof-v1278-20261102-0045`.
- Reviewed AGENTS.md, README.md, README/README.ko.md, both integrated project plans, active PRs, latest A/B/QA and C v1277; root main has a separate dirty `implementation_plan.md` and is protected.
- P1 evidence: `/profile` trusts three `apiOrNull<T>` results without runtime validation. A malformed `field_visibility` can crash the member settings form, and an omitted privacy override may default to inherit during a replacement write. The owner profile card also trusts invalid bigint strings. Existing Nest session/consent-guarded GET /profile, /profile/settings and /profile/titles plus SQL SECURITY DEFINER functions are the authoritative sources; no new API or DB access.
- Overlap check: open #2265 concerns profile HTTP privacy tests; no open PR implementing this owner readback validation. No A/B/QA/Gemini branch is modified.

## Plan
- [x] RED: 30 runtime parser cases and four page integration cases; observed behavioral RED (1/30 then 3/4 failures).
- [x] GREEN: all 34 new tests PASS; invalid source blocks display/write, cross-read mismatch blocks replacement, keyboard-accessible GET retry added.
- [ ] Verify: focused tests, lint, typecheck, build, full unit/contract/security/DB/E2E and remote CI at exact HEAD; preserve honest BLOCKED status.
- [ ] Re-fetch main mid-run and before any merge; do not merge or deploy unless every mandatory gate passes.

## In progress
- 00:49-00:52 KST: RED 1/30 pure and 3/4 page, GREEN 30/30 pure and 4/4 page; existing profile tests 26 PASS.
- Re-fetched main mid-run: `510dbe6bf4d5c2a8089fc06b480776053da7a2e3` unchanged.
- Preliminary full lint PASS (0 errors, 1027 warnings) and typecheck PASS before retry UI update; final HEAD must rerun.
- Existing authenticated Nest profile GET/GET settings/GET titles contract and SQL member_profile_view/member_profile_settings/member_earned_titles reused; no backend/API/DB change.
- Worktree remains isolated; official Test and Production untouched.

## Finished
- Pending final evidence, PR link, main comparison, Test/Production/rollback status, and branch retention decision.
