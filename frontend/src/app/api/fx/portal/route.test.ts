import { beforeEach, describe, expect, it, vi } from 'vitest';

const { publicApi } = vi.hoisted(() => ({ publicApi: vi.fn() }));
vi.mock('@/lib/api', () => ({ publicApi }));

import { GET } from './route';

const valid = {
  success: true,
  data: {
    reserves: {
      currency: 'USD', currentRate: 1352.5, totalReservesUsd: 1000000,
      isHalted: false, updatedAt: '2026-10-25T12:00:00.000Z',
    },
    history: [{ id: 'a', rate: 1352.5, changePct: 0.1, volumeUsd: 12, interventionType: 'NONE', createdAt: '2026-10-25T12:00:00.000Z' }],
  },
};

describe('public FX portal gateway', () => {
  beforeEach(() => publicApi.mockReset());

  it('forwards validated server data without caching', async () => {
    publicApi.mockResolvedValue(valid);
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('public, no-store');
    expect(await response.json()).toEqual(valid);
    expect(publicApi).toHaveBeenCalledWith('/api/v1/fx/portal', 0);
  });

  it.each([null, { success: false }, { success: true, data: { reserves: { ...valid.data.reserves, currentRate: 0 }, history: [] } }, { success: true, data: { ...valid.data, history: [{ ...valid.data.history[0], rate: NaN }] } }])(
    'fails closed when FX read model is missing or malformed', async (value) => {
      publicApi.mockResolvedValue(value);
      const response = await GET();
      expect(response.status).toBe(503);
      expect(response.headers.get('cache-control')).toContain('no-store');
      expect((await response.json()).success).toBe(false);
    },
  );
});
