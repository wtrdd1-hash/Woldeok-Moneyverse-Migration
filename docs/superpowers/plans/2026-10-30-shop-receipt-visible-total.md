# Shop receipt visible total — implementation plan (2026-10-30)

## Scope / decision
Add a member-only sum of the **displayed** 30 recent receipts (or matching receipts within latest 100 on search). Not a lifetime spending total, tax report, or proof of a complete history. Reuse existing owner-scoped PostgreSQL SECURITY DEFINER read function; no migration, ledger mutation, extra table grants or new user endpoint. English canonical; Korean UI copy only where user-visible. The unattended automation cannot solicit interactive design approval; implementation remains Draft/HOLD pending review.

## TDD sequence
1. RED: Backend controller/service tests assert exact BigInt-string sum, owner scope and bounded search. DB test verifies existing owner-scoped function returns empty for unknown owner.
2. RED: Frontend parser rejects forged/inconsistent totals, malformed 200 and overflow-prone amounts; Next BFF and Android gateway fail closed, cache private/no-store/noindex.
3. GREEN: Implement server summary, strict client schema, visible UI with accessibility live region and explicit recent-window caveat.
4. Run target tests, lint, typecheck, build, full tests, security/SEO/app-api, isolated PostgreSQL, and exact-SHA CI. Do not merge or deploy without all gates and official Test identity/backup/restore evidence.
5. Re-fetch origin/main and integrated EN/KO plans at start/mid/pre-merge; preserve concurrent branches and all unique changes.

## Rollback
Revert feature commit/PR; no schema or data change. Keep prior receipt list endpoint compatible for consumers only after coordinated backend/web/app-api rollout. If exact SHA cannot be proven, HOLD.
