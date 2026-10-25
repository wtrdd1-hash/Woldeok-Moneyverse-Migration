# 2026-10-26 Planning v1300 — Verified Member Session Nicknames

## START
- 2026-10-26 06:05 KST. Previous v1298 Improvement → Current v1300 Addition → Next v1302 Improvement (provisional).
- miniPC Debian 13.6 services active, PostgreSQL dev connected, root 99% ~1.0GiB, data volume 52GiB. skills__list empty; installed using-superpowers/brainstorming/writing-plans/using-git-worktrees/verification-before-completion read. Source-of-truth main `1c5b84a1c45baafcca83f375a6f99698121e9bb5` and AGENTS/README/EN/KO planning read; GitHub PR #1371 unmerged. Isolated docs-only branch.
- QA v1284 fresh 2026-10-26 05:19–05:29 KST: 1397 frontend pass/6 fail; production audit 2 High, full audit 2 Critical/10 High; DB privilege and migration 266 provenance unresolved; exact-SHA Test/restore BLOCKED.

## MIDPOINT
- GitHub main and miniPC ls-remote both `1c5b84a1c45baafcca83f375a6f99698121e9bb5` unchanged; canonical EN/KO plan hashes recorded in miniPC midpoint log.
- Main source checked: existing account security session/event list, revocation guards; migration 213 derives deviceLabel from user-agent; migration 214 event listing. No owner nickname CRUD in inspected paths; this is a design gap, not a confirmed Production incident. Similar session nickname PR/issue search found none. Engineering https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1378.
- Other developer A/B/C, Gemini and QA branches untouched. Feature only plans additive nickname store and protected API; no code/DB mutation.

## DESIGN / ACCEPTANCE
- Owner-only display alias on existing session rows, not trusted device identity. Server-confirmed GET extension/PUT/DELETE, Unicode 40 graphemes/160 bytes, 10 mutations/hour, consent/CSRF/reauth, SECDEF, CAS with revision tombstone to avoid ABA, idempotency receipt, privacy/no-store/noindex, Android/a11y/admin k>=20, real-PG 100-race/100-stranger and flag-off rollback.
- P0 ENV1300-01 SEC1300-02 REL1300-03 AUTH1300-04. P1 AUTH1300-05 AUTH1300-06 AUTH1300-07 AUTH1300-08 AUTH1300-09 AUTH1300-10.
- External 10,000 reference gate: new independently deduplicated approved 0, cumulative UNKNOWN, BLOCKED/IN PROGRESS. No source code, Test/Production deployment, WLD/ledger or database changes.

## GITHUB HANDOFF
- Engineering issue https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1378; planning Draft PR #1379 opened on unmerged #1371. Release HOLD, separate development branch/exact-SHA official Test and authorized GitOps required.
