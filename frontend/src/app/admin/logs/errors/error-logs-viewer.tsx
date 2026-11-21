'use client';

import { useState, useEffect, useTransition, useCallback, useMemo } from 'react';
import {
  AlertTriangle,
  Search,
  RefreshCw,
  Download,
  Copy,
  Check,
  Calendar,
  Code2,
  Globe,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X,
  FileCode,
  Layers,
  Terminal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  fetchStructuredErrorLogsAction,
  type StructuredErrorLog,
  type ErrorLogsResult,
} from './actions';

interface ErrorLogsViewerProps {
  readonly initialData: ErrorLogsResult;
}

export function ErrorLogsViewer({ initialData }: ErrorLogsViewerProps) {
  const [data, setData] = useState<ErrorLogsResult>(initialData);
  const [dateFilter, setDateFilter] = useState<string>('ALL');
  const [codeFilter, setCodeFilter] = useState<string>('ALL');
  const [routeFilter, setRouteFilter] = useState<string>('');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
  const [selectedError, setSelectedError] = useState<StructuredErrorLog | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  const loadData = useCallback(() => {
    startTransition(async () => {
      const res = await fetchStructuredErrorLogsAction(
        dateFilter,
        codeFilter,
        routeFilter,
        searchFilter,
        sortOrder,
      );
      if (res.success && res.data) {
        setData(res.data);
      }
    });
  }, [dateFilter, codeFilter, routeFilter, searchFilter, sortOrder]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      loadData();
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, loadData]);

  // Statistics
  const todayKst = useMemo(() => {
    const d = new Date();
    return new Intl.DateTimeFormat('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d).replace(/\. /g, '-').replace('.', '');
  }, []);

  const stats = useMemo(() => {
    const todayCount = data.logs.filter((l) => l.dateKst === todayKst).length;
    const routeCounts = new Map<string, number>();
    for (const l of data.logs) {
      routeCounts.set(l.route, (routeCounts.get(l.route) ?? 0) + 1);
    }
    let topRoute = '-';
    let topCount = 0;
    routeCounts.forEach((cnt, r) => {
      if (cnt > topCount) {
        topCount = cnt;
        topRoute = r;
      }
    });

    return {
      total: data.totalCount,
      filtered: data.logs.length,
      today: todayCount,
      uniqueCodes: data.availableCodes.length,
      topRoute: topRoute === '-' ? '-' : `${topRoute} (${topCount}회)`,
    };
  }, [data, todayKst]);

  const handleCopyRecord = async (item: StructuredErrorLog) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(item, null, 2));
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      /* ignore */
    }
  };

  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data.logs, null, 2));
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const handleDownloadCsv = () => {
    if (!data.logs.length) return;
    const headers = ['ID', 'Date(KST)', 'Time(KST)', 'ErrorCode', 'Route', 'User', 'IP', 'Message', 'UserAgent'];
    const rows = data.logs.map((l) => [
      l.id,
      l.dateKst,
      l.timeKst,
      `"${l.errorCode.replace(/"/g, '""')}"`,
      `"${l.route.replace(/"/g, '""')}"`,
      l.user,
      `"${l.ip.replace(/"/g, '""')}"`,
      `"${l.message.replace(/"/g, '""')}"`,
      `"${l.userAgent.replace(/"/g, '""')}"`,
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moneyverse-error-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getBadgeStyle = (code: string) => {
    if (code.includes('React') || code.includes('Crash') || code.includes('500')) {
      return 'bg-red-500/15 text-red-400 border-red-500/30';
    }
    if (code.includes('Type') || code.includes('Reference') || code.includes('Syntax')) {
      return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    }
    return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
  };

  const parseBrowser = (ua: string) => {
    if (!ua) return 'Unknown';
    if (ua.includes('Chrome/')) {
      const match = ua.match(/Chrome\/(\d+)/);
      return `Chrome ${match ? match[1] : ''}`;
    }
    if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Safari';
    if (ua.includes('Firefox/')) return 'Firefox';
    if (ua.includes('curl/')) return 'cURL CLI';
    return ua.slice(0, 15);
  };

  return (
    <div className="space-y-6">
      {/* 4대 주요 지표 KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border bg-card/60 backdrop-blur-xs">
          <CardHeader className="py-3 px-4 pb-1">
            <CardDescription className="text-xs font-medium flex items-center justify-between">
              <span>총 누적 에러 원장</span>
              <AlertTriangle className="h-4 w-4 text-red-400" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-foreground">
              {stats.total.toLocaleString()}<span className="text-sm font-normal text-muted-foreground ml-1">건</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 pt-0 text-xs text-muted-foreground">
            {stats.filtered !== stats.total ? `현재 필터: ${stats.filtered}건 표시` : '전수 저장 원장 보존 중'}
          </CardContent>
        </Card>

        <Card className="border-border bg-card/60 backdrop-blur-xs">
          <CardHeader className="py-3 px-4 pb-1">
            <CardDescription className="text-xs font-medium flex items-center justify-between">
              <span>오늘(KST) 발생</span>
              <Calendar className="h-4 w-4 text-amber-400" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-foreground">
              {stats.today.toLocaleString()}<span className="text-sm font-normal text-muted-foreground ml-1">건</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 pt-0 text-xs text-muted-foreground">
            기준: {todayKst}
          </CardContent>
        </Card>

        <Card className="border-border bg-card/60 backdrop-blur-xs">
          <CardHeader className="py-3 px-4 pb-1">
            <CardDescription className="text-xs font-medium flex items-center justify-between">
              <span>고유 오류 코드 분류</span>
              <Code2 className="h-4 w-4 text-blue-400" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-foreground">
              {stats.uniqueCodes}<span className="text-sm font-normal text-muted-foreground ml-1">종</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 pt-0 text-xs text-muted-foreground">
            React #418, Crash, Network 등
          </CardContent>
        </Card>

        <Card className="border-border bg-card/60 backdrop-blur-xs">
          <CardHeader className="py-3 px-4 pb-1">
            <CardDescription className="text-xs font-medium flex items-center justify-between">
              <span>최다 발생 화면 경로</span>
              <Globe className="h-4 w-4 text-emerald-400" />
            </CardDescription>
            <CardTitle className="text-sm font-mono font-bold truncate text-foreground pt-1">
              {stats.topRoute}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 pt-0 text-xs text-muted-foreground">
            이상 징후 발생 라우트
          </CardContent>
        </Card>
      </div>

      {/* 필터 및 조작 바 */}
      <Card className="border-border bg-card">
        <CardHeader className="py-4 px-5 border-b border-border">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* 날짜 필터 */}
              <div className="flex items-center gap-1.5 bg-muted/60 px-2.5 py-1.5 rounded-lg border border-border">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-medium mr-1">날짜:</span>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="bg-transparent text-xs font-medium focus:outline-hidden cursor-pointer"
                >
                  <option value="ALL">전체 날짜</option>
                  {data.availableDates.map((d) => (
                    <option key={d} value={d} className="bg-popover text-popover-foreground">
                      {d} {d === todayKst ? '(오늘)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* 오류 코드 필터 */}
              <div className="flex items-center gap-1.5 bg-muted/60 px-2.5 py-1.5 rounded-lg border border-border">
                <Code2 className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-medium mr-1">오류 코드:</span>
                <select
                  value={codeFilter}
                  onChange={(e) => setCodeFilter(e.target.value)}
                  className="bg-transparent text-xs font-medium focus:outline-hidden cursor-pointer"
                >
                  <option value="ALL">전체 오류 코드</option>
                  {data.availableCodes.map((c) => (
                    <option key={c} value={c} className="bg-popover text-popover-foreground">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* 발생 경로 필터 */}
              <div className="flex items-center gap-1.5 bg-muted/60 px-2.5 py-1 rounded-lg border border-border">
                <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="경로 검색 (/admin...)"
                  value={routeFilter}
                  onChange={(e) => setRouteFilter(e.target.value)}
                  className="h-7 w-32 border-0 bg-transparent px-1 text-xs focus-visible:ring-0"
                />
              </div>

              {/* 검색어 필터 */}
              <div className="flex items-center gap-1.5 bg-muted/60 px-2.5 py-1 rounded-lg border border-border">
                <Search className="h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="메시지, IP, 스택 검색..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="h-7 w-36 sm:w-48 border-0 bg-transparent px-1 text-xs focus-visible:ring-0"
                />
              </div>
            </div>

            {/* 정렬 및 도구 버튼 */}
            <div className="flex items-center gap-2 self-end lg:self-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="h-8 text-xs gap-1"
              >
                <Clock className="h-3.5 w-3.5" />
                {sortOrder === 'desc' ? '최신순 ▼' : '과거순 ▲'}
              </Button>

              <Button
                variant={autoRefresh ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className="h-8 text-xs gap-1"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${autoRefresh ? 'animate-spin' : ''}`} />
                {autoRefresh ? '5초 실시간' : '실시간 끔'}
              </Button>

              <Button variant="outline" size="sm" onClick={loadData} disabled={isPending} className="h-8 text-xs">
                새로고침
              </Button>

              <Button variant="outline" size="sm" onClick={handleCopyAll} className="h-8 text-xs gap-1">
                {copiedAll ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                복사
              </Button>

              <Button variant="outline" size="sm" onClick={handleDownloadCsv} className="h-8 text-xs gap-1">
                <Download className="h-3.5 w-3.5" />
                CSV
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* 오류 목록 테이블 */}
        <CardContent className="p-0">
          {data.logs.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground space-y-3">
              <div className="inline-flex p-3 rounded-full bg-muted/50 text-muted-foreground">
                <AlertTriangle className="h-8 w-8 text-emerald-400/80" />
              </div>
              <div className="text-sm font-medium text-foreground">조건에 일치하는 오류 로그가 없습니다</div>
              <div className="text-xs">필터 조건을 재설정하거나 전체 날짜를 선택해 보세요.</div>
              {(dateFilter !== 'ALL' || codeFilter !== 'ALL' || routeFilter || searchFilter) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDateFilter('ALL');
                    setCodeFilter('ALL');
                    setRouteFilter('');
                    setSearchFilter('');
                  }}
                  className="text-xs"
                >
                  필터 초기화
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                    <th className="py-3 px-4 w-40">발생 일시 (KST)</th>
                    <th className="py-3 px-3 w-32">오류 코드</th>
                    <th className="py-3 px-3 w-40">발생 경로</th>
                    <th className="py-3 px-4">오류 메시지 요약</th>
                    <th className="py-3 px-3 w-32">클라이언트 환경</th>
                    <th className="py-3 px-4 w-24 text-right">상세 분석</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.logs.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-accent/40 transition-colors cursor-pointer group"
                      onClick={() => setSelectedError(item)}
                    >
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-mono font-medium text-foreground">{item.dateKst}</div>
                        <div className="font-mono text-muted-foreground text-[11px]">{item.timeKst}</div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <Badge variant="outline" className={`font-mono text-[11px] font-bold ${getBadgeStyle(item.errorCode)}`}>
                          {item.errorCode}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-muted text-foreground border border-border">
                          {item.route}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-md">
                        <div className="font-medium text-foreground truncate">{item.message}</div>
                        {item.stack && (
                          <div className="text-[11px] text-muted-foreground truncate font-mono mt-0.5 opacity-80">
                            {item.stack.slice(0, 100)}...
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="text-foreground font-medium">{parseBrowser(item.userAgent)}</div>
                        <div className="font-mono text-[11px] text-muted-foreground truncate max-w-[120px]">
                          {item.ip.split(',')[0]}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedError(item);
                          }}
                          className="h-7 text-xs px-2.5 font-medium hover:bg-primary/10 hover:text-primary"
                        >
                          상세 보기
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 에러 상세 모달 다이얼로그 */}
      {selectedError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
          <div className="relative w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-foreground">장애 상세 리포트</span>
                    <Badge variant="outline" className={`font-mono text-xs font-bold ${getBadgeStyle(selectedError.errorCode)}`}>
                      {selectedError.errorCode}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono mt-0.5">
                    {selectedError.dateKst} {selectedError.timeKst} KST ({selectedError.timestampIso})
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedError(null)}
                className="h-8 w-8 p-0 rounded-full text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* 모달 본문 */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-sm">
              {/* 발생 라우트 & 원인 메시지 */}
              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">발생 경로 & 오류 메시지</div>
                <div className="p-3.5 rounded-xl border border-border bg-muted/40 font-mono text-xs text-foreground space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">경로:</span>
                    <span className="font-bold text-primary">{selectedError.route}</span>
                    <a
                      href={selectedError.route}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary ml-2"
                    >
                      화면 열기 <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <div className="pt-1.5 border-t border-border/50 text-red-400 font-sans font-medium text-sm leading-relaxed">
                    {selectedError.message}
                  </div>
                </div>
              </div>

              {/* 클라이언트 및 접속 메타 정보 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-border bg-card/80 space-y-1">
                  <div className="text-muted-foreground font-medium">사용자 및 IP 정보</div>
                  <div className="font-mono text-foreground">{selectedError.user} / {selectedError.ip}</div>
                </div>
                <div className="p-3 rounded-xl border border-border bg-card/80 space-y-1">
                  <div className="text-muted-foreground font-medium">브라우저 환경 (User-Agent)</div>
                  <div className="font-mono text-foreground truncate" title={selectedError.userAgent}>
                    {selectedError.userAgent || 'N/A'}
                  </div>
                </div>
              </div>

              {/* 콜스택 코드 뷰어 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    호출 스택 (Stack Trace)
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyRecord(selectedError)}
                    className="h-6 text-[11px] gap-1 text-muted-foreground hover:text-foreground"
                  >
                    {copiedId === selectedError.id ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    전체 JSON 복사
                  </Button>
                </div>
                <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 font-mono text-[11px] leading-relaxed text-zinc-300 overflow-x-auto max-h-60">
                  {selectedError.stack ? (
                    <pre className="whitespace-pre-wrap break-all">{selectedError.stack.replace(/ \| /g, '\n')}</pre>
                  ) : (
                    <span className="text-zinc-500 italic">콜스택 정보가 기록되지 않았습니다.</span>
                  )}
                </div>
              </div>

              {/* 원본 로그 라인 */}
              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">원본 원장 라인 (Raw Log)</div>
                <div className="p-3 rounded-xl border border-border bg-muted/20 font-mono text-[10px] text-muted-foreground break-all">
                  {selectedError.raw}
                </div>
              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="flex items-center justify-between px-6 py-3.5 border-t border-border bg-muted/20">
              <span className="text-xs text-muted-foreground">ID: {selectedError.id}</span>
              <Button size="sm" onClick={() => setSelectedError(null)}>
                닫기
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
