// No coupon or principal may be credited without a certified balanced ledger
// transaction, deterministic period receipt, and replay/concurrency protection.
export const BOND_COUPON_SETTLEMENT_HOLD_REASON =
  'Bond coupon and maturity settlement is held pending balanced ledger and replay certification';
