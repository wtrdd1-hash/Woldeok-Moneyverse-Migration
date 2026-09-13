# Woldeok Moneyverse — Banking, Credit & Financial-Learning Safety Specification

> Version: v2026.09.13.13
> Status: Living implementation-oriented product specification
> Date: 2026-09-13
> Parent specs: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `PRODUCT_DESIGN_SPEC.md`, `DEFAULT_LIMIT_POLICY.md`, `ECONOMY_SINKS_SPEC.md`
> Korean counterpart: [BANKING_CREDIT_SAFETY_SPEC.ko.md](BANKING_CREDIT_SAFETY_SPEC.ko.md)

## 0. Purpose and product boundary

This specification turns Moneyverse banking, deposits, loans, repayment and virtual bonds into a buildable product contract. The system is a game-economy learning surface, not a real bank, deposit account, lender, security, investment product, credit-reporting service or cash-redemption service.

Every bank, loan, bond and savings surface must state that WLD and related balances are `virtual / simulated / game-only`. Do not use copy that implies FDIC/KDIC-style deposit protection, real APR returns, guaranteed yield, legal credit scoring, cash redemption, investment advice or a real-world loan offer.

If the product ever introduces real-money lending, cash-value deposits, redeemable assets, real credit underwriting or external financial products, this specification is insufficient and a separate legal/regulatory review is required before implementation.

## 1. Design principles

1. Teach budgeting, repayment and risk rather than rewarding debt volume.
2. Never make borrowing the optimal default path for ordinary progression.
3. Terms are server-authoritative, versioned and preserved for already-issued contracts.
4. Repayment, accrual and settlement are idempotent and ledger-backed.
5. No arbitrary daily borrow/play count cap is introduced. Credit exposure limits are permitted only as documented economy/integrity protection controls.
6. Avoid debt spirals: no compounding penalty loops that make recovery practically impossible.
7. Financial learning actions can grant XP, badges or cosmetics, but should not create disproportionate WLD faucets.
8. Marketing, ads or paid subscriptions cannot improve loan rates, approval probability, settlement priority or repayment economics.

## 2. Information architecture

Primary `/bank` tabs:

- **Overview** — liquid WLD, deposit balance, next accrual/settlement, active credit summary, one recommended safe action.
- **Savings** — simulated deposit product, accrual explanation, projected game-only interest, deposit/withdraw.
- **Credit** — eligibility explanation, available offers, total repayment preview, active loans.
- **Repay** — installment schedule, principal/fee split, early repayment, arrears/recovery options.
- **Virtual Bonds** — game-only fixed-term contracts with exact settlement preview.
- **Learning** — budgeting, debt-cost, diversification and repayment lessons.
- **History** — authoritative banking transaction history with filters and pagination.

Private banking routes require authentication and `noindex`. Public educational pages may be indexable only when they contain no account-specific information.

## 3. Savings / deposit model

### 3.1 State

Suggested account state:

`EMPTY -> FUNDED -> ACCRUING -> SETTLEMENT_DUE -> SETTLED`

Exceptional states:

`PAUSED_POLICY`, `LOCKED_SECURITY_REVIEW`, `MIGRATION_HOLD`.

A deposit/withdrawal that changes principal must update the accrual basis atomically. Newly deposited WLD must never receive interest for time elapsed before the deposit.

### 3.2 Interest contract

The server/database owns:

- `product_code`;
- `policy_version`;
- annualized display rate or equivalent game-rate basis;
- accrual method;
- settlement interval;
- minimum unit/rounding method;
- funding source classification;
- effective-from/effective-to timestamps.

Interest below one WLD accumulates as remainder; it must not be rounded into a free 1 WLD faucet on repeated claims.

### 3.3 Economy accounting

Deposit principal movement is normally a **hold/internal allocation**, not a hard sink. Interest paid by the system is a **faucet** and must appear in economy dashboards separately from job/quest issuance. Service fees, if intentionally burned, are **hard sinks**. Do not classify transfers between user wallet and deposit account as mint/burn.

## 4. Credit / loan product model

### 4.1 Eligibility

Eligibility is computed from game-only state such as:

- account/profession progression;
- verified activity history;
- prior Moneyverse repayment history;
- outstanding virtual obligations;
- business purpose/operating state where relevant;
- abuse/security restrictions;
- policy version.

Do not infer or request real-world income, bank balances, credit bureau data, employment documents or government IDs merely to improve a game credit score.

