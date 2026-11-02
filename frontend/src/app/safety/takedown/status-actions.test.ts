import { beforeEach, describe, expect, it, vi } from 'vitest';
const apiMock = vi.hoisted(() => vi.fn());
vi.mock('server-only', () => ({}));
vi.mock('@/lib/api', () => ({
  api: apiMock,
  ApiError: class ApiError extends Error {
    constructor(public readonly status: number) { super(`HTTP ${status}`); }
  },
}));
import { ApiError } from '@/lib/api';
import { lookupEmergencyTakedown, type TakedownLookupState } from './status-actions';

const idle: TakedownLookupState = { status: 'idle' };
const form = (caseId = 'CASE-2026-00001', passcode = 'mysecret') => {
  const data = new FormData();
  data.set('caseId', caseId);
  data.set('passcode', passcode);
  return data;
};
const response = {
  caseId: 'CASE-2026-00001', status: 'SUBMITTED',
  reasonCategory: 'harassment_stalking', targetContentType: 'board_post',
  createdAt: '2026-11-02T10:00:00.000Z', actionedAt: null,
};

describe('guest status server action', () => {
  beforeEach(() => apiMock.mockReset());
  it('queries the real POST endpoint without serializing the passcode into returned state', async () => {
    apiMock.mockResolvedValue(response);
    const result = await lookupEmergencyTakedown(idle, form());
    expect(apiMock).toHaveBeenCalledWith('/api/v1/safety/takedown/status', {
      method: 'POST', body: { caseId: 'CASE-2026-00001', passcode: 'mysecret' }, timeoutMs: 10000,
    });
    expect(result.status).toBe('ok');
    expect(result.receipt).toEqual(response);
    expect(JSON.stringify(result)).not.toContain('mysecret');
  });
  it('rejects invalid credentials before any backend call', async () => {
    const result = await lookupEmergencyTakedown(idle, form('abc', '123'));
    expect(result.status).toBe('error');
    expect(apiMock).not.toHaveBeenCalled();
  });
  it('fails closed on success-shaped invalid backend data', async () => {
    apiMock.mockResolvedValue({ ...response, status: 'FAKE_SUCCESS' });
    const result = await lookupEmergencyTakedown(idle, form());
    expect(result.status).toBe('error');
    expect(result.receipt).toBeUndefined();
  });
  it('distinguishes wrong case/passcode from a temporary backend failure', async () => {
    apiMock.mockRejectedValueOnce(new ApiError(404)).mockRejectedValueOnce(new ApiError(503));
    const wrong = await lookupEmergencyTakedown(idle, form());
    const outage = await lookupEmergencyTakedown(idle, form());
    expect(wrong.status).toBe('error');
    expect(wrong.message).toMatch(/접수 번호|비밀번호/);
    expect(outage.status).toBe('error');
    expect(outage.message).toMatch(/일시적|다시/);
    expect(JSON.stringify([wrong, outage])).not.toContain('mysecret');
  });
});
