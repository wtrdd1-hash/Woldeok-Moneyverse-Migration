# Planning v1306 — F675-133 Cross-generation Shop Receipt Integrity (2026-10-26 09:13 KST; DRAFT / RELEASE HOLD)

**Cycle:** Previous Feature Addition v1304; Current Feature Improvement v1306; Next Feature Addition v1308 provisional.

## Authoritative sources and observed evidence
- Main SHA 1c5b84a1c45baafcca83f375a6f99698121e9bb5 checked start and mid, with canonical AGENTS.md, README.md, PROJECT_PLAN.md and Korean parity. Prior Draft #1390 unmerged; Developer A #1258 unmerged. Independent docs-only worktree; no runtime or DB writes.
- miniPC Debian 13.6 core services active, development PostgreSQL connected. Root 100% / 608MiB free; data volume 45GiB free. No other contributor workspace or Docker volume modified.
- Source inspection: Migration 009 legacy function INNER JOIN shop_items/users and active-only filter, nullable paid_amount; Migration 071 catalog purchase rows; Migration 165 effective discounted unit_price; ledger NUMERIC and lowercase debit/credit; BFF and MyReceipts convert failures to empty; JS Date loses microseconds. Database actor parameter is not independent DB authentication.
- Fresh read-only development DB aggregates: legacy 0, catalog 6, distinct catalog transactions 6; six have balanced two postings, expected amounts and actor/type matched. This is not production reconciliation. No financial record content or member IDs copied to planning docs.
- QA v1287 FAILED/P0: frontend 1,397 pass / 6 fail; backend 1,313 pass / 398 skip; DB 15 pass / 3 skip; full audit 2 Critical/10 High, production 2 High, bot 1 Critical/5 High; exact-SHA authenticated Test and isolated restore not proven. Migration 266 historical checksum divergence and dev DB app-role grants unresolved.

## Design and handoff
- Six existing EN/KO integrated planning/review/PROJECT_PLAN files updated, EN/KO UPDATE_LOG and this single worklog. Supersedes conflicting v1304 design: owner-only dual-source read, exact historical price, nullable legacy amounts, verified-vs-unchecked ledger status, full-precision signed cursor, cutoff/backfill caveat, truthful error/empty states, Android and accessibility parity.
- P0: ENV1306-01 SEC1306-02 REL1306-03 SHP1306-04. P1: SHP1306-05 SHP1306-06 SHP1306-07 SHP1306-08 SHP1306-09 SHP1306-10. All details in integrated EN/KO master; no new distributed feature plan file.
- External independent publisher families reviewed: PostgreSQL, OWASP, W3C. New independently acquired/deduplicated/approved records 0; cumulative accepted UNKNOWN/10,000 => BLOCKED / IN PROGRESS. No claim that reviewing three URLs fulfills the evidence corpus.
- Feature flag SHOP_UNIFIED_RECEIPTS_ENABLED OFF. Runtime implementation belongs to separate development branch, reviewed forward-only migration, exact candidate SHA CI/Test authenticated E2E, security audits, isolated restore and approved GitOps; no merge/deploy/financial mutation in planning.

## References (publisher reviews, not approved 10,000-record corpus)
- https://www.postgresql.org/docs/current/transaction-iso.html
- https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/
- https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum

## Verification
- Git diff --check and six-document backlog parity required before commit; report actual command exit codes. Draft PR and GitHub issue update only after verified docs. Root disk emergency remains P0.
