'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Activity, Clock, Database, RefreshCw, Server } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SystemTelemetry {
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
  readonly status: 'HEALTHY' | 'DEGRADED' | 'UNKNOWN';
  readonly serverTime: string;
  readonly uptimeSeconds: number;
  readonly dbLatencyMs: number | null;
  readonly systemTelemetry: SystemTelemetry;
}

function measured(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

/** Reject old responses that still contain fabricated fleet-wide aggregates. */
export function verifiedHealth(value: unknown): ApiHealthResponse | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  if ('domains' in record || 'globalSuccessRate' in record) return null;
  if (!['HEALTHY', 'DEGRADED', 'UNKNOWN'].includes(String(record.status))) return null;
  if (typeof record.serverTime !== 'string' || !Number.isFinite(Date.parse(record.serverTime))) return null;
  if (!measured(record.uptimeSeconds)) return null;
  if (record.dbLatencyMs !== null && !measured(record.dbLatencyMs)) return null;
  if (record.status !== 'HEALTHY' && record.dbLatencyMs !== null) return null;
  if (record.status === 'HEALTHY' && record.dbLatencyMs === null) return null;
  const system = record.systemTelemetry;
  if (!system || typeof system !== 'object') return null;
  const telemetry = system as Record<string, unknown>;
  for (const key of ['cpuLoad1m', 'cpuCores', 'totalMemMb', 'freeMemMb', 'heapUsedMb', 'rssMb']) {
    if (!measured(telemetry[key])) return null;
  }
  if (telemetry.cpuCores === 0 || telemetry.totalMemMb === 0) return null;
  if (telemetry.activeDbConnections !== null && !measured(telemetry.activeDbConnections)) return null;
  if (telemetry.dbCacheHitRatio !== null && (!measured(telemetry.dbCacheHitRatio) || telemetry.dbCacheHitRatio > 100)) return null;
  return value as ApiHealthResponse;
}

function metric(value: number | null, unit: string): string {
  return value === null ? '확인 불가' : `${value.toLocaleString('ko-KR')}${unit}`;
}

