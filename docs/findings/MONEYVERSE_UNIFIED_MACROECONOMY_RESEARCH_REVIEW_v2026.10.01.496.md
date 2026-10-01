# Moneyverse Unified Macroeconomy Research Review — v2026.10.01.496

> Date: 2026-10-01
> Status: RESEARCH / DESIGN INPUT — not runtime authority
> Base: `origin/main@2bad12eb290cba6b98d08604cd6b1274243e1a4f`
> Parent: v2026.10.01.495 single-treasury/social-tax-recirculation design
> Korean counterpart: [MONEYVERSE_UNIFIED_MACROECONOMY_RESEARCH_REVIEW_v2026.10.01.496.ko.md](MONEYVERSE_UNIFIED_MACROECONOMY_RESEARCH_REVIEW_v2026.10.01.496.ko.md)

## 1. Research objective

The review asks one architectural question: **what must change for Moneyverse to behave like one coherent simulated economy rather than a collection of independent faucets, sinks, taxes, banks, markets and rewards?**

The target is not a literal clone of a national economy. Moneyverse remains a non-redeemable, game-only virtual economy. We adopt real-world accounting identities, sector boundaries, fiscal/monetary transmission concepts, market-integrity practices and public-finance controls only where they improve internal consistency, auditability and gameplay.

The review combines:
- the existing 31,289-candidate Moneyverse economy research corpus and prior focused reviews;
- current repository planning/runtime-document evidence;
- current or authoritative primary material from the UN SNA, IMF, BIS, ECB, Bank of England, Federal Reserve, World Bank, OECD, SEC and EVE Online Economic Council.

## 2. Evidence hierarchy

**Tier A — direct architecture evidence:** international macro-accounting standards, central-bank/public-finance technical material, current regulator or first-party game-economic reports.

**Tier B — adaptation evidence:** empirical research and official policy studies whose mechanisms are useful but must be simplified for a game economy.

**Tier C — discovery only:** broad papers, secondary summaries, community explanations and analogy. These can generate hypotheses but do not set Moneyverse policy.

External evidence never overrides Moneyverse ledger truth, user-safety constraints, non-redeemability or measured in-service telemetry.
## 3. Finding A — the economy needs sector accounts, not feature-local accounting

The UN System of National Accounts describes an integrated macro framework that separates non-financial corporations, financial corporations, government, households and the rest of the world while recording production, income, transfers, saving, investment and financial flows consistently.

The Federal Reserve's 2026 Financial Accounts similarly publishes sector balance sheets and a sources/uses matrix in which financial sources and uses reconcile across sectors.

**Moneyverse adoption:**
- households/members;
- non-financial businesses;
- depository bank(s);
- Treasury/general government;
- Moneyverse Monetary Authority;
- external/NPC world sector;
- exchange/market infrastructure as an operator, not an unexplained money source.

Every WLD flow must identify source sector, destination sector, economic purpose, instrument and whether total money changes. “System paid” is not a sufficient accounting source.

## 4. Finding B — one treasury account plus accounting subledgers is the correct public-cash model

IMF Treasury Single Account work defines a TSA as a unified structure giving a consolidated view of government cash. It explicitly distinguishes **cash management from accounting control**: transaction purpose is tracked in the accounting system rather than by holding cash in many purpose-specific bank accounts.

**Moneyverse adoption:**
- one spendable `TREASURY_MAIN` WLD account;
- welfare, infrastructure, emergency, dividends and stabilization are budget envelopes/commitments;
- no independently spendable welfare/infra/emergency vaults;
- complete receipt/payment reconciliation and forward cash planning.

This directly reinforces v495.

## 5. Finding C — tax and transfers should stabilize and redistribute, not silently destroy money

IMF and OECD material describes automatic stabilizers as taxes and transfers that move with the economic cycle: tax receipts fall and transfers rise in downturns, then reverse as conditions improve. IMF work also stresses that the composition, timing and reversibility of discretionary fiscal support matter.

