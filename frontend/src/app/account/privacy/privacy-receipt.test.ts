import { readFileSync } from 'node:fs';
import { describe, expect, it, vi, beforeEach } from 'vitest';

const { mutateMock, revalidateMock } = vi.hoisted(() => ({
  mutateMock: vi.fn(),
  revalidateMock: vi.fn(),
}));

vi.mock('next/cache', () => ({ revalidatePath: revalidateMock }));
vi.mock('next/navigation', () => ({ redirect: vi.fn() }));
vi.mock('@/lib/mutate', () => ({
  mutate: mutateMock,
  idempotencyKey: vi.fn(() => 'should-not-be-generated-per-retry'),
  failure: (_error: unknown, message: string) => ({ status: 'error', message }),
}));

import { createPrivacyRequest } from '../actions';

const KEY = 'ebd4379a-cd9b-4d1f-b73c-6c94060ca529';
const REQUEST = '80b5348e-94c2-4df9-bd9e-bd3b8773df35';
const form = (type = 'access', detail = '', key = KEY) => {
  const fields = new FormData();
  fields.set('requestType', type);
  fields.set('detail', detail);
  fields.set('idempotencyKey', key);
  return fields;
};

describe('privacy request receipt / safe retry', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('forwards the same form key to the authenticated API across a replay and shows verified receipt', async () => {
    mutateMock
      .mockResolvedValueOnce({ requestId: REQUEST, requestType: 'access', status: 'received', replayed: false })
      .mockResolvedValueOnce({ requestId: REQUEST, requestType: 'access', status: 'received', replayed: true });
    const first = await createPrivacyRequest({ status: 'idle' }, form());
    const replay = await createPrivacyRequest({ status: 'idle' }, form());
    expect(mutateMock).toHaveBeenCalledTimes(2);
    for (const call of mutateMock.mock.calls) {
      expect(call[0]).toBe('/api/v1/privacy/requests');
      expect(call[1].body).toEqual({ requestType: 'access', idempotencyKey: KEY });
    }
    expect(first.status).toBe('ok');
    expect(first.message).toContain(REQUEST);
    expect(replay.status).toBe('ok');
    expect(replay.message).toContain(REQUEST);
    expect(revalidateMock).toHaveBeenCalledWith('/account/privacy');
  });

  it('does not declare success without a matching server receipt', async () => {
    mutateMock.mockResolvedValue({ status: 'received', requestType: 'access', replayed: false });
    const result = await createPrivacyRequest({ status: 'idle' }, form());
    expect(result.status).toBe('error');
    expect(revalidateMock).not.toHaveBeenCalled();
  });

  it('rejects invalid keys, unknown request types and oversized details before the API', async () => {
    for (const data of [
      form('access', '', ''),
      form('access', '', 'not-a-uuid'),
      form('admin'),
      form('correction'),
      form('access', 'x'.repeat(1001)),
    ]) {
      expect((await createPrivacyRequest({ status: 'idle' }, data)).status).toBe('error');
    }
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it('keeps failed submissions unconfirmed, enabling retry with the same key', async () => {
    mutateMock.mockRejectedValue(new Error('unknown result'));
    const result = await createPrivacyRequest({ status: 'idle' }, form());
    expect(result.status).toBe('error');
    expect(revalidateMock).not.toHaveBeenCalled();
  });
});

describe('privacy form and private SEO', () => {
  const formSource = readFileSync('src/app/account/account-forms.tsx', 'utf8');
  const pageSource = readFileSync('src/app/account/privacy/page.tsx', 'utf8');

  it('holds the UUID in a hidden field, rotates it only for a new submission, and caps detail to DB limit', () => {
    expect(formSource).toContain('name="idempotencyKey"');
    expect(formSource).toContain('submissionKey');
    expect(formSource).toContain('maxLength={1000}');
    expect(pageSource).toContain('randomUUID()');
  });

  it('keeps member-only noindex, accessible request labels and a visible retry warning', () => {
    expect(pageSource).toContain('await requireMember();');
    expect(pageSource).toContain('robots: { index: false, follow: false }');
    expect(formSource).toContain('htmlFor="privacy-request-type"');
    expect(formSource).toContain('htmlFor="privacy-request-detail"');
    expect(pageSource).toContain('중복');
  });
});
