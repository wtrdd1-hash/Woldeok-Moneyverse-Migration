# Planning v1474 — Notification search hardening (2026-10-29)

**Status:** IN PROGRESS → DRAFT / RELEASE HOLD; previous Addition v1472, current Improvement v1474, next Addition v1476 provisional.

## Before work
- 2026-10-29T21:07:12+09:00: miniPC status verified Debian services and DEV PostgreSQL connection; skills connector returned no URI, installed `using-superpowers`, `brainstorming`, `writing-plans`, `using-git-worktrees`, `verification-before-completion` read on miniPC.
- Fresh GitHub and remote main `f9fd777458b89b3c33593ae0cad46a37b216474b`; authoritative `AGENTS.md`, `README.md`, `PROJECT_PLAN.md` and Korean counterpart checked. PR #1888 **MERGED** documentation; feature source remains absent.
- Isolated worktree/branch `docs/planning-v1474-notification-search-hardening-20261029`, no overlapping runtime branches touched.

## In progress
- Inspected Nest DTO/service/controller and Next notification page/API; checked QA v1372 evidence (FAILED/P0 on earlier main), current source migration filenames (304 unique IDs), current public Test/Production version SHA `c2129625aa6629c616fb31ce790950618b8d92b2`.
- Source-backed corrections: cross-request as-of vs mutable unread membership; two-syllable Hangul trigram plan risk; canonical HMAC filters, microsecond tuple precision, read-only authorization, error/UX recovery and privacy-safe aggregate KPI.
- Mid-run origin/main refresh `f9fd777458b89b3c33593ae0cad46a37b216474b`; no code/DB/WLD/Test/Production changes.

## Finished / verification
- English canonical and Korean equivalent integrated/project plans updated; P0/P1 ten-item backlog and 10,001-row adversarial acceptance are **specifications, not executed tests**.
- Final git diff, classifier, bilingual parity, GitHub PR and issue update outcomes to be recorded at final checkpoint. External independently approved new 0; cumulative UNKNOWN / 10,000, gate BLOCKED / IN PROGRESS. Release HOLD.
