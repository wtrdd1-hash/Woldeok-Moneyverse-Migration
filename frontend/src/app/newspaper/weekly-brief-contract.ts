export interface WeeklyBriefData {
  readonly balanceSnapshotWld: string;
  readonly source: 'user_cash_and_bank_balances';
  readonly asOf: string;
}

export function parseWeeklyBriefResponse(response: unknown): WeeklyBriefData | undefined {
  if (!response || typeof response !== 'object') return undefined;
  const envelope = response as Record<string, unknown>;
  if (envelope.success !== true || !envelope.data || typeof envelope.data !== 'object') return undefined;
  const data = envelope.data as Record<string, unknown>;
  if (data.source !== 'user_cash_and_bank_balances' ||
      typeof data.balanceSnapshotWld !== 'string' ||
      !/^(0|[1-9]\d*)$/.test(data.balanceSnapshotWld) ||
      typeof data.asOf !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(data.asOf) ||
      !Number.isFinite(Date.parse(data.asOf))) return undefined;
  return {
    balanceSnapshotWld: data.balanceSnapshotWld,
    source: 'user_cash_and_bank_balances',
    asOf: data.asOf,
  };
}
