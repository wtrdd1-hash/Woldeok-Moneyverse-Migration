import { describe, expect, it, vi } from 'vitest';
import { SafetyService } from './safety.service';
import type { SafetyRepository } from './safety.repository';

describe('chat moderation is a status record, not account enforcement', () => {
  it.each(['ACTIONED_BLOCKED', 'ACTIONED_WARNED', 'REJECTED'])(
    'returns explicit no-enforcement evidence for %s',
    async (action) => {
      const write = vi.fn().mockResolvedValue(true);
      const service = new SafetyService({ adminActionChatReport: write } as unknown as SafetyRepository);
      const result = await service.adminActionChatReport('actor', 'report', { action, note: 'evidence' });
      expect(write).toHaveBeenCalledWith('actor', 'report', action, 'evidence');
      expect(result).toEqual({
        success: true, reportId: 'report', newStatus: action,
        effect: 'report_status_only', enforcementApplied: false, notificationSent: false,
      });
    },
  );

  it('never returns success when the SQL write fails', async () => {
    const service = new SafetyService({
      adminActionChatReport: vi.fn().mockResolvedValue(false),
    } as unknown as SafetyRepository);
    await expect(service.adminActionChatReport('actor', 'report', { action: 'REJECTED' })).rejects.toThrow();
  });
});
