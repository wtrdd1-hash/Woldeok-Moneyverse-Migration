# Treasury v690 — role-scoped admin overview and financial release hold

**English canonical · Source/isolated Test candidate, NOT PROMOTED.** [한국어](TREASURY_SAFE_ADMIN_GATES_v2026.10.15.690.ko.md)

Authority: PROJECT_PLAN → INTEGRATED_PLANNING_MASTER → Economy Core v523/v542 → prior v678–684. Preserve other agents' v686 onboarding plan.

The legacy admin overview queried protected fiscal tables directly and fails after migration 271. The economy Core Treasury payment account had 0 WLD while legacy fiscal MAIN displayed 186,138,444 WLD; these are different accounting layers with no verified backing bridge, NOT spendable proof. Earlier vault-vs-journal differences totalled 15,139,295 WLD. Never credit or overwrite balances to match.

**Implementation:** Migration 274 creates a purpose-scoped SECURITY DEFINER, operator-checked, read-only `treasury_admin_overview_snapshot(uuid)` with narrow app EXECUTE and revoked PUBLIC/raw table access; returns fiscal balances and 24h subsidiary movements marked UNVERIFIED. The server passes authenticated session actor, with available-to-spend withheld and fabricated budget allocations omitted. A route guard explicitly blocks 11 legacy inject/drain/dividend/subsidy/grant/allocation/burn/tax/SWF mutation HTTP endpoints with 503 until each gets genuine conserved settlement. App/PUBLIC raw EXECUTE for 8 underlying legacy fiscal SQL functions was independently found revoked by migration 271; do not regrant. v684 new donation remains OFF by default.

**Evidence:** TDD route guard 12 and overview source RED→GREEN; SQL274 applied only to independent restored Test `wdmv_treasury_v680`, operator call through app role permitted, nonoperator rejected, raw table reads still denied and test transaction rolled back. Backend 1,217 tests pass, 391 DB-dependent skipped; frontend 1,218 pass; backend typecheck/build, Next production Webpack build and release classifier 13 pass. Initial concurrent full backend run had unrelated SEO timeout; sequential rerun passed.

**NO-GO:** Registered approved economic policies absent, Core funding and historic fiscal discrepancies unproven, other Treasury bond/NPS/FX/stock disbursement SQL still need conserved idempotent flows, exact-SHA authenticated Test frontend/backend/DB and migration checksum parity, session/rollback/zero-downtime acceptance not done. Production code, schema and money must remain unchanged until those gates pass.
