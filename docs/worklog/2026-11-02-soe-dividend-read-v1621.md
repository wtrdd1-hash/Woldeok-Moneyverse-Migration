# v2026.11.02.1621 — SOE administrator dividend-history read regression

## START (2026-11-02 KST)
- Main SHA: a8541927c3a351d980454c66e95a3356c47e0722. Independent branch; do not modify other agents' worktrees.
- Read canonical DOCS_INDEX, AGENTS, PROJECT_MEMORY, release instructions, and Treasury Core, v1611/v1613/v1618/v1620 histories.
- Operator screenshot shows SOE data load failure along with separate Treasury, Mint, Central Bank, pension and KDIC settlement holds.
- Source-level bug: migration 320 revoked app-role raw SELECT on state_enterprise_dividend_logs. EnterpriseRepository still reads that table directly; the admin enterprises page rejects the entire result if any of its four endpoints fails.
- Remedy scoped to nonmutating SOE history: new numbered SECURITY DEFINER function checks actor's current administrator role, bounded recent results, app EXECUTE only. No wider grants, financial data changes, issuance or release bypass.
- MiniPC health tool reports services active; miniPC remote shell was unavailable to this run. No authenticated live E2E or production fixes certified.

## MID / END
Source-only candidate committed: SQL324 scoped admin history read, backend actor forwarding, and regression fixtures. HTTP guard-double now attaches a synthetic session actor and asserts actor forwarding; tests still have NOT been run locally. Exact-SHA GitHub CI run 41418459376 was in progress at last check. Official Test and Production are unverified. No data or Production deployment occurred. HOLD.
