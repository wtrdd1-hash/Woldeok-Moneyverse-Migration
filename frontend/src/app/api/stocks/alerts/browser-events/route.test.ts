import { beforeEach, describe, expect, it, vi } from 'vitest';
const { viewerOrUnknown, api } = vi.hoisted(() => ({ viewerOrUnknown: vi.fn(), api: vi.fn() }));
vi.mock('@/lib/viewer', () => ({ viewerOrUnknown }));
vi.mock('@/lib/api', () => ({ api }));
import { GET } from './route';

describe('GET /api/stocks/alerts/browser-events', () => {
  beforeEach(() => vi.resetAllMocks());

  it('rejects guests without querying private events', async () => {
    viewerOrUnknown.mockResolvedValue({ signedIn: false });
    const response = await GET();
    expect(response.status).toBe(401);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(api).not.toHaveBeenCalled();
  });

  it('does not equate authentication outage with signed out', async () => {
    viewerOrUnknown.mockResolvedValue(null);
    expect((await GET()).status).toBe(503);
    expect(api).not.toHaveBeenCalled();
  });

  it('returns only validated member-owned server events, never localStorage scenarios', async () => {
    viewerOrUnknown.mockResolvedValue({ signedIn: true });
    api.mockImplementation(async (path: string) => path.endsWith('/events?limit=10')
      ? { events: [{ event_id: 'e1159a2d-5d54-4dc9-96a7-b96d963b5079', symbol: 'WLDX', name: 'Woldeok X', condition_kind: 'price_at_or_above', trigger_price: '1250', triggered_at: '2026-10-25T00:10:00.000Z' }] }
      : { alerts: [{ alert_id: 'a' }] });
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow');
    expect((await response.json()).activeAlertCount).toBe(1);
    expect(api).toHaveBeenCalledWith('/api/v1/stocks/alerts/events?limit=10');
    expect(api).toHaveBeenCalledWith('/api/v1/stocks/alerts');
  });

  it('returns 503 instead of a fabricated success for invalid or unavailable API data', async () => {
    viewerOrUnknown.mockResolvedValue({ signedIn: true });
    api.mockResolvedValueOnce({ alerts: [] }).mockResolvedValueOnce({ events: [{ event_id: 'fake' }] });
    expect((await GET()).status).toBe(503);
    api.mockRejectedValueOnce(new Error('database offline'));
    expect((await GET()).status).toBe(503);
  });
});
