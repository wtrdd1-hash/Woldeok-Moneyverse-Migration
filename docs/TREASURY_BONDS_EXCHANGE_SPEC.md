# Woldeok Treasury Bonds (KTB) Exchange & Coupon Yields System Specification (v1.0)

> **BLOCKED YIELD/TIME CONTRACT — v542:** “1Y=24h” is a game-time label, not a real annualization contract. The stated hourly percentage (e.g. 4.5% APR vs 0.051%/h) is inconsistent for a 365-day real year. All yield/coupon/principal guarantees and automatic hourly payouts require an approved virtual-time mapping, formula, rounding/precision, funding and real-ledger/Test evidence. Purchases/coupons are fiscal transfers of existing WLD; shortages cannot mint silently.

## 1. Background & Objectives
- Establish an authoritative sovereign debt issuance and trading platform based on South Korea's KTB (Korea Treasury Bonds) and US TreasuryDirect standards.
- Sovereign issuance of short-term (1Y), medium-term (3Y), and long-term (5Y) treasury bonds backed by the central treasury (`VAULT_MAIN`).
- Periodic fixed coupon interest yields distributed to participating users automatically every hour.
- Proposed principal repayment at maturity is contingent on funded treasury liabilities and solvency checks; secondary-market liquidity and repayment are not guaranteed.
- Real-time Discord alerts delivered to operator DM (`886478189520637992`) on sovereign debt events.

## 2. Bond Offerings
1. **KTB-01Y**: Short-term Treasury Bond, 24h maturity, proposed 4.5% annual rate; hourly coupon BLOCKED until virtual-time formula approval, 10,000 WLD par.
2. **KTB-03Y**: Benchmark Medium-term Bond, 72h maturity, proposed 5.2% annual rate; hourly coupon BLOCKED until virtual-time formula approval, 50,000 WLD par.
3. **KTB-05Y**: Long-term Infrastructure Bond, 120h maturity, proposed 6.5% annual rate; hourly coupon BLOCKED until virtual-time formula approval, 100,000 WLD par.

## 3. Database Architecture (Migration 252)
- `treasury_bonds`: Catalog of sovereign bond issuances.
- `treasury_bond_holdings`: User bond holdings and accrued interest ledger.
- `treasury_bond_coupon_logs`: Audit logs for coupon distributions and redemptions.
- `treasury_bond_orders`: Secondary OTC and order book trading.
