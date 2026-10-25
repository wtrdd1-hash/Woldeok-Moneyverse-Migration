# 2026-10-25 Planning v1286 — Marketplace Saved Search Integrity / 마켓 검색 보관함 무결성

**Status:** PARTIAL / DRAFT / RELEASE HOLD. **Cycle:** Previous Addition v1284 → Current Improvement v1286 → Next Addition v1288 (provisional). **Authority:** remote main `1c5b84a1c45baafcca83f375a6f99698121e9bb5`; AGENTS.md, README.md, English canonical and Korean plan; stacked on unmerged planning Draft #1335.

## Evidence and change / 근거·변경
- Migration 232 `price_wld NUMERIC(20,4)`, frontend `BigInt(priceWld)` and `Number(BigInt difference)`; backend `ILIKE` wildcard unescaped, `MarketplaceQueryDto` search/category unbounded, seller-name UI search not supported by backend, `created_at DESC LIMIT/OFFSET` non-unique. These are code-confirmed compatibility and security risks, not confirmed Production incidents.
- Existing F675-128 only: canonical literal filter v2, exact decimal comparison/JSON string, SQL ACTIVE prefilter with stable keyset, HMAC owner+session+revision cursor, 20-active quota, atomic idempotent receipt, account merge/deletion privacy, admin k>=20, Android parity, SEO noindex, WCAG AA, measurable KPI. No new scattered planning file.
- P0 ENV1286-01 SEC1286-02 REL1286-03 MKT1286-04; P1 MKT1286-05 MKT1286-06 MKT1286-07 MKT1286-08 MKT1286-09 MKT1286-10. Development issue #1334 remains implementation owner. Runtime/DB/WLD/ledger/feature switches/Test/Production unchanged.
- QA: completed v1276 FAILED/HOLD; newer v1277 raw logs show 1,397 pass / 6 fail, build/typecheck/lint pass, test/route-check/full/prod/bot audits fail; final QA signoff not observed. Root 98%/2.2GiB free; Test exact SHA/restore not certified.
- Independent external reference gate: newly approved 0, cumulative deduplicated accepted UNKNOWN, target 10,000, BLOCKED/IN PROGRESS.

## Verification / 검증
Check all six integrated EN/KO planning docs contain the ten same v1286 backlog IDs, `git diff --check`, docs-only path allowlist, clean worktree after commit, remote main recheck before PR and at finish. No claims of runtime tests or Production readiness.
