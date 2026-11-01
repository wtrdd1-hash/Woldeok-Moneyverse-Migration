import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { AdminEnterpriseController } from './enterprise.controller';
import type { EnterpriseService } from './enterprise.service';

describe('SOE status authenticated governance endpoint v1613', () => {
  it('rejects malformed body before submitting a governance change', async () => {
    const updateSoeStatus = vi.fn();
    const controller = new AdminEnterpriseController({ updateSoeStatus } as unknown as EnterpriseService);
    await expect(controller.updateSoeStatus('SOE_POWER', {
      status: 'PAUSED', reason: 12 as unknown as string, idempotencyKey: 'not-a-key',
    }, { session: { userId: '11111111-1111-4111-8111-111111111111' } } as any
    )).rejects.toBeInstanceOf(BadRequestException);
    expect(updateSoeStatus).not.toHaveBeenCalled();
  });
});
