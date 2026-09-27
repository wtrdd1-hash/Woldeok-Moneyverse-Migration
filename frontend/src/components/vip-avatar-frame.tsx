'use client';

import React from 'react';
import type { VipThemeId } from './vip-theme-selector';

export interface VipAvatarFrameProps {
  readonly theme?: VipThemeId | string | null | undefined;
  readonly isPlusUser?: boolean;
  readonly size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly showBadge?: boolean;
}

const SIZE_STYLES = {
  xs: 'w-6 h-6 p-[1.5px]',
  sm: 'w-8 h-8 p-[2px]',
  md: 'w-10 h-10 p-[2.5px]',
  lg: 'w-14 h-14 p-[3px]',
  xl: 'w-20 h-20 p-[3.5px]',
};

const THEME_FRAME_STYLES: Record<
  VipThemeId,
  {
    border: string;
    glow: string;
    badgeBg: string;
    badgeText: string;
    label: string;
  }
> = {
  'royal-gold': {
    border: 'border-amber-400 ring-2 ring-amber-400/50',
    glow: 'shadow-[0_0_10px_rgba(245,158,11,0.45)]',
    badgeBg: 'bg-amber-500 text-black',
    badgeText: 'GOLD',
    label: '로얄 골드',
  },
  'cyber-pink': {
    border: 'border-fuchsia-400 ring-2 ring-fuchsia-400/50',
    glow: 'shadow-[0_0_10px_rgba(217,70,239,0.45)]',
    badgeBg: 'bg-fuchsia-500 text-white',
    badgeText: 'CYBER',
    label: '사이버 핑크',
  },
  'emerald-vault': {
    border: 'border-emerald-400 ring-2 ring-emerald-400/50',
    glow: 'shadow-[0_0_10px_rgba(16,185,129,0.45)]',
    badgeBg: 'bg-emerald-500 text-black',
    badgeText: 'VAULT',
    label: '에메랄드 볼트',
  },
  'sapphire-deep': {
    border: 'border-sky-400 ring-2 ring-sky-400/50',
    glow: 'shadow-[0_0_10px_rgba(14,165,233,0.45)]',
    badgeBg: 'bg-sky-500 text-white',
    badgeText: 'DEEP',
    label: '사파이어 딥',
  },
  'obsidian-dark': {
    border: 'border-zinc-300 ring-2 ring-zinc-400/30',
    glow: 'shadow-[0_0_10px_rgba(212,212,216,0.35)]',
    badgeBg: 'bg-zinc-800 text-zinc-100 border border-zinc-600',
    badgeText: 'OBSIDIAN',
    label: '옵시디언 다크',
  },
};

export function VipAvatarFrame({
  theme,
  isPlusUser = false,
  size = 'md',
  children,
  className = '',
  showBadge = false,
}: VipAvatarFrameProps) {
  // If not plus user and no theme specified, render standard container
  const activeThemeId = (theme as VipThemeId) || 'royal-gold';
  const themeStyle = THEME_FRAME_STYLES[activeThemeId] || THEME_FRAME_STYLES['royal-gold'];
  const sizeClass = SIZE_STYLES[size] || SIZE_STYLES.md;

  if (!isPlusUser && !theme) {
    return (
      <div className={`relative inline-flex items-center justify-center shrink-0 rounded-full ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full border ${themeStyle.border} ${themeStyle.glow} ${sizeClass} transition-all duration-300 ${className}`}
      data-testid="vip-avatar-frame"
      data-theme={activeThemeId}
    >
      <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
        {children}
      </div>

      {showBadge && (
        <span
          className={`absolute -bottom-1 -right-1 px-1 py-[1px] text-[8px] font-bold tracking-tighter rounded-full leading-none shrink-0 ${themeStyle.badgeBg} shadow-sm`}
        >
          {themeStyle.badgeText}
        </span>
      )}
    </div>
  );
}
