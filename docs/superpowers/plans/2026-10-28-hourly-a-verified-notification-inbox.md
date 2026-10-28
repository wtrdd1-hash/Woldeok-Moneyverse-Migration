# Verified member notification inbox — A1425 implementation plan
Authority: origin/main a28bed9aa40ff74d492824ae12892a7d52132fdd, AGENTS, README, EN/KO plans, QA v1342, planning issue #1693.
Scope: replace fabricated six notification rows with real member-only server data, stable DB category/offset filtering, explicit server-confirmed read, honest failures, no WLD claims. Android existing notifications gateway remains same backend contract.
Constraints: existing in_app_notifications DDL is not tracked; migration 291 reserved by PR #1689, so do not introduce colliding migration. No production/dev DB writes, no table grants, no ledger edits; P0 direct DML and schema provenance remain release blockers.
TDD tasks:
1. RED BFF category/offset invalid-param and forwarding tests, backend service SQL owner filter/order tests, UI no-mock and fail-closed tests.
2. GREEN server category allowlist and bounded offset; deterministic (created_at DESC,id DESC) DB filtering before LIMIT, owner parameter bound; private no-store responses; app-api group regression.
3. GREEN real client inbox, validated server response, load older, retry, mark one and mark-all only after verified receipt, no stale response after filter/unmount.
4. Recheck latest main and EN/KO plans, lint/typecheck/build/unit/integration/isolated PG/CI/security/a11y/SEO/app-api. Draft PR only; exact-SHA official Test/Production HOLD if gate not proven.
