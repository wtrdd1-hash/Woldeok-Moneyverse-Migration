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
- [x] Re-fetched origin/main at start and midpoint; latest v802 documentation-only main advanced to `a5cebaf9380eaedde8b5a41f626c5013f755f310`, no overlapping source files. Final rebase pending.
- [ ] Validate exact candidate in Test before any Production cutover; otherwise keep BLOCKED.

## In progress
- Isolated pre-fix RED: backend 3/3 and frontend 5/5 checks failed; fixed banking pocket creation request key, inbound/outbound enum mapping, invalid direction refusal, optional savings target validation, and customization request key forwarding with UUIDv4 validation.
- After correction backend bank/credit/pocket 13/13 PASS, frontend pocket/UI 9/9 PASS (22 total), source-only.
- 2026-10-17 KST actual Production-readonly financial preflight returned `BLOCKED` (exit 2), confirming 40 balance rows, 19 uncertified account balance/ledger projection differences (+4,779,188 WLD), 5 nonzero account balances without postings (+2,627,807 WLD), **5** core financial tables directly writable by `moneyverse_app`. No unbalanced postings or orphan transactions detected; this does **not** certify money supply or legacy opening balances. These are discrepancies requiring provenance, **not proof of lost money**. No grants, finances, user data, test or production runtime changed.
- Authenticated banking E2E and full v530 UI five-pass not established; anonymous Production `GET /api/v1/banking/standing` and `.../pockets` return 401 as expected. Test `/bank` renders anonymously but route HTTP alone does not prove functionality.
- Current source `origin/main` still `7098f2363d80f5ce164ed8af03fa003d10de30ff` on interim recheck. Another agent's v801 audit PRs have not been modified.
- v851 pre-pricing source full typecheck 0, lint 0 (1,068 existing warnings), `pnpm test` 0: backend 1,260 passed / 396 skipped, frontend 1,274 passed (no real DB fixture). Full Next build generated route list; command exit evidence being finalized. Pricing correction introduced two additional frontend RED tests, 2/2 failed before patch, then green 4/4 for impacted frontend component tests.
- P0 confirmed: `bank_transfer_pocket` directly updates `accounts.balance` and pocket balance, no canonical ledger or replay while standing reads `account_balances.available_amount`; archive also directly credits accounts, with 500 WLD fee; UI charged 100+300 for actual flat 100 WLD server fee. SQL for these functions was not found in tracked repository migrations. Formal [English finding](../findings/MONEYVERSE_BANK_POCKET_LEDGER_DRIFT_v2026.10.17.851.md) / [Korean](../findings/MONEYVERSE_BANK_POCKET_LEDGER_DRIFT_v2026.10.17.851.ko.md). These DB P0s are unremediated and forbid Promotion.
- Bank pocket creation has an API-required key, but existing SQL/repository create path does not consume that key as an idempotency receipt; duplicate creations remain a follow-up that needs DB-backed concurrency design, separate from this safe fix.


## Finished (source audit and isolated contract fixes; full Production acceptance BLOCKED)
- Frontend pocket request contracts and fee disclosures changed only in this branch; full financial DB pocket migration **NOT** attempted because the production-shaped financial opening/authorization gate is still BLOCKED.
- Typecheck PASS; lint PASS with 1,068 pre-existing warnings; all non-DB tests PASS: backend 1,260 / 396 skipped, frontend 1,274. New contract focused 22/22 PASS. Final pricing component 4/4 PASS after 2 RED failures. Production-read-only finance gate exit 2 BLOCKED.
- Full Next build rendered complete static/dynamic route list without errors in log; task runner's final exit status not yet captured, so do not call it accepted until independent exit-code confirmation.
- Signed-in full banking and v530 browser corpus, true bank DB/privilege/idempotency E2E and exact live Test SHA were NOT proven; existing Production v717 and public Test remain unchanged by this task.
- Findings: [P0 bank pocket financial path report](../findings/MONEYVERSE_BANK_POCKET_LEDGER_DRIFT_v2026.10.17.851.md), [internal update](../updates/v2026.10.17.851-banking-functional-internal.md), [GitHub update](../updates/v2026.10.17.851-banking-functional-github.md).
