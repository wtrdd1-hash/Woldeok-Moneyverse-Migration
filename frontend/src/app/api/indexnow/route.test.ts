import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextResponse } from 'next/server';
const { submitMock, authMock } = vi.hoisted(() => ({ submitMock: vi.fn(), authMock: vi.fn() }));
vi.mock('@/lib/indexnow', () => ({ INDEXNOW_HOST: 'easy-scraping.com', submitToIndexNow: submitMock }));
vi.mock('@/lib/admin-seo-authority', () => ({
  verifySeoOperator: authMock,
  verifySeoWriteOrigin: (req: Request) => req.headers.get('origin') === new URL(req.url).origin
    ? null : NextResponse.json({ error: 'forbidden' }, { status: 403 }),
}));
import { POST } from './route';
const req = (headers: Record<string,string> = { origin: 'https://easy-scraping.com' }) =>
  new Request('https://easy-scraping.com/api/indexnow', { method: 'POST', headers,
    body: JSON.stringify({ urls: ['https://easy-scraping.com/'] }) });

describe('Direct IndexNow gateway safety', () => {
  beforeEach(() => { vi.clearAllMocks(); authMock.mockResolvedValue(null);
    submitMock.mockResolvedValue({ success: true, submittedCount: 1, status: 202 }); });
  it('must never submit without trusted Origin', async () => {
    const res = await POST(req({ origin: 'https://malicious.example' }) as never);
    expect(res.status).toBe(403);
    expect(submitMock).not.toHaveBeenCalled();
  });
  it('must never submit without proven Nest administrator session', async () => {
    authMock.mockResolvedValue(NextResponse.json({ error: 'login_required' }, { status: 401 }));
    const res = await POST(req() as never);
    expect(res.status).toBe(401);
    expect(submitMock).not.toHaveBeenCalled();
  });
});
