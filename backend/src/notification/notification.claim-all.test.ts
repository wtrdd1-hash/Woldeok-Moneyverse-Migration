import { ConflictException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { NotificationService } from './notification.service';

describe('notification reward claim integrity', () => {
  it('never marks read or invents a payout', async () => {
    const service = new NotificationService(null);
    const read = vi.spyOn(service, 'markAllRead');
    await expect(service.claimAll('11111111-1111-4111-8111-111111111111'))
      .rejects.toBeInstanceOf(ConflictException);
    expect(read).not.toHaveBeenCalled();
  });
});
