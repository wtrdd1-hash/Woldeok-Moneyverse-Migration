import { describe, expect, it, vi } from 'vitest';
import { CollectionController } from './collection.controller';
import { CollectionService } from './collection.service';
import type { RequestWithSession } from '../auth/session.context';

describe('CollectionController', () => {
  const mockService = {
    listCollections: vi.fn().mockResolvedValue([
      {
        id: 'piece-1',
        code: 'FIRST_CAPITAL_BADGE',
        name: '최초의 수도 개척 훈장',
        isFavorite: true,
        userNote: '첫 시즌 기념 훈장',
      },
    ]),
    updatePiece: vi.fn().mockResolvedValue(true),
    getCurationStatus: vi.fn().mockResolvedValue({
      ladderStep: 3,
      timelineDay: 'D3',
      updatedAt: '2026-09-23T12:00:00Z',
    }),
    advanceCuration: vi.fn().mockResolvedValue({
      ladderStep: 4,
      timelineDay: 'D7',
      updatedAt: '2026-09-23T12:05:00Z',
    }),
  } as unknown as CollectionService;

  const controller = new CollectionController(mockService);
  const mockReq = {
    session: {
      user_id: '11111111-1111-4111-8111-111111111111',
    },
  } as unknown as RequestWithSession;

  it('listCollections returns user collection pieces', async () => {
    const res = await controller.listCollections(mockReq);
    expect(res.pieces).toHaveLength(1);
    expect(mockService.listCollections).toHaveBeenCalledWith('11111111-1111-4111-8111-111111111111');
  });

  it('updatePiece updates note and favorite flag', async () => {
    const res = await controller.updatePiece(mockReq, 'piece-1', {
      userNote: '새로운 메모',
      isFavorite: false,
    });
    expect(res.ok).toBe(true);
    expect(mockService.updatePiece).toHaveBeenCalledWith(
      '11111111-1111-4111-8111-111111111111',
      'piece-1',
      '새로운 메모',
      false,
    );
  });

  it('getCurationStatus and advanceCuration manage D1-D7 ownership progression', async () => {
    const statusRes = await controller.getCurationStatus(mockReq);
    expect(statusRes.status.ladderStep).toBe(3);

    const advanceRes = await controller.advanceCuration(mockReq, {
      targetStep: 4,
      timelineDay: 'D7',
    });
    expect(advanceRes.status.ladderStep).toBe(4);
    expect(advanceRes.status.timelineDay).toBe('D7');
  });
});
