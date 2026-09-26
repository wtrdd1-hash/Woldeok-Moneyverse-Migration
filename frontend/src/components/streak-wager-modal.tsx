'use client';

import React, { useState } from 'react';
import { Flame, Shield, Trophy, CheckCircle2, ChevronRight, X, AlertCircle } from 'lucide-react';

export interface StreakLeagueUser {
  rank: number;
  userId: string;
  username: string;
  streakDays: number;
  wagerAmount: number;
  isCurrentUser?: boolean;
}

interface StreakWagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStreakDays?: number;
  freezesRemaining?: number;
  currentWager?: number;
  onStartWager?: (amount: number) => void;
  onUseFreeze?: () => void;
  onCheckIn?: () => void;
}

const SAMPLE_LEAGUE: StreakLeagueUser[] = [
  { rank: 1, userId: 'u-1', username: 'CryptoWhale', streakDays: 28, wagerAmount: 50000 },
  { rank: 2, userId: 'u-2', username: 'DopamineHunter', streakDays: 21, wagerAmount: 20000 },
  { rank: 3, userId: 'u-3', username: 'StockMaster', streakDays: 14, wagerAmount: 10000 },
  { rank: 4, userId: 'u-me', username: '나 (You)', streakDays: 5, wagerAmount: 5000, isCurrentUser: true },
  { rank: 5, userId: 'u-5', username: 'YieldFarmer', streakDays: 4, wagerAmount: 2000 },
  { rank: 6, userId: 'u-6', username: 'AlphaSeeker', streakDays: 3, wagerAmount: 1000 },
  { rank: 7, userId: 'u-7', username: 'MoonShot', streakDays: 2, wagerAmount: 1000 },
  { rank: 8, userId: 'u-8', username: 'HodlKing', streakDays: 1, wagerAmount: 500 },
  { rank: 9, userId: 'u-9', username: 'PaperHands', streakDays: 0, wagerAmount: 0 },
  { rank: 10, userId: 'u-10', username: 'RookieTrader', streakDays: 0, wagerAmount: 0 },
];