### 4.2 Offer contract

Each offer must include before confirmation:

- principal received;
- total scheduled repayment;
- game interest/service fee amount;
- number and timing of installments;
- maturity date/timezone;
- early repayment behavior;
- missed-payment behavior;
- whether collateral/game assets are involved;
- exact effect on future Moneyverse credit eligibility;
- `virtual/game-only` disclosure.

A percentage rate may be shown for learning, but it must not be presented as a real-world APR or regulated credit quote unless the product actually becomes regulated consumer credit and receives legal approval.

### 4.3 Credit exposure limits

The default-limit policy remains intact: there is no arbitrary limit on how many times a user may participate in normal gameplay. A credit ceiling is allowed only as an economy/integrity safeguard against uncontrolled money creation or impossible debt exposure.

Credit ceilings must be:

- documented as protection controls;
- server-side;
- policy-versioned;
- based on outstanding exposure and repayment capacity inside the game economy;
- visible/explainable to the user at a high level;
- not purchasable with real money or advertising engagement.

Prefer dynamic affordability/exposure rules over arbitrary `N loans per day` caps.

## 5. Repayment and arrears

### 5.1 Repayment allocation

Repayment order must be deterministic and disclosed. Suggested order:

1. due principal;
2. ordinary contractual game interest/service amount;
3. explicitly disclosed bounded arrears administration amount, if any.

Do not add hidden fees or recursively compound late penalties.

### 5.2 Early repayment

Users may repay early without a punitive fee by default. If a game-design fee is ever introduced, it requires a documented sink purpose and must not make staying in debt artificially preferable.

### 5.3 Recovery design

Missed payments should create recoverable gameplay, not a trap. Options can include:

- repayment-plan extension;
- temporary reduced installment;
- voluntary budget-learning mission;
- business restructuring path;
- clearly bounded administrative cost;
- temporary restriction on new credit while existing debt is unresolved.

Do not delete unrelated permanent cosmetics, achievements or collections because of loan arrears. Any collateral mechanic must be explicitly disclosed before issuance and separately reviewed.

## 6. Virtual bonds

Virtual bonds are fixed-term game contracts, not securities.

Required fields:

- `bond_product_code`;
- principal;
- term;
- settlement amount/formula;
- issue/maturity timestamps;
- policy version;
- funding/source account;
- status.

Suggested state machine:

`AVAILABLE -> PURCHASED -> ACTIVE -> MATURED -> SETTLED -> ARCHIVED`

Exceptional states: `CANCELLED_BEFORE_PURCHASE`, `SETTLEMENT_RETRY`, `SECURITY_HOLD`.

Existing purchased contracts retain their issue-time terms. Policy changes only affect new contracts unless an explicitly user-beneficial migration is separately documented and tested.

## 7. DB and ledger contract

Suggested tables/read models:

- `bank_products`;
- `bank_product_versions`;
- `bank_deposit_accounts`;
- `bank_accrual_state`;
- `credit_offers`;
- `loan_contracts`;
- `loan_installments`;
- `loan_repayments`;
- `virtual_bond_contracts`;
- `bank_transaction_read_model`;
- `bank_policy_audit`.

All WLD-moving mutations must use the authoritative PostgreSQL economy boundary and double-entry ledger. No application endpoint may directly rewrite wallet, deposit, loan or bond balances.

Every retryable mutation requires a stable idempotency key and payload-hash conflict detection. Replaying the same key returns the original result; the same key with materially different parameters is rejected.

Money values remain integer/string-safe across DB/API/UI; do not convert authoritative values into unsafe JavaScript `Number` representations.

## 8. API contract candidates

Read:

- `GET /api/bank/overview`
- `GET /api/bank/products`
- `GET /api/bank/loans`
- `GET /api/bank/loans/:id`
- `GET /api/bank/bonds`
- `GET /api/bank/history?cursor=...`

Mutations:

- `POST /api/bank/deposits`
- `POST /api/bank/withdrawals`
- `POST /api/bank/interest/settle`
- `POST /api/bank/credit/offers/:id/accept`
- `POST /api/bank/loans/:id/repay`
- `POST /api/bank/loans/:id/restructure`
- `POST /api/bank/bonds/:product/subscribe`
- `POST /api/bank/bonds/:id/settle`

Authorization must re-check actor ownership for every object identifier. Client-supplied `user_id`, price, rate, principal, fee, maturity or settlement amount is never authoritative.

## 9. UX states

