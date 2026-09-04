'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ShoppingBag,
  Eye,
  Check,
  Shield,
  Layers,
  Award,
  Crown,
  Building,
  Zap,
  Tag,
  Clock,
  Coins,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { AvatarWithCosmetics, NameplateWithTitle, type UserCosmetics } from '@/components/profile-cosmetics';

export interface CatalogItem {
  readonly catalog_id: string;
  readonly code: string;
  readonly name: string;
  readonly description: string;
  readonly category: string;
  readonly price: string;
  readonly quantity: number | null;
  readonly purchase_limit: string;
  readonly effect_kind: string;
  readonly maintenance_cost: string;
  readonly sale_ends_at: string | null;
  readonly rarity: string;
  readonly animation_css: string | null;
  readonly preview_data: Record<string, unknown>;
  readonly max_stock: number | null;
  readonly is_limited: boolean;
  readonly user_owned_quantity: number;
  readonly user_is_equipped: boolean;
}

interface ShopStoreViewProps {
  readonly items: CatalogItem[];
  readonly userBalance: string;
  readonly currentUsername?: string | undefined;
  readonly userAvatarUrl?: string | null | undefined;
}

const CATEGORIES = [
  { id: 'all', label: '전체', icon: Layers },
  { id: 'frame', label: '프레임', icon: Shield },
  { id: 'background', label: '배경', icon: Layers },
  { id: 'effect', label: '이펙트', icon: Sparkles },
  { id: 'nameplate', label: '네임플레이트', icon: Tag },
  { id: 'title', label: '칭호', icon: Crown },
  { id: 'badge', label: '배지', icon: Award },
  { id: 'season', label: '시즌 1', icon: Clock },
  { id: 'limited', label: '한정판', icon: Sparkles },
  { id: 'business', label: '사업', icon: Building },
  { id: 'convenience', label: '편의', icon: Zap },
] as const;

