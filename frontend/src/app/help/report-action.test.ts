import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/lib/api';
import { reportVerifiedHelp } from './report-action';

vi.mock('@/lib/api', () => ({ api: vi.fn() }));
const revision = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
const threadId = '22222222-3333-4444-8555-666666666666';
const key = '11111111-aaaa-4bbb-8ccc-222222222222';
function form() {
  const value = new FormData();
  value.set('locale', 'ko'); value.set('slug', 'wallet-guide'); value.set('publishedRevisionId', revision);
  value.set('idempotencyKey', key); value.set('reason', 'outdated'); value.set('details', 'The instructions are no longer accurate.');
  return value;
}
beforeEach(() => {
  vi.stubEnv('VERIFIED_HELP_CENTER_V1', 'true'); vi.stubEnv('VERIFIED_HELP_REPORT_V1', 'true');
  vi.mocked(api).mockReset();
  vi.mocked(api).mockResolvedValueOnce({ csrfToken: 'valid-csrf' }).mockResolvedValueOnce({ threadId, status: 'open', verified: true });
});
afterEach(() => vi.unstubAllEnvs());

describe('verified help report server action', () => {
  it('submits exact edition and CSRF, never client-provided title or actor', async () => {
    const value = form(); value.set('title', 'spoofed'); value.set('actor', 'another-member');
    expect(await reportVerifiedHelp({ status: 'idle' }, value)).toMatchObject({ status: 'ok', threadId });
    expect(api).toHaveBeenCalledWith('/api/v1/help/articles/ko/wallet-guide/report', {
      method: 'POST', csrfToken: 'valid-csrf', body: expect.objectContaining({
        publishedRevisionId: revision, reason: 'outdated', details: 'The instructions are no longer accurate.',
        idempotencyKey: key,
      }),
    });
    expect(JSON.stringify(vi.mocked(api).mock.calls)).not.toContain('spoofed');
  });
  it('rejects invalid paths, revision, reason and details without API call', async () => {
    for (const [field, value] of [['slug', '../admin'], ['idempotencyKey', 'bad'], ['publishedRevisionId', 'bad'], ['reason', 'spam'], ['details', 'x']]) {
      const data = form(); data.set(field, value);
      expect((await reportVerifiedHelp({ status: 'idle' }, data)).status).toBe('invalid');
    }
    expect(api).not.toHaveBeenCalled();
  });
  it('fails closed when disabled or when a receipt is not independently verified', async () => {
    vi.stubEnv('VERIFIED_HELP_REPORT_V1', 'false');
    expect((await reportVerifiedHelp({ status: 'idle' }, form())).status).toBe('unavailable');
    expect(api).not.toHaveBeenCalled();
    vi.stubEnv('VERIFIED_HELP_REPORT_V1', 'true');
    vi.mocked(api).mockReset().mockResolvedValueOnce({ csrfToken: 'valid-csrf' }).mockResolvedValueOnce({ threadId, verified: false });
    expect((await reportVerifiedHelp({ status: 'idle' }, form())).status).toBe('uncertain');
  });
});