Every major bank screen defines:

- default;
- loading/skeleton;
- empty/no-product;
- ineligible with explainable next steps;
- validation error;
- insufficient funds;
- stale offer/config changed;
- duplicate/idempotent replay;
- permission denied;
- offline;
- maintenance;
- security review hold;
- success receipt.

Forms preserve entered values across non-destructive refreshes. Administrator banking forms do not auto-refresh while operators are typing.

### Responsive behavior

Desktop: summary cards + schedule/history table + contextual side panel.

Tablet: two-column summary, collapsible details.

Mobile: tables become accessible cards; repayment CTA may be bottom-sticky but must not obscure disclosure text or keyboard focus. Confirmation screens must remain scrollable with the action visible only after material terms remain accessible.

## 10. Accessibility

- All forms have programmatic labels and inline error association.
- Status changes use restrained `aria-live` messaging.
- Due/overdue status is not communicated by color alone.
- Amounts and signs include text/symbol context.
- Charts have a tabular or textual equivalent.
- Focus returns to the initiating control after dialogs.
- Authentication and repayment flows remain keyboard operable and zoom-safe.

## 11. Learning-first progression

Banking mastery should reward comprehension rather than debt creation.

Examples:

- review a repayment schedule;
- identify principal vs fee/interest;
- complete a budgeting scenario;
- repay an installment on time;
- use an early-repayment simulator;
- compare borrowing vs saving in an isolated lesson;
- review why a loan became expensive;
- complete a recovery plan after a missed payment.

Do not award XP simply for taking more or larger loans.

## 12. Abuse and security

Priority cases:

- multi-account loan farming;
- borrow-transfer-abandon loops;
- repeated settlement/retry exploitation;
- race conditions between withdraw/repay/purchase;
- forged actor or loan IDs (BOLA);
- mass assignment of protected rate/status fields;
- compromised-account draining via withdrawal/repayment destinations;
- admin policy edits without audit/versioning.

Controls include actor-scoped DB functions, row locking/advisory locking where needed, idempotency, anomaly scoring, policy snapshots, security reauthentication for sensitive account changes and append-only audit evidence.

## 13. Economy sinks and faucets

Classify banking flows explicitly:

| Flow | Classification |
|---|---|
| wallet -> deposit | hold/internal allocation |
| deposit -> wallet | hold release/internal allocation |
| system-paid deposit interest | faucet |
| loan principal issuance | faucet or treasury-funded transfer, according to funding model |
| user loan repayment principal | transfer/treasury return unless intentionally removed |
| burned origination/service fee | hard sink |
| treasury-routed fee that can recirculate | transfer, not hard sink |
| virtual bond purchase principal | hold/transfer according to contract |
| bond maturity yield | faucet or treasury-funded transfer |

The economy dashboard must not count gross repayment volume as burn.

## 14. Analytics and KPI

Track at minimum:

- deposit adoption and median deposit size;
- deposit interest faucet amount;
- active loan principal;
- new credit issuance;
- repayment principal and fee split;
- on-time installment rate;
- early-repayment rate;
- restructuring/recovery rate;
- arrears incidence and cure rate;
- median/P95 debt-to-liquid-WLD ratio;
- repeat borrowing after full repayment;
- bank-related hard-sink contribution;
- failed/idempotent-replay rate;
- suspicious loan-farming rate and false-positive rate;
- learning-module completion;
- support/contact rate around terms.

Do not optimize for loan originations, debt outstanding or interest paid as primary success KPIs.

## 15. Admin and operations

Admin read models show product version, active contracts, aggregate exposure, accrual/settlement failures, suspicious clusters and reconciliation health.

Policy changes require:

1. proposal/reason;
2. affected new-contract preview;
3. economy simulation;
4. versioned configuration;
5. Test exact-SHA verification for runtime changes;
6. bounded rollout/monitoring;
7. rollback for new offers without rewriting historical contracts.

Operators may not edit an issued loan's principal/rate/maturity in place. Corrections use compensating transactions or a separately audited correction workflow.

## 16. Legal and policy boundaries

### United States

CFPB Regulation Z currently governs real consumer credit and requires clear/conspicuous disclosures in covered situations. Moneyverse must not describe its virtual loan UI as compliant consumer credit or a real APR product merely because it borrows disclosure patterns. If a future product becomes real consumer credit, `legal review required` applies before launch.

