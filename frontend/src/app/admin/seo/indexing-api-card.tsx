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
  provider: 'IndexNow' | 'Google Search Console';
  sampleUrls: string[];
}

export function IndexingApiCard() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackStatus, setFeedbackStatus] = useState<'success' | 'error' | null>(null);
  const [history, setHistory] = useState<SubmissionHistory[]>([]);

  const handleSubmitBatch = async (batchSize = 100) => {
    setIsSubmitting(true);
    setFeedback(null);
    setFeedbackStatus(null);
    setGscConsoleUrl(null);
    try {
      const res = await fetch('/api/admin/seo/indexing-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchSize }),
      });
      const data = await res.json();
      if (res.ok && data.success === true && data.indexingConfirmed === false && Number.isInteger(data.submittedCount)) {
        setFeedbackStatus('success');
        setFeedback(`IndexNow ${data.submittedCount}개 URL 변경 통보 접수 · 실제 검색엔진 색인 미확인`);
        setHistory((prev) => [
          {
            id: `sub-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString('ko-KR', { hour12: false }),
            count: data.submittedCount,
            status: 'success',
            provider: 'IndexNow',
            sampleUrls: data.submittedUrls || [],
          },
          ...prev.slice(0, 4),
        ]);
      } else {
        setFeedbackStatus('error');
        setFeedback(`⚠️ ${data.message || '변경 통보 접수 실패'}`);
      }
    } catch {
      setFeedbackStatus('error');
      setFeedback('변경 통보 요청 중 통신 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const [isGscSubmitting, setIsGscSubmitting] = useState(false);
  const [gscConsoleUrl, setGscConsoleUrl] = useState<string | null>(null);
  const [selectedSitemap, setSelectedSitemap] = useState('sitemap.xml');

  const SITEMAP_OPTIONS = [
    { value: 'sitemap.xml', label: '통합 사이트맵 (sitemap.xml)' },
    { value: 'sitemap-stocks.xml', label: '주식 사이트맵 (sitemap-stocks.xml)' },
    { value: 'sitemap-static.xml', label: '금융도구·가이드 (sitemap-static.xml)' },
    { value: 'sitemap-board.xml', label: '커뮤니티 게시판 (sitemap-board.xml)' },
    { value: 'sitemap-announcements.xml', label: '공지사항 (sitemap-announcements.xml)' },
  ];

  const handleGscSitemapSubmit = async (sitemapPath = selectedSitemap) => {
    setIsGscSubmitting(true);
    setFeedback(null);
    setFeedbackStatus(null);
    setGscConsoleUrl(null);
    try {
      const fullUrl = `https://easy-scraping.com/${sitemapPath}`;
      const res = await fetch('/api/admin/seo/gsc-sitemap-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sitemapUrl: fullUrl }),
      });
      const data = await res.json();
      if (res.ok && data.success === true && data.isGscSubmitted === true) {
        setFeedbackStatus('success');
        setGscConsoleUrl(typeof data.directConsoleUrl === 'string' ? data.directConsoleUrl : null);
        setFeedback(`🌐 [${sitemapPath}] ${data.gscMessage} (GSC 제출 접수·실제 색인 미확인)`);
        setHistory((prev) => [
          {
            id: `gsc-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString('ko-KR', { hour12: false }),
            count: 1, // one sitemap; not a fabricated 564 URL indexing count
            status: 'success',
            provider: 'Google Search Console',
            sampleUrls: [data.sitemapUrl],
          },
          ...prev.slice(0, 4),
        ]);
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          navigator.clipboard.writeText(data.sitemapUrl).catch(() => {});
        }
      } else {
        setFeedbackStatus('error');
        setFeedback(`⚠️ ${data.message || 'GSC 사이트맵 제출 실패'}`);
      }
    } catch {
      setFeedbackStatus('error');
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
                <Zap className="size-3 text-emerald-400" /> 검색엔진 URL 변경 통보 및 GSC 사이트맵 제출
              </span>
              <span className="text-xs text-muted-foreground">제출 상태와 실제 검색 색인은 별개</span>
            </div>
            <CardTitle className="text-base font-bold text-foreground">
              IndexNow URL 변경 알림 및 Google Search Console 사이트맵 제출
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground leading-relaxed">
              인증된 관리자만 공식 Search Console API에 사이트맵을 제출할 수 있습니다. 제출은 크롤링 또는 실제 검색 색인을 보장하지 않습니다.
            </CardDescription>

            {/* 개별 사이트맵 셀렉터 & 네이버 바로가기 */}
            <div className="flex flex-wrap items-center gap-2 pt-1.5">
              <span className="text-xs text-slate-400 font-semibold">제출 대상:</span>
              <select
                value={selectedSitemap}
                onChange={(e) => setSelectedSitemap(e.target.value)}
                className="min-h-11 bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1 outline-none focus:border-blue-500"
              >
                {SITEMAP_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <a
                href="https://searchadvisor.naver.com/console/board"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/30 transition-colors"
              >
                <span>네이버 서치어드바이저 바로가기</span>
                <ExternalLink className="size-3" />
              </a>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              size="sm"
              onClick={() => handleGscSitemapSubmit(selectedSitemap)}
              disabled={isGscSubmitting}
              className="min-h-11 flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
            >
              <Globe className="size-3.5" />
              {isGscSubmitting ? '구글 정식 제출 중...' : '🌐 선택 사이트맵 구글 등록'}
            </Button>
            <Button
              size="sm"
              onClick={() => handleSubmitBatch(100)}
              disabled={isSubmitting}
              className="min-h-11 flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer"
            >
              <Send className="size-3.5" />
              {isSubmitting ? '색인 알림 전송 중...' : '100개 배치 전송'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleSubmitBatch(200)}
              disabled={isSubmitting}
              className="min-h-11 flex items-center gap-1.5 text-xs font-semibold border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 active:scale-95 cursor-pointer"
            >
              <Layers className="size-3.5" />
              200개 최대 배치
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {feedback && (
          <div role={feedbackStatus === 'error' ? 'alert' : 'status'} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border text-xs font-semibold ${feedbackStatus === 'error' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>
            <div className="flex items-center gap-2">
              {feedbackStatus === 'error' ? <AlertCircle className="size-4 shrink-0" /> : <CheckCircle2 className="size-4 shrink-0" />}
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
            <span>현재 화면에서 접수 확인된 제출 이력 (새로고침 시 초기화)</span>
            <span>제출은 실제 색인 완료를 의미하지 않음</span>
          </div>

          <div className="divide-y divide-border/40 rounded-xl border border-border/60 bg-surface/40 overflow-hidden">
            {history.map((h) => (
              <div key={h.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-2 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-muted-foreground">{h.timestamp}</span>
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-emerald-400" />
                    {h.provider === 'IndexNow' ? `${h.count}개 URL 변경 통보 접수` : 'GSC 사이트맵 1개 제출 접수'}
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
