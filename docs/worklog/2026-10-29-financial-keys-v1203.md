# v2026.10.29.1203 — Financial key / integrity inspection

Source: isolated network-disabled restored PostgreSQL 17.11 database `moneyverse_rebuild`, NOT authoritative Production. Baseline main `2ac90063` rechecked before and during modifications. Preserve user-approved financial write grants; no ACL changes.

Catalog audit: 243 PK, 285 FK, 110 UNIQUE, 586 CHECK, 0 unvalidated constraints, 0 invalid indexes, 0 ordinary tables missing PK, 0 disabled user triggers. Ledger postings have FK to transactions but lacked index on `transaction_id`. Migration 292 adds only that index. Read-only acceptance verification 292 checks PK / validated constraints / valid indexes / idempotency key non-null / positive fully attributed ledger postings / at least two legs and zero transaction deltas. Isolated clone migration and verification PASS. No user balance or ledger mutation.

Historical risks remain: 24 accounts differ from naive signed journal aggregation by 20,261,240 absolute WLD; this is not proof of corruption without opening-balance and account polarity evidence. The 552 treasury-side rows have NULL ledger_transaction_id and require era-specific mapping. No statement of historical correction or complete financial integrity acceptance is made. A separate PR #1808 introduced a SQL file prefixed `282-` while main already has `282-verified-help-center.sql`; migration numbering collision must be resolved before release.

Next: inspect FKs for referencing-side index coverage, verify bank/mint/treasury transaction lineage and per-account opening balances, test replay/concurrency, API end-to-end and Test/Production final sync. Existing monetary grants remain untouched by design.

Update: PR #1808 codec migration was renumbered to 293 after detecting collision with preexisting main migration 282; source branch is updated. The earlier collision is resolved in source; deployment gates remain pending.
