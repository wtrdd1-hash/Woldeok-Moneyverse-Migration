
const MIN_SECRET_BYTES = 32;
const KNOWN_UNSAFE_SECRETS = new Set([
  'moneyverse-cron-internal-key-2026',
  'mv-internal-secure-key-2026',
]);

function configuredCredential(env: NodeJS.ProcessEnv): string | null {
  // A weak primary credential must not silently downgrade to the shared cron key.
  const candidate = env.INTERNAL_API_SECRET !== undefined ? env.INTERNAL_API_SECRET : env.CRON_SECRET;
  if (!candidate || /\s/.test(candidate) || Buffer.byteLength(candidate, 'utf8') < MIN_SECRET_BYTES || KNOWN_UNSAFE_SECRETS.has(candidate)) {
    return null;
  }
  return candidate;
}

function publicationUrl(origin: string): string | null {
  try {
    const url = new URL(origin);
    const loopback = ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname);
    if ((url.protocol !== 'https:' && !(url.protocol === 'http:' && loopback))
      || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
      return null;
    }
    return new URL('/api/blog/generate', url).toString();
  } catch {
    return null;
  }
}

/**
 * Publish only with an explicit scheduler credential. A redirect must never
 * forward x-internal-secret to another origin, and response JSON must never
 * override the HTTP status recorded by the scheduler.
 */
export async function publishScheduledBlog(
  env: NodeJS.ProcessEnv = process.env,
  request: typeof fetch = fetch,
): Promise<Record<string, unknown>> {
  if (env.BLOG_AUTO_PUBLISH_ENABLED === 'false') {
    return { skipped: true, reason: 'disabled' };
  }
  const secret = configuredCredential(env);
  if (!secret) return { skipped: true, reason: 'BLOG_SCHEDULER_SECRET_UNAVAILABLE' };

  const url = publicationUrl(env.FRONTEND_ORIGIN || 'http://127.0.0.1:3234');
  if (!url) return { skipped: true, reason: 'BLOG_SCHEDULER_ORIGIN_UNSAFE' };

  try {
    const res = await request(url, {
      method: 'POST',
      redirect: 'manual',
      signal: AbortSignal.timeout(10_000),
      headers: {
        'Content-Type': 'application/json',
        'x-internal-secret': secret,
      },
      body: JSON.stringify({ action: 'publish' }),
    });
    const body: unknown = await res.json().catch(() => null);
    const confirmed = res.status === 201
      && body !== null
      && typeof body === 'object'
      && 'success' in body
      && body.success === true;
    return {
      success: confirmed,
      status: res.status,
      ...(!confirmed ? { code: 'BLOG_PUBLISH_NOT_CONFIRMED' } : {}),
    };
  } catch {
    // Transport errors can include private hosts or credentials; never persist them in job receipts.
    return { success: false, code: 'BLOG_PUBLISH_TRANSPORT_FAILED' };
  }
}
