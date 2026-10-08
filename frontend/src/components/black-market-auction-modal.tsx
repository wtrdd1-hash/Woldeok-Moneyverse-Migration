'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Clock,
  Sparkles,
  Flame,
  ShieldCheck,
  Crown,
  History,
  AlertCircle,
  CheckCircle2,
  X,
  Gavel,
  RefreshCw,
  Coins,
  ArrowUpRight,
} from 'lucide-react';
import { cn } from '@/lib/cn';

export interface BlackMarketAuctionItem {
  id: string;
  itemCode: string;
  itemTitle: string;
  itemDescription: string;
  itemIcon: string;
  itemBuffType: string;
  itemBuffValue: number;
  startsAt: string;
  endsAt: string;
  startingBid: number;
  currentBid: number;
  highestBidderId: string | null;
  highestBidderName: string | null;
  bidCount: number;
  status: 'scheduled' | 'active' | 'ended' | 'settled';
  isMine?: boolean;
  remainingSeconds?: number;
}

export interface BidLog {
  id: string;
  auctionId: string;
  bidderUserId: string;
  bidderName: string;
  bidAmount: number;
  createdAt: string;
}

interface BlackMarketAuctionModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly currentUserId?: string | undefined;
  readonly userBalance?: number | undefined;
  readonly onBalanceUpdate?: ((newBalance: number) => void) | undefined;
}