export function StreakWagerModal({
  isOpen,
  onClose,
  currentStreakDays = 5,
  freezesRemaining = 3,
  currentWager = 5000,
  onStartWager,
  onUseFreeze,
  onCheckIn,
}: StreakWagerModalProps) {
  const [wagerInput, setWagerInput] = useState<number>(5000);
  const [activeTab, setActiveTab] = useState<'wager' | 'league'>('wager');
  const [checkedInToday, setCheckedInToday] = useState<boolean>(false);
  const [freezes, setFreezes] = useState<number>(freezesRemaining);

  if (!isOpen) return null;

  const handleCheckIn = () => {
    setCheckedInToday(true);
    if (onCheckIn) onCheckIn();
  };

  const handleFreeze = () => {
    if (freezes > 0) {
      setFreezes((prev) => prev - 1);
      if (onUseFreeze) onUseFreeze();
    }
  };

  const handleStartWager = () => {
    if (onStartWager) onStartWager(wagerInput);
  };

  const expectedPayout = wagerInput * 2;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="streak-wager-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-700/80 bg-slate-900/95 p-6 text-slate-100 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
              <Flame className="h-6 w-6" />
            </div>
            <div>
              <h2 id="streak-wager-title" className="text-lg font-bold tracking-tight text-white">
                7일 스트릭 내기 & 주간 리그
              </h2>
              <p className="text-xs text-slate-400">연속 7일 달성 시 200% 배당 즉시 지급</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-800/60 p-1">
          <button
            type="button"
            onClick={() => setActiveTab('wager')}
            className={`rounded-lg py-2 text-xs font-semibold transition-colors ${
              activeTab === 'wager' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            🔥 스트릭 내기 챌린지
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('league')}
            className={`rounded-lg py-2 text-xs font-semibold transition-colors ${
              activeTab === 'league' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            🏆 10인 주간 승강 리그
          </button>
        </div>

        {/* Content Area */}
        {activeTab === 'wager' ? (
          <div className="mt-4 space-y-4">
            {/* Current Streak Stat */}
            <div className="flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20 text-2xl font-black text-amber-400">
                  {currentStreakDays}
                </div>
                <div>
                  <div className="text-xs font-medium text-amber-300">현재 연속 출석 일수</div>
                  <div className="text-base font-bold text-white">
                    {currentStreakDays}일 연속 유지 중!
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCheckIn}
                disabled={checkedInToday}
                className={`rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                  checkedInToday
                    ? 'bg-emerald-600/30 text-emerald-300'
                    : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                }`}
              >
                {checkedInToday ? '오늘 완료됨' : '오늘 출석 체크'}
              </button>
            </div>

            {/* 7-day Step Progress Bar */}
            <div>
              <div className="mb-1.5 flex justify-between text-xs text-slate-400">
                <span>진행도 ({currentStreakDays}/7일)</span>
                <span className="font-mono text-amber-400">{Math.round((currentStreakDays / 7) * 100)}%</span>
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                  const isDone = day <= currentStreakDays;
                  const isFinal = day === 7;
                  return (
                    <div
                      key={day}
                      className={`flex flex-col items-center justify-center rounded-lg border py-2 text-center text-xs font-bold ${
                        isDone
                          ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-400'
                          : isFinal
                          ? 'border-amber-500/50 bg-amber-500/20 text-amber-400'
                          : 'border-slate-800 bg-slate-800/40 text-slate-500'
                      }`}
                    >
                      <span>D{day}</span>
                      {isDone ? (
                        <CheckCircle2 className="mt-1 h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <span className="mt-1 text-[10px]">{isFinal ? '200%' : '대기'}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Wager Setting */}
            <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-3.5">
              <label htmlFor="wager-amount-input" className="block text-xs font-medium text-slate-300">
                스트릭 내기 금액 설정 (WLD)
              </label>
              <div className="mt-2 flex items-center gap-2">
                <input
                  id="wager-amount-input"
                  type="number"
                  min={1000}
                  max={50000}
                  step={1000}
                  value={wagerInput}
                  onChange={(e) => setWagerInput(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-sm text-white focus:border-amber-500 focus:outline-none"
                />
                <div className="flex gap-1">
                  {[5000, 10000, 30000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setWagerInput(preset)}
                      className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                    >
                      {preset / 1000}k
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-2.5 flex items-center justify-between text-xs">
                <span className="text-slate-400">7일 달성 성공 시 예상 수령:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {expectedPayout.toLocaleString()} WLD (200%)
                </span>
              </div>
            </div>

            {/* Streak Freeze Defense */}
            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-800/40 p-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200">스트릭 프리즈 (연속 방어권)</div>
                  <div className="text-[11px] text-slate-400">
                    남은 방어권: <span className="font-bold text-cyan-400">{freezes}회</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleFreeze}
                disabled={freezes <= 0}
                className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 disabled:opacity-40"
              >
                방어권 사용
              </button>
            </div>

            {/* Start Button */}
            <button
              type="button"
              onClick={handleStartWager}
              className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3 text-sm font-bold text-slate-950 shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99]"
            >
              🔥 {wagerInput.toLocaleString()} WLD 스트릭 내기 시작하기
            </button>
          </div>
        ) : (
          /* 10-Player League View */
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-purple-500/30 bg-purple-500/10 p-3">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-purple-400" />
                <div>
                  <div className="text-xs font-bold text-purple-300">골드 리그 (Group #402)</div>
                  <div className="text-[11px] text-slate-400">상위 3명 다이아몬드 승급 / 하위 3명 실버 강등</div>
                </div>
              </div>
              <span className="rounded bg-purple-500/20 px-2 py-0.5 text-xs font-mono font-bold text-purple-300">
                시즌 4일 남음
              </span>
            </div>

            <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
              {SAMPLE_LEAGUE.map((user) => {
                const isTop3 = user.rank <= 3;
                const isBottom3 = user.rank >= 8;
                return (
                  <div
                    key={user.userId}
                    className={`flex items-center justify-between rounded-lg border p-2.5 text-xs transition-colors ${
                      user.isCurrentUser
                        ? 'border-amber-500/60 bg-amber-500/15'
                        : isTop3
                        ? 'border-emerald-500/30 bg-slate-900/60'
                        : isBottom3
                        ? 'border-rose-500/30 bg-slate-900/60'
                        : 'border-slate-800 bg-slate-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded font-mono font-bold ${
                          user.rank === 1
                            ? 'bg-amber-400 text-slate-950'
                            : user.rank === 2
                            ? 'bg-slate-300 text-slate-950'
                            : user.rank === 3
                            ? 'bg-amber-700 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {user.rank}
                      </span>
                      <div>
                        <span className={`font-semibold ${user.isCurrentUser ? 'text-amber-300' : 'text-slate-200'}`}>
                          {user.username}
                        </span>
                        {isTop3 && <span className="ml-1.5 text-[10px] text-emerald-400 font-medium">승급권</span>}
                        {isBottom3 && <span className="ml-1.5 text-[10px] text-rose-400 font-medium">강등권</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <div className="font-mono font-bold text-amber-400">{user.streakDays}일 연속</div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {user.wagerAmount.toLocaleString()} WLD
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
