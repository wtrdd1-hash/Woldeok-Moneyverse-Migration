import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Landmark,
  Percent,
  TrendingUp,
  ShieldCheck,
  Scale,
  Activity,
  Layers,
  ArrowRight,
  Clock,
  Coins,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { publicApi } from '@/lib/api';
import { canonicalUrl } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '한국은행 (Bank of Korea) 통화정책 공시 포털 | 머니버스',
  description: '머니버스 거시경제 기준금리, 지급준비율, M0/M1/M2 본원·협의·광의 통화량 공시 및 통화 불변식 무결성 검증 포털.',
  alternates: { canonical: canonicalUrl('/central-bank') },
  robots: { index: true, follow: true },
};

interface MonetaryAggregates {
  aggregates: {
    m0_wld: string;
    m1_wld: string;
    m2_wld: string;
  };
  components: {
    treasury_reserve_wld: string;
    circulating_cash_wld: string;
    bank_reserves_wld: string;
    bank_deposits_wld: string;
    bonds_and_time_deposits_wld: string;
  };
  multipliers: {
    money_multiplier: number;
    reserve_coverage_ratio: number;
  };
  timestamp: string;
}

interface BaseRate {
  base_rate_pct: number;
  target_inflation_pct: number;
  rationale: string;
  enforced_at: string;
}

interface ReserveRequirement {
  reserve_requirement_pct: number;
  rationale: string;
  enforced_at: string;
}

interface CommercialRates {
  base_rate_pct: number;
  deposit_rate_pct: number;
  loan_rate_base_pct: number;
  spread_pct: number;
  effective_date: string;
}

function formatWld(amountStr: string | null | undefined): string {
  if (!amountStr || !/^\d+$/.test(amountStr)) return '0 WLD';
  return `${new Intl.NumberFormat('ko-KR').format(BigInt(amountStr))} WLD`;
}

