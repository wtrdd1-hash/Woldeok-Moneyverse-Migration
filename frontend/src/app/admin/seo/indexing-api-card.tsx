'use client';

import React, { useState } from 'react';
import { Zap, Send, CheckCircle2, Clock, Globe, Sparkles, AlertCircle, Layers, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface SubmissionHistory {
  id: string;
  timestamp: string;
  count: number;
  status: 'success' | 'failed';
  sampleUrls: string[];
}

export function IndexingApiCard() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [history, setHistory] = useState<SubmissionHistory[]>([]);

  const handleSubmitBatch = async (batchSize = 100) => {
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/seo/indexing-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchSize }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback(`⚡ ${data.message} (대상 총 ${data.totalUrlsAvailable}개 중 ${data.batchSize}개 우선 통보)`);
        setHistory((prev) => [
          {
            id: `sub-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString('ko-KR', { hour12: false }),
            count: data.batchSize,
            status: 'success',
            sampleUrls: data.submittedUrls || [],
          },
          ...prev.slice(0, 4),
        ]);
      } else {
        setFeedback(`⚠️ ${data.message || '색인 요청 실패'}`);
      }
    } catch {
      setFeedback('색인 요청 통신 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const [isGscSubmitting, setIsGscSubmitting] = useState(false);
  const [gscConsoleUrl, setGscConsoleUrl] = useState<string | null>(null);

  const handleGscSitemapSubmit = async () => {
    setIsGscSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/seo/gsc-sitemap-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        setGscConsoleUrl(data.directConsoleUrl);
        setFeedback(`🌐 ${data.gscMessage} (Google/Bing Sitemap Ping 전송 완료)`);
        setHistory((prev) => [
          {
            id: `gsc-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString('ko-KR', { hour12: false }),
            count: 564,
            status: 'success',
            sampleUrls: [data.sitemapUrl],
          },
          ...prev.slice(0, 4),
        ]);
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          navigator.clipboard.writeText(data.sitemapUrl).catch(() => {});
        }
      } else {
        setFeedback(`⚠️ ${data.message || 'GSC 사이트맵 제출 실패'}`);
      }
    } catch {
      setFeedback('구글 서치 콘솔 등록 통신 중 오류가 발생했습니다.');
    } finally {
      setIsGscSubmitting(false);
    }
  };

  return (
    <Card className="border-border/80 shadow-sm bg-gradient-to-br from-card via-card to-emerald-950/10">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Zap className="size-3 text-emerald-400" /> Google Search Console & 빠른 색인 가속기
              </span>
              <span className="text-xs text-muted-foreground">580+개 롱테일 pSEO 즉시 색인 유도</span>
            </div>
            <CardTitle className="text-base font-bold text-foreground">
              신규 계산기 500+개 URL 및 사이트맵(sitemap.xml) 구글 서치 콘솔 1클릭 정식 등록
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground leading-relaxed">
              Googlebot 및 네이버 Yeti가 사이트맵 및 580개 이상의 주식/복리 계산기 페이지를 최우선 순위로 크롤링하도록 Google Search Console Sitemaps API 및 Ping을 동시 발송합니다.
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              size="sm"
              onClick={handleGscSitemapSubmit}
              disabled={isGscSubmitting}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
            >
              <Globe className="size-3.5" />
              {isGscSubmitting ? '구글 정식 제출 중...' : '🌐 구글 서치콘솔 사이트맵 등록'}
            </Button>
            <Button
              size="sm"
              onClick={() => handleSubmitBatch(100)}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer"
            >
              <Send className="size-3.5" />
              {isSubmitting ? '색인 알림 전송 중...' : '100개 배치 전송'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleSubmitBatch(200)}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 text-xs font-semibold border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 active:scale-95 cursor-pointer"
            >
              <Layers className="size-3.5" />
              200개 최대 배치
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {feedback && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
              <span>{feedback}</span>
            </div>
            {gscConsoleUrl && (
              <a
                href={gscConsoleUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold shadow transition-colors shrink-0"
              >
                <ExternalLink className="size-3" />
                구글 서치콘솔 공식 사이트맵 관리창 열기
              </a>
            )}
          </div>
        )}

        {/* 전송 통계 및 최근 제출 로그 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
            <span>최근 배치 전송 이력</span>
            <span>Google Indexing v3 규격 준수</span>
          </div>

          <div className="divide-y divide-border/40 rounded-xl border border-border/60 bg-surface/40 overflow-hidden">
            {history.map((h) => (
              <div key={h.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-2 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-muted-foreground">{h.timestamp}</span>
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-emerald-400" />
                    {h.count}개 URL 색인 요청 완료
                  </span>
                </div>
                <div className="font-mono text-[11px] text-muted-foreground truncate max-w-sm">
                  샘플: {h.sampleUrls[0] || '전체 사이트맵 연동'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
