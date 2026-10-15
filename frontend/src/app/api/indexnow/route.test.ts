import { beforeEach, describe, expect, it, vi } from 'vitest';
const { apiMock, submitMock } = vi.hoisted(() => ({ apiMock: vi.fn(), submitMock: vi.fn() }));
vi.mock('@/lib/api', () => ({
  api: apiMock,
  ApiError: class ApiError extends Error { constructor(public status: number) { super(); } },
}));
vi.mock('@/lib/indexnow', () => ({ submitToIndexNow: submitMock, INDEXNOW_HOST: 'easy-scraping.com' }));
import { POST } from './route';
import { ApiError } from '@/lib/api';
import { NextRequest } from 'next/server';
const req = (body: unknown, origin = 'https://easy-scraping.com') =>
  new NextRequest('https://easy-scraping.com/api/indexnow', {
    method: 'POST', headers: { origin, 'sec-fetch-site': 'same-origin' }, body: JSON.stringify(body),
  });
describe('IndexNow gateway authorization', () => {
  beforeEach(() => {
    apiMock.mockReset(); submitMock.mockReset();
    apiMock.mockResolvedValue({ consoleSession: { state: 'open' } });
    submitMock.mockResolvedValue({ success: true, submittedCount: 1, status: 202 });
  });
  it('refuses anonymous submission', async () => {
    apiMock.mockRejectedValueOnce(new ApiError(401));
    expect((await POST(req({ urls: [] }))).status).toBe(401);
    expect(submitMock).not.toHaveBeenCalled();
  });
  it('refuses cross origin POST', async () => {
    expect((await POST(req({}, 'https://attacker.invalid'))).status).toBe(403);
    expect(submitMock).not.toHaveBeenCalled();
  });
  it('rejects external URLs before submission', async () => {
    expect((await POST(req({ urls: ['https://attacker.invalid/page'] }))).status).toBe(400);
    expect(submitMock).not.toHaveBeenCalled();
  });
  it('submits only same-host URLs in open admin console', async () => {
    expect((await POST(req({ urls: ['https://easy-scraping.com/guide'] }))).status).toBe(202);
    expect(submitMock).toHaveBeenCalledWith(['https://easy-scraping.com/guide']);
  });
});
