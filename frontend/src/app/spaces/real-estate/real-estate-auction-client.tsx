'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Coins,
  TrendingUp,
  Timer,
  Gavel,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import type { LandmarkAuction } from '@/app/api/spaces/real-estate/auction/route';

export function RealEstateAuctionClient() {
  const [auctions, setAuctions] = useState<LandmarkAuction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAuction, setSelectedAuction] = useState<LandmarkAuction | null>(null);
  const [bidAmount, setBidAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [totalUnclaimedRent, setTotalUnclaimedRent] = useState<number>(4990);
  const [isClaiming, setIsClaiming] = useState(false);

  const fetchAuctions = async () => {
    try {
      const res = await fetch('/api/spaces/real-estate/auction');
      const data = await res.json();
      if (data.ok) {
        setAuctions(data.auctions || []);
        if (data.totalUnclaimedRent !== undefined) {
          setTotalUnclaimedRent(data.totalUnclaimedRent);
        }
      }
    } catch {
      // fallback safe
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, []);

  const openBidModal = (auction: LandmarkAuction) => {
    setSelectedAuction(auction);
    const minBid = auction.currentHighestBid + auction.minBidIncrement;
    setBidAmount(minBid.toString());
    setStatusMessage(null);
  };

  const handleBidSubmit = async () => {
    if (!selectedAuction) return;
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/spaces/real-estate/auction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          landmarkId: selectedAuction.id,
          bidAmount: Number(bidAmount),
        }),
      });

      const data = await res.json();
      if (data.ok) {
        setStatusMessage({ type: 'success', text: data.message });
        await fetchAuctions();
        setTimeout(() => {
          setSelectedAuction(null);
        }, 1200);
      } else {
        setStatusMessage({ type: 'error', text: data.error || '입찰에 실패했습니다.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: '네트워크 통신 중 오류가 발생했습니다.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClaimRent = async () => {
    setIsClaiming(true);
    try {
      const res = await fetch('/api/spaces/real-estate/claim-rent', { method: 'POST' });
      const data = await res.json();
      if (data.ok) {
        alert(data.message || '월세 배당금이 수령되었습니다.');
        setTotalUnclaimedRent(0);
        await fetchAuctions();
      } else {
        alert(data.error || '수령 처리에 실패했습니다.');
      }
    } catch {
      alert('월세 배당금 수령 중 오류가 발생했습니다.');
    } finally {
      setIsClaiming(false);
    }
  };

  const formatHoursLeft = (endTimestamp: number) => {
    const diff = endTimestamp - Date.now();
    if (diff <= 0) return '마감됨';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}시간 ${mins}분 남음`;
  };

  return (
    <div className="space-y-6">
      {/* Overview Stat Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs flex items-center justify-between">
              <span>경매 진행 랜드마크</span>
              <Building2 className="size-4 text-indigo-500" />
            </CardDescription>
            <CardTitle className="text-xl font-black font-mono tracking-tight text-foreground">
              4개 프라임 구역
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            강남·여의도·판교·한남
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs flex items-center justify-between">
              <span>내 보유 지분</span>
              <Layers className="size-4 text-emerald-500" />
            </CardDescription>
            <CardTitle className="text-xl font-black font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
              15 주 (Shares)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            전체 랜드마크 지분 3.75% 점유
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs flex items-center justify-between">
              <span>평균 연간 배당률</span>
              <TrendingUp className="size-4 text-sky-500" />
            </CardDescription>
            <CardTitle className="text-xl font-black font-mono tracking-tight text-sky-500">
              연 13.4%
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            도시 상권 수수료 2.5% 일일 적립
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-gradient-to-br from-amber-500/10 via-card to-card border-amber-500/30">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs flex items-center justify-between text-amber-500 font-bold">
              <span>미수령 월세 배당금</span>
              <Coins className="size-4 text-amber-500" />
            </CardDescription>
            <CardTitle className="text-xl font-black font-mono tracking-tight text-amber-500 flex items-center justify-between">
              <span>{totalUnclaimedRent.toLocaleString()} WLD</span>
              <Button
                size="sm"
                variant="default"
                disabled={totalUnclaimedRent <= 0 || isClaiming}
                onClick={handleClaimRent}
                className="h-7 text-xs bg-amber-500 hover:bg-amber-600 text-white font-bold"
              >
                {isClaiming ? '수령 중...' : '일괄 수령'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            매일 자정 원자적 자동 정산
          </CardContent>
        </Card>
      </div>

      {/* Landmark Auction Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Gavel className="size-5 text-indigo-500" />
            <span>메가시티 4대 프라임 랜드마크 경매 (Landmark Auctions)</span>
          </h2>
          <span className="text-xs text-muted-foreground">실시간 호가 입찰 & 자동 연장 가드</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">경매 데이터를 불러오는 중...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {auctions.map((auction) => (
              <Card key={auction.id} className="border-border/60 bg-card/80 hover:border-indigo-500/40 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <Badge variant="outline" className="border-indigo-500/40 bg-indigo-500/10 text-indigo-500 text-xs font-bold">
                      {auction.districtBadge}
                    </Badge>
                    <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
                      <Timer className="size-3.5 text-rose-500" />
                      <span>{formatHoursLeft(auction.endTimestamp)}</span>
                    </div>
                  </div>
                  <CardTitle className="text-base sm:text-lg font-bold text-foreground">
                    {auction.name}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground [word-break:keep-all]">
                    {auction.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 pt-0">
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-muted/40 border border-border/40 text-xs">
                    <div>
                      <div className="text-muted-foreground text-[11px]">현재 최고 입찰가</div>
                      <div className="text-sm font-black font-mono text-foreground mt-0.5">
                        {auction.currentHighestBid.toLocaleString()} <span className="text-[10px] text-muted-foreground font-normal">WLD</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5 truncate">
                        선두: {auction.leaderNickname}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-[11px]">연간 기대 배당률</div>
                      <div className="text-sm font-black font-mono text-emerald-500 mt-0.5">
                        연 {auction.annualYieldRate}%
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        내 지분: {auction.userShares}주 (미수령: {auction.unclaimedRent.toLocaleString()} WLD)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <ShieldCheck className="size-3.5 text-indigo-500" />
                      <span>최소 입찰단위 +{auction.minBidIncrement.toLocaleString()} WLD</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => openBidModal(auction)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-8 px-4"
                    >
                      <Gavel className="size-3.5 mr-1.5" />
                      입찰하기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Bid Modal Dialog */}
      {selectedAuction && (
        <Dialog open={!!selectedAuction} onOpenChange={(open) => !open && setSelectedAuction(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-indigo-500/40 bg-indigo-500/10 text-indigo-500 text-xs">
                  {selectedAuction.districtBadge}
                </Badge>
                <DialogTitle className="text-lg font-bold">{selectedAuction.name}</DialogTitle>
              </div>
              <DialogDescription className="text-xs">
                실시간 경매에 최고가 입찰하여 랜드마크의 지분을 획득하고 매일 임대료 배당을 수령하세요.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="p-3 rounded-lg bg-muted/40 border border-border/50 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">현재 최고 입찰가</span>
                  <span className="font-mono font-bold text-foreground">{selectedAuction.currentHighestBid.toLocaleString()} WLD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">최소 입찰 가능액</span>
                  <span className="font-mono font-bold text-emerald-500">
                    {(selectedAuction.currentHighestBid + selectedAuction.minBidIncrement).toLocaleString()} WLD
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">마감 기한</span>
                  <span className="font-mono text-muted-foreground">{formatHoursLeft(selectedAuction.endTimestamp)}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">내 입찰 금액 (WLD)</label>
                <Input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="font-mono text-sm"
                  placeholder="입찰할 WLD 금액을 입력하세요"
                />
              </div>

              {/* Quick Bid Preset Buttons */}
              <div className="flex gap-2">
                {[10000, 50000, 100000].map((inc) => (
                  <Button
                    key={inc}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs font-mono h-7"
                    onClick={() => {
                      const cur = Number(bidAmount) || selectedAuction.currentHighestBid;
                      setBidAmount((cur + inc).toString());
                    }}
                  >
                    +{inc.toLocaleString()}
                  </Button>
                ))}
              </div>

              {statusMessage && (
                <div
                  className={`p-2.5 rounded text-xs flex items-center gap-2 ${
                    statusMessage.type === 'success'
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                  }`}
                >
                  {statusMessage.type === 'success' ? (
                    <CheckCircle2 className="size-4 shrink-0" />
                  ) : (
                    <AlertCircle className="size-4 shrink-0" />
                  )}
                  <span>{statusMessage.text}</span>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="ghost" size="sm" onClick={() => setSelectedAuction(null)}>
                취소
              </Button>
              <Button
                variant="default"
                size="sm"
                disabled={isSubmitting}
                onClick={handleBidSubmit}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
              >
                {isSubmitting ? '입찰 제출 중...' : '최고가 입찰 확정'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