SEC/Investor.gov materials continue to caution against gamified nudges that push users toward more trading than their plan or comfort level. Moneyverse applies the same safety principle to virtual finance: no celebratory debt-confetti, loss-chasing prompts or repeated borrowing nudges.

### Republic of Korea

Moneyverse virtual loans are not represented as real 금융상품 or a real lender relationship. Any change involving cash redemption, real credit, external financial institutions, real-world creditworthiness or paid financial intermediation requires a fresh Korean financial-regulatory review before adoption.

Personalization based on bank/loan behavior remains subject to the platform's privacy/analytics/advertising consent design; account-specific financial-game state is never exposed on public/SEO pages.

## 17. Monetization rules

Allowed monetization near banking is limited to non-P2W cosmetics or general subscription benefits that do not alter financial outcomes.

Forbidden sales include:

- better loan approval for payment;
- lower interest/fees for watching ads;
- larger credit ceiling for subscription tier;
- priority settlement for paid users;
- hidden market/bank information sold to selected users;
- real-money purchase of debt forgiveness or competitive economic advantage.

Ads must not be placed beside borrow/repay/confirm CTAs in a way that encourages accidental clicks.

## 18. SEO

Indexable candidates:

- public educational guide to Moneyverse virtual banking;
- glossary pages explaining game-only principal, interest, repayment and virtual bonds;
- transparent feature/rules pages.

Always private/noindex:

- balances;
- eligibility;
- credit offers;
- repayment schedules;
- transaction history;
- user-specific learning results;
- admin/reconciliation tools.

Structured data must not describe Moneyverse as a real bank, lender, investment or financial product provider.

## 19. External evidence reviewed — 2026-09-13

### Directly adopted patterns

1. **CFPB — Regulation Z / Truth in Lending, current version, most recently amended 2026-04-08** (`consumerfinance.gov/rules-policy/regulations/1026/`).
   - Source type: U.S. regulator.
   - Takeaway: real consumer credit uses explicit disclosure requirements; Moneyverse adopts clarity patterns but does not claim regulated-credit status.
2. **Investor.gov — Saving and Investing for Military Personnel** (`investor.gov/militarybulletin`).
   - Source type: SEC investor-education resource.
   - Takeaway: investing-app gamified nudges can encourage excess trading; Moneyverse similarly avoids debt/trading-pressure mechanics.

### Reference-only engineering/safety patterns

3. **OWASP API Security Top 10 2023** (`owasp.org/API-Security/editions/2023/en/0x11-t10/`).
   - Source type: security industry standard guidance.
   - Takeaway: object-level and property-level authorization are mandatory for bank/loan object APIs; client-selected protected fields are rejected.
4. **PlayFab Economy V2 Items and Inventory Overview, updated 2026-02-24/25** (`learn.microsoft.com/.../economy-v2/inventory/items-and-inventory-overview`).
   - Source type: official game-platform documentation.
   - Takeaway: atomic inventory operations, transaction history and idempotency reinforce Moneyverse's ledger/retry design; PlayFab is reference-only and is not a required dependency.

## 20. Definition of Done

A banking/credit runtime slice is not complete until:

- game-only disclosures are visible at onboarding/offer/confirmation/history surfaces;
- no real financial-product claim is implied;
- all amounts use integer-safe server-authoritative values;
- deposit accrual cannot backdate newly deposited principal;
- repeated settlement/repayment requests are idempotent;
- issued contract terms are immutable/versioned;
- credit limits have a documented integrity/economy purpose rather than arbitrary play restriction;
- repayment/recovery avoids compounding trap mechanics;
- ledger reconciliation passes;
- actor/object authorization negative tests pass;
- accessibility/responsive/error states pass;
- analytics classify faucet/sink/transfer/hold correctly;
- English/Korean documentation is synchronized;
- runtime code follows development branch -> isolated Test -> backend/DB/API/UI validation -> Production.

## 21. Runtime reality status

At this planning pass, `https://easy-scraping.com` returned HTTP 530 to the available external check. Runtime verification is therefore **unavailable**. No assumption is made that current Production implements the banking states, UI or API contracts above.

## 22. Next implementation priority

1. Keep first-party authentication / Account Security Center as P0 security work.
2. Build an authoritative bank read model and product-version registry before expanding loan UX.
3. Add exact deposit accrual and loan repayment simulations/tests around boundary timestamps and duplicate requests.
4. Add bank UI states and learning-first repayment schedule preview.
5. Only after Test validation, expand credit products or virtual bonds.
