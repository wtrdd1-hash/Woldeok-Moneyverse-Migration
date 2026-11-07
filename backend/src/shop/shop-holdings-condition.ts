/** Only the owner-scoped SQL read model may supply these condition observations. */
export function isVerifiedHoldingCondition(value: unknown): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const row = value as Record<string, unknown>;
  for (const field of ['weekly_cost', 'arrears_due', 'arrears_cap']) {
    const amount = row[field];
    if (amount !== undefined && (typeof amount !== 'string' || !/^(0|[1-9][0-9]{0,18})$/.test(amount) || BigInt(amount) > 9223372036854775807n)) return false;
  }
  if (row.unpaid_weeks !== undefined && (!Number.isSafeInteger(row.unpaid_weeks) || (row.unpaid_weeks as number) < 0)) return false;
  for (const field of ['durable', 'suspended']) {
    if (row[field] !== undefined && typeof row[field] !== 'boolean') return false;
  }
  for (const field of ['expires_at', 'effect_expires_at']) {
    const date = row[field];
    if (date !== undefined && date !== null && (!(date instanceof Date) || !Number.isFinite(date.getTime()))) return false;
  }
  return true;
}
