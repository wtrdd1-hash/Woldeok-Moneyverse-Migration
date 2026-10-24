import { groupDigits } from '@/lib/money';

export interface FlowSummary {
  readonly currency: 'WLD';
  readonly scope: 'recent_50';
  readonly completeHistory: false;
  readonly transactionCount: number;
  readonly incomingCount: number;
  readonly outgoingCount: number;
  readonly internalMovementCount: number;
  readonly incomingAmount: string;
  readonly outgoingAmount: string;
  readonly netAmount: string;
}

const CANONICAL = /^(?:0|[1-9][0-9]*|-[1-9][0-9]*)$/;

export function parseFlowSummary(value: unknown): FlowSummary | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const data = value as Record<string, unknown>;
  if (data.currency !== 'WLD' || data.scope !== 'recent_50' || data.completeHistory !== false) return null;
  const counts = ['transactionCount', 'incomingCount', 'outgoingCount', 'internalMovementCount'] as const;
  if (counts.some((key) => !Number.isSafeInteger(data[key]) || (data[key] as number) < 0)) return null;
  const count = data.transactionCount as number;
  if (count > 50 || (data.incomingCount as number) + (data.outgoingCount as number)
    + (data.internalMovementCount as number) > count) return null;
  const amounts = ['incomingAmount', 'outgoingAmount', 'netAmount'] as const;
  if (amounts.some((key) => typeof data[key] !== 'string' || !CANONICAL.test(data[key] as string))) return null;
  if ((data.incomingAmount as string).startsWith('-') || (data.outgoingAmount as string).startsWith('-')) return null;
  if (BigInt(data.incomingAmount as string) - BigInt(data.outgoingAmount as string) !== BigInt(data.netAmount as string)) return null;
  return data as unknown as FlowSummary;
}

export function formatFlowWld(value: string): string {
  return groupDigits(value) + ' WLD';
}
