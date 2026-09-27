'use client';

import React, { useEffect, useState } from 'react';

export type VipNeonTheme = 'royal-gold' | 'cyber-pink' | 'emerald-vault' | 'sapphire-deep' | 'obsidian-dark';

export interface VipThemeOption {
  readonly id: VipNeonTheme;
  readonly name: string;
  readonly description: string;
  readonly badgeBg: string;
  readonly borderClass: string;
  readonly auraColor: string;
  readonly previewGlow: string;
}

export const VIP_THEME_OPTIONS: readonly VipThemeOption[] = [
  {
    id: 'royal-gold',
    name: '로얄 골드',
    description: '황실 귀족의 찬란한 황금빛 오라',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    borderClass: 'border-amber-500/60 shadow-[0_0_18px_rgba(245,158,11,0.28)]',
    auraColor: 'from-amber-500 to-yellow-300',
    previewGlow: 'bg-gradient-to-r from-amber-500 to-yellow-400',
  },
  {
    id: 'cyber-pink',
    name: '사이버 핑크',
    description: '네오 서울 사이버펑크 네온 레이저',
    badgeBg: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40',
    borderClass: 'border-fuchsia-500/60 shadow-[0_0_18px_rgba(217,70,239,0.28)]',
    auraColor: 'from-fuchsia-500 to-cyan-400',
    previewGlow: 'bg-gradient-to-r from-fuchsia-500 to-cyan-400',
  },
  {
    id: 'emerald-vault',
    name: '에메랄드 볼트',
    description: '스위스 프라이빗 금고의 신비로운 에메랄드',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    borderClass: 'border-emerald-500/60 shadow-[0_0_18px_rgba(16,185,129,0.28)]',
    auraColor: 'from-emerald-400 to-teal-300',
    previewGlow: 'bg-gradient-to-r from-emerald-400 to-teal-400',
  },
  {
    id: 'sapphire-deep',
    name: '사파이어 딥',
    description: '심해의 차분하고 지적인 코발트 사파이어',
    badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    borderClass: 'border-sky-500/60 shadow-[0_0_18px_rgba(14,165,233,0.28)]',
    auraColor: 'from-indigo-400 to-sky-400',
    previewGlow: 'bg-gradient-to-r from-indigo-500 to-sky-400',
  },
  {
    id: 'obsidian-dark',
    name: '옵시디언 다크',
    description: '절제된 미니멀리즘 매트 흑요석 프레임',
    badgeBg: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/40',
    borderClass: 'border-zinc-400/60 shadow-[0_0_18px_rgba(161,161,170,0.28)]',
    auraColor: 'from-zinc-300 to-zinc-500',
    previewGlow: 'bg-gradient-to-r from-zinc-200 to-zinc-400',
  },
];

interface VipThemeSelectorProps {
  readonly isPlusUser?: boolean;
  readonly selectedTheme: VipNeonTheme;
  readonly onSelectTheme: (theme: VipNeonTheme) => void;
}

export function VipThemeSelector({
  isPlusUser = true,
  selectedTheme,
  onSelectTheme,
}: VipThemeSelectorProps) {
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('moneyverse_vip_neon_theme') as VipNeonTheme | null;
    if (saved && VIP_THEME_OPTIONS.some((t) => t.id === saved)) {
      onSelectTheme(saved);
    }
  }, [onSelectTheme]);

  const handleSelect = (themeId: VipNeonTheme) => {
    if (!isPlusUser) return;
    onSelectTheme(themeId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('moneyverse_vip_neon_theme', themeId);
    }
  };

  if (!mounted) return null;

  return (
    <div className="rounded-xl border border-border/80 bg-card/80 backdrop-blur-md p-4 space-y-3">
      <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-foreground">Plus VIP 네온 테마</span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            5종 프리미엄
          </span>
        </div>
        <span className="text-xs text-muted-foreground">경매장 & 호가창 실시간 적용</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {VIP_THEME_OPTIONS.map((theme) => {
          const isSelected = selectedTheme === theme.id;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => handleSelect(theme.id)}
              disabled={!isPlusUser}
              className={`relative flex flex-col items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                isSelected
                  ? `${theme.borderClass} bg-card ring-2 ring-primary/40`
                  : 'border-border/60 bg-muted/30 hover:bg-muted/60 hover:border-border'
              } ${!isPlusUser ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="w-full flex items-center justify-between gap-1 mb-1.5">
                <span className={`h-3 w-3 rounded-full ${theme.previewGlow} shadow-sm shrink-0`} />
                {isSelected && (
                  <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-primary/20 text-primary">
                    ACTIVE
                  </span>
                )}
              </div>
              <div className="w-full">
                <div className="text-xs font-bold text-foreground truncate">{theme.name}</div>
                <div className="text-[10px] text-muted-foreground truncate leading-tight mt-0.5">
                  {theme.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
