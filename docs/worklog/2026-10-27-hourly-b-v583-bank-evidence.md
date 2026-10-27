# B v583 — Admin bank read-model evidence integrity

## BEFORE (2026-10-27 14:35 KST)
- Main SHA: `584f01a9c8df3f9005a7e5aa6d13e4719914ae0c`.
- Independent branch: `auto/hourly-b-bank-evidence-v583-20261027-1435`.
- Root cause: `GET /api/v1/admin/bank` catches database errors independently for overview, credit grades and loan book, returning fabricated zero totals or empty arrays with HTTP 200.
- Existing Frontend `/admin/bank` correctly renders an error empty state when the backend request fails. No Frontend change needed.
- Proposed contract: success returns all three authoritative read models; any read failure returns non-2xx and no financial read model, preserving authorization and DB read-only behavior.
- Constraints: no DB migration, no WLD/ledger write, no Production/dev DB access, no merge/deploy without exact-SHA Test and security gates.
- Existing PRs for bank/FX reviewed; this is a separate read-only endpoint defect.

## PLAN
- [ ] RED: regression tests for each independent DB read failure and all-success path.
- [ ] GREEN: remove per-read fabricated fallbacks, preserve `guarded` error semantics.
- [ ] Validate isolated PostgreSQL behavior and full code/security/CI gates.
- [ ] Refresh main and EN/KO plan; log integration, HOLD, cleanup decisions.

## IN PROGRESS
- Waiting for RED tests.
