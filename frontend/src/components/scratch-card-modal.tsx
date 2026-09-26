'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Trophy, X, Gift, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/components/locale-provider';
import { t } from '@/lib/i18n-dictionary';

export interface ScratchReward {
  symbol: string;
  name: string;
  shares: string;
  estimatedWld: string;
}

export function ScratchCardModal({
  isOpen,
  onClose,
  reward = { symbol: 'WDG', name: '월덕게임즈', shares: '2.5', estimatedWld: '3,625 WLD' },
  onClaim,
}: {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly reward?: ScratchReward;
  readonly onClaim?: (reward: ScratchReward) => void;
}) {
  const { locale } = useLocale();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [scratchedPercent, setScratchedPercent] = useState<number>(0);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  // Initialize Canvas Overlay
  useEffect(() => {
    if (!isOpen) {
      setScratchedPercent(0);
      setIsRevealed(false);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = 320;
    canvas.height = 180;

    // Draw scratchable silver gradient background
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#94a3b8');
    grad.addColorStop(0.5, '#cbd5e1');
    grad.addColorStop(1, '#64748b');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Decorative scratch pattern text
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✨ 마우스나 손가락으로 긁어보세요 ✨', canvas.width / 2, canvas.height / 2 + 5);
  }, [isOpen]);

  const scratch = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || isRevealed) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 18, 0, Math.PI * 2);
    ctx.fill();

    // Calculate scratched percentage roughly
    try {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let transparentPixels = 0;
      for (let i = 3; i < imgData.data.length; i += 4 * 16) {
        if (imgData.data[i] === 0) transparentPixels++;
      }
      const totalSampled = imgData.data.length / (4 * 16);
      const ratio = transparentPixels / totalSampled;
      setScratchedPercent(Math.round(ratio * 100));

      if (ratio > 0.45 && !isRevealed) {
        setIsRevealed(true);
        onClaim?.(reward);
      }
    } catch {
      // Fallback
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-sm rounded-3xl border border-amber-500/40 bg-card p-6 shadow-2xl space-y-4 text-center">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="닫기"
        >
          <X className="size-5" />
        </button>

        {/* Header Badge */}
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500 ring-1 ring-amber-500/30">
          <Gift className="size-6 animate-bounce" />
        </div>

        <div>
          <h3 className="text-base font-extrabold text-foreground">
            {locale === 'en' ? 'Lucky Stock Scratchcard!' : '럭키 주식 스크래치 복권'}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {locale === 'en'
              ? 'Scratch the card to reveal your instant bonus shares!'
              : '은박을 긁어 즉시 지급되는 가상 주식 보너스를 확인하세요!'}
          </p>
        </div>

        {/* Scratch Card Container */}
        <div className="relative mx-auto w-[320px] h-[180px] rounded-2xl border-2 border-dashed border-amber-500/50 bg-gradient-to-br from-amber-500/10 via-background to-emerald-500/10 overflow-hidden flex flex-col items-center justify-center p-4 select-none">
          {/* Revealed Content Behind */}
          <div className="space-y-1.5 z-0">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-black text-emerald-500">
              <Trophy className="size-3.5" /> 당첨 확정!
            </span>
            <div className="text-xl font-black text-foreground">
              {reward.name} <span className="text-amber-500 font-mono">+{reward.shares}주</span>
            </div>
            <p className="text-xs font-mono font-bold text-muted-foreground">
              가상 평가액: <span className="text-emerald-500">{reward.estimatedWld}</span>
            </p>
          </div>

          {/* Interactive Scratchable Canvas Overlay */}
          <canvas
            ref={canvasRef}
            className={`absolute inset-0 z-10 cursor-pointer touch-none transition-opacity duration-500 ${
              isRevealed ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
            onMouseDown={() => setIsDrawing(true)}
            onMouseUp={() => setIsDrawing(false)}
            onMouseLeave={() => setIsDrawing(false)}
            onMouseMove={(e) => {
              if (isDrawing) scratch(e.clientX, e.clientY);
            }}
            onTouchStart={() => setIsDrawing(true)}
            onTouchEnd={() => setIsDrawing(false)}
            onTouchMove={(e) => {
              if (e.touches[0]) {
                scratch(e.touches[0].clientX, e.touches[0].clientY);
              }
            }}
          />
        </div>

        {/* Progress & Action */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between text-xs font-bold text-muted-foreground px-1">
            <span>스크래치 진행도</span>
            <span className="font-mono text-amber-500">{Math.min(100, Math.round(scratchedPercent * 2.2))}%</span>
          </div>

          {isRevealed ? (
            <Button
              onClick={onClose}
              className="w-full h-11 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-600 text-white gap-1.5 shadow-md shadow-emerald-500/20 animate-scale-in"
            >
              <CheckCircle2 className="size-4" />
              <span>{locale === 'en' ? 'Claim Shares & Close' : '주식 수령 및 닫기'}</span>
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => {
                setIsRevealed(true);
                onClaim?.(reward);
              }}
              className="w-full h-11 rounded-xl font-bold text-xs"
            >
              <Sparkles className="size-4 text-amber-500 mr-1" />
              <span>{locale === 'en' ? 'Auto Scratch Card' : '한 번에 모두 긁기'}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
