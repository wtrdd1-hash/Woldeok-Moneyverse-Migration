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

interface QueryLandingInfo {
  readonly path: string;
  readonly label: string;
  readonly badge: string;
  readonly badgeColor: string;
}

function getQueryLanding(rawQuery: string): QueryLandingInfo {
  const q = rawQuery.toLowerCase().trim();

  // 대출 / 이자 / 30년 상환
  if (q.includes('대출') || q.includes('상환') || q.includes('이자') || q.includes('loan')) {
    return {
      path: '/tools/loan-interest-calculator',
      label: '대출이자·상환 계산기',
      badge: '대출/금융',
      badgeColor: 'border-blue-500/30 bg-blue-500/10 text-blue-500',
    };
  }

  // CAGR / 복리 / 적립식 / DCA
  if (q.includes('cagr') || q.includes('복리') || q.includes('dca') || q.includes('적립') || q.includes('수익률')) {
    return {
      path: '/tools/compound-calculator',
      label: '복리·CAGR 시뮬레이터',
      badge: '투자/복리',
      badgeColor: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500',
    };
  }

  // 배당 / dividend / 세금
  if (q.includes('dividend') || q.includes('배당') || q.includes('분배금')) {
    return {
      path: '/tools/dividend-tax-calculator',
      label: '배당소득세·절세 계산기',
      badge: '배당/세제',
      badgeColor: 'border-amber-500/30 bg-amber-500/10 text-amber-500',
    };
  }

  // 양도소득세 / 양도세
  if (q.includes('양도') || q.includes('capital gain')) {
    return {
      path: '/tools/capital-gains-tax-calculator',
      label: '해외주식 양도소득세 계산기',
      badge: '세금/절세',
      badgeColor: 'border-orange-500/30 bg-orange-500/10 text-orange-500',
    };
  }

  // 연금 / 퇴직 / 은퇴
  if (q.includes('연금') || q.includes('퇴직') || q.includes('은퇴') || q.includes('pension')) {
    return {
      path: '/tools/retirement-calculator',
      label: '은퇴·연금 세제 계산기',
      badge: '연금/은퇴',
      badgeColor: 'border-purple-500/30 bg-purple-500/10 text-purple-500',
    };
  }

  // 부동산 / 청약
  if (q.includes('부동산') || q.includes('청약') || q.includes('주택')) {
    return {
      path: '/tools/real-estate-calculator',
      label: '부동산 취득·보유세 계산기',
      badge: '부동산',
      badgeColor: 'border-rose-500/30 bg-rose-500/10 text-rose-500',
    };
  }

  // ISA / 청년도약
  if (q.includes('isa') || q.includes('청년')) {
    return {
      path: '/tools/isa-calculator',
      label: 'ISA 절세 시뮬레이터',
      badge: '절세계좌',
      badgeColor: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-500',
    };
  }

  // 개발자 / 서버 / nodejs / python / api
  if (
    q.includes('node') ||
    q.includes('python') ||
    q.includes('서버') ||
    q.includes('클라우드') ||
    q.includes('api') ||
    q.includes('dev')
  ) {
    return {
      path: '/developer',
      label: '개발자 허브 & Open API',
      badge: '개발/기술',
      badgeColor: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-500',
    };
  }

  // 주식 / 종목 / 거래
  if (q.includes('주식') || q.includes('종목') || q.includes('stock') || q.includes('호가')) {
    return {
      path: '/stocks',
      label: '가상 모의주식 마켓',
      badge: '주식/마켓',
      badgeColor: 'border-sky-500/30 bg-sky-500/10 text-sky-500',
    };
  }

  // 기본값: 금융 도구 포털
  return {
    path: '/tools',
    label: '금융 계산기 허브',
    badge: '통합도구',
    badgeColor: 'border-muted-foreground/30 bg-muted/20 text-muted-foreground',
  };
}

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

          {/* SVG Canvas & Date Scale */}
          <div className="mt-3 w-full space-y-2">
            <div className="relative h-36 w-full">
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
            </div>

            {/* Date Scale display */}
            <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
              <span>{series[0]?.date || '30일 전'}</span>
              <span>15일 전</span>
              <span>{series[series.length - 1]?.date || '오늘'}</span>
            </div>
          </div>
        </div>

        {/* Top 10 Search Queries Ranking Table with Target Landing Integration */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div>
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <span>🎯</span> 상위 10대 유입 검색어 & 타겟 랜딩 연결 분석
              </h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                실제 구글 검색 유입 쿼리별 최적 랜딩 페이지 매핑 및 순위 상승(SEO Boost) 전략
              </p>
            </div>
            <span className="text-[11px] font-mono text-muted-foreground self-start sm:self-auto">
              CTR 및 평균 순위 실측 정렬
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/60 bg-surface/70 font-bold text-muted-foreground">
                <tr>
                  <th className="px-3 py-2.5 text-center">순위</th>
                  <th className="px-3 py-2.5">검색 쿼리 (Google Query)</th>
                  <th className="px-3 py-2.5">타겟 랜딩 페이지</th>
                  <th className="px-3 py-2.5 text-center">키워드 분류</th>
                  <th className="px-3 py-2.5 text-right">클릭수</th>
                  <th className="px-3 py-2.5 text-right">노출수</th>
                  <th className="px-3 py-2.5 text-right">클릭률</th>
                  <th className="px-3 py-2.5 text-center">평균 순위</th>
                  <th className="px-3 py-2.5 text-center">이동</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-mono">
                {(data?.topQueries || []).map((q, idx) => {
                  const landing = getQueryLanding(q.query);
                  const isTopTen = q.position <= 10;
                  return (
                    <tr key={q.query} className="hover:bg-surface/40 transition-colors">
                      <td className="px-3 py-2.5 text-center font-bold text-muted-foreground">{idx + 1}</td>
                      <td className="px-3 py-2.5 font-sans font-bold text-foreground whitespace-nowrap">
                        {q.query}
                      </td>
                      <td className="px-3 py-2.5 font-sans whitespace-nowrap">
                        <a
                          href={landing.path}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-primary hover:underline flex items-center gap-1"
                        >
                          <span>{landing.label}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">({landing.path})</span>
                        </a>
                      </td>
                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                        <span className={cn('text-[10px] px-2 py-0.5 rounded-full border font-sans font-semibold', landing.badgeColor)}>
                          {landing.badge}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {q.clicks.toLocaleString()}
                      </td>
                      <td className="px-3 py-2.5 text-right text-muted-foreground">
                        {q.impressions.toLocaleString()}
                      </td>
                      <td className="px-3 py-2.5 text-right font-bold text-foreground">{q.ctr}%</td>
                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                        <span
                          className={cn(
                            'rounded px-2 py-0.5 font-bold text-[11px]',
                            isTopTen
                              ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                              : 'bg-primary/10 text-primary border border-primary/20',
                          )}
                        >
                          {q.position}위
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                        <a
                          href={landing.path}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                          title="해당 랜딩 페이지 새 탭에서 열기"
                        >
                          ↗
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs leading-relaxed text-muted-foreground flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-primary text-base">💡</span>
              <span>
                <b>SEO 인구 증가 전략:</b> 게재순위 30~80위권의 <b>'2억 대출 30년 상환'</b>, <b>'cagr'</b>, <b>'dividend yield'</b> 등 금융 계산기 검색어는 메타태그와 프리셋 보강 시 1페이지(1~10위) 진입 잠재력이 가장 높습니다.
              </span>
            </div>
            <a
              href="/tools"
              className="shrink-0 px-3 py-1 rounded-lg bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 transition-colors"
            >
              계산기 도구 허브 보기
            </a>
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
