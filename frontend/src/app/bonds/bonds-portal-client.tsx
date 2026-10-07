'use client';

import { useState } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  Clock,
  Coins,
  CheckCircle2,
  FileText,
  ArrowRight,
  Info,
  Calendar,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { groupDigits } from '@/lib/money';

export interface PublicBondItem {
  id: string;
  symbol: string;
  name: string;
  maturity_hours: number;
  annual_coupon_rate_bps: number;
  hourly_coupon_rate_bps: number;
  par_value_wld: string;
  total_issued_units: string;
  available_units: string;
  total_funded_wld: string;
  status: string;
  description: string;
}

export interface UserHoldingItem {
  id: string;
  bond_id: string;
  bond_symbol: string;
  bond_name: string;
  units: string;
  par_value_wld: string;
  purchase_price_total_wld: string;
  accrued_interest_wld: string;
  hourly_coupon_rate_bps: number;
  annual_coupon_rate_bps: number;
  purchased_at: string;
  maturity_at: string;
  status: string;
  hours_left?: number;
}

interface BondsPortalClientProps {
  initialBonds: PublicBondItem[];
  initialHoldings: UserHoldingItem[];
  overview: {
    totalBondsActive: number;
    totalFundedWld: string;
    totalHoldersCount: number;
    totalCouponsPaidWld: string;
    benchmark1YYield: string;
    benchmark3YYield: string;
    benchmark5YYield: string;
  };
  isLoggedIn: boolean;
}

