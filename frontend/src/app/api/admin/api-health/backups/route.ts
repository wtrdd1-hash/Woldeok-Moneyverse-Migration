import { NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { requireAdminConsole } from '@/lib/session';
import { parseBackupEvidence } from '@/app/admin/api-health/backup-evidence';

export const dynamic = 'force-dynamic';
const reply = (body: unknown, status: number) => NextResponse.json(body, {
  status, headers: { 'Cache-Control': 'private, no-store' },
});

export async function GET() {
  try { await requireAdminConsole('/admin/api-health'); }
  catch { return reply({ error: 'unauthorized' }, 401); }
  try {
    const evidence = parseBackupEvidence(await api('/api/v1/admin/backups'));
    return evidence ? reply(evidence, 200) : reply({ error: 'invalid_backup_evidence' }, 503);
  } catch { return reply({ error: 'backup_inventory_unavailable' }, 503); }
}
