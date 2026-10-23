import { api, ApiError } from '@/lib/api';
import { seoResponse, verifySeoOperator } from '@/lib/admin-seo-authority';

export const dynamic = 'force-dynamic';

/** All individual crawler records require an open admin console session. */
export async function GET() {
  const denied = await verifySeoOperator();
  if (denied) return denied;

  try {
    const metrics = await api('/api/v1/seo/status/admin');
    return seoResponse(metrics);
  } catch (error) {
    const status = error instanceof ApiError
      ? error.status === 401 ? 401 : error.status === 403 || error.status === 428 ? 403 : 503
      : 503;
    return seoResponse({ error: status === 503 ? 'seo_status_unavailable' : 'forbidden' }, status);
  }
}
