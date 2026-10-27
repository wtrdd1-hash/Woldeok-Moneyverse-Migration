import { describe, expect, it } from 'vitest';
import { ApiError } from './api';
import { failure } from './mutate';

describe('failure recent-reauthentication classification', () => {
  it('preserves machine-readable recent verification refusals for administrator UI recovery', () => {
    const result = failure(new ApiError(401, 'recent reauthentication required', 'reauthentication_required'), 'fallback');
    expect(result.status).toBe('error');
    expect(result.errorCode).toBe('reauthentication_required');
    expect(result.message).toContain('본인 확인');
  });

  it('does not classify expired sessions, forbidden users, or arbitrary errors as recent verification', () => {
    expect(failure(new ApiError(401), 'fallback')).toEqual({ status: 'error', message: '로그인이 필요해요.' });
    expect(failure(new ApiError(403), 'fallback').errorCode).toBeUndefined();
    expect(failure(new Error('network unavailable'), 'fallback').errorCode).toBeUndefined();
  });
});
