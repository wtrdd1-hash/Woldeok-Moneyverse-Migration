# Nov18 frontend unification design

The user requires a single Nov18 navy/violet frontend, real favicon, PC-first responsive layouts and five languages. Prior opt-out of design questions and implementation/production approvals remain in force. Whole-site acceptance remains the goal; a color overlay is not full acceptance.

## Observed boundary
Actual administrator navigation currently crosses the shipped native shell, ad-hoc inline-styled LiveAdmin read pages and exported/Next pages. The main public header also shows a guest action for an authenticated administrator. Account/support/chat navigation returns403. These are open findings, not successful pages.

## Implementation approach
Reuse Spring MVC/Thymeleaf shared/admin-shell for the six already read-only admin pages: users, market, controls, enterprises, economy and economy/scenario-lab. Preserve all their current read/search/limit behavior; import no JDBC/auth/business/scheduler services into admin-presentation. Existing actual role proof plus fixed loopback GET sources remains authoritative. Economy pages additionally require an exact approver role, as the old HTML does; superadmin alone is not a substitute. This yields eight consistent routes with existing dashboard/logs, not all website pages.

For other routes, preserve working actions while migrating families to shared Spring templates after their actual API, role/CSRF/idempotency and error-state contracts are known. Do not replace those pages by generic read-only tables, old HTML wrappers or false healthy values. Existing 290 classpath HTML resources are not290 accepted live routes.

## Current stage
- New validated table models retain canonical integer strings. Display formatting groups decimal digits without numeric conversion.
- Member GET search is limited to the requested1–200 source rows, explicitly not a sitewide search. q is bounded80 characters; preserve drafts during locale changes.
- Stock/feature/catalog/reconciliation reads validate actual DTO fields before presenting data. Missing/malformed/unauthorized source is not zero. Reconciliation unavailable remains unverified and503.
- Same favicon, desktop sidebar, header, mobile drawer/bottom tabs, support launcher, status/card/form/table/focus/reduced-motion behavior and route-aware active navigation.
- Copy uses five-language server/client catalogs. Source names and policy reasons remain source text; do not translate them into invented financial meaning.
- No new dependencies, DB changes, role grants, sessions, balances, mutations or backend executable rollout.

## Acceptance
Real HTTP RED/GREEN fixtures serialize actual DTOs, verify role and source boundaries, huge money, escaped hostile text, search limits and missing/unverified sources. Full Spring/native Node and applicable CI must pass. Exact-main CI artifact must pass protected same-origin Test and actual authenticated desktop/mobile/locale interactions before coordinated scoped promotion. Retain old public/API/financial authority and rollback; no source identity relabel.

## Deferred route families (still part of full goal)
Remaining admin actions/exported pages, member wallet/market/shop/community/quests/account, public/legal/tool families, signed-in header and denied account/support/chat paths require independently verified conversion. The route ledger must show the remaining coverage and defects explicitly.

## Builder check
Independent read-only source review confirmed the six-route boundary and exact approver requirement. StaticHtmlAliasController only owns two redirects; SpaWebMvcConfig serves independent exported HTML, so global CSS replacement or inserting foreign DOM could break hydration and actions. This stage follows the approved common design without claiming whole-site completion.
