'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/cn';
import { AvatarWithCosmetics, NameplateWithTitle, type UserCosmetics } from '@/components/profile-cosmetics';

export interface HeldItem {
  readonly catalog_id: string;
  readonly code: string;
  readonly name: string;
  readonly description: string;
  readonly category: string;
  readonly quantity: number;
  readonly acquired_at: string;
  readonly expires_at: string | null;
  readonly effect_kind: string;
  readonly rarity: string;
  readonly animation_css: string | null;
  readonly preview_data: Record<string, unknown>;
  readonly is_equipped: boolean;
  readonly equipped_slot: string | null;
  readonly serial_number: number | null;
}

interface InventoryViewProps {
  readonly holdings: HeldItem[];
  readonly currentUsername?: string | undefined;
  readonly userAvatarUrl?: string | null | undefined;
}

const CATEGORIES = [
  { id: 'all', label: '전체' },
  { id: 'frame', label: '프레임' },
  { id: 'background', label: '배경' },
  { id: 'effect', label: '이펙트' },
  { id: 'nameplate', label: '네임플레이트' },
  { id: 'title', label: '칭호' },
  { id: 'badge', label: '배지' },
  { id: 'season', label: '시즌 1' },
  { id: 'limited', label: '한정판' },
  { id: 'business', label: '사업' },
  { id: 'convenience', label: '편의' },
] as const;

