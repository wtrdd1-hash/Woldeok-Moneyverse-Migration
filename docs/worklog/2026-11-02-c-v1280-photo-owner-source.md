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

## IN PROGRESS — actual edge policy correction
- Second isolated Next HTTP probe: valid owner list HTTP 200 and malformed owner list HTTP 503, **but Next's global config overwrote the route's X-Robots-Tag to index/follow and Referrer-Policy to strict-origin-when-cross-origin**. The HTTP privacy gate therefore FAILED despite route-level Vitest PASS.
- Added a route-specific `next.config.ts` policy for `/app-api/v1/photos/mine` (private/no-store, noindex, no-referrer), after the global policy; test RED 1 then GREEN 17 focused/edge assertions. This is a narrowly scoped follow-up to the existing global header issue tracked in Draft #2225, without editing that PR.
- A new SHA and full rebuild/HTTP retest are required. Official Test and Production unchanged.

## FINISHED — 2026-11-02 02:08 KST — PARTIAL / RELEASE BLOCKED
- Implementation: runtime owner photo list validator, explicit unavailable/retry state, secure image referrer, Android GET malformed-source hold and owner-private headers at both handler and Next HTTP edge. No new SQL, WLD, grants, schema, production/Test change.
- RED/GREEN: original 3 failing Android cases and missing parser; immutable native fetch response regression RED then GREEN; actual HTTP edge noindex/referrer regression RED then GREEN. Focused frontend/edge 17 PASS; backend photo tests 20 PASS.
- Corrected code SHA before final worklog commit: 0b210bcf18d42c3376068ef60d80ea27a5a43996.
- Full frontend 2931 PASS; full backend 2978 PASS / 2 FAIL (profile-private-response.http.test.ts expects HTTP 200, gets 401) / 518 SKIP. These profile tests were also failing before this branch's final fixes; no unrelated A/B/QA changes made.
- Build PASS; typecheck PASS; lint PASS (0 errors / 1027 warnings). App API contract 184 endpoints PASS. Database package 62 PASS / 5 SKIP; security scripts 17 PASS; production dependency audit PASS.
- Fresh isolated PostgreSQL 17.11: 322/322 migrations applied, member photo SQL owner=1 / other=0, direct SELECT privilege=false. Temporary container removed.
- Isolated Next HTTP with independent mock upstream: valid owner GET 200; malformed owner GET 503; both Cache-Control private/no-store, X-Robots-Tag noindex, Referrer-Policy no-referrer. This is not a certified authenticated browser E2E.
- Release blockers: backend suite 2 FAIL; all-dependency audit 9 vulnerabilities (1 low / 8 moderate); full-route QA missing artifacts/qa/full-route-ledger.json; remote CI candidate runtime checks pending; official Test exact-SHA/auth flow, independent restore, Production gate NOT RUN/BLOCKED. Existing global private HTML header Draft #2225 remains separate and unmerged.
- Latest origin/main re-fetched unchanged 510dbe6bf4d5c2a8089fc06b480776053da7a2e3; canonical planning main v1518, active draft #2402 v1626 checked. No merge or deploy. No branch deletion. Worktree and Draft PR #2408 retained.
- Final documentation commit will advance HEAD; validation must be tied to that exact SHA before any release consideration. No successful release claimed.
