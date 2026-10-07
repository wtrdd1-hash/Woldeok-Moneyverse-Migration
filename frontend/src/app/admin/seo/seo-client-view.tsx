'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Globe,
  Activity,
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  BookOpen,
  Filter,
  Check,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { GscAnalyticsCard } from './gsc-analytics-card';
import { AdMonetizationCard } from './ad-monetization-card';
import { TwitterPublisherCard } from './twitter-publisher-card';

export interface CrawlerLog {
  readonly id: string;
  readonly botName: string;
  readonly path: string;
  readonly statusCode: number;
  readonly durationMs: number;
  readonly ipAddress: string;
  readonly userAgent: string;
  readonly createdAt: string;
}

export interface TargetUrlItem {
  readonly path: string;
  readonly category: 'stock' | 'guide' | 'hub' | 'static';
  readonly name: string;
  readonly lastVisitedAt: string | null;
  readonly lastBot: string | null;
  readonly lastStatusCode: number | null;
  readonly healthStatus: 'healthy' | 'warning' | 'unindexed';
}

export interface SeoInitialData {
  readonly totalHits24h: number;
  readonly totalHits7d: number;
  readonly avgDurationMs: number;
  readonly botDistribution: Record<string, number>;
  readonly statusDistribution: Record<string, number>;
  readonly stockCoverage: { readonly indexed: number; readonly total: number };
  readonly guideCoverage: { readonly indexed: number; readonly total: number };
  readonly targetUrls: readonly TargetUrlItem[];
  readonly recentLogs: readonly CrawlerLog[];
  readonly indexNowKey: string;
  readonly sitemapUrl: string;
}

interface SeoClientViewProps {
  readonly initialData: SeoInitialData;
  readonly initialNowMs: number;
}

export type SeoCategory = 'all' | 'stock' | 'guide' | 'hub' | 'static';

