'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flame, Sparkles, Trophy, ShieldAlert, Coins, Landmark, ArrowRight, CheckCircle2, RotateCw } from 'lucide-react';
import { groupDigits } from '@/lib/money';

interface WinnerLog {
  displayName: string;
  rewardTitle: string;
  burnAmount: number;
  createdAt: string;
}

interface EventStats {
  totalBurnedWld: string;
  totalParticipants: number;
  recentWinners: WinnerLog[];
}

export function AntiInflationBurnEventCard() {
  const [stats, setStats] = useState<EventStats>({
    totalBurnedWld: '0',
    totalParticipants: 0,
    recentWinners: [],
  });
  const [loading, setLoading] = useState(false);
  const [burning, setBurning] = useState(false);
  const [resultMsg, setResultMsg] = useState<{ title: string; text: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/events/burn-draw');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleBurnDraw = async () => {
    if (burning) return;
    setBurning(true);
    setErrorMsg(null);
    setResultMsg(null);

    try {
      const res = await fetch('/api/events/burn-draw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ burnAmount: 10000 }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || '소각 드로우 참여에 실패했습니다.');
        setBurning(false);
        return;
      }

      setResultMsg({
        title: data.awardedTitle || '국고 수호자',
        text: data.message || '10,000 WLD가 영구 소각되어 통화 가치를 지켰습니다!',
      });
      fetchStats();
    } catch (err: any) {
      setErrorMsg(err?.message || '네트워크 오류가 발생했습니다.');
    } finally {
      setBurning(false);
    }
  };

  return (
    <Card className="rounded-3xl border border-rose-500/30 bg-gradient-to-br from-rose-950/20 via-background to-amber-950/20 shadow-xl overflow-hidden backdrop-blur-md relative">
      {/* 백그라운드 앰비언트 글로우 */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <CardHeader className="pb-4 border-b border-border/40 relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 text-white shadow-lg shadow-rose-500/20">
              <Flame className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg sm:text-xl font-black tracking-tight text-foreground flex items-center gap-1.5">
                  인플레이션 타파 WLD 소각 페스티벌 & 칭호 드로우
                </CardTitle>
                <Badge className="bg-rose-500 text-white font-bold text-[10px] animate-pulse">
                  HOT EVENT
                </Badge>
              </div>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                과잉 통화량을 회수하여 화폐 가치를 지키고 한정판 국고 수호자 칭호를 획득하세요!
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-amber-500/40 text-amber-400 bg-amber-500/10 text-xs px-3 py-1 font-mono font-bold">
              누적 소각: {groupDigits(stats.totalBurnedWld)} WLD
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-5 pb-6 relative z-10 space-y-5">
        {/* 3대 이벤트 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* 이벤트 1: 10,000 WLD 럭키 드로우 */}
          <div className="p-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5" /> 1회 10,000 WLD 소각
                </span>
                <Badge variant="secondary" className="text-[10px]">즉시 소각</Badge>
              </div>
              <h4 className="text-sm font-bold text-foreground mt-1">골든 소각 드로우</h4>
              <p className="text-xs text-muted-foreground mt-1">
                10,000 WLD를 영구 소각하고 5대 한정판 명예 칭호(인플레이션 헌터 등)를 무작위 수여받습니다.
              </p>
            </div>

            <Button
              onClick={handleBurnDraw}
              disabled={burning}
              className="w-full h-10 font-bold rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white shadow-md shadow-rose-500/20"
            >
              {burning ? (
                <>
                  <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                  소각 및 칭호 추첨 중...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2 fill-white" />
                  10,000 WLD 소각 드로우 참여
                </>
              )}
            </Button>
          </div>

          {/* 이벤트 2: 7일 락업 국고 방위 특별 국채 */}
          <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                  <Landmark className="h-3.5 w-3.5" /> 7일 락업 특별 국채
                </span>
                <Badge className="bg-amber-500 text-zinc-950 font-bold text-[10px]">연 12.0%</Badge>
              </div>
              <h4 className="text-sm font-bold text-foreground mt-1">국고 방위 특별 국채 청약</h4>
              <p className="text-xs text-muted-foreground mt-1">
                넘쳐나는 WLD를 7일간 락업하여 시장 인플레이션을 억제하고 확정 쿠폰 이자를 수령하세요.
              </p>
            </div>

            <Button asChild variant="outline" className="w-full h-10 font-bold rounded-xl border-amber-500/40 text-amber-400 hover:bg-amber-500/10">
              <Link href="/bonds" className="flex items-center justify-center gap-1.5">
                국채 청약하러 가기 <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>

          {/* 이벤트 3: 국고 사회 환원 명예의 전당 */}
          <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <Trophy className="h-3.5 w-3.5" /> 박애주의 훈장
                </span>
                <Badge variant="secondary" className="text-[10px]">명예 등재</Badge>
              </div>
              <h4 className="text-sm font-bold text-foreground mt-1">국고 사회 환원 명예의 전당</h4>
              <p className="text-xs text-muted-foreground mt-1">
                초고액 자산가 전용 자발적 국고 환원! 기부 시 '머니버스 박애주의자' 한정판 프로필 훈장이 지급됩니다.
              </p>
            </div>

            <Button asChild variant="outline" className="w-full h-10 font-bold rounded-xl border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10">
              <Link href="/wallet" className="flex items-center justify-center gap-1.5">
                지갑에서 기부 참여 <Coins className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>

        {/* 당첨 결과 알림 */}
        {resultMsg && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-amber-500/20 border border-amber-500/40 text-center animate-in fade-in zoom-in-95">
            <p className="text-base font-extrabold text-amber-400 flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-400 animate-spin" />
              칭호 획득: [{resultMsg.title}]
            </p>
            <p className="text-xs text-muted-foreground mt-1">{resultMsg.text}</p>
          </div>
        )}

        {errorMsg && (
          <p className="text-xs text-destructive text-center font-medium">{errorMsg}</p>
        )}

        {/* 최근 명예 소각자 롤링 칩 */}
        {stats.recentWinners.length > 0 && (
          <div className="pt-2 border-t border-border/40 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-muted-foreground font-semibold flex items-center gap-1 shrink-0">
              <Flame className="h-3.5 w-3.5 text-rose-500" /> 최근 명예 소각자:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {stats.recentWinners.slice(0, 5).map((w, idx) => (
                <Badge key={idx} variant="outline" className="text-[11px] font-mono border-rose-500/30 bg-rose-500/5 text-rose-300">
                  {w.displayName} ({groupDigits(w.burnAmount)} WLD 소각 ➡️ {w.rewardTitle})
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
