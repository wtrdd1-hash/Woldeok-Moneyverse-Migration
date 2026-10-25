import { describe, expect, it, vi } from 'vitest';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import type { RequestWithSession } from '../auth/session.context';
import { CasinoController } from './casino.controller';
import type { CasinoHistoryRow } from './casino.repository';
import { summarizeCasinoHistory } from './casino-history-summary';

const row = (stake: string, net: string, suffix: number): CasinoHistoryRow => ({
  play_id: `00000000-0000-4000-8000-${String(suffix).padStart(12, '0')}`,
  game: 'coin',
  choice: 'heads',
  outcome: 'heads',
  stake_amount: stake,
  net_amount: net,
  transaction_id: `00000000-0000-4000-8001-${String(suffix).padStart(12, '0')}`,
  played_at: new Date('2026-10-25T00:00:00.000Z'),
});

describe('owner casino recent-play summary', () => {
  it('reports an empty sample without claiming lifetime profit', () => {
    expect(summarizeCasinoHistory([])).toMatchObject({
      scope: 'last_20_recorded_plays', sampleLimit: 20, playCount: 0,
      totalStakeWld: '0', netWld: '0', winCount: 0, lossCount: 0, evenCount: 0, plays: [],
    });
  });

  it('sums signed amounts exactly past JS safe integer and distinguishes wins, losses and pushes', () => {
    const plays = [row('900719925474099312345', '900719925474099312346', 1), row('25', '-100', 2), row('7', '0', 3)];
    expect(summarizeCasinoHistory(plays)).toMatchObject({
      scope: 'last_20_recorded_plays', playCount: 3,
      totalStakeWld: '900719925474099312377', netWld: '900719925474099312246',
      winCount: 1, lossCount: 1, evenCount: 1, plays,
    });
  });

  it('rejects invalid database amounts and sample sizes instead of reporting fake zero', () => {
    expect(() => summarizeCasinoHistory([row('1.5', '2', 1)])).toThrow();
    expect(() => summarizeCasinoHistory([row('-1', '2', 1)])).toThrow();
    expect(() => summarizeCasinoHistory([row('1', 'NaN', 1)])).toThrow();
    expect(() => summarizeCasinoHistory([row('1', '0', 1), row('1', '0', 1)])).toThrow();
    expect(() => summarizeCasinoHistory(Array.from({ length: 21 }, (_, i) => row('1', '0', i + 1)))).toThrow();
  });
});


describe('casino summary authorization and data provenance', () => {
  it('keeps session, membership, consent and CSRF guard stack', () => {
    expect(Reflect.getMetadata(GUARDS_METADATA, CasinoController)).toEqual([
      SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard,
    ]);
  });

  it('derives the actor exclusively from authenticated session and reuses DB history', async () => {
    const history = vi.fn(async () => [row('10', '-10', 1)]);
    const controller = new CasinoController({ history } as never);
    const actor = '00000000-0000-4000-8000-000000000123';
    const result = await controller.historySummary({ session: { user_id: actor } } as RequestWithSession);
    expect(history).toHaveBeenCalledExactlyOnceWith(actor);
    expect(result.netWld).toBe('-10');
    await expect(controller.historySummary({} as RequestWithSession)).rejects.toThrow('guard order defect');
    expect(history).toHaveBeenCalledTimes(1);
  });
});
