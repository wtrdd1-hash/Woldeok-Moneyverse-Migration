import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiMock } = vi.hoisted(() => ({ apiMock: vi.fn() }));
vi.mock('@/lib/api', () => ({ api: apiMock }));

import { POST } from './harvest/route';
import { PUT } from './status/route';

const base = 'https://easy-scraping.com';
const request = (route: 'harvest' | 'status', method: 'POST' | 'PUT', origin: string | null = base) =>
  new Request(`${base}/api/admin/enterprises/${route}`, {
    method,
    headers: { ...(origin ? { origin } : {}), 'sec-fetch-site': 'same-origin', 'content-type': 'application/json' },
    ...(method === 'PUT' ? { body: JSON.stringify({ code: 'W_POWER', status: 'PAUSED' }) } : {}),
  });

beforeEach(() => {
  vi.resetAllMocks();
  apiMock.mockImplementation(async (path: string) => {
    if (path === '/api/v1/auth/session') return { csrfToken: 'verified-session-csrf' };
    if (path.includes('/soes/harvest')) return { total_dividends_collected: '10', treasury_balance_after: '100', enterprises_processed: 1 };
    if (path.includes('/soes/')) return { success: true, code: 'W_POWER', status: 'PAUSED' };
    throw new Error('unexpected backend path');
  });
});

describe('enterprise mutation gateways', () => {
  it.each([
    ['harvest', 'POST', POST], ['status', 'PUT', PUT],
  ] as const)('%s rejects foreign and absent Origin before calling API', async (route, method, handler) => {
    expect((await handler(request(route, method, 'https://attacker.invalid'))).status).toBe(403);
    expect((await handler(request(route, method, null))).status).toBe(403);
    expect(apiMock).not.toHaveBeenCalled();
  });

  it.each([
    ['harvest', 'POST', POST], ['status', 'PUT', PUT],
  ] as const)('%s forwards server-issued session CSRF to backend', async (route, method, handler) => {
    const res = await handler(request(route, method));
    expect(res.status).toBe(200);
    expect(apiMock).toHaveBeenCalledWith(expect.stringContaining('/api/v1/admin/enterprises/soes/'), expect.objectContaining({ csrfToken: 'verified-session-csrf' }));
  });

  it.each([
    ['harvest', 'POST', POST], ['status', 'PUT', PUT],
  ] as const)('%s rejects missing session CSRF without mutation', async (route, method, handler) => {
    apiMock.mockResolvedValueOnce({});
    const res = await handler(request(route, method));
    expect(res.status).toBe(403);
    expect(apiMock).toHaveBeenCalledTimes(1);
  });

  it('does not report successful SOE update when backend returns success:false', async () => {
    apiMock.mockResolvedValueOnce({ csrfToken: 'verified-session-csrf' }).mockResolvedValueOnce({ success: false });
    const res = await PUT(request('status', 'PUT'));
    expect(res.status).toBe(502);
  });

  it('does not report successful dividend harvest without authoritative amounts', async () => {
    apiMock.mockResolvedValueOnce({ csrfToken: 'verified-session-csrf' }).mockResolvedValueOnce({});
    const res = await POST(request('harvest', 'POST'));
    expect(res.status).toBe(502);
  });
});
