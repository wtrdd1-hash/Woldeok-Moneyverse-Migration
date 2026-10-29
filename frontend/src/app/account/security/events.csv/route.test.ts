import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiMock, memberMock } = vi.hoisted(() => ({ apiMock: vi.fn(), memberMock: vi.fn() }));
vi.mock('@/lib/api', () => ({ api: apiMock }));
vi.mock('@/lib/session', () => ({ requireMember: memberMock }));

import { GET } from './route';

const event = { type: 'local_login_succeeded', createdAt: '2026-10-30T00:01:02.000Z' };

beforeEach(() => {
  vi.clearAllMocks();
  memberMock.mockResolvedValue(undefined);
  apiMock.mockResolvedValue({ events: [event] });
});

describe('owner-private security activity CSV', () => {
  it('gates the member before requesting verified events and emits a non-cacheable download', async () => {
    const response = await GET();
    expect(memberMock).toHaveBeenCalledOnce();
    expect(apiMock).toHaveBeenCalledWith('/api/v1/account/security/events');
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow');
    expect(response.headers.get('content-disposition')).toContain('attachment;');
    expect(response.headers.get('content-type')).toContain('text/csv');
    expect(await response.text()).toContain('local_login_succeeded');
  });

  it('does not read the backend if the member gate rejects', async () => {
    memberMock.mockRejectedValueOnce(new Error('sign in required'));
    await expect(GET()).rejects.toThrow('sign in required');
    expect(apiMock).not.toHaveBeenCalled();
  });

  it('fails closed on invalid or oversized evidence, never exposing metadata or secrets', async () => {
    apiMock.mockResolvedValueOnce({ events: [{ ...event, type: '=HYPERLINK("evil")', metadata: { ip: 'private' } }] });
    const invalid = await GET();
    expect(invalid.status).toBe(503);
    expect(await invalid.text()).not.toContain('private');
    apiMock.mockResolvedValueOnce({ events: Array(21).fill(event) });
    expect((await GET()).status).toBe(503);
  });

  it('distinguishes verified empty history from API outage', async () => {
    apiMock.mockResolvedValueOnce({ events: [] });
    const empty = await GET();
    expect(empty.status).toBe(200);
    expect(await empty.text()).toContain('event_type');
    apiMock.mockRejectedValueOnce(new Error('db secret'));
    const failure = await GET();
    expect(failure.status).toBe(503);
    expect(await failure.text()).not.toContain('db secret');
  });
});
