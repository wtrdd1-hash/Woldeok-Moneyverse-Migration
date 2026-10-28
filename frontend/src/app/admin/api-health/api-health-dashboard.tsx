'use client';

import { useState, useEffect, useCallback } from 'react';
import {
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
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { BackupEvidence } from './backup-evidence';

export interface DomainHealthData {
  readonly id: string;
  readonly name: string;
  readonly nameEn: string;
  readonly endpointCount: number;
  readonly status: 'OPERATIONAL' | 'DEGRADED' | 'MAINTENANCE' | 'UNKNOWN';
  readonly latencyMs: number | null;
  readonly successRate: number | null;
  readonly measuredAt: string | null;
  readonly measurementSource: 'NOT_MEASURED' | 'ROUTE_METRICS';
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
  readonly dbCacheHitRatio?: number | null;
}

export interface ApiHealthResponse {
  readonly status: string;
  readonly serverTime: string;
  readonly uptimeSeconds: number;
  readonly dbLatencyMs?: number | null;
  readonly dbProbe?: { readonly status: 'OPERATIONAL' | 'DEGRADED' | 'UNKNOWN'; readonly measuredAt: string | null; readonly source: string };
  readonly isLiveTelemetry?: boolean;
  readonly systemTelemetry?: SystemTelemetry;
  readonly totalDomains: number;
  readonly totalEndpoints: number;
  readonly averageLatencyMs: number | null;
  readonly globalSuccessRate: number | null;
  readonly domains: readonly DomainHealthData[];
}

interface ApiHealthDashboardProps {
  readonly initialData: ApiHealthResponse | null;
  readonly isEn: boolean;
}

export function ApiHealthDashboard({ initialData, isEn }: ApiHealthDashboardProps) {
  const [data, setData] = useState<ApiHealthResponse | null>(initialData);
  const [backupData, setBackupData] = useState<BackupEvidence | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(initialData ? new Date(initialData.serverTime) : null);

  const fetchTelemetry = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/admin/api-health/status');
      if (res.ok) {
        const json: ApiHealthResponse = await res.json();
        setData(json);
        setLastRefreshedAt(new Date());
      } else {
        setData(null);
      }
    } catch {
      setData(null); // Stale data must not masquerade as current health.
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const fetchBackupStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/api-health/backups', { cache: 'no-store' });
      if (!res.ok) { setBackupData(null); return; }
      const json: BackupEvidence = await res.json();
      setBackupData(json.source === 'LOCAL_FILES_UNVERIFIED' ? json : null);
    } catch { setBackupData(null); }
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

  const domains = data?.domains ?? [];
  const totalEndpoints = data?.totalEndpoints ?? domains.reduce((acc, d) => acc + d.endpointCount, 0);
  const avgLatency = data?.averageLatencyMs ?? null;
  const successRate = data?.globalSuccessRate ?? null;
  const dbLatency = data?.dbLatencyMs ?? null;
  const isLive = data?.isLiveTelemetry === true;
  const telemetry = data?.systemTelemetry;

  const cpuPercent = telemetry ? Math.min(100, Math.round((telemetry.cpuLoad1m / Math.max(1, telemetry.cpuCores)) * 100)) : 0;
  const ramPercent = telemetry ? Math.min(100, Math.round((telemetry.heapUsedMb / Math.max(1, telemetry.totalMemMb)) * 100)) : 0;
  const cacheHitRatio = telemetry?.dbCacheHitRatio ?? null;

  return (
    <div className="space-y-6">
      {/* Live Refresh & Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-border/80 bg-card/60 backdrop-blur-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              {isLive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isLive ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <span className="text-xs font-mono font-medium text-foreground">
              {isLive ? (isEn ? 'LIVE METRICS' : '실시간 텔레메트리') : (isEn ? 'Not measured' : '측정되지 않음')}
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

      {/* 4 Core Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <Card className="border-border/80 bg-card/60">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs text-muted-foreground font-medium flex items-center justify-between">
              <span>{isEn ? 'Catalogued Domains' : '등록된 도메인'}</span>
              <Layers className="size-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold font-mono">{domains.length}개</div>
            <div className="text-[11px] text-muted-foreground font-medium mt-0.5">{isEn ? 'Route status not measured' : '경로 상태 측정되지 않음'}</div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/60">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs text-muted-foreground font-medium flex items-center justify-between">
              <span>{isEn ? 'Catalogued API Routes' : '등록된 API 경로'}</span>
              <Server className="size-4 text-indigo-500" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold font-mono">{totalEndpoints}개</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">경로별 가용성 미검증</div>
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
            <div className="text-2xl font-bold font-mono text-emerald-500">{avgLatency === null ? '—' : `${avgLatency}ms`}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">{avgLatency === null ? (isEn ? 'Not measured' : '측정되지 않음') : (isEn ? 'Measured API latency' : 'API 응답 지연 실측')}</div>
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
            <div className="text-2xl font-bold font-mono text-cyan-500">{successRate === null ? '—' : `${successRate.toFixed(1)}%`}</div>
            <div className="text-[11px] text-cyan-600 dark:text-cyan-400 mt-0.5">
              {dbLatency === null ? (isEn ? 'Not measured' : '측정되지 않음') : (isEn ? `DB ping ${dbLatency}ms only` : `DB 핑 ${dbLatency}ms만 실측`)}
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
              <div className="text-[11px] text-emerald-500 font-medium">1분 호스트 부하 관측값</div>
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
                  {telemetry.activeDbConnections === null ? '—' : `${telemetry.activeDbConnections}개 활성`}
                </span>
                <span className="text-xs font-mono text-emerald-500 font-bold">
                  캐시 적중률 {cacheHitRatio === null ? '—' : `${cacheHitRatio}%`}
                </span>
              </div>
              <Progress value={cacheHitRatio ?? 0} className="h-1.5" />
              <div className="text-[11px] text-muted-foreground">
                DB 세션 및 버퍼 캐시 관측값
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Local filesystem inventory is not remote or restore evidence. */}
      <Card className="border-border/80 bg-card/60">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <CloudUpload className="size-4 text-amber-500" />
            {isEn ? 'Backup inventory — unverified' : '백업 파일 목록 — 검증되지 않음'}
          </CardTitle>
          <CardDescription>
            {isEn ? 'Local files only. Remote copy, checksum, restore test and scheduled retention are not verified. Manual backup is unavailable.'
              : '로컬 파일 존재만 조회합니다. 원격 복제·체크섬·복원 시험·보관 정책은 검증되지 않았으며 수동 백업 실행은 보류합니다.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 p-4 pt-1" aria-live="polite">
          {backupData === null ? (
            <p role="status" className="text-sm text-amber-600">
              {isEn ? 'Backup inventory unavailable; no backup status can be confirmed.' : '백업 목록을 확인할 수 없습니다. 백업 상태를 판단할 수 없습니다.'}
            </p>
          ) : (
            <>
              <p className="text-sm font-medium">
                {isEn ? `Local files observed: ${backupData.totalBackups} (not verified)` : `관측된 로컬 파일 ${backupData.totalBackups}개 (무결성 미검증)`}
              </p>
              <p className="text-xs text-muted-foreground">
                {isEn ? 'Remote backup verified: No · Restore verified: No' : '원격 백업 검증: 미완료 · 복원 검증: 미완료'}
              </p>
              {backupData.files.length > 0 && (
                <ul className="space-y-2 text-xs" aria-label={isEn ? 'Unverified local backup files' : '미검증 로컬 백업 파일'}>
                  {backupData.files.slice(0, 3).map((file) => (
                    <li key={file.fileName} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-2">
                      <span className="break-all font-mono">{file.fileName}</span>
                      <span>{Math.round(file.sizeBytes / 1024)} KiB · {isEn ? 'UNVERIFIED' : '미검증'}</span>
                    </li>
                  ))}
                </ul>
              )}
            </>
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
                  {domain.status === 'OPERATIONAL' ? <CheckCircle2 className="size-4 text-emerald-500" /> : <AlertCircle className="size-4 text-amber-500" />}
                  <span>{isEn ? domain.nameEn : domain.name}</span>
                </CardTitle>
                <Badge variant="outline" className={`text-[10px] ${domain.status === 'OPERATIONAL' ? 'text-emerald-600 border-emerald-500/40 bg-emerald-500/10' : 'text-amber-600 border-amber-500/40 bg-amber-500/10'}`}>
                  {domain.status}
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
                  <b className="font-mono text-foreground">{domain.latencyMs === null ? '—' : `${domain.latencyMs}ms`}</b>
                </span>
                <span>
                  {isEn ? 'Success: ' : '성공률: '}
                  <b className="font-mono text-muted-foreground">{domain.successRate === null ? '—' : `${domain.successRate.toFixed(1)}%`}</b>
                </span>
              </div>
              <div className="text-[11px] text-amber-600">{isEn ? 'Not measured (no route-level probe)' : '측정되지 않음 (경로별 검사 없음)'}</div>
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
