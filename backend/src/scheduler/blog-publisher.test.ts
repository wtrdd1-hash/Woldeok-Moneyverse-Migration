import { describe, expect, it, vi } from 'vitest';
import { publishScheduledBlog } from './blog-publisher';

const secret = 'scheduler-credential-strong-32-byte-example-2026';
const response = (status: number, body: unknown) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json' },
});

const fetcher = (res: Response) => vi.fn().mockResolvedValue(res);

describe('scheduled blog publication credential boundary', () => {
  it('does not send a request without an explicitly configured credential', async () => {
    const request = fetcher(response(201, { success: true }));
    expect(await publishScheduledBlog({}, request as unknown as typeof fetch)).toMatchObject({
      skipped: true,
      reason: 'BLOG_SCHEDULER_SECRET_UNAVAILABLE',
    });
    expect(request).not.toHaveBeenCalled();
  });

  it.each(['short-key', ' '.repeat(40), 'moneyverse-cron-internal-key-2026', 'mv-internal-secure-key-2026'])(
    'rejects weak or publicly known credential %s', async (candidate) => {
      const request = fetcher(response(201, { success: true }));
      const result = await publishScheduledBlog({ INTERNAL_API_SECRET: candidate }, request as unknown as typeof fetch);
      expect(result).toMatchObject({ skipped: true, reason: 'BLOG_SCHEDULER_SECRET_UNAVAILABLE' });
      expect(request).not.toHaveBeenCalled();
    },
  );

  it('does not downgrade to CRON_SECRET when configured primary credential is weak', async () => {
    const request = fetcher(response(201, { success: true }));
    const result = await publishScheduledBlog({ INTERNAL_API_SECRET: 'weak', CRON_SECRET: secret }, request as unknown as typeof fetch);
    expect(result).toMatchObject({ skipped: true });
    expect(request).not.toHaveBeenCalled();
  });

  it('uses the explicit strong credential without forwarding it across redirects', async () => {
    const request = fetcher(response(201, { success: true, post: { slug: 'new-article' } }));
    const result = await publishScheduledBlog({ INTERNAL_API_SECRET: secret }, request as unknown as typeof fetch);
    expect(result).toMatchObject({ success: true, status: 201 });
    expect(request).toHaveBeenCalledTimes(1);
    expect(request.mock.calls[0]?.[0]).toBe('http://127.0.0.1:3234/api/blog/generate');
    expect(request.mock.calls[0]?.[1]).toMatchObject({
      method: 'POST',
      redirect: 'manual',
      headers: { 'x-internal-secret': secret },
    });
  });

  it('does not trust response JSON to override a failed HTTP status', async () => {
    const request = fetcher(response(503, { success: true, status: 201 }));
    const result = await publishScheduledBlog({ CRON_SECRET: secret }, request as unknown as typeof fetch);
    expect(result).toMatchObject({ success: false, status: 503 });
  });

  it('rejects a 2xx response without an explicit success receipt', async () => {
    const request = fetcher(response(200, { status: 'ok' }));
    const result = await publishScheduledBlog({ INTERNAL_API_SECRET: secret }, request as unknown as typeof fetch);
    expect(result).toMatchObject({ success: false, status: 200 });
  });

  it('refuses plaintext public origins and URLs with embedded credentials', async () => {
    const request = fetcher(response(201, { success: true }));
    for (const origin of ['http://example.com', 'https://user:password@example.com', 'file:///tmp/blog']) {
      const result = await publishScheduledBlog({ INTERNAL_API_SECRET: secret, FRONTEND_ORIGIN: origin }, request as unknown as typeof fetch);
      expect(result).toMatchObject({ skipped: true, reason: 'BLOG_SCHEDULER_ORIGIN_UNSAFE' });
    }
    expect(request).not.toHaveBeenCalled();
  });

  it('does not expose transport exception details as a scheduler receipt', async () => {
    const request = vi.fn().mockRejectedValue(new Error('private-host-and-token'));
    const result = await publishScheduledBlog({ INTERNAL_API_SECRET: secret }, request as unknown as typeof fetch);
    expect(result).toEqual({ success: false, code: 'BLOG_PUBLISH_TRANSPORT_FAILED' });
  });
});
