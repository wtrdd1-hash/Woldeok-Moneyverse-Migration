'use client';

import React, { useState } from 'react';
import { Gavel, Flame, Sparkles, Shield, Clock, Plus, Tag, ArrowUpRight, CheckCircle2, AlertCircle } from 'lucide-react';

export interface AuctionItem {
  id: string;
  title: string;
  category: 'theme' | 'badge' | 'title' | 'booster';
  rarity: 'mythic' | 'legendary' | 'epic' | 'rare';
  seller: string;
  currentBid: number;
  highestBidder: string;
  buyoutPrice: number;
  endsInSeconds: number;
  burnFeePercent: number; // default 5%
  imageUrl?: string;
}

const INITIAL_AUCTIONS: AuctionItem[] = [
  {
    id: 'auc-1',
    title: '황금 호가창 네온 테마 (1기 한정)',
    category: 'theme',
    rarity: 'mythic',
    seller: '월가의늑대',
    currentBid: 75000,
    highestBidder: 'CryptoWhale',
    buyoutPrice: 150000,
    endsInSeconds: 3840,
    burnFeePercent: 5,
  },
  {
    id: 'auc-2',
    title: '다이아몬드 핸즈 움직이는 프로필 뱃지',
    category: 'badge',
    rarity: 'legendary',
    seller: '불패의트레이더',
    currentBid: 32000,
    highestBidder: 'StockMaster',
    buyoutPrice: 60000,
    endsInSeconds: 7200,
    burnFeePercent: 5,
  },
  {
    id: 'auc-3',
    title: '[전설] 시장을 뒤흔드는 자 칭호',
    category: 'title',
    rarity: 'legendary',
    seller: '여의도마스터',
    currentBid: 18000,
    highestBidder: 'DopamineHunter',
    buyoutPrice: 35000,
    endsInSeconds: 1420,
    burnFeePercent: 5,
  },
  {
    id: 'auc-4',
    title: '7일 연속 스트릭 복구 골드 프리즈 팩',
    category: 'booster',
    rarity: 'epic',
    seller: '상점주인',
    currentBid: 8500,
    highestBidder: 'RookieTrader',
    buyoutPrice: 15000,
    endsInSeconds: 10800,
    burnFeePercent: 5,
  },
];

