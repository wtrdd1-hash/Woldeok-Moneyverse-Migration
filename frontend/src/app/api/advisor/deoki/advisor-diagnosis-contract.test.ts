import { beforeEach, describe, expect, it, vi } from 'vitest';
const { api } = vi.hoisted(() => ({ api: vi.fn() }));
vi.mock('@/lib/api', () => ({ api }));
import { GET } from './diagnose/route';

const diagnosis = {
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  userId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  prIndex: 70, riskLevel: 'MODERATE',
  assetSummary: { cash: 100, savings: 200, stocks: 300, bonds: 400, total: 1000, stockCount: 2, topStockSymbol: 'CHIPS', topStockRatio: 60 },
  diagnosticNotes: ['Rule-based diagnostic note'], rebalanceSuggestions: [],
  createdAt: '2026-11-01T00:00:00.000Z',
};

describe('advisor verified read-only diagnosis contract', () => {
  beforeEach(() => api.mockReset());

  it('maps a validated backend receipt without inventing Sharpe or yields', async () => {
    api.mockResolvedValueOnce({ success: true, diagnosis });
    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ sourceStatus: 'VERIFIED', diagnosis: {
      prIndex: 70, riskLevel: 'MODERATE', createdAt: diagnosis.createdAt,
      assetSummary: diagnosis.assetSummary,
    } });
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
  });

  it.each([
    { ...diagnosis, assetSummary: { ...diagnosis.assetSummary, total: 999 } },
    { ...diagnosis, prIndex: 999 },
    { ...diagnosis, assetSummary: { ...diagnosis.assetSummary, stocks: '300.5' } },
    { ...diagnosis, createdAt: 'invalid' },
  ])('fails closed on malformed or contradictory source evidence', async (invalid) => {
    api.mockResolvedValueOnce({ success: true, diagnosis: invalid });
    const response = await GET();
    expect(response.status).toBe(503);
    expect(await response.text()).not.toMatch(/"sourceStatus":"VERIFIED"|"assetSummary"/);
  });
});
