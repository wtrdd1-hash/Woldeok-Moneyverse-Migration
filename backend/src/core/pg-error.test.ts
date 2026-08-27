import { describe, expect, it } from 'vitest';
import { isAuthorizationFailure, isExpectedCommandFailure, pgErrorCode } from './pg-error';

describe('pgErrorCode', () => {
  it('reads a string code off an error-shaped object', () => {
    expect(pgErrorCode({ code: '23505' })).toBe('23505');
  });

  it('ignores a non-string code', () => {
    expect(pgErrorCode({ code: 23505 })).toBeUndefined();
  });

  it('ignores an error with no code', () => {
    expect(pgErrorCode(new Error('boom'))).toBeUndefined();
  });

  it('ignores null and primitives', () => {
    expect(pgErrorCode(null)).toBeUndefined();
    expect(pgErrorCode('23505')).toBeUndefined();
  });
});

describe('isExpectedCommandFailure', () => {
  it.each(['22023', '23505', '55000', 'P0001'])('recognises %s', (code) => {
    expect(isExpectedCommandFailure({ code })).toBe(true);
  });

  it('does not swallow an unexpected code', () => {
    expect(isExpectedCommandFailure({ code: '42501' })).toBe(false);
  });

  // A permission denial means the role lost a grant it is supposed to hold.
  // Reporting that as a conflict would hide a broken deployment behind a
  // message telling the user to try again.
  it('does not treat a permission denial as an expected failure', () => {
    expect(isExpectedCommandFailure({ code: '42501' })).toBe(false);
  });
});

describe('isAuthorizationFailure', () => {
  it('recognises 28000', () => {
    expect(isAuthorizationFailure({ code: '28000' })).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isAuthorizationFailure({ code: '23505' })).toBe(false);
  });
});
