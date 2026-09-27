'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Trophy, Volume2, VolumeX, CheckCircle, Package, ArrowRight } from 'lucide-react';
import { playVictoryFanfare } from '../lib/web-audio-fanfare';
import type { VipThemeId } from './vip-theme-selector';
import Link from 'next/link';

export interface AuctionWinCelebrationModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly itemTitle: string;
  readonly itemRarity?: string;
  readonly finalBidWld: number;
  readonly burnFeeWld: number;
  readonly vipSavedWld?: number;
  readonly isPlusUser?: boolean;
  readonly theme?: VipThemeId | string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  rotation: number;
  rotationSpeed: number;
}

const CONFETTI_COLORS = ['#fbbf24', '#f59e0b', '#10b981', '#38bdf8', '#f472b6', '#a78bfa'];

export function AuctionWinCelebrationModal({
  isOpen,
  onClose,
  itemTitle,
  itemRarity = 'Legendary',
  finalBidWld,
  burnFeeWld,
  vipSavedWld = 0,
  isPlusUser = false,
  theme = 'royal-gold',
}: AuctionWinCelebrationModalProps) {
  const [isMuted, setIsMuted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Trigger victory audio if not muted
    if (!isMuted) {
      try {
        playVictoryFanfare({ volume: 0.35 });
      } catch {
        // Audio policy ignore
      }
    }

    // Initialize Canvas Confetti Animation
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    const particles: Particle[] = [];
    const particleCount = 120;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: width / 2 + (Math.random() - 0.5) * 200,
        y: height / 2 - 50 + (Math.random() - 0.5) * 100,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.7) * 16 - 4,
        size: Math.random() * 8 + 4,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)] || '#f59e0b',
        alpha: 1,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // gravity
        p.vx *= 0.98; // air resistance
        p.rotation += p.rotationSpeed;
        p.alpha -= 0.006;

        if (p.alpha > 0) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          ctx.restore();
        }
      }

      if (particles.some((p) => p.alpha > 0)) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isOpen, isMuted]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      data-testid="auction-win-modal"
    >
      {/* Fullscreen Canvas for 60fps Confetti Particles */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-10 w-full h-full"
      />

      <div className="relative z-20 w-full max-w-md bg-zinc-950 border border-amber-500/50 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.3)] overflow-hidden flex flex-col p-6 space-y-5 text-center">
        {/* Top Sound Control and Close */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            title={isMuted ? '음소거 해제' : '음소거'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5" />
            경매 낙찰 성공!
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-zinc-500 hover:text-zinc-300 p-1"
          >
            닫기
          </button>
        </div>

        {/* Victory Icon and Headline */}
        <div className="flex flex-col items-center space-y-2 pt-2">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center shadow-[0_0_24px_rgba(245,158,11,0.4)]">
            <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight">
            축하합니다! 경매를 쟁취했습니다
          </h2>
          <p className="text-xs text-zinc-400">
            치열한 호가 경쟁 끝에 희귀 아티팩트의 최종 소유주가 되셨습니다.
          </p>
        </div>

        {/* Item Details Card */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 space-y-3 text-left">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
                {itemRarity} Artifact
              </span>
              <div className="text-base font-bold text-zinc-100">{itemTitle}</div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-zinc-800/80 border border-zinc-700 flex items-center justify-center">
              <Package className="w-4 h-4 text-zinc-300" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/80">
              <span className="text-zinc-400 block text-[11px]">최종 낙찰가</span>
              <span className="text-zinc-100 font-mono tabular-nums font-bold text-sm">
                {finalBidWld.toLocaleString()} WLD
              </span>
            </div>
            <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/80">
              <span className="text-zinc-400 block text-[11px]">소각 수수료</span>
              <span className="text-rose-400 font-mono tabular-nums font-semibold text-sm">
                {burnFeeWld.toLocaleString()} WLD
              </span>
            </div>
          </div>

          {isPlusUser && vipSavedWld > 0 && (
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-xs text-amber-300">
              <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                Moneyverse Plus VIP 혜택으로 <strong>{vipSavedWld.toLocaleString()} WLD</strong> 수수료 50% 절감 완료!
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-1">
          <Link
            href="/inventory"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-semibold text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <span>내 인벤토리에서 확인하기</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            경매장 계속 둘러보기
          </button>
        </div>
      </div>
    </div>
  );
}
