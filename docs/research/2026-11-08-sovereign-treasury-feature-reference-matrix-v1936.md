# v2026.11.08.1936 — Sovereign Treasury / Central Bank / Mint Detailed Reference-to-Feature Matrix

**English canonical** | [한국어](2026-11-08-sovereign-treasury-feature-reference-matrix-v1936.ko.md)
**Research checked:** 2026-11-08 KST; verified source landing pages/official organizations. References are analogies for a **fictional WLD game economy**, not a representation that Moneyverse is a regulated bank, the Republic of Korea, or operates real-world money.
**Prior research:** [v1912 EN matrix](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/docs/treasury-sovereign-design-v1912-20261107/docs/research/2026-11-07-sovereign-treasury-reference-matrix-v1912.md). The following expands it rather than replacing or changing product authority.

| ID | Verified primary source / jurisdiction | Specific pattern to adapt | Proposed Moneyverse features | Boundary / caution |
|---|---|---|---|---|
| R01 | [Korea Fiscal Information Service dBrain+](https://www.fis.kr/ko/major_biz/dbrain_oper/intro) | Budget→revenue/expense→asset/debt→closing→performance cycle | TR-02/03/04/11 fiscal lifecycle, reports | No claim of government integration |
| R02 | [Korea dBrain+ integrated functions](https://fis.kr/ko/major_biz/dbrain_oper/main_func/basic) | Central data, collection, spending, forecasting, accounting | TR-01 unified fiscal views; approved appropriations | Distinguish appropriation from cash |
| R03 | [IMF TSA essential tool](https://www.imf.org/en/publications/tnm/issues/2016/12/31/treasury-single-account-an-essential-tool-for-government-cash-management-25188) | Treasury Single Account (TSA), cash consolidation | TR-01 one verified TREASURY cash account; logical sub-vaults | Never duplicate balances as money authorities |
| R04 | [IMF TSA detailed paper](https://www.elibrary.imf.org/view/journals/001/2010/143/article-A001-en.xml) | Unified fund visibility, separation of payments from cash mgmt | TR-03 daily cash forecast, encumbrances, sweep | Virtual vaults are budgets/projections |
| R05 | [IMF GFSM 2014](https://www.imf.org/external/np/sta/gfsm/index.htm) | Classify revenue, expense, capital transactions, debt | TR-04 fiscal classification and period close | WLD metrics are simulated |
| R06 | [IMF Fiscal Transparency Code](https://www.imf.org/en/topics/fiscal-policies/fiscal-transparency) | Fiscal report/forecast/risk/resource disclosure | TR-11 fiscal public portal, verified/unknown evidence | Private beneficiaries redacted |
| R07 | [PEFA framework / seven pillars](https://www.pefa.org/resources/) | Budget reliability, asset/liability, accounting, audit | TR-12 fiscal control scorecard, audit milestones | Framework guidance not certification |
| R08 | [World Bank BOOST budget portal](https://www.worldbank.org/en/programs/boost-portal/about-boost) | Detailed, discoverable public spending | TR-11 program-level spending explorer | Aggregate only, owner privacy |
| R09 | [OECD Recommendation on Budgetary Governance](https://legalinstruments.oecd.org/public/doc/319/body-text.en.html) | Fiscal ceilings, medium-term budgeting | TR-02 annual plan, budget cap, scenario modeling | Not Korean legal authority |
| R10 | [IMF PIMA framework](https://infrastructuregovern.imf.org/content/PIMA/Home/PimaTool/What-is-PIMA.html) | Plan/allocate/implement investment | TR-10 project procurement milestone control | Project completion ≠ paid settlement |
| R11 | [IMF PIMA Handbook](https://infrastructuregovern.imf.org/content/PIMA/Home/PimaTool/PIMA-Handbook/PIMAHandbook.html) | Design vs actual effectiveness | TR-10 implementation-evidence KPIs | Distinguish planned from implemented |
| R12 | [Bank of Korea monetary policy principles](https://www.bok.or.kr/eng/main/contents.do?menuNo=400001) | Base rate, market ops, lending, reserve ratio | CB-01/02 policy and decision rationale | Central Bank ≠ Treasury spend |
| R13 | [Bank of Korea open market operations](https://www.bok.or.kr/eng/main/contents.do?menuNo=400499) | Securities operations inject/drain liquidity | CB-03 bounded liquidity facilities / risk previews | Never create WLD by just updating bank balances |
| R14 | [Bank of Korea reserve requirements](https://www.bok.or.kr/eng/main/contents.do?menuNo=400029) | Reserve/liquidity ratios | CB-04 commercial bank reserve scenario | Simulated parameters versioned |
| R15 | [BOK-Wire+ settlement](https://www.bok.or.kr/portal/main/contents.do?menuNo=200727) | RTGS/hybrid settlement finality | FI-02 finality and transfer status | Moneyverse does not connect to BOK-Wire+ |
| R16 | [BOK payment systems](https://www.bok.or.kr/eng/main/contents.do?menuNo=400045) | DvP and PvP, market settlement | FI-03 bond-versus-cash atomic settlement | No real FX settlement |
| R17 | [Korea Mint KOMSCO](https://www.koreamint.com/etc/page.do?idx=2) | Production distinct from currency issuance policy | MT-01/02 policy order vs Mint execution and certificate | Mint cannot invent funding |
| R18 | [BIS CPMI-IOSCO PFMI](https://www.bis.org/committees/cpmi/pfmi/overview) | Finality, settlement risk, custody, operations | FI-01 through FI-08 canonical ledger, controls | Adapt in-game; no formal PFMI certification |
| R19 | [ISO 20022 financial message methodology](https://www.iso20022.org/about-iso-20022) | Consistent payment message semantics | FI-04 versioned receipt/event schema | XML not mandatory for internal JSON |
| R20 | [U.S. TreasuryDirect auctions](https://treasurydirect.gov/auctions/how-auctions-work/) | Announce→bid→award→issue | BD-01 bond issuance/auction lifecycle | In-game securities only |
| R21 | [U.S. TreasuryDirect marketable FAQs](https://www.treasurydirect.gov/help-center/marketable-faqs/) | Competitive/noncompetitive orders, maturity terms | BD-02 bid validation/coupon/maturity calendar | Avoid bond deposits conflation |
| R22 | [U.S. Monthly Treasury Statement](https://fiscal.treasury.gov/accounting/monthly-treasury-statement) | Receipts/outlays/deficit/financing monthly | TR-11 cash reporting | Not an accrual GAAP template |
| R23 | [World Bank DeMPA](https://www.worldbank.org/en/programs/debt-toolkit/dempa) | Sovereign debt cost/risk, records, cash forecasts | BD-03 debt management office dashboard | Risk budgets, no arbitrary auto-borrow |
| R24 | [IMF-World Bank MTDS](https://www.imf.org/en/capacity-development/training/icdtc/schedule/ol/2026/mtdsxol26-186) | Debt strategy stress/tenor analysis | BD-04 maturity ladder/stress tests | Stress model is forecast, not fact |
| R25 | [NBIM GPFG investment mandate](https://www.nbim.no/en/about-us/about-the-fund/governance-structure/executive-board-documents/investment-mandate---government-pension-fund-global/) | Benchmark, risk constraints, delegation | SW-01/02 sovereign fund mandate/risk budgets | Invested AUM ≠ spendable Treasury cash |
| R26 | [NBIM GPFG strategy](https://www.nbim.no/en/news-and-insights/strategy-for-the-fund-management/strategy-28/) | Rebalance based on explicit benchmark thresholds | SW-03 rule-governed rebalancing & drift | No fictitious dividend |
| R27 | [NBIM responsible management policy](https://www.nbim.no/en/about-us/about-the-fund/governance-structure/policies/responsible-investment-management/) | Long-horizon risk and disclosure | SW-04 performance, exclusions, concentration | Do not hardcode Norway asset weights |
| R28 | [Korea National Pension investment management](https://fund.nps.or.kr/eng/main.do) | Fund allocation and multi-year targets | NP-01/02 funded contributions, investment disclosure | Not real pensions |
| R29 | [Korea NPS governance](https://fund.nps.or.kr/eng/aboutus/govm/getOHFB0004M0.do) | Policy maker vs investment operator | NP-03 pension liability and fund split | Treasury grants cannot masquerade as earned return |
| R30 | [U.S. FDIC Deposit Insurance Fund](https://www.fdic.gov/resources/deposit-insurance/deposit-insurance-fund) | Premium-funded DIF and failure resolution | DI-01/02 premium, guarantee, resolution queue | Reserve fund must be prefunded |
| R31 | [U.S. FDIC deposit insurance guide](https://www.fdic.gov/resources/deposit-insurance/understanding-deposit-insurance) | Coverage conditions and category limits | DI-03 per-owner/per-bank cap simulation | Do not use U.S. numeric cap as WLD default |
| R32 | [U.S. Treasury payment integrity / Do Not Pay](https://fiscal.treasury.gov/payment-integrity/do-not-pay-dnp/about) | Pre-award identity/eligibility check | GR-02 duplicate/recipient eligibility screening | Never collect real national IDs |
| R33 | [U.S. Do Not Pay workflow integration](https://fiscal.treasury.gov/payment-integrity/do-not-pay-dnp/step-4-workflow-integration) | Batch screening, exception review and periodic checks | GR-04 safe approval/review/appeal | Risk scoring advisory, not auto-denial |
| R34 | [Open Contracting Data Standard](https://standard.open-contracting.org/latest/en/) | Tender→award→contract→implementation disclosures | TR-10 procurement/project milestone reports | Simulated procurement; redact identities |
| R35 | [BIS CBDC system design](https://www.bis.org/publications/central-bank-digital-currencies-system-design) | Privacy, cyber, offline, POS design criteria | CB-05 future CBDC simulation model | No actual CBDC/fiat wallet |
| R36 | [BIS Project Polaris offline CBDC handbook](https://www.bis.org/publications/project-polaris-handbook-offline-payments-cbdc) | Offline double-spend/replay threat modeling | CB-06 offline sandbox only, no spendable offline WLD | Defer until strict device/ledger proofs |
| R37 | [World Bank fiscal risk toolkit](https://www.worldbank.org/en/programs/debt-toolkit/fiscal-risk) | SOE guarantees and contingent liabilities | SO-03 public enterprise credit/risk dashboard | Distinguish projected vs realized profits |
| R38 | [World Bank FSAP](https://www.worldbank.org/en/programs/financial-sector-assessment-program) | Financial-sector stress and solvency | BK-03 bank stress/contagion scenarios | Simulated scoring, not regulatory assessment |
| R39 | [IMF PIMA independent 2026 assessment](https://www.imf.org/en/publications/tnm/issues/2026/08/05/internal-evaluation-of-public-investment-management-assessment-capacity-development-574916) | Evaluate practical effectiveness, not only design | QA-04 audit impact/outcome reviews | Do not assert real-world certification |

## Pattern synthesis

1. **One money authority:** IMF TSA/BO K settlement/PFMI → one immutable ledger and reconciled Treasury account; subordinate vaults are allocation/projection.
2. **Fiscal vs monetary:** BOK monetary authority + KOMSCO execution + Treasury fiscal control → policy orders must have controlled envelopes; a SOE dividend **must be funded from the SOE's actual assets**, never from MINT by mere bookkeeping.
3. **Public spending chain:** dBrain+/PIMA/OCDS → policy program, appropriation, commitment, verified beneficiary, funds reserve, atomic payment, financial receipt, project milestone, recovery, period close.
4. **Yield vs cash:** NBIM/NPS/FDIC/DeMPA → investment price snapshots and actuarial promises are **not cash**, and benefit/insurance obligations require segregated funded assets.
5. **Safety:** PFMI/ISO20022/Do Not Pay → exactly-once, event schema, before-payment controls, exceptional state, operator-owned audit and restoration. Failure to prove is UNKNOWN/HOLD, never synthetic zero.

## Source discipline

All linked pages were located by web search on 2026-11-08. Some institutions publish data for particular fiscal years or constantly update websites; this document uses **stable institutional design practices**, not scraped current financial figures. Prior v1912 source matrix remains a proposal.
