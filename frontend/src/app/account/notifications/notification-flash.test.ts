import { describe, expect, it } from 'vitest';
import { isNotificationSaveConfirmed } from './notification-flash';

const nonce = 'abcdef0123456789abcdef0123456789';

describe('notification preference server-issued confirmation', () => {
  it('never treats a URL-only saved=1 or forged nonce as proof', () => {
    expect(isNotificationSaveConfirmed('1', undefined, true)).toBe(false);
    expect(isNotificationSaveConfirmed(nonce, undefined, true)).toBe(false);
    expect(isNotificationSaveConfirmed(nonce, 'ffffffffffffffffffffffffffffffff:1', true)).toBe(false);
  });
  it('requires a matching short-lived server cookie and fresh owner readback', () => {
    expect(isNotificationSaveConfirmed(nonce, `${nonce}:1`, true)).toBe(true);
    expect(isNotificationSaveConfirmed(nonce, `${nonce}:0`, false)).toBe(true);
    expect(isNotificationSaveConfirmed(nonce, `${nonce}:1`, false)).toBe(false);
    expect(isNotificationSaveConfirmed(nonce, `${nonce}:0`, null)).toBe(false);
  });
  it('rejects malformed cookies and nonces without accepting a substring', () => {
    expect(isNotificationSaveConfirmed(nonce, `${nonce}:1:extra`, true)).toBe(false);
    expect(isNotificationSaveConfirmed(`${nonce}1`, `${nonce}:1`, true)).toBe(false);
    expect(isNotificationSaveConfirmed(nonce.toUpperCase(), `${nonce}:1`, true)).toBe(false);
    expect(isNotificationSaveConfirmed([nonce], `${nonce}:1`, true)).toBe(false);
  });
});
