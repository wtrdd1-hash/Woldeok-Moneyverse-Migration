# Planning v1248 — F675-119 Member Dashboard Shortcut Pins
**2026-10-25 04:05 KST / Feature Addition / DRAFT / RELEASE HOLD**

Previous Feature Improvement v1246 → Current Feature Addition v1248 → Next Feature Improvement v1250 (provisional).

## Source of truth and actual gap
Remote main `c9a868b1e622341e2daa8b936ddf0988eda9988e`; AGENTS.md, README.md, English docs/planning/PROJECT_PLAN.md canonical and Korean peer rechecked. frontend/src/app/dashboard/page.tsx has fixed four links, not member-saved shortcuts. Existing frontend/src/lib/app-gateway.ts includes account. QA v1251 FAILED/HOLD; root disk 100%, shared DB/ACL and migration blockers persist. Earlier planning #1210 is unmerged; do not claim its features are live.

## Design and acceptance
Full English/Korean equivalent contracts are integrated into the existing master documents, without new distributed feature specs. Member can reorder up to six allowlisted internal shortcuts without affecting destination authorization or WLD. Owner-only guarded API and PostgreSQL functions use CAS, row locking, immutable idempotency receipts and explicit fail-closed states. Android app-api parity, a11y keyboard reorder, private noindex/no-store, admin k>=20 aggregates, privacy retention approval and flag-off rollback are required.

P0/P1 IDs: ENV1248-01 SEC1248-02 REL1248-03 DASH1248-04 DASH1248-05 DASH1248-06 DASH1248-07 DASH1248-08 DASH1248-09 DASH1248-10.
Engineering acceptance: isolated PG ACL and owner negatives; 100 concurrent same/different idempotency requests; 100 foreign-owner probes; 10,001 synthetic user sets for aggregate pagination; offline/retry/account switch; exact candidate SHA Test and authenticated finance E2E, CI/security/backup restore; operator-controlled no-downtime promotion only after all gates PASS. These are future tests, NOT executed.

## External evidence
Reviewed PostgreSQL row locking, OWASP CSRF and W3C WCAG 2.2 official guidance; publisher families 3; newly approved deduplicated independent references 0, cumulative verified UNKNOWN / 10,000, gate BLOCKED / IN PROGRESS.

## Change boundary
Documentation-only. No runtime code, database, feature switch, WLD, Test/Production, Gemini/A/B/C/QA branches, or other worker files changed. Draft PR only; no main merge.
