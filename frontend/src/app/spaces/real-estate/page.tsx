'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Landmark,
  Coins,
  ShieldCheck,
  TrendingUp,
  Hammer,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  MapPin,
  Flame,
  Award,
  DollarSign,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { PREMIER_LAND_PARCELS, calculateRealEstateTax, type VirtualLandParcel } from '@moneyverse/contract';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { groupDigits } from '@/lib/money';

export default function RealEstatePage() {
  const [parcels, setParcels] = useState<readonly VirtualLandParcel[]>(PREMIER_LAND_PARCELS);
  const [selectedParcel, setSelectedParcel] = useState<VirtualLandParcel | null>(PREMIER_LAND_PARCELS[0] ?? null);
  const [claimedWld, setClaimedWld] = useState<number>(0);
  const [claimSuccessMsg, setClaimSuccessMsg] = useState<string | null>(null);
  const [isUpgrading, setIsUpgrading] = useState<boolean>(false);

  // 일일 패시브 임대료 즉시 수령 핸들러
  const handleClaimRent = (parcel: VirtualLandParcel) => {
    const reward = parcel.dailyEstimatedWld;
    setClaimedWld((prev) => prev + reward);
    setClaimSuccessMsg(`${parcel.name}에서 일일 패시브 임대료 +${groupDigits(reward)} WLD를 성공적으로 정산 수령하였습니다!`);
    setTimeout(() => {
      setClaimSuccessMsg(null);
    }, 4000);
  };

  // 상업시설 업그레이드 핸들러
  const handleUpgradeBuilding = (parcelId: string) => {
    setIsUpgrading(true);
    setTimeout(() => {
      setParcels((prev) =>
        prev.map((p) => {
          if (p.id === parcelId) {
            const nextLevel = p.buildingLevel + 1;
            const nextValuation = Math.floor(p.currentValuationWld * 1.15);
            const nextEstimated = Math.floor(p.dailyEstimatedWld * 1.2);
            return {
              ...p,
              buildingLevel: nextLevel,
              currentValuationWld: nextValuation,
              dailyEstimatedWld: nextEstimated,
            };
          }
          return p;
        })
      );
      if (selectedParcel?.id === parcelId) {
        setSelectedParcel((prev) =>
          prev
            ? {
                ...prev,
                buildingLevel: prev.buildingLevel + 1,
                currentValuationWld: Math.floor(prev.currentValuationWld * 1.15),
                dailyEstimatedWld: Math.floor(prev.dailyEstimatedWld * 1.2),
              }
            : null
        );
      }
      setIsUpgrading(false);
      setClaimSuccessMsg('상업시설 증축이 완료되어 일일 임대료 기대수익이 +20% 증가했습니다!');
      setTimeout(() => setClaimSuccessMsg(null), 4000);
    }, 600);
  };

  const totalPortfolioValuation = parcels.reduce((acc, p) => acc + p.currentValuationWld, 0);
  const totalDailyPassiveYield = parcels.reduce((acc, p) => acc + p.dailyEstimatedWld, 0);
  const selectedTax = selectedParcel ? calculateRealEstateTax(selectedParcel.currentValuationWld) : null;

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-8 px-3 sm:px-6 py-6 sm:py-8 overflow-x-hidden">
      {/* 1. HERO BENTO GRID HEADER */}
      <section className="rounded-2xl sm:rounded-3xl border border-zinc-800/80 bg-card/95 p-5 sm:p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border/60">
          <div className="flex items-center gap-2">
            <span className="flex size-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground">
              WOLDEOK REAL ESTATE · 10대 핵심 가상 랜드 임대 거래소
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <ShieldCheck className="size-3.5 text-emerald-500 shrink-0" />
            15% 패시브 임대료 정산 원장 보증
          </div>
        </div>

        <div className="grid gap-6 pt-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <span className="text-xs sm:text-sm font-semibold text-muted-foreground">
              가상 부동산 시장 총 평가액
            </span>
            <div className="mt-2 font-mono tabular-nums text-[clamp(2rem,5vw,3.25rem)] font-black tracking-tight text-foreground flex items-baseline gap-2">
              {groupDigits(totalPortfolioValuation)} <span className="text-base sm:text-lg font-bold text-amber-500">WLD</span>
            </div>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed [word-break:keep-all]">
              강남, 여의도, 뉴욕 월스트리트 등 10대 가상 랜드 필지를 소유하고 상업시설(금융빌딩, 채굴센터)을 건설하여 매일 자정 15% 패시브 WLD 임대료를 정산받으세요.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl border border-border/70 bg-muted/40 shadow-xs">
              <span className="text-[11px] font-bold text-muted-foreground block">일일 총 패시브 임대료 풀</span>
              <span className="font-mono tabular-nums text-lg sm:text-xl font-bold text-emerald-500 mt-1 block">
                +{groupDigits(totalDailyPassiveYield)} WLD/일
              </span>
              <span className="text-[10px] text-muted-foreground mt-0.5 block">거래 트래픽 수수료 15% 자동 귀속</span>
            </div>

            <div className="p-4 rounded-xl border border-border/70 bg-muted/40 shadow-xs">
              <span className="text-[11px] font-bold text-muted-foreground block">내 누적 수령 임대료</span>
              <span className="font-mono tabular-nums text-lg sm:text-xl font-bold text-amber-500 mt-1 block">
                +{groupDigits(claimedWld)} WLD
              </span>
              <span className="text-[10px] text-muted-foreground mt-0.5 block">즉시 지갑 잔고에 원장 합산</span>
            </div>
          </div>
        </div>
      </section>

      {/* SUCCESS BANNER */}
      {claimSuccessMsg && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 flex items-center gap-3 text-xs sm:text-sm font-semibold text-emerald-400 animate-in fade-in">
          <CheckCircle2 className="size-5 shrink-0" />
          <span>{claimSuccessMsg}</span>
        </div>
      )}

      {/* 2. MAIN WORKSPACE: LAND PARCEL SELECTION & DETAIL SIMULATOR */}
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        {/* LEFT: 10 LAND PARCELS GRID */}
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border/60">
            <div className="flex items-center gap-2">
              <Building2 className="size-4 text-amber-500" />
              <h2 className="text-sm sm:text-base font-bold text-foreground">
                10대 프리미어 가상 랜드 필지 목록
              </h2>
            </div>
            <span className="text-xs font-mono text-muted-foreground">10 Parcels Active</span>
          </div>

          <div className="grid gap-3.5 sm:grid-cols-2">
            {parcels.map((parcel) => {
              const isSelected = selectedParcel?.id === parcel.id;
              return (
                <div
                  key={parcel.id}
                  onClick={() => setSelectedParcel(parcel)}
                  className={`cursor-pointer rounded-2xl border p-4 sm:p-5 transition-all active:scale-[0.99] flex flex-col justify-between ${
                    isSelected
                      ? 'border-amber-500/80 bg-amber-500/5 shadow-[0_0_20px_rgba(245,158,11,0.12)]'
                      : 'border-zinc-800/80 bg-card/90 hover:bg-muted/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="secondary" className="font-mono text-[10px] font-bold text-amber-500 bg-amber-500/10">
                        {parcel.badge}
                      </Badge>
                      <span className="text-[11px] font-mono font-semibold text-muted-foreground">
                        Lv.{parcel.buildingLevel} 시설
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-foreground mt-2 flex items-center gap-1.5">
                      {parcel.name}
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                      <MapPin className="size-3 text-muted-foreground/70 shrink-0" />
                      <span className="truncate">{parcel.location}</span>
                    </p>

                    <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-muted-foreground block">현재 감정가</span>
                        <span className="font-mono tabular-nums text-xs sm:text-sm font-bold text-foreground">
                          {groupDigits(parcel.currentValuationWld)} WLD
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-muted-foreground block">일일 기대 임대료</span>
                        <span className="font-mono tabular-nums text-xs sm:text-sm font-bold text-emerald-500">
                          +{groupDigits(parcel.dailyEstimatedWld)} WLD
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3.5 pt-2 border-t border-border/40 flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">
                      소유자: <strong className="text-foreground">{parcel.ownerName}</strong>
                    </span>
                    <Button
                      size="sm"
                      variant={isSelected ? 'default' : 'outline'}
                      className="h-8 text-xs font-bold rounded-lg min-h-[32px]"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedParcel(parcel);
                        handleClaimRent(parcel);
                      }}
                    >
                      임대료 정산
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* RIGHT: SELECTED PARCEL DETAIL & COMMERCIAL CONSTRUCTION SIMULATOR */}
        {selectedParcel && (
          <aside className="space-y-4">
            <div className="rounded-2xl border border-zinc-800/80 bg-card/90 p-5 sm:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md">
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <Landmark className="size-4 text-amber-500" />
                  <h3 className="text-sm font-bold text-foreground">
                    필지 상세 & 상업시설 관제
                  </h3>
                </div>
                <Badge variant="outline" className="font-mono text-[10px] font-bold text-emerald-500 border-emerald-500/30">
                  정산 가동 중
                </Badge>
              </div>

              <div className="mt-4 space-y-3.5">
                <div>
                  <h4 className="text-base font-bold text-foreground">{selectedParcel.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {selectedParcel.description}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-border/70 bg-muted/30 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">입지 위치:</span>
                    <span className="font-semibold text-foreground">{selectedParcel.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">현재 시설 유형:</span>
                    <span className="font-mono font-bold text-amber-500">
                      {selectedParcel.buildingType} (Lv.{selectedParcel.buildingLevel})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">일일 패시브 요율:</span>
                    <span className="font-mono font-bold text-emerald-500">
                      {(selectedParcel.dailyPassiveYieldRate * 100).toFixed(0)}% (일 {groupDigits(selectedParcel.dailyEstimatedWld)} WLD)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">소유주:</span>
                    <span className="font-semibold text-foreground">{selectedParcel.ownerName}</span>
                  </div>
                </div>

                {/* TAX & DEFLATION SINK DETAILS */}
                {selectedTax && (
                  <div className="p-3.5 rounded-xl border border-zinc-800/80 bg-background/60 space-y-2 text-xs">
                    <span className="font-bold text-foreground block text-[11px] uppercase tracking-wider text-muted-foreground">
                      ⚖️ 세무 & 디플레이션 소각 원장
                    </span>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">매매 취득세 (3.0% 소각):</span>
                      <span className="font-mono font-bold text-rose-400">
                        -{groupDigits(selectedTax.acquisitionTaxWld)} WLD
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">주간 종합부동산세 (0.5% 소각):</span>
                      <span className="font-mono font-bold text-rose-400">
                        -{groupDigits(selectedTax.weeklyPropertyTaxWld)} WLD/주
                      </span>
                    </div>
                  </div>
                )}

                {/* ACTION BUTTONS */}
                <div className="space-y-2 pt-2">
                  <Button
                    className="w-full h-11 rounded-xl text-xs font-bold gap-2 min-h-[44px]"
                    onClick={() => handleClaimRent(selectedParcel)}
                  >
                    <Coins className="size-4" />
                    일일 임대료 +{groupDigits(selectedParcel.dailyEstimatedWld)} WLD 수령하기
                  </Button>

                  <Button
                    variant="outline"
                    disabled={isUpgrading}
                    className="w-full h-11 rounded-xl text-xs font-bold gap-2 border-border/80 min-h-[44px]"
                    onClick={() => handleUpgradeBuilding(selectedParcel.id)}
                  >
                    <Hammer className="size-4 text-amber-500" />
                    {isUpgrading ? '증축 진행 중...' : `상업시설 Lv.${selectedParcel.buildingLevel + 1} 증축 (임대료 +20%)`}
                  </Button>
                </div>
              </div>
            </div>

            {/* QUICK LINK TO SPACES */}
            <div className="rounded-2xl border border-zinc-800/80 bg-card/90 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-foreground block">개인 공간 인테리어 에디터</span>
                <span className="text-[11px] text-muted-foreground block mt-0.5">내 방 가구 배치 및 캔버스 꾸미기</span>
              </div>
              <Link
                href="/spaces"
                className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 min-h-[44px]"
              >
                에디터 열기 <ChevronRight className="size-3.5" />
              </Link>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
