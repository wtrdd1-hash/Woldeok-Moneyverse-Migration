# Admin live UI: desktop baseline and responsive recovery

The owner approved implementation/release, asked us to stop repeating questions, confirmed Nov18 navy/violet and reprioritized admin first. First working slice: source-backed dashboard and the broken system-log screen. Preserve all other admin actions/routes until individually verified.

## Approach
Use the existing Spring MVC/Thymeleaf admin design and current favicon, with desktop sidebar/header/content as the baseline and existing tablet/mobile navigation. A narrowly imported `admin-presentation` application renders only these read-only pages. It calls the existing fixed loopback backend with the request's session cookies; the backend must return successful JSON with an approved administrator role before rendering any data. No caller identity/internal-token headers, redirects, environment credentials, JDBC, schedulers, sessions or financial components. This avoids deploying unrelated financial code merely to replace stale HTML. Full backend rollout remains gated by existing financial/provenance findings.

The dashboard consumes actual users/stocks/switch responses. Logs consume the existing enumerated source/10..500-line/filter API. Validate shape, escape log text, never infer empty/healthy from failure, preserve no-store/noindex/CSP. GET forms perform actual bounded reads; no fake mutation buttons or receipts. Missing/invalid sessions redirect to login; a failed/invalid source gives visible unavailable state with 503; role denial gives 403. Both edge and process enforce the boundary.

## Acceptance
Real PC layouts at1440/1920; responsive widths1024/768/430/390/360/320 and zoom200%. All five existing locales, keyboard/focus and menu; real dashboard values and log reads, filters, empty/error statuses. Negative tests cover forged identity/internal headers, guest/nonadmin, malformed/oversized JSON, timeout/redirect, script-like logs and lost session. Exact-source CI artifact and protected Test precede scoped Production cutover. Old API/auth/private/financial routes remain their existing authority.

Review refinement: stock/feature/user fields are validated against the actual serialized AdminGovernanceDtos contracts, with aliases accepted only when nonconflicting. The log UI reads and validates an unfiltered bounded source window before applying its own text filter. Legacy Discord EMPTY without explicit sourceAvailable cannot certify a successful read. The backend source separately preserves read status before filtering; its deployed state is distinct from the new UI renderer.
