'use client';

import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Flame, Clock, Trophy, CheckCircle2, DollarSign, Sparkles } from 'lucide-react';

interface PredictionTarget {
  readonly id: string;
  readonly name: string;
  readonly code: string;
  readonly type: 'VIRTUAL' | 'MACRO';
  readonly currentPrice: string;
  readonly upPercentage: number;
  readonly totalVoters: number;
}

const PREDICTION_TARGETS: readonly PredictionTarget[] = [
  { id: 'chips', name: '침팬지 반도체', code: 'CHIPS', type: 'VIRTUAL', currentPrice: '52,400 WLD', upPercentage: 68, totalVoters: 1420 },
  { id: 'ducks', name: '월덕 인더스트리', code: 'DUCKS', type: 'VIRTUAL', currentPrice: '124,000 WLD', upPercentage: 45, totalVoters: 980 },
  { id: 'coin', name: '도지 밈 파이낸스', code: 'COIN', type: 'VIRTUAL', currentPrice: '15,200 WLD', upPercentage: 74, totalVoters: 2150 },
  { id: 'kospi', name: '코스피 지수 (KOSPI)', code: 'KS11', type: 'MACRO', currentPrice: '2,650.15 pt', upPercentage: 58, totalVoters: 3400 },
  { id: 'qqq', name: '나스닥 100 (QQQ)', code: 'QQQ', type: 'MACRO', currentPrice: '$492.50', upPercentage: 62, totalVoters: 2890 },
];

export function DailyPredictionBattle() {
  const [selectedTargetId, setSelectedTargetId] = useState('chips');
  const [userVotes, setUserVotes] = useState<Record<string, 'UP' | 'DOWN'>>({});

  const currentTarget: PredictionTarget = PREDICTION_TARGETS.find((t) => t.id === selectedTargetId) || PREDICTION_TARGETS[0]!;
  const hasVoted = Boolean(userVotes[currentTarget.id]);
  const votedChoice = userVotes[currentTarget.id];

  const handleVote = (choice: 'UP' | 'DOWN') => {
    if (hasVoted) return;
    setUserVotes((prev) => ({ ...prev, [currentTarget.id]: choice }));
  };

  return (
    <div className="rounded-3xl bg-zinc-950 border border-zinc-800 p-6 md:p-8 shadow-2xl relative overflow-hidden">
      {/* 배경 글로우 */}
      <div className="absolute top-0 left-1/3 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold mb-2">
            <Flame className="w-3.5 h-3.5" />
            <span>매일 15:30 마감 • 총 상금 5,000만 WLD 분배</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            내일의 주가 <span className="text-emerald-400">UP</span> or <span className="text-rose-400">DOWN</span> 승부 예측
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            익일 시초가/종가의 상승 또는 하락을 맞추면, 정답자 전원에게 5,000만 WLD 풀이 균등 분배됩니다!
          </p>
        </div>

        {/* 마감 카운트다운 박스 */}
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 shrink-0">
          <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>오늘 투표 마감: <strong className="text-amber-400">15:30:00</strong></span>
        </div>
      </div>

      {/* 종목 선택 탭 칩 */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
        {PREDICTION_TARGETS.map((target) => {
          const isSelected = target.id === selectedTargetId;
          const userVote = userVotes[target.id];

          return (
            <button
              key={target.id}
              onClick={() => setSelectedTargetId(target.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition shrink-0 ${
                isSelected
                  ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
              }`}
            >
              <span>{target.name}</span>
              {userVote && (
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-black ${
                  userVote === 'UP' ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                }`}>
                  {userVote}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 선택된 종목 배팅 카드 */}
      <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="w-full md:w-1/2">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-xs font-mono text-zinc-500">{currentTarget.code} • {currentTarget.type}</span>
              <h3 className="text-lg font-bold text-white">{currentTarget.name}</h3>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-zinc-500 block">현재 기준가</span>
              <span className="text-base font-black text-amber-300 font-mono">{currentTarget.currentPrice}</span>
            </div>
          </div>

          {/* 실시간 여론 게이지 바 */}
          <div className="mt-4">
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-emerald-400">UP 상승 예측 {currentTarget.upPercentage}%</span>
              <span className="text-rose-400">DOWN 하락 예측 {100 - currentTarget.upPercentage}%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-zinc-950 overflow-hidden flex border border-zinc-800">
              <div
                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500"
                style={{ width: `${currentTarget.upPercentage}%` }}
              />
              <div
                className="h-full bg-gradient-to-r from-rose-400 to-rose-600 transition-all duration-500"
                style={{ width: `${100 - currentTarget.upPercentage}%` }}
              />
            </div>
            <div className="text-[11px] text-zinc-500 text-right mt-1 font-mono">
              총 {currentTarget.totalVoters.toLocaleString('ko-KR')}명 참여 중
            </div>
          </div>
        </div>

        {/* UP / DOWN 투표 액션 버튼 */}
        <div className="w-full md:w-1/2 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => handleVote('UP')}
            disabled={hasVoted}
            className={`flex-1 py-4 px-5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition ${
              votedChoice === 'UP'
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/20'
                : hasVoted
                ? 'opacity-40 cursor-not-allowed bg-zinc-950 border-zinc-800 text-zinc-500'
                : 'bg-zinc-950 hover:bg-emerald-950/30 border-zinc-800 hover:border-emerald-500/40 text-emerald-400 active:scale-95'
            }`}
          >
            <TrendingUp className="w-6 h-6 text-emerald-400" />
            <span className="text-sm font-black tracking-wider">UP (상승)</span>
            <span className="text-[11px] text-zinc-400">익일 플러스 마감</span>
          </button>

          <button
            onClick={() => handleVote('DOWN')}
            disabled={hasVoted}
            className={`flex-1 py-4 px-5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition ${
              votedChoice === 'DOWN'
                ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-lg shadow-rose-500/20'
                : hasVoted
                ? 'opacity-40 cursor-not-allowed bg-zinc-950 border-zinc-800 text-zinc-500'
                : 'bg-zinc-950 hover:bg-rose-950/30 border-zinc-800 hover:border-rose-500/40 text-rose-400 active:scale-95'
            }`}
          >
            <TrendingDown className="w-6 h-6 text-rose-400" />
            <span className="text-sm font-black tracking-wider">DOWN (하락)</span>
            <span className="text-[11px] text-zinc-400">익일 마이너스 마감</span>
          </button>
        </div>
      </div>
    </div>
  );
}
