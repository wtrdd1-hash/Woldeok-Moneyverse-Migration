import { describe, expect, it, vi } from 'vitest';
import { ServiceUnavailableException } from '@nestjs/common';
import { DopamineController } from './dopamine.controller';
import type { DopamineRepository } from './dopamine.repository';
import type { RequestWithSession } from '../auth/session.context';

const actor = { session: { user_id: '11111111-2222-4333-8444-555555555555' } } as unknown as RequestWithSession;

describe('attendance integrity gate', () => {
  it('never invents a checked-in status when database repository is unavailable', async () => {
    await expect(new DopamineController(null).getAttendanceStatus(actor)).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('serves only the authenticated actor status returned by the database', async () => {
    const status = { checkedInToday: true, streakDays: 4, lastAttendedDate: '2026-10-25', nextRewardPreview: 50, isJackpotEligible: false };
    const repo = { getAttendanceStatus: vi.fn().mockResolvedValue(status) } as unknown as DopamineRepository;
    expect(await new DopamineController(repo).getAttendanceStatus(actor)).toEqual(status);
    expect(repo.getAttendanceStatus).toHaveBeenCalledWith(actor.session!.user_id);
  });

  it('refuses reward claims before non-atomic attendance and ledger writes for any idempotency key', async () => {
    const repo = { claimAttendanceSpin: vi.fn() } as unknown as DopamineRepository;
    await expect(new DopamineController(repo).claimAttendanceSpin(actor, { idempotencyKey: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee' }))
      .rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(repo.claimAttendanceSpin).not.toHaveBeenCalled();
  });

  it('refuses reward claims even if no database repository was injected', async () => {
    await expect(new DopamineController(null).claimAttendanceSpin(actor, {})).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
