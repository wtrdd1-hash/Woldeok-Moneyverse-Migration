# 🏛️ Bank of Korea FX Reserves, Seoul Foreign Exchange (FX) Market & Smoothing Operations Specification (v2026.10)

> **Documentation Governance**: [DOCUMENTATION_POLICY.md](DOCUMENTATION_POLICY.md)  
> **Top Planning Authority**: [MACRO_SOVEREIGN_ECONOMIC_SYSTEM_MASTER_SPEC.md](MACRO_SOVEREIGN_ECONOMIC_SYSTEM_MASTER_SPEC.md)  
> **Status**: **AUTHORITATIVE_PRODUCTION_INTEGRATED** (Officially modeled on real-world Bank of Korea and MOEF FX authorities)  
> **Snapshot Version**: `v2026.10.07`

---

## 1. Overview & Economic Benchmark

In the Republic of Korea's sovereign economy, the **Bank of Korea (BOK)** and the **Ministry of Economy and Finance (MOEF)** manage the nation's **Foreign Exchange Reserves** and the Foreign Exchange Stabilization Fund (FESF). Through the **Seoul Foreign Exchange Market (Seoul FX Market)**, they stabilize the exchange rate between the Korean Won (KRW) and the US Dollar (USD).

Woldeok Moneyverse benchmarks this system 1:1, introducing a real-time floating exchange rate regime and FX infrastructure between the **Virtual Global Reserve Currency (USD)** and **Woldeok Currency (WLD)**.

---

## 2. Four Core FX System Pillars

### ① BOK FX Reserves & Stabilization Fund
- **Initial Seed Reserves**: 1,000,000 USD held in the Central Bank Foreign Exchange Vault.
- **Prudential FX Indicator (BIS Standard)**: Real-time monitoring of external debt coverage ratios (>100%).
- **Treasury Linkage**: 0.2% transaction fee on all currency swaps remitted to the Central Treasury (`VAULT_MAIN`).

### ② Floating Exchange Rate & Macro Pulse Dynamic Engine
- **Anchor Parity**: 1 USD = 1,350.00 WLD.
- **Normal Fluctuation Band**: 1,300.00 WLD ~ 1,450.00 WLD.
- **Pulse Pricing Factors**: Virtual corporate trade balances, interest rate differentials (WLD 5.2% vs US Fed 4.5%), and live user order flow.

### ③ Central Bank Smoothing Operations
- **Dollar Selling Intervention (`SELL_USD_INTERVENTION`)**: When USD/WLD spikes above 1,420.00 WLD, the central bank sells USD into the market to absorb WLD and curb depreciation.
- **Dollar Buying Intervention (`BUY_USD_INTERVENTION`)**: When USD/WLD drops below 1,280.00 WLD, the central bank buys USD to reinforce reserves and protect corporate export profitability.
- **Verbal Interventions**: Official central bank public statements to calm speculative one-sided betting.

### ④ Public FX Portal (`/fx`) & USD Deposit Pockets
- **1-Second Instant Swap**: Seamless WLD ↔ USD bi-directional exchange with 0.2% fee.
- **USD Savings Pockets**: Earn 4.5% annual USD interest calculated hourly.
- **FX Hedging**: Hedge against domestic WLD inflation and capture currency appreciation.
