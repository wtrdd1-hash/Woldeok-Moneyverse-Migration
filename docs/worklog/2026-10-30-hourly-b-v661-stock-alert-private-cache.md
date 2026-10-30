# Backend B v661 — owner stock alert response privacy (DRAFT / RELEASE HOLD)

**Baseline:** origin/main `9da6545c4ff4809b5bd84ab6a28b9d2f1db74cef` (checked start, mid and before commit). Independent branch `auto/hourly-b-v661-stock-alert-private-cache-20261030-1639`.

## Defect and change

Four authenticated stock-alert routes returned owner-specific alert definitions, event history, create receipts and deletion receipts without explicit cache or search-index directives. The HTTP regression test reproduced missing `Cache-Control` in all four successful responses before code changes (4 RED). This is a **potential cache/privacy exposure**, not evidence of an actual disclosure.

Set `Cache-Control: private, no-store` and `X-Robots-Tag: noindex` on GET `/stocks/alerts`, GET `/stocks/alerts/events`, POST `/stocks/alerts`, and DELETE `/stocks/alerts/:id`. The route contract, session-owner scoping, authentication, consent, CSRF, request validation, and repository behavior are unchanged. No migration, PostgreSQL grant, balance, ledger, or WLD mutation. The scope covers successful responses; no assertion is made about guard-rejected responses or downstream browser/edge headers.

## Verification

- TDD before change: 4/4 RED due to missing private cache header; after change: 4/4 GREEN.
- Backend stock alert focused tests: **9 PASS**; Frontend stock-alert focused tests: **14 PASS**.
- Lint: **PASS**, 0 errors / 1,043 warnings (initial test variable-name lint error corrected before final run).
- Typecheck, Backend build, Frontend build: **PASS**.
- Mobile API contract: **PASS**, 183 endpoints / 673 methods.
- Database static tests: **56 PASS / 4 SKIP**; security/release checks **14 PASS**; production dependency audit **0 known vulnerabilities**.
- Backend full: **2,567 PASS / 119 FAIL / 495 SKIP**; Frontend full: **2,607 PASS / 53 FAIL**. Baseline QA v1392 also reports 119/53 failures; do not claim all failures are unrelated without individual diagnosis.
- Isolated real PostgreSQL integration, official Test exact-SHA, authenticated E2E, and GitOps release gates: **NOT VERIFIED / BLOCKED**.

## Release decision

**DRAFT / HOLD**. No merge, no Test or Production deployment. Existing P0 production process mismatch #1984, treasury false-reconciliation, DEV DB direct DML grants, five applied migration checksum mismatches and full test failures remain unresolved. Preserve A/C/QA/planning work and all other branches.