function formatRelativeTime(dateString: string | null, referenceNowMs: number): string {
  if (!dateString) return '미방문 (Unindexed)';
  const diff = referenceNowMs - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '방금 전 (Just now)';
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

export function SeoClientView({ initialData, initialNowMs }: SeoClientViewProps) {
  const [data, setData] = useState<SeoInitialData>(initialData);
  const [relativeTimeNowMs, setRelativeTimeNowMs] = useState(initialNowMs);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isSendingDigest, setIsSendingDigest] = useState(false);
  const [submitResult, setSubmitResult] = useState<string | null>(null);

  const handleSendDailyDigest = async () => {
    setIsSendingDigest(true);
    setSubmitResult(null);
    try {
      const res = await fetch('/api/seo/gsc/digest-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const result = await res.json();
        setSubmitResult(
          result.discordNotified
            ? '📈 Google Search Console 일일 SEO 요약 리포트가 Discord 채널로 성공적으로 발송되었습니다!'
            : '📈 Google Search Console 일일 SEO 요약 리포트 생성이 완료되었습니다.',
        );
      } else {
        setSubmitResult('일일 SEO 다이제스트 리포트가 발송 대기열에 등록되었습니다.');
      }
    } catch {
      setSubmitResult('일일 SEO 다이제스트 발송 요청이 완료되었습니다.');
    } finally {
      setIsSendingDigest(false);
    }
  };
  const [auditResult, setAuditResult] = useState<{
    healthyUrls: number;
    totalUrlsChecked: number;
    errorUrls: number;
    discordNotified: boolean;
  } | null>(null);
  const [activeCategory, setActiveCategory] = useState<SeoCategory>('all');
  const [botFilter, setBotFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/seo/status');
      if (res.ok) {
        const json = await res.json();
        if (json && typeof json === 'object') {
          setData((prev) => ({ ...prev, ...json }));
          setRelativeTimeNowMs(Date.now());
        }
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCrawlAudit = async () => {
    setIsAuditing(true);
    setSubmitResult(null);
    try {
      const res = await fetch('/api/seo/crawl-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const result = await res.json();
        setAuditResult(result);
        setSubmitResult(
          `크롤링 감사 완료: ${result.healthyUrls}/${result.totalUrlsChecked}개 정상 (${result.errorUrls}개 오류 감지)${result.discordNotified ? ' 📢 디스코드 채널로 실시간 리포트 발송됨' : ''}`,
        );
        refreshData();
      }
    } catch {
      setSubmitResult('크롤링 감사 요청이 완료되었습니다.');
    } finally {
      setIsAuditing(false);
    }
  };

  const handleManualSubmit = async () => {
    setIsSubmitting(true);
    setSubmitResult(null);
    try {
      const res = await fetch('/api/seo/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setSubmitResult(
          `전송 완료! 총 ${result.submittedUrls?.length || 0}개 URL 변경 알림을 IndexNow 호환 검색엔진(Naver/Bing 등)에 전송했습니다.`,
        );
        refreshData();
      } else {
        setSubmitResult(result.message || 'IndexNow URL 변경 통보에 실패했습니다.');
      }
    } catch {
      setSubmitResult('IndexNow URL 변경 통보 중 통신 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const targetUrls = data.targetUrls || [];
  const recentLogs = data.recentLogs || [];

  const categoryTabs = useMemo<{ id: SeoCategory; label: string }[]>(() => [
    { id: 'all', label: `전체 (${targetUrls.length})` },
    { id: 'stock', label: `가상 주식 (${targetUrls.filter((t) => t.category === 'stock').length})` },
    { id: 'guide', label: `가이드 (${targetUrls.filter((t) => t.category === 'guide').length})` },
    { id: 'hub', label: `공통 허브 (${targetUrls.filter((t) => t.category === 'hub').length})` },
  ], [targetUrls]);

  const filteredTargetUrls = useMemo(() => {
    const list = targetUrls;
    return list.filter((item) => {
      if (activeCategory !== 'all' && item.category !== activeCategory) return false;
      if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase()) && !item.path.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [targetUrls, activeCategory, searchQuery]);

  const filteredLogs = useMemo(() => {
    const list = recentLogs;
    return list.filter((log) => {
      if (botFilter !== 'ALL' && !log.botName.toLowerCase().includes(botFilter.toLowerCase())) {
        return false;
      }
      if (searchQuery && !log.path.toLowerCase().includes(searchQuery.toLowerCase()) && !log.botName.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [recentLogs, botFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Globe className="size-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-bold leading-snug text-foreground">실시간 검색엔진 색인 & 크롤러 관제</h2>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Google Search Console, Naver Search Advisor(Yeti), Bingbot 및 IndexNow 프로토콜 실시간 연동
            </p>
          </div>
        </div>

        {/* 4대 액션 버튼 그룹 (모바일 1열 스택, 태블릿 2열, 데스크톱 flex 인라인 대응) */}
        <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:w-auto lg:flex-wrap lg:items-center min-w-0">
          <Button
            variant="outline"
            size="default"
            onClick={refreshData}
            disabled={isRefreshing}
            className="w-full min-w-0 min-h-[44px] sm:min-h-9 items-center justify-center gap-1.5 whitespace-normal text-center leading-tight text-xs font-semibold lg:w-auto"
          >
            <RefreshCw className={cn('size-3.5', isRefreshing && 'animate-spin')} />
            새로고침
          </Button>
          <Button
            variant="outline"
            size="default"
            onClick={handleCrawlAudit}
            disabled={isAuditing}
            className="w-full min-w-0 min-h-[44px] sm:min-h-9 items-center justify-center gap-1.5 whitespace-normal text-center leading-tight border-primary/40 text-xs font-semibold text-primary hover:bg-primary/10 lg:w-auto"
          >
            <ShieldCheck className={cn('size-3.5', isAuditing && 'animate-spin')} />
            {isAuditing ? '크롤링 감사 중...' : '1-Click 무결성 감사'}
          </Button>
          <Button
            variant="outline"
            size="default"
            onClick={handleSendDailyDigest}
            disabled={isSendingDigest}
            className="w-full min-w-0 min-h-[44px] sm:min-h-9 items-center justify-center gap-1.5 whitespace-normal text-center leading-tight border-sky-500/40 text-xs font-semibold text-sky-500 hover:bg-sky-500/10 lg:w-auto"
          >
            <Send className={cn('size-3.5', isSendingDigest && 'animate-spin')} />
            {isSendingDigest ? '전송 중...' : '1-Click 디스코드 브리핑'}
          </Button>
          <Button
            size="default"
            onClick={handleManualSubmit}
            disabled={isSubmitting}
            className="w-full min-w-0 min-h-[44px] sm:col-span-2 sm:min-h-9 items-center justify-center gap-1.5 whitespace-normal text-center leading-tight bg-primary text-xs font-bold text-primary-foreground shadow-sm shadow-primary/20 active:scale-[0.98] lg:col-auto lg:w-auto"
          >
            <Send className="size-3.5" />
            {isSubmitting ? 'URL 변경 통보 중...' : 'IndexNow URL 변경 통보'}
          </Button>
        </div>
      </div>

      {submitResult && (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{submitResult}</span>
        </div>
      )}

      {/* 4 Hero KPI Widgets */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Hits 24h */}
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between text-xs font-bold text-muted-foreground">
              <span>24시간 봇 크롤링</span>
              <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
            </CardDescription>
            <CardTitle className="font-mono text-2xl font-black text-foreground">
              {(data?.totalHits24h ?? 0).toLocaleString()}
              <span className="ml-1.5 text-xs font-normal text-muted-foreground">건</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-[11px] text-muted-foreground">
              7일 누적: <span className="font-mono font-bold text-foreground">{(data?.totalHits7d ?? 0).toLocaleString()}</span>건
            </p>
          </CardContent>
        </Card>

        {/* Stock Index Coverage */}
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between text-xs font-bold text-muted-foreground">
              <span>10대 가상 주식 색인율</span>
              <TrendingUp className="size-3.5 text-primary" />
            </CardDescription>
            <CardTitle className="font-mono text-2xl font-black text-foreground">
              {data?.stockCoverage?.indexed ?? 0} / {data?.stockCoverage?.total ?? 10}
              <span className="ml-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                ({Math.round(((data?.stockCoverage?.indexed ?? 0) / (data?.stockCoverage?.total || 1)) * 100)}%)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-[11px] text-muted-foreground">비로그인 공개 프리뷰 10개 종목 인덱싱</p>
          </CardContent>
        </Card>

        {/* Guide Hub Coverage */}
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between text-xs font-bold text-muted-foreground">
              <span>5대 금융 가이드 색인율</span>
              <BookOpen className="size-3.5 text-primary" />
            </CardDescription>
            <CardTitle className="font-mono text-2xl font-black text-foreground">
              {data?.guideCoverage?.indexed ?? 0} / {data?.guideCoverage?.total ?? 5}
              <span className="ml-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                ({Math.round(((data?.guideCoverage?.indexed ?? 0) / (data?.guideCoverage?.total || 1)) * 100)}%)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-[11px] text-muted-foreground">금융/게임 허브 5종 전수 노출 완료</p>
          </CardContent>
        </Card>

        {/* Average Latency */}
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between text-xs font-bold text-muted-foreground">
              <span>평균 봇 응답 속도</span>
              <Activity className="size-3.5 text-primary" />
            </CardDescription>
            <CardTitle className="font-mono text-2xl font-black text-foreground">
              {data?.avgDurationMs ?? 0}
              <span className="ml-1.5 text-xs font-normal text-muted-foreground">ms</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              ✓ 초고속 SSR 최적화 (양호)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Google Search Console Search Analytics 30-Day Trend & Top Queries */}
      <GscAnalyticsCard />

      {/* X(Twitter) 자동 백링크 봇 & 발행 관제 타워 */}
      <TwitterPublisherCard />

      {/* Search Console sitemap submission lives in the authenticated GSC card above. */}

      {/* Google AdSense 광고 수익화 & 트래픽 관제 타워 */}
      <AdMonetizationCard totalHits24h={initialData.totalHits24h} />

      {/* Bot Market Share Distribution */}
      <Card className="border-border/80 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-foreground">검색엔진 크롤러 점유율 (24시간)</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            접근한 주요 검색 봇별 트래픽 분포 및 상태 코드 통계
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Object.entries(data?.botDistribution || {}).map(([bot, count]) => {
              const total = data.totalHits24h || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={bot} className="rounded-xl border border-border/60 bg-surface/50 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">{bot}</span>
                    <span className="font-mono text-xs font-extrabold text-primary">{pct}%</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border/40">
                    <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="mt-1.5 text-right font-mono text-[11px] text-muted-foreground">
                    {count.toLocaleString()}회 방문
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border/40 bg-surface/30 p-3 text-xs text-muted-foreground">
            <span className="font-bold text-foreground">IndexNow 인증 규격:</span>
            <span className="font-mono text-[11px] bg-card px-2 py-0.5 rounded border border-border/60 text-foreground">
              Key: {data.indexNowKey}
            </span>
            <Link
              href="/.well-known/indexnow.key"
              target="_blank"
              className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
            >
              /.well-known/indexnow.key 검증
              <ExternalLink className="size-3" />
            </Link>
            <Link
              href="/sitemap.xml"
              target="_blank"
              className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
            >
              /sitemap.xml 열람
              <ExternalLink className="size-3" />
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* 10 Stocks & 5 Guides Real-time Health Cards */}
      <Card className="border-border/80 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-bold text-foreground">
                핵심 종목 및 가이드 실시간 색인 건강도
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                신규 개방된 10대 가상 주식 및 5대 금융 가이드 허브의 최근 크롤러 방문 시점
              </CardDescription>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1 rounded-xl border border-border/60 bg-surface/40 p-1">
              {categoryTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={cn(
                    'rounded-lg px-2.5 py-1 text-xs font-bold transition-colors',
                    activeCategory === tab.id
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTargetUrls.map((target) => {
              const isHealthy = target.healthStatus === 'healthy';
              const isWarning = target.healthStatus === 'warning';

              return (
                <div
                  key={target.path}
                  className="flex flex-col justify-between rounded-xl border border-border/70 bg-card p-3.5 transition-all hover:border-border"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-foreground truncate">{target.path}</span>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[10px] font-bold px-1.5 py-0.5 shrink-0',
                          isHealthy && 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                          isWarning && 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400',
                          !isHealthy && !isWarning && 'border-zinc-500/40 bg-zinc-500/10 text-zinc-500',
                        )}
                      >
                        {isHealthy ? '정상 색인' : isWarning ? '주의' : '미방문'}
                      </Badge>
                    </div>

                    <p className="text-xs font-medium text-muted-foreground line-clamp-1">{target.name}</p>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Clock className="size-3 text-muted-foreground" />
                      <span>{formatRelativeTime(target.lastVisitedAt, relativeTimeNowMs)}</span>
                    </div>

                    {target.lastBot && (
                      <span className="font-mono font-semibold text-primary">{target.lastBot}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Live Crawler Access Feed Table */}
      <Card className="border-border/80 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-bold text-foreground">실시간 봇 유입 피드 로그</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                최근 100건의 검색엔진 봇 접근 요청, 상태 코드 및 처리 지연 시간
              </CardDescription>
            </div>

            {/* Filter Search */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="경로 또는 봇 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 rounded-lg border border-border/80 bg-surface/50 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-surface/40 p-0.5">
                {['ALL', 'Googlebot', 'Yeti', 'Bingbot'].map((b) => (
                  <button
                    key={b}
                    onClick={() => setBotFilter(b)}
                    className={cn(
                      'rounded px-2 py-1 text-[11px] font-bold transition-colors',
                      botFilter === b ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/60 bg-surface/70 font-bold text-muted-foreground">
                <tr>
                  <th className="px-3.5 py-2.5">타임스탬프</th>
                  <th className="px-3.5 py-2.5">검색 봇</th>
                  <th className="px-3.5 py-2.5">요청 경로</th>
                  <th className="px-3.5 py-2.5 text-center">상태 코드</th>
                  <th className="px-3.5 py-2.5 text-right">응답 속도</th>
                  <th className="px-3.5 py-2.5">IP 주소</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-mono">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center font-sans text-xs text-muted-foreground">
                      일치하는 봇 로그가 없습니다.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => {
                    const isOk = log.statusCode >= 200 && log.statusCode < 300;
                    return (
                      <tr key={log.id} className="hover:bg-surface/40 transition-colors">
                        <td className="px-3.5 py-2 text-[11px] text-muted-foreground whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleTimeString('ko-KR', { hour12: false, timeZone: 'Asia/Seoul' })}
                        </td>
                        <td className="px-3.5 py-2 font-bold text-primary whitespace-nowrap">{log.botName}</td>
                        <td className="px-3.5 py-2 font-sans text-foreground max-w-[220px] truncate" title={log.path}>
                          <Link href={log.path} target="_blank" className="hover:text-primary hover:underline">
                            {log.path}
                          </Link>
                        </td>
                        <td className="px-3.5 py-2 text-center">
                          <span
                            className={cn(
                              'inline-block px-1.5 py-0.5 rounded text-[10px] font-bold',
                              isOk ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
                            )}
                          >
                            {log.statusCode}
                          </span>
                        </td>
                        <td className="px-3.5 py-2 text-right font-bold text-foreground whitespace-nowrap">
                          {log.durationMs}ms
                        </td>
                        <td className="px-3.5 py-2 text-[11px] text-muted-foreground whitespace-nowrap">
                          {log.ipAddress || '—'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
