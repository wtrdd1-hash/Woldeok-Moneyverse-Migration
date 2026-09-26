# Korea Legal Compliance Audit — Moneyverse

**English canonical** | [한국어](KR_LEGAL_COMPLIANCE_AUDIT.ko.md)

> Version: v2026.09.26.443
> Status: PLANNING / LEGAL REVIEW REQUIRED
> Start `origin/main`: `6f025ced5239fc6bc8b365c31ad0fd59acf84dbc`
> Mid-work `origin/main`: `6f025ced5239fc6bc8b365c31ad0fd59acf84dbc`
> Runtime observed: Debian 13 Production backend/frontend active; `production-current=prod-v453`.

This is an engineering compliance audit, not a substitute for Korean legal, tax, or GRAC advice.

## Executive decision
Korea monetization is not ready for unrestricted activation. Advertising is already implemented and rendered on selected public Production pages. Real-money billing remains `UNVERIFIED`. Casino/chance has a P0 conflict: authoritative planning says Korea is BLOCKED until GRAC/rating + 19+ + legal/store evidence, while frontend source and the Production bundle contain affirmative compliance/regular-operation claims. No supporting certificate evidence was found.

## Findings
### KR-LGL-443-01 — P0 — Korea casino gate conflict
`PROJECT_PLAN.md` and `CASINO_GAME_SYSTEM_SPEC.md` require fail-closed Korea casino until rating/GRAC, 19+, legal and channel evidence. Source/Production bundle contains betting UI and strings including `GRAC-2026-REGULAR-OPEN`, regular real-bet operation and verification-passed claims. Database staking is WLD-only/no-cash-out, but that does not remove classification obligations. Required: KR must fail closed without authentic evidence; remove unsupported certification claims; direct API/server actions must not bypass.

### KR-LGL-443-02 — P0 — Business/tax gate for existing ads
Production HTML renders AdSense on `/`, `/announcements`, `/gallery`, `/board`. VAT Act Art. 8 requires business-registration application within 20 days from business commencement and permits pre-registration. Required: document actual business commencement and registration/tax status with a tax professional. Monetization expansion is blocked until verified. Never publish an unissued business number.

### KR-LGL-443-03 — P0 before real-money sales — e-commerce
Electronic Commerce Act Arts. 12/13/17 require applicable mail-order reporting, seller/transaction disclosures and withdrawal/refund controls, subject to statutory exceptions. Before paid digital goods/subscription/ad-removal: complete business identity, applicable report number, address/contact, total price/tax/renewal, order/receipt, withdrawal/refund/cancellation, digital-content exception handling, minor-contract notice and support.

### KR-LGL-443-04 — P1 — Age assurance mismatch
Terms/privacy require age 14+; implementation records user assertion `ageConfirmed=true`, not DOB/identity verification. PIPA Art. 22-2 governs consent-based processing of under-14 children. Describe assurance accurately, define suspected-under-14 restriction/deletion workflow and use stronger fail-closed assurance where a feature requires it. Casino has a separate 19+/rating gate.

### KR-LGL-443-05 — P1 — AdSense, behavioral ads, overseas transfer
AdSense has a default publisher ID and renders in Production. Privacy discloses Google advertising and overseas processing, but the exact Korea lawful-basis/vendor/CMP behavior was not runtime-proven. PIPA Art. 28-8 requires an applicable overseas-transfer basis and statutory information/controls. Maintain vendor/data maps, transfer basis and details, cookie/identifier inventory, contextual-vs-personalized policy and consent/opt-out evidence. KR personalized ads remain REVIEW_REQUIRED until passed.

### KR-LGL-443-06 — P1 — Commercial messaging
Current privacy copy says marketing receipt is not offered; no Korea marketing-consent ledger was established. Network Act Art. 50 generally requires prior express consent for commercial electronic messages, refusal/withdrawal handling and separate prior consent for 21:00–08:00 messages where applicable. Build purpose/channel-separated consent, suppression and audit before launch.

### KR-LGL-443-07 — P1 — Game classification is not only a store question
Game Industry Promotion Act Art. 21 generally requires classification before distribution/provision, subject to exceptions. Obtain a documented applicability/classification determination for the actual Korean web/app service and re-review material game/chance/monetization changes.

### KR-LGL-443-08 — P1 — Preserve no-cash-exchange boundary
Game Industry Promotion Act Art. 32 regulates business exchange/brokerage/re-purchase of specified game results/game money. Preserve no operator redemption, cash marketplace settlement, external-asset bridge, paid casino stake or other redeemability path without new legal review.

## Positive controls observed
Public Terms/Privacy exist; WLD is stated non-redeemable; consent is versioned/separated; consent guards exist; privacy/account-deletion surfaces exist; casino settlement is server-authoritative/idempotent and self-limit/self-exclusion exists. Safety controls are not legal approval.

## Release gates
1. KR ads: verified business/tax status + current privacy/overseas-transfer/ad-vendor evidence.
2. KR paid goods/subscription: KR-LGL-443-03 + provider/store receipt/webhook/refund tests.
3. KR casino/chance: BLOCK until authentic classification/rating + 19+ + legal/channel evidence; remove unsupported approval wording.
4. Marketing: BLOCK until consent/suppression system exists.
5. All gates are server-authoritative, versioned, audited and fail closed on missing/stale evidence.

## Evidence status
Repository/source inspection and selected Production ad rendering probes performed. Authenticated casino play was not performed. GRAC certificate/legal opinion, business registration, mail-order-sales report and tax filing were not proven from repository/runtime. No Production mutation, deployment or DB migration was performed.
