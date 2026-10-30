import { NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { requireAdminConsole } from '@/lib/session';
import { parseBackupEvidence } from '@/app/admin/api-health/backup-evidence';

export const dynamic = 'force-dynamic';
const HEADERS = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow' };

/** Read-only Next gateway: no browser-to-Nest token and no manual backup POST. */
export async function GET() {
  try {
    await requireAdminConsole('/admin/api-health');
  } catch {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401, headers: HEADERS });
  }
  try {
    const raw = await api<unknown>('/api/v1/admin/backups');
    const evidence = parseBackupEvidence(raw);
    if (evidence === null) {
      return NextResponse.json({ error: 'invalid backup inventory evidence' }, { status: 503, headers: HEADERS });
    }
    return NextResponse.json(evidence, { headers: HEADERS });
  } catch {
    return NextResponse.json({ error: 'backup inventory unavailable' }, { status: 503, headers: HEADERS });
  }
}