**Moneyverse adoption:**
- all `TAX_*` enters `TREASURY_MAIN` 100%, net of explicit reversals;
- no tax-to-burn path;
- progressive or targeted tax/transfer designs can be tested as stabilizers;
- downturn triggers may increase welfare/public-work budgets while tax burden falls automatically;
- temporary support carries expiry/reevaluation rules and cannot become an irreversible permanent faucet.

Tax rates remain simulation hypotheses until Moneyverse data validates them.
## 6. Finding D — public spending quality matters more than merely spending the treasury down

The IMF 2025 Fiscal Monitor and World Bank 2026 work emphasize spending composition, public-investment efficiency, predictable budget execution, infrastructure quality and institutional controls.

**Moneyverse adoption:**
- public spending must have a classified outcome: essential recovery, income stabilization, employment, infrastructure/productivity, community service, market stabilization or event/public good;
- public projects use milestones, procurement rules, delivery evidence, maintenance cost and measurable benefit;
- infrastructure can reduce logistics friction or unlock capacity only through bounded, versioned effects;
- a treasury-recirculation target cannot force low-value spending just to hit a ratio.

The Tax Recirculation Ratio remains an observability/operating target, not a requirement to spend wastefully.

## 7. Finding E — bank credit should be modeled as balance-sheet credit creation

Bank of England research explains that commercial-bank lending creates a matching bank deposit rather than merely relending an existing saver deposit. Principal repayment reverses this balance-sheet expansion. ECB/BIS evidence shows monetary-policy changes transmit through bank funding, lending rates, credit supply and borrower demand.

**Moneyverse adoption:**
- a bank loan is neither an unexplained faucet nor a Treasury transfer by default;
- loan origination creates a bank loan asset and matching customer deposit liability;
- principal repayment contracts the corresponding credit-money position;
- interest transfers income to the bank; it does not count as principal destruction;
- default consumes provisions/capital and triggers resolution rules;
- policy rate, bank funding, capital/liquidity and borrower risk influence new credit.

This is a game accounting model; it is not a representation that Moneyverse is a real licensed bank.

## 8. Finding F — credit needs capital, liquidity and loss controls

Recent BIS/BCBS monitoring continues to treat risk-based capital, leverage and liquidity as separate safeguards. IMF macroprudential work supports releasable buffers that can absorb shocks and preserve lending.

**Moneyverse adoption:**
- bank capital, liquidity reserve, credit exposure and expected-loss metrics are distinct;
- credit growth has system/cohort risk envelopes;
- a countercyclical game-capital buffer may tighten in excessive credit booms and release in downturns;
- rate hikes must be stress-tested for delinquency/default effects;
- the old generic DeFi-style utilization kink is not the universal retail-credit authority.

## 9. Finding G — distribution changes policy effects

Federal Reserve HANK research and 2025 wealth-consumption evidence show that households differ materially by wealth, debt and marginal propensity to consume.

**Moneyverse adoption:**
- macro metrics are cohort-specific: new, low-liquidity, median, high-income and high-wealth;
- support and public-job policy targets game-state liquidity/income rather than blanket equal transfers;
- wealth concentration is not treated as equivalent to current spending pressure;
- returning wealthy/dormant accounts are modeled as demand shocks even when current faucet issuance is flat.

No real-world protected or sensitive attributes are required for this segmentation.
## 10. Finding H — social protection works better when connected to employment and opportunity

World Bank 2025–2026 work treats social protection, public works, employment services, skills and economic inclusion as complementary rather than cash-only instruments.

**Moneyverse adoption:**
- welfare prevents progression failure but is paired with optional public jobs, training, matching and business-entry support;
- public employment pays from Treasury and produces public/service output;
- private employment pays from the employer business;
- external/NPC contracts are explicitly classified as external-sector demand rather than generic “system faucet”;
- anti-smurf and related-account controls apply to benefits and public-job allocation.

## 11. Finding I — asset markets need price discovery and transparent liquidity

SEC market-structure material emphasizes price discovery, displayed liquidity, execution quality, fair access and transparency. It also warns that fragmentation and hidden liquidity can impair market quality.

