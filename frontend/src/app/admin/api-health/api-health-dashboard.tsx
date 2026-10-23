'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  CheckCircle2,
  ShieldCheck,
  Zap,
  RefreshCw,
  Layers,
  Server,
  Cpu,
  Database,
  HardDrive,
  CloudUpload,
  Clock,
  Play,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export interface DomainHealthData {
  readonly id: string;
  readonly name: string;
  readonly nameEn: string;
  readonly endpointCount: number;
  readonly status: 'UNVERIFIED';
  readonly latencyMs: number | null;
  readonly successRate: number | null;
  readonly sampleEndpoints: readonly string[];
}

export interface SystemTelemetry {
  readonly cpuLoad1m: number;
  readonly cpuCores: number;
  readonly totalMemMb: number;
  readonly freeMemMb: number;
  readonly heapUsedMb: number;
  readonly rssMb: number;
  readonly activeDbConnections: number | null;
  readonly dbCacheHitRatio: number | null;
}

export interface ApiHealthResponse {
  readonly status: string;
  readonly serverTime: string;
  readonly uptimeSeconds: number;
  readonly dbLatencyMs: number | null;
  readonly dbProbeState: 'ok' | 'failed' | 'unavailable';
  readonly isLiveTelemetry?: boolean;
  readonly systemTelemetry?: SystemTelemetry;
  readonly totalDomains: number;
  readonly totalEndpoints: number;
  readonly averageLatencyMs: number | null;
  readonly globalSuccessRate: number | null;
  readonly domains: readonly DomainHealthData[];
}

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

interface ApiHealthDashboardProps {
  readonly initialData: ApiHealthResponse | null;
  readonly isEn: boolean;
}

