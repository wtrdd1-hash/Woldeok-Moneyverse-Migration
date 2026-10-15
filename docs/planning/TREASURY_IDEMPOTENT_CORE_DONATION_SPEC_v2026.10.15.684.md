# Treasury canonical donation v684 — tranche G3, source candidate only

English canonical. [한국어](TREASURY_IDEMPOTENT_CORE_DONATION_SPEC_v2026.10.15.684.ko.md)

Authority: PROJECT_PLAN → INTEGRATED_PLANNING_MASTER → v523/542 Economy Core. Existing old donation SQL 268/269 uses unavailable schema, modifies projections directly, has no request-idempotency; v683 blocked these. New method must NOT reuse old 3-argument SQL.

Create forward-only 273 Treasury donation v2 with explicit `p_idempotency_key UUID, p_actor UUID, p_amount_wld TEXT, p_memo TEXT`: validate integer amount and active user cash wallet, verified active Core Treasury account; call canonical `economy_post_transaction` with credit payer and debit Treasury and immutable receipt; document its fiscal `VAULT_MAIN` subsidiary mirror, no issuance. Add `core_transaction_id` reference and unique constraint for new treasury_donations rows, never mutate old donation records. A transaction-safe advisory lock on idempotency UUID serializes duplicate requests; equal replay returns original receipt, changed request rejected; insufficient funds, missing account or journal failure roll back fully. API must derive actor from session and require a client operation UUID, not server-generated per request. Restore operator read limitations, keep SWF OFF. No user payout or Production schema touched before exact Test QA.

D0 RED new function absent; D1 isolated Test migration; D2 positive/duplicate/mismatched/insufficient/rollback+Core supply invariant; D3 Nest DTO+service+repository tests; D4 Test all domains/negative and release gates; D5 Production only if all existing P0 finance issues removed. This is not proof of entire Treasury payout completion.
