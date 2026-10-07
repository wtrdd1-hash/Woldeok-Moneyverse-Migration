'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, CheckCircle2, AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export function TwitterPublisherCard() {
  const [status, setStatus] = useState<{ configured: boolean; hasApiKey: boolean; hasAccessToken: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [tweetText, setTweetText] = useState('');
  const [lastResult, setLastResult] = useState<string | null>(null);

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/seo/twitter');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSendTweet = async () => {
    setIsSending(true);
    setLastResult(null);
    try {
      const res = await fetch('/api/admin/seo/twitter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: tweetText.trim() || undefined }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`트윗이 성공적으로 발행되었습니다! (ID: ${data.tweetId || '발행완료'})`);
        setLastResult(`✓ 트윗 발행 성공 [ID: ${data.tweetId}]`);
        setTweetText('');
      } else {
        toast.error(`트윗 발행 실패: ${data.error || '알 수 없는 오류'}`);
        setLastResult(`✗ 실패: ${data.error}`);
      }
    } catch {
      toast.error('트윗 발행 요청 중 네트워크 오류가 발생했습니다.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-bold px-2 py-1">
              𝕏 X (Twitter)
            </span>
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                X(트위터) 자동 백링크 봇 & 발행 관제
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                매일 오전 09:00 정기 경제 시황 요약 및 계산기 백링크 자동 포스팅 (Free 티어 월 1,500회)
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {status?.configured ? (
              <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 gap-1 text-[11px]">
                <CheckCircle2 className="size-3" />
                API 연동 정상
              </Badge>
            ) : (
              <Badge variant="outline" className="text-amber-400 border-amber-500/40 gap-1 text-[11px]">
                <AlertTriangle className="size-3" />
                환경변수 대기 중
              </Badge>
            )}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={fetchStatus}
              disabled={isLoading}
              className="h-8 px-2 text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
            <span className="text-muted-foreground text-[11px] block">X Developer API 키</span>
            <span className="font-mono font-bold text-foreground mt-0.5 block">
              {status?.hasApiKey ? '✓ 설정 완료' : '미등록 (TWITTER_API_KEY)'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
            <span className="text-muted-foreground text-[11px] block">OAuth 1.0a 토큰</span>
            <span className="font-mono font-bold text-foreground mt-0.5 block">
              {status?.hasAccessToken ? '✓ 설정 완료' : '미등록 (ACCESS_TOKEN)'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
            <span className="text-muted-foreground text-[11px] block">자동 발행 정책</span>
            <span className="font-bold text-emerald-500 mt-0.5 block">
              매일 09:00 KST 정기 다이제스트
            </span>
          </div>
        </div>

        {/* 수동 테스트 트윗 전송 폼 */}
        <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-border/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <label htmlFor="tweet-text" className="text-xs font-bold text-foreground">수동 백링크 트윗 즉시 발행 테스트</label>
            <span className="text-[11px] text-muted-foreground font-mono">
              {tweetText.length}/280자
            </span>
          </div>

          <div className="flex gap-2">
            <Input
              id="tweet-text"
              placeholder="비워둘 경우 기본 경제 시황 및 계산기 허브 링크 트윗이 발행됩니다."
              value={tweetText}
              onChange={(e) => setTweetText(e.target.value)}
              maxLength={280}
              className="text-xs bg-zinc-900 border-zinc-700 h-9"
            />
            <Button
              type="button"
              size="sm"
              onClick={handleSendTweet}
              disabled={isSending}
              className="h-9 px-4 shrink-0 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs gap-1.5"
            >
              <Send className={`size-3.5 ${isSending ? 'animate-pulse' : ''}`} />
              {isSending ? '발행 중...' : '트윗 발행'}
            </Button>
          </div>

          {lastResult && (
            <p className={`text-[11px] font-mono mt-1 ${lastResult.startsWith('✓') ? 'text-emerald-400' : 'text-rose-400'}`}>
              {lastResult}
            </p>
          )}

          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
            <span>※ X 개발자 포털의 Free 플랜 API 키를 환경변수에 등록하시면 자동으로 연동됩니다.</span>
            <a
              href="https://developer.x.com/en/portal/dashboard"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sky-400 hover:underline"
            >
              X Developer Portal
              <ExternalLink className="size-3" />
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
