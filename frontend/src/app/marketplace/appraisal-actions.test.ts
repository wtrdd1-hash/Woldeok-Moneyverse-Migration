import { beforeEach, describe, expect, it, vi } from 'vitest';

const { api, mutate } = vi.hoisted(() => ({ api: vi.fn(), mutate: vi.fn() }));
vi.mock('@/lib/api', () => ({ api }));
vi.mock('@/lib/mutate', () => ({ mutate }));

import { loadAppraisals, requestAppraisal } from './appraisal-actions';

const holding = {
  catalog_id: 'item-1', name: 'Owned medal', rarity: 'EPIC', quantity: 1,
};
const certificate = {
  certId: 'CERT-2026-0123456789ABCDEF', itemId: 'item-1', itemName: 'Owned medal',
  rarity: 'EPIC', appraisedValueWld: '4000.0000', fairBandP25: '3600.0000',
  fairBandP75: '4600.0000', provenanceAuthor: 'User-provided (unverified)',
  craftedAt: '2026-10-24T00:00:00Z', appraisedAt: '2026-10-24T00:00:00Z',
  certHash: `0x${'a'.repeat(64)}`,
};

beforeEach(() => { vi.resetAllMocks(); });

describe('authenticated appraisal write/readback', () => {
  it('reads only actual backend certificates', async () => {
    api.mockResolvedValueOnce([]);
    expect(await loadAppraisals()).toEqual([]);
    expect(api).toHaveBeenCalledWith('/api/v1/marketplace/appraisals');
  });
  it('blocks forged or missing owner holdings before any WLD write', async () => {
    api.mockResolvedValueOnce({ holdings: [] });
    expect(await requestAppraisal('item-1')).toMatchObject({ status: 'refused' });
    expect(mutate).not.toHaveBeenCalled();
  });
  it('uses the authoritative holding fields and server CSRF mutation helper', async () => {
    api.mockResolvedValueOnce({ holdings: [holding] }).mockResolvedValueOnce([certificate]);
    mutate.mockResolvedValueOnce(certificate);
    const result = await requestAppraisal('item-1');
    expect(mutate).toHaveBeenCalledWith('/api/v1/marketplace/appraisals', {
      body: { itemId: 'item-1', itemName: 'Owned medal', rarity: 'EPIC' },
    });
    expect(result).toMatchObject({ status: 'confirmed', certificate });
  });
  it('does not claim a settled certificate when owner readback is absent', async () => {
    api.mockResolvedValueOnce({ holdings: [holding] }).mockResolvedValueOnce([]);
    mutate.mockResolvedValueOnce(certificate);
    expect(await requestAppraisal('item-1')).toMatchObject({ status: 'unknown' });
  });
  it('does not invent success on network failure or malformed write response', async () => {
    api.mockResolvedValue({ holdings: [holding] });
    mutate.mockRejectedValueOnce(new Error('timeout'));
    expect(await requestAppraisal('item-1')).toMatchObject({ status: 'unknown' });
    mutate.mockResolvedValueOnce({ certId: 'fabricated' });
    expect(await requestAppraisal('item-1')).toMatchObject({ status: 'unknown' });
  });
});
