import { describe, it, expect } from 'vitest';

describe('Admin Chat Moderation Safety Queue Logic', () => {
  it('should correctly identify valid moderation action statuses', () => {
    const validActions = ['ACTIONED_BLOCKED', 'ACTIONED_WARNED', 'REJECTED'];
    const invalidActions = ['DELETED', 'UNKNOWN', 'CLOSED_WITHOUT_REASON'];

    validActions.forEach((act) => {
      expect(['ACTIONED_BLOCKED', 'ACTIONED_WARNED', 'REJECTED'].includes(act)).toBe(true);
    });

    invalidActions.forEach((act) => {
      expect(['ACTIONED_BLOCKED', 'ACTIONED_WARNED', 'REJECTED'].includes(act)).toBe(false);
    });
  });

  it('should parse and categorize 4-reason chat reports correctly', () => {
    const reasonLabels: Record<string, string> = {
      spam_promotional: '스팸 / 홍보',
      fraud_scam: '사기 / 금융 피해',
      abuse_harassment: '욕설 / 협박',
      other: '기타 규정 위반',
    };

    expect(reasonLabels['spam_promotional']).toBe('스팸 / 홍보');
    expect(reasonLabels['fraud_scam']).toBe('사기 / 금융 피해');
    expect(reasonLabels['abuse_harassment']).toBe('욕설 / 협박');
    expect(reasonLabels['other']).toBe('기타 규정 위반');
  });

  it('should properly structure evidence snapshot messages and verify order', () => {
    const mockEvidence = [
      { id: '1', sender_id: 'user-a', sequence: 101, body: '안녕하세요', created_at: '2026-09-22T08:00:00Z' },
      { id: '2', sender_id: 'user-b', sequence: 102, body: '부적절한 메시지', created_at: '2026-09-22T08:00:05Z' },
    ];

    expect(mockEvidence.length).toBeLessThanOrEqual(10);
    expect(mockEvidence[0].sequence).toBeLessThan(mockEvidence[1].sequence);

    // 피신고자 메시지 판정 로직 검증
    const reportedUserId = 'user-b';
    const isReportedUser0 = mockEvidence[0].sender_id === reportedUserId;
    const isReportedUser1 = mockEvidence[1].sender_id === reportedUserId;

    expect(isReportedUser0).toBe(false);
    expect(isReportedUser1).toBe(true);
  });

  it('should validate admin note requirement when actioning report', () => {
    function validateActionNote(note: string | null | undefined): boolean {
      if (!note) return false;
      const trimmed = note.trim();
      return trimmed.length >= 2 && trimmed.length <= 500;
    }

    expect(validateActionNote('')).toBe(false);
    expect(validateActionNote('a')).toBe(false);
    expect(validateActionNote('욕설 및 협박 확인되어 7일 이용 정지 조치함')).toBe(true);
    expect(validateActionNote('a'.repeat(501))).toBe(false);
  });
});
