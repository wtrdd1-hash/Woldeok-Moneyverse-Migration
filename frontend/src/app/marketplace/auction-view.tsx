'use client';

import React, { useState, useEffect } from 'react';
import { Gavel, Clock, ShieldCheck, Flame, ArrowUpRight, AlertCircle, CheckCircle2, User, RefreshCw } from 'lucide-react';
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
  readonly buyNowPriceWld?: string;
  readonly endsAt: string; // ISO string
  readonly isExtended?: boolean;
  readonly description: string;
}

interface AuctionViewProps {
  readonly userBalanceWld: string;
  readonly currentUserId?: string;
}

export function AuctionView({ userBalanceWld, currentUserId = 'usr_me' }: AuctionViewProps) {
  // 모의 실시간 경매 매물 목록
  const [auctions, setAuctions] = useState<AuctionListing[]>([
    {
      id: 'auc_01',
      itemName: '제1회 First Capital 기념 골드 메달',
      itemCode: 'ITEM_TROPHY_FIRST_CAPITAL_GOLD',
      category: 'display',
      rarity: 'LEGENDARY',
      sellerId: 'usr_governor',
      sellerName: '초대총독_알렉스',
      startPriceWld: '5000',
      currentBidWld: '8500',
      highestBidderId: 'usr_investor',
      highestBidderName: '월덕헤지펀드',
      bidCount: 7,
      buyNowPriceWld: '15000',
      endsAt: new Date(Date.now() + 1000 * 60 * 45).toISOString(), // 45분 후
      description: '시즌 1 설립자에게만 단 1개 한정 지급된 영구 보존용 골드 명예 트로피 메달입니다.',
    },
    {
      id: 'auc_02',
      itemName: '네온 사이버 하우징 네임플레이트',
      itemCode: 'ITEM_FRAME_NEON_CYBER',
      category: 'nameplate',
      rarity: 'EPIC',
      sellerId: 'usr_crafter',
      sellerName: '장인_마스터킴',
      startPriceWld: '2000',
      currentBidWld: '3400',
      highestBidderId: 'usr_collector',
      highestBidderName: '희귀템사냥꾼',
      bidCount: 5,
      endsAt: new Date(Date.now() + 1000 * 60 * 18).toISOString(), // 18분 후
      description: '클럽하우스 및 개인 룸 출입문에 장착 가능한 네온 애니메이션 특수 네임플레이트.',
    },
    {
      id: 'auc_03',
      itemName: '사업체 고효율 물류 부스트 키트 (대형)',
      itemCode: 'ITEM_BIZ_LOGISTICS_KIT',
      category: 'business',
      rarity: 'RARE',
      sellerId: 'usr_merchant',
      sellerName: '무역상인_박',
      startPriceWld: '1500',
      currentBidWld: '2100',
      highestBidderId: 'usr_me',
      highestBidderName: '나 (현재 최고 입찰자)',
      bidCount: 4,
      buyNowPriceWld: '4000',
      endsAt: new Date(Date.now() + 1000 * 60 * 4).toISOString(), // 4분 후 (스나이핑 연장 가능 구간)
      description: '가상 사업체 원자재 조달 시 운송비 10%를 영구 감면해 주는 고효율 물류 부스트 모듈.',
    },
  ]);

  const [selectedAuction, setSelectedAuction] = useState<AuctionListing | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

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

  // 입찰 제출 실행
  const handleExecuteBid = () => {
    if (!selectedAuction || !bidAmount) return;
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const newBidStr = bidAmount;
      const endsAtDate = Date.parse(selectedAuction.endsAt);
      const isAntiSnipingTriggered = endsAtDate - now < 30 * 1000; // 30초 이내면 60초 자동 연장
      const newEndsAt = isAntiSnipingTriggered
        ? new Date(endsAtDate + 60 * 1000).toISOString()
        : selectedAuction.endsAt;

      // 경매 상태 갱신
      setAuctions((prev) =>
        prev.map((auc) =>
          auc.id === selectedAuction.id
            ? {
                ...auc,
                currentBidWld: newBidStr,
                highestBidderId: currentUserId,
                highestBidderName: '나 (현재 최고 입찰자)',
                bidCount: auc.bidCount + 1,
                endsAt: newEndsAt,
                isExtended: isAntiSnipingTriggered ? true : auc.isExtended,
              }
            : auc,
        ),
      );

      setSuccessNotice(
        `${groupDigits(newBidStr)} WLD 입찰이 안전 에스크로에 잠금되었습니다.${
          isAntiSnipingTriggered ? ' (마감 30초 내 입찰로 60초 자동 연장되었습니다)' : ''
        }`,
      );
    }, 1000);
  };

  const userBalanceBig = BigInt(userBalanceWld || '0');
  const bidAmountBig = bidAmount ? BigInt(bidAmount) : 0n;
  const currentBidBig = selectedAuction ? BigInt(selectedAuction.currentBidWld) : 0n;
  const isValidBid = bidAmountBig > currentBidBig && bidAmountBig <= userBalanceBig;

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
            최고가 공개 호가 입찰 방식으로 진행됩니다. 다른 유저가 상위 입찰 시 이전 입찰자의 WLD는 에스크로에서 즉시 100% 자동 환불되며, 마감 직전 30초 내 신규 입찰 시 60초간 자동 연장됩니다. 낙찰 시 2%의 수수료는 영구 소각(HARD_SINK)됩니다.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div className="text-[11px] text-muted-foreground">내 보유 잔액</div>
            <div className="text-sm font-bold font-mono text-foreground">{groupDigits(userBalanceWld)} WLD</div>
          </div>
        </div>
      </div>

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
                  onClick={() => handleOpenBidModal(auc)}
                  className={`w-full h-10 min-h-[40px] text-xs font-semibold ${
                    isMyBidHighest
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                  }`}
                >
                  {isMyBidHighest ? '내가 최고 입찰 중 (추가 입찰)' : '호가 입찰 참여하기'}
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
                  disabled={!isValidBid || isSubmitting}
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
