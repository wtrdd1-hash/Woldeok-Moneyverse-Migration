# F675-03 — WLD Activity Explanation, Reconciliation & Trustworthy Receipts

> **v2026.10.15.680** · **PLANNING / NOT IMPLEMENTED / Production BLOCKED** · 2026-10-15 KST
> Canonical English | [한국어](F675_03_WLD_ACTIVITY_EXPLANATION_RECEIPTS_SPEC.ko.md)
> Parents: [PROJECT_PLAN](PROJECT_PLAN.md) → [Integrated Master](INTEGRATED_PLANNING_MASTER.md) → [v675 backlog](INTEGRATED_PRODUCT_FEATURE_REVIEW_v2026.10.15.675.md); existing [v523 economic core](CENTRAL_BANK_MINT_TREASURY_ECONOMY_CORE_SPEC.md), [v542 reconciliation](ECONOMY_INTEGRITY_AND_DOCUMENTATION_RECONCILIATION_SPEC.md), and [v677 action truth](F675_01_FEATURE_REALITY_USER_TRUST_SPEC.md) remain higher or complementary authorities.
>
> Start reference `origin/main=a37b733837cf82c3f45adb88242bd1b4f6df2cb9`; mid/final SHA in [worklog](../worklog/2026-10-15-f67503-wld-receipts-v680.md). This specification establishes proposed contracts; no WLD/account data were changed or inspected in Production.

## 0. Product promise, audience and non-goals

**Job-to-be-done:** “My WLD balance changed. Explain **which action caused it, how much and which pocket changed, whether it really settled, and how to find the immutable reference**—without exposing another person's account.”

**Decision:** Extend the *already implemented* `/wallet`, `/wallet/activity`, `PostingStrip`, and CSV—not a competing ledger or a counterfeit “bank receipt.” Existing virtual WLD is not real money, redeemable cash, a bank account, tax evidence or an external EFT. Consumer-finance statements/receipt references serve as **clarity patterns only**, not assertions that real banking laws apply to Moneyverse.

**Hard non-goals:** no issuance/retirement, WLD transfer, interest policy, historic ledger mutation, correction by editing original postings, new privileged direct SQL grants, unsafe unrestricted user-ID lookup, unreviewed raw ledger export, searchable/public receipt URLs, or a production financial migration during a planning-only cycle.

## 1. Evidence-based source baseline and precise gaps

| ID / severity | Exact main source / fact | Consequence / acceptance |
|---|---|---|
| **W680-01 P1** | `frontend/src/app/wallet/page.tsx` loads `GET /api/v1/wallet?recent=50` but only renders 5 latest; links existing `/wallet/activity` | Reuse IA; user should reach explanation from a recent row within one action |
| **W680-02 P1** | `frontend/src/app/wallet/activity/page.tsx` loads a maximum 50 entries, renders `PostingStrip`, no drill-down or cursor page | “All Activity” currently means at most 50, not lifetime history; design genuinely paginated full record with truthful bounds |
| **W680-03 P0** | `backend/src/wallet/wallet.repository.ts::recentTransactionsForUser` joins `ledger_transactions`, `ledger_postings`, `accounts` for owner `USER_CASH`/`USER_BANK`, sums their postings into one **net** amount | A cash→bank move may net to zero although pockets changed. A zero-net transaction is **not “nothing happened”**; details must distinguish cash/bank deltas and external legs without leaking other members |
| **W680-04 P1** | `backend/src/wallet/wallet.service.ts` normalizes WLD to canonical integer strings, computes direction from signed net, uses type→localized label map but falls back to `경제 활동` | Preserve BigInt/string precision; introduce verified reason taxonomy and “type unexplained” rather than invented details; derive signed per-pocket deltas |
| **W680-05 P1** | `frontend/src/app/wallet/export-ledger-csv.tsx` exports current `TransactionView[]` client-side with a filename suggestive of full ledger; its input is the displayed slice | Must label “export current 50 records” until server-managed paginated complete export implemented. Prevent formula/CSV injection and locale-delimiter ambiguity |
| **W680-06 P0** | `backend/src/wallet/wallet.controller.ts` authenticated `GET wallet`; existing transfer/reward/bank mutation commands return transaction IDs and use session actor | Receipt read must bind to session owner and original settled transaction; never let query `userId` select whose financial history is returned |
| **W680-07 P0** | v523/v542 economic invariants and historical v625 source-audit signal direct mutation/privilege/precision gaps; P0 release HOLD | No receipt feature is proof of double-entry correctness: independent real-DB conservation, DB ACL and exact-SHA gated Test are prerequisites |
| **W680-08 P1** | Current `PostingStrip` expresses debit/credit sides using description, while `sides()` renders owner versus label from net direction; not necessarily actual all-ledger counterparties | Do not call these two display labels a mathematically complete posting journal; optional “how this was calculated” section distinguishes public-safe view from internal accounting |

