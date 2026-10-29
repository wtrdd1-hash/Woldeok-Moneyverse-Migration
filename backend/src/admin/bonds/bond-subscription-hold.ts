// A subscription cannot be represented by a balance UPDATE without a balanced
// posting and an immutable idempotency receipt. Keep every application entry
// point closed until the database owns the entire financial transaction.
export const BOND_SUBSCRIPTION_HOLD_REASON =
  'Bond subscriptions are unavailable pending atomic ledger settlement and replay certification';
