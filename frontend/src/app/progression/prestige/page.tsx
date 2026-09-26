'use client';

import React, { useState } from 'react';
import { Flame, Sparkles, Shield, Trophy, RotateCcw, Zap, Crown, CheckCircle2, AlertTriangle } from 'lucide-react';

export interface Relic {
  id: string;
  name: string;
  effect: string;
  tier: string;
  isEquipped: boolean;
}

const INITIAL_RELICS: Relic[] = [
  { id: 'rel-1', name: '고대 황금 시계', effect: '직업 업무 쿨다운 50% 단축', tier: '전설', isEquipped: true },
  { id: 'rel-2', name: '미다스의 손길', effect: '은행 예적금 복리 이자율 +3.0%p 영구 가산', tier: '에픽', isEquipped: true },
  { id: 'rel-3', name: '헤르메스의 인장', effect: '주식 거래 수수료 100% 면제', tier: '신화', isEquipped: false },
];

export default function PrestigeRebirthPage() {
  const [currentNetWorth, setCurrentNetWorth] = useState<number>(2500000);
  const [currentLevel, setCurrentLevel] = useState<number>(2);
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(4.0);
  const [totalLifetimeBurned, setTotalLifetimeBurned] = useState<number>(8500000);
  const [hasInsuranceTicket, setHasInsuranceTicket] = useState<boolean>(true);
  const [useInsurance, setUseInsurance] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [relics, setRelics] = useState<Relic[]>(INITIAL_RELICS);

  const nextMultiplier = currentMultiplier * 2;
  const preservedAmount = useInsurance ? Math.floor(currentNetWorth * 0.3) : 0;
  const burnedAmount = currentNetWorth - preservedAmount;

  const handleRebirth = () => {
    setTotalLifetimeBurned((prev) => prev + burnedAmount);
    setCurrentLevel((prev) => prev + 1);
    setCurrentMultiplier(nextMultiplier);
    setCurrentNetWorth(preservedAmount);

    setNotification(
      `🌟 환생 완료! 프레스티지 레벨 ${currentLevel + 1} 달성 (영구 생산력 x${nextMultiplier.toFixed(1)}배 적용, ${burnedAmount.toLocaleString()} WLD 소각)`
    );
    setIsModalOpen(false);
    setTimeout(() => setNotification(null), 5000);
  };

  const toggleRelic = (id: string) => {
    setRelics((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isEquipped: !r.isEquipped } : r))
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Top Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
                <Crown className="h-6 w-6" />
              </span>
              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                Cookie Clicker형 프레스티지 (환생) 시스템
              </h1>
            </div>
            <p className="mt-1 text-xs text-slate-400 sm:text-sm">
              자산을 명예 소각하고 다음 생의 영구 생산력 배수와 고대 유물 슬롯을 해금하는 엔드게임 콘솔
            </p>
          </div>

          {/* Stat Badges */}
          <div className="flex flex-wrap gap-3">
            <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 px-3.5 py-2">
              <div className="text-xs text-purple-300">현재 프레스티지 랭크</div>
              <div className="font-mono text-base font-bold text-white">
                Tier {currentLevel} (x{currentMultiplier.toFixed(1)}배)
              </div>
            </div>

            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2">
              <div className="text-xs text-rose-300">누적 환생 소각 WLD</div>
              <div className="font-mono text-base font-bold text-white">
                {totalLifetimeBurned.toLocaleString()} WLD
              </div>
            </div>
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div className="flex items-center gap-2 rounded-xl border border-purple-500/40 bg-purple-500/15 p-3.5 text-xs font-semibold text-purple-300 shadow">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {/* Rebirth Comparison Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Current Life State */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-slate-200">현재 생의 경제 상태</h2>
              <span className="rounded bg-slate-800 px-2 py-0.5 text-xs font-mono font-bold text-slate-300">
                Tier {currentLevel}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">보유 총 가상 자산:</span>
                <span className="font-mono font-bold text-amber-400 text-sm">
                  {currentNetWorth.toLocaleString()} WLD
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">현재 적용 중인 생산력 배수:</span>
                <span className="font-mono font-bold text-white">x{currentMultiplier.toFixed(1)}배</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">장착 가능한 고대 유물 슬롯:</span>
                <span className="font-mono text-slate-300">3 / 3 슬롯 활성</span>
              </div>
            </div>
          </div>

          {/* Next Rebirth Preview */}
          <div className="rounded-2xl border border-purple-500/40 bg-gradient-to-br from-purple-950/40 via-slate-900/60 to-slate-900/60 p-5 shadow-lg">
            <div className="flex items-center justify-between border-b border-purple-500/30 pb-3">
              <h2 className="text-sm font-bold text-purple-200">다음 환생(Prestige) 혜택</h2>
              <span className="rounded bg-purple-500/20 px-2 py-0.5 text-xs font-mono font-bold text-purple-300">
                Tier {currentLevel + 1} 승급
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">다음 생 영구 생산력 배수:</span>
                <span className="font-mono font-black text-emerald-400 text-base">
                  x{nextMultiplier.toFixed(1)}배 (+100% 폭증)
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">직업/예금/배당 기본 수령액:</span>
                <span className="font-mono text-emerald-300">모든 보상 2배 가속</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">소각 예정 가상 자산:</span>
                <span className="font-mono font-bold text-rose-400">
                  -{burnedAmount.toLocaleString()} WLD (영구 소각)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Insurance & Action Console */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-cyan-400" />
              <div>
                <div className="text-xs font-bold text-slate-200">VIP 자산 보존 보험 티켓 (30% 이월)</div>
                <div className="text-[11px] text-slate-400">
                  환생 시 자산 100% 소각 대신 <span className="font-bold text-cyan-400">{preservedAmount.toLocaleString()} WLD</span>를 다음 생으로 보존
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setUseInsurance(!useInsurance)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                useInsurance
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {useInsurance ? '보험 적용 중 (30% 보존)' : '보험 활성화하기'}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99]"
          >
            <RotateCcw className="h-4 w-4" />
            프레스티지 환생 실행하고 영구 x{nextMultiplier.toFixed(1)}배 생산력 획득하기
          </button>
        </div>

        {/* Ancient Relics Inventory */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <Trophy className="h-5 w-5 text-amber-400" />
            <h2 className="text-sm font-bold text-white">해금된 고대 유물 (Ancient Relics)</h2>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {relics.map((relic) => (
              <div
                key={relic.id}
                className={`rounded-xl border p-4 transition-all ${
                  relic.isEquipped
                    ? 'border-purple-500/60 bg-purple-500/10'
                    : 'border-slate-800 bg-slate-900/40 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="rounded bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-300">
                    {relic.tier}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleRelic(relic.id)}
                    className="text-xs font-bold text-purple-400 hover:underline"
                  >
                    {relic.isEquipped ? '장착 해제' : '장착하기'}
                  </button>
                </div>
                <h3 className="mt-2 text-xs font-bold text-white">{relic.name}</h3>
                <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">{relic.effect}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Confirmation Modal */}
        {isModalOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="prestige-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          >
            <div className="relative w-full max-w-md rounded-2xl border border-purple-500/40 bg-slate-900 p-6 text-slate-100 shadow-2xl">
              <div className="flex items-center gap-2 text-amber-400">
                <AlertTriangle className="h-6 w-6 flex-shrink-0" />
                <h3 id="prestige-modal-title" className="text-base font-bold text-white">
                  정말로 프레스티지 환생을 진행하시겠습니까?
                </h3>
              </div>

              <div className="mt-4 space-y-2 rounded-xl border border-slate-800 bg-slate-950 p-3.5 text-xs text-slate-300">
                <p>환생 시 현재 보유한 자산 중 <strong className="text-rose-400">{burnedAmount.toLocaleString()} WLD</strong>가 영구 소각됩니다.</p>
                {useInsurance && (
                  <p className="text-cyan-300">✓ VIP 보험으로 {preservedAmount.toLocaleString()} WLD가 보존되어 다음 생으로 이월됩니다.</p>
                )}
                <p className="text-emerald-300 font-bold">✓ 영구 패시브 생산력 배수 x{nextMultiplier.toFixed(1)}배가 즉시 적용됩니다.</p>
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-800 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-700"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleRebirth}
                  className="flex-1 rounded-xl bg-purple-600 py-2.5 text-xs font-bold text-white shadow hover:bg-purple-500"
                >
                  환생 확정
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
