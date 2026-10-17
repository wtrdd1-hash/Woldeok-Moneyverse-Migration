# v2026.10.17.851 — Banking and Full-Feature Functional Audit

**Status: SOURCE PATCH VERIFIED IN TARGETED TESTS — broad QA IN PROGRESS; Production BLOCKED.**

## Before work
- User reports some functionality not working and requests especially rigorous banking checks.
- Dedicated isolated worktree based on current remote `main`; concurrent automation/other agents remain untouched.
- Authorities reviewed: `AGENTS.md`, `DOCS_INDEX.md`, `PROJECT_MEMORY.md`, current runtime baseline, banking API catalog and `docs/RELEASING.md`.
- Previously documented finance hard stop: 19 uncertified account/ledger differences, excessive app financial DML permissions and incomplete authenticated Test/UI acceptance. Revalidate live evidence; do not equate health with functional correctness.

## Plan
- [x] Verify current runtime, banking route/auth boundaries and DB invariants without writes.
- [x] Execute focused bank and pocket contract regression (22/22 pass after RED failure); broad regression in progress.
- [x] Fix frontend/backend pocket contract mismatches in isolated worktree; no SQL or ledger mutation.
- [ ] Re-fetch changed main, preserve other agents' work, publish interim and final proof.
- [ ] Validate exact candidate in Test before any Production cutover; otherwise keep BLOCKED.

## In progress
- Isolated pre-fix RED: backend 3/3 and frontend 5/5 checks failed; fixed banking pocket creation request key, inbound/outbound enum mapping, invalid direction refusal, optional savings target validation, and customization request key forwarding with UUIDv4 validation.
- After correction backend bank/credit/pocket 13/13 PASS, frontend pocket/UI 9/9 PASS (22 total), source-only.
- 2026-10-17 KST actual Production-readonly financial preflight returned `BLOCKED` (exit 2), confirming 40 balance rows, 19 uncertified account balance/ledger projection differences (+4,779,188 WLD), 5 nonzero account balances without postings (+2,627,807 WLD), **5** core financial tables directly writable by `moneyverse_app`. No unbalanced postings or orphan transactions detected; this does **not** certify money supply or legacy opening balances. These are discrepancies requiring provenance, **not proof of lost money**. No grants, finances, user data, test or production runtime changed.
- Authenticated banking E2E and full v530 UI five-pass not established; anonymous Production `GET /api/v1/banking/standing` and `.../pockets` return 401 as expected. Test `/bank` renders anonymously but route HTTP alone does not prove functionality.
- Current source `origin/main` still `7098f2363d80f5ce164ed8af03fa003d10de30ff` on interim recheck. Another agent's v801 audit PRs have not been modified.
- `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` running against isolated candidate.
- Bank pocket creation has an API-required key, but existing SQL/repository create path does not consume that key as an idempotency receipt; duplicate creations remain a follow-up that needs DB-backed concurrency design, separate from this safe fix.


## Finished
- Pending.
