import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { RequestWithSession } from '../auth/session.context';
import { WalletController } from './wallet.controller';
import type { WalletService } from './wallet.service';

const ACTOR = '11111111-1111-4111-8111-111111111111';
const request = { session: { user_id: ACTOR } } as unknown as RequestWithSession;

function setup() {
  const overview = vi.fn().mockResolvedValue({ balances: [], recentTransactions: [] });
  return { controller: new WalletController({ overview } as unknown as WalletService), overview };
}

describe('GET /api/v1/wallet recent query boundary', () => {
  it.each([
    '', ' ', '\t', '0', '-1', '51', '0001', '01', '1.0', '1e1', '0x10', '+1',
    'Infinity', 'NaN', '1junk', '9007199254740993', ['1', '2'], ['1'], {}, 1,
  ])('rejects malformed recent %j before reading owner balances or ledger', (recent) => {
    const { controller, overview } = setup();
    expect(() => controller.overview(request, recent as string)).toThrow(BadRequestException);
    expect(overview).not.toHaveBeenCalled();
  });

  it.each(['1', '10', '50'])('accepts canonical recent %s without changing owner or period', (recent) => {
    const { controller, overview } = setup();
    controller.overview(request, recent, '30d');
    expect(overview).toHaveBeenCalledExactlyOnceWith(ACTOR, { recentLimit: Number(recent), periodDays: 30 });
  });

  it('preserves the default bounded wallet overview when recent is absent', () => {
    const { controller, overview } = setup();
    controller.overview(request, undefined, '7d');
    expect(overview).toHaveBeenCalledExactlyOnceWith(ACTOR, { periodDays: 7 });
  });
});