export default async function PublicCentralBankPage() {
  const [aggregates, baseRate, reserveReq, commercialRates] = await Promise.all([
    publicApi<MonetaryAggregates>('/api/v1/central-bank/monetary-aggregates', 30),
    publicApi<BaseRate>('/api/v1/central-bank/base-rate', 30),
    publicApi<ReserveRequirement>('/api/v1/central-bank/reserve-requirement', 30),
    publicApi<CommercialRates>('/api/v1/central-bank/commercial-rates', 30),
  ]);

  const currentBaseRate = baseRate?.base_rate_pct ?? commercialRates?.base_rate_pct ?? 3.5;
  const targetInflation = baseRate?.target_inflation_pct ?? 2.0;
  const currentReserveReq = reserveReq?.reserve_requirement_pct ?? 7.0;
  const depositRate = commercialRates?.deposit_rate_pct ?? 3.2;
  const loanRate = commercialRates?.loan_rate_base_pct ?? 5.2;
  const spread = commercialRates?.spread_pct ?? 2.0;

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Header */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="gap-1 border-primary/40 bg-primary/10 text-primary font-medium shrink-0">
            <Landmark className="size-3.5" />
            대한민국 중앙은행 통화신용정책
          </Badge>
          <Badge variant="outline" className="gap-1 border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-mono shrink-0">
            <ShieldCheck className="size-3.5" />
            PostgreSQL 원장 실시간 검증
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
          한국은행 금융통화위원회 통화정책 공시
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-3xl leading-relaxed">
          머니버스 거시경제 통화질서 수호와 물가안정을 위한 금융통화위원회 의결 기준금리, 지급준비율,
          본원·협의·광의 통화량(M0, M1, M2) 및 통화승수 지표를 시민과 투자자에게 투명하게 공시합니다.
        </p>
      </div>

      {/* 4 Key Policy Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">한국은행 기준금리</span>
              <Percent className="size-4 text-emerald-400" />
            </div>
            <CardTitle className="text-3xl font-black font-mono tracking-tight text-emerald-400">
              {currentBaseRate.toFixed(2)}%
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            목표 인플레이션율 <span className="font-mono font-bold text-foreground">{targetInflation.toFixed(2)}%</span> 대응
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">법정 지급준비율</span>
              <Scale className="size-4 text-sky-400" />
            </div>
            <CardTitle className="text-3xl font-black font-mono tracking-tight text-sky-400">
              {currentReserveReq.toFixed(2)}%
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            시중은행 결제성 예금 대비 의무 예치 비율
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">시중은행 예대 금리</span>
              <Activity className="size-4 text-amber-400" />
            </div>
            <CardTitle className="text-3xl font-black font-mono tracking-tight text-amber-400">
              {depositRate.toFixed(2)}% / {loanRate.toFixed(2)}%
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            예금 / 대출 기준 (스프레드 <span className="font-mono font-bold text-foreground">{spread.toFixed(2)}%p</span>)
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">통화승수 (M2/M0)</span>
              <TrendingUp className="size-4 text-purple-400" />
            </div>
            <CardTitle className="text-3xl font-black font-mono tracking-tight text-purple-400">
              {aggregates?.multipliers?.money_multiplier?.toFixed(2) ?? '1.00'}배
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            지준 충족도 <span className="font-mono font-bold text-foreground">{aggregates?.multipliers?.reserve_coverage_ratio?.toFixed(1) ?? '100.0'}%</span>
          </CardContent>
        </Card>
      </div>

      {/* Macro Aggregates Section */}
      <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-xs">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
                <Layers className="size-5 text-primary" />
                거시 통화량 지표 (Monetary Aggregates M0 / M1 / M2)
              </CardTitle>
              <CardDescription className="mt-1">
                한국은행 및 조폐국 원장에 기록된 통화 구성요소별 세부 잔액입니다.
              </CardDescription>
            </div>
            {aggregates?.timestamp && (
              <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                <Clock className="size-3.5" />
                기준시점: {new Date(aggregates.timestamp).toLocaleString('ko-KR')}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase">M0 본원통화</span>
                <Badge variant="outline" className="border-emerald-500/40 text-[10px] text-emerald-300">중앙은행 공급</Badge>
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono text-foreground">
                {formatWld(aggregates?.aggregates?.m0_wld)}
              </div>
              <p className="text-[11px] text-muted-foreground">정부 국고 비축금 + 민간 유통 현금 + 은행 지준금</p>
            </div>

            <div className="p-4 rounded-xl border border-sky-500/30 bg-sky-500/5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-400 uppercase">M1 협의통화</span>
                <Badge variant="outline" className="border-sky-500/40 text-[10px] text-sky-300">단기 유동성</Badge>
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono text-foreground">
                {formatWld(aggregates?.aggregates?.m1_wld)}
              </div>
              <p className="text-[11px] text-muted-foreground">민간 유통 현금 + 시중은행 요구불 결제성 예금</p>
            </div>

            <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-400 uppercase">M2 광의통화</span>
                <Badge variant="outline" className="border-purple-500/40 text-[10px] text-purple-300">총 유동성</Badge>
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono text-foreground">
                {formatWld(aggregates?.aggregates?.m2_wld)}
              </div>
              <p className="text-[11px] text-muted-foreground">M1 + 정기 예적금 + 가상 국채(KTB) 자산</p>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-secondary/40 text-muted-foreground text-xs uppercase tracking-wider font-semibold border-b border-border/60">
                <tr>
                  <th className="px-4 py-3">통화 구성 부문</th>
                  <th className="px-4 py-3">소관 기관</th>
                  <th className="px-4 py-3 text-right">금액 (WLD)</th>
                  <th className="px-4 py-3 text-right">M0 대비 비중</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                <tr className="hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3 font-medium">국가 중앙 국고 비축금 (Treasury)</td>
                  <td className="px-4 py-3 text-muted-foreground">대한민국 기획재정부</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-foreground">
                    {formatWld(aggregates?.components?.treasury_reserve_wld)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-emerald-400">
                    {aggregates?.aggregates?.m0_wld && BigInt(aggregates.aggregates.m0_wld) > BigInt(0)
                      ? `${((Number(aggregates.components.treasury_reserve_wld || 0) / Number(aggregates.aggregates.m0_wld)) * 100).toFixed(1)}%`
                      : '0.0%'}
                  </td>
                </tr>
                <tr className="hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3 font-medium">시중 민간 유통 화폐 (Circulating Cash)</td>
                  <td className="px-4 py-3 text-muted-foreground">머니버스 시민 유저 지갑</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-foreground">
                    {formatWld(aggregates?.components?.circulating_cash_wld)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sky-400">
                    {aggregates?.aggregates?.m0_wld && BigInt(aggregates.aggregates.m0_wld) > BigInt(0)
                      ? `${((Number(aggregates.components.circulating_cash_wld || 0) / Number(aggregates.aggregates.m0_wld)) * 100).toFixed(1)}%`
                      : '0.0%'}
                  </td>
                </tr>
                <tr className="hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3 font-medium">시중은행 지급준비금 (Bank Reserves)</td>
                  <td className="px-4 py-3 text-muted-foreground">한국은행 지급준비금 계정</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-foreground">
                    {formatWld(aggregates?.components?.bank_reserves_wld)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-amber-400">
                    {aggregates?.aggregates?.m0_wld && BigInt(aggregates.aggregates.m0_wld) > BigInt(0)
                      ? `${((Number(aggregates.components.bank_reserves_wld || 0) / Number(aggregates.aggregates.m0_wld)) * 100).toFixed(1)}%`
                      : '0.0%'}
                  </td>
                </tr>
                <tr className="hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3 font-medium">시중은행 결제성 예금 (Deposits)</td>
                  <td className="px-4 py-3 text-muted-foreground">시중은행 수신 잔액</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-foreground">
                    {formatWld(aggregates?.components?.bank_deposits_wld)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-muted-foreground">신용창출</td>
                </tr>
                <tr className="hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3 font-medium">정기 예적금 및 국채 (Bonds & Time Deposits)</td>
                  <td className="px-4 py-3 text-muted-foreground">기획재정부 국채거래소</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-foreground">
                    {formatWld(aggregates?.components?.bonds_and_time_deposits_wld)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-muted-foreground">장기 저축</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Policy Rationale & Related Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/60 bg-card/60 backdrop-blur-sm shadow-xs">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
              <Scale className="size-4 text-emerald-400" />
              금융통화위원회 통화정책방향 의결문
            </CardTitle>
            <CardDescription>
              시행일자: {baseRate?.enforced_at ? new Date(baseRate.enforced_at).toLocaleString('ko-KR') : '상시 운영'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-muted-foreground space-y-3">
            <p className="bg-secondary/30 p-4 rounded-xl border border-border/50 text-foreground font-medium">
              &quot;{baseRate?.rationale || '물가안정과 금융안정을 도모하고 지속가능한 경제성장을 뒷받침하기 위해 기준금리와 거시건전성 정책을 종합적으로 운용합니다.'}&quot;
            </p>
            <p>
              한국은행은 통화가치의 안정과 은행 시스템의 건전성을 위해 시중 통화량(M2)의 증가율 및
              인플레이션율을 모니터링하며, 필요 시 기준금리 변경과 공개시장운영을 통해 유동성을 환수 또는 공급합니다.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-xs flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
              <Coins className="size-4 text-amber-400" />
              연관 국가 금융 포털
            </CardTitle>
            <CardDescription>
              조폐국 및 기획재정부 공시 바로가기
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href="/mint"
              className="group flex items-center justify-between p-3 rounded-xl border border-border/60 bg-secondary/30 hover:bg-secondary/60 transition-colors"
            >
              <div>
                <div className="font-semibold text-xs sm:text-sm text-foreground">한국조폐공사 (KOMSCO)</div>
                <div className="text-[11px] text-muted-foreground">본원통화 주조 및 영구 소각 증적 공시</div>
              </div>
              <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>

            <Link
              href="/bonds"
              className="group flex items-center justify-between p-3 rounded-xl border border-border/60 bg-secondary/30 hover:bg-secondary/60 transition-colors"
            >
              <div>
                <div className="font-semibold text-xs sm:text-sm text-foreground">기획재정국채 (KTB) 거래소</div>
                <div className="text-[11px] text-muted-foreground">대한민국 국채 발행 및 이자 정산 공시</div>
              </div>
              <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
