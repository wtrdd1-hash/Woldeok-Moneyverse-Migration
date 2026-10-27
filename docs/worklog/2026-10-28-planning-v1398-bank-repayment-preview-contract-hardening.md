# Planning v1398 — F675-155 Bank Repayment Preview Candidate Hardening

## START
- 2026-10-28 07:09 KST: Superpowers skill connector returned empty; local using-superpowers, brainstorming, verification-before-completion and writing-plans read. miniPC Debian 13.6 services active. Main b1cd54fda1123fb07ca81b6e5b3ead70f59f556c, AGENTS.md, README.md, English canonical PROJECT_PLAN.md, Korean parity verified. Previous Addition v1396, Current Improvement v1398, Next Addition v1400 provisional.
- Isolated worktree from unmerged planning Draft #1640. No runtime, DB, WLD, ledger, feature flag, Test or Production mutation.

## MID
- Main unchanged. Reviewed actual A unmerged #1641 SHA 153491e2eaf5c5bb39933d9e2a5634b49a45c44b frontend/backend/API/Android BFF, migration 194 standing read model, open PRs and QA v1334.
- Candidate differs from v1396 proposed new SECDEF/schema: existing actor-scoped function reused, app-role spoof #993, missing cash account treated as zero, observedAt API clock, session-epoch fencing not proven, 429/no-store error parity pending. Documentation-only A/B/C/QA handoff; no overlapping code edits.
- QA v1334: main lint/test FAIL, typecheck/build PASS; app DML 235/241, 3 PUBLIC legacy bank functions, five applied checksum mismatches; legacy 04:00 cron backup permission denied, encrypted systemd backup checksum PASS but independent restore NOT VERIFIED. QA #1635 candidate CI PASS is not official Test.
- P0/P1: ENV1398-01 SEC1398-02 REL1398-03 LOAN1398-04 LOAN1398-05 LOAN1398-06 LOAN1398-07 LOAN1398-08 LOAN1398-09 LOAN1398-10. Synthetic 10,001/100/100 NOT RUN. External independent newly approved 0; cumulative independently deduplicated accepted UNKNOWN/10,000; BLOCKED / IN PROGRESS.

## COMPLETE / RELEASE HOLD
- 2026-10-28 07:14 KST: bilingual 10-ID consistency across 10 existing documents PASS, docs-only 11 files PASS, git diff --check PASS, initial commit 61a6428419894eb33ee16bbc3c1e23eaa6da5d41 pushed. Draft PR #1645 created against unmerged planning #1640 (not main); engineering issue #1639 comment 6454921623, A Draft #1641 comment 6454922417. Final handoff commit SHA recorded in miniPC completion log.
- Feature OFF by release policy (actual candidate flag enforcement unverified), DRAFT/HOLD; no main merge or runtime deployment. Stacked planning PR must not be merged independently. Independent restore, main lint/test, exact-SHA Test and 10,000 external reference gate BLOCKED.
