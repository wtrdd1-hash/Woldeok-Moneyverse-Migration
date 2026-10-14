'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Telemetry = {
  totalHits24h: number;
  totalHits7d: number;
  avgDurationMs: number;
  botDistribution: Record<string, number>;
  recentLogs: unknown[];
};

type Audit = {
  timestamp: string;
  candidateUrlCount: number;
  telemetry: Telemetry | null;
  telemetryStatus: 'observed' | 'unavailable';
  indexingStatus: 'not_measured';
  schemaValidationStatus: 'not_measured';
};

type Submission = {
  ok: boolean;
  submittedCount?: number;
  status?: number;
  indexingConfirmed?: boolean;
};

const formatNumber = (value: number | undefined) =>
  value === undefined || !Number.isFinite(value) ? '확인 불가' : value.toLocaleString('ko-KR');

export function AdminSeoAuditView() {
  const [audit, setAudit] = useState<Audit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submission, setSubmission] = useState<Submission | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/seo-audit', {
        credentials: 'same-origin', cache: 'no-store', signal,
      });
      if (!response.ok) throw new Error(response.status === 401 || response.status === 403
        ? '관리자 콘솔 인증이 필요합니다.' : '수집 감사 정보를 가져오지 못했습니다.');
      const data = (await response.json()) as Audit;
      if (!signal?.aborted) setAudit(data);
    } catch (cause) {
      if (!signal?.aborted) {
        setAudit(null);
        setError(cause instanceof Error ? cause.message : '조회 실패');
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setSubmission(null);
    try {
      const response = await fetch('/api/admin/seo-audit', {
        method: 'POST', credentials: 'same-origin', cache: 'no-store',
      });
      const result = (await response.json()) as Submission;
      if (!response.ok || !result.ok) throw new Error('IndexNow 요청이 승인되지 않았습니다.');
      setSubmission(result);
      toast.success(`${formatNumber(result.submittedCount)}개 URL의 IndexNow 요청이 접수되었습니다. 색인 완료는 별도 확인이 필요합니다.`);
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : '전송 실패');
    } finally {
      setSubmitting(false);
    }
  };

  const telemetry = audit?.telemetry;
  const distribution = telemetry?.botDistribution ?? {};

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
      <Link href="/admin" className="inline-flex min-h-11 items-center gap-2 text-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2">
        <ArrowLeft aria-hidden="true" className="size-4" /> 관리자 대시보드로 돌아가기
      </Link>
      <nav aria-label="관리자 SEO 메뉴" className="flex flex-wrap gap-2 border-b pb-3">
        <Link href="/admin/seo" className="inline-flex min-h-11 items-center rounded px-3 py-2 text-sm hover:underline focus-visible:outline-2">실시간 수집 로그 및 상태</Link>
        <Link href="/admin/seo-audit" aria-current="page" className="inline-flex min-h-11 items-center rounded border px-3 py-2 text-sm font-semibold focus-visible:outline-2">크롤러 수집 감사</Link>
      </nav>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <h1 className="text-2xl font-bold">검색엔진 수집 감사</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">수집 로그는 서버 관측치입니다. 실제 검색 색인과 구조화 데이터 유효성은 별도 검증이 필요합니다.</p>
        </div>
        <Button type="button" onClick={() => void submit()} disabled={submitting || loading || !audit} className="min-h-11 max-w-full whitespace-normal text-left">
          <RefreshCw aria-hidden="true" className={submitting ? 'mr-2 size-4 animate-spin' : 'mr-2 size-4'} />
          {submitting ? 'IndexNow 전송 중' : 'IndexNow URL 제출'}
        </Button>
      </div>
      <div role="status" aria-live="polite" className="text-sm text-muted-foreground">
        {loading ? '감사 정보 불러오는 중…' : error ?? (audit ? `관측 기준: ${new Date(audit.timestamp).toLocaleString('ko-KR')}` : '정보 없음')}
      </div>
      {error && <Button type="button" variant="outline" onClick={() => void load()} className="min-h-11">다시 시도</Button>}
      {audit && <>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric title="IndexNow 제출 후보 URL" value={`${formatNumber(audit.candidateUrlCount)}개`} detail="실제 색인 URL 수가 아닙니다." />
          <Metric title="최근 24시간 크롤러 요청" value={formatNumber(telemetry?.totalHits24h)} detail={telemetry ? '서버 로그 관측' : '텔레메트리 이용 불가'} />
          <Metric title="평균 요청 처리 시간" value={telemetry && Number.isFinite(telemetry.avgDurationMs) ? `${telemetry.avgDurationMs}ms` : '확인 불가'} detail="서버에서 관측한 요청의 평균" />
          <Metric title="검색엔진 색인·스키마 검증" value="미측정" detail="IndexNow 수락은 색인 확인이 아닙니다." />
        </div>
        <Card>
          <CardHeader><CardTitle className="text-base">크롤러별 서버 관측 요청</CardTitle></CardHeader>
          <CardContent>
            {!telemetry ? <p className="text-sm" role="status">서버 수집 데이터에 접근할 수 없습니다.</p> :
              Object.keys(distribution).length === 0 ? <p className="text-sm">관측된 크롤러 요청이 없습니다.</p> :
              <ul className="divide-y" aria-label="크롤러별 관측 횟수">
                {Object.entries(distribution).map(([name, count]) => <li key={name} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
                  <span className="break-all">{name}</span><span>{formatNumber(count)}건</span>
                </li>)}
              </ul>}
          </CardContent>
        </Card>
        {submission?.ok && <p role="status" aria-live="polite" className="rounded border p-3 text-sm">
          IndexNow에 {formatNumber(submission.submittedCount)}개 URL 제출 요청이 접수되었습니다 (HTTP {submission.status}). 검색 결과 색인 여부는 확인되지 않았습니다.
        </p>}
      </>}
    </main>
  );
}

function Metric({ title, value, detail }: { title: string; value: string; detail: string }) {
  return <Card><CardContent className="space-y-2 p-4">
    <h2 className="text-xs font-semibold text-muted-foreground">{title}</h2>
    <p className="break-words text-xl font-bold">{value}</p>
    <p className="text-xs text-muted-foreground">{detail}</p>
  </CardContent></Card>;
}
