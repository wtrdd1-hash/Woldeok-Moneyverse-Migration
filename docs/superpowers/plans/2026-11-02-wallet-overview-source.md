# Owner Wallet Overview Source Integrity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Follow TDD RED/GREEN and verification-before-completion.

**Goal:** Never display a fabricated zero balance or crash the authenticated wallet page when an upstream wallet overview response is malformed.

**Architecture:** Parse the existing owner-scoped NestJS wallet response at the Next.js boundary. Require canonical WLD integer strings, internally consistent cash/bank totals, valid transaction shapes and owner identifier. Treat invalid responses as unavailable, never a verified empty wallet. No new API, SQL, ledger or schema.

**Tech Stack:** Next.js, TypeScript, Vitest, existing NestJS session+consent and PostgreSQL SECURITY DEFINER read model.

**Spec:** `docs/planning/PROJECT_PLAN.md` and `docs/planning/PROJECT_PLAN.ko.md` (source truth, privacy and exact WLD handling).

## Global Constraints
- Independent worktree from fetched main; do not touch other workers or the root checkout.
- English canonical code and worklog; Korean supporting worklog.
- No false zero, no direct table grants, no backend bypass, no production without complete gates.

## Review Focus
- Empty/missing/malformed cash or bank balances must never be interpreted as 0 WLD.
- A mismatch between declared total and pocket sum must be rejected.
- Malformed transaction list or partial pocket delta must be rejected.
- Valid >2^53 and <=38-digit amounts must remain exact.
- Authenticated member with unavailable data must see a retryable non-sensitive state.

### Task 1: Owner wallet response parser
**Files:** Create `frontend/src/app/wallet/wallet-overview-proof.ts`, test `wallet-overview-proof.test.ts`.
- [ ] Write valid and invalid shape tests, run RED.
- [ ] Implement strict parser and run GREEN.

### Task 2: Connect wallet page
**Files:** Modify `frontend/src/app/wallet/page.tsx`, add `wallet-overview-page.test.tsx`.
- [ ] Test malformed payload renders unavailable instead of throwing.
- [ ] Wire parser and accessible retry link, run GREEN.

### Task 3: Verification and release hold
- [ ] Execute required gates at exact HEAD and record failures/skips.
- [ ] Fetch latest main and plans, update EN/KO worklogs and PR.
- [ ] Do not merge/deploy without all required gates.
