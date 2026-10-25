import { describe, expect, it, vi } from 'vitest';
import { ServiceUnavailableException } from '@nestjs/common';
import type { RequestWithSession } from '../auth/session.context';
import { ShopController } from './shop.controller';
import type { ShopCatalogRepository, ShopHoldingRow } from './shop.repository';

const ACTOR = '00000000-0000-4000-8000-000000000001';
const session = { session: { user_id: ACTOR } } as unknown as RequestWithSession;
const sample = { catalog_id: '00000000-0000-4000-8000-000000000002', code: 'frame_1', name: 'Frame', quantity: 1 } as ShopHoldingRow;

describe('private complete inventory export snapshot', () => {
  it('uses the guarded session actor rather than a client-supplied member ID', async () => {
    const holdings = vi.fn().mockResolvedValue([sample]);
    const controller = new ShopController(null, { holdings } as unknown as ShopCatalogRepository);
    await expect(controller.exportSnapshot(session)).resolves.toEqual({ holdings: [sample], complete: true });
    expect(holdings).toHaveBeenCalledExactlyOnceWith(ACTOR);
  });

  it('never labels an over-cap inventory as a complete export', async () => {
    const holdings = vi.fn().mockResolvedValue(Array.from({ length: 101 }, () => sample));
    const controller = new ShopController(null, { holdings } as unknown as ShopCatalogRepository);
    await expect(controller.exportSnapshot(session)).rejects.toThrow(ServiceUnavailableException);
  });

  it('rejects a failed read rather than returning an empty successful export', async () => {
    const holdings = vi.fn().mockRejectedValue(new Error('DB unavailable'));
    const controller = new ShopController(null, { holdings } as unknown as ShopCatalogRepository);
    await expect(controller.exportSnapshot(session)).rejects.toThrow('DB unavailable');
  });
});
