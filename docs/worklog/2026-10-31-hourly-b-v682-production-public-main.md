# B v682 — Independent public Production/main SHA watch (DRAFT / HOLD)

QA v1410 observed public Production backend/frontend SHA `95485a299885693e3becb694dfc36ad45e832f97` while GitHub main was `761a55a094fb9dd383d213e817305e68c79fa23c`. Both public endpoints agreed, but the observed SHA was not on main. The existing host identity gate checks release-local agreement; this change adds independent public/main comparison.

`verify-production-public-main.mjs` checks HTTP 200, canonical 40-hex SHA, both endpoints matching GitHub main, and agreement between endpoints. Errors fail closed without printing member data. The existing read-only Auto Integrate and Promote inventory workflow runs this monitor on its existing schedule and manual dispatch. It uses the standard GitHub token for read-only main lookup, and adds no new scheduler, deploy or DB writes. A failure is an incident signal, not a rollback or a production fix.

**Release HOLD:** This is a candidate monitoring change only. A passing monitor does not establish executable provenance, isolated exact-SHA Test, GitOps approval, real authentication E2E, financial reconciliation or recovery. Existing P0 issue #2031 and QA v1410 remain open.
