'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  MousePointerClick,
  Eye,
  Percent,
  Award,
  Key,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Send,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';

export interface GscTimeSeriesEntry {
  readonly date: string;
  readonly clicks: number;
  readonly impressions: number;
  readonly ctr: number;
  readonly position: number;
}

export interface GscTopQueryEntry {
  readonly query: string;
  readonly clicks: number;
  readonly impressions: number;
  readonly ctr: number;
  readonly position: number;
}

export interface GscAnalyticsData {
  readonly hasCredentials: boolean;
  readonly clientEmail: string | null;
  readonly updatedAt: string | null;
  readonly propertyUrl: string | null;
  readonly source: 'unconfigured' | 'search-console' | 'error';
  readonly syncError: string | null;
  readonly totalClicks30d: number;
  readonly totalImpressions30d: number;
  readonly avgCtr30d: number;
  readonly avgPosition30d: number;
  readonly timeSeries: readonly GscTimeSeriesEntry[];
  readonly topQueries: readonly GscTopQueryEntry[];
}

interface GscSitemapSubmission {
  readonly success: boolean;
  readonly message?: string;
  readonly propertyUrl: string;
  readonly sitemapUrl: string;
  readonly lastSubmitted: string | null;
  readonly lastDownloaded: string | null;
  readonly isPending: boolean;
  readonly warnings: number;
  readonly errors: number;
  readonly submittedUrlCount: number;
}

const DEFAULT_GSC_DATA: GscAnalyticsData = {
  hasCredentials: false,
  clientEmail: null,
  updatedAt: null,
  propertyUrl: null,
  source: 'unconfigured',
  syncError: null,
  totalClicks30d: 0,
  totalImpressions30d: 0,
  avgCtr30d: 0,
  avgPosition30d: 0,
  timeSeries: [],
  topQueries: [],
};

