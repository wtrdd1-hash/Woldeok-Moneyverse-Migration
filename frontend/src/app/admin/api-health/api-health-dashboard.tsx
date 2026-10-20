'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Activity, Clock, Database, RefreshCw, Server, ShieldCheck, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AdminBackupCard } from './admin-backup-card';
import { AdminApiDomainGrid } from './admin-api-domain-grid';

export interface DomainHealthData {
  readonly id: string;
  readonly name: string;
  readonly nameEn: string;
  readonly endpointCount: number;
  readonly status: 'OPERATIONAL' | 'DEGRADED' | 'MAINTENANCE' | 'UNKNOWN';
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
  readonly dbCacheHitRatio?: number | null;
}

export interface ApiHealthResponse {
  readonly status: 'HEALTHY' | 'DEGRADED' | 'UNKNOWN';
  readonly dbStatus?: 'OPERATIONAL' | 'DEGRADED' | 'UNKNOWN';
  readonly serverTime: string;
  readonly uptimeSeconds: number;
  readonly dbLatencyMs?: number | null;
  readonly isLiveTelemetry?: boolean;
  readonly systemTelemetry?: SystemTelemetry;
  readonly totalDomains: number;
  readonly totalEndpoints: number;
  readonly averageLatencyMs: number | null;
  readonly globalSuccessRate: number | null;
  readonly domains: readonly DomainHealthData[];
}

interface Props {
  readonly initialData: ApiHealthResponse | null;
  readonly isEn: boolean;
}

