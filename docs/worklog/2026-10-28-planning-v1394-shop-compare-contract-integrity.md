# Planning v1394 — Shop Comparison Contract and Trust Reconciliation

## BEFORE WORK — 2026-10-28 05:04 KST
- **Cycle:** Previous Feature Addition v1392 → Current Feature Improvement v1394 → Next Feature Addition v1396 (provisional).
- **Source:** main `b1cd54fda1123fb07ca81b6e5b3ead70f59f556c` verified via `ls-remote`; `AGENTS.md`, `README.md`, English canonical `docs/planning/PROJECT_PLAN.md`, Korean parity `PROJECT_PLAN.ko.md` read. Unmerged planning Draft #1630 head `7c41e38f51cb997f408ba59efb8cdd1f547faf5f` is the isolated documentation base, NOT main.
- **Skills:** `skills__list` returned no URI, so `skills__read` blocked; installed `skills/using-superpowers/SKILL.md`, brainstorming, writing-plans, using-git-worktrees and verification-before-completion read on miniPC. This is a documentation-only refinement of already authorized planning; no product implementation or production change.
- **Worktree:** `docs/planning-v1394-shop-compare-contract-reconciliation` at `/srv/moneyverse-data/build-workspaces/planning-v1394-wt`, separate from Gemini/A/B/C/QA.
- **Objective:** reconcile the v1392 2–3 item / POST / horizon proposal against actual unmerged A Draft #1631, without falsely claiming it is deployed; close misleading pricing, availability and authorization acceptance gaps.

## IN PROGRESS — 2026-10-28 05:05 KST
- Inspected A #1631 source SHA `db018d11fe7f2ef0dae79e3fe3b6e88e8b3b7365` read-only: actual `/shop` two-item selection, Nest `GET /shop/compare?ids=...`, app-api `GET /app-api/v1/shop/compare`, `shop_catalog_list_v2(actor)` full catalog read, BigInt differences, no horizon/third item/observedAt/refresh button. Source is DRAFT, not main.
- A's isolated PG historical chain failed at migration 020; `shop_catalog` raw SELECT under app role reported allowed; official Test exact SHA and restore remain unverified. A's focused and broad unit suites reported passing at its SHA, but main root test/lint/bot audit still fail. Do not convert candidate evidence into main/Production PASS.
- Mid-run `origin/main` remains `b1cd54fda1123fb07ca81b6e5b3ead70f59f556c`. miniPC Debian 13.6 services ACTIVE, dev DB CONNECTED; root 49%, data 70%. No claim of Production correctness from process status.
- [x] Source and baseline reviewed. [ ] EN/KO master + review + project plan + update logs. [ ] 10 backlog IDs parity. [ ] GitHub issue/PR updates. [ ] Final verification and release HOLD.

## FINISHED — 2026-10-28 05:10 KST
- **Deliverables:** 8 existing bilingual integrated master/review/project-plan/update-log documents and this single worklog (9 files total). 10 P0/P1 identifiers parity in each of 8 EN/KO documents; diff whitespace check PASS. Draft PR #1634 opened against unmerged planning #1630; development issue #1629 and A PR #1631 updated with acceptance deltas (comments 6452365332, 6452366105). No other team branch modified.
- **Source gate:** main unchanged at start/mid/final `b1cd54fda1123fb07ca81b6e5b3ead70f59f556c`. A #1631 remains a separate unmerged candidate; do not present v1392 POST/3-item/horizon as implemented. Release remains PARTIAL / DRAFT / HOLD.
- **Validation:** documentation diff and 10-ID parity PASS; actual runtime build/tests, isolated PostgreSQL 10,001/100/100, official Test exact-SHA, independent restore, and Production promotion **NOT RUN** by planning. PR classify check initially IN_PROGRESS; not a pass. A candidate's isolated PG migration 020 and root lint/test/bot audit remain failed per #1631.
- **External evidence:** new independently accepted 0; cumulative deduplicated approved UNKNOWN/10,000; gate BLOCKED / IN PROGRESS. No runtime, DB, WLD, ledger, flags, Test or Production changes.


## IN PROGRESS — documentation verification
- Eight existing EN/KO master, review, project-plan and update-log files updated; 10 backlog IDs present in each of eight sections; no distributed planning file added. English master is the canonical technical specification, Korean master has equivalent scope and blockers.
- `git diff --check` and document parity script PASS; code, migrations, database, WLD and runtime untouched. New worklog is the sole new tracked file.
- Source conflicts documented as **proposed vs candidate**, not misreported as implemented. Candidate A's local unit evidence and official release gates remain distinct.
