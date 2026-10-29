# C v1130 — Administrator IndexNow submission receipt integrity

## BEFORE WORK — 2026-10-28 18:14 KST
- Base: `35971c600f25869c96f1c666d4b9f58927202730`; independent worktree `auto/hourly-c-seo-submit-evidence-v1130-20261028-1814`.
- MiniPC Debian 13.6, seven services active, development PostgreSQL connected. No production/test mutation authorized.
- Read AGENTS.md, README and Korean guide, English/Korean project plans, integrated master, QA v1342, latest A/B/C and open PR inventory. Avoid #1724 delivery, #1723 work, #1722 wallet, #1717 backup and P0 #1718.
- Initial analytics inspection used a stale checkout; authoritative origin/main already contains analytics evidence validation. Abandoned duplicate test before implementation.
- P1 confirmed on authoritative main: `/admin/seo` manual IndexNow POST accepts `success:true` without checking provider statuses, timestamp, URL set or response consistency; same-origin Next BFF passes arbitrary backend JSON as a success. Backend has a real guarded CSRF-protected submission contract with 3 provider outcomes and a timestamp.
- Plan: RED tests for malformed/contradictory IndexNow receipts, BFF and UI; validate the real backend contract, classify accepted vs failed provider outcomes, fail closed on malformed responses; GREEN regression, full gates, CI, isolated DB, exact-SHA Test only if safe. No external IndexNow calls in tests. Do not bypass release gates.

## IN PROGRESS
- Pending TDD red/green and gate evidence.

## FINISHED
- Pending.

### MID-WORK — 2026-10-28 18:19 KST
- Corrected stale-checkout false positive: latest main already implemented analytics evidence; no duplicate analytics code was committed.
- TDD RED: 4 failing assertions (valid receipt parser, BFF malformed success, BFF provider evidence, browser false success). GREEN: focused 18/18 across parser, browser and BFF tests.
- Existing NestJS `POST /api/v1/seo/submit` uses SessionGuard, AuthenticatedGuard, ConsentGuard, AdminGuard, AdminSessionGuard, CsrfGuard and `SeoService.submitUrls()` returns three IndexNow endpoint outcomes. Reused contract without a fake client-only success.
- Strict provider whitelist, accepted-status consistency, URL origin, duplicate URL, 10-minute receipt age, retired Google ping status; Next gateway returns 503 for malformed and 502 for no acceptance; browser confirms only accepted endpoints and never indexing.
- No real IndexNow calls; tests mock requests. Main and integrated plan rechecked before full gates.
