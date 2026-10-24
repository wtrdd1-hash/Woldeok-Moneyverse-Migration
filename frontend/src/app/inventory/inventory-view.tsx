'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { Check, RotateCcw } from 'lucide-react';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { IDLE } from '@/lib/action-state';
import { equipHeldItem } from './actions';
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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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


  return (
    <div className="grid gap-6">
      {/* Active Equipment Showcase Card */}
      <div
        className={cn(
          'rounded-3xl border border-amber-500/30 p-6 shadow-xl relative overflow-hidden transition-all duration-500 flex flex-col md:flex-row items-center justify-between gap-6',
          equippedBg?.animation_css || 'bg-card',
        )}
      >
        <div className="flex w-full min-w-0 items-center gap-4 sm:gap-5">
          <AvatarWithCosmetics
            cosmetics={activeCosmetics}
            name={currentUsername}
            src={userAvatarUrl}
            size="xl"
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
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
          <div className="p-2 rounded-xl bg-surface/60 border border-border/40 min-w-0">
            <span className="text-muted-foreground block">프레임</span>
            <span className="font-bold text-foreground truncate block">
              {equippedFrame ? equippedFrame.name : '기본'}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-surface/60 border border-border/40 min-w-0">
            <span className="text-muted-foreground block">배경</span>
            <span className="font-bold text-foreground truncate block">
              {equippedBg ? equippedBg.name : '기본'}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-surface/60 border border-border/40 min-w-0">
            <span className="text-muted-foreground block">이펙트</span>
            <span className="font-bold text-foreground truncate block">
              {equippedEffect ? equippedEffect.name : '없음'}
            </span>
          </div>
        </div>
      </div>

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
              aria-pressed={isSelected}
              className={cn(
                'min-h-11 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2',
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
          <Link href="/shop/catalog" className="mt-4 inline-flex min-h-11 items-center rounded-xl border border-border bg-card px-4 text-sm font-bold text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500">아이템 상점 보기</Link>
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
                  <EquipControl item={item} />
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

/** Each card owns its action state; only a verified PostgreSQL receipt reports success. */
function EquipControl({ item }: { readonly item: HeldItem }) {
  const [state, action] = useActionState(equipHeldItem, IDLE);
  const equip = !item.is_equipped;
  const slot = item.is_equipped && item.equipped_slot
    ? item.equipped_slot
    : item.category === 'badge' ? 'badge_1' : item.category;
  return (
    <div className="grid min-w-0 gap-2">
      <form action={action}>
        <input type="hidden" name="catalogId" value={item.catalog_id} />
        <input type="hidden" name="slot" value={slot} />
        <input type="hidden" name="equip" value={String(equip)} />
        <SubmitButton
          variant={equip ? 'default' : 'outline'}
          className="h-11 min-h-11 max-w-full text-xs focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {equip ? <Check aria-hidden="true" className="size-3" /> : <RotateCcw aria-hidden="true" className="size-3" />}
          {equip ? '장착' : '해제'} <span className="sr-only">{item.name}</span>
        </SubmitButton>
      </form>
      <ActionAlert state={state} />
    </div>
  );
}
