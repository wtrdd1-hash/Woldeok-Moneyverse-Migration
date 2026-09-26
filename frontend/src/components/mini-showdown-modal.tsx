'use client';

import React, { useState } from 'react';
import { Dices, Trophy, Shield, X, Swords, User, Bot, Sparkles, CheckCircle2 } from 'lucide-react';

interface MiniShowdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  stake?: number;
  onGameFinish?: (won: boolean, netPayout: number) => void;
}

export function MiniShowdownModal({
  isOpen,
  onClose,
  stake = 100,
  onGameFinish,
}: MiniShowdownModalProps) {
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [aiScore, setAiScore] = useState<number>(0);
  const [round, setRound] = useState<number>(1);
  const [playerDice, setPlayerDice] = useState<number | null>(null);
  const [aiDice, setAiDice] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [roundWinner, setRoundWinner] = useState<'player' | 'ai' | 'draw' | null>(null);
  const [finalWinner, setFinalWinner] = useState<'player' | 'ai' | null>(null);

  if (!isOpen) return null;

  const handleRoll = () => {
    if (isRolling || finalWinner !== null) return;

    setIsRolling(true);
    setRoundWinner(null);

    // Roll animation delay
    setTimeout(() => {
      const pRoll = Math.floor(Math.random() * 6) + 1;
      const aRoll = Math.floor(Math.random() * 6) + 1;

      setPlayerDice(pRoll);
      setAiDice(aRoll);
      setIsRolling(false);

      if (pRoll > aRoll) {
        const nextPScore = playerScore + 1;
        setPlayerScore(nextPScore);
        setRoundWinner('player');

        if (nextPScore >= 2) {
          setFinalWinner('player');
          if (onGameFinish) onGameFinish(true, Math.round(stake * 1.9));
        } else {
          setRound((r) => r + 1);
        }
      } else if (aRoll > pRoll) {
        const nextAScore = aiScore + 1;
        setAiScore(nextAScore);
        setRoundWinner('ai');

        if (nextAScore >= 2) {
          setFinalWinner('ai');
          if (onGameFinish) onGameFinish(false, 0);
        } else {
          setRound((r) => r + 1);
        }
      } else {
        setRoundWinner('draw');
      }
    }, 600);
  };

  const handleReset = () => {
    setPlayerScore(0);
    setAiScore(0);
    setRound(1);
    setPlayerDice(null);
    setAiDice(null);
    setIsRolling(false);
    setRoundWinner(null);
    setFinalWinner(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="showdown-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-md rounded-3xl border border-indigo-500/50 bg-slate-900/95 p-6 text-slate-100 shadow-2xl shadow-indigo-500/20">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
              <Swords className="h-5 w-5 animate-pulse text-indigo-400" />
            </span>
            <div>
              <h2 id="showdown-title" className="text-base font-bold text-white">
                1:1 주사위 미니 결투 (3판 2선승)
              </h2>
              <p className="text-[11px] text-slate-400">가상 AI 덕이봇과의 즉석 주사위 승부</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
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
            100% 가상 시뮬레이터 (WLD 초소액)
          </span>
          <span className="font-mono text-indigo-400 font-bold">배당: 1.90x (190 WLD)</span>
        </div>

        {/* Score Board Header */}
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              <User className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-200">나 (Player)</span>
              <div className="flex gap-1 mt-0.5">
                {[1, 2].map((s) => (
                  <div
                    key={s}
                    className={`h-2 w-4 rounded-full ${
                      s <= playerScore ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-slate-800'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="text-center">
            <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-xs font-mono font-bold text-indigo-300 border border-indigo-500/30">
              ROUND {round}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <span className="text-xs font-bold text-slate-200">AI 덕이봇</span>
              <div className="flex gap-1 mt-0.5 justify-end">
                {[1, 2].map((s) => (
                  <div
                    key={s}
                    className={`h-2 w-4 rounded-full ${
                      s <= aiScore ? 'bg-rose-400 shadow-sm shadow-rose-400' : 'bg-slate-800'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400">
              <Bot className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Dice Arena */}
        <div className="my-5 flex items-center justify-around py-4">
          {/* Player Dice */}
          <div className="flex flex-col items-center">
            <div
              className={`flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-emerald-500/40 bg-emerald-500/10 shadow-lg ${
                isRolling ? 'animate-spin' : ''
              }`}
            >
              {playerDice !== null ? (
                <span className="text-3xl font-black text-emerald-300 font-mono">{playerDice}</span>
              ) : (
                <Dices className="h-10 w-10 text-emerald-400/60" />
              )}
            </div>
            <span className="mt-2 text-xs font-bold text-emerald-400">내 주사위</span>
          </div>

          <div className="text-xl font-black text-slate-600">VS</div>

          {/* AI Dice */}
          <div className="flex flex-col items-center">
            <div
              className={`flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-rose-500/40 bg-rose-500/10 shadow-lg ${
                isRolling ? 'animate-spin' : ''
              }`}
            >
              {aiDice !== null ? (
                <span className="text-3xl font-black text-rose-300 font-mono">{aiDice}</span>
              ) : (
                <Dices className="h-10 w-10 text-rose-400/60" />
              )}
            </div>
            <span className="mt-2 text-xs font-bold text-rose-400">덕이봇 주사위</span>
          </div>
        </div>

        {/* Round Feedback */}
        {roundWinner && finalWinner === null && (
          <div className="mb-3 text-center text-xs font-bold animate-fadeIn">
            {roundWinner === 'player' && <span className="text-emerald-400">🎉 라운드 승리!</span>}
            {roundWinner === 'ai' && <span className="text-rose-400">😢 AI 덕이봇 라운드 승리!</span>}
            {roundWinner === 'draw' && <span className="text-amber-400">⚖️ 무승부! 다시 굴립니다.</span>}
          </div>
        )}

        {/* Final Winner Result */}
        {finalWinner !== null ? (
          <div className="flex flex-col items-center text-center py-2 animate-fadeIn">
            {finalWinner === 'player' ? (
              <>
                <Trophy className="h-12 w-12 text-amber-400 animate-bounce" />
                <h3 className="mt-2 text-lg font-black text-white">🏆 2선승 최종 승리!</h3>
                <p className="text-xs text-amber-300 font-bold mt-0.5">
                  +{Math.round(stake * 1.9).toLocaleString()} WLD 획득!
                </p>
              </>
            ) : (
              <>
                <Bot className="h-12 w-12 text-rose-400" />
                <h3 className="mt-2 text-lg font-black text-white">결투 패배</h3>
                <p className="text-xs text-slate-400 mt-0.5">다음 기회에 다시 도전해보세요!</p>
              </>
            )}

            <div className="mt-4 flex w-full gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 rounded-xl bg-slate-800 py-3 text-xs font-bold text-slate-200 hover:bg-slate-700 active:scale-95"
              >
                한 판 더 결투 ⚔️
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 py-3 text-xs font-bold text-white shadow-md hover:from-indigo-400 hover:to-indigo-500 active:scale-95"
              >
                결투 종료
              </button>
            </div>
          </div>
        ) : (
          /* Roll Action Button */
          <button
            type="button"
            onClick={handleRoll}
            disabled={isRolling}
            className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 hover:from-indigo-400 hover:to-indigo-500 disabled:opacity-50 active:scale-95 transition-all"
          >
            {isRolling ? '주사위 굴리는 중...' : '주사위 굴리기 (Roll) 🎲'}
          </button>
        )}
      </div>
    </div>
  );
}
