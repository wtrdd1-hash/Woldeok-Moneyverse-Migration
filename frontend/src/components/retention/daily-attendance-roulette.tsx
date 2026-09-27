'use client';

import React, { useState } from 'react';
import { Calendar, Gift, Sparkles, CheckCircle2, Trophy, RotateCw, ShieldCheck, Flame } from 'lucide-react';

interface AttendanceReward {
  readonly day: number;
  readonly rewardText: string;
  readonly amount: number;
  readonly isJackpot?: boolean;
}

const ATTENDANCE_SCHEDULE: readonly AttendanceReward[] = [
  { day: 1, rewardText: '100만 WLD', amount: 1000000 },
  { day: 2, rewardText: '200만 WLD', amount: 2000000 },
  { day: 3, rewardText: '300만 WLD', amount: 3000000 },
  { day: 4, rewardText: '500만 WLD', amount: 5000000 },
  { day: 5, rewardText: '700만 WLD', amount: 7000000 },
  { day: 6, rewardText: '850만 WLD', amount: 8500000 },
  { day: 7, rewardText: '1,000만 WLD + 황금 상자', amount: 10000000, isJackpot: true },
];

const ROULETTE_SLICES = [
  { label: '300만 WLD', value: 3000000, color: '#f59e0b' },
  { label: '500만 WLD', value: 5000000, color: '#10b981' },
  { label: '1,000만 WLD', value: 10000000, color: '#3b82f6' },
  { label: '피로회복제 3개', value: 0, color: '#8b5cf6' },
  { label: '2,000만 WLD', value: 20000000, color: '#ec4899' },
  { label: '🎉 1억 WLD 잭팟', value: 100000000, color: '#eab308' },
];

