# Owner Stock Alert Trigger Category — implementation plan

**Goal:** Let a consented owner filter the most recent 30 server-recorded stock alert triggers into price-threshold or day-change events without misrepresenting a bounded window as full history.

**Architecture:** The Nest endpoint accepts one optional canonical `kind=price|change` and validates duplicate/invalid values. Repository reads only the existing SECURITY DEFINER owner function `stock_alert_events_list(actor, limit)` then filters its bounded result in SQL; no direct table grants. Next renders a GET form and validates the response. Android app-api passes the filter but rejects malformed or unfiltered HTTP 200 evidence, private/no-store/noindex. No DB migration, money, stock mutation, or new feature switch.

**Tasks:**
1. Add failing controller tests for price/change/default, duplicate/invalid kind and 1..100 bound. Run RED; implement Nest parsing.
2. Add failing repository tests asserting bounded owner SQL function and post-function condition predicate. Run RED; implement repository query.
3. Add failing shared response-proof tests for both categories, malformed payload, integer precision and limit. Run RED; implement parser.
4. Add failing Android app-api tests for forwarding, reject forged 200, no-store/noindex, duplicate kind. Run RED; implement gateway guard.
5. Add frontend form and page validation tests; run RED/GREEN, preserve locale and bounded-window language.
6. Verify isolated PostgreSQL source function, actor isolation, app-role direct table access denial, ROLLBACK; run full and exact-SHA gates, rebase only when safe; create Draft PR with evidence, release HOLD until all gates pass.

**Risk:** App role direct DML privileges and Production process provenance have prior P0 findings; even a locally verified read-only feature must remain unreleased if the gate is unresolved.
