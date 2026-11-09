# v2026.11.09.1941 — Monetary policy order reason validation parity

## Before work (2026-11-09 KST)
- Report: national mint policy order proposal UI advertises 5-character justification but backend rejects anything under 10 characters.
- Evidence: frontend/src/components/admin/mint-dialogs.tsx OrderProposalDialog checks trimmed length < 5 and labels 5 characters; backend/src/economy/monetary/central-bank.service.ts proposePolicyOrder requires >= 10. The separate monetary bureau frontend already enforces 10.
- Source: isolated task branch based on origin/main 8db59f535dc425a86b6fd96ce7068f2a3411210e; default workspace main has local edits to implementation_plan.md that must not be touched.
- Design: keep server-side 10-character audit threshold; align mint dialog label and local validation, add focused UI regression tests. No API, financial SQL, authorization or policy-order status changes.
- Task checklist: [x] identify mismatch; [ ] red regression; [ ] minimal UI correction; [ ] focused tests and frontend typecheck; [ ] re-fetch main and inspect drift; [ ] independent test-server verification; [ ] release decision with gates.
- Release safety: avoid production state changes or issuance; only a successful exact-SHA Test run and independent release checks can authorize promotion.

## In progress (2026-11-09 20:11–20:13 KST)
- Isolated task worktree from origin/main, committed/pushed pre-work task record before changing application code; other agents’ workspaces and main dirty implementation_plan.md untouched.
- RED: new UI regression exposed the 5-character label mismatch (1 expected failure, 1 other passing). Initial test invocation without NODE_ENV=test returned React.act test-harness error; rerun with NODE_ENV=test exposed the intended assertion failure.
- GREEN: adjusted proposal-only local minimum, copy and accessible input association; 2/2 focused tests pass. Retire execution 5-character logic intentionally outside scope.
- Related frontend test files: 4 passed, 14 tests passed; frontend typecheck success; scoped ESLint success; git diff --check success.
- Main re-fetched midpoint, unchanged at 8db59f535dc425a86b6fd96ce7068f2a3411210e.
- Test/Production backend/frontend systemd active; public /api/version HTTP 200. Test ID dfb98c7c5c2279201ab44808f7ea259acb5ac84d, Production b2980de529; neither is this candidate. No Test deployment or production release.

## Finished (candidate validation only)
- Scope: source correction, new UI regression and EN/KO internal/public update notes.
- Exact candidate SHA, PR and CI/release status to be attached after push. Promotion blocked pending official exact-SHA Test and documented finance/security/release gates. No operation against money or production process performed.