export function InventoryView({
  holdings,
  currentUsername = '모험가',
  userAvatarUrl,
}: InventoryViewProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [actionStatus, setActionStatus] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const filtered = holdings.filter((h) => {
    if (selectedCategory === 'all') return true;
    return h.category === selectedCategory;
  });

  // Current active equipped cosmetics
  const equippedFrame = holdings.find((h) => h.is_equipped && h.equipped_slot === 'frame');
  const equippedBg = holdings.find((h) => h.is_equipped && h.equipped_slot === 'background');
  const equippedEffect = holdings.find((h) => h.is_equipped && h.equipped_slot === 'effect');
  const equippedNameplate = holdings.find((h) => h.is_equipped && h.equipped_slot === 'nameplate');
  const equippedTitle = holdings.find((h) => h.is_equipped && h.equipped_slot === 'title');
  const equippedBadges = holdings.filter((h) => h.is_equipped && h.equipped_slot?.startsWith('badge_'));

  const activeCosmetics: UserCosmetics = {
    frame: equippedFrame || null,
    background: equippedBg || null,
    effect: equippedEffect || null,
    nameplate: equippedNameplate || null,
    title: equippedTitle || null,
    badges: equippedBadges.map((b) => ({
      slot: b.equipped_slot || 'badge_1',
      code: b.code,
      name: b.name,
      rarity: b.rarity,
    })),
  };

  const handleToggleEquip = async (item: HeldItem) => {
    setActionStatus(`${item.name} ${item.is_equipped ? '해제' : '장착'} 중...`);
    try {
      const res = await fetch(`/api/v1/shop/holdings/${item.catalog_id}/equip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equip: !item.is_equipped,
          slot: item.category === 'badge' ? 'badge_1' : item.category,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || '장착 설정에 실패했습니다.');
      }

      setActionStatus(`${item.name} ${item.is_equipped ? '해제' : '장착'} 완료!`);
      setTimeout(() => {
        setActionStatus(null);
        startTransition(() => {
          router.refresh();
        });
      }, 800);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '오류가 발생했습니다.';
      setActionStatus(`실패: ${msg}`);
      setTimeout(() => setActionStatus(null), 2500);
    }
  };

  return (
    <div className="grid gap-6">
      {/* Active Equipment Showcase Card */}
      <div
        className={cn(
          'rounded-3xl border border-amber-500/30 p-6 shadow-xl relative overflow-hidden transition-all duration-500 flex flex-col md:flex-row items-center justify-between gap-6',
          equippedBg?.animation_css || 'bg-card',
        )}
      >
        <div className="flex items-center gap-5">
          <AvatarWithCosmetics
            cosmetics={activeCosmetics}
            name={currentUsername}
            src={userAvatarUrl}
            size="xl"
          />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                ACTIVE COSMETICS
              </span>
            </div>
            <NameplateWithTitle cosmetics={activeCosmetics} username={currentUsername} />
            <p className="text-xs text-muted-foreground mt-2">
              보유 중인 치장 아이템: <strong className="text-foreground">{holdings.length}</strong>개 · 
              장착 중: <strong className="text-amber-500">{holdings.filter((h) => h.is_equipped).length}</strong>개
            </p>
          </div>
        </div>

        {/* Quick Slot Indicators */}
        <div className="grid grid-cols-3 gap-2 text-center text-[11px] w-full md:w-auto">
          <div className="p-2 rounded-xl bg-surface/60 border border-border/40 min-w-[70px]">
            <span className="text-muted-foreground block">프레임</span>
            <span className="font-bold text-foreground truncate block">
              {equippedFrame ? equippedFrame.name : '기본'}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-surface/60 border border-border/40 min-w-[70px]">
            <span className="text-muted-foreground block">배경</span>
            <span className="font-bold text-foreground truncate block">
              {equippedBg ? equippedBg.name : '기본'}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-surface/60 border border-border/40 min-w-[70px]">
            <span className="text-muted-foreground block">이펙트</span>
            <span className="font-bold text-foreground truncate block">
              {equippedEffect ? equippedEffect.name : '없음'}
            </span>
          </div>
        </div>
      </div>

      {actionStatus && (
        <div className="p-3 text-center text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-2xl animate-in fade-in">
          {actionStatus}
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count =
            cat.id === 'all'
              ? holdings.length
              : holdings.filter((h) => h.category === cat.id).length;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border whitespace-nowrap',
                isSelected
                  ? 'bg-amber-500 border-amber-500 text-black shadow-sm'
                  : 'bg-card border-border/40 text-muted-foreground hover:bg-surface',
              )}
            >
              <span>{cat.label}</span>
              <span className="ml-1 text-[10px] opacity-75">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Holdings Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/60 p-12 text-center text-muted-foreground bg-card/30">
          <p className="text-sm font-bold">보유한 아이템이 없습니다.</p>
          <p className="text-xs mt-1">상점 2.0에서 마음에 드는 아이템을 둘러보세요!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <div
              key={item.catalog_id}
              className={cn(
                'rounded-2xl border p-4 bg-card flex flex-col justify-between transition-all duration-300 relative',
                item.is_equipped ? 'border-amber-500 shadow-lg shadow-amber-500/10' : 'border-border/40',
                `rarity-${item.rarity}`,
              )}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-surface border border-border/40">
                    {item.rarity}
                  </span>
                  {item.serial_number && (
                    <span className="text-[10px] font-bold text-amber-500">
                      No. #{item.serial_number}
                    </span>
                  )}
                  {item.is_equipped && (
                    <span className="text-[10px] font-bold text-black bg-amber-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="size-3" /> 장착 중
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-sm text-foreground mb-1">{item.name}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-3 border-t border-border/40 flex items-center justify-between gap-2">
                <span className="text-[11px] text-muted-foreground">보유: {item.quantity}개</span>
                {['frame', 'background', 'effect', 'nameplate', 'title', 'badge'].includes(
                  item.category,
                ) ? (
                  <button
                    onClick={() => handleToggleEquip(item)}
                    className={cn(
                      'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1',
                      item.is_equipped
                        ? 'bg-surface hover:bg-muted text-muted-foreground border border-border/50'
                        : 'bg-amber-500 hover:bg-amber-400 text-black shadow-sm',
                    )}
                  >
                    {item.is_equipped ? (
                      <>
                        <RotateCcw className="size-3" /> 해제
                      </>
                    ) : (
                      <>
                        <Check className="size-3" /> 장착
                      </>
                    )}
                  </button>
                ) : (
                  <span className="text-xs font-bold text-muted-foreground">소장품</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