export function GscAnalyticsCard() {
  const [data, setData] = useState<GscAnalyticsData>(DEFAULT_GSC_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [keyJsonInput, setKeyJsonInput] = useState('');
  const [modalFeedback, setModalFeedback] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeMetric, setActiveMetric] = useState<'clicks' | 'impressions'>('clicks');
  const [isSubmittingSitemap, setIsSubmittingSitemap] = useState(false);
  const [sitemapSubmission, setSitemapSubmission] = useState<GscSitemapSubmission | null>(null);
  const [sitemapSubmitError, setSitemapSubmitError] = useState<string | null>(null);

  const fetchGscData = async () => {
    setIsLoading(true);
    try {
      if (typeof window === 'undefined') return;
      const res = await fetch('/api/seo/gsc', { cache: 'no-store' });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setLoadError(
          json && typeof json === 'object' && 'message' in json && typeof json.message === 'string'
            ? json.message
            : 'Google Search Console 데이터를 불러오지 못했습니다.',
        );
        return;
      }
      if (json && typeof json === 'object') {
        setData((prev) => ({ ...prev, ...json }));
        setLoadError(null);
      }
    } catch {
      setLoadError('Google Search Console 데이터를 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGscData();
  }, []);

  const handleSaveCredentials = async () => {
    if (!keyJsonInput.trim()) return;
    try {
      const res = await fetch('/api/seo/gsc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyJson: keyJsonInput }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setModalFeedback(result.message || '서비스 계정 키가 성공적으로 등록되었습니다.');
        setTimeout(() => {
          setIsModalOpen(false);
          setModalFeedback(null);
          setKeyJsonInput('');
          fetchGscData();
        }, 1200);
      } else {
        setModalFeedback(result.message || '등록에 실패했습니다.');
      }
    } catch {
      setModalFeedback('등록 처리 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteCredentials = async () => {
    if (!confirm('등록된 Google Search Console 서비스 계정 키를 삭제하시겠습니까?')) return;
    try {
      const res = await fetch('/api/seo/gsc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete' }),
      });
      const result = await res.json().catch(() => null);
      if (!res.ok || !result?.success) {
        setModalFeedback(result?.message || '키 삭제에 실패했습니다.');
        return;
      }
      setModalFeedback(result.message || '서비스 계정 키가 삭제되었습니다.');
      await fetchGscData();
    } catch {
      setModalFeedback('키 삭제 처리 중 오류가 발생했습니다.');
    }
  };

  const handleSubmitSitemap = async () => {
    setIsSubmittingSitemap(true);
    setSitemapSubmission(null);
    setSitemapSubmitError(null);
    try {
      const res = await fetch('/api/seo/gsc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submit-sitemap' }),
      });
      const result = await res.json().catch(() => null);
      if (!res.ok || !result?.success) {
        setSitemapSubmitError(result?.message || 'Search Console 사이트맵 등록에 실패했습니다.');
        return;
      }
      setSitemapSubmission(result as GscSitemapSubmission);
    } catch {
      setSitemapSubmitError('Search Console 사이트맵 등록 중 통신 오류가 발생했습니다.');
    } finally {
      setIsSubmittingSitemap(false);
    }
  };

  // SVG Chart Calculation
  const series = data?.timeSeries || [];
  const maxClicks = useMemo(() => Math.max(...series.map((s) => s.clicks), 100), [series]);
  const maxImpressions = useMemo(() => Math.max(...series.map((s) => s.impressions), 1000), [series]);

  const chartPoints = useMemo(() => {
    if (series.length === 0) return '';
    const width = 600;
    const height = 140;
    const padding = 10;

    return series
      .map((entry, idx) => {
        const x = padding + (idx / (series.length - 1)) * (width - padding * 2);
        const val = activeMetric === 'clicks' ? entry.clicks : entry.impressions;
        const maxVal = activeMetric === 'clicks' ? maxClicks : maxImpressions;
        const y = height - padding - (val / maxVal) * (height - padding * 2);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [series, activeMetric, maxClicks, maxImpressions]);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <TrendingUp className="size-5" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-foreground">
                Google Search Console 검색 성과 분석 (Search Analytics)
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                최근 30일간의 Googlebot 실제 검색 노출수, 클릭수, 평균 CTR 및 10대 검색어 랭킹
              </CardDescription>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {data?.source === 'search-console' ? (
              <div
                className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400"
                title={data.propertyUrl || undefined}
              >
                <ShieldCheck className="size-3.5" />
                <span className="max-w-[180px] truncate">{data.clientEmail}</span>
              </div>
            ) : data?.hasCredentials ? (
              <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-[11px] font-bold text-amber-500">
                GSC 연동 오류
              </Badge>
            ) : (
              <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-[11px] font-bold text-amber-500">
                키 미등록
              </Badge>
            )}

            <Button
              variant="outline"
              size="default"
              onClick={handleSubmitSitemap}
              disabled={!data.hasCredentials || isSubmittingSitemap}
              className="flex min-h-11 items-center gap-1.5 text-xs font-semibold"
            >
              <Send className="size-3.5" />
              {isSubmittingSitemap ? '사이트맵 등록 중...' : 'Search Console 사이트맵 등록'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1 text-xs font-semibold"
            >
              <Key className="size-3.5" />
              서비스 계정 키 설정
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {sitemapSubmission && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-300">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
              <div className="space-y-1">
                <p className="font-bold">사이트맵 등록 완료</p>
                <p>
                  Google Search Console에 {sitemapSubmission.submittedUrlCount.toLocaleString()}개 URL이 포함된 사이트맵을 등록/갱신했습니다.
                </p>
                <p className="break-all text-[11px] opacity-90">{sitemapSubmission.sitemapUrl}</p>
                <p className="text-[11px] opacity-90">
                  상태: {sitemapSubmission.isPending ? '처리 대기' : '접수됨'} · 오류 {sitemapSubmission.errors} · 경고 {sitemapSubmission.warnings}
                  {sitemapSubmission.lastDownloaded
                    ? ` · Google 마지막 다운로드 ${new Date(sitemapSubmission.lastDownloaded).toLocaleString('ko-KR')}`
                    : ''}
                </p>
              </div>
            </div>
          </div>
        )}

        {sitemapSubmitError && (
          <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-bold">사이트맵 등록 실패</p>
              <p className="mt-1 break-words">{sitemapSubmitError}</p>
            </div>
          </div>
        )}

        {(loadError || data.syncError) && (
          <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-bold">Search Console 연결 상태를 확인해 주세요.</p>
              <p className="mt-1 break-words">{loadError || data.syncError}</p>
            </div>
          </div>
        )}

        {!data.hasCredentials && !loadError && (
          <div className="rounded-xl border border-border/70 bg-surface/40 p-3 text-xs text-muted-foreground">
            서비스 계정 키를 등록하면 Google Search Console의 실제 데이터만 표시됩니다. 데모 수치는 사용하지 않습니다.
          </div>
        )}

        {/* 4 Analytics Metric Counters */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-border/70 bg-surface/50 p-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
              <span>총 클릭수 (30일)</span>
              <MousePointerClick className="size-3.5 text-emerald-500" />
            </div>
            <div className="mt-1 font-mono text-xl font-black text-foreground">
              {(data?.totalClicks30d ?? 0).toLocaleString()}
              <span className="ml-1 text-xs font-normal text-muted-foreground">회</span>
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-surface/50 p-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
              <span>총 노출수 (30일)</span>
              <Eye className="size-3.5 text-primary" />
            </div>
            <div className="mt-1 font-mono text-xl font-black text-foreground">
              {(data?.totalImpressions30d ?? 0).toLocaleString()}
              <span className="ml-1 text-xs font-normal text-muted-foreground">회</span>
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-surface/50 p-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
              <span>평균 클릭률 (CTR)</span>
              <Percent className="size-3.5 text-amber-500" />
            </div>
            <div className="mt-1 font-mono text-xl font-black text-foreground">
              {data?.avgCtr30d ?? 0}%
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-surface/50 p-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
              <span>평균 게재순위</span>
              <Award className="size-3.5 text-purple-400" />
            </div>
            <div className="mt-1 font-mono text-xl font-black text-foreground">
              {data?.avgPosition30d ?? 0}위
            </div>
          </div>
        </div>

        {/* 30-Day SVG Line Chart */}
        <div className="rounded-2xl border border-border/70 bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-3">
            <div>
              <h4 className="text-xs font-bold text-foreground">30일간 검색 트렌드 추이</h4>
              <p className="text-[11px] text-muted-foreground">일자별 클릭수 및 노출수 변동 시각화</p>
            </div>

            <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-surface/40 p-0.5">
              <button
                type="button"
                onClick={() => setActiveMetric('clicks')}
                className={cn(
                  'rounded px-2.5 py-1 text-xs font-bold transition-colors',
                  activeMetric === 'clicks'
                    ? 'bg-emerald-500 text-slate-950 shadow-xs'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                클릭수 (Clicks)
              </button>
              <button
                type="button"
                onClick={() => setActiveMetric('impressions')}
                className={cn(
                  'rounded px-2.5 py-1 text-xs font-bold transition-colors',
                  activeMetric === 'impressions'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                노출수 (Impressions)
              </button>
            </div>
          </div>

          {/* SVG Canvas */}
          <div className="relative mt-3 h-36 w-full">
            <svg
              viewBox="0 0 600 140"
              preserveAspectRatio="none"
              className="h-full w-full overflow-visible"
            >
              {/* Grid Lines */}
              <line x1="0" y1="20" x2="600" y2="20" stroke="currentColor" strokeOpacity="0.08" />
              <line x1="0" y1="70" x2="600" y2="70" stroke="currentColor" strokeOpacity="0.08" />
              <line x1="0" y1="120" x2="600" y2="120" stroke="currentColor" strokeOpacity="0.08" />

              {/* Trend Polyline */}
              {chartPoints && (
                <polyline
                  fill="none"
                  stroke={activeMetric === 'clicks' ? '#10b981' : '#3b82f6'}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={chartPoints}
                />
              )}
            </svg>

            {/* Hover Tooltip display */}
            <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
              <span>{series[0]?.date || '30일 전'}</span>
              <span>15일 전</span>
              <span>{series[series.length - 1]?.date || '오늘'}</span>
            </div>
          </div>
        </div>

        {/* Top 10 Search Queries Ranking Table */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-foreground">상위 10대 유입 검색어 (Top Search Queries)</h4>
            <span className="text-[11px] text-muted-foreground">CTR 및 평균 순위 정렬</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/60 bg-surface/70 font-bold text-muted-foreground">
                <tr>
                  <th className="px-3.5 py-2.5">순위</th>
                  <th className="px-3.5 py-2.5">검색 쿼리 (Query)</th>
                  <th className="px-3.5 py-2.5 text-right">클릭수</th>
                  <th className="px-3.5 py-2.5 text-right">노출수</th>
                  <th className="px-3.5 py-2.5 text-right">클릭률 (CTR)</th>
                  <th className="px-3.5 py-2.5 text-center">평균 게재순위</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-mono">
                {(data?.topQueries || []).map((q, idx) => (
                  <tr key={q.query} className="hover:bg-surface/40 transition-colors">
                    <td className="px-3.5 py-2 text-center font-bold text-muted-foreground">{idx + 1}</td>
                    <td className="px-3.5 py-2 font-sans font-bold text-foreground">{q.query}</td>
                    <td className="px-3.5 py-2 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {q.clicks.toLocaleString()}
                    </td>
                    <td className="px-3.5 py-2 text-right text-muted-foreground">
                      {q.impressions.toLocaleString()}
                    </td>
                    <td className="px-3.5 py-2 text-right font-bold text-foreground">{q.ctr}%</td>
                    <td className="px-3.5 py-2 text-center">
                      <span className="rounded bg-primary/10 px-1.5 py-0.5 font-bold text-primary">
                        {q.position}위
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>

      {/* Service Account Key Setup Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
        >
          <div className="relative w-full max-w-lg rounded-2xl border border-border/80 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="size-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">GSC 서비스 계정 키 등록</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                ✕
              </Button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Google Cloud Console에서 발급받은 Google Search Console Search Analytics API 서비스 계정 JSON 키를 붙여넣으세요.
            </p>

            <textarea
              rows={6}
              value={keyJsonInput}
              onChange={(e) => setKeyJsonInput(e.target.value)}
              placeholder={`{\n  "type": "service_account",\n  "project_id": "moneyverse-gsc",\n  "client_email": "seo-sa@...",\n  "private_key": "..."\n}`}
              className="w-full rounded-xl border border-border/80 bg-surface/50 p-3 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />

            {modalFeedback && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>{modalFeedback}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              {data?.hasCredentials ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteCredentials}
                  className="flex items-center gap-1.5 text-xs"
                >
                  <Trash2 className="size-3.5" />
                  키 삭제
                </Button>
              ) : <div />}

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                  닫기
                </Button>
                <Button size="sm" onClick={handleSaveCredentials} className="text-xs font-bold">
                  저장 및 활성화
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
