# C v1280 — Member Photo Submission Source Integrity (EN canonical)
**State: BEFORE WORK — 2026-11-02 01:45 KST.** Baseline origin/main 510dbe6bf4d5c2a8089fc06b480776053da7a2e3. Independent auto/hourly-c-photo-owner-proof-v1280-20261102-0145 worktree. No shared main edits.
## Verified gap
The member-only /gallery/submit page types the untrusted GET /api/v1/photos/mine response without runtime validation. An upstream 200 with a non-array `submissions` causes a render exception; malformed IDs/URLs/status can create forged pending-withdraw controls. The Android /app-api/v1/photos/mine currently forwards upstream cache policy, including public, while the NestJS route is session/consent guarded and the SQL member_my_photo_submissions(p_actor) is owner-scoped (migration 098).
## Scope
- Bounded runtime proof of owner submission rows; fail closed to explicit unavailable state, not empty list.
- Privacy headers at the Android App API for owner /photos/mine success, errors and HEAD, including referrer.
- Keyboard/screen-reader friendly page error and reload link; preserve private noindex and responsive layout.
- No new SQL, grants, balances or fake success. A/B/Gemini/QA and existing PRs untouched.
## Plan and state
- [ ] RED tests: malformed/duplicate/oversized owner list and cacheable Android response.
- [ ] GREEN: owner parser, page integration and app-api response protections.
- [ ] Verify focused tests, build/lint/typecheck, backend, DB, security, app-api and E2E as feasible.
- [ ] Re-fetch main and planning, record exact HEAD and gate outcomes; PR only if safe.
**State: IN PROGRESS** pending tests.
**State: FINISHED** pending.

## IN PROGRESS — 2026-11-02 01:49 KST
- RED: Android cache/shape tests 3 failures; pure parser test initially unresolved import (see evidence/01-red.log).
- GREEN: 7/7 focused tests PASS after parser, Next page error state, and App API protections.
- Main re-fetched unchanged at 510dbe6bf4d5c2a8089fc06b480776053da7a2e3; planning main still v1518, active draft planning #2402 is notification scheduling (not photo owner).
- Full typecheck PASS; lint PASS with 0 errors, 1027 pre-existing warnings. Full build/test/DB/CI pending.

## IN PROGRESS — actual HTTP discovery and correction
- First isolated Next HTTP probe **FAILED** (500): the gateway mistakenly mutated native fetch `Response.headers`, which are immutable. Vitest doubles had not reproduced that behavior.
- Added regression with immutable native-like headers: RED 1 failure; removed the premature upstream header mutation and kept the final mutable NextResponse override. GREEN 8/8.
- Earlier SHA d30869ade is **superseded**; all passing gates from it require revalidation at the corrected HEAD.
- First isolated PostgreSQL attempt hit the entrypoint's temporary server shutdown (not a schema defect); a clean retry passed **322/322 migrations**, owner rows=1, other owner rows=0, direct photos SELECT=false. Container removed.
- Initial whole-suite results on superseded SHA: Frontend 2929 PASS; Backend 2978 PASS / 2 FAIL (existing profile private HTTP tests) / 518 SKIP. API contract 184 PASS, DB package 62 PASS / 5 SKIP; security scripts 17 PASS; production dependency audit PASS; all-dependency audit FAIL (9 vulnerabilities), full-route QA FAIL (missing ledger).