export function ApiHealthDashboard({ initialData, isEn }: ApiHealthDashboardProps) {
  const [data, setData] = useState<ApiHealthResponse | null>(initialData);
  const [backupData, setBackupData] = useState<BackupStatusResponse | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isTriggeringBackup, setIsTriggeringBackup] = useState(false);
  const [backupFeedback, setBackupFeedback] = useState<string | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(() => initialData?.serverTime && Number.isFinite(Date.parse(initialData.serverTime)) ? new Date(initialData.serverTime) : null);
  const [requestError, setRequestError] = useState(initialData === null);

  const fetchTelemetry = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/v1/admin/api-health/status');
      if (res.ok) {
        const json: ApiHealthResponse = await res.json();
        setData(json);
        setLastRefreshedAt(Number.isFinite(Date.parse(json.serverTime)) ? new Date(json.serverTime) : null);
        setRequestError(false);
      } else {
        setData(null);
        setRequestError(true);
        setLastRefreshedAt(null);
      }
    } catch {
      setData(null);
      setRequestError(true);
      setLastRefreshedAt(null);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const fetchBackupStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/admin/backups');
      if (res.ok) {
        const json: BackupStatusResponse = await res.json();
        setBackupData(json);
      }
    } catch {
      // Ignored
    }
  }, []);

  useEffect(() => {
    fetchBackupStatus();
  }, [fetchBackupStatus]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchTelemetry();
      fetchBackupStatus();
    }, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchTelemetry, fetchBackupStatus]);

  const handleManualBackup = async () => {
    setIsTriggeringBackup(true);
    setBackupFeedback(null);
    try {
      const res = await fetch('/api/v1/admin/backups/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        setBackupFeedback(isEn ? 'Backup request accepted; completion not yet verified.' : '백업 요청이 접수됐습니다. 완료 여부는 아직 확인되지 않았습니다.');
        setTimeout(() => {
          fetchBackupStatus();
        }, 3000);
      } else {
        const errJson = await res.json().catch(() => ({}));
        setBackupFeedback(errJson.message || (isEn ? 'Backup trigger failed' : '백업 실행 요청 실패'));
      }
    } catch {
      setBackupFeedback(isEn ? 'Backup request error' : '백업 요청 통신 에러');
    } finally {
      setIsTriggeringBackup(false);
    }
  };

  const domains = data?.domains ?? [];
  const totalEndpoints = data?.totalEndpoints ?? domains.reduce((acc, d) => acc + d.endpointCount, 0);
  const avgLatency = data?.averageLatencyMs ?? null;
  const successRate = data?.globalSuccessRate ?? null;
  const dbLatency = data?.dbLatencyMs ?? null;
  const telemetry = data?.systemTelemetry;

  const cpuPercent = telemetry && telemetry.cpuCores > 0 ? Math.min(100, Math.round((telemetry.cpuLoad1m / telemetry.cpuCores) * 100)) : 0;
  const ramPercent = telemetry && telemetry.totalMemMb > 0 ? Math.min(100, Math.round((telemetry.heapUsedMb / telemetry.totalMemMb) * 100)) : 0;
  const cacheHitRatio = telemetry?.dbCacheHitRatio ?? null;

  return (
    <div className="space-y-6">
      {/* Live Refresh & Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-border/80 bg-card/60 backdrop-blur-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`absolute inline-flex h-full w-full rounded-full ${requestError ? 'bg-muted-foreground' : 'bg-sky-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${requestError ? 'bg-muted-foreground' : 'bg-sky-500'}`}></span>
            </span>
            <span className="text-xs font-mono font-medium text-foreground">
              {requestError ? (isEn ? 'TELEMETRY UNAVAILABLE' : '상태 조회 불가') : (isEn ? 'HOST + DB SNAPSHOT' : '호스트·DB 실측 (API 도메인 미검증)')}
            </span>
          </div>
          <span className="text-xs text-muted-foreground hidden sm:inline">|</span>
          <span className="text-xs text-muted-foreground font-mono hidden sm:inline">
            {isEn ? 'Last sync: ' : '최근 동기화: '}
            {lastRefreshedAt?.toLocaleTimeString() ?? '—'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={autoRefresh ? 'secondary' : 'outline'}
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="text-xs h-8 gap-1.5"
          >
            <Clock className="size-3.5" />
            <span>{autoRefresh ? (isEn ? 'Auto (10s): ON' : '10초 자동 갱신: ON') : (isEn ? 'Auto: OFF' : '자동 갱신: OFF')}</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              fetchTelemetry();
              fetchBackupStatus();
            }}
            disabled={isRefreshing}
            className="text-xs h-8 gap-1.5"
          >
            <RefreshCw className={`size-3.5 ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
            <span>{isEn ? 'Refresh' : '새로고침'}</span>
          </Button>
        </div>
      </div>

      {requestError && <p role="status" aria-live="polite" className="rounded-lg border border-destructive/40 p-3 text-sm text-destructive">{isEn ? 'Unable to load health data. No live status is confirmed.' : '상태 정보를 불러오지 못했습니다. 현재 가동 상태를 확인할 수 없습니다.'}</p>}
      {!requestError && <p role="status" aria-live="polite" className="rounded-lg border p-3 text-sm text-muted-foreground">{isEn ? 'Only host and database observations are measured. API domain status and success rates are unverified.' : '호스트와 DB 관측값만 실측입니다. API 도메인별 가동률·응답속도는 아직 검증되지 않았습니다.'}</p>}

      {/* 4 Core Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <Card className="border-border/80 bg-card/60">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs text-muted-foreground font-medium flex items-center justify-between">
              <span>{isEn ? 'Active Domains' : '활성 도메인'}</span>
              <Layers className="size-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold font-mono">{data ? `${domains.length}개` : '—'}</div>
            <div className="text-[11px] text-emerald-500 font-medium mt-0.5">목록에 등록된 도메인 · 상태 미검증</div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/60">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs text-muted-foreground font-medium flex items-center justify-between">
              <span>{isEn ? 'Verified APIs' : '검증된 API'}</span>
              <Server className="size-4 text-indigo-500" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold font-mono">{data ? `${totalEndpoints}개` : '—'}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">등록된 경로 수 · 개별 검증 아님</div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/60">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs text-muted-foreground font-medium flex items-center justify-between">
              <span>{isEn ? 'Average Latency' : '평균 응답 지연'}</span>
              <Zap className="size-4 text-amber-500" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold font-mono text-emerald-500">{avgLatency === null ? '미측정' : `${avgLatency}ms`}</div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">도메인별 실제 응답시간 미수집</div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/60">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs text-muted-foreground font-medium flex items-center justify-between">
              <span>{isEn ? 'Success Rate' : '가동 성공률'}</span>
              <ShieldCheck className="size-4 text-emerald-500" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold font-mono text-cyan-500">{successRate === null ? '미측정' : `${successRate.toFixed(1)}%`}</div>
            <div className="text-[11px] text-cyan-600 dark:text-cyan-400 mt-0.5">
              {data?.dbProbeState === 'ok' && dbLatency !== null ? `DB 핑 ${dbLatency}ms 실측` : 'DB 연결 확인 불가'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time System Progress Gauges */}
      {telemetry && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <Card className="border-border/80 bg-card/60">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs text-muted-foreground font-medium flex items-center justify-between">
                <span>{isEn ? 'Host CPU Load (1m)' : '호스트 CPU 부하 (1분 평균)'}</span>
                <Cpu className="size-4 text-emerald-500" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1 space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold font-mono">{telemetry.cpuLoad1m.toFixed(2)}</span>
                <span className="text-xs text-muted-foreground font-mono">
                  {telemetry.cpuCores} Cores ({cpuPercent}%)
                </span>
              </div>
              <Progress value={cpuPercent} className="h-1.5" />
              <div className="text-[11px] text-emerald-500 font-medium">현재 프로세스의 호스트 부하</div>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card/60">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs text-muted-foreground font-medium flex items-center justify-between">
                <span>{isEn ? 'Node Heap & OS Memory' : '메모리 실측 (Node 힙 / 총량)'}</span>
                <HardDrive className="size-4 text-indigo-500" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1 space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold font-mono">{telemetry.heapUsedMb} MB</span>
                <span className="text-xs text-muted-foreground font-mono">
                  / {telemetry.totalMemMb} MB ({ramPercent}%)
                </span>
              </div>
              <Progress value={ramPercent} className="h-1.5" />
              <div className="text-[11px] text-indigo-500 font-medium">
                여유 메모리 {telemetry.freeMemMb} MB 가용
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card/60">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs text-muted-foreground font-medium flex items-center justify-between">
                <span>{isEn ? 'PostgreSQL Active Sessions & Cache' : 'PostgreSQL 활성 세션 & 버퍼 캐시'}</span>
                <Database className="size-4 text-cyan-500" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1 space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold font-mono text-cyan-500">
                  {telemetry.activeDbConnections === null ? '미측정' : `${telemetry.activeDbConnections}개 활성`}
                </span>
                <span className="text-xs font-mono text-emerald-500 font-bold">
                  캐시 적중률 {cacheHitRatio === null ? '미측정' : `${cacheHitRatio}%`}
                </span>
              </div>
              <Progress value={cacheHitRatio ?? 0} className="h-1.5" />
              <div className="text-[11px] text-muted-foreground">
                실제 DB 관측값만 표시
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cloudflare R2 DR Backup Card */}
      <Card className="border-border/80 bg-card/60">
        <CardHeader className="p-4 pb-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <CloudUpload className="size-4 text-sky-500" />
                <span>{isEn ? 'Backup Inventory' : '백업 상태 및 보관 현황'}</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                {isEn
                  ? 'Displays backup inventory returned by the service; availability must be verified.'
                  : '서버에서 확인된 백업 목록과 설정만 표시합니다. 실제 복구 가능 여부는 별도 검증이 필요합니다.'}
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
              <div className="font-mono font-bold mt-0.5 truncate">{backupData?.r2Bucket || '미확인'}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50">
              <div className="text-muted-foreground text-[11px]">보관 주기</div>
              <div className="font-mono font-bold mt-0.5">{backupData ? `${backupData.retentionDays}일` : '미확인'}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50">
              <div className="text-muted-foreground text-[11px]">총 백업본 개수</div>
              <div className="font-mono font-bold mt-0.5">{backupData ? `${backupData.totalBackups}개 스냅샷` : '미확인'}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50">
              <div className="text-muted-foreground text-[11px]">총 보관 용량</div>
              <div className="font-mono font-bold mt-0.5 text-sky-500">{backupData ? `${backupData.totalSizeMb} MB` : '미확인'}</div>
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

      {/* 14 Domains Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {domains.map((domain) => (
          <Card key={domain.id} className="border-border/80 bg-card/60 shadow-xs">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  <AlertCircle className="size-4 text-muted-foreground" />
                  <span>{isEn ? domain.nameEn : domain.name}</span>
                </CardTitle>
                <Badge variant="outline" className="text-[10px] text-muted-foreground">
                  {domain.status === 'UNVERIFIED' ? (isEn ? 'Unverified' : '미검증') : domain.status}
                </Badge>
              </div>
              <CardDescription className="text-xs font-mono text-muted-foreground">
                {domain.endpointCount}개 API 엔드포인트
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-1 space-y-2 text-xs">
              <div className="flex items-center justify-between border-t border-border/50 pt-2 text-muted-foreground">
                <span>
                  {isEn ? 'Latency: ' : '응답 지연: '}
                  <b className="font-mono text-foreground">{domain.latencyMs === null ? '미측정' : `${domain.latencyMs}ms`}</b>
                </span>
                <span>
                  {isEn ? 'Success: ' : '성공률: '}
                  <b className="font-mono text-emerald-500">{domain.successRate === null ? '미측정' : `${domain.successRate.toFixed(1)}%`}</b>
                </span>
              </div>
              <div className="rounded-md bg-muted/40 p-2 text-[11px] font-mono text-muted-foreground truncate space-y-0.5">
                {domain.sampleEndpoints.map((ep) => (
                  <div key={ep} className="truncate">• {ep}</div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