These are **SOURCE_OBSERVED or historical planning evidence** based on the reviewed `main`, *not* new Production verification, security exploit demonstration or a sampled user complaint.

## 2. User-centered problem discovery (research hypotheses, not interviews)

| Audience and task | Expected question | Failure to avoid | Prototype test |
|---|---|---|---|
| New worker/member | “Did the daily task actually award WLD?” | reward button says success, later balance mismatch | task→receipt→balance after authoritative reread |
| Returning wallet owner | “Why did total WLD not change after moving cash into my virtual bank?” | zero net mistaken for no-op or vanished money | see -cash/+bank and combined 0 |
| Fictional stock buyer | “Why is there escrow, trading fee or a settlement later?” | duplicated looking activity row or arbitrary debit | see order/escrow/fill/refund links with only proven components |
| Sender | “Did I send twice when internet dropped?” | retry creates another send, fake success | search known transaction ID/status before resubmission |
| Receiver or privacy-sensitive member | “What of the counterparty can I see?” | other player's balance/identity leaked | masked or no counterparty, ownership scoped |
| Large WLD holder | “Can I verify every digit, including 38-digit amounts?” | Number/float rounding, scientific notation | exact text amounts, export/reconciliation equality |
| Mobile, zoom and screen-reader reader | “Can I read the reference without clipped text?” | tiny table, sign indicated solely by color | 320px and keyboard, readable status, copy controls |
| Support/admin reviewer | “Where should a disputed event be investigated?” | edit old ledger row, claim refund without evidence | issue report with redacted ID, immutable inquiry record |

Test planned tasks with opt-in participants and existing genuine support issue categories; no research, support analytics or conversion improvement is claimed here. Recommend early usability pilots across newcomer/returning/mobile/accessibility (3–5 per materially different task if recruitment allows); trust comprehension and correct next action are stronger success criteria than “receipts clicked.”

## 3. End-to-end screen map and wireframe-level behavior

**Route A — `/wallet`:** Keep canonical WLD totals and **cash vs bank** pockets, existing quick actions and newest 5 entries. Add a discoverable “Why did this change?” / “View receipt” on every settled transaction row only after detail availability is server-proven. No expansion that pushes primary balance off mobile viewport.

**Route B — `/wallet/activity`:** Reuse canonical screen. Header: “My WLD Activity / 내 WLD 기록”; annotate “Showing 1–50 of the latest available records” **until true cursor paging exists**. Add date range, direction, reason category, wallet pocket filters; cursor pagination preserving sort `created_at DESC, transaction_id DESC`. Total counts/last historical date only if measured, else “more records” not an invented `all`. Each list row: Korean/English human reason, signed net, pocket change if meaningful, occurred time and settlement state. Clicking opens canonical detail.

