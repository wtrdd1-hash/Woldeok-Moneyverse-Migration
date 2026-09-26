'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Flame, Trophy, Coins, Shield, X, Zap } from 'lucide-react';

interface GoldenDuckFeverProps {
  isOpen?: boolean;
  onClose?: () => void;
  onClaimReward?: (totalWld: number, comboMax: number) => void;
  /**
   * 화면 내 황금 오리 플로팅 스폰 활성화 여부
   */
  enableFloatingSpawn?: boolean;
}

export function GoldenDuckFever({
  isOpen = false,
  onClose,
  onClaimReward,
  enableFloatingSpawn = true,
}: GoldenDuckFeverProps) {
  const [internalOpen, setInternalOpen] = useState<boolean>(false);
  const isFeverActive = isOpen || internalOpen;

  const [floatingVisible, setFloatingVisible] = useState<boolean>(false);
  const [floatingPos, setFloatingPos] = useState<{ x: number; y: number }>({ x: 20, y: 70 });
  
  // Fever gameplay state
  const [timeLeft, setTimeLeft] = useState<number>(10);
  const [tapCount, setTapCount] = useState<number>(0);
  const [earnedWld, setEarnedWld] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [clickParticles, setClickParticles] = useState<{ id: number; x: number; y: number; text: string }[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // When fever becomes active, start the 10-second timer
  useEffect(() => {
    if (isFeverActive) {
      setTimeLeft(10);
      setTapCount(0);
      setEarnedWld(0);
      setCombo(0);
      setMaxCombo(0);
      setIsFinished(false);
      setClickParticles([]);

      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setIsFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isFeverActive]);

  // Floating duck spawn cycle (every 25s if enabled and not currently in fever)
  useEffect(() => {
    if (!enableFloatingSpawn || isFeverActive) return;

    const spawnInterval = setInterval(() => {
      const randomX = Math.floor(Math.random() * 65) + 15;
      const randomY = Math.floor(Math.random() * 60) + 20;
      setFloatingPos({ x: randomX, y: randomY });
      setFloatingVisible(true);

      setTimeout(() => {
        setFloatingVisible(false);
      }, 5000);
    }, 25000);

    return () => clearInterval(spawnInterval);
  }, [enableFloatingSpawn, isFeverActive]);

  const startFeverFromFloating = () => {
    setFloatingVisible(false);
    setInternalOpen(true);
  };

  const handleTap = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isFinished || timeLeft <= 0) return;

    const nextTap = tapCount + 1;
    const nextCombo = combo + 1;
    setTapCount(nextTap);
    setCombo(nextCombo);
    if (nextCombo > maxCombo) setMaxCombo(nextCombo);

    // Multiplier calculation (1.0x to 3.0x based on combo)
    const multiplier = Math.min(3.0, 1.0 + Math.floor(nextCombo / 10) * 0.5);
    const baseWld = 50;
    const addedWld = Math.round(baseWld * multiplier);
    
    // Cap at 5,000 WLD per fever session
    setEarnedWld((prev) => Math.min(5000, prev + addedWld));

    // Particle effect
    const rect = e.currentTarget.getBoundingClientRect();
    const particleX = e.clientX - rect.left;
    const particleY = e.clientY - rect.top;
    const newParticle = {
      id: Date.now() + Math.random(),
      x: particleX,
      y: particleY,
      text: `+${addedWld} WLD`,
    };

    setClickParticles((prev) => [...prev.slice(-8), newParticle]);
  };

  const handleClaim = () => {
    if (onClaimReward) {
      onClaimReward(earnedWld, maxCombo);
    }
    setInternalOpen(false);
    if (onClose) onClose();
  };

  const handleCloseModal = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setInternalOpen(false);
    if (onClose) onClose();
  };

  return (
    <>
      {/* 1. Floating Random Golden Duck trigger */}
      {floatingVisible && !isFeverActive && (
        <div
          style={{ top: `${floatingPos.y}%`, left: `${floatingPos.x}%` }}
          className="fixed z-50 animate-bounce transition-all duration-500"
        >
          <button
            type="button"
            onClick={startFeverFromFloating}
            className="group relative flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-amber-300 bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 p-2 shadow-2xl shadow-amber-500/50 hover:scale-110 active:scale-95"
            aria-label="황금 오리 피버 타임 잡기"
          >
            <Sparkles className="h-7 w-7 text-slate-950 animate-spin" />
            <span className="absolute -top-3 rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-black tracking-wider text-white shadow-md animate-pulse">
              FEVER!
            </span>
          </button>
        </div>
      )}

      {/* 2. Fever Time Interactive Modal */}
      {isFeverActive && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="fever-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-fadeIn"
        >
          <div className="relative w-full max-w-md rounded-3xl border border-amber-500/50 bg-slate-900/95 p-6 text-slate-100 shadow-2xl shadow-amber-500/20">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                  <Flame className="h-5 w-5 animate-pulse text-amber-400" />
                </span>
                <h2 id="fever-title" className="text-base font-black text-amber-300">
                  황금 오리 광클 피버 타임 (10s Fever)
                </h2>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                aria-label="닫기"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Legal & Compliance Badge */}
            <div className="mt-3 flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 px-2.5 py-1.5 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Shield className="h-3.5 w-3.5 text-emerald-400" />
                100% 무료 미니 시뮬레이터 (WLD 리워드)
              </span>
              <span className="font-mono text-amber-400 font-bold">최대 5,000 WLD</span>
            </div>

            {/* Main Interactive Fever Area */}
            {!isFinished ? (
              <div className="mt-4 flex flex-col items-center justify-center py-3">
                {/* Timer & Combo Header */}
                <div className="flex w-full items-center justify-between px-2">
                  <div className="flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-amber-400" />
                    <span className="text-xs font-bold text-slate-300">
                      콤보 <span className="font-mono text-sm text-amber-400">{combo}x</span>
                    </span>
                  </div>
                  <div className="rounded-full bg-rose-500/20 border border-rose-500/40 px-3 py-1">
                    <span className="font-mono text-sm font-black text-rose-400">
                      ⏱️ {timeLeft}초 남음
                    </span>
                  </div>
                </div>

                {/* Score Counter */}
                <div className="my-3 text-center">
                  <span className="text-xs text-slate-400 font-medium">현재 획득 WLD</span>
                  <div className="text-3xl font-black text-amber-300 font-mono tracking-tight drop-shadow-md">
                    +{earnedWld.toLocaleString()} <span className="text-sm font-normal text-amber-400">WLD</span>
                  </div>
                </div>

                {/* Big Clickable Fever Coin Button */}
                <div className="relative my-2">
                  <button
                    type="button"
                    onClick={handleTap}
                    aria-label="피버 코인 광클하기"
                    className="relative flex h-40 w-40 cursor-pointer items-center justify-center rounded-full border-4 border-amber-300 bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 shadow-2xl shadow-amber-500/50 transition-transform duration-75 active:scale-90 select-none"
                  >
                    <Coins className="h-20 w-20 text-slate-950 drop-shadow-md animate-bounce" />
                    <span className="absolute bottom-3 rounded-full bg-slate-950/80 px-2.5 py-0.5 text-[11px] font-black text-amber-300 border border-amber-500/40">
                      광클! TAP!
                    </span>
                  </button>

                  {/* Floating Click Particles */}
                  {clickParticles.map((particle) => (
                    <div
                      key={particle.id}
                      style={{ top: `${particle.y}px`, left: `${particle.x}px` }}
                      className="pointer-events-none absolute text-xs font-black text-amber-200 animate-floatUp"
                    >
                      {particle.text}
                    </div>
                  ))}
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  시간이 끝나기 전에 화면의 황금 코인을 최대한 빠르게 연타하세요!
                </p>
              </div>
            ) : (
              /* Fever Finished Screen */
              <div className="mt-4 flex flex-col items-center justify-center py-4 text-center animate-fadeIn">
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl border-2 border-amber-400 bg-amber-500/20 shadow-xl shadow-amber-500/30 animate-pulse">
                  <Trophy className="h-12 w-12 text-amber-400" />
                </div>

                <div className="mt-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                    🎉 피버 타임 종료!
                  </span>
                  <h3 className="mt-1 text-2xl font-black text-white font-mono">
                    +{earnedWld.toLocaleString()} WLD 획득
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    총 <span className="text-amber-300 font-bold">{tapCount}회</span> 탭 · 최고 콤보 <span className="text-amber-300 font-bold">{maxCombo}x</span> 달성
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleClaim}
                  className="mt-5 w-full rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/30 hover:from-amber-400 hover:to-amber-500 active:scale-95 transition-all"
                >
                  지갑에 WLD 보상 수령하기
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