export function BlackMarketAuctionModal({
  isOpen,
  onClose,
  currentUserId,
  userBalance = 0,
  onBalanceUpdate,
}: BlackMarketAuctionModalProps) {
  const [auctions, setAuctions] = useState<BlackMarketAuctionItem[]>([]);
  const [selectedAuction, setSelectedAuction] = useState<BlackMarketAuctionItem | null>(null);
  const [bidLogs, setBidLogs] = useState<BidLog[]>([]);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // 경매 목록 조회
  const fetchAuctions = async () => {
    try {
      const res = await fetch('/api/market/secret-auction');
      if (res.ok) {
        const data = await res.json();
        const list: BlackMarketAuctionItem[] = data.auctions || [];
        setAuctions(list);
        if (list.length > 0) {
          // 현재 선택된 경매 업데이트 또는 첫 번째 경매 기본 선택
          setSelectedAuction((prev) => {
            if (!prev) return list[0] ?? null;
            const updated = list.find((a) => a.id === prev.id);
            return updated ?? list[0] ?? null;
          });
        }
      }
    } catch {
      // ignore
    }
  };

  // 선택된 경매의 입찰 로그 조회
  const fetchBidLogs = async (auctionId: string) => {
    try {
      const res = await fetch(`/api/market/secret-auction/${auctionId}/bid`);
      if (res.ok) {
        const data = await res.json();
        setBidLogs(data.logs || []);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAuctions();
      const interval = setInterval(fetchAuctions, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedAuction) {
      fetchBidLogs(selectedAuction.id);
      const minIncrement = Math.max(10000, Math.round(selectedAuction.currentBid * 0.05));
      setBidAmount(selectedAuction.currentBid + minIncrement);
    }
  }, [selectedAuction?.id, selectedAuction?.currentBid]);

  // 입찰 실행
  const handlePlaceBid = async () => {
    if (!selectedAuction) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    const minIncrement = Math.max(10000, Math.round(selectedAuction.currentBid * 0.05));
    const minRequired = selectedAuction.currentBid + minIncrement;

    if (bidAmount < minRequired) {
      setErrorMsg(`최소 입찰 가능 금액은 ${minRequired.toLocaleString()} WLD 입니다.`);
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch(`/api/market/secret-auction/${selectedAuction.id}/bid`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bidAmount }),
        });

        const data = await res.json();
        if (!res.ok) {
          setErrorMsg(data.error || '입찰에 실패했습니다.');
          return;
        }

        setSuccessMsg(
          data.extended
            ? `입찰 성공! 마감 30초 전 입찰로 인해 경매가 30초 연장되었습니다.`
            : `입찰 성공! 현재 최고 입찰가: ${bidAmount.toLocaleString()} WLD`,
        );

        fetchAuctions();
        fetchBidLogs(selectedAuction.id);
      } catch {
        setErrorMsg('네트워크 오류가 발생했습니다.');
      }
    });
  };

  const formatTimer = (seconds?: number) => {
    if (seconds === undefined || seconds <= 0) return '종료됨';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-full p-0 overflow-hidden bg-card border-border shadow-2xl rounded-2xl flex flex-col max-h-[90vh]">
        {/* 상단 헤더 */}
        <div className="relative border-b border-border/80 bg-zinc-950/70 p-5 sm:p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Crown className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  심야 비밀 암시장 한정 경매
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-purple-400">
                    <Sparkles className="h-3 w-3" /> 매일 심야 오픈
                  </span>
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  서버 유일의 초희귀 영구 버프/치장 아이템 실시간 잉글리시 옥션. 낙찰 대금은 100% 영구 국고 소각!
                </DialogDescription>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-muted-foreground hover:bg-zinc-800 hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* 바디 콘텐츠: 2열 레이아웃 */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 좌측 1열: 출품 아이템 목록 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                진행 중인 옥션 ({auctions.length})
              </span>
              <button
                onClick={fetchAuctions}
                disabled={isPending}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className={cn('h-3 w-3', isPending && 'animate-spin')} />
              </button>
            </div>

            <div className="space-y-2.5">
              {auctions.map((item) => {
                const isSelected = selectedAuction?.id === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedAuction(item)}
                    className={cn(
                      'w-full text-left p-3.5 rounded-xl border transition-all flex flex-col gap-1.5',
                      isSelected
                        ? 'border-purple-500 bg-purple-500/10 shadow-sm'
                        : 'border-border/70 bg-zinc-900/40 hover:border-border text-muted-foreground',
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground truncate">{item.itemTitle}</span>
                      <span className="text-[10px] font-mono text-purple-400 font-semibold flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimer(item.remainingSeconds)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[11px] text-muted-foreground">현재 최고가</span>
                      <span className="text-xs font-bold font-mono text-amber-400">
                        {item.currentBid.toLocaleString()} WLD
                      </span>
                    </div>

                    {item.isMine && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold mt-0.5">
                        <CheckCircle2 className="h-3 w-3" /> 내가 최고 입찰자
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* 영구 소각 안내 뱃지 */}
            <div className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5 text-xs text-rose-400 space-y-1">
              <span className="font-bold flex items-center gap-1.5">
                <Flame className="h-4 w-4" /> 100% 영구 통화 소각 (Burn)
              </span>
              <p className="text-[11px] text-muted-foreground">
                경매 종료 시 낙찰자가 지불한 WLD는 전액 시스템 SINK 원장으로 이동하여 시장에서 영구히 소각됩니다.
              </p>
            </div>
          </div>

          {/* 우측 2열: 선택된 경매 상세 및 입찰 패널 */}
          <div className="lg:col-span-2 space-y-5">
            {errorMsg && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-500 text-xs sm:text-sm font-medium">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 text-xs sm:text-sm font-medium">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {selectedAuction && (
              <>
                {/* 상단 아이템 프리뷰 카드 */}
                <div className="rounded-2xl border border-border/80 bg-zinc-950 p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 block mb-1">
                        초희귀 신화급 아이템 (MYTHIC)
                      </span>
                      <h3 className="text-xl font-black text-foreground">{selectedAuction.itemTitle}</h3>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {selectedAuction.itemDescription}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-zinc-500 block">남은 경매 시간</span>
                      <span className="text-lg font-black font-mono text-purple-400 flex items-center gap-1.5 justify-end">
                        <Clock className="h-4 w-4 animate-pulse" />
                        {formatTimer(selectedAuction.remainingSeconds)}
                      </span>
                    </div>
                  </div>

                  {/* 호가 메트릭 */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-border/60">
                    <div className="p-3 rounded-xl bg-zinc-900/60 border border-border/50">
                      <span className="text-[10px] text-zinc-500 block">현재 최고 입찰가</span>
                      <span className="text-base font-black font-mono text-amber-400 mt-0.5 block">
                        {selectedAuction.currentBid.toLocaleString()} WLD
                      </span>
                      <span className="text-[10px] text-zinc-400 truncate block mt-0.5">
                        입찰자: {selectedAuction.highestBidderName || '없음'}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-900/60 border border-border/50">
                      <span className="text-[10px] text-zinc-500 block">시작 입찰가</span>
                      <span className="text-base font-bold font-mono text-foreground mt-0.5 block">
                        {selectedAuction.startingBid.toLocaleString()} WLD
                      </span>
                      <span className="text-[10px] text-zinc-500 block mt-0.5">
                        총 입찰 {selectedAuction.bidCount}회
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-900/60 border border-border/50 col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-zinc-500 block">안티 스나이핑 가드</span>
                      <span className="text-xs font-semibold text-emerald-400 mt-0.5 flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5" /> 30초 자동 연장
                      </span>
                      <span className="text-[10px] text-zinc-500 block mt-0.5">마감 직전 입찰 방어</span>
                    </div>
                  </div>
                </div>

                {/* 입찰 조작 폼 */}
                <div className="rounded-2xl border border-border/80 bg-zinc-900/40 p-4 sm:p-5 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      내 입찰 금액 입력 (최소 단위 +5%)
                    </label>
                    <span className="text-xs font-mono text-muted-foreground">
                      보유 잔액: <strong className="text-foreground">{userBalance.toLocaleString()} WLD</strong>
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      min={selectedAuction.currentBid + Math.max(10000, Math.round(selectedAuction.currentBid * 0.05))}
                      step={10000}
                      value={bidAmount}
                      onChange={(e) => setBidAmount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full rounded-xl border border-border/80 bg-zinc-950 px-4 py-3 text-lg font-mono font-bold text-foreground focus:border-purple-500 focus:outline-none"
                    />
                    <span className="absolute right-4 top-3.5 text-sm font-bold text-purple-400">WLD</span>
                  </div>

                  {/* 퀵 호가 버튼 */}
                  <div className="flex flex-wrap gap-1.5">
                    {[10000, 50000, 100000, 500000].map((inc) => (
                      <button
                        key={inc}
                        type="button"
                        onClick={() => setBidAmount((prev) => prev + inc)}
                        className="px-2.5 py-1 rounded-lg border border-border/60 bg-zinc-900 text-[11px] font-mono text-zinc-300 hover:text-foreground hover:border-purple-500/50 transition-colors"
                      >
                        +{inc.toLocaleString()}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const minInc = Math.max(10000, Math.round(selectedAuction.currentBid * 0.05));
                        setBidAmount(selectedAuction.currentBid + minInc);
                      }}
                      className="px-2.5 py-1 rounded-lg border border-border/60 bg-zinc-900 text-[11px] text-zinc-400 hover:text-foreground transition-colors"
                    >
                      최소 호가로 초기화
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handlePlaceBid}
                    disabled={isPending}
                    className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-all shadow-lg active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    <Gavel className="h-4 w-4" />
                    {bidAmount.toLocaleString()} WLD 입찰하기
                  </button>
                </div>

                {/* 최근 입찰 히스토리 로그 */}
                <div className="rounded-2xl border border-border/80 bg-zinc-950/60 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <History className="h-3.5 w-3.5" /> 실시간 호가 로그 (최근 20건)
                    </span>
                    <span className="text-[11px] text-zinc-500">{bidLogs.length}건 기록됨</span>
                  </div>

                  {bidLogs.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-3 text-center">
                      아직 입찰 내역이 없습니다. 첫 번째 입찰자가 되어보세요!
                    </p>
                  ) : (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {bidLogs.map((log, idx) => (
                        <div
                          key={log.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/40 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className={cn('font-bold', idx === 0 ? 'text-purple-400' : 'text-zinc-500')}>
                              #{idx + 1}
                            </span>
                            <span className="font-semibold text-foreground">{log.bidderName}</span>
                            {idx === 0 && (
                              <span className="text-[10px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded font-semibold">
                                최고가
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-amber-400 font-bold">
                            {log.bidAmount.toLocaleString()} WLD
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
