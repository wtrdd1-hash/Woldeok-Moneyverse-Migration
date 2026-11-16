# v2026.11.17.2 — SEO routing, authorization and evidence truth

**Changed (Nginx live):** versioned SEO API and legacy aliases routed to retained protected Node backend; canonical IndexNow key served by frontend; SEO administrator pages and audit BFF protected with fail-closed Nginx edge auth; unavailable authority yields 503.

**Changed (source candidate only):** Next SEO audit requires independently verified Nest role/session; SEO funnel's hardcoded Google ranking/CTR/indexing/redirect success figures removed.

**QA:** stage config PASS, test RED→GREEN, Next targeted 50/50 PASS, Production read-only 13/13 PASS. No authenticated admin UI/GSC/provider acceptance tests. Full release HOLD; frontend candidate not deployed; direct Spring SEO fake responses remain behind the runtime bridge. Zero-downtime Nginx reload with rollback evidence in worklog.
