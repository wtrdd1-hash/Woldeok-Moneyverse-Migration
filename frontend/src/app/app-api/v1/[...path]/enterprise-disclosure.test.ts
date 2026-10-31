import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

const source = {
  source: 'DATABASE_SNAPSHOT', settlementStatus: 'NOT_VERIFIED',
  financial_data_status: 'PROJECTION_ONLY_UNVERIFIED', ledger_confirmed: false,
  disclosed_at: '2026-11-01T00:00:00.000Z',
  overview: { holding_name: 'WSHC', holding_code: 'WSHC', governance_model: 'virtual',
    total_soe_assets_wld: '9007199254740993', hourly_soe_revenue_wld: '200',
    hourly_soe_profit_wld: '100', hourly_soe_dividends_wld: '30' },
  soes: [{ code: 'SOE_A', name: 'A', category: 'ENERGY', ceo_name: 'Director',
    total_assets_wld: '9007199254740993', net_profit_hourly_wld: '100',
    dividend_rate_bps: 3000, eval_grade: 'A', description: 'virtual' }],
};
const req = () => new NextRequest('https://easy-scraping.com/app-api/v1/enterprises/public', {
  headers: { host: 'easy-scraping.com' },
});
const context = { params: Promise.resolve({ path: ['enterprises', 'public'] }) };
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

function upstream(payload: unknown, status = 200, contentType = 'application/json') {
  vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(payload), {
    status, headers: { 'content-type': contentType },
  })));
}

describe('Android public enterprise evidence', () => {
  it('preserves source and exact WLD integer strings from verified upstream', async () => {
    upstream(source);
    const response = await GET(req(), context);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.overview.totalSoeAssetsWld).toBe('9007199254740993');
    expect(body.settlementStatus).toBe('NOT_VERIFIED');
  });
  it('rejects a malformed upstream 200 instead of returning a false success', async () => {
    upstream({ ...source, overview: { ...source.overview, total_soe_assets_wld: Number.MAX_SAFE_INTEGER + 2 } });
    const response = await GET(req(), context);
    expect(response.status).toBe(503);
    expect((await response.json()).code).toBe('enterprise_disclosure_unverified');
  });
  it('does not replace an upstream 503 with synthetic balances', async () => {
    upstream({ code: 'ENTERPRISE_DISCLOSURE_UNAVAILABLE' }, 503);
    const response = await GET(req(), context);
    expect(response.status).toBe(503);
    expect(JSON.stringify(await response.json())).not.toContain('365000000');
  });
  it('rejects non-JSON successful upstream content', async () => {
    upstream(source, 200, 'text/plain');
    const response = await GET(req(), context);
    expect(response.status).toBe(503);
  });
});