export default function AuctionMarketplacePage() {
  const [items, setItems] = useState<AuctionItem[]>(INITIAL_AUCTIONS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [userBalance, setUserBalance] = useState<number>(250000);
  const [totalBurnedWld, setTotalBurnedWld] = useState<number>(842500);
  const [bidModalItem, setBidModalItem] = useState<AuctionItem | null>(null);
  const [bidAmountInput, setBidAmountInput] = useState<number>(0);
  const [notification, setNotification] = useState<string | null>(null);

  const filteredItems = selectedCategory === 'all'
    ? items
    : items.filter((item) => item.category === selectedCategory);

  const openBidModal = (item: AuctionItem) => {
    setBidModalItem(item);
    setBidAmountInput(item.currentBid + 1000);
  };

  const handlePlaceBid = () => {
    if (!bidModalItem) return;
    if (bidAmountInput <= bidModalItem.currentBid) {
      alert('현재 입찰가보다 높은 금액을 입력해야 합니다.');
      return;
    }
    if (bidAmountInput > userBalance) {
      alert('보유 WLD 잔액이 부족합니다.');
      return;
    }

    const burnAmount = Math.floor(bidAmountInput * 0.05);

    setItems((prev) =>
      prev.map((it) =>
        it.id === bidModalItem.id
          ? {
              ...it,
              currentBid: bidAmountInput,
              highestBidder: '나 (You)',
            }
          : it
      )
    );

    setUserBalance((prev) => prev - (bidAmountInput - bidModalItem.currentBid));
    setTotalBurnedWld((prev) => prev + burnAmount);

    setNotification(
      `🎉 입찰 성공! ${bidAmountInput.toLocaleString()} WLD 입찰 완료 (거래 시 5% ${burnAmount.toLocaleString()} WLD 소각 예정)`
    );
    setBidModalItem(null);
    setTimeout(() => setNotification(null), 4000);
  };

  const getRarityBadge = (rarity: AuctionItem['rarity']) => {
    switch (rarity) {
      case 'mythic':
        return <span className="rounded border border-amber-500/50 bg-amber-500/20 px-2 py-0.5 text-[11px] font-bold text-amber-300">신화 (Mythic)</span>;
      case 'legendary':
        return <span className="rounded border border-purple-500/50 bg-purple-500/20 px-2 py-0.5 text-[11px] font-bold text-purple-300">전설 (Legendary)</span>;
      case 'epic':
        return <span className="rounded border border-cyan-500/50 bg-cyan-500/20 px-2 py-0.5 text-[11px] font-bold text-cyan-300">에픽 (Epic)</span>;
      default:
        return <span className="rounded border border-slate-600 bg-slate-800 px-2 py-0.5 text-[11px] font-bold text-slate-300">희귀 (Rare)</span>;
    }
  };

  const formatSeconds = (sec: number) => {
    const hours = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    return `${hours}시간 ${mins}분`;
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Top Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                <Gavel className="h-6 w-6" />
              </span>
              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                Steam형 P2P 아티팩트 경매장
              </h1>
            </div>
            <p className="mt-1 text-xs text-slate-400 sm:text-sm">
              유저 간 한정판 테마·뱃지·칭호 경매 거래 및 거래 수수료 5% 자동 소각 디플레이션 콘솔
            </p>
          </div>

          {/* Stats Badges */}
          <div className="flex flex-wrap gap-3">
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2">
              <div className="flex items-center gap-1.5 text-xs text-rose-300">
                <Flame className="h-4 w-4" />
                <span>총 소각된 거래 수수료</span>
              </div>
              <div className="font-mono text-base font-bold text-white">
                {totalBurnedWld.toLocaleString()} WLD
              </div>
            </div>

            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2">
              <div className="flex items-center gap-1.5 text-xs text-amber-300">
                <Sparkles className="h-4 w-4" />
                <span>내 보유 잔액</span>
              </div>
              <div className="font-mono text-base font-bold text-white">
                {userBalance.toLocaleString()} WLD
              </div>
            </div>
          </div>
        </div>

        {/* Notification Banner */}
        {notification && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/15 p-3.5 text-xs font-semibold text-emerald-300 shadow">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
          {[
            { id: 'all', label: '전체 아티팩트' },
            { id: 'theme', label: '🎨 호가창 테마' },
            { id: 'badge', label: '💎 프로필 뱃지' },
            { id: 'title', label: '📜 칭호/엠블럼' },
            { id: 'booster', label: '⚡ 부스터/프리즈' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Auction Cards Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
          {filteredItems.map((item) => {
            const burnAmount = Math.floor(item.currentBid * 0.05);
            return (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg transition-all hover:border-slate-700"
              >
                <div>
                  <div className="flex items-center justify-between">
                    {getRarityBadge(item.rarity)}
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{formatSeconds(item.endsInSeconds)} 남음</span>
                    </div>
                  </div>

                  <h3 className="mt-3 text-base font-bold text-white">{item.title}</h3>
                  <div className="mt-1 text-xs text-slate-400">
                    판매자: <span className="font-semibold text-slate-300">{item.seller}</span>
                  </div>

                  {/* Bidding Stats Box */}
                  <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/70 p-3.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">현재 최고 입찰가</span>
                      <span className="font-mono font-bold text-amber-400 text-sm">
                        {item.currentBid.toLocaleString()} WLD
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
                      <span>최고 입찰자</span>
                      <span className="font-semibold text-slate-300">{item.highestBidder}</span>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between border-t border-slate-800/80 pt-2 text-[11px]">
                      <span className="flex items-center gap-1 text-rose-400 font-medium">
                        <Flame className="h-3 w-3" /> 플랫폼 5% 소각 예정액
                      </span>
                      <span className="font-mono font-bold text-rose-300">
                        -{burnAmount.toLocaleString()} WLD
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => openBidModal(item)}
                    className="flex-1 rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-slate-950 shadow hover:bg-amber-400 active:scale-95"
                  >
                    입찰하기 (Bid)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      alert(`즉시 구매가 ${item.buyoutPrice.toLocaleString()} WLD로 결제됩니다.`);
                    }}
                    className="flex-1 rounded-xl border border-slate-700 bg-slate-800 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700"
                  >
                    즉시 구매 ({item.buyoutPrice.toLocaleString()} WLD)
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bid Modal */}
        {bidModalItem && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="auction-bid-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          >
            <div className="relative w-full max-w-md rounded-2xl border border-amber-500/40 bg-slate-900 p-6 text-slate-100 shadow-2xl">
              <h3 id="auction-bid-modal-title" className="text-base font-bold text-white">
                아티팩트 경매 입찰하기
              </h3>
              <p className="mt-1 text-xs text-slate-400">{bidModalItem.title}</p>

              <div className="mt-4 space-y-3">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">현재 최고가:</span>
                    <span className="font-mono font-bold text-amber-400">
                      {bidModalItem.currentBid.toLocaleString()} WLD
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">내 보유 잔액:</span>
                    <span className="font-mono text-slate-200">
                      {userBalance.toLocaleString()} WLD
                    </span>
                  </div>
                </div>

                <div>
                  <label htmlFor="bid-input" className="block text-xs font-semibold text-slate-300">
                    내 입찰 희망 금액 (WLD)
                  </label>
                  <input
                    id="bid-input"
                    type="number"
                    min={bidModalItem.currentBid + 1000}
                    step={1000}
                    value={bidAmountInput}
                    onChange={(e) => setBidAmountInput(Number(e.target.value))}
                    className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-sm text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-xs">
                  <div className="flex items-center justify-between text-rose-300 font-medium">
                    <span className="flex items-center gap-1">
                      <Flame className="h-3.5 w-3.5" /> 5% 거래 수수료 소각
                    </span>
                    <span className="font-mono font-bold">
                      {Math.floor(bidAmountInput * 0.05).toLocaleString()} WLD
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">
                    경매 낙찰 시 플랫폼 가상 경제 안정화를 위해 5%가 즉시 영구 소각됩니다.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => setBidModalItem(null)}
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-800 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-700"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handlePlaceBid}
                  className="flex-1 rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-slate-950 shadow hover:bg-amber-400"
                >
                  입찰 확정
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
