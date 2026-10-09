'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Swords,
  Shield,
  ShieldCheck,
  Crown,
  Coins,
  MapPin,
  Flame,
  ArrowRight,
  TrendingUp,
  Sparkles,
  HelpCircle,
  AlertCircle,
  Users,
  Trophy,
} from 'lucide-react';
import {
  INITIAL_TERRITORIES,
  calculateSiegeDamage,
  calculateGuildTaxDividend,
  calculateShieldRepairCost,
  type TerritoryZone,
} from '@moneyverse/contract';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { groupDigits } from '@/lib/money';

export default function WarfarePage() {
  const [territories, setTerritories] = useState<readonly TerritoryZone[]>(INITIAL_TERRITORIES);
  const [selectedTerritory, setSelectedTerritory] = useState<TerritoryZone>(INITIAL_TERRITORIES[0]!);
  const [claimedDividends, setClaimedDividends] = useState<number>(0);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'warn' } | null>(null);

  const showFeedback = (text: string, type: 'success' | 'warn' = 'success') => {
    setActionMessage({ text, type });
    setTimeout(() => {
      setActionMessage(null);
    }, 4500);
  };

  // 공성전 선포
  const handleDeclareSiege = (territoryId: string) => {
    setTerritories((prev) =>
      prev.map((t) => {
        if (t.id === territoryId) {
          return {
            ...t,
            status: 'SIEGE_DECLARED',
          };
        }
        return t;
      }),
    );
    const target = territories.find((t) => t.id === territoryId);
    showFeedback(`${target?.name || '영지'}에 공성전이 정식 선포되었습니다! 24시간 내 영지 점령전이 시작됩니다.`, 'warn');
  };

  // 실드 수리 및 강화
  const handleRepairShield = (territoryId: string) => {
    setTerritories((prev) =>
      prev.map((t) => {
        if (t.id === territoryId) {
          const newHp = t.maxShieldHp;
          return {
            ...t,
            currentShieldHp: newHp,
          };
        }
        return t;
      }),
    );
    showFeedback(`길드 방어 실드를 100% 완전 수리 및 강화하였습니다.`);
  };

  // 길드 일일 배당금 수령
  const handleClaimTax = (territory: TerritoryZone) => {
    const dividend = calculateGuildTaxDividend(territory.dailyTaxYieldWld, 350, 1000);
    setClaimedDividends((prev) => prev + dividend);
    showFeedback(
      `[시뮬레이션] ${territory.name} 점령 기여도(35%)에 따른 일일 세금 배당 시뮬레이션 +${groupDigits(dividend)} WLD를 수령하였습니다.`,
      'success',
    );
  };

  const currentZone = territories.find((t) => t.id === selectedTerritory.id) || selectedTerritory;
  const hpPercent = Math.round((currentZone.currentShieldHp / currentZone.maxShieldHp) * 100);

  return (
    <div className="container max-w-6xl py-8 space-y-8">
      {/* Action Notification Banner */}
      {actionMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-sm font-semibold transition-all ${
            actionMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
              : 'bg-amber-500/10 border-amber-500/40 text-amber-400'
          }`}
        >
          {actionMessage.type === 'success' ? (
            <ShieldCheck className="size-5 shrink-0" />
          ) : (
            <AlertCircle className="size-5 shrink-0" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-bold text-red-500">
          <Swords className="size-3.5" />
          <span>디스코드 길드 대규모 영지 점령전</span>
          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] text-amber-300 font-semibold border border-amber-500/30">
            인터랙티브 시뮬레이터
          </span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
              <Crown className="size-8 text-amber-500" />
              <span>디스코드 길드 영지 공성전</span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1 max-w-2xl leading-relaxed">
              5대 금융 요충지를 점령하고 길드 금고로 쏟아지는 거래세와 수수료 메커니즘을 체험해 보세요 (시뮬레이션 모드).
            </p>
          </div>
          <div className="p-4 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm min-w-[200px] text-right">
            <span className="text-xs text-muted-foreground font-semibold block">누적 수령 배당금</span>
            <span className="text-xl sm:text-2xl font-black font-mono text-amber-500">
              +{groupDigits(claimedDividends)} <span className="text-xs text-foreground font-bold">WLD</span>
            </span>
          </div>
        </div>
      </div>

      {/* 5대 영지 탭 및 현황 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {territories.map((zone) => {
          const isSelected = zone.id === currentZone.id;
          return (
            <button
              key={zone.id}
              onClick={() => setSelectedTerritory(zone)}
              className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'border-amber-500 bg-amber-500/10 shadow-md ring-1 ring-amber-500/40'
                  : 'border-border/70 bg-card/60 hover:bg-card/90'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge
                    variant={zone.status === 'PEACE' ? 'outline' : 'destructive'}
                    className="text-[10px] font-bold"
                  >
                    {zone.status === 'PEACE' ? '평화 점령' : '공성전 진행중'}
                  </Badge>
                  <span className="text-[11px] font-mono font-bold text-amber-500">
                    일 {groupDigits(zone.dailyTaxYieldWld / 10000)}만 WLD
                  </span>
                </div>
                <h2 className="font-bold text-sm text-foreground">{zone.name}</h2>
                <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{zone.location}</p>
              </div>
              <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">점령:</span>
                <span className="font-semibold text-foreground truncate max-w-[90px]">{zone.occupyingGuildName}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Territory Detailed Command Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Territory Info & Status */}
        <Card className="lg:col-span-7 border-border/80 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-4 border-b border-border/50">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-amber-500" />
                  <span className="text-xs font-semibold text-muted-foreground">{currentZone.location}</span>
                </div>
                <CardTitle className="text-xl font-extrabold mt-1 text-foreground">{currentZone.name}</CardTitle>
              </div>
              <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold px-3 py-1">
                점령 길드: {currentZone.occupyingGuildName}
              </Badge>
            </div>
            <CardDescription className="text-xs text-muted-foreground mt-2 leading-relaxed">
              {currentZone.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Shield HP Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-foreground">
                  <Shield className="size-4 text-blue-400" />
                  <span>길드 방어 실드 (레벨 {currentZone.defenseShieldLevel})</span>
                </span>
                <span className="font-mono text-muted-foreground">
                  {groupDigits(currentZone.currentShieldHp)} / {groupDigits(currentZone.maxShieldHp)} HP ({hpPercent}%)
                </span>
              </div>
              <div className="h-3 w-full bg-muted/60 rounded-full overflow-hidden border border-border/60">
                <div
                  className={`h-full transition-all rounded-full ${
                    hpPercent > 50 ? 'bg-blue-500' : hpPercent > 20 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${hpPercent}%` }}
                />
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60">
                <span className="text-[11px] text-muted-foreground block">일일 세금 금고</span>
                <span className="text-base font-black font-mono text-amber-500 mt-1 block">
                  +{groupDigits(currentZone.dailyTaxYieldWld)} <span className="text-[10px] text-foreground">WLD/일</span>
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60">
                <span className="text-[11px] text-muted-foreground block">기본 수호 방어력</span>
                <span className="text-base font-black font-mono text-foreground mt-1 block">
                  {groupDigits(currentZone.defaultDefensePower)} <span className="text-[10px] text-muted-foreground">DEF</span>
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 col-span-2 sm:col-span-1">
                <span className="text-[11px] text-muted-foreground block">실시간 공성 상태</span>
                <span className="text-sm font-bold text-emerald-400 mt-1 block">
                  {currentZone.status === 'PEACE' ? '평화 안정화' : '격전지 공성중'}
                </span>
              </div>
            </div>

            {/* Interactive Guild Actions */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                variant="destructive"
                className="flex-1 text-xs font-bold h-11"
                onClick={() => handleDeclareSiege(currentZone.id)}
              >
                <Flame className="size-4 mr-1.5" />
                <span>영지 공성전 선포하기</span>
              </Button>
              <Button
                variant="outline"
                className="flex-1 text-xs font-bold h-11 border-blue-500/40 text-blue-400 hover:bg-blue-500/10"
                onClick={() => handleRepairShield(currentZone.id)}
              >
                <ShieldCheck className="size-4 mr-1.5" />
                <span>실드 완전 수리 & 강화</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right: Guild Tax Dividend Claim & Discord Bot Stats */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-amber-500/40 bg-gradient-to-br from-card via-card to-amber-500/5 shadow-md">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Coins className="size-5 text-amber-500" />
                <span>내 길드 일일 세금 배당 정산</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-5">
              <div className="space-y-1.5">
                <span className="text-xs text-muted-foreground">점령 기여 지분 (350 pt / 1,000 pt)</span>
                <div className="text-2xl font-black font-mono text-amber-500">
                  +{groupDigits(calculateGuildTaxDividend(currentZone.dailyTaxYieldWld, 350, 1000))}{' '}
                  <span className="text-sm text-foreground font-bold">WLD</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  매일 자정 정산 시 길드 금고 수수료가 참여 길드원의 개인 지갑으로 즉시 자동 입금됩니다.
                </p>
              </div>

              <Button
                className="w-full bg-primary text-primary-foreground font-bold text-xs h-11 shadow-sm hover:scale-[1.01] transition-transform"
                onClick={() => handleClaimTax(currentZone)}
              >
                <span>일일 길드 배당금 수령하기</span>
                <ArrowRight className="size-4 ml-1.5" />
              </Button>
            </CardContent>
          </Card>

          {/* Discord Guild Warfare Ranking Preview */}
          <Card className="border-border/80 bg-card/60">
            <CardHeader className="py-3 px-4 border-b border-border/60">
              <CardTitle className="text-xs font-bold flex items-center gap-2">
                <Trophy className="size-4 text-amber-500" />
                <span>디스코드 길드 랭킹 TOP 3</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/40 text-xs">
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-500">#1</span>
                    <span className="font-semibold">월덕 퀀트 길드</span>
                  </div>
                  <span className="font-mono text-muted-foreground">점령 영지 1개 · 500k WLD</span>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-zinc-400">#2</span>
                    <span className="font-semibold">불개미 트레이더 연합</span>
                  </div>
                  <span className="font-mono text-muted-foreground">점령 영지 1개 · 420k WLD</span>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-700">#3</span>
                    <span className="font-semibold">알고리즘 마스터즈</span>
                  </div>
                  <span className="font-mono text-muted-foreground">점령 영지 1개 · 350k WLD</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* FAQ & Guide for Rich SEO */}
      <div className="rounded-2xl border border-border/70 bg-muted/20 p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-foreground font-bold text-base">
          <HelpCircle className="size-5 text-amber-500" />
          <span>공성전 & 길드 세금 자주 묻는 질문 (FAQ)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-muted-foreground">
          <div className="space-y-1.5">
            <p className="font-semibold text-foreground">Q. 길드에 가입하지 않아도 공성전을 구경할 수 있나요?</p>
            <p className="leading-relaxed">네, 5대 영지의 실시간 점령 현황 및 세금 금고 규모는 모든 방문자가 자유롭게 조회할 수 있습니다.</p>
          </div>
          <div className="space-y-1.5">
            <p className="font-semibold text-foreground">Q. 공성전에서 승리하려면 무엇이 필요한가요?</p>
            <p className="leading-relaxed">길드원들의 총 공격력과 전략적인 공성 시간대 조율, 그리고 상대 영지 방어 실드를 파괴하는 화력이 핵심입니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
