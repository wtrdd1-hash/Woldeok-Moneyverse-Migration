// Bond status and coupon-rate changes require a DB-owned, audited operator command.
// Never restore direct app-role UPDATE or claim success without a durable policy receipt.
export const BOND_POLICY_WRITE_HOLD_REASON =
  'Bond policy writes are held pending DB-owned operator authorization and audit certification';
