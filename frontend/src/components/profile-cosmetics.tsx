'use client';

import Image from 'next/image';
import React from 'react';
import { cn } from '@/lib/cn';

export interface CosmeticItemData {
  readonly code: string;
  readonly name: string;
  readonly rarity?: string | undefined;
  readonly animation_css?: string | null | undefined;
  readonly preview_data?: Record<string, unknown> | undefined;
}

export interface UserCosmetics {
  readonly frame?: CosmeticItemData | null | undefined;
  readonly background?: CosmeticItemData | null | undefined;
  readonly effect?: CosmeticItemData | null | undefined;
  readonly nameplate?: CosmeticItemData | null | undefined;
  readonly title?: CosmeticItemData | null | undefined;
  readonly badges?:
    | Array<{
        readonly slot: string;
        readonly code: string;
        readonly name: string;
        readonly rarity?: string | undefined;
      }>
    | undefined;
}

interface AvatarWithCosmeticsProps {
  readonly cosmetics?: UserCosmetics | null | undefined;
  readonly src?: string | null | undefined;
  readonly name?: string | undefined;
  readonly size?: 'sm' | 'md' | 'lg' | 'xl' | undefined;
  readonly className?: string | undefined;
}

const SIZE_CLASSES = {
  sm: 'size-9 text-xs',
  md: 'size-14 text-sm',
  lg: 'size-20 text-lg',
  xl: 'size-28 text-2xl',
};

export function AvatarWithCosmetics({
  cosmetics,
  src,
  name = 'User',
  size = 'md',
  className,
}: AvatarWithCosmeticsProps) {
  const frameClass = cosmetics?.frame?.animation_css || '';
  const effectClass = cosmetics?.effect?.animation_css || '';
  const initial = (name || 'U').slice(0, 1).toUpperCase();

  return (
    <div className={cn('relative inline-flex items-center justify-center select-none', className)}>
      {/* Effect Layer */}
      <div className={cn('relative rounded-full flex items-center justify-center', effectClass)}>
        {/* Frame Layer */}
        <div
          className={cn(
            'relative rounded-full overflow-hidden flex items-center justify-center transition-all duration-300',
            SIZE_CLASSES[size],
            frameClass ? frameClass : 'border-2 border-border/50 bg-surface',
          )}
        >
          {src ? (
            <Image
              src={src}
              alt={name}
              fill
              sizes="112px"
              unoptimized
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              className="object-cover rounded-full"
            />
          ) : (
            <div className="size-full flex items-center justify-center bg-gradient-to-br from-amber-500/20 to-amber-700/30 text-foreground font-bold">
              {initial}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface NameplateWithTitleProps {
  readonly cosmetics?: UserCosmetics | null | undefined;
  readonly username: string;
  readonly className?: string | undefined;
}

export function NameplateWithTitle({ cosmetics, username, className }: NameplateWithTitleProps) {
  const nameplateClass = cosmetics?.nameplate?.animation_css || '';
  const title = cosmetics?.title?.name || '';
  const badges = cosmetics?.badges || [];

  return (
    <div className={cn('inline-flex flex-col gap-1', className)}>
      {title && (
        <span className="text-[11px] font-bold tracking-wider text-amber-500/90 flex items-center gap-1">
          {title}
        </span>
      )}
      <div
        className={cn(
          'inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-sm font-semibold transition-all',
          nameplateClass ? nameplateClass : 'bg-surface/60 border border-border/40 text-foreground',
        )}
      >
        <span>{username}</span>
        {badges.length > 0 && (
          <div className="flex items-center gap-1 ml-1">
            {badges.map((b) => (
              <span
                key={b.code}
                title={b.name}
                className="text-xs px-1.5 py-0.5 rounded bg-black/40 border border-white/10"
              >
                🏅
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
