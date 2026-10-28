# C v1131 — Admin analytics domain health evidence

## START — 2026-10-28 18:45 KST
- Base: `35971c600f25869c96f1c666d4b9f58927202730`; isolated branch `auto/hourly-c-analytics-domain-evidence-v1131-20261028-1845`.
- Reviewed AGENTS.md, README.md, README/README.ko.md, canonical and Korean PROJECT_PLAN, QA v1346, open A/B/C/QA/planning PRs, main CI and services. No other open PR targets this analytics domain card.
- P1 proven: `/admin/analytics` hardcodes fourteen 100% success rates, fabricated 7–18 ms latencies and 99.99% uptime, while `/admin/api-health` explicitly reports domain routes as NOT_MEASURED. Export reproduces fabricated values. This is a real operator-decision integrity failure.
- Design: reuse authenticated NestJS `/api/v1/admin/api-health/status` read contract; display only validated measured route metrics with source and timestamp, otherwise `unmeasured`/`unavailable`. No synthetic success or cached success on API failure. Preserve noindex, mobile and accessible status. No new DB privileges, writes, migrations or live probes.
- Plan: RED UI/CSV tests -> GREEN read-contract integration -> focused and full gates -> main recheck -> HOLD if any mandatory gate fails.
- Production/Test and backup scripts strictly untouched; disk 97% and unresolved #1718 backup incident.

## MID — pending

## END — pending

## MID — scope correction (18:51 KST)
- Critical verification: the root checkout was stale. The fresh `origin/main` worktree already contains `analytics-evidence.ts`, which replaces fabricated 14-domain success/latency values. No duplicate implementation; initial hypothesis rejected. Branch renamed to `auto/hourly-c-analytics-money-precision-v1131-20261028-1845`, initial docs-only branch safely superseded.
- New P1 proven on actual main: `analytics-client-view.tsx` converts integer WLD balance strings through `Number()` for sample cash/bank/bond/stock aggregation and CSV. Values above 2^53 lose precision, and malformed values become zero. Implement strict integer-string BigInt aggregate, fail closed on malformed data, preserve bounded-sample disclaimer, exact CSV and screen, percentage rounding only for visualization. Existing authenticated `/api/v1/admin/users` backend contract supplies the values; no new database permissions or writes.
