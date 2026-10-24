# B v518 — Appraisal ownership enforcement containment (P0, HOLD)

## Before work — 2026-10-25 00:35 KST
- Starting main SHA: `c9a868b1e622341e2daa8b936ddf0988eda9988e`.
- Branch: `auto/hourly-b-appraisal-ownership-hold-v518-20261025-0035` (isolated worktree).
- Source: QA/security issue #1188; C #1187 handles browser-side receipts, but the authenticated Backend appraisal endpoint still trusts caller-supplied item identity, name and rarity. Migration 276 only verifies active actor and ledger settlement, not ownership. An attacker can bypass browser checks.
- Overlap audit: #1187 frontend; #1186, #1143, #1139, #1117, #1105 have unresolved migration-280 collision (#1147). Do not introduce an uncoordinated DB migration. Other A/C/QA worktrees and reservations are protected.
- Plan: write failing service/controller regression tests; make Backend service and HTTP endpoint fail closed with HTTP 503 before SQL/fee; keep existing owner-only certificate reads. Document contract, run focused and broad gates; coordinate a forward-only DB ownership fix with A/C/QA. No merge or deployment without full gates.

## In progress
- [x] RED: 3/3 focused tests fail (unsafe SQL attempted / controller permits forged certificate); evidence in internal `red.txt`.
- [x] GREEN: service + controller reject issuance with HTTP 503 before DB call; owner reads unchanged. 10/10 focused unit and 2/2 HTTP tests PASS. HTTP TDD RED observed HTTP 201 (old code), GREEN HTTP 503 (new code).
- [ ] Verify unit/contract/lint/typecheck/build/PG/security/CI; record failures accurately.
- Midpoint main: `c9a868b1e622341e2daa8b936ddf0988eda9988e` (unchanged); newest planning PR #1195 v1240 still draft.

## Finished
- Pending.
