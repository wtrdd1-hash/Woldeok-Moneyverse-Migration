# Development A — Owner loan history and status filters (A1725)

## Before work — 2026-10-24 17:25 KST
- Baseline `origin/main`: `49788d09494fed3e463651945b83386e87dd47bc` (fetched); branch `auto/hourly-a-bank-loan-history-20261024-1725`, isolated worktree.
- Read AGENTS.md, README.md, English/Korean PROJECT_PLAN and integrated masters, QA v1209, open PRs and CI. The plan's global ENV/SEC/REL P0 gates remain HOLD; this P1 member read feature is not a production authorization.
- Open PR count at initial inspection: 45; remote refs 1,103 (including HEAD/main); main SHA as above. Open A/B/C/QA/Gemini branches contain unique changes; no deletions or modifications.
- Scope: owner-scoped GET `/api/v1/bank/loans?status=active|overdue|repaid|all`, new authenticated `/bank/loans` page, Android gateway query forwarding; use existing `bank_my_loans` PostgreSQL SECURITY DEFINER read without migration or ledger write.
- Safety: reject invalid filter, no silent partial results, exact integer-string WLD, no cache/indexing, distinguish overdue/repaid, preserve current loan operations. No migration number allocated. Do not merge or deploy without complete gates.
- TDD plan: write service/controller/page/gateway regression tests first and observe RED; implement minimal read path; run focused tests and all feasible gates; refresh main mid-work and before integration.

## In progress
- Pending.

## Finished
- Pending; Test/Production release HOLD until verified.

### Checkpoint 1 — RED
- Re-read current main and EN/KO plans before implementation; main remains `49788d09494fed3e463651945b83386e87dd47bc`.
- Added backend service/controller, web UI, and Android query/no-store regression tests before implementation. Backend RED verified: 4 expected failures (status ignored, invalid status accepted, controller not forwarding); frontend RED verified: missing component import. Contract build prerequisite repaired before valid backend RED.
- Existing Android app-api already forwards the query and preserves backend `cache-control`; new regression covers it without changing gateway security boundaries.

### Checkpoint 2 — GREEN and isolated SQL
- Implemented strict `status=all|active|overdue|repaid` filter on the existing authenticated `GET /api/v1/bank/loans`, with 400 on invalid values, no-store response, exact WLD strings, and no DB schema/ledger changes. Controller takes only the server session's user id.
- Added `/bank/loans` authenticated noindex server page, accessible filter navigation and explicit empty/unavailable states; linked from Bank loan tab. Android app-api existing allowlist forwards status and `private, no-store` response; regression added.
- Focused backend: 5 PASS; frontend including app-api: 13 PASS after using `NODE_ENV=test`; frontend typecheck PASS. TDD initial backend 4 RED and missing frontend component RED recorded.
- Real isolated PostgreSQL (`moneyverse-test-db` / `woldeok_moneyverse_ci`) read-only transaction: `bank_my_loans(uuid)` exists, `moneyverse_app` has EXECUTE, unknown owner returns 0, explicit ROLLBACK. No fixtures or writes. Full authenticated Test E2E not established.
- `origin/main` and English/Korean integrated plans refreshed; still baseline `49788d09494fed3e463651945b83386e87dd47bc`. Other worker branches and migrations untouched.

## Finished — 2026-10-24 KST (integration blocked)
- Code SHA: `4406f94063e742212783851591a7f6a34f0447eb`; Draft PR #1150. Branch from main remains isolated, no merge/rebase conflict; latest fetched main unchanged.
- A further TDD RED (missing repository returned fabricated `[]`) was reproduced, then fixed to 503 and retested: focused backend 6 PASS, frontend/Android 13 PASS.
- Full candidate code SHA rerun: backend 1,319 PASS/398 SKIPPED; database 15 PASS/3 SKIPPED; contract 38 PASS; frontend 1,398 PASS/5 FAIL (3 SEO, 1 locale, 1 login a11y). Lint PASS 0 errors/1,136 warnings; typecheck PASS; build PASS; Android API contract 179 PASS; bot 8 PASS after offline dependencies.
- Security FAIL: root dependency audit Critical2/High10 (26 total), bot Critical1/High5. Isolated PostgreSQL READ ONLY `bank_my_loans` permission and no-owner smoke PASS, ROLLBACK. Populated real-loan and authenticated Test E2E unverified.
- Initial GitHub heads 48 including main, final 49; initial open PRs 45, final 46. Local PR review refs 1,054, not additional remote heads. No fully verified safe-to-delete remote branch; deleted 0. All A/B/C/Gemini/QA unique changes preserved. PR #1107 still conflicts.
- Changed source: wallet controller/service + tests; bank page, new loan page/panel + tests; Android gateway test. No migration, grant, ledger mutation, production DB access, runtime restart, merge, official Test promotion, Production deployment or rollback.
- GitHub PR CI still requires exact-final-SHA runtime confirmation; no PASS claimed from a pending job. Release decision PARTIAL / BLOCKED, Production RELEASE HOLD. See `docs/releases/v2026.10.24.a1725.md` and `.ko.md`.
