# Korea Deposit Insurance Corporation (KDIC) 50M KRW Depositor Protection Act & Financial Stability Fund Specification (v119)

> **2026-11-25 owner-confirmed branch candidate:** The existing500,000 WLD design cap applies per member per insured institution. This is virtual game compensation, not real KDIC/government insurance, KRW redemption or an official protection badge. Statutory-guarantee/instant-payout language in the historical real-world benchmark below is not a live contract; banking safety, funding and ledger/source holds govern. [Decision](planning/deltas/v2026.11.25.PLANREVIEW.1.md#planrev-dec-01--virtual-deposit-protection).

## 1. Executive Summary
This document specifies the technical and regulatory architecture of the Korea Deposit Insurance Corporation (KDIC) Depositor Protection Framework and the Financial Stability Fund within Woldeok Moneyverse, benchmarked against real-world Korean economic legislation (Depositor Protection Act, Financial Services Commission stability guidelines). It guarantees depositor funds up to 500,000 WLD (50M KRW equivalent) per customer and guards against bank runs through autonomous liquidity support and insurance payouts.

---

## 2. Core Regulatory Pillars

### 1) Statutory 500,000 WLD Protection Limit
- Principal plus interest protected up to 500,000 WLD per member per insured institution (owner-confirmed virtual-product scope; not statutory protection).
- All eligible deposit products display the official "KDIC Protected Financial Product" badge.

### 2) Deposit Insurance Fund & Quarterly Premium Assessment
- Initial seed endowment of 10,000,000 WLD from the sovereign reserve.
- Insured financial institutions are assessed a statutory annual premium of 0.08% on average deposits.

### 3) Bank Run Prevention & Emergency Liquidity Facilities
- Real-time BIS capital adequacy ratio tracking: Healthy (>=10.5%), Watch (8.0~10.5%), Warning (6.0~8.0%), Emergency (<6.0%).
- Automated liquidity injections at 2.5% emergency interest to quell deposit withdrawal surges.

### 4) Subrogated Insurance Payouts (Direct Depositor Relief)
- In the event of bank insolvency, KDIC executes automated 1-second insurance payouts up to 500,000 WLD directly into users' cash accounts.