export function ApiHealthDashboard({ initialData, isEn }: Props) {
  const [data, setData] = useState<ApiHealthResponse | null>(initialData);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(
    initialData?.serverTime ? new Date(initialData.serverTime) : null,
  );
  const requestId = useRef(0);

  const fetchTelemetry = useCallback(async () => {
    const current = ++requestId.current;
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/v1/admin/api-health/status', { cache: 'no-store' });
      if (!response.ok) throw new Error('API health unavailable');
      const next = await response.json() as ApiHealthResponse;
      if (current !== requestId.current) return;
      setData(next);
      setRefreshError(false);
      setLastRefreshedAt(new Date());
    } catch {
      if (current !== requestId.current) return;
      setData(null);
      setRefreshError(true);
      setLastRefreshedAt(null);
    } finally {
      if (current === requestId.current) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!initialData) void fetchTelemetry();
    return () => { requestId.current += 1; };
  }, [fetchTelemetry, initialData]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => void fetchTelemetry(), 10000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchTelemetry]);

  const domains = data?.domains ?? [];
  const dbStatus = data?.dbStatus ?? 'UNKNOWN';
  const telemetry = data?.systemTelemetry;
  const measured = (value: number | null | undefined, unit = '') =>
    value == null ? (isEn ? 'Not measured' : '미측정') : `${value}${unit}`;

  return (
    <div className="space-y-6">
      {refreshError && (
        <div role="alert" className="rounded-lg border border-amber-500/50 p-3 text-sm text-amber-700 dark:text-amber-300">
          {isEn ? 'API health refresh failed. Previous metrics have been cleared.' : 'API 상태 갱신에 실패했습니다. 이전 측정값을 지웠습니다.'}
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/80 bg-card/60 p-3.5">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-2 font-medium" aria-live="polite">
            <Activity aria-hidden="true" className="size-4 text-amber-500" />
            {isEn ? 'API AVAILABILITY: NOT MEASURED' : 'API 가용성: 미측정'}
          </span>
          <span className="text-muted-foreground">
            {isEn ? 'Last successful sync: ' : '마지막 성공 동기화: '}
            {lastRefreshedAt?.toLocaleTimeString() ?? (isEn ? 'Never' : '없음')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant={autoRefresh ? 'secondary' : 'outline'}
            onClick={() => setAutoRefresh(v => !v)} aria-pressed={autoRefresh}>
            <Clock aria-hidden="true" className="size-3.5" />
            {autoRefresh ? (isEn ? 'Auto (10s): ON' : '10초 자동 갱신: ON') : (isEn ? 'Auto: OFF' : '자동 갱신: OFF')}
          </Button>
          <Button size="sm" variant="outline" disabled={isRefreshing} onClick={() => void fetchTelemetry()}>
            <RefreshCw aria-hidden="true" className={`size-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isEn ? 'Refresh' : '새로고침'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
        <Card><CardHeader className="p-4 pb-1"><CardTitle className="text-xs">
          {isEn ? 'Listed domains' : '등록된 도메인'}
        </CardTitle></CardHeader><CardContent className="p-4 pt-1">
          <div className="font-mono text-2xl font-bold">{data ? domains.length : '—'}</div>
          <p className="text-xs text-muted-foreground">{isEn ? 'Availability not measured' : '가용성 미측정'}</p>
        </CardContent></Card>
        <Card><CardHeader className="p-4 pb-1"><CardTitle className="flex items-center gap-1 text-xs">
          <Server aria-hidden="true" className="size-4" />{isEn ? 'Listed API routes' : '등록된 API 경로'}
        </CardTitle></CardHeader><CardContent className="p-4 pt-1">
          <div className="font-mono text-2xl font-bold">{data?.totalEndpoints ?? '—'}</div>
          <p className="text-xs text-muted-foreground">{isEn ? 'Catalog, not uptime evidence' : '카탈로그 수량 (가동률 아님)'}</p>
        </CardContent></Card>
        <Card><CardHeader className="p-4 pb-1"><CardTitle className="flex items-center gap-1 text-xs">
          <Zap aria-hidden="true" className="size-4" />{isEn ? 'API latency' : 'API 응답 지연'}
        </CardTitle></CardHeader><CardContent className="p-4 pt-1">
          <div className="font-mono text-xl font-bold">{measured(data?.averageLatencyMs, 'ms')}</div>
          <p className="text-xs text-muted-foreground">{isEn ? 'No API latency samples' : 'API 지연시간 표본 없음'}</p>
        </CardContent></Card>
        <Card><CardHeader className="p-4 pb-1"><CardTitle className="flex items-center gap-1 text-xs">
          <ShieldCheck aria-hidden="true" className="size-4" />{isEn ? 'API success rate' : 'API 성공률'}
        </CardTitle></CardHeader><CardContent className="p-4 pt-1">
          <div className="font-mono text-xl font-bold">{data?.globalSuccessRate == null ? measured(null) : `${data.globalSuccessRate.toFixed(1)}%`}</div>
          <p className="text-xs text-muted-foreground">{isEn ? 'DB ping is not API availability' : 'DB 핑은 API 가용성 지표가 아닙니다'}</p>
        </CardContent></Card>
      </div>

      <Card><CardHeader className="p-4 pb-1"><CardTitle className="flex items-center gap-2 text-sm">
        <Database aria-hidden="true" className="size-4" />
        {isEn ? 'Measured database and host telemetry' : '실측 데이터베이스·호스트 정보'}
      </CardTitle></CardHeader><CardContent className="grid grid-cols-1 gap-3 p-4 text-sm sm:grid-cols-3">
        <div><div className="text-xs text-muted-foreground">{isEn ? 'Database status / ping' : 'DB 상태 / 핑'}</div>
          <strong>{dbStatus} · {measured(data?.dbLatencyMs, 'ms')}</strong></div>
        <div><div className="text-xs text-muted-foreground">{isEn ? 'Active DB connections / cache' : 'DB 연결 / 캐시 적중률'}</div>
          <strong>{measured(telemetry?.activeDbConnections)} / {measured(telemetry?.dbCacheHitRatio, '%')}</strong></div>
        <div><div className="text-xs text-muted-foreground">{isEn ? 'Host 1m load / Node heap' : '호스트 1분 부하 / Node 힙'}</div>
          <strong>{measured(telemetry?.cpuLoad1m)} / {measured(telemetry?.heapUsedMb, ' MB')}</strong></div>
      </CardContent></Card>

      <AdminBackupCard isEn={isEn} />
      <AdminApiDomainGrid domains={domains} isEn={isEn} />
    </div>
  );
}
