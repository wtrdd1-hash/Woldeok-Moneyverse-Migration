import { describe, expect, it } from 'vitest';
import { ServiceUnavailableException } from '@nestjs/common';
import { WarfareController } from './warfare.controller';

describe('WarfareController authority boundary', () => {
  const controller = new WarfareController();

  it('refuses to publish invented territory owners and tax balances as live data', async () => {
    await expect(controller.listStrongholds()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('refuses to claim the caller belongs to an invented guild or has tax to collect', async () => {
    await expect(controller.getWarfareStatus({ session: { user_id: '11111111-1111-1111-1111-111111111111' } } as never)).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('continues to block unposted siege and tax mutations', async () => {
    await expect(controller.declareWar({} as never, {} as never)).rejects.toBeInstanceOf(ServiceUnavailableException);
    await expect(controller.attackStronghold({} as never, 'fake', {} as never)).rejects.toBeInstanceOf(ServiceUnavailableException);
    await expect(controller.claimStrongholdTax({} as never, {} as never)).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
