# Planning v1606 — F675-207 race/idempotency hardening (2026-11-01)

## Before work (15:02 KST)
- [x] Read installed Superpowers using-superpowers, brainstorming, writing-plans, using-git-worktrees and verification-before-completion from miniPC; skills__list returned empty, so skills__read unavailable.
- [x] Read main AGENTS.md, README.md, canonical English and Korean project plans; GitHub open PRs/issues; Debian 13.6 services, dev DB and official Test/Production version IDs.
- [x] Main 9052076301bf1975422731ab50a8b7770dbbe951; prior planning v1604 Draft #2328 and issue #2327. Isolated worktree /home/debian/planning-v1606-worktree; reconciled main via merge 96d58582a39ac7ed50a533fceb642b57d7cfc33d, preserving Treasury v1609 and earlier planning history.

## In progress
- [ ] Harden F675-207 missing-preference-row/worker claim serialization, consent/disable races, key replay semantics, claim-day UX, edge privacy and negative tests.
- [ ] Maintain four English/Korean planning and log pairs and P0/P1 handoffs; do not edit runtime or other agents' changes.
- [ ] Re-fetch main and canonical docs mid-run; execute fresh local and remote exact-SHA CI evidence.

## Finished (pending)
- [ ] Final commit, GitHub Draft PR/issue, CI status and release-hold outcome.

**Gate:** F675-203–207 proposed/not implemented; no DB migrations/production writes. External new approved 0; cumulative UNKNOWN/10000 BLOCKED/IN PROGRESS.
