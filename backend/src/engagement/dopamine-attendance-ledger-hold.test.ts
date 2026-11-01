import { describe, expect, it, vi } from 'vitest';
import type { RequestWithSession } from '../auth/session.context';
import { DopamineController } from './dopamine.controller';
import { DopamineRepository } from './dopamine.repository';

const USER = '11111111-2222-4333-8444-555555555555';
const KEY = '11111111-2222-4333-8444-555555555556';
const memberRequest = { session: { user_id: USER } } as unknown as RequestWithSession;

describe('P0 attendance roulette ledger safety', () => {
  it('refuses unverified attendance status even without a repository', async () => {
    await expect(new DopamineController(null).getAttendanceStatus(memberRequest)).rejects.toMatchObject({
      status: 503,
      response: { code: 'ATTENDANCE_EVIDENCE_UNAVAILABLE' },
    });
  });

  it('never asks a repository for an unverified attendance reward preview', async () => {
    const getAttendanceStatus = vi.fn().mockResolvedValue({
      checkedInToday: false, streakDays: 7, nextRewardPreview: 1000,
    });
    const controller = new DopamineController({ getAttendanceStatus } as unknown as DopamineRepository);
    await expect(controller.getAttendanceStatus(memberRequest)).rejects.toMatchObject({ status: 503 });
    expect(getAttendanceStatus).not.toHaveBeenCalled();
  });

  it('refuses a fabricated WLD spin receipt when the repository is missing', async () => {
    await expect(new DopamineController(null).claimAttendanceSpin(memberRequest, { idempotencyKey: KEY })).rejects.toMatchObject({
      status: 503,
      response: { code: 'ATTENDANCE_SETTLEMENT_UNAVAILABLE' },
    });
  });

  it('never invokes the legacy non-atomic attendance settlement even with a repository', async () => {
    const claimAttendanceSpin = vi.fn().mockResolvedValue({ success: true, rewardAmount: 1000, newBalance: '1000' });
    const controller = new DopamineController({ claimAttendanceSpin } as unknown as DopamineRepository);
    await expect(controller.claimAttendanceSpin(memberRequest, { idempotencyKey: KEY })).rejects.toMatchObject({ status: 503 });
    expect(claimAttendanceSpin).not.toHaveBeenCalled();
  });

  it('rejects direct repository attendance reads without querying revoked member tables', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const repository = new DopamineRepository({ query } as never);
    await expect(repository.getAttendanceStatus(USER)).rejects.toThrow(/attendance.*unavailable/i);
    expect(query).not.toHaveBeenCalled();
  });

  it('rejects direct repository attendance mint without any SQL or ledger mutation', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const repository = new DopamineRepository({ query } as never);
    await expect(repository.claimAttendanceSpin(USER, KEY)).rejects.toThrow(/attendance.*unavailable/i);
    expect(query).not.toHaveBeenCalled();
  });
});
