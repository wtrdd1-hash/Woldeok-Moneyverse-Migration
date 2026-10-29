import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ApiHealthDashboard } from './api-health-dashboard';
import { parseBackupEvidence } from './backup-evidence';

const source = {
  backupDir: '/private/backup', r2Configured: false, r2Bucket: 'bucket', retentionDays: 30,
  totalBackups: 1, totalSizeBytes: 2048, totalSizeMb: 0,
  lastBackupAt: '2026-10-28T07:00:00.000Z',
  files: [{ fileName: 'backup.sql.gz', sizeBytes: 2048, sizeMb: 0, createdAt: '2026-10-28T07:00:00.000Z', status: 'PENDING' }],
};

describe('admin backup inventory provenance', () => {
  it('accepts only unverified local file inventory without exposing private paths', () => {
    const evidence = parseBackupEvidence(source);
    expect(evidence?.files[0]?.status).toBe('PENDING');
    expect(JSON.stringify(evidence)).not.toContain('/private/backup');
    expect(evidence?.remoteBackupVerified).toBe(false);
    expect(evidence?.restoreVerified).toBe(false);
  });
  it('rejects a forged VERIFIED snapshot, invalid sizes and mismatched totals', () => {
    expect(parseBackupEvidence({ ...source, files: [{ ...source.files[0], status: 'VERIFIED' }] })).toBeNull();
    expect(parseBackupEvidence({ ...source, totalBackups: 2 })).toBeNull();
    expect(parseBackupEvidence({ ...source, totalSizeBytes: -1 })).toBeNull();
    expect(parseBackupEvidence({ ...source, lastBackupAt: 'invalid' })).toBeNull();
  });
  it('does not invent R2 inventory or offer an unverified manual backup action', () => {
    const html = renderToStaticMarkup(<ApiHealthDashboard initialData={null} isEn={false} />);
    expect(html).not.toContain('moneyverse-backup');
    expect(html).not.toContain('0개 스냅샷');
    expect(html).not.toContain('즉시 백업 실행');
    expect(html).toContain('검증되지');
  });
});
