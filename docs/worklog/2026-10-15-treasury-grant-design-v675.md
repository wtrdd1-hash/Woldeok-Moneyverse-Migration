# v2026.10.15.675 — Treasury startup grant design/reconciliation log

## S0 start / pre-change
- User requested a fresh plan review and implementation. Existing dashboard screenshot indicated 3 legacy applications with settlement paused.
- Tool: connected miniPC `@pc` MCP (service status and safe read-only DB), GitHub source, separate git worktree; Desktop Commander remote devices offline, so used the active dedicated Moneyverse PC MCP instead.
- Local primary checkout was 53 commits behind; fetched `origin/main=f2bf939e53482721ee8bbf1074bd7ebf1922b13e`. Worktree: `/srv/moneyverse-tasks/treasury-grant-v675/source`; branch `feature/treasury-grant-workflow-v2026.10.15.675`, isolated from other agents.
- Read: AGENTS, documentation governance, project/integrated planning authority, economy treasury core, prior v629 remediation, v674 closeout, migration 240/269/271, current frontend route/admin UI and backend treasury pipeline; Superpowers brainstorming/systematic-debugging/worktree/planning/TDD/verification instructions.
- Source diagnosis: current main grant APIs HTTP 503; historic JSON read-only; no end-to-end transaction; generic v240 grant function does not post balanced Economy Core ledger entries.

## S1 intermediate / read-only financial evidence
- Query against authorized `woldeok_moneyverse_dev` database via PC tool, read-only aggregate values: `VAULT_MAIN.balance_wld=184460884`; `TREASURY account balance=0`; ledger transaction count 831; treasury disbursement count 4.
- Material gap: current vault balance cannot be treated as Economy Core payment backing. Do not move/copy balances, execute grant payment, or enable current legacy grant path.
- Confirmed version 271 latest migration in origin/main; v652 production observations show older applied migration set / broad ACL (not remeasured in this session).
- Design decision: staged DB application/review, **separate blocked ledger settlement**; user must review amount/quota/quarter and financial source-of-truth assumptions before the implementation plan is approved.

## S2 design deliverables / status
- English/Korean v675 specifications added under `docs/superpowers/specs/`.
- No product code, DB migration, feature switch, Test deployment, Production promotion, or member-money mutation in this design stage.
- Before implementation: written spec approval, executable task plan, exact-SHA isolation/CI, G0 replicated-DB financial reconciliation and rights-negatives required.
