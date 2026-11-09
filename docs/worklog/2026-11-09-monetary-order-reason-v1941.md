# v2026.11.09.1941 — Monetary policy order reason validation parity

## Before work (2026-11-09 KST)
- Report: national mint policy order proposal UI advertises 5-character justification but backend rejects anything under 10 characters.
- Evidence: frontend/src/components/admin/mint-dialogs.tsx OrderProposalDialog checks trimmed length < 5 and labels 5 characters; backend/src/economy/monetary/central-bank.service.ts proposePolicyOrder requires >= 10. The separate monetary bureau frontend already enforces 10.
- Source: isolated task branch based on origin/main 8db59f535dc425a86b6fd96ce7068f2a3411210e; default workspace main has local edits to implementation_plan.md that must not be touched.
- Design: keep server-side 10-character audit threshold; align mint dialog label and local validation, add focused UI regression tests. No API, financial SQL, authorization or policy-order status changes.
- Task checklist: [x] identify mismatch; [ ] red regression; [ ] minimal UI correction; [ ] focused tests and frontend typecheck; [ ] re-fetch main and inspect drift; [ ] independent test-server verification; [ ] release decision with gates.
- Release safety: avoid production state changes or issuance; only a successful exact-SHA Test run and independent release checks can authorize promotion.

## In progress
- Pending red/green test and code changes.

## Finished
- Pending.
