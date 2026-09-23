'use client';

import React, { useState, useEffect } from 'react';
import { Gavel, Clock, ShieldCheck, Flame, CheckCircle2, User, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { groupDigits } from '@/lib/money';

export interface AuctionListing {
  readonly id: string;
  readonly itemName: string;
  readonly itemCode: string;
  readonly category: string;
  readonly rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  readonly sellerId: string;
  readonly sellerName: string;
  readonly startPriceWld: string;
  readonly currentBidWld: string;
  readonly highestBidderId: string | null;
  readonly highestBidderName: string | null;
  readonly bidCount: number;
  readonly buyNowPriceWld?: string | undefined;
  readonly endsAt: string; // ISO string
  readonly isExtended?: boolean | undefined;
  readonly description: string;
}

interface AuctionViewProps {
  readonly userBalanceWld: string;
  readonly currentUserId?: string;
}

export function AuctionView({ userBalanceWld, currentUserId = 'usr_me' }: AuctionViewProps) {
  const [auctions, setAuctions] = useState<AuctionListing[]>([]);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');

  const [selectedAuction, setSelectedAuction] = useState<AuctionListing | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  // 실제 백엔드 경매 매물 목록 로드
  useEffect(() => {
    let cancelled = false;
    async function loadAuctions() {
      try {
        const res = await fetch('/api/v1/marketplace/auctions');
        if (!res.ok) throw new Error('auction list request failed');
        const data = await res.json();
        if (!cancelled) {
          setAuctions(Array.isArray(data) ? data : []);
          setLoadState('ready');
        }
      } catch {
        if (!cancelled) {
          setAuctions([]);
          setLoadState('error');
        }
      }
    }
    loadAuctions();
    return () => {
      cancelled = true;
    };
  }, []);

  // 1초마다 남은 시간 타이머 갱신
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 남은 시간 계산 함수
  const getRemainingTime = (endsAtStr: string) => {
    const diff = Math.max(0, Date.parse(endsAtStr) - now);
    const totalSecs = Math.floor(diff / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    if (mins >= 60) {
      const hours = Math.floor(mins / 60);
      const remMins = mins % 60;
      return `${hours}시간 ${remMins}분`;
    }
    return `${mins}분 ${secs < 10 ? '0' : ''}${secs}초`;
  };

  const isClosingSoon = (endsAtStr: string) => {
    const diff = Math.max(0, Date.parse(endsAtStr) - now);
    return diff <= 1000 * 60 * 5; // 5분 이내
  };

  // 입찰 모달 열기
  const handleOpenBidModal = (item: AuctionListing) => {
    setSelectedAuction(item);
    const currentBidBig = BigInt(item.currentBidWld);
    // 최소 입찰가: 현재 최고가 + 5% or +50 WLD
    const minIncrement = (currentBidBig * 5n) / 100n;
    const nextMinBid = currentBidBig + (minIncrement > 50n ? minIncrement : 50n);
    setBidAmount(nextMinBid.toString());
    setSuccessNotice(null);
  };

  // 입찰 제출 실행 (서버 API 연동)
  const handleExecuteBid = async () => {
    if (!selectedAuction || !bidAmount) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/v1/marketplace/auctions/${selectedAuction.id}/bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bidAmountWld: bidAmount }),
      });

      const endsAtDate = Date.parse(selectedAuction.endsAt);
      const isAntiSnipingTriggered = endsAtDate - now < 30 * 1000;
      const newEndsAt = isAntiSnipingTriggered
        ? new Date(endsAtDate + 60 * 1000).toISOString()
        : selectedAuction.endsAt;

      if (!res.ok) throw new Error('auction bid request failed');
      const result = await res.json();
      setAuctions((prev) =>
        prev.map((auc) => {
          if (auc.id !== selectedAuction.id) return auc;
          return {
            ...auc,
            currentBidWld: result.currentBidWld ?? bidAmount,
            highestBidderId: currentUserId,
            highestBidderName: '나 (현재 최고 입찰자)',
            bidCount: result.bidCount ?? auc.bidCount + 1,
            endsAt: result.endsAt ?? newEndsAt,
            isExtended: result.isExtended ?? isAntiSnipingTriggered,
          };
        }),
      );

      setSuccessNotice(
        `${groupDigits(bidAmount)} WLD 입찰이 안전 에스크로에 잠금되었습니다.${
          isAntiSnipingTriggered ? ' (마감 30초 내 입찰로 60초 자동 연장되었습니다)' : ''
        }`,
      );
    } catch {
      setSuccessNotice('입찰이 서버에 반영되지 않았습니다. 잔액과 경매 상태를 새로고침한 뒤 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };


  const currentBidBig = selectedAuction ? BigInt(selectedAuction.currentBidWld) : 0n;

  return (
    <div className="grid gap-6">
      {/* 잉글리시 옥션 룰 안내 헤더 배너 */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-primary/10 text-primary">
              <Gavel className="size-4.5" />
            </span>
            <h3 className="font-semibold text-sm sm:text-base text-foreground">
              에스크로 실시간 잉글리시 경매 (English Auction)
            </h3>
            <Badge variant="outline" className="text-[11px] font-mono border-primary/30 text-primary">
              Anti-Sniping 활성
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            현재 경매 목록은 조회만 제공합니다. 아이템 에스크로·낙찰 정산·원장 기록이 완성될 때까지 신규 경매 및 입찰은 일시 중지되어 있습니다.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div className="text-[11px] text-muted-foreground">내 보유 잔액</div>
            <div className="text-sm font-bold font-mono text-foreground">{groupDigits(userBalanceWld)} WLD</div>
          </div>
        </div>
      </div>

      {loadState === 'loading' && (
        <div className="rounded-xl border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
          서버 경매 목록을 불러오는 중입니다.
        </div>
      )}
      {loadState === 'error' && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          경매 목록을 불러오지 못했습니다. 임시·예시 매물은 표시하지 않습니다.
        </div>
      )}
      {loadState === 'ready' && auctions.length === 0 && (
        <div className="rounded-xl border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
          현재 진행 중인 서버 경매가 없습니다.
        </div>
      )}

      {/* 실시간 경매 매물 목록 그리드 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {auctions.map((auc) => {
          const closingSoon = isClosingSoon(auc.endsAt);
          const isMyBidHighest = auc.highestBidderId === currentUserId;

          return (
            <Card
              key={auc.id}
              className={`h-full min-h-[340px] flex flex-col justify-between overflow-hidden transition-all duration-150 border ${
                closingSoon
                  ? 'border-amber-500/50 shadow-amber-500/5 shadow-md'
                  : 'border-border/80 hover:border-border'
              }`}
            >
              <CardHeader className="p-4 sm:p-5 pb-3">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-semibold tracking-wider uppercase ${
                      auc.rarity === 'LEGENDARY'
                        ? 'border-amber-500/40 text-amber-600 bg-amber-500/10'
                        : auc.rarity === 'EPIC'
                        ? 'border-purple-500/40 text-purple-600 bg-purple-500/10'
                        : 'border-blue-500/40 text-blue-600 bg-blue-500/10'
                    }`}
                  >
                    {auc.rarity}
                  </Badge>

                  <div
                    className={`flex items-center gap-1 text-xs font-mono font-medium px-2 py-0.5 rounded-full ${
                      closingSoon
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold animate-pulse'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <Clock className="size-3" />
                    <span>{getRemainingTime(auc.endsAt)}</span>
                  </div>
                </div>

                <CardTitle className="text-base truncate font-semibold">{auc.itemName}</CardTitle>
                <CardDescription className="text-xs line-clamp-2 min-h-[32px] text-muted-foreground mt-1">
                  {auc.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 sm:p-5 pt-0 flex-1 space-y-3">
                {/* 현재 호가 및 입찰 정보 박스 */}
                <div className="rounded-lg bg-muted/40 p-3 border border-border/60 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">현재 최고 호가</span>
                    <span className="text-xs font-mono text-muted-foreground">
                      입찰 {auc.bidCount}회
                    </span>
                  </div>
                  <div className="text-xl font-bold font-mono text-primary flex items-baseline gap-1">
                    {groupDigits(auc.currentBidWld)} <span className="text-xs font-sans font-normal text-muted-foreground">WLD</span>
                  </div>

                  <div className="text-[11px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/40">
                    <span className="flex items-center gap-1">
                      <User className="size-3" />
                      최고 입찰자:
                    </span>
                    <span
                      className={`font-medium truncate max-w-[120px] ${
                        isMyBidHighest ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-foreground'
                      }`}
                    >
                      {auc.highestBidderName || '없음'}
                    </span>
                  </div>
                </div>

                {/* 스나이핑 연장 알림 배지 */}
                {auc.isExtended && (
                  <div className="text-[11px] font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded">
                    <Flame className="size-3 shrink-0" />
                    <span>스나이핑 방지로 경매가 자동 연장되었습니다</span>
                  </div>
                )}
              </CardContent>

              <CardFooter className="pt-2 pb-4 px-4 sm:px-5 shrink-0 flex flex-col gap-2">
                <Button
                  disabled
                  onClick={() => handleOpenBidModal(auc)}
                  className={`w-full h-10 min-h-[40px] text-xs font-semibold ${
                    isMyBidHighest
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                  }`}
                >
                  {isMyBidHighest ? '입찰 정산 재검증 중' : '입찰 일시 중지'}
                </Button>

                {auc.buyNowPriceWld && (
                  <div className="w-full flex items-center justify-between text-[11px] text-muted-foreground px-1">
                    <span>즉시 낙찰가:</span>
                    <span className="font-mono font-bold text-foreground">
                      {groupDigits(auc.buyNowPriceWld)} WLD
                    </span>
                  </div>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* 입찰 확인 및 수수료 안내 다이얼로그 */}
      {selectedAuction && (
        <Dialog open={!!selectedAuction} onOpenChange={() => setSelectedAuction(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                <Gavel className="size-4 text-primary" />
                <span>경매 호가 입찰</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                [{selectedAuction.itemName}] 물품에 안전 에스크로 호가 입찰을 진행합니다.
              </DialogDescription>
            </DialogHeader>

            {successNotice ? (
              <div className="py-6 text-center space-y-3">
                <div className="size-12 rounded-full bg-emerald-500/10 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="size-6" />
                </div>
                <p className="text-sm font-semibold text-foreground">{successNotice}</p>
                <p className="text-xs text-muted-foreground">
                  다른 모험가가 상위 입찰 시 본 입찰금은 1초 내에 지갑으로 자동 반환됩니다.
                </p>
                <Button
                  onClick={() => setSelectedAuction(null)}
                  className="w-full mt-4 bg-primary text-primary-foreground"
                >
                  확인 완료
                </Button>
              </div>
            ) : (
              <div className="space-y-4 py-2">
                {/* 현재 경매 현황 요약 */}
                <div className="rounded-lg bg-muted/40 p-3 border border-border/60 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">현재 최고가</span>
                    <span className="font-mono font-bold">{groupDigits(selectedAuction.currentBidWld)} WLD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">출품자</span>
                    <span className="font-medium">{selectedAuction.sellerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">경매 마감까지</span>
                    <span className="font-mono text-primary font-semibold">
                      {getRemainingTime(selectedAuction.endsAt)}
                    </span>
                  </div>
                </div>

                {/* 내 입찰가 입력 */}
                <div className="space-y-1.5">
                  <label htmlFor="bid-amount-input" className="text-xs font-semibold text-foreground">
                    내 입찰 금액 (WLD)
                  </label>
                  <div className="relative">
                    <Input
                      id="bid-amount-input"
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="font-mono text-sm pr-12"
                      placeholder="입찰할 WLD 금액 입력"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground">
                      WLD
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>최소 입찰 가능 금액: {groupDigits(currentBidBig + 50n)} WLD</span>
                    <span>내 잔액: {groupDigits(userBalanceWld)} WLD</span>
                  </div>
                </div>

                {/* 에스크로 환불 보장 안내 박스 */}
                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs space-y-1 text-emerald-800 dark:text-emerald-300">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <ShieldCheck className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>안전 에스크로 환불 보장</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-emerald-700/90 dark:text-emerald-300/90">
                    입찰금은 시스템 에스크로에 안전하게 보관되며, 상위 입찰 발생 시 즉시 전액 환불됩니다. 최종 낙찰 시에만 물품이 내 인벤토리로 지급됩니다.
                  </p>
                </div>
              </div>
            )}

            {!successNotice && (
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={() => setSelectedAuction(null)}
                  disabled={isSubmitting}
                  className="text-xs"
                >
                  취소
                </Button>
                <Button
                  onClick={handleExecuteBid}
                  disabled
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="mr-1.5 size-3.5 animate-spin" />
                      에스크로 락 처리 중...
                    </>
                  ) : (
                    `${groupDigits(bidAmount || '0')} WLD 입찰 확정`
                  )}
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
