import { describe, expect, it, vi } from 'vitest';
import { PocketController } from './pocket.controller';
import type { BankRepository } from './bank.repository';
import type { RequestWithSession } from '../auth/session.context';

describe('PocketController', () => {
  const mockRepo = {
    listPockets: vi.fn().mockResolvedValue([{ pocket_id: 'p1', name: '비상금' }]),
    createPocket: vi.fn().mockResolvedValue({ pocket_id: 'p1' }),
    transferPocket: vi.fn().mockResolvedValue({ new_pocket_balance: '1000' }),
    customizePocket: vi.fn().mockResolvedValue({ theme_color: 'sky' }),
    archivePocket: vi.fn().mockResolvedValue({ returned_balance: '1000' }),
  } as unknown as BankRepository;

  const controller = new PocketController(mockRepo);
  const mockReq = {
    session: {
      user_id: '11111111-1111-4111-8111-111111111111',
    },
  } as unknown as RequestWithSession;

  it('listPockets returns pocket list for current user', async () => {
    const result = await controller.listPockets(mockReq);
    expect(result).toEqual([{ pocket_id: 'p1', name: '비상금' }]);
    expect(mockRepo.listPockets).toHaveBeenCalledWith('11111111-1111-4111-8111-111111111111');
  });

  it('createPocket calls repository with dto params', async () => {
    const result = await controller.createPocket(mockReq, {
      name: '비상금',
      targetAmount: '50000',
      idempotencyKey: '22222222-2222-4222-8222-222222222222',
    });
    expect(result).toEqual({ pocket_id: 'p1' });
  });
});