**Route C — `/wallet/activity/[transactionId]` (candidate)**: authenticated, owner-scoped detail; route access must not reveal other users' records. Include:
- state: `CONFIRMED | PROCESSING | REJECTED | OUTCOME_UNKNOWN | REVERSED_BY_NEW_TRANSACTION` mapped from authoritative committed DB, not UI optimism. For an existing ledger posting, confirmed means posted, not an unverified external side effect.
- readable action (“Transfer WLD”, “Daily reward”, “Virtual-bank deposit”, “Stock order escrow”, “Marketplace purchase”, “Correction”); when no exact domain evidence, show “Unclassified ledger event—contact support” rather than fabricate tax, fee or counterparty.
- **effective amount and pocket breakdown** `cashDelta`, `bankDelta`, `netWalletDelta` (signed integer strings), optional related escrow/treasury/mint/certification only when server-authorized and strictly redacted; fields `grossAmount, feeAmount, netAmount` are optional and shown only if all provenance exists.
- `occurredAt`, `postedAt` if distinguishable, transaction short display reference plus full copy button with screen reader label, verified source module label, no raw SQL/internal names, and optional order/reward/settlement reference scoped to this viewer.
- link back to activity, safe deep link from original action result, "Report a question" with **reference token only**; not a self-service irreversible “reverse this” button. A disputed correction is a new authorized compensating ledger transaction and relationship, not modification/deletion of historical posting.
- on `UNKNOWN` after timeouts: “We cannot confirm the outcome yet; check the record before trying again.” A missing detail/404 must not automatically be interpreted as an executed transaction failing; read-after-write lag and access gates may require `UNKNOWN`.
- no receipt download PDF promised until privacy/template and snapshot parity verified; initial version supports copy reference and correct CSV limited to genuinely selected range.

**Reason taxonomy** (mapped to real transaction types and owning services, not textual guesses): `REWARD_DAILY | REWARD_WORK | TRANSFER_SENT | TRANSFER_RECEIVED | BANK_DEPOSIT | BANK_WITHDRAWAL | BANK_INTEREST | STOCK_ESCROW | STOCK_SETTLEMENT | STOCK_REFUND | MARKETPLACE_PURCHASE | BUSINESS_SETTLEMENT | TREASURY_PAYMENT | TAX_OR_FEE | LOAN_ISSUED | LOAN_REPAID | CORRECTION | MINT | RETIRE | OTHER_VERIFIED | UNCLASSIFIED`. Source of truth is ledger transaction type plus registered domain metadata, not `label` alone. Unknown rows remain visible and are triaged; no silent “경제 활동” ambiguity.

**Example, purely illustrative—do not treat as a real balance:** transfer 2,500 WLD cash→bank: cash `-2500`, bank `+2500`, combined `0`, no mint or retire. Debit/credit applies to ledger accounts and cannot be identified merely by the sign of netWalletDelta. Reconciliation tests prove the exact signed result with the actual schema.

## 4. API & domain contracts (proposal, no code implemented)

Reuse existing `GET /api/v1/wallet?recent=50` unchanged for backwards compatibility. Proposed read-only:
- `GET /api/v1/wallet/activity?limit=20&cursor=...&from&to&type&pocket` → `items[], nextCursor|null, observedAt, sourceVersion`; validated limit 1–50, immutable ordered cursor `(created_at,transaction_id)`; no arbitrary caller `userId`.
- `GET /api/v1/wallet/activity/:transactionId` → actor-owned authoritative receipt or non-enumerating 404; no activity side effects.
- `GET /api/v1/wallet/activity/:transactionId/status` only if asynchronous mutation status needs independent, secure lookup. A final transaction ID returned by existing commands may be used; request idempotency key mapping must remain actor-scoped and never exposed to third parties.
- Proposed backfill/export `GET /api/v1/wallet/activity/export?...` **only** after bounded server stream, abuse quotas, row caps/async export, object TTL, egress audit, privacy review, formula-injection neutralization and clear “selected date range” semantics. No pre-signed public financial URL.

