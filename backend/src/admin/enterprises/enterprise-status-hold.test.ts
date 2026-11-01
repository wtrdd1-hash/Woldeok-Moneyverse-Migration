import { BadRequestException } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { CsrfGuard } from '../../auth/guards/csrf.guard';
import { describe, expect, it, vi } from 'vitest';
import { AdminEnterpriseController } from './enterprise.controller';
import type { EnterpriseService } from './enterprise.service';

describe('SOE status authenticated governance endpoint v1613', () => {
  it('enforces the backend one-time CSRF guard on the state-changing PUT', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA,
      AdminEnterpriseController.prototype.updateSoeStatus) as unknown[];
    expect(guards).toContain(CsrfGuard);
  });
  it('rejects malformed body before submitting a governance change', async () => {
    const updateSoeStatus = vi.fn();
    const controller = new AdminEnterpriseController({ updateSoeStatus } as unknown as EnterpriseService);
    await expect(controller.updateSoeStatus('SOE_POWER', {
      status: 'PAUSED', reason: 12 as unknown as string, idempotencyKey: 'not-a-key',
    }, { session: { user_id: '11111111-1111-4111-8111-111111111111' } } as any
    )).rejects.toBeInstanceOf(BadRequestException);
    expect(updateSoeStatus).not.toHaveBeenCalled();
  });
});
