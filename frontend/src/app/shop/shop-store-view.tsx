'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { createPortal } from 'react-dom';
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
  X,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { compareAmounts, groupDigits } from '@/lib/money';
import { FiatBadge } from '@/components/fiat-amount';
import { AvatarWithCosmetics, NameplateWithTitle, type UserCosmetics } from '@/components/profile-cosmetics';
import { buyCatalogItemDirect } from './actions';
import { ShopComparePanel } from './shop-compare-panel';

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
  readonly allowCompare?: boolean;
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
  allowCompare = false,
  userBalance,
  currentUsername = '모험가',
  userAvatarUrl,
}: ShopStoreViewProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [comparisonIds, setComparisonIds] = useState<string[]>([]);
  const [previewItem, setPreviewItem] = useState<CatalogItem | null>(null);
  const [buyingItem, setBuyingItem] = useState<CatalogItem | null>(null);
  const [buyQuantity, setBuyQuantity] = useState<number>(1);
  const [buyStatus, setBuyStatus] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard shortcut: Escape to close open modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !buyStatus) {
        setBuyingItem(null);
        setPreviewItem(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [buyStatus]);

  const filteredItems = items.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  const toggleComparison = (catalogId: string) => {
    setComparisonIds((previous) => previous.includes(catalogId)
      ? previous.filter((id) => id !== catalogId)
      : [...previous.slice(-1), catalogId]);
  };

  const handleBuy = async (item: CatalogItem) => {
    setBuyStatus('구매 처리 중...');
    try {
      const result = await buyCatalogItemDirect(item.catalog_id, buyQuantity);
      if (!result.success) {
        throw new Error(result.message);
      }

      setBuyStatus(result.message);
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

      {allowCompare ? <ShopComparePanel selectedIds={comparisonIds} /> : null}

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.map((item) => {
          const isOwned = item.user_owned_quantity > 0;
          const isLimited = item.is_limited;
          const canAfford = compareAmounts(userBalance, item.price) >= 0;

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
                      item.rarity === 'mythic' && 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/50 dark:text-red-200 dark:border-red-800',
                      item.rarity === 'legendary' && 'bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-200 dark:border-amber-800',
                      item.rarity === 'epic' && 'bg-purple-50 text-purple-800 border border-purple-200 dark:bg-purple-950/50 dark:text-purple-200 dark:border-purple-800',
                      item.rarity === 'rare' && 'bg-blue-50 text-blue-800 border border-blue-200 dark:bg-blue-950/50 dark:text-blue-200 dark:border-blue-800',
                      item.rarity === 'uncommon' && 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-200 dark:border-emerald-800',
                      item.rarity === 'common' && 'bg-zinc-100 text-zinc-800 border border-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700',
                    )}
                  >
                    {item.rarity}
                  </span>
                  {isLimited && (
                    <span className="flex items-center gap-1 rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
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
                    <span className="rounded border border-amber-700 bg-neutral-900 px-3 py-1 text-sm font-extrabold tracking-wider text-amber-200">
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
                <div className="flex items-center justify-between mb-3 flex-wrap gap-1">
                  <span className="text-xs text-muted-foreground">가격</span>
                  <div className="flex items-center gap-1.5 font-extrabold text-sm text-amber-700 dark:text-amber-300 flex-wrap">
                    <Coins className="size-4 text-amber-700 dark:text-amber-300" />
                    <span>{groupDigits(item.price)} WLD</span>
                    <FiatBadge amount={item.price} />
                  </div>
                </div>

                {allowCompare ? (
                  <button
                    type="button"
                    aria-pressed={comparisonIds.includes(item.catalog_id)}
                    onClick={() => toggleComparison(item.catalog_id)}
                    className="mb-2 w-full rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    {comparisonIds.includes(item.catalog_id) ? '비교 선택 해제' : '비교에 추가'}
                  </button>
                ) : null}
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
                      className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-emerald-300 bg-emerald-50 py-2 text-xs font-bold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200"
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

      {/* Fitting Room Modal - Isolated via Portal */}
      {mounted &&
        previewItem &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="피팅룸 실시간 착용 미리보기"
            onClick={() => setPreviewItem(null)}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md my-auto rounded-3xl border border-amber-500/30 bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-5 text-amber-700 dark:text-amber-300" />
                  <h3 className="text-base font-bold text-foreground">피팅룸 · 실시간 착용 미리보기</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewItem(null)}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-surface hover:text-foreground transition-colors"
                  aria-label="닫기"
                >
                  <X className="size-4" />
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
                <div className="flex items-center justify-center gap-1 font-extrabold text-amber-700 dark:text-amber-300 text-lg mt-2">
                  <Coins className="size-5 text-amber-700 dark:text-amber-300" />
                  <span>{groupDigits(previewItem.price)} WLD</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewItem(null)}
                  className="flex-1 py-2.5 rounded-xl border border-border/50 text-xs font-bold text-muted-foreground hover:bg-surface transition-colors"
                >
                  닫기
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBuyingItem(previewItem);
                    setPreviewItem(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold shadow-md shadow-amber-500/20 transition-all"
                >
                  이 아이템 구매하기
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Buy Confirmation Dialog - Isolated via Portal */}
      {mounted &&
        buyingItem &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="아이템 구매 확인 다이얼로그"
            onClick={() => !buyStatus && setBuyingItem(null)}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md my-auto rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-foreground">아이템 구매 확인</h3>
                <button
                  type="button"
                  disabled={Boolean(buyStatus)}
                  onClick={() => setBuyingItem(null)}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-surface hover:text-foreground disabled:opacity-30 transition-colors"
                  aria-label="닫기"
                >
                  <X className="size-4" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                구매 금액은 시스템 소각 계정(SYSTEM_SINK)으로 100% 영구 소각 처리됩니다.
              </p>

              <div className="rounded-2xl border border-border/50 bg-surface/50 p-4 mb-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-foreground">{buyingItem.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{buyingItem.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-sm text-amber-700 dark:text-amber-300">
                    {groupDigits(buyingItem.price)} WLD
                  </p>
                  <p className="text-[11px] text-muted-foreground">내 잔액: {groupDigits(userBalance)} WLD</p>
                </div>
              </div>

              {buyStatus && (
                <div className="mb-4 text-center text-xs font-bold text-amber-800 bg-amber-50 border border-amber-300 dark:bg-amber-950/50 dark:text-amber-200 dark:border-amber-800 rounded-xl py-2">
                  {buyStatus}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={Boolean(buyStatus)}
                  onClick={() => setBuyingItem(null)}
                  className="flex-1 py-2.5 rounded-xl border border-border/50 text-xs font-bold text-muted-foreground hover:bg-surface disabled:opacity-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="button"
                  disabled={Boolean(buyStatus) || compareAmounts(userBalance, buyingItem.price) < 0}
                  onClick={() => handleBuy(buyingItem)}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold shadow-md shadow-amber-500/20 disabled:opacity-50 transition-all"
                >
                  {compareAmounts(userBalance, buyingItem.price) < 0 ? '잔액 부족' : '확인 및 결제'}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
