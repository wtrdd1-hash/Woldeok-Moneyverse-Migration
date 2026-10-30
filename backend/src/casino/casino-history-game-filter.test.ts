import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { RequestWithSession } from '../auth/session.context';
import { CasinoController } from './casino.controller';
import type { CasinoRepository } from './casino.repository';

const ACTOR = '00000000-0000-4000-8000-000000000001';
const OTHER = '00000000-0000-4000-8000-000000000002';
const rows = [
  { play_id: '00000000-0000-4000-8000-000000000011', game: 'dice_parity', stake_amount: '9007199254740993', net_amount: '-9007199254740993' },
  { play_id: '00000000-0000-4000-8000-000000000012', game: 'coin', stake_amount: '10', net_amount: '10' },
];
const req = { session: { user_id: ACTOR } } as unknown as RequestWithSession;

describe('owner arcade history game filter', () => {
  it('filters only the owner-scoped recent 20 source rows, retaining integer strings', async () => {
    const history = vi.fn().mockResolvedValue(rows);
    const controller = new CasinoController({ history } as unknown as CasinoRepository);
    expect(await controller.history(req, 'coin')).toEqual([rows[1]]);
    expect(history).toHaveBeenCalledWith(ACTOR);
    expect(await controller.history(req, undefined)).toEqual(rows);
    expect(await controller.history(req, 'all')).toEqual(rows);
    expect(history).not.toHaveBeenCalledWith(OTHER);
  });

  it('rejects duplicates, unknown games and non-string filters before reading SQL', async () => {
    const history = vi.fn().mockResolvedValue(rows);
    const controller = new CasinoController({ history } as unknown as CasinoRepository);
    for (const game of [['coin', 'dice_parity'], 'roulette', 'hilo_20', '', 12]) {
      await expect(controller.history(req, game as string)).rejects.toBeInstanceOf(BadRequestException);
    }
    expect(history).not.toHaveBeenCalled();
  });

  it('accepts every game emitted by the canonical history read model', async () => {
    const history = vi.fn().mockResolvedValue([]);
    const controller = new CasinoController({ history } as unknown as CasinoRepository);
    for (const game of ['coin', 'dice_parity', 'dice_number']) {
      expect(await controller.history(req, game)).toEqual([]);
    }
    expect(history).toHaveBeenCalledTimes(3);
  });
});
