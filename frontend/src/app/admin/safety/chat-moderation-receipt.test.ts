import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { verifyChatModerationReceipt } from './chat-moderation-receipt';

const receipt = {
  success: true, reportId: 'report-1', newStatus: 'ACTIONED_BLOCKED',
  effect: 'report_status_only', enforcementApplied: false, notificationSent: false,
};

describe('chat moderation receipt truth', () => {
  it('accepts only a matching persisted status-only receipt', () => {
    expect(verifyChatModerationReceipt(receipt, 'report-1', 'ACTIONED_BLOCKED')).toBe(true);
    for (const change of [
      { success: false }, { reportId: 'other' }, { newStatus: 'REJECTED' },
      { effect: 'account_blocked' }, { enforcementApplied: true },
      { notificationSent: true }, { enforcementApplied: undefined },
    ]) {
      expect(verifyChatModerationReceipt({ ...receipt, ...change }, 'report-1', 'ACTIONED_BLOCKED')).toBe(false);
    }
    expect(verifyChatModerationReceipt(null, 'report-1', 'ACTIONED_BLOCKED')).toBe(false);
  });

  it('never presents a recorded decision as confirmed account blocking or warning delivery', () => {
    const page = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8');
    const dialog = readFileSync(new URL('./chat-report-action-dialog.tsx', import.meta.url), 'utf8');
    const action = readFileSync(new URL('./actions.ts', import.meta.url), 'utf8');
    expect(page).toContain('차단 결정 기록 (실제 계정 차단 미확인)');
    expect(page).toContain('경고 결정 기록 (실제 알림 미발송)');
    expect(dialog).toContain('실제 계정 차단이나 경고 알림 발송은 자동 실행되지 않습니다');
    expect(dialog).not.toContain('공식 경고 발송 (Warned)');
    expect(dialog).not.toContain('즉시 이용을 제한합니다.');
    expect(action).toContain('verifyChatModerationReceipt');
    expect(action).toContain('계정 차단이나 경고 알림은 실행되지 않았습니다');
  });
});