**Illustrative receipt DTO** (all example values, not actual API or user data):
```json
{
  "receiptVersion": 1,
  "transactionId": "00000000-0000-0000-0000-000000000001",
  "currency": "WLD",
  "reasonCode": "BANK_DEPOSIT",
  "state": "CONFIRMED",
  "occurredAt": "2026-10-15T00:00:00Z",
  "cashDelta": "-2500",
  "bankDelta": "2500",
  "netWalletDelta": "0",
  "detailCompleteness": "VERIFIED",
  "relatedReference": null
}
```
Do not use this sample in live UI or SEO. Never send hidden user's full name/account, third-party WLD balance, raw DB role, SQL, idempotency secrets or unredacted admin actor data in public JSON.

**Financial invariants:**
- Per transaction `Σ(posting debits)=Σ(posting credits)` in canonical numeric integer arithmetic; only approved Mint/Retire changes global supply and must have audited certificates under v523.
- `netWalletDelta = cashDelta + bankDelta` and detail agrees with existing aggregate **for the same transaction** (beware how posting directions map to signed WLD; write golden fixtures before using sign words).
- Timeline sum is **not** current balance if pagination begins mid-history, there are multiple wallets, locked funds or unsettled entries; require explicit opening balance + full range + all included pockets and a consistent DB snapshot before presenting `opening + movements = closing`. Otherwise display “partial history, cannot reconcile this slice” rather than a guessed residual.
- No JS `Number` conversions of monetary amounts; validate numeric strings using existing `WldAmount`/BigInt; formatting preserves all digits; CSV/JSON preserve integer text.
- No chargeback by editing receipt: immutable source ledger and new compensating transaction + linkage.

## 5. Security & data-access design

**P0 prerequisite**: current app-role read privileges, `PUBLIC EXECUTE` default grants, high-privilege functions and direct balance writes must be independently audited and fixed before exposing this extra projection. DO NOT grant table-wide SELECT/UPDATE to the application merely to make the page work.

Proposed DB read boundary is an independently security-reviewed, narrowly scoped function/view. Prefer **server session-bound actor derivation** rather than trusting arbitrary `actor_user_id` from query params; if a function accepts actor as internal parameter, verify the caller's authenticated identity at Nest and inside a validated DB trust boundary (session role/controlled claims). A caller-provided UUID is **not** authorization. Use reviewed SECURITY DEFINER only if privilege separation truly requires it, trusted fixed `search_path` (`pg_catalog`, locked schema, `pg_temp` last as appropriate), qualified identifiers, least-privileged dedicated owner, transactional `REVOKE EXECUTE FROM PUBLIC` and selective grant; no dynamic SQL and no bypass for other users. Prove negative across tenant/user and function invocation; validate actual DB owner/bypass-RLS behavior, not assume RLS alone prevents leaks.

Test arbitrary UUID other user's transaction, malformed UUID, session swap, archived/inactive accounts, impersonation, account merge, shared family roles, admin and nonadmin access, replay of saved deep link, frontend cache mixing two sessions, mobile app parity and exports. Use `Cache-Control: private, no-store` for personalized records, `robots: noindex,nofollow`, privacy-safe referer handling, rate limiting and bounded audit without full amounts or raw IDs in metrics.

**Correction/dispute:** “Report a problem” creates a **separate audited support inquiry** only after explicit implementation/consent; initial spec requires only safe guidance and copyable transaction ID. Support actions to compensate require independent economic approvals and existing issuer/treasury separation. Do not cite U.S. Regulation E statutory rights or timelines to game participants; the CFPB receipt/error guidance serves information architecture inspiration, not legal applicability.

## 6. States, errors, accessibility and communications

