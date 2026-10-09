'use client';

import React, { useState } from 'react';
import {
  Ticket,
  Flame,
  Trophy,
  Sparkles,
  ShieldCheck,
  Clock,
  Coins,
  Dice5,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/cn';

interface LotteryHistoryEntry {
  readonly round: number;
  readonly date: string;
  readonly winningNumbers: readonly number[];
  readonly bonusNumber: number;
  readonly jackpotWld: number;
  readonly burnedWld: number;
  readonly winnerCount: number;
}

const PAST_ROUNDS: readonly LotteryHistoryEntry[] = [
  {
    round: 41,
    date: '2026-10-04',
    winningNumbers: [5, 12, 18, 27, 34, 41],
    bonusNumber: 7,
    jackpotWld: 1180000,
    burnedWld: 590000,
    winnerCount: 0,
  },
  {
    round: 40,
    date: '2026-09-27',
    winningNumbers: [3, 9, 15, 22, 31, 39],
    bonusNumber: 14,
    jackpotWld: 850000,
    burnedWld: 425000,
    winnerCount: 1,
  },
];

export function MegaJackpotLotteryDashboard() {
  const currentRound = 42;
  const drawDate = '2026-10-11 24:00 (일)';
  const [jackpotPool, setJackpotPool] = useState<number>(1450000);
  const [cumulativeBurned, setCumulativeBurned] = useState<number>(725000);
  const [myTickets, setMyTickets] = useState<number>(2);
  const [isPurchasing, setIsPurchasing] = useState<boolean>(false);

  const handleBuyTickets = async (count: number) => {
    if (myTickets + count > 10) {
      toast.error('건전 이용을 위해 1인당 주간 최대 10장까지만 구매할 수 있습니다.');
      return;
    }

    setIsPurchasing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const cost = count * 100;
      const burnPortion = Math.round(cost * 0.5);

      setMyTickets((prev) => prev + count);
      setJackpotPool((prev) => prev + (cost - burnPortion));
      setCumulativeBurned((prev) => prev + burnPortion);

      toast.success(`메가 잭팟 복권 ${count}장(총 ${cost} WLD) 구매 완료!`, {
        description: `구매액의 50%인 ${burnPortion} WLD는 국고(VAULT_MAIN)로 귀속되어 영구 소각되었습니다.`,
      });
    } catch {
      toast.error('복권 구매 중 오류가 발생했습니다.');
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <Card className="rounded-2xl sm:rounded-3xl border border-zinc-800 bg-[#0A0D18] text-zinc-100 shadow-2xl overflow-hidden">
      {/* Header */}
      <CardHeader className="p-4 sm:p-6 border-b border-zinc-800/80 bg-zinc-950/70">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Ticket className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base sm:text-lg font-bold text-foreground">
                  국고 연동 메가 잭팟 복권 (Mega Jackpot Lottery)
                </CardTitle>
                <Badge className="bg-amber-500 text-zinc-950 font-black text-[10px]">
                  제 {currentRound}회 진행 중
                </Badge>
              </div>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                판매 대금의 정확히 50%가 국고로 즉시 영구 소각(Sink)되는 건전한 디플레이션 복권 시스템입니다.
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono">
            <Clock className="size-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">추첨 일시:</span>
            <span className="font-bold text-amber-400">{drawDate}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* Jackpot & Burn Overview Banner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Box 1: 1등 예상 잭팟 상금 */}
          <div className="relative overflow-hidden p-5 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-zinc-900/50 to-zinc-950 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Trophy className="size-4" /> 제 {currentRound}회 누적 잭팟 상금 (이월 합산)
              </span>
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px] font-mono">
                ROLLOVER
              </Badge>
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-black text-amber-300 tracking-tight">
              {jackpotPool.toLocaleString()} <span className="text-base font-sans font-bold">WLD</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              전 회차(41회) 1등 미배출로 상금 100%가 자동 이월되어 역대 최대 상금을 기록 중입니다.
            </p>
          </div>

          {/* Box 2: 국고 영구 소각 실적 */}
          <div className="relative overflow-hidden p-5 rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-500/10 via-zinc-900/50 to-zinc-950 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                <Flame className="size-4" /> 국고 영구 소각 완료액 (50% Sink)
              </span>
              <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30 text-[10px] font-mono">
                DEFLATIONARY
              </Badge>
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-black text-rose-300 tracking-tight">
              {cumulativeBurned.toLocaleString()} <span className="text-base font-sans font-bold">WLD</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              복권 판매 즉시 절반이 소각되어 머니버스 경제 내 통화 유통량을 줄이고 WLD 가치를 지킵니다.
            </p>
          </div>
        </div>

        {/* Purchase & Responsible Limit Section */}
        <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-950/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-amber-400" />
              <h4 className="text-xs sm:text-sm font-bold text-foreground">
                내 보유 복권: <span className="font-mono text-amber-400 font-black">{myTickets}장</span> / 최대 10장
              </h4>
              <Badge className="bg-zinc-800 text-zinc-400 text-[10px]">
                1장 = 100 WLD (50% 즉시 소각)
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              건전한 오락과 통화 수축을 위해 과열 베팅이 원천 제한됩니다. 일요일 자정 추첨 시 6개 번호 일치 시 1등 당첨!
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              disabled={myTickets >= 10 || isPurchasing}
              onClick={() => handleBuyTickets(1)}
              className="h-10 px-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold transition-all min-h-[40px]"
            >
              + 1장 구매 (100 WLD)
            </Button>
            <Button
              type="button"
              disabled={myTickets + 5 > 10 || isPurchasing}
              onClick={() => handleBuyTickets(5)}
              className="h-10 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black shadow-md transition-all min-h-[40px]"
            >
              + 5장 구매 (500 WLD)
            </Button>
          </div>
        </div>

        {/* Past Round Winning Records Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <span>📜</span> 최근 회차 추첨 및 소각 내역
            </h4>
            <span className="text-[11px] text-muted-foreground font-mono">HMAC-SHA256 암호학적 추첨 증명</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-800">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-800 bg-zinc-900/60 font-bold text-muted-foreground">
                <tr>
                  <th className="px-3 py-2.5 text-center">회차</th>
                  <th className="px-3 py-2.5">추첨일자</th>
                  <th className="px-3 py-2.5">당첨 번호</th>
                  <th className="px-3 py-2.5 text-right">총 상금</th>
                  <th className="px-3 py-2.5 text-right">국고 영구 소각</th>
                  <th className="px-3 py-2.5 text-center">1등 배출</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono">
                {PAST_ROUNDS.map((r) => (
                  <tr key={r.round} className="hover:bg-zinc-900/30 transition-colors">
                    <td className="px-3 py-2.5 text-center font-bold text-amber-400">제 {r.round}회</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{r.date}</td>
                    <td className="px-3 py-2.5 font-sans">
                      <div className="flex items-center gap-1">
                        {r.winningNumbers.map((num) => (
                          <span
                            key={num}
                            className="size-5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-[10px] font-mono font-bold"
                          >
                            {num}
                          </span>
                        ))}
                        <span className="text-muted-foreground px-0.5">+</span>
                        <span className="size-5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center text-[10px] font-mono font-bold">
                          {r.bonusNumber}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-right font-bold text-foreground">
                      {r.jackpotWld.toLocaleString()} WLD
                    </td>
                    <td className="px-3 py-2.5 text-right font-bold text-rose-400">
                      -{r.burnedWld.toLocaleString()} WLD
                    </td>
                    <td className="px-3 py-2.5 text-center font-sans">
                      {r.winnerCount > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                          {r.winnerCount}명 당첨
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 text-[10px]">
                          미배출 (다음 회차 이월)
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 sm:p-5 border-t border-zinc-800/80 bg-zinc-950/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <ShieldCheck className="size-4 text-emerald-400" />
          <span>
            <b>투명한 공공 기금:</b> 본 복권은 사행성 조장을 배제하며, 모든 참여 포인트는 국고 소각과 커뮤니티 상금으로 100% 재순환됩니다.
          </span>
        </div>
        <Badge variant="outline" className="text-[10px] text-zinc-400 font-mono">
          SHA256-SEED: 0x9a8f...4e1b
        </Badge>
      </CardFooter>
    </Card>
  );
}
