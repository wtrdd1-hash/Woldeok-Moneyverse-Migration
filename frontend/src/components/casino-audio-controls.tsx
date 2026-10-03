'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isAudioMuted, toggleAudioMute, playBetChipSound } from '@/lib/audio-effects';
import { toast } from 'sonner';
import { TranslatedText as T } from '@/components/translated-text';

export function CasinoAudioControls() {
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setMuted(isAudioMuted());
  }, []);

  const handleToggle = () => {
    const next = toggleAudioMute();
    setMuted(next);
    if (!next) {
      playBetChipSound();
      toast.success('사운드가 켜졌습니다 (Web Audio API)', { duration: 1500 });
    } else {
      toast.info('사운드가 음소거되었습니다', { duration: 1500 });
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      className={`h-8 px-2.5 rounded-full border text-xs font-semibold transition-all active:scale-95 ${
        muted
          ? 'border-border text-muted-foreground bg-muted/40'
          : 'border-amber-500/40 text-amber-400 bg-amber-500/10 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
      }`}
      title={muted ? '사운드 켜기' : '음소거'}
    >
      {muted ? (
        <>
          <VolumeX className="size-3.5 mr-1" />
          <span>MUTE</span>
        </>
      ) : (
        <>
          <Volume2 className="size-3.5 mr-1 text-amber-400 animate-pulse" />
          <span>AUDIO ON</span>
        </>
      )}
    </Button>
  );
}

export function CasinoJackpotCelebration({
  active,
  multiplierText = 'JACKPOT 100x',
}: {
  readonly active: boolean;
  readonly multiplierText?: string;
}) {
  if (!active) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-300">
      {/* Golden Radial Glow */}
      <div className="absolute inset-0 bg-radial from-amber-500/20 via-transparent to-transparent animate-pulse" />

      {/* Center Celebration Box */}
      <div className="relative flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-amber-400 bg-gradient-to-b from-card via-card to-background shadow-[0_0_50px_rgba(245,158,11,0.6)] text-center space-y-3 animate-in zoom-in-90 duration-300">
        <div className="size-16 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)]">
          <Sparkles className="size-9 animate-spin" />
        </div>
        <h3 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 tracking-wider">
          {multiplierText}
        </h3>
        <p className="font-mono text-xs text-amber-200/80 font-bold">
          <T korean="축하합니다! 대박 잭팟을 달성했습니다!" english="Congratulations! You hit the JACKPOT!" />
        </p>
      </div>
    </div>
  );
}
