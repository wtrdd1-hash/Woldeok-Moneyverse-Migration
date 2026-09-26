'use client';

import React, { useState } from 'react';
import { Heart, Sparkles, Gift, Shield, CheckCircle2, MessageCircle, RefreshCw } from 'lucide-react';

interface DeokiPetStationProps {
  initialAffection?: number;
  onClaimFortune?: (wldBonus: number, quote: string) => void;
  onTriggerFever?: () => void;
}

const QUOTES = [
  { text: '오늘의 행운 종목은 CHIPS! 분할 매수 타이밍입니다.', target: 'CHIPS (+3.4%)' },
  { text: '인내심이 곧 최고의 복리입니다. 적금 포켓을 채워보세요.', target: '가상 국채 (+5.0%)' },
  { text: '직감의 날! 20구획 휠에서 골드 구획을 노려보세요.', target: 'WHEEL_20 (3.80x)' },
  { text: '작은 티끌이 모여 거대한 태산이 됩니다. 매일 출석 완료!', target: '스트릭 보너스' },
  { text: '시장의 공포를 탐욕의 기회로 바꾸는 지혜가 필요한 날입니다.', target: 'SPACE 주식' },
];

export function DeokiPetStation({
  initialAffection = 20,
  onClaimFortune,
  onTriggerFever,
}: DeokiPetStationProps) {
  const [affection, setAffection] = useState<number>(initialAffection);
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [dialogue, setDialogue] = useState<string>('안녕! 오늘도 열심히 WLD 모아보자 꽥! 🐥');
  const [isCookieCracked, setIsCookieCracked] = useState<boolean>(false);
  const [fortuneData, setFortuneData] = useState<{ quote: string; target: string; wld: number } | null>(null);
  const [cookieClaimed, setCookieClaimed] = useState<boolean>(false);

  const level = Math.min(5, Math.floor(affection / 25) + 1);
  const progressToNext = (affection % 25) * 4;

  const handlePet = (e: React.MouseEvent<HTMLDivElement>) => {
    const nextAffection = affection + 2;
    setAffection(nextAffection);

    // Dynamic dialogue
    const dialogues = [
      '기분 최고다 꽥! 쓰다듬어줘서 고마워 ❤️',
      '행운의 에너지가 차오르고 있어! 🌟',
      '오늘 주식 떡상할 것 같은 예감이 들어! 📈',
      '친밀도가 올라갈수록 더 큰 행운이 올 거야! ✨',
      '골든 피버 타임도 언제든 찾아올 수 있어! ⚡',
    ];
    setDialogue(dialogues[Math.floor(Math.random() * dialogues.length)]!);

    // Heart particle
    const rect = e.currentTarget.getBoundingClientRect();
    const heartX = e.clientX - rect.left;
    const heartY = e.clientY - rect.top;
    const newHeart = {
      id: Date.now() + Math.random(),
      x: heartX,
      y: heartY,
    };
    setHearts((prev) => [...prev.slice(-5), newHeart]);
  };

  const handleCrackCookie = () => {
    if (cookieClaimed) return;

    const randomFortune = QUOTES[Math.floor(Math.random() * QUOTES.length)]!;
    const bonusWld = Math.floor(Math.random() * 500) + 500; // 500 ~ 1,000 WLD

    setFortuneData({
      quote: randomFortune.text,
      target: randomFortune.target,
      wld: bonusWld,
    });
    setIsCookieCracked(true);
    setCookieClaimed(true);

    if (onClaimFortune) {
      onClaimFortune(bonusWld, randomFortune.text);
    }
  };

  return (
    <div className="w-full rounded-3xl border border-slate-800 bg-slate-900/90 p-5 text-slate-100 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              컴패니언 오리 '덕이' 펫 스테이션
              <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-black text-amber-300 border border-amber-500/30">
                Lv.{level}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">쓰다듬어 친밀도를 올리고 일일 포춘쿠키를 쪼개보세요</p>
          </div>
        </div>

        {onTriggerFever && (
          <button
            type="button"
            onClick={onTriggerFever}
            className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-2.5 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition-all flex items-center gap-1"
          >
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            피버 시작
          </button>
        )}
      </div>

      {/* Main Grid: Left Petting / Right Fortune Cookie */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Left: Interactive Petting Box */}
        <div
          onClick={handlePet}
          className="relative flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/60 p-4 cursor-pointer select-none transition-all duration-200 hover:border-amber-500/50 hover:bg-slate-950/80 active:scale-98 group overflow-hidden"
          role="button"
          aria-label="덕이 펫 쓰다듬기"
          tabIndex={0}
        >
          {/* Dialogue Speech Bubble */}
          <div className="mb-2 flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-200 shadow-sm animate-fadeIn">
            <MessageCircle className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
            <span className="truncate">{dialogue}</span>
          </div>

          {/* Duck Avatar */}
          <div className="relative my-2 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500/20 to-yellow-400/20 border border-amber-400/40 shadow-inner group-hover:scale-105 transition-transform duration-200">
            <span className="text-4xl filter drop-shadow-md select-none">🐥</span>
            <span className="absolute -bottom-2 rounded-full bg-slate-900 border border-slate-700 px-2 py-0.5 text-[10px] font-bold text-amber-400">
              클릭하여 쓰다듬기
            </span>
          </div>

          {/* Heart Floating Particles */}
          {hearts.map((h) => (
            <div
              key={h.id}
              style={{ top: `${h.y}px`, left: `${h.x}px` }}
              className="pointer-events-none absolute text-rose-500 animate-floatUp"
            >
              <Heart className="h-4 w-4 fill-rose-500" />
            </div>
          ))}

          {/* Affection Progress Bar */}
          <div className="mt-3 w-full">
            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
              <span>친밀도 (Affection)</span>
              <span className="font-mono text-amber-400 font-bold">{affection} pts</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-300"
                style={{ width: `${progressToNext}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right: Fortune Cookie Station */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Gift className="h-3.5 w-3.5 text-amber-400" />
              1일 1회 행운의 포춘쿠키
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {cookieClaimed ? '오늘 수령 완료' : '무료 개봉 가능'}
            </span>
          </div>

          {!isCookieCracked ? (
            <div className="my-auto flex flex-col items-center justify-center py-3 text-center">
              <div className="text-4xl mb-2 animate-bounce">🥠</div>
              <p className="text-xs text-slate-300 font-medium">쿠키를 쪼개 오늘의 투자 점괘와 보너스 WLD를 받으세요!</p>
              <button
                type="button"
                onClick={handleCrackCookie}
                disabled={cookieClaimed}
                className="mt-3 w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-2.5 text-xs font-bold text-slate-950 shadow-md hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 transition-all active:scale-95"
              >
                포춘쿠키 쪼개기 🥠
              </button>
            </div>
          ) : (
            <div className="my-auto flex flex-col items-center justify-center py-2 text-center animate-fadeIn">
              <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold mb-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                +{fortuneData?.wld.toLocaleString()} WLD 즉시 지급!
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-2.5 text-xs text-slate-200 leading-relaxed">
                "{fortuneData?.quote}"
              </div>
              <div className="mt-2 flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                <span>추천 점괘:</span>
                <span className="font-bold underline">{fortuneData?.target}</span>
              </div>
            </div>
          )}

          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800/60 pt-2">
            <span className="flex items-center gap-1">
              <Shield className="h-3 w-3 text-emerald-400" />
              100% 무료 가상 리워드
            </span>
            <span>매일 00:00 KST 초기화</span>
          </div>
        </div>
      </div>
    </div>
  );
}
