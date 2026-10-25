import { beforeEach, describe, expect, it, vi } from 'vitest';

const { viewerOrUnknown, apiOrNull, api } = vi.hoisted(() => ({
  viewerOrUnknown: vi.fn(),
  apiOrNull: vi.fn(),
  api: vi.fn(),
}));
vi.mock('@/lib/viewer', () => ({ viewerOrUnknown }));
vi.mock('@/lib/api', () => ({ apiOrNull, api }));

import { GET } from './status/route';
import { POST } from './spin/route';

describe('attendance BFF integrity', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    viewerOrUnknown.mockResolvedValue({ signedIn: true });
  });

  it('reports signed-out status without private database access', async () => {
    viewerOrUnknown.mockResolvedValue({ signedIn: false });
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect((await response.json()).signedIn).toBe(false);
    expect(apiOrNull).not.toHaveBeenCalled();
  });

  it('never converts a failed database read into a fabricated attendance streak', async () => {
    apiOrNull.mockResolvedValue(null);
    const response = await GET();
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(await response.json()).toMatchObject({ ok: false, code: 'ATTENDANCE_STATUS_UNAVAILABLE' });
  });

  it('rejects invalid backend status instead of displaying a fake day-one check-in', async () => {
    apiOrNull.mockResolvedValue({ checkedInToday: true, streakDays: -1 });
    expect((await GET()).status).toBe(503);
  });

  it('preserves the actual database status with private cache headers', async () => {
    apiOrNull.mockResolvedValue({ checkedInToday: true, streakDays: 3, lastAttendedDate: '2026-10-25', nextRewardPreview: 30, isJackpotEligible: false });
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(await response.json()).toMatchObject({ signedIn: true, checkedInToday: true, streakDays: 3 });
  });

  it('blocks a signed-in claim before contacting the unsafe backend and never claims a WLD payment', async () => {
    const response = await POST();
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(await response.json()).toMatchObject({ ok: false, code: 'ATTENDANCE_SETTLEMENT_UNVERIFIED' });
    expect(api).not.toHaveBeenCalled();
  });

  it('keeps unauthenticated claim requests at 401', async () => {
    viewerOrUnknown.mockResolvedValue(null);
    expect((await POST()).status).toBe(401);
    expect(api).not.toHaveBeenCalled();
  });
});
