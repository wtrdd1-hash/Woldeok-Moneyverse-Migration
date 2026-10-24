import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET as diagnose } from '../api/advisor/deoki/diagnose/route';
import { POST as ask } from '../api/advisor/deoki/ask/route';
import { POST as execute } from '../api/advisor/deoki/rebalance/execute/route';
import { api } from '@/lib/api';
import { viewerOrUnknown } from '@/lib/viewer';

vi.mock('@/lib/api', () => ({ api: vi.fn() }));
vi.mock('@/lib/viewer', () => ({ viewerOrUnknown: vi.fn() }));
vi.mock('@/lib/session', () => ({ isLoggedInMember: vi.fn() }));

const sample = { id: 'verified-1', prIndex: 64, riskLevel: 'MODERATE', assetSummary: { cash: 120, savings: 20, stocks: 0, bonds: 0, total: 140, stockCount: 0, topStockSymbol: null, topStockRatio: 0 }, diagnosticNotes: ['verified note'], rebalanceSuggestions: [], createdAt: '2026-10-25T00:00:00Z' };
const post = (path: string, body: unknown) => new Request(`http://localhost${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

beforeEach(() => { vi.resetAllMocks(); vi.mocked(viewerOrUnknown).mockResolvedValue({ signedIn: true } as never); });

describe('advisor member truth boundary', () => {
  it('returns the real Nest diagnosis envelope without invented balances', async () => {
    vi.mocked(api).mockResolvedValue({ success: true, diagnosis: sample });
    const response = await diagnose();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, diagnosis: sample });
    expect(response.headers.get('cache-control')).toContain('no-store');
  });
  it('fails closed when diagnosis is unavailable', async () => {
    vi.mocked(api).mockRejectedValue(new Error('database unreachable'));
    const response = await diagnose();
    expect(response.status).toBe(503);
    expect(JSON.stringify(await response.json())).not.toContain('12450000');
  });
  it('refuses unauthenticated diagnosis and consultation', async () => {
    vi.mocked(viewerOrUnknown).mockResolvedValue({ signedIn: false } as never);
    expect((await diagnose()).status).toBe(401);
    expect((await ask(post('/api/advisor/deoki/ask', { question: 'balance?' }))).status).toBe(401);
    expect(api).not.toHaveBeenCalled();
  });
  it('does not invent consultation advice on API failure', async () => {
    vi.mocked(api).mockRejectedValue(new Error('down'));
    const response = await ask(post('/api/advisor/deoki/ask', { question: 'my risk' }));
    expect(response.status).toBe(503);
    expect(JSON.stringify(await response.json())).not.toContain('1.84');
  });
  it('returns verified backend answer and rejects malformed questions', async () => {
    vi.mocked(api).mockResolvedValue({ success: true, answer: 'backend answer' });
    const response = await ask(post('/api/advisor/deoki/ask', { question: 'risk' }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, answer: 'backend answer' });
    expect((await ask(post('/api/advisor/deoki/ask', { question: ' ' }))).status).toBe(400);
  });
  it('never issues fake rebalance execution receipts', async () => {
    const response = await execute(post('/api/advisor/deoki/rebalance/execute', { targetStocksRatio: 55 }));
    expect(response.status).toBe(503);
    expect(JSON.stringify(await response.json())).not.toMatch(/sim-reb-|SIMULATED_FILLED|executionId/);
  });
});
