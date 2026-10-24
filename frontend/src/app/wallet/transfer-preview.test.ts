import { describe, expect, it } from 'vitest';
import { isPreviewCurrent, transferAmountInput } from './transfer-preview';

const RECIPIENT = '22222222-2222-4222-8222-222222222222';

describe('transfer preview form safety', () => {
  it('preserves exact integer strings and rejects noncanonical input', () => {
    expect(transferAmountInput('9'.repeat(38))).toBe('9'.repeat(38));
    for (const invalid of ['0', '01', '1.2', '1e3', '-1', '']) expect(transferAmountInput(invalid)).toBeNull();
  });

  it('invalidates a preview after recipient or amount changes, or when balance is insufficient', () => {
    const preview = { recipientUserId: RECIPIENT, amount: '42', canSend: true, readOnly: true } as const;
    expect(isPreviewCurrent(preview, RECIPIENT, '42')).toBe(true);
    expect(isPreviewCurrent(preview, RECIPIENT, '43')).toBe(false);
    expect(isPreviewCurrent(preview, '33333333-3333-4333-8333-333333333333', '42')).toBe(false);
    expect(isPreviewCurrent({ ...preview, canSend: false }, RECIPIENT, '42')).toBe(false);
    expect(isPreviewCurrent(null, RECIPIENT, '42')).toBe(false);
  });
});
