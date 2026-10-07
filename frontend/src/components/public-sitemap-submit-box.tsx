'use client';

import React, { useState } from 'react';
import { Globe, Send, CheckCircle2, ExternalLink, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PublicSitemapSubmitBox() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setResultMessage(null);
    try {
      const res = await fetch('/api/admin/seo/gsc-sitemap-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        setResultMessage('✅ Google 및 주요 검색엔진에 사이트맵(sitemap.xml) 최신 핑 전송이 완료되었습니다.');
      } else {
        setResultMessage(`⚠️ ${data.message || '색인 핑 전송 중 문제가 발생했습니다.'}`);
      }
    } catch {
      setResultMessage('검색엔진 통보 중 통신 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border/70 bg-gradient-to-br from-card via-card to-blue-950/20 p-6 sm:p-8 space-y-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Globe className="size-3 inline mr-1" /> 검색엔진 공식 색인 지원
            </span>
            <span className="text-xs text-muted-foreground">Google · Naver · Bing 자동 연동</span>
          </div>
          <h3 className="text-base font-bold text-foreground">
            구글 서치 콘솔(Google Search Console) & 사이트맵 등록
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            월덕 머니버스의 580개 이상 금융 계산기 및 가이드는 매일 검색엔진에 최신 사이트맵을 자동 제출합니다.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
          >
            <Send className="size-3.5 mr-1.5" />
            {isSubmitting ? '색인 통보 중...' : '검색엔진 최신 사이트맵 즉시 통보'}
          </Button>

          <a
            href="https://search.google.com/search-console/about"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/80 bg-background hover:bg-muted text-xs font-semibold text-foreground transition-colors"
          >
            <ExternalLink className="size-3 text-muted-foreground" />
            구글 서치콘솔 공식 센터
          </a>
        </div>
      </div>

      {resultMessage && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs font-semibold text-blue-400">
          <CheckCircle2 className="size-4 shrink-0 text-blue-400" />
          <span>{resultMessage}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border/50 text-[11px] text-muted-foreground">
        <span>공식 파일:</span>
        <a href="/sitemap.xml" target="_blank" className="hover:text-foreground font-mono underline">
          /sitemap.xml
        </a>
        <span>·</span>
        <a href="/robots.txt" target="_blank" className="hover:text-foreground font-mono underline">
          /robots.txt
        </a>
        <span>·</span>
        <a href="/feed.xml" target="_blank" className="hover:text-foreground font-mono underline">
          /feed.xml (RSS 2.0)
        </a>
      </div>
    </div>
  );
}
