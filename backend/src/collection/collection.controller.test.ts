import { describe, expect, it, vi } from 'vitest';
import { CollectionController } from './collection.controller';
import { CollectionService } from './collection.service';
import type { RequestWithSession } from '../auth/session.context';

describe('CollectionController', () => {
  const mockService = {
    listCollections: vi.fn().mockResolvedValue({ pieces: [], unverifiedRecords: '1', verificationStatus: 'unavailable' }),
    updatePiece: vi.fn().mockRejectedValue({ status: 503 }),
    getCurationStatus: vi.fn().mockResolvedValue({ status: null, verificationStatus: 'unavailable' }),
    advanceCuration: vi.fn().mockRejectedValue({ status: 503 }),
  } as unknown as CollectionService;

  const controller = new CollectionController(mockService);
  const mockReq = {
    session: {
      user_id: '11111111-1111-4111-8111-111111111111',
    },
  } as unknown as RequestWithSession;

  it('listCollections returns user collection pieces', async () => {
    const res = await controller.listCollections(mockReq);
    expect(res).toEqual({ pieces: [], unverifiedRecords: '1', verificationStatus: 'unavailable' });
    expect(mockService.listCollections).toHaveBeenCalledWith('11111111-1111-4111-8111-111111111111');
  });

  it('updatePiece updates note and favorite flag', async () => {
    await expect(controller.updatePiece(mockReq, 'piece-1', {
      userNote: '새로운 메모',
      isFavorite: false,
    })).rejects.toMatchObject({ status: 503 });
    expect(mockService.updatePiece).toHaveBeenCalledWith(
      '11111111-1111-4111-8111-111111111111',
      'piece-1',
      '새로운 메모',
      false,
    );
  });

  it('getCurationStatus and advanceCuration manage D1-D7 ownership progression', async () => {
    const statusRes = await controller.getCurationStatus(mockReq);
    expect(statusRes).toEqual({ status: null, verificationStatus: 'unavailable' });

    await expect(controller.advanceCuration(mockReq, {
      targetStep: 4,
      timelineDay: 'D7',
    })).rejects.toMatchObject({ status: 503 });
  });
});
