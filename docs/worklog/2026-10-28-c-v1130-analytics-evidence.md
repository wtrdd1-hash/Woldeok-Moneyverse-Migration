# C v1130 — Administrator analytics evidence integrity

## BEFORE WORK — 2026-10-28 18:14 KST
- Base: `35971c600f25869c96f1c666d4b9f58927202730`; independent worktree `auto/hourly-c-analytics-evidence-v1130-20261028-1814`.
- MiniPC Debian 13.6, seven services active, development PostgreSQL connected. No production/test mutation authorized.
- Read AGENTS.md, README and Korean guide, English/Korean project plans, integrated master, QA v1342, latest A/B/C and open PR inventory. Avoid #1724 delivery, #1723 work, #1722 wallet, #1717 backup and P0 #1718.
- P1 reproduced in `frontend/src/app/admin/analytics`: fourteen hardcoded green 100% API health values, 99.99% uptime, SEO fabricated fallback and CSV metrics. Existing `/admin/api-health` correctly identifies route-level health as UNMEASURED; existing guarded `/api/v1/seo/status/admin` provides actual SEO metrics.
- Plan: RED tests for unavailable health/SEO and export; replace invented measurements with unmeasured evidence and authenticated, validated SEO read; GREEN regression, full gates, CI, isolated DB, exact-SHA Test only if safe. Do not bypass release gates.

## IN PROGRESS
- Pending TDD red/green and gate evidence.

## FINISHED
- Pending.
