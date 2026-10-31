import { beforeEach, describe, expect, it, vi } from 'vitest';

const { api } = vi.hoisted(() => ({ api: vi.fn() }));
vi.mock('@/lib/api', () => ({ api }));

import { GET } from './diagnose/route';
import { POST } from './ask/route';

const askRequest = (question: string) => new Request('http://localhost/api/advisor/deoki/ask', {
  method: 'POST', headers: { 'content-type': 'application/json', origin: 'http://localhost', 'sec-fetch-site': 'same-origin' }, body: JSON.stringify({ question }),
});

const assertPrivate = (response: Response) => {
  expect(response.headers.get('cache-control')).toBe('private, no-store');
  expect(response.headers.get('x-robots-tag')).toContain('noindex');
};

describe('advisor BFF source truth and CSRF', () => {
  beforeEach(() => api.mockReset());

  it('does not invent a portfolio diagnosis when the source fails', async () => {
    api.mockRejectedValueOnce(new Error('database permission denied'));
    const response = await GET();
    expect(response.status).toBe(503);
    expect(await response.text()).not.toMatch(/12450000|1\.84|Balanced Growth|permission denied/);
    assertPrivate(response);
  });

  it('does not invent financial advice when the source fails', async () => {
    api.mockResolvedValueOnce({ csrfToken: 'verified-token' }).mockRejectedValueOnce(new Error('SQL error'));
    const response = await POST(askRequest('내 포트폴리오 위험도는?'));
    expect(response.status).toBe(503);
    expect(await response.text()).not.toMatch(/1\.84|샤프 지수|SQL error/);
    assertPrivate(response);
  });

  it('rejects cross-origin POST before fetching a session CSRF token', async () => {
    const crossSite = new Request('http://localhost/api/advisor/deoki/ask', {
      method: 'POST', headers: { origin: 'https://attacker.example', 'sec-fetch-site': 'cross-site' },
      body: JSON.stringify({ question: 'risk' }),
    });
    const response = await POST(crossSite);
    expect(response.status).toBe(403);
    expect(api).not.toHaveBeenCalled();
    assertPrivate(response);
  });

  it('requires server session CSRF before forwarding POST', async () => {
    api.mockResolvedValueOnce({});
    const response = await POST(askRequest('risk'));
    expect(response.status).toBe(403);
    expect(api).toHaveBeenCalledTimes(1);
    assertPrivate(response);
  });

  it('forwards only a session-bound CSRF and the validated question', async () => {
    api.mockResolvedValueOnce({ csrfToken: 'verified-token' })
      .mockResolvedValueOnce({ success: true, answer: 'verified', tips: [] });
    const response = await POST(askRequest('risk'));
    expect(response.status).toBe(200);
    expect(api).toHaveBeenNthCalledWith(1, '/api/v1/auth/session');
    expect(api).toHaveBeenNthCalledWith(2, '/api/v1/advisor/deoki/ask', {
      method: 'POST', csrfToken: 'verified-token', body: { question: 'risk' },
    });
    assertPrivate(response);
  });
});
