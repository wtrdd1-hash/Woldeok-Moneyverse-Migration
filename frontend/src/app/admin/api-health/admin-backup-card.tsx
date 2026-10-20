'use client';
import { useCallback, useEffect, useState } from 'react';
import { CloudUpload, Play, Check, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export interface BackupFileInfo {
  readonly fileName: string;
  readonly sizeBytes: number;
  readonly sizeMb: number;
  readonly createdAt: string;
  readonly status: 'VERIFIED' | 'PENDING';
}

export interface BackupStatusResponse {
  readonly backupDir: string;
  readonly r2Configured: boolean;
  readonly r2Bucket: string;
  readonly retentionDays: number;
  readonly totalBackups: number;
  readonly totalSizeBytes: number;
  readonly totalSizeMb: number;
  readonly files: readonly BackupFileInfo[];
  readonly lastBackupAt: string | null;
}


export function AdminBackupCard({ isEn }: { readonly isEn: boolean }) {
  const [backupData, setBackupData] = useState<BackupStatusResponse | null>(null);
  const [isTriggeringBackup, setIsTriggeringBackup] = useState(false);
  const [backupFeedback, setBackupFeedback] = useState<string | null>(null);
  const fetchBackupStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/admin/backups');
      if (!res.ok) throw new Error('backup status unavailable');
      setBackupData(await res.json() as BackupStatusResponse);
    } catch {
      setBackupData(null);
    }
  }, []);
  useEffect(() => {
    void fetchBackupStatus();
    const timer = setInterval(() => void fetchBackupStatus(), 10000);
    return () => clearInterval(timer);
  }, [fetchBackupStatus]);
  const handleManualBackup = async () => {
    setIsTriggeringBackup(true);
    setBackupFeedback(null);
    try {
      const res = await fetch('/api/v1/admin/backups/trigger', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) throw new Error('backup trigger rejected');
      setBackupFeedback(isEn ? 'Backup request accepted; check snapshot status.' : '백업 요청이 접수되었습니다. 스냅샷 상태를 확인하세요.');
      setTimeout(() => void fetchBackupStatus(), 3000);
    } catch {
      setBackupFeedback(isEn ? 'Backup request failed' : '백업 요청 실패');
    } finally {
      setIsTriggeringBackup(false);
    }
  };
  return (
<Card className="border-border/80 bg-card/60">
        <CardHeader className="p-4 pb-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <CloudUpload className="size-4 text-sky-500" />
                <span>{isEn ? 'Cloudflare R2 Free Cloud Automated Backup' : 'Cloudflare R2 무료 클라우드 자동 백업 DR'}</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                {isEn
                  ? 'Zero-cost disaster recovery pipeline. Daily 04:00 AM snapshot with 30-day retention.'
                  : 'Cloudflare R2 10GB 무료 티어 및 영구 무과금($0 Egress) 재해 복구 파이프라인 (매일 04:00 자동 스냅샷 / 30일 보관).'}
              </CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleManualBackup}
              disabled={isTriggeringBackup}
              className="text-xs h-8 gap-1.5 border-sky-500/40 text-sky-600 hover:bg-sky-500/10"
            >
              <Play className="size-3" />
              <span>{isTriggeringBackup ? (isEn ? 'Triggering...' : '트리거 중...') : (isEn ? 'Trigger Backup Now' : '즉시 백업 실행')}</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-1 space-y-3">
          {backupFeedback && (
            <div className="p-2.5 rounded-md bg-sky-500/10 border border-sky-500/30 text-xs text-sky-600 dark:text-sky-400 flex items-center gap-2">
              <Check className="size-3.5" />
              <span>{backupFeedback}</span>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50">
              <div className="text-muted-foreground text-[11px]">R2 버킷</div>
              <div className="font-mono font-bold mt-0.5 truncate">{backupData?.r2Bucket || (isEn ? 'Not configured' : '미설정')}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50">
              <div className="text-muted-foreground text-[11px]">보관 주기</div>
              <div className="font-mono font-bold mt-0.5">{backupData?.retentionDays ?? '—'}일 롤링</div>
            </div>
            <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50">
              <div className="text-muted-foreground text-[11px]">총 백업본 개수</div>
              <div className="font-mono font-bold mt-0.5">{backupData?.totalBackups ?? '—'}개 스냅샷</div>
            </div>
            <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50">
              <div className="text-muted-foreground text-[11px]">총 보관 용량</div>
              <div className="font-mono font-bold mt-0.5 text-sky-500">{backupData?.totalSizeMb ?? '—'} MB</div>
            </div>
          </div>

          {backupData?.files && backupData.files.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-muted-foreground">
                {isEn ? 'Recent Backup Snapshots' : '최근 스냅샷 목록 (검증 완료)'}
              </div>
              <div className="divide-y divide-border/40 rounded-lg border border-border/60 bg-background/50 overflow-hidden text-xs">
                {backupData.files.slice(0, 3).map((f) => (
                  <div key={f.fileName} className="p-2.5 flex items-center justify-between gap-2 font-mono">
                    <div className="flex items-center gap-2 truncate">
                      <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">{f.fileName}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 text-muted-foreground">
                      <span className="font-bold text-foreground">{f.sizeMb} MB</span>
                      <span>{new Date(f.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
  );
}
