# Wallet / bank deposit-withdrawal design and runtime audit

Version: v2026.11.23.1  
Date: 2026-11-23 KST  
Scope: read-only source/design/live HTTP verification; **no financial writes or deployment**  
Baseline: `9876c09888ec84034eec183cf1309c85df3d7447` (`main` verified before writing)  
Owner: ChatGPT (separate documentation branch; Gemini worktrees untouched)

## Work record

- **Start:** Re-read the integrated planning master, Nov 18 design authority, visual gallery README, banking product spec, Nov 21 QA and branch cleanliness. Inspect only the wallet/bank/savings-pot routes and their Spring/Next source. Do not mutate production member balances.
- **Checkpoint:** Compared the approved Nov 18 planning mockups, active Spring static/Thymeleaf pages, separate Next code, bank/wallet Java controllers and bank service. Re-checked `origin/main` at `9876c09888ec84034eec183cf1309c85df3d7447` prior to recording.
- **Finish:** Findings and acceptance criteria documented. No POST, no financial QA transaction, no code/DB change, no test deployment, no production promotion. Verification is therefore limited to source inspection and anonymous GET/HTTP checks.

## Distinguish concept, source and actual behavior

| Item | Evidence | Assessment |
|---|---|---|
| Nov 18 design | `docs/design/all-pages-v2026.11.18.12/previews/{wallet,bank,bank-savings-pot}.png`; gallery `README.md` declares PLANNING ONLY, synthetic data | All three concepts exist; images are **not functional evidence** |
| Spring `/wallet` source | `spring-backend/src/main/resources/static/wallet.html`, `templates/mv43/wallet.html`, `assets/mv43/wallet.js` | Cash + bank balance, P2P transfer, transactions; no user-facing bank deposit/withdraw form in inspected Spring wallet screens |
| Spring `/bank` source/live | `spring-backend/src/main/resources/static/bank.html`; anonymous GET /bank -> 200 on 2026-11-23 KST | Savings/term deposit marketing cards, account-opening link, simulator; no usable deposit/withdraw form in rendered public page |
| Separate Next bank code | `frontend/src/app/bank/bank-forms.tsx` `DepositWithdrawCard`, `actions.ts` `depositAction`/`withdrawAction` | Explicit deposit/withdraw forms and handlers exist as **source**; not proof they are active in Spring production |
| Bank savings-pot | Design mockup and `spring-backend/src/main/resources/static/bank/savings-pot.html` | A route/page exists, not proof of operational pocket funding or withdrawal |
| Anonymous wallet | GET /wallet -> 302 redirect to login | Protected page cannot be functionally verified without an authorized member session |
| Spring bank API | `BankController.java` GET /standing and POST /deposit, /withdraw | Endpoints exist but do **not** prove correct ledger movement or ownership authorization |
| Bank standing GET | Anonymous GET `/api/v1/bank/standing` -> 200 | Requires immediate authentication/response-data security review. No member data recorded in this audit |

## High-priority defects in current source (unverified production mutation)

**P0 - identity boundary:** Spring `BankController` derives the bank account owner from client-controlled `X-User-Id` and supplies a hard-coded fallback identity rather than enforcing the server session in its controller. Anonymous bank-standing HTTP 200 was observed. Do not treat this as an authenticated read. Review the complete edge/security chain before reopening financial endpoints.

**P0 - ledger correctness:** `BankService.deposit` writes to `bank_accounts` without a corresponding wallet debit or canonical double-entry transaction. `withdraw` reduces the bank balance (with `GREATEST(...,0)`) without paying cash back. Neither operation shows a verified balance-conservation path in this implementation.

**P0 - false-success handling:** Both methods swallow database exceptions and still return `success: true` with a newly generated receipt identifier. Standing data also falls back to sample numbers and rate. This must never be interpreted as a verified transaction or real balance.

**P1 - runtime/UI parity:** A Next.js deposit/withdraw form exists in the repo but the Spring `/bank` public page currently exposes promotional cards only; current Spring wallet screens are not integrated with bank deposit/withdraw actions. The Nov 18 design gallery is a mockup, not deployment acceptance evidence.

Historical Nov 21 QA recorded some bank/member routes as forbidden or unaccepted; the 2026-11-23 anonymous bank GET result reflects the newer observed external route, not proof of authenticated financial behavior.

## Required remediation and acceptance gates (proposed, NOT performed)

1. **Fail closed** until a verified session actor and ownership check, CSRF for writes, and request idempotency are enforced. Never trust caller-supplied user identity for banking.
2. Replace direct balance updates with the approved PostgreSQL canonical double-entry function, atomic wallet↔bank postings, insufficient-funds rejection, durable idempotent receipts, and consistent precise WLD amounts; prohibit success on any failed DB operation.
3. Unify the Nov 18 navy/violet responsive wallet/bank UI. Wallet quick actions should include **Deposit to bank** and **Withdraw to cash**, with verified balance changes, pending/failed/success states, receipts and history links; do not advertise unimplemented interest, rates or insurance as live.
4. Verify on isolated Test with two authorized test members, session/CSRF, ownership isolation, insufficient balances, duplicate requests, concurrent transfer, rollback, DB-ledger reconciliation, full route/auth failure states, 320px/390px/desktop layouts and EN-first + KO/JA/ZH/VI.
5. Only after full checks and documented owner release gate should a separately reviewed change be promoted without downtime. This audit authorizes no code, API, database or production changes.

## References

- Integrated priority: `docs/planning/INTEGRATED_PLANNING_MASTER.ko.md`
- Approved design: `docs/planning/NOV18_DESIGN_GLOBAL_I18N_CHAT_AUTHORITY_v2026.11.20.1.ko.md`
- Bank plan: `docs/planning/BANKING_FINANCIAL_SERVICES_SPEC.ko.md`
- Current earlier QA: `docs/qa/2026-11-21-all-functions-nov18-audit.ko.md`; `docs/qa/2026-11-21-live-frontend-after.ko.md`
