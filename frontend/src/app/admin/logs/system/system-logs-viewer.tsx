'use client';

import { useState, useEffect, useTransition, useCallback } from 'react';
import {
  Terminal,
  RefreshCw,
  Download,
  Copy,
  Search,
  Check,
  AlertTriangle,
  Server,
  Globe,
  Radio,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { fetchSystemLogsAction, type SystemLogData } from './actions';

interface SystemLogsViewerProps {
  readonly initialData: SystemLogData;
}

const SOURCES = [
  { id: 'NGINX_ERROR', label: 'Nginx 오류 로그', icon: AlertTriangle, desc: '/var/log/nginx/error.log' },
  { id: 'NGINX_ACCESS', label: 'Nginx 액세스 로그', icon: Globe, desc: '/var/log/nginx/access.log' },
  { id: 'SPRING_BACKEND', label: 'Spring Boot 백엔드', icon: Server, desc: 'moneyverse-spring-backend (:4550)' },
  { id: 'FRONTEND', label: 'Spring 내장 프론트엔드', icon: Radio, desc: 'Spring Boot WebMvc (:4550)' },
  { id: 'DISCORD_BOT', label: 'Spring Discord 봇', icon: Radio, desc: 'Discord4J Daemon (:4550)' },
] as const;

const LINE_OPTIONS = [50, 100, 200, 500] as const;

export function SystemLogsViewer({ initialData }: SystemLogsViewerProps) {
  const [source, setSource] = useState<string>(initialData.sourceName || 'NGINX_ERROR');
  const [linesCount, setLinesCount] = useState<number>(100);
  const [filterText, setFilterText] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [logData, setLogData] = useState<SystemLogData>(initialData);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadLogs = useCallback((targetSource: string, targetLines: number, targetFilter: string) => {
    startTransition(async () => {
      const res = await fetchSystemLogsAction(targetSource, targetLines, targetFilter);
      if (res.success && res.data) {
        setLogData(res.data);
        setErrorMsg(null);
      } else {
        setErrorMsg(res.error ?? '로그 조회 실패');
      }
    });
  }, []);

  const handleSourceChange = (newSource: string) => {
    setSource(newSource);
    loadLogs(newSource, linesCount, filterText);
  };

  const handleRefresh = () => {
    loadLogs(source, linesCount, filterText);
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadLogs(source, linesCount, filterText);
  };

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      loadLogs(source, linesCount, filterText);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, source, linesCount, filterText, loadLogs]);

  const handleCopy = async () => {
    if (!logData.lines.length) return;
    try {
      await navigator.clipboard.writeText(logData.lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleDownload = () => {
    if (!logData.lines.length) return;
    const blob = new Blob([logData.lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${source.toLowerCase()}-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.log`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const highlightLine = (line: string) => {
    const lower = line.toLowerCase();
    if (lower.includes('error') || lower.includes('fail') || lower.includes('crit') || lower.includes('502') || lower.includes('500')) {
      return 'text-red-400 bg-red-950/20';
    }
    if (lower.includes('warn') || lower.includes('404') || lower.includes('timeout')) {
      return 'text-amber-300 bg-amber-950/15';
    }
    if (lower.includes('info') || lower.includes('success') || lower.includes('200')) {
      return 'text-emerald-300/90';
    }
    return 'text-zinc-300';
  };

  return (
    <div className="space-y-4">
      {/* 4대 로그 소스 선택 탭 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {SOURCES.map((s) => {
          const Icon = s.icon;
          const isSelected = source === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => handleSourceChange(s.id)}
              className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'border-primary bg-primary/10 shadow-sm ring-1 ring-primary'
                  : 'border-border bg-card hover:bg-accent/40'
              }`}
            >
              <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold truncate">{s.label}</div>
                <div className="text-xs text-muted-foreground truncate">{s.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 조작 및 필터 툴바 */}
      <Card>
        <CardHeader className="py-3 px-4 border-b">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-semibold">
                {SOURCES.find((s) => s.id === source)?.label ?? source}
              </CardTitle>
              <Badge variant="outline" className="font-mono text-xs">
                {logData.totalCount}줄
              </Badge>
              {logData.timestamp && (
                <span className="text-xs text-muted-foreground">
                  갱신: {new Date(logData.timestamp).toLocaleTimeString()}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <form onSubmit={handleFilterSubmit} className="flex items-center gap-1.5">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="로그 필터 검색..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    className="h-8 w-44 pl-8 text-xs font-mono"
                  />
                </div>
                <Button type="submit" size="sm" variant="outline" className="h-8 text-xs" disabled={isPending}>
                  검색
                </Button>
              </form>

              <div className="flex items-center gap-1 border-l pl-2 border-border">
                {LINE_OPTIONS.map((num) => (
                  <Button
                    key={num}
                    size="sm"
                    variant={linesCount === num ? 'secondary' : 'ghost'}
                    className="h-8 px-2 text-xs"
                    onClick={() => {
                      setLinesCount(num);
                      loadLogs(source, num, filterText);
                    }}
                    disabled={isPending}
                  >
                    {num}줄
                  </Button>
                ))}
              </div>

              <div className="flex items-center gap-1.5 border-l pl-2 border-border">
                <Button
                  size="sm"
                  variant={autoRefresh ? 'default' : 'outline'}
                  className="h-8 text-xs gap-1.5"
                  onClick={() => setAutoRefresh(!autoRefresh)}
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${autoRefresh ? 'animate-spin' : ''}`} />
                  {autoRefresh ? '5초 자동' : '수동'}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs"
                  onClick={handleRefresh}
                  disabled={isPending}
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isPending ? 'animate-spin' : ''}`} />
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs gap-1"
                  onClick={handleCopy}
                  disabled={!logData.lines.length}
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? '복사됨' : '복사'}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs gap-1"
                  onClick={handleDownload}
                  disabled={!logData.lines.length}
                >
                  <Download className="h-3.5 w-3.5" />
                  저장
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {errorMsg && (
            <div className="p-4 bg-destructive/10 text-destructive text-xs border-b border-destructive/20">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* 터미널 뷰어 박스 */}
          <div className="relative bg-zinc-950 font-mono text-xs rounded-b-xl overflow-x-auto min-h-[480px] max-h-[640px] p-4 text-zinc-200">
            {isPending && (
              <div className="absolute top-2 right-3 flex items-center gap-1.5 bg-zinc-900/80 px-2 py-1 rounded text-zinc-400 text-[11px] border border-zinc-800">
                <RefreshCw className="h-3 w-3 animate-spin text-primary" />
                불러오는 중...
              </div>
            )}

            {logData.lines.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-zinc-500 space-y-2">
                <Terminal className="h-8 w-8 text-zinc-600" />
                <p className="text-sm">기록된 로그 라인이 없습니다.</p>
                <p className="text-xs text-zinc-600">
                  {source === 'NGINX_ERROR'
                    ? '현재 Nginx 에러가 0건(Zero Error)으로 매우 정상적인 상태입니다.'
                    : '조건에 일치하는 로그 항목이 없습니다.'}
                </p>
              </div>
            ) : (
              <div className="space-y-0.5 leading-relaxed">
                {logData.lines.map((line, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start hover:bg-zinc-900/60 rounded px-1.5 py-0.5 ${highlightLine(line)}`}
                  >
                    <span className="select-none text-zinc-600 mr-3.5 text-right w-8 shrink-0 text-[11px]">
                      {idx + 1}
                    </span>
                    <span className="whitespace-pre-wrap break-all flex-1">{line}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
