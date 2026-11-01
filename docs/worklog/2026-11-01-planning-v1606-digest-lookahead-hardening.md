# Planning v2026.11.01.1606 — F675-207 race/idempotency hardening (2026-11-01)

## Before work (15:02 KST)
- [x] Read installed Superpowers using-superpowers, brainstorming, writing-plans, using-git-worktrees and verification-before-completion from miniPC; skills__list returned empty, so skills__read unavailable.
- [x] Read main AGENTS.md, README.md, canonical English and Korean project plans; GitHub open PRs/issues; Debian 13.6 services, dev DB and official Test/Production version IDs.
- [x] Main 9052076301bf1975422731ab50a8b7770dbbe951; prior planning v1604 Draft #2328 and issue #2327. Isolated worktree /home/debian/planning-v1606-worktree; reconciled main via merge 96d58582a39ac7ed50a533fceb642b57d7cfc33d, preserving Treasury v1609 and earlier planning history.

## In progress
- [x] Harden F675-207 missing-preference-row/worker claim serialization, consent/disable races, key replay semantics, claim-day UX, edge privacy and negative tests.
- [x] Maintain four English/Korean planning and log pairs and P0/P1 handoffs; do not edit runtime or other agents' changes.
- [x] Re-fetched main and canonical docs mid-run; local release tests 147/147 PASS, classifier/hold 32/32 PASS, 4 EN/KO pairs PASS; remote exact-SHA CI pending.

## Finished (pending)
- [x] GitHub Draft PR #2335 created, existing issue #2327 handoff; docs-only RELEASE HOLD. Exact-SHA CI to be recorded in external final evidence after push.

**Gate:** F675-203–207 proposed/not implemented; no DB migrations/production writes. External new approved 0; cumulative UNKNOWN/10,000 BLOCKED/IN PROGRESS.

## Mid-run (15:05 KST) / 중간 기록
- Refetched origin/main: 1e389dc1a6b253f7dbff7cc6765fbe4a17bcb9e0 (Treasury incident RCA v1611 merged). Preserved main incident docs and release preflight. Real Treasury remains NOT_RECOVERED; historic 552 Treasury + 744 SOE dividend sources unlinked. Latest QA #2330 crafting out-of-band cash/item risk remains P0 under B/C/QA. No Production writes.

## Final local checkpoint (15:08 KST) / 최종 로컬 검증
- Docs-only branch, no runtime/DB/WLD/ledger/Test/Production changes. Release tests 147 PASS / 0 FAIL; classifier/hold tests 32 PASS / 0 FAIL; EN/KO 4 pairs PASS; git diff --check PASS. Remote CI must be checked on the final commit SHA, not inferred from this checkpoint. External reference approvals new 0, cumulative UNKNOWN/10,000 BLOCKED/IN PROGRESS.
