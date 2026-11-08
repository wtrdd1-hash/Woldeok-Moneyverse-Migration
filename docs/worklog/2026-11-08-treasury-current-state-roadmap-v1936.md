# v2026.11.08.1936 — Treasury Current-State Inventory and Development Gap Roadmap

> EN canonical | [한국어](2026-11-08-treasury-current-state-roadmap-v1936.ko.md)
> State: IN PROGRESS / PLANNING / READ-ONLY ANALYSIS. **No application, data, WLD or release mutation.**
> Branch: `docs/treasury-runtime-inventory-and-roadmap-v1936-20261108`
> Initial origin/main: `b56fdc748dd817eb250b7d5d06019aaf5c299131` (fetched 2026-11-08 KST).
> Prior draft: [v1912 Treasury sovereign finance proposal](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/2882) not merged into main.

## BEFORE — 2026-11-08 KST

- User requests detailed **current development and related service analysis**, plus concrete new function and implementation roadmap. This is an architectural planning/evidence task, not an authorization for financial changes.
- Read authority order: `AGENTS.md`, documentation policy, `PROJECT_PLAN.md`, `INTEGRATED_PLANNING_MASTER.md`, `DEVELOPMENT_STATUS_AND_MASTER_REFERENCE.ko.md`, `CURRENT_RUNTIME_BASELINE.md`, v523 institution design, v1618.2 Treasury Core and v1701 Finance Integrity Core and predecessor v1912 draft. Historic v1518 PROJECT_PLAN and newer operational docs may disagree; record authority drift instead of silently substituting.
- Initial read-only miniPC: backend/frontend/MCP/nginx/Discord reported active; public `/treasury` and `/pension` HTTP200, `/treasury/portal` HTTP404; public backend version ID begins `17fde45484`. Actual Production symlink points to `prod-v2026.11.06.1770-17fde45484`; official Test pointer `test-v2026.11.04.1742-dfb98c7c5c22`. Main is ahead at `b56fdc748d`.
- Connected local PostgreSQL database `woldeok_moneyverse_dev` seen with `moneyverse_migrator`: 895 ledger_transactions, 1854 postings, 42 balances, 0 Treasury Core funded receipts; 3 grants (1 APPROVED, 2 PENDING_REVIEW), one disbursement, one Mint certificate; migrations 330-339 applied, source main also has 340-341 but they are **not** listed as applied in this DB.
- Actual five `system_treasury_vaults` total **191,055,911 WLD** and canonical `TREASURY:treasury` balance **191,055,911 WLD** in the same DB snapshot; this aggregate equality does not itself prove all historical receipts, issuance provenance or availability. Historically stored Treasury/SOE rows were archived into fiscal epoch. No money-changing tests run.
- Existing main includes admin Treasury/Grants, SWF, Mint, Central Bank, pension, KDIC and bond controllers; `frontend/src/app/treasury/portal/page.tsx` is **absent**, although public `/treasury` contains `treasury-portal-client.tsx`. Fix route claims and deployed reality rather than assuming feature absent altogether.
- User's single-superadmin instruction, no repeated 15-minute reauth, no 2-person approval; historical AGENTS text about step-up requires reconciling with current implementation and owner policy. No credentials displayed.

## Plan

- [x] BEFORE and separate branch creation; read-only initial source/host/DB status.
- [ ] Inspect end-to-end domain route→service→SQL→UI+Android→deployed exact SHA and separate statuses.
- [ ] Detect priority real and likely gaps, ensure confidence labels distinguish source/DB/runtime/integration proof.
- [ ] Produce EN/KO expanded gap analysis and executable implementation milestones, acceptance criteria, risk/security/rollback.
- [ ] Record MID and recheck main/doc authority while writing.
- [ ] Bilingual changelog, internal/GitHub notes, index, final validation, isolated GitHub draft PR.

## MID — 2026-11-08 KST

- Re-fetched origin/main at 4938d491d9 (v291 disk/docs update PR #2911), after initial b56fdc748d. Authoritative planning docs still v1518. The isolated initial worktree was removed by host maintenance; recovered from the pushed work branch under /home/debian/.mv-tasks/treasury-runtime-v1936; no other agent branch touched.
- Verified read-only 191055911 WLD in both canonical TREASURY and five-vault sum; 0 unbalanced journal transaction totals. The public BFF says RECONCILED for current fiscal cash, not historic operations.
- Actual DB: 3 grants (one 500000 WLD approved, not yet disbursed), 1 ledger-linked normal disbursement; SWF 4 positions and 276 events; 3 bond products but no holdings/coupon/repo; pension 1 accumulating and 0 payout; KDIC 1 fund and 0 premium/payout; 1 linked health insurance record; 1 mint certificate.
- P0 source and DB function body: pension distribution directly inserts account_balances without economy_post_transaction; source SQL341 also bypasses canonical postings. SOE source SQL340 models dividends through MINT→TREASURY and a random UUID each run, without actual enterprise cash or stable period. Do not apply unsafe SQL unchanged; no finance writes performed.
- Applied migration records stop at 339, while main contains 340 and 341; same-name DB routines already exist, requiring checksum/body and role comparison. /treasury/portal 404 is a missing standalone route while the /treasury page embeds grant form; logged-out admin API 401 is expected.
- Prepared EN/KO 39-reference primary-source matrix and 48KB EN comprehensive proposal, 43KB KO proposal with 21 domains / 225 numbered requirements, source-backed P0 gates and implementation plan; docs only.


## FINISH — pending

## Risk boundary

No direct INSERT/UPDATE/DELETE, no DML function calls, no issuing/retiring WLD, no auto financial replay, no DB reset, no runtime feature toggles, no deployment. The database name includes `_dev` but local documentation also identifies host 5433 as Production-backed; do not assign it to Test or Production without measured role/runtime provenance.
