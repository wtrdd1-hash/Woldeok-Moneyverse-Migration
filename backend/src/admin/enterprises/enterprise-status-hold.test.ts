import { ServiceUnavailableException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { AdminEnterpriseController } from './enterprise.controller';
import type { EnterpriseService } from './enterprise.service';

describe('SOE status mutation release hold', () => {
  it('refuses status writes until a DB-owned receipt and least-privilege contract exist', async () => {
    const updateSoeStatus = vi.fn();
    const controller = new AdminEnterpriseController({ updateSoeStatus } as unknown as EnterpriseService);
    await expect(controller.updateSoeStatus('SOE_POWER', 'PAUSED')).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(updateSoeStatus).not.toHaveBeenCalled();
  });
});
