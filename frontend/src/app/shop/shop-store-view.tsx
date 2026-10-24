'use client';

import React, { useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { buyStoreItem } from './store-actions';
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
import { compareAmounts, groupDigits } from '@/lib/money';
import { FiatBadge } from '@/components/fiat-amount';
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
  readonly signedIn: boolean;
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
  signedIn,
}: ShopStoreViewProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewItem, setPreviewItem] = useState<CatalogItem | null>(null);
  const [buyingItem, setBuyingItem] = useState<CatalogItem | null>(null);
  const [buyQuantity, setBuyQuantity] = useState<number>(1);
  const [buyStatus, setBuyStatus] = useState<string | null>(null);
  const [buyPending, setBuyPending] = useState(false);
  const [buySucceeded, setBuySucceeded] = useState(false);
  const [buyIntent, setBuyIntent] = useState<{ itemId: string; key: string } | null>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const buyDialogRef = useRef<HTMLDivElement>(null);
  const buyOpenerRef = useRef<HTMLElement | null>(null);
  const [, startTransition] = useTransition();


  const filteredItems = items.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  const openBuy = (item: CatalogItem) => {
    buyOpenerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setBuyingItem(item);
    setBuyQuantity(1);
    setBuyStatus(null);
    setBuySucceeded(false);
    // An unresolved charge must not acquire a new key merely because the dialog was closed.
    setBuyIntent((previous) => previous?.itemId === item.catalog_id
      ? previous
      : { itemId: item.catalog_id, key: crypto.randomUUID() });
  };

  const closeBuy = () => {
    setBuyingItem(null);
    queueMicrotask(() => buyOpenerRef.current?.focus());
  };

  const handleBuy = async (item: CatalogItem) => {
    if (!signedIn || buyPending || buySucceeded || !buyIntent || buyIntent.itemId !== item.catalog_id) return;
    setBuyPending(true);
    setBuyStatus('서버에서 결제 결과를 확인하는 중...');
    try {
      const result = await buyStoreItem(item.catalog_id, buyQuantity, buyIntent.key);
      if (result.status !== 'ok') {
        setBuyStatus(`${result.message ?? '구매 상태를 확인할 수 없습니다.'} 동일한 요청으로 재시도할 수 있습니다.`);
        return;
      }
      setBuySucceeded(true);
      setBuyStatus(result.message ?? '서버에서 구매 영수증을 확인했습니다.');
      setBuyIntent(null);
      startTransition(() => router.refresh());
    } catch {
      // A lost server-action response does not prove a failed charge; keep the same key.
      setBuyStatus('결제 결과를 확인하지 못했어요. 동일한 요청으로 재시도하거나 지갑 거래 내역을 확인해 주세요.');
    } finally {
      setBuyPending(false);
    }
  };

  useEffect(() => {
    if (!buyingItem) return;
    confirmRef.current?.focus();
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !buyPending) closeBuy();
      if (event.key !== 'Tab') return;
      const controls = Array.from(buyDialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled),a[href]') ?? []);
      const first = controls[0];
      const last = controls.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, [buyingItem, buyPending, buySucceeded]);

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

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewItem(item)}
                    className="flex-1 py-2 rounded-xl text-xs font-bold bg-surface hover:bg-muted text-muted-foreground hover:text-foreground border border-border/50 flex items-center justify-center gap-1 transition-all"
                  >
                    <Eye className="size-3.5" />
                    <span>미리보기</span>
                  </button>

                  {!signedIn ? (
                    <Link href="/login" className="flex-1 min-h-11 rounded-xl border border-border px-3 py-2 text-center text-xs font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                      로그인 후 구매
                    </Link>
                  ) : isOwned && item.purchase_limit === 'account_one' ? (
                    <button
                      disabled
                      className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-emerald-300 bg-emerald-50 py-2 text-xs font-bold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200"
                    >
                      <Check className="size-3.5" />
                      <span>보유 중</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => openBuy(item)}
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
                <Sparkles className="size-5 text-amber-700 dark:text-amber-300" />
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
              <div className="flex items-center justify-center gap-1 font-extrabold text-amber-700 dark:text-amber-300 text-lg mt-2">
                <Coins className="size-5 text-amber-700 dark:text-amber-300" />
                <span>{groupDigits(previewItem.price)} WLD</span>
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
                  openBuy(previewItem);
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
          <div ref={buyDialogRef} role="dialog" aria-modal="true" aria-labelledby="shop-buy-title" aria-describedby="shop-buy-description" className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 id="shop-buy-title" className="text-base font-bold text-foreground mb-2">아이템 구매 확인</h3>
            <p id="shop-buy-description" className="text-xs text-muted-foreground mb-4">
              화면 가격은 참고용이며 서버가 최종 가격과 재고를 확인합니다. 구매 금액은 시스템 소각 계정(SYSTEM_SINK)으로 100% 영구 소각 처리됩니다.
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
              <div role="status" aria-live="polite" className="mb-4 text-center text-xs font-bold text-amber-800 bg-amber-50 border border-amber-300 dark:bg-amber-950/50 dark:text-amber-200 dark:border-amber-800 rounded-xl py-2">
                {buyStatus}
              </div>
            )}

            <div className="flex gap-2">
              <button
                disabled={buyPending}
                onClick={closeBuy}
                className="flex-1 min-h-11 py-2.5 rounded-xl border border-border/50 text-xs font-bold text-muted-foreground hover:bg-surface disabled:opacity-50"
              >
                취소
              </button>
              <button
                ref={confirmRef}
                disabled={buyPending || buySucceeded || compareAmounts(userBalance, buyingItem.price) < 0}
                onClick={() => void handleBuy(buyingItem)}
                className="flex-1 min-h-11 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold shadow-md shadow-amber-500/20 disabled:opacity-50"
              >
                {buyPending ? '결제 확인 중' : buySucceeded ? '영수증 확인됨' : compareAmounts(userBalance, buyingItem.price) < 0 ? '잔액 부족' : buyStatus ? '같은 요청 재확인' : '확인 및 결제'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
