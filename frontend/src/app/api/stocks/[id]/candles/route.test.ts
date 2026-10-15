import { describe, expect, it, vi, beforeEach } from 'vitest';
const { apiMock } = vi.hoisted(() => ({ apiMock: vi.fn() }));
vi.mock('@/lib/api', () => ({
  api: apiMock,
  ApiError: class ApiError extends Error { constructor(public status: number, public detail?: string) { super(detail); } },
}));
import { GET } from './route';
import { ApiError } from '@/lib/api';
function get(id: string) {
  return GET(new Request('https://easy-scraping.com/api/stocks/' + id + '/candles'), {
    params: Promise.resolve({ id }),
  });
}
describe('candles API preserves upstream semantics', () => {
  beforeEach(() => apiMock.mockReset());
  it('rejects malformed and nil UUID without contacting backend', async () => {
    expect((await get('not-a-uuid')).status).toBe(400);
    expect((await get('00000000-0000-0000-0000-000000000000')).status).toBe(400);
    expect(apiMock).not.toHaveBeenCalled();
  });
  it('preserves backend input refusal', async () => {
    apiMock.mockRejectedValueOnce(new ApiError(400, 'bad interval'));
    expect((await get('d6a6da97-2611-4822-a2d9-dc6ad5dbeab5')).status).toBe(400);
  });
  it('preserves 404 and maps internal 500 to 503', async () => {
    apiMock.mockRejectedValueOnce(new ApiError(404, 'not found'));
    expect((await get('d6a6da97-2611-4822-a2d9-dc6ad5dbeab5')).status).toBe(404);
    apiMock.mockRejectedValueOnce(new ApiError(500, 'internal error'));
    expect((await get('d6a6da97-2611-4822-a2d9-dc6ad5dbeab5')).status).toBe(503);
  });
  it('returns actual response', async () => {
    apiMock.mockResolvedValueOnce({ candles: [], interval: 86400 });
    const res = await get('d6a6da97-2611-4822-a2d9-dc6ad5dbeab5');
    expect(res.status).toBe(200);
    expect((await res.json()).candles).toEqual([]);
  });
});
