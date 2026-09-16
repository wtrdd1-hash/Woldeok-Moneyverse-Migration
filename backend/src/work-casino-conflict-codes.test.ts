import { ConflictException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { CasinoController } from './casino/casino.controller';
import { WorkController } from './work/work.controller';

function expectedFailure(message: string): Error & { code: string } {
  return Object.assign(new Error(message), { code: '22023' });
}

describe('stable work/casino 409 refusal codes', () => {
  it('labels the member-wide work reward quota', async () => {
    const controller = new WorkController(null);
    const guarded = (controller as unknown as { guarded<T>(work: () => Promise<T>, fallback: string): Promise<T> }).guarded.bind(controller);
    try {
      await guarded(() => Promise.reject(expectedFailure('work reward quota reached')), 'failed to complete task');
      throw new Error('expected conflict');
    } catch (error) {
      expect(error).toBeInstanceOf(ConflictException);
      expect((error as ConflictException).getResponse()).toMatchObject({
        message: 'work reward quota reached',
        code: 'work_reward_quota_reached',
      });
    }
  });

  it('labels the casino daily loss refusal without hiding its cause', () => {
    const controller = new CasinoController(null);
    const mapped = (controller as unknown as {
      mapped(error: unknown, refusal: { conflict: string; forbidden: string }): unknown;
    }).mapped.bind(controller);
    const error = mapped(expectedFailure('daily loss limit reached'), {
      conflict: 'the play was not accepted', forbidden: 'forbidden',
    });
    expect(error).toBeInstanceOf(ConflictException);
    expect((error as ConflictException).getResponse()).toMatchObject({
      message: 'daily loss limit reached',
      code: 'casino_daily_loss_limit_reached',
    });
  });
});
