'use server';

import { api } from '@/lib/api';

export type HelpReportState = { readonly status: 'idle' | 'ok' | 'invalid' | 'unavailable' | 'uncertain'; readonly threadId?: string };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const REASONS = ['outdated', 'incorrect', 'unclear'];

function field(data: FormData, name: string): string | null {
  const values = data.getAll(name);
  return values.length === 1 && typeof values[0] === 'string' ? values[0] : null;
}
function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export async function reportVerifiedHelp(_previous: HelpReportState, data: FormData): Promise<HelpReportState> {
  const locale = field(data, 'locale');
  const slug = field(data, 'slug');
  const publishedRevisionId = field(data, 'publishedRevisionId');
  const idempotencyKey = field(data, 'idempotencyKey');
  const reason = field(data, 'reason');
  const details = field(data, 'details')?.trim();
  if (!locale || !['ko', 'en'].includes(locale) || !slug || !SLUG.test(slug) || slug.length > 100 ||
    !publishedRevisionId || !UUID.test(publishedRevisionId) || !idempotencyKey || !UUID.test(idempotencyKey) || !reason || !REASONS.includes(reason) ||
    !details || details.length < 10 || Array.from(details).length > 600 ||
    /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(details)) return { status: 'invalid' };
  if (process.env.VERIFIED_HELP_CENTER_V1 !== 'true' || process.env.VERIFIED_HELP_REPORT_V1 !== 'true') {
    return { status: 'unavailable' };
  }
  try {
    const session: unknown = await api('/api/v1/auth/session');
    if (!record(session) || typeof session.csrfToken !== 'string' || !session.csrfToken) {
      return { status: 'unavailable' };
    }
    const response: unknown = await api(`/api/v1/help/articles/${locale}/${slug}/report`, {
      method: 'POST', csrfToken: session.csrfToken,
      body: { publishedRevisionId, reason, details, idempotencyKey },
    });
    if (!record(response) || response.verified !== true ||
      !['open', 'waiting_user', 'resolved'].includes(String(response.status)) ||
      typeof response.threadId !== 'string' || !UUID.test(response.threadId)) {
      return { status: 'uncertain' };
    }
    return { status: 'ok', threadId: response.threadId };
  } catch {
    // A timed-out write may have succeeded; never claim it was not submitted.
    return { status: 'uncertain' };
  }
}