export function ApiHealthDashboard({ initialData, isEn }: {
  readonly initialData: ApiHealthResponse | null;
  readonly isEn: boolean;
}) {
  const [data, setData] = useState<ApiHealthResponse | null>(() => verifiedHealth(initialData));
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [now, setNow] = useState<number | null>(null);
  const inFlight = useRef(false);

  const fetchTelemetry = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/admin/api-health', { cache: 'no-store' });
      if (!response.ok) throw new Error('telemetry request failed');
      const next = verifiedHealth(await response.json());
      if (!next || Math.abs(Date.now() - Date.parse(next.serverTime)) > 60_000) {
        throw new Error('telemetry response is not current');
      }
      setData(next);
    } catch {
      // A failed poll must not leave a stale green dashboard in place.
      setData(null);
    } finally {
      setNow(Date.now());
      setIsRefreshing(false);
      inFlight.current = false;
    }
  }, []);

  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 5_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') void fetchTelemetry();
    }, 10_000);
    return () => clearInterval(timer);
  }, [autoRefresh, fetchTelemetry]);

  const age = data && now !== null ? now - Date.parse(data.serverTime) : null;
  const current = data && age !== null && age >= -5_000 && age <= 30_000 ? data : null;
  const telemetry = current?.systemTelemetry;
  const healthy = current?.status === 'HEALTHY';
  const state = current === null ? 'UNKNOWN' : current.status;
  const stateText = current === null
    ? (isEn ? 'Measurement unavailable or expired' : '측정값이 없거나 최신 상태가 아닙니다')
    : healthy
      ? (isEn ? 'Database ping succeeded' : '데이터베이스 응답 확인')
      : (isEn ? 'Database unavailable' : '데이터베이스 응답 미확인');

  return (
    <div className="grid gap-5">
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3" aria-live="polite" role="status">
            <Activity className="size-5 shrink-0" aria-hidden="true" />
            <div className="min-w-0">
              <p className="font-semibold">{stateText}</p>
              <p className="text-xs text-muted-foreground">
                {isEn ? 'One PostgreSQL ping, not fleet-wide API uptime' : 'PostgreSQL 단일 응답 측정이며 전체 API 가동률이 아닙니다'}
              </p>
            </div>
            <Badge variant={healthy ? 'secondary' : 'outline'}>{state}</Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant={autoRefresh ? 'secondary' : 'outline'} className="min-h-11"
              aria-pressed={autoRefresh} onClick={() => setAutoRefresh((value) => !value)}>
              <Clock aria-hidden="true" className="size-4" />
              {autoRefresh ? (isEn ? 'Auto refresh on' : '자동 갱신 켜짐') : (isEn ? 'Auto refresh off' : '자동 갱신 꺼짐')}
            </Button>
            <Button type="button" variant="outline" className="min-h-11" disabled={isRefreshing} onClick={() => void fetchTelemetry()}>
              <RefreshCw aria-hidden="true" className={`size-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isEn ? 'Refresh now' : '지금 새로고침'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        {current
          ? (isEn ? `Backend measured at ${current.serverTime}` : `백엔드 측정 시각: ${current.serverTime}`)
          : (isEn ? 'No current server measurement.' : '현재 서버 측정 결과를 확인할 수 없습니다.')}
        {!autoRefresh && (isEn ? ' · Auto refresh paused' : ' · 자동 갱신 일시 중지')}
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard title={isEn ? 'PostgreSQL ping' : 'PostgreSQL 응답 시간'} icon={<Database className="size-4" aria-hidden="true" />}
          value={metric(current?.dbLatencyMs ?? null, 'ms')} detail={isEn ? 'One SELECT 1 query' : 'SELECT 1 단일 조회'} />
        <MetricCard title={isEn ? 'Backend uptime' : '백엔드 프로세스 가동 시간'} icon={<Server className="size-4" aria-hidden="true" />}
          value={current ? `${Math.floor(current.uptimeSeconds / 60).toLocaleString('ko-KR')}분` : '확인 불가'}
          detail={isEn ? 'Current Node process' : '현재 Node 프로세스 기준'} />
        <MetricCard title={isEn ? 'Host CPU load' : '호스트 CPU 부하 (1분)'} icon={<Activity className="size-4" aria-hidden="true" />}
          value={telemetry ? telemetry.cpuLoad1m.toFixed(2) : '확인 불가'}
          detail={telemetry ? `${telemetry.cpuCores} CPU cores` : undefined} />
        <MetricCard title={isEn ? 'Node heap used' : 'Node 힙 사용량'}
          value={telemetry ? metric(telemetry.heapUsedMb, ' MB') : '확인 불가'}
          detail={telemetry ? `RSS ${telemetry.rssMb} MB` : undefined} />
        <MetricCard title={isEn ? 'Host memory available' : '호스트 여유 메모리'}
          value={telemetry ? metric(telemetry.freeMemMb, ' MB') : '확인 불가'}
          detail={telemetry ? `Total ${telemetry.totalMemMb} MB` : undefined} />
        <MetricCard title={isEn ? 'Database connections' : '데이터베이스 연결 수'}
          value={metric(telemetry?.activeDbConnections ?? null, '')}
          detail={isEn ? 'pg_stat_activity when accessible' : '권한 허용 시 pg_stat_activity 기준'} />
        <MetricCard title={isEn ? 'Database cache hit' : 'DB 캐시 적중률'}
          value={metric(telemetry?.dbCacheHitRatio ?? null, '%')}
          detail={isEn ? 'pg_stat_database when accessible' : '권한 허용 시 pg_stat_database 기준'} />
      </div>

      <Card>
        <CardContent className="text-sm text-muted-foreground">
          {isEn
            ? 'Per-endpoint availability, fleet-wide success rates and backup verification are not measured here. No backup execution is available from this screen.'
            : '개별 API 가동률·전체 성공률·백업 검증 상태는 이 화면에서 측정하지 않습니다. 이 화면에서 백업을 실행할 수 없습니다.'}
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ title, value, detail, icon }: {
  readonly title: string;
  readonly value: string;
  readonly detail?: string | undefined;
  readonly icon?: React.ReactNode;
}) {
  return (
    <Card className="min-w-0">
      <CardHeader className="pb-1">
        <CardTitle className="flex items-center gap-2 text-sm">{icon}{title}</CardTitle>
      </CardHeader>
      <CardContent className="min-w-0">
        <p className="break-words text-xl font-semibold tabular-nums">{value}</p>
        {detail && <p className="text-xs text-muted-foreground">{detail}</p>}
      </CardContent>
    </Card>
  );
}
