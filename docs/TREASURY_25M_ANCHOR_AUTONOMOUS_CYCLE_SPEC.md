# Autonomous Treasury 25M Anchor & Self-Balancing Economic Cycle Specification (v1.0)

## 1. Overview
The Autonomous Sovereign Wealth Fund (ASWF) and Macroeconomic Anchoring Engine maintain the central treasury vault (`VAULT_MAIN`) at exactly **25,000,000 WLD** at all times. 

Even in zero or low user activity periods, an autonomous macroeconomic simulation continuously circulates capital through automated investments, asset harvests, and corporate tax collections, ensuring the treasury neither inflates nor deflates ($\Delta \text{Treasury} = 0$).

## 2. Global Benchmarks
- **Chile Economic and Social Stabilization Fund (ESSF)**: Sovereign target reserve ceiling with automatic excess transfer to offshore equities/bonds, and automatic liquidation upon domestic deficit.
- **Singapore GIC & Temasek**: Systematic asset diversification across equities and fixed income with periodic Net Investment Returns Contribution (NIRC) return to the national balance sheet.
- **Alaska Permanent Fund (APF)**: Capital preservation invariant coupled with regular citizen dividend distributions.

## 3. Mathematical Invariant & Triggers
- **Target Reserve**: `25,000,000 WLD`
- **Surplus ($\Delta > 0$)**: 100% of the surplus above 25M WLD is automatically deployed:
  - 60% Equity purchases (WDX-TEC, WDX-FIN, WDX-BIO, WDX-RET)
  - 30% Sovereign Bond safe allocation
  - 10% Citizen universal dividend to active participants
- **Deficit ($\Delta < 0$)**: The deficit below 25M WLD is restored:
  - Step 1: Automated harvest & liquidation of accrued portfolio gains
  - Step 2: Automated corporate income and market transaction tax collection
- **Zero Drift**: `VAULT_MAIN` is anchored at 25,000,000 WLD upon every execution cycle.
