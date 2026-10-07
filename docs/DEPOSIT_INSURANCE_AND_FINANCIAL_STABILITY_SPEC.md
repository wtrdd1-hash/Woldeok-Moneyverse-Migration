# Korea Deposit Insurance Corporation (KDIC) 50M KRW Depositor Protection Act & Financial Stability Fund Specification (v119)

## 1. Executive Summary
This document specifies the technical and regulatory architecture of the Korea Deposit Insurance Corporation (KDIC) Depositor Protection Framework and the Financial Stability Fund within Woldeok Moneyverse, benchmarked against real-world Korean economic legislation (Depositor Protection Act, Financial Services Commission stability guidelines). It guarantees depositor funds up to 500,000 WLD (50M KRW equivalent) per customer and guards against bank runs through autonomous liquidity support and insurance payouts.

---

## 2. Core Regulatory Pillars

### 1) Statutory 500,000 WLD Protection Limit
- Principal plus interest protected up to 500,000 WLD per depositor across insured institutions.
- All eligible deposit products display the official "KDIC Protected Financial Product" badge.

### 2) Deposit Insurance Fund & Quarterly Premium Assessment
- Initial seed endowment of 10,000,000 WLD from the sovereign reserve.
- Insured financial institutions are assessed a statutory annual premium of 0.08% on average deposits.

### 3) Bank Run Prevention & Emergency Liquidity Facilities
- Real-time BIS capital adequacy ratio tracking: Healthy (>=10.5%), Watch (8.0~10.5%), Warning (6.0~8.0%), Emergency (<6.0%).
- Automated liquidity injections at 2.5% emergency interest to quell deposit withdrawal surges.

### 4) Subrogated Insurance Payouts (Direct Depositor Relief)
- In the event of bank insolvency, KDIC executes automated 1-second insurance payouts up to 500,000 WLD directly into users' cash accounts.
