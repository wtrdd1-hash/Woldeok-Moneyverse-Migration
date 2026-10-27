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

## FINISHED — pending
