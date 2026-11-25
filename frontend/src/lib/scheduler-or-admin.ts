import 'server-only';
import { timingSafeEqual } from 'node:crypto';
import { currentViewer, isAdministrator } from '@/lib/viewer';

/**
 * Server-to-server callers (cron) present INTERNAL_API_SECRET/CRON_SECRET;
 * browsers must be a server-reported administrator. Used by the IndexNow
 * submitters, which were public (QA 2026-11-25) and let anyone spend the
 * site's IndexNow key.
 */
export async function isSchedulerOrAdministrator(req: Request): Promise<boolean> {
  // Either configured secret is accepted (review 2026-11-25: a cron sending
  // CRON_SECRET failed whenever INTERNAL_API_SECRET was also set).
  const presented = req.headers.get('x-cron-secret') || req.headers.get('x-internal-secret')
    || req.headers.get('authorization')?.replace(/^Bearer /, '');
  for (const secret of [process.env.INTERNAL_API_SECRET, process.env.CRON_SECRET]) {
    if (!secret || !presented) continue;
    const a = Buffer.from(secret), b = Buffer.from(presented);
    if (a.length === b.length && timingSafeEqual(a, b)) return true;
  }
  try {
    return isAdministrator(await currentViewer());
  } catch {
    return false;
  }
}
