# Woldeok National Pension Service (NPS) & Social Security Fund Specification (v1.0)

> **CONDITIONAL DESIGN / NO UNFUNDED GUARANTEE — v542:** Lifetime payments and principal protection are proposed virtual-game rules only, not a verified sovereign guarantee. Require a funded-liability model, solvency/stress and reserve priority tests; do not mint for fiscal shortfalls. Older real-world benchmark descriptions do not imply legal equivalence or active Production performance.

> **Runtime truth / A1648 release HOLD (2026-10-25):** Migration 275 suspends pension contribution, liquidation and payouts pending balanced-ledger certification. Existing `national_pension_payout_logs` have no canonical transaction ID; member payout API records are `UNVERIFIED_LEDGER` with `ledgerTransactionId: null`, not proof of funds received. On isolated PostgreSQL the app role lacks SELECT on pension accounts and payout logs (SQLSTATE 42501), so the owner-read path remains BLOCKED until reviewed SECURITY DEFINER read functions are added in a collision-free forward-only migration. No Production or Test promotion is authorized.

> **Real-World Economic Standards**: Republic of Korea National Pension Act, Ministry of Health and Welfare, Singapore Central Provident Fund (CPF LIFE), US Social Security Administration (SSA).

---

## 1. Objectives & Benchmark Architecture
1. **Sovereign Capital Absorption & Compounding**:
   - Citizen contributions are directly credited to the Central Treasury (`VAULT_MAIN`), expanding the sovereign fund AUM for long-term compounding.
2. **Lifetime Hourly Annuity**:
   - Retirees receive guaranteed hourly disbursements yielding 7.0% ~ 10.5% annualized interest directly into their personal cash accounts.
3. **95% Principal Refund Guarantee**:
   - Emergency liquidation allows instant 95% cash withdrawal, with 5% donated to the state social welfare fund (`VAULT_WELFARE`).
4. **Administrative Telemetry**:
   - Real-time alerts dispatched to root admin (`886478189520637992`) via Discord REST API v10.
