'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, TrendingUp, Sparkles, Users, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SocialShareBar } from '@/components/social-share-bar';
import { TranslatedText as T } from '@/components/translated-text';

interface LeaderboardUser {
  readonly rank: number;
  readonly username: string;
  readonly title: string;
  readonly returnRate: number;
  readonly mainStock: string;
  readonly totalYieldAmount: string;
}

const FALLBACK_TRADERS: readonly LeaderboardUser[] = [
  {
    rank: 1,
    username: '여의도고래',
    title: '월가의 전설',
    returnRate: 142.8,
    mainStock: 'WDG',
    totalYieldAmount: '+14,280,000 WLD',
  },
  {
    rank: 2,
    username: '판교슈퍼개미',
    title: '성장주 사냥꾼',
    returnRate: 98.4,
    mainStock: 'WDT',
    totalYieldAmount: '+9,840,000 WLD',
  },
  {
    rank: 3,
    username: '치무사랑',
    title: '로봇 메타버스 거장',
    returnRate: 74.1,
    mainStock: 'CHIMU',
    totalYieldAmount: '+7,410,000 WLD',
  },
  {
    rank: 4,
    username: '신화의주인',
    title: '바이오 스윙 달인',
    returnRate: 52.6,
    mainStock: 'SHIN',
    totalYieldAmount: '+5,260,000 WLD',
  },
  {
    rank: 5,
    username: '복리의마술사',
    title: '안정 분산 투자자',
    returnRate: 41.3,
    mainStock: 'DUCK',
    totalYieldAmount: '+4,130,000 WLD',
  },
];

export function StockSeasonLeaderboard() {
  const [activeTab, setActiveTab] = useState<'weekly' | 'season'>('weekly');
  const [traders, setTraders] = useState<readonly LeaderboardUser[]>(FALLBACK_TRADERS);
  const [seasonTitle, setSeasonTitle] = useState('SEASON 2026');
  const [prizePool, setPrizePool] = useState('1,000만 WLD');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchLeague() {
      try {
        setLoading(true);
        const res = await fetch('/api/stocks/league');
        if (!res.ok) return;
        const data = await res.json();
        if (!isMounted) return;

        if (data?.season) {
          setSeasonTitle(data.season.title ?? 'SEASON 2026');
          if (data.season.prize_pool) {
            setPrizePool(`${Number(data.season.prize_pool).toLocaleString('ko-KR')} WLD`);
          }
        }

        if (Array.isArray(data?.leaderboard) && data.leaderboard.length > 0) {
          const mapped: LeaderboardUser[] = data.leaderboard.map((item: any, idx: number) => ({
            rank: idx + 1,
            username: item.username ?? item.nickname ?? `트레이더 #${idx + 1}`,
            title: item.title ?? (idx === 0 ? '수익률 1위' : idx < 3 ? '톱 티어 트레이더' : '챌린저'),
            returnRate: Number(item.return_rate ?? item.yield_pct ?? 0),
            mainStock: item.favorite_stock_symbol ?? 'WDG',
            totalYieldAmount: `${item.profit_amount ? (Number(item.profit_amount) > 0 ? '+' : '') + Number(item.profit_amount).toLocaleString('ko-KR') : '+0'} WLD`,
          }));
          setTraders(mapped);
        }
      } catch {
        // Fallback to initial display
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchLeague();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Card className="rounded-2xl sm:rounded-3xl border border-zinc-800/80 bg-card/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Trophy className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base sm:text-lg font-bold text-foreground">
                  <T korean="가상 주식 시즌 투자 리더보드" english="Stock League Season Leaderboard" japanese="仮想株式シーズン投資リーダーボード" chinese="虚拟股票赛季投资排行榜" />
                </CardTitle>
                <Badge className="bg-amber-500 text-black text-[10px] font-black tracking-wider">
                  {seasonTitle}
                </Badge>
              </div>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                <T
                  korean={`매주 일요일 자정 정산! 상위 랭커에게 총 ${prizePool} 상금 풀 균등 배당`}
                  english={`Weekly reset every Sunday! ${prizePool} dividend prize pool for top traders.`}
                  japanese={`毎週日曜深夜リセット！上位ランカーに総額${prizePool}賞金を配当`}
                  chinese={`每周日午夜结算！前排交易员平分${prizePool}奖金池。`}
                />
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/50 border border-border/60">
            <Button
              variant={activeTab === 'weekly' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('weekly')}
              className="text-xs h-7 px-3 rounded-lg font-bold"
            >
              <T korean="주간 랭킹" english="Weekly" japanese="週間" chinese="周榜" />
            </Button>
            <Button
              variant={activeTab === 'season' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('season')}
              className="text-xs h-7 px-3 rounded-lg font-bold"
            >
              <T korean="시즌 누적" english="Season" japanese="シーズン" chinese="赛季总榜" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* 상위 3인 포디엄 요약 배너 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {traders.slice(0, 3).map((trader) => {
            const isFirst = trader.rank === 1;
            const isSecond = trader.rank === 2;
            const badgeBg = isFirst
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              : isSecond
              ? 'bg-zinc-400/10 border-zinc-400/30 text-zinc-300'
              : 'bg-amber-700/10 border-amber-700/30 text-amber-600';

            return (
              <div
                key={trader.rank}
                className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${badgeBg} hover:scale-[1.01]`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-border/40">
                  <div className="flex items-center gap-1.5">
                    {isFirst && <span className="text-base">👑</span>}
                    {isSecond && <span className="text-base">🥈</span>}
                    {!isFirst && !isSecond && <span className="text-base">🥉</span>}
                    <span className="font-extrabold text-xs">{trader.rank}위</span>
                  </div>
                  <Badge variant="outline" className="text-[9px] font-bold">
                    {trader.title}
                  </Badge>
                </div>
                <div className="pt-2">
                  <span className="block text-sm font-extrabold text-foreground truncate">
                    {trader.username}
                  </span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-[11px] text-muted-foreground">주력: {trader.mainStock}</span>
                    <span className="font-mono font-black text-sm text-emerald-400">
                      +{trader.returnRate}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 랭킹 테이블 리스트 */}
        <div className="rounded-xl border border-border/60 overflow-hidden divide-y divide-border/40">
          {traders.map((trader) => (
            <div
              key={trader.rank}
              className="p-3 sm:px-4 flex items-center justify-between hover:bg-muted/20 transition-colors gap-2"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-mono font-black text-xs sm:text-sm text-muted-foreground w-6 text-center shrink-0">
                  #{trader.rank}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-sm font-bold text-foreground truncate">
                      {trader.username}
                    </span>
                    <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 rounded bg-muted">
                      {trader.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground block truncate">
                    주력 포트폴리오: {trader.mainStock} · {trader.totalYieldAmount}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="font-mono font-black text-xs sm:text-sm text-emerald-400 flex items-center justify-end gap-1">
                  <TrendingUp className="size-3.5" />
                  <span>+{trader.returnRate}%</span>
                </div>
                <span className="text-[10px] text-muted-foreground font-mono">
                  실현 수익
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* 하단 바이럴 공유 바 */}
        <div className="pt-2 border-t border-border/50">
          <SocialShareBar
            title={`[월덕 머니버스] 가상 주식 시즌 리그 랭킹전 진행 중! ${prizePool} 상금 풀에 도전하세요.`}
            url="https://easy-scraping.com/stocks"
            description="실시간 호가 거래소와 가상 주식 모의투자 대회에서 당신의 투자 실력을 증명하세요."
          />
        </div>
      </CardContent>
    </Card>
  );
}