| Condition | Korean | English | Behavior |
|---|---|---|---|
| Confirmed | 원장에 기록된 거래입니다. 내 자산 변화를 확인하세요. | Recorded in your ledger. Review how your balances changed. | receipt detail |
| Bank internal transfer | 활동 지갑에서 가상 은행으로 이동했어요. 총 WLD는 변하지 않았습니다. | Moved from cash to your virtual bank; total WLD is unchanged. | show -cash/+bank |
| Unknown timeout | 아직 처리 결과를 확인할 수 없습니다. 재신청 전에 거래내역을 확인하세요. | We can't confirm the result yet. Check your activity before retrying. | no blind resend |
| Unclassified | 이 거래의 자세한 사유를 확인 중입니다. 거래번호를 기록해 주세요. | We cannot yet explain this entry. Keep its reference number. | preserve raw reason ID internally |
| Partial history | 현재 최근 50건만 표시합니다. 더 오래된 내역은 아직 조회할 수 없습니다. | Showing only the latest 50 records. Older history is not available here yet. | never say “all” |
| No entries | 아직 기록된 활동이 없습니다. | No recorded activity yet. | link to optional verified action |
| Data unavailable | 현재 원장 기록을 불러오지 못했습니다. 이전 잔액을 최신으로 표시하지 않습니다. | Activity is unavailable. We won't present an old balance as current. | retry GET |
| Disputed/corrected | 원래 기록은 유지되며 정정 거래가 별도로 연결됩니다. | The original stays visible and a separate correction is linked. | no silent edit |

Use native list/definition markup, discernible headings, stable buttons, real text sign “+ / −”, `aria-live` for server-confirmed status, keyboard navigation, 320/360/375/390/430 px, 200% and 400% zoom, time locale+UTC tooltip, redact counterparty and preserve safe copy feedback. Review/confirm important amounts/recipients before submission per WCAG 2.2 3.3.4; receipts cannot replace prevention. Avoid false green success, long tables with only color, text truncation that hides numeric amount, and fee terminology without source.

## 7. Research and telemetry methodology

Hypotheses, not results: users can distinguish pocket movement from supply creation; reduce mistaken duplicate transfers; users understand corrections and no detailed counterpart identity; explain “net 0” without implying no action. Small task-based voluntary pilot for guest/member, large-WLD, assistive tech, mobile; measure correct attribution, receipt lookup success, unknown-outcome retry avoidance, error-comprehension and support escalation. No invented interview or KPI uplift.

Metrics `wallet_receipt_view_total{reason,status,locale,device}`, `wallet_receipt_unclassified_total{domain}`, `wallet_activity_pagination_success_total`, `wallet_receipt_authorization_denied_total`, `wallet_receipt_reconciliation_failed_total`, `wallet_receipt_unknown_outcome_total`. No raw user ID, account number, amount, UUID, full URI or counterparty in metrics labels. An alarm for **any confirmed cross-user disclosure, fabricated monetary completion, amount precision loss or imbalance** triggers stop; sample-rate percent KPIs require baseline; 0 sample means UNKNOWN.

## 8. D0–D7 implementation slices and exact-SHA acceptance

| Stage | Delivery | Acceptance/fail case |
|---|---|---|
| **D0** exact-source inventory | map all wallet/stock/bank/treasury/shop postings, current schema, source SHA, existing WLD direct writes and DB grants | classify transaction types/true signed legs and identify owner+recipient privacy before changing DB |
| **D1** economics & ACL gate | fix verified broad DB grants and economic invariants in **separate reviewed code branch** | zero unauthorized posting read; double-entry and supply proofs in isolated DB; no wider SELECT grants |
| **D2** private detail projection | scoped read-only DB function/repository/contract | actor cannot request user B; signed cash/bank/other leg relations exact, 38-digit WLD |
| **D3** API inventory & paging | actor-scoped cursor endpoints and safe filter/date schemas | deterministic ordering with timestamp ties, no missing/duplicate rows between pages under concurrency; stable read snapshot or documented cursor bound |
| **D4** user-facing UX | /wallet/activity enriched rows and receipt drill-down, appropriate source indicator | mobile/keyboard/screenshare privacy; all eight copy states, no false claims |
| **D5** outcome lookup / corrections | authoritative idempotency→transaction ID mapping, compensation references without altering original | timeout-after-commit returns original outcome, no double reward/order/transfer, no cross-user data |
| **D6** export and evidence | bounded CSV export only if correct pagination/ACL, formula injection mitigated, support audit | full-range selection truth, no hidden rows/silent truncation, no signed-int precision loss |
| **D7** release gate | unit, contract, auth negative, migration/reconcile, exact-SHA isolated Test, five complete authenticated all-route UI passes, rollback/session continuity | if v530 UI, v523/542/543 economics, DB role drift or Test/Prod SHA mismatch remains unresolved → **HOLD Production** |

