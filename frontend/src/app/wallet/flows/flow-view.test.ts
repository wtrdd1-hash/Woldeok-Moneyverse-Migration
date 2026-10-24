import { describe, expect, it } from 'vitest';
import { parseFlowSummary, formatFlowWld } from './flow-view';

describe('recent wallet flow view boundary', () => {
  const valid = {
    currency: 'WLD', scope: 'recent_50', completeHistory: false, transactionCount: 2,
    incomingCount: 1, outgoingCount: 1, internalMovementCount: 0,
    incomingAmount: '90071992547409931234567890', outgoingAmount: '1',
    netAmount: '90071992547409931234567889',
  };
  it('keeps extreme WLD amounts as exact strings', () => {
    const result = parseFlowSummary(valid);
    expect(result?.incomingAmount).toBe(valid.incomingAmount);
    expect(formatFlowWld(valid.incomingAmount)).toContain('90,071,992,547,409,931,234,567,890');
  });
  it('fails closed on unsupported scope, full-history claims and inconsistent net', () => {
    expect(parseFlowSummary({ ...valid, completeHistory: true })).toBeNull();
    expect(parseFlowSummary({ ...valid, scope: 'all_time' })).toBeNull();
    expect(parseFlowSummary({ ...valid, netAmount: '2' })).toBeNull();
  });
  it('rejects noncanonical and unsafe monetary input', () => {
    expect(parseFlowSummary({ ...valid, incomingAmount: '9e50' })).toBeNull();
    expect(parseFlowSummary({ ...valid, transactionCount: -1 })).toBeNull();
  });
});
