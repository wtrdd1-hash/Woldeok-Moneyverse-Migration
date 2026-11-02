# C v1319 — Verified Host Storage Evidence

## Before work — 2026-11-03 04:15 KST
- Base: origin/main `f5c3fbedae1c3b3ec2374882b049aac43a655eb4` (fetched); separate worktree and branch, shared checkout has unrelated uncommitted security audit changes and must not be modified.
- MiniPC Debian 13.6: seven core services active; development PostgreSQL connected.
- Reviewed AGENTS, bilingual README and integrated plans, open PRs/CI and recent A/B/C/QA. No open PR specifically fixes host storage snapshot date parser; backend signed evidence endpoint exists.
- Candidate parser concern was disproven: existing storage view and page tests 4/4 PASS. Confirmed P1 instead: `frontend/next.config.ts` globally emits `X-Robots-Tag: index, follow` when indexing is enabled, while the private storage document has only metadata robots=noindex; its private API response is correctly no-store/noindex. Add a route-specific document HTTP privacy rule without changing the verified backend source.
- Scope: restore valid evidence rendering without relaxing host signature, freshness, admin authorization or least-privilege boundaries. Add exact date edge cases, accessible unknown state, private HTTP policy, run gates.
- Release policy: no merge, Test or Production deployment until all gates pass.

## In progress
- [x] Reproduce storage document header privacy gap (RED): missing route rule; 1 failing test, plus two API referrer tests failed
- [x] Add explicit root/localized private HTTP headers and API referrer protection; 15/15 focused tests GREEN; parser untouched after 4/4 baseline PASS
- [ ] Verify frontend/Backend contract and HTTP privacy
- [ ] Re-fetch main, CI and QA; record final gates and deployment state

## Finished
- Pending full verification, PR/CI and official Test release gates.
