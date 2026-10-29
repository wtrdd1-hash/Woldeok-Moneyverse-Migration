'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Coins, Flame, ShieldCheck, Trophy, X } from 'lucide-react';
import { getGoldenDuckStatusAction, type GoldenDuckLedgerStatus } from '@/app/actions/dopamine';

interface GoldenDuckFeverProps {
  readonly isOpen?: boolean;
  readonly onClose?: () => void;
  /** Legacy callback intentionally unused: local practice must never imply a wallet credit. */
  readonly onClaimReward?: (totalWld: number, comboMax: number) => void;
  readonly enableFloatingSpawn?: boolean;
}

/** A local ten-second skill game. No server-side reward or wallet mutation occurs. */
export function GoldenDuckFever({ isOpen = false, onClose, enableFloatingSpawn = false }: GoldenDuckFeverProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const active = isOpen || internalOpen;
  const [timeLeft, setTimeLeft] = useState(10);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [finished, setFinished] = useState(false);
  const [ledger, setLedger] = useState<GoldenDuckLedgerStatus | null>(null);
  const [floatingVisible, setFloatingVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    setTimeLeft(10);
    setScore(0);
    setCombo(0);
    setFinished(false);
    setLedger(null);
    void getGoldenDuckStatusAction()
      .then((status) => { if (!cancelled) setLedger(status); })
      .catch(() => { if (!cancelled) setLedger({ state: 'unavailable' }); });
    timerRef.current = setInterval(() => setTimeLeft((remaining) => Math.max(0, remaining - 1)), 1000);
    return () => {
      cancelled = true;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [active]);

  useEffect(() => {
    if (timeLeft === 0 && active) {
      setFinished(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [active, timeLeft]);

  useEffect(() => {
    if (!enableFloatingSpawn || active) return;
    const interval = setInterval(() => {
      setFloatingVisible(true);
      setTimeout(() => setFloatingVisible(false), 5000);
    }, 25_000);
    return () => clearInterval(interval);
  }, [active, enableFloatingSpawn]);

  const tap = useCallback(() => {
    if (finished || timeLeft === 0) return;
    setScore((previous) => Math.min(1000, previous + 10));
    setCombo((previous) => previous + 1);
  }, [finished, timeLeft]);

  const close = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setInternalOpen(false);
    onClose?.();
  };

  return (
    <>
      {floatingVisible && !active && (
        <button type="button" onClick={() => { setFloatingVisible(false); setInternalOpen(true); }}
          aria-label="황금 오리 연습 시작" className="fixed bottom-24 right-5 z-50 rounded-full bg-amber-400 p-4 text-slate-950 shadow-xl">
          <Flame aria-hidden="true" />
        </button>
      )}
      {active && (
        <div role="dialog" aria-modal="true" aria-labelledby="golden-duck-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4">
          <section className="w-full max-w-md rounded-3xl border border-amber-500/50 bg-slate-900 p-6 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <h2 id="golden-duck-title" className="text-lg font-bold text-amber-300">황금 오리 광클 피버 연습</h2>
              <button type="button" onClick={close} aria-label="닫기" className="rounded-lg p-2 hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300">
                <X aria-hidden="true" />
              </button>
            </div>
            <p className="mt-4 flex items-center gap-2 rounded-xl border border-amber-600/40 bg-amber-950/40 p-3 text-sm text-amber-200">
              <ShieldCheck aria-hidden="true" className="size-5 shrink-0" />
              무료 연습 모드 · WLD 지급 없음 · 지갑 잔고 변동 없음
            </p>
            <div role="status" className="mt-3 rounded-lg bg-slate-800 p-3 text-xs text-slate-300">
              {ledger === null ? '원장 기록 확인 중…' : ledger.state === 'unavailable'
                ? '원장 기록 조회 불가 — 지급 여부를 추측하지 않습니다.'
                : `오늘 원장 지급 기록: ${ledger.claimedToday ? '있음' : '없음'}`}
            </div>
            <div className="mt-5 flex items-center justify-between text-sm">
              <span>연습 점수: <strong className="text-amber-300">{score.toLocaleString()}점</strong></span>
              <span>콤보 {combo} · {timeLeft}초 남음</span>
            </div>
            {!finished ? (
              <div className="mt-5 flex flex-col items-center gap-3">
                <button type="button" onClick={tap} aria-label="오리 탭 연습"
                  className="flex size-40 touch-manipulation items-center justify-center rounded-full border-4 border-amber-300 bg-amber-400 text-slate-950 shadow-lg transition-transform active:scale-95 focus-visible:outline focus-visible:outline-4 focus-visible:outline-white">
                  <Coins aria-hidden="true" className="size-20" />
                </button>
                <p className="text-center text-xs text-slate-300">마우스·터치·Enter·Space로 10초 동안 연습하세요.</p>
              </div>
            ) : (
              <div className="mt-6 flex flex-col items-center gap-3 text-center" role="status">
                <Trophy aria-hidden="true" className="size-14 text-amber-300" />
                <h3 className="text-xl font-bold">연습 종료</h3>
                <p>연습 점수 {score.toLocaleString()}점 · {combo}회 탭</p>
                <p className="text-xs text-slate-300">이 점수는 기기에만 표시되며 WLD로 지급되지 않습니다.</p>
                <button type="button" onClick={close} className="w-full rounded-xl bg-amber-400 p-3 font-semibold text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">닫기</button>
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}