export function ShopStoreView({
  items,
  userBalance,
  currentUsername = '모험가',
  userAvatarUrl,
}: ShopStoreViewProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewItem, setPreviewItem] = useState<CatalogItem | null>(null);
  const [buyingItem, setBuyingItem] = useState<CatalogItem | null>(null);
  const [buyQuantity, setBuyQuantity] = useState<number>(1);
  const [buyStatus, setBuyStatus] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const balanceNum = Number(userBalance) || 0;

  const filteredItems = items.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  const handleBuy = async (item: CatalogItem) => {
    setBuyStatus('구매 처리 중...');
    try {
      const idempotencyKey = crypto.randomUUID();
      const res = await fetch(`/api/v1/shop/catalog/${item.catalog_id}/purchases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idempotencyKey, quantity: buyQuantity }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || '구매에 실패했습니다.');
      }

      setBuyStatus('구매가 완료되었습니다!');
      setTimeout(() => {
        setBuyingItem(null);
        setBuyStatus(null);
        startTransition(() => {
          router.refresh();
        });
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '오류가 발생했습니다.';
      setBuyStatus(`실패: ${msg}`);
    }
  };

  // Build composite preview data for fitting room
  const fittingCosmetics: UserCosmetics | null = previewItem
    ? {
        frame: previewItem.category === 'frame' ? previewItem : null,
        background: previewItem.category === 'background' ? previewItem : null,
        effect: previewItem.category === 'effect' ? previewItem : null,
        nameplate: previewItem.category === 'nameplate' ? previewItem : null,
        title: previewItem.category === 'title' ? previewItem : null,
      }
    : null;

  return (
    <div className="grid gap-6">
      {/* Category Navigation Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          const count =
            cat.id === 'all'
              ? items.length
              : items.filter((i) => i.category === cat.id).length;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border',
                isSelected
                  ? 'bg-amber-500 border-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'bg-card border-border/40 text-muted-foreground hover:bg-surface hover:text-foreground',
              )}
            >
              <Icon className="size-3.5" />
              <span>{cat.label}</span>
              <span
                className={cn(
                  'text-[10px] px-1.5 py-0.2 rounded-full font-semibold',
                  isSelected ? 'bg-black/20 text-black' : 'bg-muted text-muted-foreground',
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.map((item) => {
          const isOwned = item.user_owned_quantity > 0;
          const isLimited = item.is_limited;
          const priceNum = Number(item.price);
          const canAfford = balanceNum >= priceNum;

          return (
            <div
              key={item.catalog_id}
              className={cn(
                'group relative rounded-2xl border p-4 bg-card flex flex-col justify-between transition-all duration-300 hover:shadow-lg',
                `rarity-${item.rarity}`,
              )}
            >
              <div>
                {/* Header: Rarity Tag & Limit */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={cn(
                      'text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md tracking-wider',
                      item.rarity === 'mythic' && 'bg-red-500/20 text-red-400 border border-red-500/30',
                      item.rarity === 'legendary' && 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
                      item.rarity === 'epic' && 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
                      item.rarity === 'rare' && 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
                      item.rarity === 'uncommon' && 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
                      item.rarity === 'common' && 'bg-zinc-500/20 text-zinc-400 border border-zinc-500/30',
                    )}
                  >
                    {item.rarity}
                  </span>
                  {isLimited && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                      <Sparkles className="size-3" />
                      LIMITED {item.quantity !== null ? `${item.quantity}개` : ''}
                    </span>
                  )}
                </div>

                {/* Cosmetic Mini Showcase */}
                <div className="h-28 rounded-xl bg-surface/70 border border-border/30 flex items-center justify-center p-3 relative overflow-hidden mb-3">
                  {item.category === 'frame' && (
                    <AvatarWithCosmetics
                      cosmetics={{ frame: item }}
                      name={currentUsername}
                      size="md"
                    />
                  )}
                  {item.category === 'background' && (
                    <div
                      className={cn(
                        'size-full rounded-lg flex items-center justify-center text-xs font-bold shadow-inner',
                        item.animation_css,
                      )}
                    >
                      <span className="text-white drop-shadow-md">{item.name}</span>
                    </div>
                  )}
                  {item.category === 'effect' && (
                    <div className="relative">
                      <AvatarWithCosmetics
                        cosmetics={{ effect: item }}
                        name={currentUsername}
                        size="md"
                      />
                    </div>
                  )}
                  {item.category === 'nameplate' && (
                    <NameplateWithTitle cosmetics={{ nameplate: item }} username={currentUsername} />
                  )}
                  {item.category === 'title' && (
                    <span className="text-sm font-extrabold text-amber-400 tracking-wider px-3 py-1 rounded bg-black/40 border border-amber-500/30">
                      {item.name}
                    </span>
                  )}
                  {['badge', 'season', 'limited', 'business', 'convenience', 'general'].includes(
                    item.category,
                  ) && (
                    <div className="text-3xl filter drop-shadow-lg">
                      {item.category === 'badge' && '🏅'}
                      {item.category === 'season' && '🌙'}
                      {item.category === 'limited' && '💎'}
                      {item.category === 'business' && '🏢'}
                      {item.category === 'convenience' && '⚡'}
                      {item.category === 'general' && '📦'}
                    </div>
                  )}
                </div>

                {/* Item Info */}
                <h3 className="font-bold text-sm text-foreground mb-1">{item.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3">
                  {item.description}
                </p>
              </div>

              {/* Bottom: Price & Action */}
              <div className="pt-3 border-t border-border/40">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-muted-foreground">가격</span>
                  <div className="flex items-center gap-1 font-extrabold text-sm text-amber-500">
                    <Coins className="size-4 text-amber-500" />
                    <span>{Number(item.price).toLocaleString()} WLD</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewItem(item)}
                    className="flex-1 py-2 rounded-xl text-xs font-bold bg-surface hover:bg-muted text-muted-foreground hover:text-foreground border border-border/50 flex items-center justify-center gap-1 transition-all"
                  >
                    <Eye className="size-3.5" />
                    <span>미리보기</span>
                  </button>

                  {isOwned && item.purchase_limit === 'account_one' ? (
                    <button
                      disabled
                      className="flex-1 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center gap-1"
                    >
                      <Check className="size-3.5" />
                      <span>보유 중</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setBuyingItem(item);
                        setBuyQuantity(1);
                        setBuyStatus(null);
                      }}
                      className={cn(
                        'flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-sm',
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20'
                          : 'bg-muted text-muted-foreground border border-border/40 cursor-not-allowed',
                      )}
                    >
                      <ShoppingBag className="size-3.5" />
                      <span>구매</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Fitting Room Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-amber-500/30 bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="size-5 text-amber-500" />
                <h3 className="text-base font-bold text-foreground">피팅룸 · 실시간 착용 미리보기</h3>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Fitting Showcase */}
            <div
              className={cn(
                'rounded-2xl border border-border/40 p-6 flex flex-col items-center justify-center gap-4 my-4 relative overflow-hidden transition-all',
                fittingCosmetics?.background?.animation_css || 'bg-surface/50',
              )}
            >
              <AvatarWithCosmetics
                cosmetics={fittingCosmetics}
                name={currentUsername}
                src={userAvatarUrl}
                size="xl"
              />
              <NameplateWithTitle
                cosmetics={fittingCosmetics}
                username={currentUsername}
              />
            </div>

            <div className="text-center mb-5">
              <h4 className="font-bold text-base text-foreground">{previewItem.name}</h4>
              <p className="text-xs text-muted-foreground mt-1">{previewItem.description}</p>
              <div className="flex items-center justify-center gap-1 font-extrabold text-amber-500 text-lg mt-2">
                <Coins className="size-5 text-amber-500" />
                <span>{Number(previewItem.price).toLocaleString()} WLD</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setPreviewItem(null)}
                className="flex-1 py-2.5 rounded-xl border border-border/50 text-xs font-bold text-muted-foreground hover:bg-surface"
              >
                닫기
              </button>
              <button
                onClick={() => {
                  setBuyingItem(previewItem);
                  setPreviewItem(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold shadow-md shadow-amber-500/20"
              >
                이 아이템 구매하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Buy Confirmation Dialog */}
      {buyingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-foreground mb-2">아이템 구매 확인</h3>
            <p className="text-xs text-muted-foreground mb-4">
              구매 금액은 시스템 소각 계정(SYSTEM_SINK)으로 100% 영구 소각 처리됩니다.
            </p>

            <div className="rounded-2xl border border-border/50 bg-surface/50 p-4 mb-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-foreground">{buyingItem.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{buyingItem.category}</p>
              </div>
              <div className="text-right">
                <p className="font-extrabold text-sm text-amber-500">
                  {Number(buyingItem.price).toLocaleString()} WLD
                </p>
                <p className="text-[11px] text-muted-foreground">내 잔액: {balanceNum.toLocaleString()} WLD</p>
              </div>
            </div>

            {buyStatus && (
              <div className="mb-4 text-center text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl py-2">
                {buyStatus}
              </div>
            )}

            <div className="flex gap-2">
              <button
                disabled={Boolean(buyStatus)}
                onClick={() => setBuyingItem(null)}
                className="flex-1 py-2.5 rounded-xl border border-border/50 text-xs font-bold text-muted-foreground hover:bg-surface disabled:opacity-50"
              >
                취소
              </button>
              <button
                disabled={Boolean(buyStatus) || balanceNum < Number(buyingItem.price)}
                onClick={() => handleBuy(buyingItem)}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold shadow-md shadow-amber-500/20 disabled:opacity-50"
              >
                {balanceNum < Number(buyingItem.price) ? '잔액 부족' : '확인 및 결제'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