export function BondsPortalClient({
  initialBonds,
  initialHoldings,
  overview,
  isLoggedIn,
}: BondsPortalClientProps) {
  const [bonds, setBonds] = useState<PublicBondItem[]>(initialBonds);
  const [holdings, setHoldings] = useState<UserHoldingItem[]>(initialHoldings);
  const [selectedBond, setSelectedBond] = useState<PublicBondItem | null>(null);
  const [unitsToSubscribe, setUnitsToSubscribe] = useState<number>(1);
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribe = async () => {
    if (!selectedBond) return;
    if (!isLoggedIn) {
      toast.error('국채 청약은 로그인 후 이용하실 수 있습니다.');
      return;
    }
    if (unitsToSubscribe <= 0) {
      toast.error('청약 좌수는 1좌 이상이어야 합니다.');
      return;
    }

    setIsSubscribing(true);
    try {
      const res = await fetch('/api/bonds/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bondId: selectedBond.id,
          units: unitsToSubscribe,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '청약에 실패했습니다.');

      toast.success(
        `[${selectedBond.name}] ${unitsToSubscribe}좌 청약 완료! 총 ${groupDigits(data.totalPriceWld)} WLD가 국고로 납입되었습니다.`,
      );
      setSelectedBond(null);
      setUnitsToSubscribe(1);
      // Reload page to refresh holdings
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || '국채 청약 중 오류가 발생했습니다.');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* 1. Masthead Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-sky-500/20 bg-gradient-to-br from-sky-500/10 via-background to-indigo-500/10 p-6 sm:p-10">
        <div className="max-w-3xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-sky-600 text-white font-mono text-xs px-2.5 py-0.5">
              SOVEREIGN AAA GUARANTEE
            </Badge>
            <Badge variant="outline" className="border-sky-500/40 text-sky-700 dark:text-sky-300 font-mono text-xs">
              KOREA TREASURY BONDS (KTB)
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            월덱 기획재정국채 (KTB) 통합 거래소
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            중앙 국고(VAULT_MAIN)가 원리금을 100% 보증하는 국가 공인 무위험 확정 이자 채권입니다. 
            매시간 확정 쿠폰 이자가 지갑으로 자동 입금되며, 만기 시 원금이 전액 자동 상환됩니다.
          </p>
        </div>

        {/* Top 3 Yield Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8 pt-6 border-t border-sky-500/20">
          <div className="flex items-center justify-between p-3 rounded-xl bg-card/60 backdrop-blur-sm border border-border/80">
            <div>
              <div className="text-xs text-muted-foreground">1년물 단기 기준금리</div>
              <div className="text-sm font-semibold text-foreground">KTB-01Y</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-mono font-bold text-sky-600 dark:text-sky-400">
                {overview.benchmark1YYield}
              </div>
              <div className="text-[11px] text-muted-foreground font-mono">시간당 0.05%</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-card/60 backdrop-blur-sm border border-border/80">
            <div>
              <div className="text-xs text-muted-foreground">3년물 벤치마크 금리</div>
              <div className="text-sm font-semibold text-foreground">KTB-03Y</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {overview.benchmark3YYield}
              </div>
              <div className="text-[11px] text-muted-foreground font-mono">시간당 0.06%</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-card/60 backdrop-blur-sm border border-border/80">
            <div>
              <div className="text-xs text-muted-foreground">5년물 장기인프라 금리</div>
              <div className="text-sm font-semibold text-foreground">KTB-05Y</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {overview.benchmark5YYield}
              </div>
              <div className="text-[11px] text-muted-foreground font-mono">시간당 0.08%</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main 3 Sovereign Bond Offerings */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">국채 청약 라인업</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              원하는 만기 주기와 표면금리를 확인하고 1좌 단위로 청약할 수 있습니다.
            </p>
          </div>
          <Badge variant="outline" className="font-mono text-xs">
            3 ACTIVE BONDS
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {bonds.map((bond) => {
            const available = BigInt(bond.available_units);
            const total = BigInt(bond.total_issued_units);
            const percentRemaining = Number((available * BigInt(100)) / (total || BigInt(1)));

            return (
              <Card
                key={bond.id}
                className="border-border/80 shadow-sm hover:border-sky-500/50 transition-all flex flex-col justify-between"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="font-mono text-xs">
                      {bond.symbol}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-sky-500/30 text-sky-600 dark:text-sky-400 font-mono text-xs"
                    >
                      만기 {bond.maturity_hours}시간
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-bold text-foreground mt-2">
                    {bond.name}
                  </CardTitle>
                  <CardDescription className="text-xs line-clamp-2">
                    {bond.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Yield & Par Value */}
                  <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-muted/40 border border-border/60">
                    <div>
                      <div className="text-xs text-muted-foreground">확정 표면금리</div>
                      <div className="text-xl font-mono font-bold text-sky-600 dark:text-sky-400 mt-0.5">
                        연 {(bond.annual_coupon_rate_bps / 100).toFixed(2)}%
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        (시간당 {(bond.hourly_coupon_rate_bps / 100).toFixed(2)}%)
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">액면가 (1좌)</div>
                      <div className="text-xl font-mono font-bold text-foreground mt-0.5">
                        {groupDigits(bond.par_value_wld)}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono">WLD</div>
                    </div>
                  </div>

                  {/* Quota Progress */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>잔여 한도</span>
                      <span className="font-mono font-medium">
                        {groupDigits(bond.available_units)} / {groupDigits(bond.total_issued_units)}좌
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-sky-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentRemaining}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={() => setSelectedBond(bond)}
                    className="w-full bg-sky-600 hover:bg-sky-700 text-white font-medium gap-1.5 mt-2"
                  >
                    <Coins className="h-4 w-4" />
                    국채 청약하기
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Subscription Modal / Drawer inline */}
      {selectedBond && (
        <Card className="border-sky-500/50 bg-sky-500/5 p-6 animate-in fade-in duration-200">
          <div className="max-w-xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  [{selectedBond.name}] 청약 신청
                </h3>
                <p className="text-xs text-muted-foreground">
                  액면가 {groupDigits(selectedBond.par_value_wld)} WLD / 만기 {selectedBond.maturity_hours}시간 / 표면금리 연 {(selectedBond.annual_coupon_rate_bps / 100).toFixed(2)}%
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedBond(null)}
              >
                취소
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">청약 좌수</label>
                <Input
                  type="number"
                  min={1}
                  max={Number(selectedBond.available_units)}
                  value={unitsToSubscribe}
                  onChange={(e) => setUnitsToSubscribe(Math.max(1, parseInt(e.target.value) || 1))}
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">총 결제 금액 (WLD)</label>
                <div className="h-9 flex items-center px-3 rounded-md bg-muted/60 font-mono font-bold text-foreground text-base">
                  {groupDigits(
                    (BigInt(selectedBond.par_value_wld) * BigInt(unitsToSubscribe)).toString(),
                  )}{' '}
                  WLD
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2.5">
              <Button variant="outline" size="sm" onClick={() => setSelectedBond(null)}>
                닫기
              </Button>
              <Button
                size="sm"
                onClick={handleSubscribe}
                disabled={isSubscribing}
                className="bg-sky-600 hover:bg-sky-700 text-white font-medium"
              >
                {isSubscribing ? '처리 중...' : '국채 매수 확정'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* 3. User Holdings & Information Tabs */}
      <Tabs defaultValue="holdings" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-6">
          <TabsTrigger value="holdings">내 보유 채권 계좌 ({holdings.length})</TabsTrigger>
          <TabsTrigger value="guide">국채 제도 및 상환 안내</TabsTrigger>
        </TabsList>

        <TabsContent value="holdings" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground">내 보유 국채 현황</h3>
              <p className="text-xs text-muted-foreground">
                매시간 확정 쿠폰 이자가 자동으로 적립되며, 만기 시 원금이 지갑으로 즉시 상환됩니다.
              </p>
            </div>
          </div>

          {holdings.length === 0 ? (
            <Card className="border-border/80">
              <CardContent className="text-center py-12 text-muted-foreground space-y-2">
                <ShieldCheck className="h-10 w-10 text-muted-foreground mx-auto opacity-40" />
                <p className="text-sm font-medium">현재 보유 중인 국채가 없습니다.</p>
                <p className="text-xs text-muted-foreground">
                  상단의 국채 청약 라인업에서 원하는 국채를 선택하여 안전한 확정 이자를 수취해보세요.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {holdings.map((h) => (
                <Card key={h.id} className="border-border/80 shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="font-mono text-xs">
                          {h.bond_symbol}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={
                            h.status === 'HOLDING'
                              ? 'border-sky-500/30 text-sky-600 dark:text-sky-400'
                              : 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                          }
                        >
                          {h.status === 'HOLDING' ? '보유중 (이자수령)' : '만기상환 완료'}
                        </Badge>
                      </div>
                      <div className="text-xs font-mono text-muted-foreground">
                        잔여 {h.hours_left ?? 0}시간
                      </div>
                    </div>
                    <CardTitle className="text-base font-bold text-foreground mt-1">
                      {h.bond_name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">보유 좌수:</span>{' '}
                        <span className="font-mono font-medium text-foreground">{h.units}좌</span>
                      </div>
                      <div className="text-right">
                        <span className="text-muted-foreground">원금 투자액:</span>{' '}
                        <span className="font-mono font-semibold text-foreground">
                          {groupDigits(h.purchase_price_total_wld)} WLD
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">적용 표면금리:</span>{' '}
                        <span className="font-mono text-sky-600 dark:text-sky-400 font-semibold">
                          연 {(h.annual_coupon_rate_bps / 100).toFixed(2)}%
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-muted-foreground">누적 수취 이자:</span>{' '}
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                          +{groupDigits(h.accrued_interest_wld)} WLD
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>만기 일시: {new Date(h.maturity_at).toLocaleString('ko-KR')}</span>
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        원금 국가 100% 보증
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="guide" className="space-y-4">
          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="text-base font-bold">월덱 기획재정국채 (KTB) 제도 안내</CardTitle>
              <CardDescription className="text-xs">
                대한민국 국채법 및 글로벌 표준 국가 채권 발행 체계
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 space-y-2">
                <h4 className="font-semibold text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-sky-500" />
                  1. AAA 국가 원리금 전액 보증
                </h4>
                <p>
                  월덱 기획재정국채는 민간 기업의 파산 위험이 있는 회사채와 달리, 중앙 국고(VAULT_MAIN)의 재정 준비금으로 원금과 이자를 100% 무조건 보증합니다.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 space-y-2">
                <h4 className="font-semibold text-foreground flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-indigo-500" />
                  2. 1시간 주기 실시간 확정 쿠폰 이자 정산
                </h4>
                <p>
                  현실 세계의 반기/연 단위 이자 지급과 달리, 머니버스 생태계의 빠른 속도에 맞추어 매 1시간마다 표면금리에 따른 확정 분할 이자가 유저 덕지갑으로 직접 입금됩니다.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 space-y-2">
                <h4 className="font-semibold text-foreground flex items-center gap-1.5">
                  <Coins className="h-4 w-4 text-emerald-500" />
                  3. 만기 시 자동 원금 상환 (Zero-Default)
                </h4>
                <p>
                  정해진 만기 시간(24시간, 72시간, 120시간)이 도래하면 별도의 신청 절차 없이 원금 전액이 유저 덕지갑으로 즉시 자동 환급됩니다.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