Golden fixtures: cash-to-bank with net zero, paired loan borrowing/repaid, deposit interest, daily/work reward (only if correctly minted), sent/received user transfer, stock order escrow→settlement/refund, shop payment + levy, treasury grant and tax, adjustment+compensating transaction, historical account merge, unknown transaction type, huge 38-digit WLD, duplicate timestamp pagination, long Korean label/English translation, missing receipt, transaction belonging to another user, double-click after response loss, SQL role PUBLIC deny, browser download escaping `=,+,-,@` formula input, 400% zoom and screen readers.

**Acceptance invariants:** 100% of exposed confirmed receipts reconcile to *the authoritative posting legs* and exact signed deltas; zero cross-user disclosure; zero false “completed”; zero money-changing GET; zero historical ledger mutations; 100% new/visible reason labels have verified server taxonomy or explicit `UNCLASSIFIED`; every displayed export bound truthful. No actual sample count/benefit or feature implementation has been measured in this planning cycle.

## 9. Reference register — verified 2026-10-15

| ID | Source | Relevance and scope |
|---|---|---|
| R680-01 | [GOV.UK confirmation pages](https://design-system.service.gov.uk/patterns/confirmation-pages/) | clear completion, reference number, next action; apply only to genuinely posted state |
| R680-02 | [GOV.UK error messages](https://design-system.service.gov.uk/components/error-message/) | practical recovery copy, no blame |
| R680-03 | [CFPB Regulation E §1005.9](https://www.consumerfinance.gov/rules-policy/regulations/1005/9/) | transaction date/type/amount on real-bank statements as **design reference only**; not WLD law |
| R680-04 | [CFPB Regulation E §1005.11](https://www.consumerfinance.gov/rules-policy/regulations/1005/11/) | unrecognized/error transaction evidence as analogy only, **not** legal WLD dispute rights |
| R680-05 | [W3C WCAG 2.2 SC 3.3.4](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html) | review/confirm/correct high-impact input before action |
| R680-06 | [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/) | focus, error/status announcements, reflow, labels |
| R680-07 | [OWASP API1:2023 BOLA](https://api-security.owasp.org/editions/2023/en/0xa1-broken-object-level-authorization/) | owner-scoped object authorization even on UUID paths |
| R680-08 | [OWASP API3:2023 object-property protection](https://github.com/OWASP/API-Security/blob/master/editions/2023/en/0xa3-broken-object-property-level-authorization.md) | omit counterpart/secret properties |
| R680-09 | [PostgreSQL 17 CREATE FUNCTION](https://www.postgresql.org/docs/17/sql-createfunction.html) | trusted SECURITY DEFINER path, revoke PUBLIC |
| R680-10 | [PostgreSQL 17 RLS](https://www.postgresql.org/docs/17/ddl-rowsecurity.html) | row permissions and owner/bypass caveats |
| R680-11 | [PostgreSQL 17 transaction isolation](https://www.postgresql.org/docs/17/transaction-iso.html) | consistent snapshots for opening/closing balance proofs |
| R680-12 | [Stripe idempotent requests](https://docs.stripe.com/api/idempotent_requests) | safe retry/unknown outcome analogy, not regulatory/legal equivalence |
| R680-13 | [OWASP CSV injection](https://owasp.org/www-community/attacks/CSV_Injection) | safe spreadsheet export of user-sourced labels |

**Status:** documentation-only `PLANNING`. Test and Production identity/ledger economic release gates still blocked; no new receipt detail API, DB function or permission deployed by v680.
