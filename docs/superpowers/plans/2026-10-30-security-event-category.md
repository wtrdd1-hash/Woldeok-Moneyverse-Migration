# Recent security activity category filter — bounded design and plan

## Purpose and approved automation scope
Members need to distinguish login events from account-setting changes in their own security activity without exposing raw audit metadata. The automation request delegates selection of one P1 owner-visible feature. This is a read-only extension of the existing recent-20 view, not a new audit search or full-history report.

## Design
`GET /api/v1/account/security/events?category=login|settings` filters **after** the existing owner-scoped `account_recent_security_events(actor,20)` PostgreSQL function. Omitted or `all` means all recent events. `login` includes `local_login_succeeded`; `settings` includes the known password/email request/change event types. Unknown types appear only in `all`. Reject unknown, duplicate, or non-string category values with 400. The filter does not widen the read horizon; display this explicitly. The server-rendered private `/account/security?category=` page has keyboard-accessible filter links and an invalid-filter state, preserving session guard and noindex. The Android app-api forwards the exact query and enforces private/no-store/noindex on responses. Existing CSV export remains unfiltered and is labelled accordingly. No new table, SQL migration, grant, ledger write, or deployment.

## Test-driven tasks
1. Add failing Nest controller/repository tests for owner-bound category selection, invalid arrays/unknowns, unknown event isolation, recent-20 cap.
2. Implement strict controller query and minimal repository filtering; verify targeted tests.
3. Add failing Next page tests for filter links, valid filter propagation, invalid category, and explicit 20-event scope; implement page.
4. Add failing Android gateway test for query forwarding and private headers; implement only if existing gateway fails (avoid unnecessary modifications).
5. Run targeted tests, Typecheck, lint, build, database privilege tests against isolated PostgreSQL, exact SHA CI; recheck main and integrated plan. Never merge or deploy without complete gates and official Test exact SHA evidence.

## Release and rollback
Draft PR and HOLD until full CI, isolated Test auth E2E, off-host restore and GitOps proof. Code-only rollback: revert feature commit. No data migration.
