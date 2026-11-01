# Development C v1257 — Star Drop Reward Source Truth

## Before work — 2026-11-01 11:45 KST
- Baseline `origin/main`: `f13bbce273ffc65e8576170992d82ea00c27a1c9`; isolated worktree, no edits to main.
- Read AGENTS, README, README/README.ko.md, canonical English and Korean project plans, current open PRs/CI and A/B/QA tasks. No active Star Drop claim source-truth PR found.
- P0 evidence: `backend/src/engagement/dopamine.controller.ts` returns `success:true` and a fabricated amount without a ledger write; `frontend/src/components/star-drop-modal.tsx` reports a locally randomized reward even when claim API fails. `frontend/src/lib/dopamine-api.ts` broadcasts a wallet update for any 2xx response without receipt verification.
- Scope: fail closed on unledgered Star Drop reward claims across Nest, web and app-api; never synthesize WLD or inventory receipt. Add regression tests before implementation, check HTTP contract and accessible unavailable state.
- Release safety: no migration, no direct ledger changes, no official Test or Production deployment without all required gates.

## In progress
- [ ] RED tests and reproduction
- [ ] Minimal backend/API and UI correction
- [ ] Full SHA-specific verification and mid-run main recheck

## Finished
- Pending.
