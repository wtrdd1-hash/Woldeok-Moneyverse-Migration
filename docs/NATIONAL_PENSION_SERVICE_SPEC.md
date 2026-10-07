# Woldeok National Pension Service (NPS) & Social Security Fund Specification (v1.0)

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
