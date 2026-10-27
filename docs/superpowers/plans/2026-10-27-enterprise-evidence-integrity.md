# Enterprise read evidence integrity — v1095
Scope: one P1 admin feature. Existing four authenticated NestJS/PostgreSQL endpoints supply holding overview, SOEs, private enterprises and dividend logs. No new DB privileges, financial writes, or migrations.
1. Add RED tests for valid evidence, missing/invalid arrays, invalid UUIDs/money/rates/timestamps/duplicate records.
2. Add typed server-side validator and use unknown API response types; fail closed on any invalid/missing dataset rather than inventing zeros.
3. Preserve the existing control tower for valid responses. Add alert/status/retry on failure, responsive 44px retry, screen reader announcement, noindex/no-store.
4. Run focused + full checks, remote exact-SHA CI and candidate, re-fetch main/plan; keep Draft/HOLD until release gates all pass.
