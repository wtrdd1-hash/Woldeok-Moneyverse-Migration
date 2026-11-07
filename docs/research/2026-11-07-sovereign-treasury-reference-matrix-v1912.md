# v2026.11.07.1912 — Official Sovereign Finance Research and Traceability Matrix

> English canonical | [한국어](2026-11-07-sovereign-treasury-reference-matrix-v1912.ko.md)
> Status: RESEARCH / DESIGN INPUT; not implementation or legal advice.
> Source review: 2026-11-07 KST. Official sources are institutional examples; neither Korean law nor foreign government policy directly governs Moneyverse virtual WLD.

## Source-to-feature map

| ID | Authoritative reference | Relevant operational practice | Planned Moneyverse adoption |
|---|---|---|---|
| R01 | [Bank of Korea — Treasury operations](https://www.bok.or.kr/portal/main/contents.do?menuNo=200014) | Cash receipt and payment authorization are distinct; government-bank reconciliation | Separate funding decision, settlement instruction and verified cash receipt |
| R02 | [Korea Fiscal Information Service — dBrain+](https://www.fis.kr/ko/major_biz/dbrain_oper/main_func) | Plan→budget→revenue/expenditure→closing, assets and performance | Budget hierarchy, commitment tracking and fiscal closing dashboards |
| R03 | [Bank of Korea — BOK-Wire+](https://www.bok.or.kr/portal/main/contents.do?menuNo=200727) | RTGS/hybrid settlement, finality and intraday liquidity | Finality state, queue, funded bank settlement and error isolation |
| R04 | [Bank of Korea — issuance versus manufacturing](https://www.bok.or.kr/portal/bbs/P0000547/view.do?depth=200387&menuNo=200387&nttId=10085714&oldMenuNo=201150&programType=newsData&relate=Y) | BOK is issuer; KOMSCO manufactures physical currency | MCB authorizes, Mint executes; graphics or physical token creation is not WLD issuance |
| R05 | [Korea Minting and Security Printing Corporation Act](https://www.law.go.kr/LSW/lsInfoP.do?ancYnChk=&chrClsCd=010202&efYd=20240517&lsiSeq=251085&urlMode=lsInfoP) | Currency/security-print production scope | Mint certificate provenance and executor-only role |
| R06 | [BOK monetary policy instruments](https://www.bok.or.kr/portal/main/contents.do?menuNo=201749) | Policy rate, open-market operations, loans and reserves | Policy scenario, liquidity and collateral models; no unlimited supply |
| R07 | [IMF — Treasury Single Account](https://www.imf.org/en/publications/wp/issues/2016/12/31/treasury-single-account-concept-design-and-implementation-issues-23927) | Consolidate public cash without fragmented balances | Consolidated Treasury liquidity view; purpose subledgers are not independent money |
| R08 | [IMF — GFSM 2014](https://www.imf.org/en/data/statistics/government-finance-statistics-manual/gfs) | Separate revenue, expenditure, financing, assets and liabilities | Bond sale is a liability-financing event, not tax income |
| R09 | [IMF — Fiscal Transparency Code](https://www.imf.org/en/topics/fiscal-policies/fiscal-transparency) | Timely fiscal reporting, forecast, budget and risk disclosure | Report funded, committed, forecast and unverifiable amounts separately |
| R10 | [BIS CPMI-IOSCO PFMI](https://www.bis.org/committees/cpmi/pfmi/overview) | Finality, monetary settlement, operational risk, audit and reliable recovery | DB finality, immutable receipts, ledger reconciliation, restore test |
| R11 | [BIS — CBDC system design (2024)](https://www.bis.org/publications/central-bank-digital-currencies-system-design) | Privacy, cyber resilience, offline and POS tradeoffs | Optional long-term research only; not claim WLD is state-backed CBDC |
| R12 | [BIS — Project Polaris](https://www.bis.org/publications/project-polaris-handbook-offline-payments-cbdc) | Offline payments need constraints, hardware safeguards and risk budgets | Do not permit offline value transfer until double-spend protection is proven |
| R13 | [Federal Reserve — Monetary policy tools](https://www.federalreserve.gov/monetarypolicy/policytools.htm) | Interest on reserves, open market operations, lending facilities | Policy simulations separate rate adjustment and funded issuance |
| R14 | [US TreasuryDirect — Auction process](https://treasurydirect.gov/auctions/) | Announce→bid→allocate→issue and secondary liquidity | Game bond workflow with actual principal settlement and maturity claims |
| R15 | [Norges Bank — GPFG asset manager](https://www.norges-bank.no/en/topics/liquidity-and-markets/investment-management/) | Mandate-driven portfolio management and reserves separation | Separate mark-to-market assets, realized cash, Treasury funding and mandate limits |
| R16 | [ISO 20022 — financial business model](https://www.iso20022.org/iso20022-repository/business-model) | Common meaning of transaction fields and standardized financial concepts | Canonical event identity, reason codes and receipt/status semantics |

## Critical differences and exclusions

- A Korean public fund is regulated state money; WLD is an in-game unit and no reference suggests Korean government sponsorship, real insurance or redemption.
- Korean BOK and KOMSCO make **issuance** and **manufacturing** different. Mint does not choose issuance policy, Treasury has no issue privilege.
- IMF TSA is consolidated *cash control*, not a license to treat forecasts, bonds, pension escrows or stock marks as immediately spendable cash.
- The Federal Reserve/BOK policy rate is not equivalent to a literal reward engine that inserts WLD; monetary and fiscal effects require legitimate journal legs.
- Norway GPFG asset valuation must not be counted as realized Treasury cash. A government bond subscription creates a government liability, not tax income.
- PFMI is a good safety design reference for a game settlement rail, not an assertion of formal compliance or an independently assessed RTO.
- ISO20022 offers message vocabulary; using similar fields does not certify an ISO20022 compliant production rail.
- Avoid the historical two-person approval and unauthorized monetary auto-top-up specified in some superseded Moneyverse prose.

## Evidence boundaries

Existing integration documents: docs/planning/PROJECT_PLAN.md, INTEGRATED_PLANNING_MASTER.md, CENTRAL_BANK_MINT_TREASURY_ECONOMY_CORE_SPEC.md, ADMIN_TREASURY_MANAGEMENT_SPEC.md, docs/architecture/TREASURY_CORE.md, FINANCE_INTEGRITY_CORE.md. GitHub main baseline 0b5b2b1 (2026-11-05). Read-only miniPC dev service status is not official Test/Production money proof. Proposed ideas remain DRAFT until product-authority adoption.

## Research priorities for follow-up

1. Compare existing Treasury vault and canonical account ownership with all possible member/bank/SWF/pension balances.
2. Obtain a current exact-SHA Production/Test provenance and full restored database consistency proof before categorizing any historical cash.
3. Verify real-source tax, SOE dividend, bond, pension and insurance payout classification and accounting for user-facing financial claims.
4. Validate web and Android presentation against those same receipts; never show planned amounts as settled.