**Moneyverse adoption:**
- WDX secondary prices use actual order-book supply/demand plus a bounded fundamental reference, not unconstrained random price writes;
- spread, depth, turnover, concentration, self-trade and wash/circular volume are first-class metrics;
- IPO cash goes to the issuing business; secondary trade cash goes buyer-to-seller;
- dividends come from distributable after-tax business cash/profit;
- market operator fees are income/treasury transfers unless an explicit monetary-retirement policy says otherwise.

Existing 10x leverage/short derivatives remain authority-drift/review-required until a margin, clearing, insurance-fund and loss-waterfall contract is approved.
## 12. Finding J — a mature game economy watches multiple dimensions at once

EVE Online's 2026 Monthly Economic Reports separately expose production/mining/destruction, faucets, money supply, active ISK delta, velocity and multiple price indices. Recent 2026 reports show these variables can move in different directions across months.

**Moneyverse adoption:**
- do not target “faucet = sink” as a single equilibrium condition;
- maintain CPI-like consumption baskets, producer/input indices and asset-price indices separately;
- observe money supply, dormant/active balances, credit, production, inventories, trade depth, item destruction and wealth distribution together;
- tag seasonality, launches, maintenance, abuse and data revisions before diagnosing inflation/deflation.

The existing Moneyverse v400/v401 research direction is retained and expanded into one macro model.

## 13. Finding K — true item scarcity and currency retirement are different policy tools

Prior Moneyverse research already found that transaction taxes/item sinks can have category-specific price effects. EVE similarly reports asset destruction separately from currency measures.

**Moneyverse adoption:**
- item over-supply is addressed by item destruction, consumption, depreciation or Treasury buyback of real listed items;
- tax WLD itself is not destroyed;
- routine service fees normally become income of Treasury, a bank, business or public enterprise;
- permanent WLD retirement is reserved for a separately named `MONETARY_RETIREMENT` operation authorized by monetary policy, never hidden inside “tax”.

## 14. Finding L — public debt must have an explicit funding and sustainability model

IMF 2025–2026 fiscal work highlights debt-service cost, fiscal space, interest-rate interaction and the need for credible medium-term frameworks.

**Moneyverse adoption:**
- Treasury bonds are liabilities of Treasury, not a free-yield faucet;
- bond purchase transfers WLD from investor to Treasury;
- coupon/principal service comes from Treasury cash and is budgeted;
- monitor debt service / revenue, debt / output, maturity concentration and rollover exposure;
- Monetary Authority emergency support, if ever permitted, is explicit, capped, audited and not routine deficit financing.
## 15. Current repository drift found by this review

The latest main documentation does not yet describe one coherent economy.

P0/P1 conflicts include:
1. `PROJECT_PLAN.md` historical marketplace-tax burn versus current 100% Treasury tax direction.
2. `APP_SPEC_AND_USER_GUIDE.md` property tax as a deflationary sink.
3. venture corporate revenue hard burn.
4. derivative liquidation value split partly to permanent burn.
5. club/territory “tax” routed directly outside the central Treasury.
6. many banking/business/job fees classified as hard sinks without a receiving economic sector.
7. bank loan principal treated as generic faucet or Treasury-funded transfer instead of a consistent credit-money model.
8. system-funded job/business revenue that lacks a macro funding sector.
9. virtual Treasury bonds whose interest source is not integrated with fiscal cash/debt accounting.
10. WDX/IPO/dividend implementation ahead of the older product-design restriction on leverage/margin/short products.
11. 100% stock-halt cost-basis protection without one clearly authoritative ex-ante guarantee-fund/backstop funding contract.
12. multi-vault Treasury runtime/history versus the approved v495 one-account architecture.

These are authority-drift findings, not permission to rewrite historical migrations or claim the runtime is already corrected.

## 16. Adopt / adapt / reject summary

### Direct adopt
- sector balance sheets and from-whom-to-whom flow accounting;
- single Treasury cash account + accounting subledgers;
- tax/transfer automatic-stabilizer concept;
- loan/deposit balance-sheet credit accounting;
- capital/liquidity/loss safeguards;
- cohort-specific distribution metrics;
- multi-index/multi-signal macro observability;
- public-spending efficiency and milestone evidence.

