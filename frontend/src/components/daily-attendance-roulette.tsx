'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flame, Gift, Sparkles, CheckCircle2, RotateCw } from 'lucide-react';

interface AttendanceStatus {
  signedIn: boolean;
  checkedInToday: boolean;
  streakDays: number;
  lastAttendedDate: string | null;
  nextRewardPreview: number;
  isJackpotEligible: boolean;
}

const ROULETTE_SEGMENTS = [
  { label: '10 WLD', value: 10, color: '#3b82f6' },
  { label: '20 WLD', value: 20, color: '#10b981' },
  { label: '30 WLD', value: 30, color: '#8b5cf6' },
  { label: '50 WLD', value: 50, color: '#f59e0b' },
  { label: '70 WLD', value: 70, color: '#ec4899' },
  { label: '100 WLD', value: 100, color: '#06b6d4' },
  { label: '500 WLD', value: 500, color: '#ef4444' },
  { label: 'JACKPOT', value: 1000, color: '#eab308' },
];

export function DailyAttendanceRoulette() {
  const [status, setStatus] = useState<AttendanceStatus>({
    signedIn: false,
    checkedInToday: false,
    streakDays: 0,
    lastAttendedDate: null,
    nextRewardPreview: 10,
    isJackpotEligible: false,
  });
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winResult, setWinResult] = useState<{ amount: number; isJackpot: boolean } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/attendance/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSpin = async () => {
    if (spinning || status.checkedInToday || !status.signedIn) return;
    setSpinning(true);
    setErrorMsg(null);
    setWinResult(null);

    try {
      const res = await fetch('/api/attendance/spin', { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || '룰렛 참여에 실패했습니다.');
        setSpinning(false);
        return;
      }

      // 회전 각도 계산: 최소 5바퀴(1800도) + 당첨 세그먼트 위치
      const reward = data.rewardAmount || 50;
      let targetIndex = ROULETTE_SEGMENTS.findIndex((s) => s.value === reward);
      if (targetIndex === -1) targetIndex = 3;

      const segmentAngle = 360 / ROULETTE_SEGMENTS.length;
      const extraRounds = 5 * 360;
      // 룰렛 상단 포인터 기준 역회전 각도
      const targetAngle = extraRounds + (360 - targetIndex * segmentAngle - segmentAngle / 2);

      setRotation((prev) => prev + targetAngle);

      setTimeout(() => {
        setSpinning(false);
        setWinResult({ amount: reward, isJackpot: data.isJackpot });
        setStatus((prev) => ({
          ...prev,
          checkedInToday: true,
          streakDays: data.streakDays,
        }));
      }, 4000);
    } catch (err: any) {
      setErrorMsg(err?.message || '네트워크 오류가 발생했습니다.');
      setSpinning(false);
    }
  };

  const streakDays = status.streakDays || 0;
  const currentStep = Math.min(7, status.checkedInToday ? streakDays : streakDays + 1);

  return (
    <Card className="border-border/60 bg-gradient-to-br from-card/95 via-card/80 to-muted/20 shadow-xl overflow-hidden backdrop-blur-sm">
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20">
              <Gift className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg font-bold tracking-tight flex items-center gap-1.5">
                7일 연속 출석 & 럭키 룰렛
                <Badge variant="outline" className="text-[11px] font-semibold border-amber-500/30 text-amber-400 bg-amber-500/10">
                  매일 00시 초기화
                </Badge>
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                매일 출석하고 도파민 룰렛을 돌려 최대 1,000 WLD 잭팟을 노려보세요!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold">
            <Flame className="h-4 w-4 fill-orange-500 text-orange-500 animate-pulse" />
            <span>{streakDays}일 연속 출석 중</span>
          </div>
        </div>

        {/* 7일 스트릭 프로그레스 */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mt-4 pt-2">
          {[1, 2, 3, 4, 5, 6, 7].map((day) => {
            const isCompleted = day <= streakDays && status.checkedInToday;
            const isCurrent = day === currentStep && !status.checkedInToday;
            const isJackpotDay = day === 7;

            return (
              <div
                key={day}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                  isCompleted
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold'
                    : isCurrent
                    ? 'bg-primary/10 border-primary text-primary font-bold shadow-md shadow-primary/10 ring-1 ring-primary/30'
                    : isJackpotDay
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    : 'bg-muted/30 border-border/40 text-muted-foreground'
                }`}
              >
                <div className="text-[10px] sm:text-xs font-medium">Day {day}</div>
                <div className="my-1">
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : isJackpotDay ? (
                    <Sparkles className="h-4 w-4 text-amber-400 animate-bounce" />
                  ) : (
                    <Gift className={`h-4 w-4 ${isCurrent ? 'text-primary' : 'text-muted-foreground/60'}`} />
                  )}
                </div>
                <div className="text-[10px] sm:text-[11px] font-mono leading-none">
                  {isJackpotDay ? '1000' : `${day * 10}`}
                </div>
              </div>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="pt-4 pb-5 flex flex-col items-center justify-center">
        {/* 룰렛 비주얼 영역 */}
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 my-2 flex items-center justify-center">
          {/* 상단 인디케이터 화살표 */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[18px] border-t-amber-400 drop-shadow-md" />

          {/* 회전하는 룰렛 원형 */}
          <div
            className="w-full h-full rounded-full border-4 border-amber-500/40 shadow-2xl relative overflow-hidden transition-transform duration-[4000ms] cubic-bezier(0.15, 0.9, 0.2, 1)"
            style={{
              transform: `rotate(${rotation}deg)`,
              background: 'conic-gradient(#3b82f6 0deg 45deg, #10b981 45deg 90deg, #8b5cf6 90deg 135deg, #f59e0b 135deg 180deg, #ec4899 180deg 225deg, #06b6d4 225deg 270deg, #ef4444 270deg 315deg, #eab308 315deg 360deg)',
            }}
          >
            {/* 세그먼트 라벨 텍스트 */}
            {ROULETTE_SEGMENTS.map((seg, idx) => {
              const angle = idx * 45 + 22.5;
              return (
                <div
                  key={seg.label}
                  className="absolute top-0 left-1/2 -translate-x-1/2 h-full flex flex-col items-center justify-start pt-3 pointer-events-none"
                  style={{
                    transform: `rotate(${angle}deg)`,
                    transformOrigin: '50% 50%',
                  }}
                >
                  <span className="text-[11px] font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] tracking-tighter">
                    {seg.label}
                  </span>
                </div>
              );
            })}

            {/* 룰렛 중앙 허브 */}
            <div className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-background border-4 border-amber-400 shadow-inner flex items-center justify-center z-10">
              <Sparkles className="h-6 w-6 text-amber-400" />
            </div>
          </div>
        </div>

        {/* 당첨 결과 알림 */}
        {winResult && (
          <div className="w-full max-w-sm p-3 mt-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-center animate-in fade-in zoom-in-95">
            <p className="text-sm font-bold text-amber-400 flex items-center justify-center gap-1.5">
              🎉 축하합니다! {winResult.amount} WLD 당첨!
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {winResult.isJackpot ? '7일 연속 출석 잭팟 보너스가 함께 지급되었습니다!' : '보상이 즉시 지갑에 안전하게 입금되었습니다.'}
            </p>
          </div>
        )}

        {errorMsg && (
          <p className="text-xs text-destructive text-center mt-2 font-medium">{errorMsg}</p>
        )}

        {/* 액션 버튼 */}
        <div className="w-full max-w-xs mt-4">
          {!status.signedIn ? (
            <Button className="w-full h-11 font-bold rounded-xl" asChild>
              <a href="/login">로그인하고 출석 보상 받기</a>
            </Button>
          ) : status.checkedInToday ? (
            <Button disabled className="w-full h-11 font-bold rounded-xl bg-muted text-muted-foreground border border-border/40">
              <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500" />
              오늘 출석 완료 (내일 00:00 오픈)
            </Button>
          ) : (
            <Button
              onClick={handleSpin}
              disabled={spinning || loading}
              className="w-full h-11 font-bold rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/20"
            >
              {spinning ? (
                <>
                  <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                  도파민 룰렛 회전 중...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2 fill-white" />
                  오늘의 행운 룰렛 돌리기
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
