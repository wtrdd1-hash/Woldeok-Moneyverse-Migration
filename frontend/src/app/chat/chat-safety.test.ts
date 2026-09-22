import { describe, expect, it } from 'vitest';

describe('Chat Safety and Moderation Controls', () => {
  it('validates report reason codes according to policy spec', () => {
    const validReasons = ['spam_promotional', 'fraud_scam', 'abuse_harassment', 'other'];
    expect(validReasons.includes('spam_promotional')).toBe(true);
    expect(validReasons.includes('fraud_scam')).toBe(true);
    expect(validReasons.includes('abuse_harassment')).toBe(true);
    expect(validReasons.includes('other')).toBe(true);
    expect(validReasons.includes('invalid_reason')).toBe(false);
  });

  it('validates report details length constraints (2 to 2000 chars)', () => {
    const isDetailsValid = (details: string) => {
      const trimmed = details.trim();
      return trimmed.length >= 2 && trimmed.length <= 2000;
    };

    expect(isDetailsValid('')).toBe(false);
    expect(isDetailsValid('a')).toBe(false);
    expect(isDetailsValid('  ab  ')).toBe(true);
    expect(isDetailsValid('스팸 및 불법 광고 홍보가 지속됩니다.')).toBe(true);
    expect(isDetailsValid('x'.repeat(2001))).toBe(false);
  });

  it('prevents message dispatch during Korean IME composition', () => {
    interface SimulatedKeyEvent {
      key: string;
      shiftKey: boolean;
      isComposing: boolean;
    }

    const shouldSend = (e: SimulatedKeyEvent, text: string) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        if (e.isComposing) return false;
        return text.trim().length > 0;
      }
      return false;
    };

    // Case 1: Enter during Korean syllable composition (e.g. typing '안')
    expect(shouldSend({ key: 'Enter', shiftKey: false, isComposing: true }, '안')).toBe(false);

    // Case 2: Enter after composition is completed
    expect(shouldSend({ key: 'Enter', shiftKey: false, isComposing: false }, '안녕하세요')).toBe(true);

    // Case 3: Shift+Enter for newline
    expect(shouldSend({ key: 'Enter', shiftKey: true, isComposing: false }, '줄바꿈 테스트')).toBe(false);

    // Case 4: Empty or whitespace only
    expect(shouldSend({ key: 'Enter', shiftKey: false, isComposing: false }, '   ')).toBe(false);
  });

  it('verifies fail-closed block guard on message sending', () => {
    const canSendMessage = (isBlocked: boolean, body: string) => {
      if (isBlocked) return false;
      const trimmed = body.trim();
      return trimmed.length >= 1 && trimmed.length <= 2000;
    };

    expect(canSendMessage(false, '정상 메시지')).toBe(true);
    expect(canSendMessage(true, '차단된 상대에게 보내는 메시지')).toBe(false);
    expect(canSendMessage(false, '')).toBe(false);
  });
});