export function DailyAttendanceRoulette() {
  const [currentStreak, setCurrentStreak] = useState(3);
  const [checkedToday, setCheckedToday] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinRotation, setSpinRotation] = useState(0);
  const [rouletteResult, setRouletteResult] = useState<string | null>(null);

  const handleClaimAttendance = () => {
    if (checkedToday) return;
    setCheckedToday(true);
    setCurrentStreak((prev) => Math.min(prev + 1, 7));
  };

  const handleSpinRoulette = () => {
    if (isSpinning || rouletteResult) return;
    setIsSpinning(true);

    // 6개 슬라이스 중 랜덤 결정 (300만~1억)
    const targetIndex = Math.floor(Math.random() * ROULETTE_SLICES.length);
    const degreesPerSlice = 360 / ROULETTE_SLICES.length;
    const extraRounds = 5 * 360; // 5바퀴 회전
    const targetDegree = extraRounds + targetIndex * degreesPerSlice + degreesPerSlice / 2;

    setSpinRotation(targetDegree);

    setTimeout(() => {
      setIsSpinning(false);
      const fallbackSlice = { label: '300만 WLD', value: 3000000, color: '#f59e0b' };
      const chosenSlice = ROULETTE_SLICES[targetIndex] ?? fallbackSlice;
      setRouletteResult(chosenSlice.label);
    }, 4000);
  };

  return (
    <div className="rounded-3xl bg-zinc-950 border border-zinc-800 p-6 md:p-8 shadow-2xl relative overflow-hidden">
      {/* 배경 글로우 */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-zinc-800/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-2">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>연속 출석 스트릭: {currentStreak}일차 달성 중</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            매일 출석체크 & <span className="text-amber-400">무료 럭키 룰렛</span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            7일 연속 출석 시 1,000만 WLD와 황금 상자를 드립니다. 매일 00시 리셋되는 룰렛으로 최대 1억 WLD의 주인공이 되어보세요!
          </p>
        </div>

        <button
          onClick={handleClaimAttendance}
          disabled={checkedToday}
          className={`px-6 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shrink-0 ${
            checkedToday
              ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed border border-zinc-700'
              : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20 active:scale-95'
          }`}
        >
          {checkedToday ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>오늘 출석 완료</span>
            </>
          ) : (
            <>
              <Calendar className="w-4 h-4" />
              <span>오늘 출석 보상 받기</span>
            </>
          )}
        </button>
      </div>

      {/* 7일 출석 스트릭 진행도 그리드 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 mb-10">
        {ATTENDANCE_SCHEDULE.map((item) => {
          const isPassed = item.day <= currentStreak;
          const isCurrent = item.day === currentStreak && !checkedToday;

          return (
            <div
              key={item.day}
              className={`p-3.5 rounded-2xl border flex flex-col justify-between transition-all ${
                isPassed
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                  : item.isJackpot
                  ? 'bg-gradient-to-b from-amber-500/20 to-zinc-900 border-amber-500/50'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-400'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold">{item.day}일차</span>
                {isPassed ? (
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                ) : item.isJackpot ? (
                  <Trophy className="w-4 h-4 text-amber-400 animate-bounce" />
                ) : (
                  <Gift className="w-3.5 h-3.5 text-zinc-500" />
                )}
              </div>
              <div className="text-xs font-black tracking-tight text-white">{item.rewardText}</div>
            </div>
          );
        })}
      </div>

      {/* 럭키 룰렛 섹션 */}
      <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 flex flex-col md:flex-row items-center justify-between gap-8">
        {/* 룰렛 휠 그래픽 */}
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 shrink-0 flex items-center justify-center">
          {/* 상단 핀 바늘 */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-amber-400 filter drop-shadow-md" />

          {/* 회전판 */}
          <div
            className="w-full h-full rounded-full border-4 border-amber-500/40 shadow-2xl relative overflow-hidden transition-transform duration-[4000ms] cubic-bezier(0.15, 0.9, 0.25, 1)"
            style={{ transform: `rotate(${spinRotation}deg)` }}
          >
            {ROULETTE_SLICES.map((slice, idx) => {
              const rotation = idx * 60;
              return (
                <div
                  key={idx}
                  className="absolute top-0 left-0 w-full h-full"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    clipPath: 'polygon(50% 50%, 21.13% 0%, 78.87% 0%)',
                    backgroundColor: slice.color,
                    opacity: 0.85,
                  }}
                >
                  <span className="absolute top-4 left-1/2 -translate-x-1/2 text-[10px] font-black text-zinc-950 font-mono rotate-90 origin-center whitespace-nowrap">
                    {slice.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* 중앙 허브 버튼 */}
          <div className="absolute w-12 h-12 rounded-full bg-zinc-950 border-2 border-amber-400 flex items-center justify-center z-10 shadow-lg">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
        </div>

        {/* 룰렛 설명 및 스핀 액션 */}
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>매일 1회 100% 당첨 보장</span>
          </div>

          <h3 className="text-xl font-bold text-white mb-2">오늘의 무료 럭키 스핀</h3>
          <p className="text-xs sm:text-sm text-zinc-400 mb-6 leading-relaxed">
            꽝 없이 최소 300만 WLD부터 최대 1억 WLD 잭팟까지! <br />
            매일 접속하여 행운의 룰렛을 돌리고 지갑 잔고를 불려보세요.
          </p>

          {rouletteResult ? (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-center md:text-left animate-in fade-in">
              <span className="text-xs text-amber-400 font-bold block">🎉 축하합니다! 당첨 보상:</span>
              <div className="text-xl font-black text-white mt-1 font-mono">{rouletteResult}</div>
              <span className="text-[11px] text-zinc-400 mt-1 block">보상이 가상 지갑에 즉시 적립되었습니다.</span>
            </div>
          ) : (
            <button
              onClick={handleSpinRoulette}
              disabled={isSpinning}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition"
            >
              <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
              <span>{isSpinning ? '룰렛 회전 중...' : '지금 무료 룰렛 돌리기'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
