import { describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
import { ApiError } from './api';
import { failure } from './mutate';

describe('structured recent reauthentication refusal', () => {
  it('distinguishes expired recent identity verification from an expired login', () => {
    expect(failure(new ApiError(401, 'recent auth expired', 'reauthentication_required'), 'failed')).toMatchObject({
      status: 'error',
      reauthenticationRequired: true,
    });
  });

  it('does not direct ordinary 401 or unrelated server failures to reauthentication', () => {
    expect(failure(new ApiError(401, 'session expired'), 'failed').reauthenticationRequired).not.toBe(true);
    expect(failure(new ApiError(503, 'service unavailable'), 'failed').reauthenticationRequired).not.toBe(true);
  });
});
