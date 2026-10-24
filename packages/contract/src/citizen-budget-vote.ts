/** These are the only priority values accepted by treasury_cast_citizen_budget_vote. */
export const BUDGET_VOTE_CHOICES = [
  'WELFARE',
  'INFRASTRUCTURE',
  'CITIZEN_DIVIDEND',
  'CURRENCY_STABILIZATION',
] as const;

export type BudgetVoteChoice = (typeof BUDGET_VOTE_CHOICES)[number];

export function isBudgetVoteChoice(value: unknown): value is BudgetVoteChoice {
  return typeof value === 'string' && (BUDGET_VOTE_CHOICES as readonly string[]).includes(value);
}

/** The community operates on Korea time, not the visitor's device time zone. */
export function currentBudgetQuarter(at: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: 'numeric',
  }).formatToParts(at);
  const year = parts.find((part) => part.type === 'year')?.value;
  const month = Number(parts.find((part) => part.type === 'month')?.value);
  if (!year || !Number.isInteger(month) || month < 1 || month > 12) {
    throw new RangeError('Korea budget quarter is unavailable');
  }
  return `${year}-Q${Math.ceil(month / 3)}`;
}
