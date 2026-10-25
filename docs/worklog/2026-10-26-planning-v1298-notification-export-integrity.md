# 2026-10-26 Planning v1298 — Notification Archive Export Integrity

## START
- Previous v1296 Addition → Current v1298 Improvement → Next v1300 Addition (provisional).
- miniPC Debian 13.6 active, dev PostgreSQL connected, root 99%/1.2GiB; separate data volume 56GiB.
- skills__list returned no URI; installed Superpowers using-superpowers, brainstorming, writing-plans, using-git-worktrees, verification-before-completion read on miniPC. Canonical main AGENTS.md/README.md/PROJECT_PLAN.md and Korean parity inspected; isolated docs-only worktree from unmerged #1364.

## MIDPOINT
- Main `1c5b84a1c45baafcca83f375a6f99698121e9bb5` unchanged. Source NotificationService direct SELECT/OFFSET/created_at sort/dedupe_key and Boolean transform verified; no archive export implementation. Development B #1356 separate.
- QA v1283 raw logs: frontend 1397 PASS/6 FAIL; backend 1313 PASS/398 skipped; DB 15 PASS/3 skipped; prod audit 2 HIGH, full audit 2 CRITICAL/10 HIGH; exact-SHA official Test/restore not proven.
- RFC 4180 and OWASP CSV Injection checked as candidate external references, newly approved 0; deduplicated accepted cumulative UNKNOWN/10,000. No false claim of reference completion.

## DESIGN / ACCEPTANCE
- Bounded 5000 rows/2MiB/30s before HTTP 200; 413 zero partial bytes. Single-client REPEATABLE READ snapshot; cross-request browsing BEST_EFFORT. Fixed UTF-8 no BOM, CRLF, CSV formula mitigation with disclosed transformedCellCount; SHA-256 exact bytes is not an independent signature. Session/consent/CSRF, DB privilege/BOLA, Android/a11y/SEO, aggregate admin KPI and feature flag OFF.
- P0: ENV1298-01 SEC1298-02 REL1298-03 ARC1298-04. P1: ARC1298-05 ARC1298-06 ARC1298-07 ARC1298-08 ARC1298-09 ARC1298-10.
- Documentation-only. No runtime code, migrations, DB data, WLD/ledger, Test or Production changes. DRAFT / RELEASE HOLD.

## GITHUB HANDOFF
- Draft PR #1371 on unmerged planning #1364; development issue #1363 comment 6402550719, root-capacity #1170 comment 6402551083. Both preserve RELEASE HOLD.
- Main SHA unchanged. Docs-only branch; no runtime/DB/Test/Production mutation.
