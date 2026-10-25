# Backend B v542 — configured ClamAV fail-closed upload scanning

## Start / scope
- Date: 2026-10-26 KST; baseline main: `1c5b84a1c45baafcca83f375a6f99698121e9bb5`.
- Branch: `auto/hourly-b-clamav-failclosed-v542-20261026-0035`; isolated worktree.
- P1: when ClamAV is explicitly configured, transport errors, timeout or malformed replies currently degrade to built-in signatures, and substring `OK` is accepted before `FOUND`. This can misclassify unsafe uploads. Do not change existing no-ClamAV fallback.
- Overlap: open A/C/QA and B Draft PRs reviewed; no current open PR edits `backend/src/content/antivirus-scanner.service.ts` or `chat-upload.controller.ts`.
- Plan: RED tests for configured daemon failures/malformed response/FOUND precedence; GREEN exact ClamAV reply parsing and explicit unavailable failure; controller maps unavailable to 503 without false malware alerts; regression and repository gates; official Test and Production HOLD until every gate passes.

## Checklist
- [x] Read latest main, AGENTS, README, English/Korean plans, PR/CI and QA context.
- [x] Isolated worktree from origin/main; existing A/C/QA branches protected.
- [ ] RED tests and failure evidence.
- [ ] Implementation and GREEN evidence.
- [ ] Fresh main sync, lint/typecheck/build/unit/security/PG/E2E/CI evidence.
- [ ] Draft PR and final release HOLD record.

## Start gates
- miniPC Debian 13.6 active; root 98% (2.1 GiB free), data volume 67% (63 GiB free).
- Last v541 Draft #1342 runtime CI failed. Main is unchanged. No Test or Production mutation authorized.
