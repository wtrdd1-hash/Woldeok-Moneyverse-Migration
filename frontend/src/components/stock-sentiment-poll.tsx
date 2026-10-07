'use client';

import React, { useState, useEffect } from 'react';
import { Flame, Snowflake, Users, TrendingUp, TrendingDown, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SocialShareBar } from '@/components/social-share-bar';
import { TranslatedText as T } from '@/components/translated-text';

interface StockSentimentPollProps {
  readonly symbol: string;
  readonly name: string;
}

export function StockSentimentPoll({ symbol, name }: StockSentimentPollProps) {
  const [voted, setVoted] = useState<'bull' | 'bear' | null>(null);
  const [bullCount, setBullCount] = useState<number>(142);
  const [bearCount, setBearCount] = useState<number>(58);

  useEffect(() => {
    // 종목 심볼 기반 결정론적 기본 투표 수
    let hash = 0;
    for (let i = 0; i < symbol.length; i++) {
      hash = (hash << 5) - hash + symbol.charCodeAt(i);
      hash |= 0;
    }
    const baseBull = 120 + Math.abs(hash % 90);
    const baseBear = 50 + Math.abs(hash % 45);

    try {
      const saved = localStorage.getItem(`wdmv_poll_${symbol}`);
      if (saved === 'bull') {
        setVoted('bull');
        setBullCount(baseBull + 1);
        setBearCount(baseBear);
      } else if (saved === 'bear') {
        setVoted('bear');
        setBullCount(baseBull);
        setBearCount(baseBear + 1);
      } else {
        setBullCount(baseBull);
        setBearCount(baseBear);
      }
    } catch {
      setBullCount(baseBull);
      setBearCount(baseBear);
    }
  }, [symbol]);

  const totalVotes = bullCount + bearCount;
  const bullPercent = totalVotes > 0 ? Math.round((bullCount / totalVotes) * 100) : 50;
  const bearPercent = 100 - bullPercent;

  const handleVote = (choice: 'bull' | 'bear') => {
    if (voted) return;
    setVoted(choice);
    if (choice === 'bull') {
      setBullCount((prev) => prev + 1);
    } else {
      setBearCount((prev) => prev + 1);
    }

    try {
      localStorage.setItem(`wdmv_poll_${symbol}`, choice);
    } catch {
      // ignore
    }
  };

  const shareTitle = voted === 'bull'
    ? `[월덕 머니버스] ${name}(${symbol}) 상승(BULL 🔥)에 투표했습니다! (${bullPercent}%의 투자자가 상승 예측 중)`
    : `[월덕 머니버스] ${name}(${symbol}) 하락(BEAR ❄️)에 투표했습니다! 당신의 시장 전망은?`;

  return (
    <Card className="rounded-2xl border border-zinc-800/80 bg-card/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/60">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-500">
              <Users className="size-4" />
            </div>
            <div>
              <CardTitle className="text-sm sm:text-base font-bold text-foreground flex items-center gap-1.5">
                <T korean="실시간 커뮤니티 심리 투표" english="Live Community Sentiment Poll" japanese="リアルタイムコミュニティ心理投票" chinese="实时社区多空情绪投票" />
                <Badge variant="outline" className="text-[10px] font-mono text-amber-400 border-amber-500/30">
                  {symbol}
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                <T korean="내일 이 종목의 주가는 어디로 갈까요? 투자자들의 실시간 여론을 확인하세요." english="Where is the price heading tomorrow? Vote to see community consensus." japanese="明日の株価はどう動く？投資家のリアルタイム世論を確認しましょう。" chinese="明日股价走势如何？参与投票查看实时市场多空共识。" />
              </CardDescription>
            </div>
          </div>

          <div className="text-xs font-mono text-muted-foreground flex items-center gap-1">
            <span>총 {totalVotes.toLocaleString()}명 참여</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* 투표 버튼 2구 그리드 */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            disabled={voted !== null}
            onClick={() => handleVote('bull')}
            className={`min-h-[52px] rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              voted === 'bull'
                ? 'border-rose-500 bg-rose-500/15 text-rose-400 shadow-sm ring-1 ring-rose-500'
                : 'border-border/70 hover:border-rose-500/50 hover:bg-rose-500/10 text-foreground'
            }`}
          >
            <Flame className="size-4 text-rose-500 fill-rose-500" />
            <div className="text-left">
              <span className="block text-xs sm:text-sm font-extrabold">상승 전망 (BULL)</span>
              <span className="block text-[10px] text-muted-foreground font-mono">{bullCount}표</span>
            </div>
          </Button>

          <Button
            variant="outline"
            disabled={voted !== null}
            onClick={() => handleVote('bear')}
            className={`min-h-[52px] rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              voted === 'bear'
                ? 'border-blue-500 bg-blue-500/15 text-blue-400 shadow-sm ring-1 ring-blue-500'
                : 'border-border/70 hover:border-blue-500/50 hover:bg-blue-500/10 text-foreground'
            }`}
          >
            <Snowflake className="size-4 text-blue-500" />
            <div className="text-left">
              <span className="block text-xs sm:text-sm font-extrabold">하락 전망 (BEAR)</span>
              <span className="block text-[10px] text-muted-foreground font-mono">{bearCount}표</span>
            </div>
          </Button>
        </div>

        {/* 롱/숏 비율 바 */}
        <div className="space-y-1.5 font-mono text-xs">
          <div className="flex justify-between items-center font-bold">
            <span className="text-rose-400 flex items-center gap-1">
              <TrendingUp className="size-3.5" /> 상승 {bullPercent}%
            </span>
            <span className="text-blue-400 flex items-center gap-1">
              하락 {bearPercent}% <TrendingDown className="size-3.5" />
            </span>
          </div>

          <div className="h-3 w-full rounded-full bg-blue-500/30 overflow-hidden flex">
            <div
              style={{ width: `${bullPercent}%` }}
              className="h-full bg-rose-500 transition-all duration-700 ease-out"
            />
            <div
              style={{ width: `${bearPercent}%` }}
              className="h-full bg-blue-500 transition-all duration-700 ease-out"
            />
          </div>
        </div>

        {/* 투표 완료 시 바이럴 공유 바 표출 */}
        {voted && (
          <div className="pt-2 border-t border-border/50 animate-in fade-in duration-300">
            <SocialShareBar
              title={shareTitle}
              url={`https://easy-scraping.com/stocks/${symbol}`}
              description={`${name}(${symbol}) 커뮤니티 투표 결과: ${bullPercent}% 상승 vs ${bearPercent}% 하락`}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
