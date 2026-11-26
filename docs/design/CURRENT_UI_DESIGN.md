# Current UI design authority — G2 Guild Ledger Terminal

**Authority: v2026.11.27.PLAN-AUDIT.2.** [한국어](CURRENT_UI_DESIGN.ko.md). Owner-confirmed administrator access denial (2026-11-27); G2 is the latest previously recorded approved design (2026-11-24). This is documentation and verification-tool reconciliation, not runtime acceptance.

## Binding implementation rules

1. Read [document authority](../DOCUMENT_AUTHORITY.md), [integrated master](../planning/INTEGRATED_PLANNING_MASTER.md), [UI/UX reference](../UI_UX_SINGLE_REFERENCE.md) and [manifest](CURRENT_UI_DESIGN_MANIFEST.json) at start and midpoint.
2. Use [G2 visual rules](game-ui-v2026.11.24.G2/README.md) and [180 route previews](game-ui-v2026.11.24.G2/routes/README.md) as the sole active visual reference. Route previews are archetype-based examples, not proof of distinct functional layouts or artistic acceptance. Review each route against its business requirements. The 13 core references define visual rules; use live API values only. Ledger strip, 6px hairline panels, violet action color, gold/Orbitron only for the member's own balance, tabular figures, grouped navigation, GM console restricted to admins. Actual favicon only.
3. New web presentation: Next.js/React/TypeScript/Tailwind and same-origin server-only BFF; Spring Boot owns identity, roles, session and business API; PostgreSQL restricted functions own ledger. Existing Spring MVC/Thymeleaf/static screens remain transitional until verified replacement. Preserve valid functionality, real data, EN default and KO second (JA/ZH/VI supported), mobile/desktop accessibility and approved security rules.
4. **Administrator access: deny by default.** Guests and ordinary members must not see any administrator navigation, dashboard, protected HTML, data, API, actions, cached/RSC payloads, socket subscriptions or search shortcuts. Server-side authorization is required at the BFF, Spring API and applicable socket/edge paths; hiding CSS is insufficient. Unauthenticated protected requests use appropriate login/401, authenticated non-admin requests 403 (or policy-defined non-disclosing 404); never return protected payloads. Public-safe content alone is guest-browsable; 180 design routes do not imply 180 public routes. Login is not administrator authorization.
5. Require role × route × locale × viewport QA, direct access and negative tests, live data and exact candidate Test before separately approved zero-downtime Production. Do not invent balances, dates or success. Images are not acceptance.

## Archived visual sets

G1, v2026.11.24.11 (v11), v2026.11.23.10 (v10), v2026.11.23.8 (v8) and v2026.11.18.12 (Nov18) are historical only, never implementation fallbacks. Preserve files and dated evidence. Superseded Spring-only frontend and all-route guest-access instructions do not apply, including historical automation prompts. Functional/security requirements remain binding where not superseded.

[Manifest](CURRENT_UI_DESIGN_MANIFEST.json) · [G2 route index](game-ui-v2026.11.24.G2/routes/README.md)
