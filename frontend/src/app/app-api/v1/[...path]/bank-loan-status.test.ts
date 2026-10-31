import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';
const loan = { loanId: '22222222-2222-4222-8222-222222222222', principalAmount: '900719925474099312345', interestAmount: '0', outstandingAmount: '900719925474099312345', status: 'active', issuedAt: '2026-10-30T00:00:00.000Z', repaidAt: null };
const request = (query: string) => new NextRequest(`https://easy-scraping.com/app-api/v1/bank/loans${query}`, { headers: { host: 'easy-scraping.com', 'x-forwarded-proto': 'https', cookie: 'moneyverse_session=owner' } });
const context = { params: Promise.resolve({ path: ['bank', 'loans'] }) };
beforeEach(() => { vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32)); vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com'); });
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
describe('Android bank loan status proof', () => {
  it('rejects duplicated and invalid filters without contacting backend', async () => {
    const fetchSpy = vi.fn(); vi.stubGlobal('fetch', fetchSpy);
    expect((await GET(request('?status=active&status=repaid'), context)).status).toBe(400);
    expect((await GET(request('?status=unknown'), context)).status).toBe(400);
    expect((await GET(request('?status=active&owner=someone-else'), context)).status).toBe(400);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
  it('accepts verified owner rows and applies no-store/noindex', async () => {
    const fetchSpy = vi.fn(async () => new Response(JSON.stringify({ loans: [loan] }), { status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public,max-age=3600' } }));
    vi.stubGlobal('fetch', fetchSpy);
    const result = await GET(request('?status=active'), context);
    expect(result.status).toBe(200);
    expect(result.headers.get('cache-control')).toBe('private, no-store');
    expect(result.headers.get('x-robots-tag')).toBe('noindex');
    expect(new URL(String(fetchSpy.mock.calls[0]?.[0])).searchParams.get('status')).toBe('active');
  });
  it('rejects a forged success payload with a mismatched status', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ loans: [{ ...loan, status: 'repaid' }] }), { status: 200, headers: { 'content-type': 'application/json' } })));
    const result = await GET(request('?status=active'), context);
    expect(result.status).toBe(503);
    expect(JSON.stringify(await result.json())).not.toContain(loan.loanId);
  });
});
