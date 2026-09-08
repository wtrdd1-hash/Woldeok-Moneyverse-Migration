# Product expansion planning sync — 2026-09-09

## Scope
Expanded the living product plan with prioritized product requirements based on the current virtual-economy architecture and public-service needs.

## Added
- P0 stock detail hub, watchlist, public SEO, admin observability and audit log requirements.
- P1 stock-linked community, comparison, condition alerts, event calendar and account security center.
- P2 personal dashboard, portfolio analysis and bounded AI summarization.
- P3 long-term analytics/external-data guardrails.
- Cross-cutting accessibility, responsive, observability, authorization, consistency, staged rollout and documentation-sync gates.

## Safety / architecture constraints retained
- WLD and stocks remain virtual service-internal assets.
- Value-moving operations retain ledger, transaction, idempotency and integer-string contracts.
- Secrets must never enter audit logs.
- AI output does not determine economic outcomes.
- `main` remains untouched until test-environment validation succeeds.

## Status
Documentation/planning change only. No production code or deployment changed in this work item.

## Implementation progress — Watchlist P0
- Added member-owned stock watchlist storage with no direct application-role table privileges.
- Added SECURITY DEFINER read/write functions scoped to the authenticated actor.
- Added NestJS watchlist GET/set endpoints behind session/consent and CSRF on writes.
- Added Next.js server action and responsive stock-card watch toggle.
- This remains on the feature branch until automated checks and test-environment validation pass.

### Test environment recovery
- Added a branch-scoped GitHub Actions image builder for the isolated test stack only.
- Test images bake `https://test.easy-scraping.com`, indexing disabled and ads disabled.
- This workflow never deploys production and does not run on `main`.

### Dependency security gate
- CI surfaced three high-severity Multer 2.2.0 denial-of-service advisories at the final production dependency audit.
- Added a workspace override requiring Multer >= 2.3.0 and regenerated the lockfile.
- Local `pnpm audit --prod --audit-level=high` reports no known vulnerabilities after the override.