### Adapt for gameplay
- GDP becomes a “World Output” measure based only on measurable final production/consumption;
- unemployment becomes labor-slack/eligible-worker metrics because ordinary play is not real employment;
- central-bank policy becomes a fictional Monetary Authority with bounded policy actions;
- external trade becomes an explicit NPC/world sector to support a small population and early liquidity;
- government debt remains non-redeemable game debt.

### Reject as Moneyverse defaults
- one-dimensional faucet-minus-sink targeting;
- tax as currency destruction;
- feature-local money creation with no funding counterparty;
- guaranteed-yield business/stock/bond rewards;
- punitive debt traps or hidden rate changes;
- direct AI balance/price/tax/interest writes;
- real-finance claims, real credit scoring or cash-redemption implications.
## 17. Primary reference set

1. UN Statistics Division, **System of National Accounts 2025**, institutional sectors, flows/stocks and integrated accounts: https://unstats.un.org/unsd/nationalaccount/sna2025.asp
2. Federal Reserve, **Financial Accounts of the United States (Z.1), 2026:Q2 release**: https://www.federalreserve.gov/releases/z1/
3. IMF, Fainboim & Pattanayak, **Treasury Single Account: Concept, Design and Implementation Issues**: https://www.imf.org/en/publications/wp/issues/2016/12/31/treasury-single-account-concept-design-and-implementation-issues-23927
4. Bank of England, **Money creation in the modern economy**: https://www.bankofengland.co.uk/quarterly-bulletin/2014/q1/money-creation-in-the-modern-economy
5. ECB, **Transmission mechanism of monetary policy**: https://www.ecb.europa.eu/mopo/intro/transmission/html/index.en.html
6. BIS, **New forms of money and the transmission of monetary policy** (2026): https://www.bis.org/speeches/20260622-new-forms-money-and-transmission-monetary-policy
7. BCBS/BIS, **Basel III monitoring report** (2026): https://www.bis.org/publications/202609-qis-basel-iii-monitoring-report
8. IMF, **Fiscal Monitor April 2026 — Fiscal Policy under Pressure**: https://www.imf.org/en/publications/fm/issues/2026/04/15/fiscal-monitor-april-2026
9. IMF, **Fiscal Monitor October 2025 — Spending Smarter**: https://www.imf.org/en/publications/fm/issues/2025/10/07/fiscal-monitor-october-2025
10. OECD, **Automatic fiscal stabilisers: recent evolution and policy options**: https://www.oecd.org/en/publications/automatic-fiscal-stabilisers-recent-evolution-and-policy-options-to-boost-their-effectiveness_816b1b06-en.html
11. Federal Reserve, **HANK Comes of Age** (revised 2025): https://www.federalreserve.gov/econres/feds/hank-comes-of-age.htm
12. Federal Reserve, **Wealth Heterogeneity and Consumer Spending** (2025): https://www.federalreserve.gov/econres/notes/feds-notes/wealth-heterogeneity-and-consumer-spending-20250805.html
13. World Bank, **State of Social Protection Report 2025**: https://www.worldbank.org/en/topic/socialprotectionandjobs/publication/state-of-social-protection-2025-2-billion-person-challenge
14. World Bank, **Public Employment Services** (2026): https://www.worldbank.org/en/brief/2026/05/12/public-employment-services
15. World Bank, **The Quality of Budget Institutions and the Efficiency of Public Spending** (2026): https://documents.worldbank.org/en/publication/documents-reports/documentdetail/099060226153024717
16. SEC, **Equity market structure / price discovery principles**: https://www.sec.gov/newsroom/speeches-statements/us-equity-market-structure
17. EVE Online Economic Council, **2026 Monthly Economic Reports**: https://www.eveonline.com/news/category/monthly-economic-report

## 18. Research conclusion

The evidence supports a redesign around a **sector-based, stock-flow-consistent, ledger-reconciled virtual macroeconomy**.

The design should preserve Moneyverse's game character and unlimited-by-default participation while making every significant WLD source, use, asset, liability, tax, transfer, credit event and retirement economically attributable. Fiscal, monetary, credit, labor, business and asset-market policy should then operate on this common model rather than independently tuning unrelated feature-local faucets and sinks.
