'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatMoment, groupDigits } from '@/lib/money';
import type {
  AdminTreasuryExpenditureItem,
  AdminTreasuryLedger,
  AdminTreasuryOverview,
  AdminTreasuryRevenueSource,
} from '../types';
import { TreasuryBudgetDialog } from './treasury-budget-dialog';
import { TreasuryBuybackDialog } from './treasury-buyback-dialog';
import { TreasuryDisburseDialog } from './treasury-disburse-dialog';
import { TreasuryOperationsDialog } from './treasury-operations-dialog';
import { TreasuryWealthTaxDialog } from './treasury-wealth-tax-dialog';

interface Props {
  readonly overview: AdminTreasuryOverview;
  readonly ledger: readonly AdminTreasuryLedger[];
  readonly revenue?: {
    readonly items: readonly AdminTreasuryRevenueSource[];
    readonly total_24h_wld: string;
    readonly total_7d_wld: string;
    readonly total_30d_wld: string;
  } | null;
  readonly expenditure?: {
    readonly items: readonly AdminTreasuryExpenditureItem[];
    readonly total_24h_wld: string;
    readonly total_7d_wld: string;
    readonly total_30d_wld: string;
  } | null;
}

export function isTreasuryOutflow(entry: AdminTreasuryLedger): boolean {
  if (entry.balance_before && entry.balance_after) {
    try {
      const before = BigInt(entry.balance_before);
      const after = BigInt(entry.balance_after);
      if (after < before) return true;
      if (after > before) return false;
    } catch {
      // fallback to tx_type check
    }
  }
  return [
    'CITIZEN_DIVIDEND',
    'COMMUNITY_FUNDING',
    'WELFARE_SUBSIDY',
    'MARKET_STIMULUS',
    'PUBLIC_GRANT',
    'ABSORPTION_SINK',
    'STOCK_HALT_SETTLEMENT',
    'MARKET_BUYBACK_BURN',
    'GRANT',
    'DISBURSEMENT',
    'EMERGENCY_RESERVE_TRANSFER',
  ].includes(entry.tx_type);
}

function txTypeBadge(type: string) {
  switch (type) {
    case 'INJECTION':
      return <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px]">➕ 긴급 주입</Badge>;
    case 'CITIZEN_DIVIDEND':
      return <Badge className="bg-purple-600 hover:bg-purple-700 text-white text-[11px]">💸 시민 배당</Badge>;
    case 'COMMUNITY_FUNDING':
      return <Badge className="bg-cyan-600 hover:bg-cyan-700 text-white text-[11px]">🏛️ 공공 펀딩</Badge>;
    case 'WELFARE_SUBSIDY':
      return <Badge className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px]">🤝 복지 보조금</Badge>;
    case 'MARKET_STIMULUS':
      return <Badge className="bg-teal-600 hover:bg-teal-700 text-white text-[11px]">📊 경기부양 완충</Badge>;
    case 'PUBLIC_GRANT':
      return <Badge className="bg-sky-600 hover:bg-sky-700 text-white text-[11px]">📜 공공 지원금</Badge>;
    case 'ABSORPTION_SINK':
      return <Badge className="bg-destructive hover:bg-destructive/90 text-white text-[11px]">🔥 영구 소각</Badge>;
    case 'STOCK_HALT_SETTLEMENT':
      return <Badge className="bg-amber-600 hover:bg-amber-700 text-white text-[11px]">📈 주식정산 지원</Badge>;
    case 'MARKET_BUYBACK_BURN':
      return <Badge className="bg-rose-700 hover:bg-rose-800 text-white text-[11px]">🛒 역매수 소각</Badge>;
    case 'BUDGET_DISTRIBUTION':
      return <Badge className="bg-purple-600 hover:bg-purple-700 text-white text-[11px]">⚖️ 4분할 예산배분</Badge>;
    case 'FEE_RECIRCULATION':
      return <Badge className="bg-blue-600 hover:bg-blue-700 text-white text-[11px]">🔄 수수료 순환</Badge>;
    case 'CASINO_PIGOVIAN_TAX':
      return <Badge className="bg-emerald-700 hover:bg-emerald-800 text-white text-[11px]">🎮 아케이드 공공 기여금</Badge>;
    case 'STOCK_SPECULATION_TAX':
      return <Badge className="bg-amber-700 hover:bg-amber-800 text-white text-[11px]">⚡ 단타 투기세</Badge>;
    case 'WEALTH_TAX_COLLECTION':
      return <Badge className="bg-amber-600 hover:bg-amber-700 text-white text-[11px]">💰 부유세 징수</Badge>;
    default:
      return <Badge variant="outline" className="text-[11px] font-mono">{type}</Badge>;
  }
}

function coverageBadge(days: number) {
  if (days >= 14) {
    return <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px]">안전 (14일+)</Badge>;
  }
  if (days >= 7) {
    return <Badge className="bg-amber-600 hover:bg-amber-700 text-white text-[11px]">경고 (14일 미만)</Badge>;
  }
  if (days >= 3) {
    return <Badge className="bg-orange-600 hover:bg-orange-700 text-white text-[11px]">위험 (7일 미만)</Badge>;
  }
  return <Badge className="bg-destructive hover:bg-destructive/90 text-white text-[11px]">비상 (3일 미만)</Badge>;
}

type LedgerFilterType = 'ALL' | 'OUTFLOW' | 'INFLOW' | 'BURN' | 'STOCK';

export function TreasuryView({ overview, ledger, revenue, expenditure }: Props) {
  const [filterType, setFilterType] = useState<LedgerFilterType>('ALL');

  const filteredLedger = ledger.filter((entry) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'OUTFLOW') {
      return (
        [
          'CITIZEN_DIVIDEND',
          'COMMUNITY_FUNDING',
          'WELFARE_SUBSIDY',
          'MARKET_STIMULUS',
          'PUBLIC_GRANT',
          'GRANT',
          'DISBURSEMENT',
        ].includes(entry.tx_type) || isTreasuryOutflow(entry)
      );
    }
    if (filterType === 'BURN') {
      return entry.tx_type === 'ABSORPTION_SINK' || entry.tx_type === 'MARKET_BUYBACK_BURN';
    }
    if (filterType === 'INFLOW') {
      return entry.tx_type === 'INJECTION' || entry.tx_type === 'FEE_RECIRCULATION' || !isTreasuryOutflow(entry);
    }
    if (filterType === 'STOCK') {
      return entry.tx_type === 'STOCK_HALT_SETTLEMENT';
    }
    return true;
  });

  return (
    <div className="grid gap-6">
      {/* 1. 국고 총 잔액 및 비축률 지표 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs">중앙 국고 총 비축 자금 (Vaults Balance)</CardDescription>
            <CardTitle className="text-2xl font-bold tracking-tight text-primary">
              {groupDigits(overview.total_treasury_wld)} <span className="text-sm font-normal text-muted-foreground">WLD</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
            운영 금고 및 비상 완충 금고의 전체 보유액 합산
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs">통화량 대비 비축률 (Reserve Ratio)</CardDescription>
            <CardTitle className="text-2xl font-bold tracking-tight text-emerald-600">
              {overview.reserve_ratio_pct.toFixed(2)}%
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
            유저 유통 통화량 {groupDigits(overview.total_circulating_wld)} WLD 대비 비축 비율
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between gap-1">
              <CardDescription className="text-xs">가용 유동성 & 지출 방어 일수</CardDescription>
              {overview.coverage_days !== undefined && coverageBadge(overview.coverage_days)}
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-blue-600">
              {overview.coverage_days !== undefined ? `${overview.coverage_days}일` : '-'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
            가용 유동성 {groupDigits(overview.available_wld ?? '0')} WLD (최근 30일 일평균 필수지출 기준)
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs">주식 거래정지 완충 능력</CardDescription>
            <CardTitle className="text-2xl font-bold tracking-tight text-amber-600">
              {overview.vaults.find((v) => v.code === 'VAULT_EMERGENCY')
                ? groupDigits(overview.vaults.find((v) => v.code === 'VAULT_EMERGENCY')!.balance_wld)
                : '0'}{' '}
              <span className="text-sm font-normal text-muted-foreground">WLD</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
            거래정지 시 시장 충격을 방어하는 비상 금고 한도
          </CardContent>
        </Card>
      </div>

      {/* 2. 국고 원장 및 금고 잔액 대사 무결성 상태 (Reconciliation Banner) */}
      {overview.reconciliation && (
        <Card className="border shadow-sm bg-muted/20">
          <CardHeader className="p-4 sm:p-5 pb-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-semibold">국고 회계 대사 무결성 상태 (Authoritative Reconciliation)</CardTitle>
                <Badge className={overview.reconciliation.status === 'RECONCILED' ? 'bg-emerald-600 text-white text-[11px]' : 'bg-destructive text-white text-[11px]'}>
                  {overview.reconciliation.status === 'RECONCILED' ? '대사 완료 (일치)' : '불일치 감지 (주의)'}
                </Badge>
              </div>
              <span className="text-[11px] text-muted-foreground font-mono">
                최종 대사: {new Date(overview.reconciliation.last_reconciled_at).toLocaleTimeString('ko-KR')}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="rounded border bg-background p-2.5">
                <span className="text-muted-foreground block text-[11px]">금고 총 잔액</span>
                <span className="font-bold text-foreground font-mono text-sm">{groupDigits(overview.reconciliation.total_vaults_balance_wld)} WLD</span>
              </div>
              <div className="rounded border bg-background p-2.5">
                <span className="text-muted-foreground block text-[11px]">원장 누적 순흐름</span>
                <span className="font-bold text-foreground font-mono text-sm">{groupDigits(overview.reconciliation.total_ledger_net_flow_wld)} WLD</span>
              </div>
              <div className="rounded border bg-background p-2.5">
                <span className="text-muted-foreground block text-[11px]">회계 대사 오차 (Discrepancy)</span>
                <span className="font-bold text-emerald-600 font-mono text-sm">{groupDigits(overview.reconciliation.discrepancy_amount_wld)} WLD (정상 0)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 3. 24시간 자금 흐름 관제 */}
      <Card className="border shadow-sm">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base font-semibold">최근 24시간 국고 흐름 관제 (24h Flow Dynamics)</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            중앙 국고를 통해 주입, 소각, 주식 환급 지원 및 수수료 재순환된 실시간 금융 지표
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border bg-muted/20 p-3">
              <div className="text-xs text-muted-foreground">24시간 긴급 주입</div>
              <div className="mt-1 text-base font-semibold text-emerald-600">
                +{groupDigits(overview.stats_24h.injected_wld)} WLD
              </div>
            </div>
            <div className="rounded-lg border bg-muted/20 p-3">
              <div className="text-xs text-muted-foreground">24시간 영구 소각</div>
              <div className="mt-1 text-base font-semibold text-destructive">
                -{groupDigits(overview.stats_24h.absorbed_wld)} WLD
              </div>
            </div>
            <div className="rounded-lg border bg-muted/20 p-3">
              <div className="text-xs text-muted-foreground">주식정산 국고 지원</div>
              <div className="mt-1 text-base font-semibold text-amber-600">
                {groupDigits(overview.stats_24h.stock_halt_funded_wld)} WLD
              </div>
            </div>
            <div className="rounded-lg border bg-muted/20 p-3">
              <div className="text-xs text-muted-foreground">수수료 국고 순환</div>
              <div className="mt-1 text-base font-semibold text-blue-600">
                +{groupDigits(overview.stats_24h.recirculated_wld)} WLD
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. 국고 법정 과세표준 및 세율 스케줄 */}
      {overview.tax_rates && overview.tax_rates.length > 0 && (
        <Card className="border shadow-sm">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base font-semibold">국고 법정 과세표준 및 세율 체계 (Authoritative Tax Schedule)</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              서버 권위 국고 정책 스케줄에 따른 11대 과세 범주, 과세 기준 사건 및 국고 귀속 비율 명세
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="overflow-x-auto">
              <Table className="min-w-[640px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">과세 범주</TableHead>
                    <TableHead>과세 기준 사건 및 발생 시점</TableHead>
                    <TableHead className="text-right w-[110px]">현재 법정 세율</TableHead>
                    <TableHead className="text-right w-[110px]">허용 범위</TableHead>
                    <TableHead className="text-right w-[110px]">국고 귀속</TableHead>
                    <TableHead className="text-center w-[90px]">과세 구분</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overview.tax_rates.map((tax) => (
                    <TableRow key={tax.id}>
                      <TableCell className="font-medium text-xs">
                        <div>{tax.category_ko}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{tax.category}</div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{tax.taxable_event}</TableCell>
                      <TableCell className="text-right font-mono font-semibold text-xs text-primary">
                        {tax.current_rate_pct}%
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-muted-foreground">
                        {tax.min_rate_pct}% ~ {tax.max_rate_pct}%
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-emerald-600">
                        {tax.treasury_attribution_pct}%
                      </TableCell>
                      <TableCell className="text-center">
                        {tax.is_exempt ? (
                          <Badge variant="outline" className="text-[10px] bg-muted/40">
                            비과세
                          </Badge>
                        ) : (
                          <Badge className="bg-primary/80 hover:bg-primary text-[10px]">
                            과세대상
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 4.5. 국고 세목별 수입 흐름 집계 (Treasury Revenue Breakdowns) */}
      {revenue && (
        <Card className="border shadow-sm">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle className="text-base font-semibold">국고 세목별 수입 실적 집계 (Treasury Revenue Breakdowns)</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  8대 법정 과세원으로부터 국고에 징수 귀속된 기간별(24h / 7d / 30d) 수입 흐름 명세
                </CardDescription>
              </div>
              <div className="flex items-center gap-3 text-xs flex-wrap">
                <div className="rounded border bg-muted/20 px-2.5 py-1">
                  <span className="text-muted-foreground mr-1.5">24h 총수입:</span>
                  <span className="font-mono font-semibold text-emerald-600">+{groupDigits(revenue.total_24h_wld)} WLD</span>
                </div>
                <div className="rounded border bg-muted/20 px-2.5 py-1">
                  <span className="text-muted-foreground mr-1.5">7d 총수입:</span>
                  <span className="font-mono font-semibold text-emerald-600">+{groupDigits(revenue.total_7d_wld)} WLD</span>
                </div>
                <div className="rounded border bg-muted/20 px-2.5 py-1">
                  <span className="text-muted-foreground mr-1.5">30d 총수입:</span>
                  <span className="font-mono font-semibold text-emerald-600">+{groupDigits(revenue.total_30d_wld)} WLD</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="overflow-x-auto">
              <Table className="min-w-[640px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">과세 세목</TableHead>
                    <TableHead className="text-right w-[140px]">최근 24시간 수입</TableHead>
                    <TableHead className="text-right w-[140px]">최근 7일 수입</TableHead>
                    <TableHead className="text-right w-[140px]">최근 30일 수입</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {revenue.items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-xs text-muted-foreground">
                        집계된 세입 데이터가 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : (
                    revenue.items.map((item) => (
                      <TableRow key={item.category}>
                        <TableCell className="font-medium text-xs">
                          <div>{item.category_ko}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{item.category}</div>
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs text-emerald-600">
                          +{groupDigits(item.amount_24h_wld)} WLD
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs text-emerald-600">
                          +{groupDigits(item.amount_7d_wld)} WLD
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs font-semibold text-emerald-600">
                          +{groupDigits(item.amount_30d_wld)} WLD
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 5. 국고 목적별 예산 배정 체계 (Budget Envelopes) */}
      {overview.budgets && overview.budgets.length > 0 && (
        <Card className="border shadow-sm">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base font-semibold">국고 목적별 예산 배정 체계 (Treasury Budget Envelopes)</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              국고 지출은 반드시 목적별 예산과 연결되며, 예산 부족 시 하위 우선순위부터 차단됩니다 (기획서 §7 준용).
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="overflow-x-auto">
              <Table className="min-w-[640px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">우선순위</TableHead>
                    <TableHead className="w-[180px]">예산 분류</TableHead>
                    <TableHead>사용 목적 및 감사 가이드</TableHead>
                    <TableHead className="text-right w-[110px]">총 배정액</TableHead>
                    <TableHead className="text-right w-[110px]">예약액</TableHead>
                    <TableHead className="text-right w-[110px]">집행액</TableHead>
                    <TableHead className="text-right w-[110px]">잔여액</TableHead>
                    <TableHead className="text-center w-[90px]">자동 지출</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overview.budgets.map((b) => (
                    <TableRow key={b.budget_id}>
                      <TableCell>
                        <Badge
                          variant={b.priority <= 2 ? 'default' : 'outline'}
                          className={`text-[10px] ${b.priority <= 2 ? 'bg-primary' : ''}`}
                        >
                          P{b.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-xs">
                        <div>{b.category_ko}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{b.category}</div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{b.description}</TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        {groupDigits(b.allocated_wld)} WLD
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-muted-foreground">
                        {groupDigits(b.committed_wld)} WLD
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-amber-600">
                        {groupDigits(b.settled_wld)} WLD
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold text-xs text-emerald-600">
                        {groupDigits(b.remaining_wld)} WLD
                      </TableCell>
                      <TableCell className="text-center">
                        {b.auto_spend_allowed ? (
                          <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-600/30">
                            허용
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] text-muted-foreground">
                            수동승인
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 5.5. 국고 목적별 지출 흐름 집계 (Treasury Expenditure Breakdowns) */}
      {expenditure && (
        <Card className="border shadow-sm">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base font-semibold">국고 목적별 지출 실적 집계 (Treasury Expenditure Breakdowns)</CardTitle>
                  <Badge variant="outline" className="text-[10px] text-purple-600 border-purple-500/30">30% 비축금 보호 가드</Badge>
                </div>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  10대 목적별 예산 봉투에서 실제 집행된 기간별(24h / 7d / 30d) 국고 지출 실적 명세
                </CardDescription>
              </div>
              <div className="shrink-0">
                <TreasuryDisburseDialog vaults={overview.vaults} />
              </div>
              <div className="flex items-center gap-3 text-xs flex-wrap">
                <div className="rounded border bg-muted/20 px-2.5 py-1">
                  <span className="text-muted-foreground mr-1.5">24h 총지출:</span>
                  <span className="font-mono font-semibold text-destructive">-{groupDigits(expenditure.total_24h_wld)} WLD</span>
                </div>
                <div className="rounded border bg-muted/20 px-2.5 py-1">
                  <span className="text-muted-foreground mr-1.5">7d 총지출:</span>
                  <span className="font-mono font-semibold text-destructive">-{groupDigits(expenditure.total_7d_wld)} WLD</span>
                </div>
                <div className="rounded border bg-muted/20 px-2.5 py-1">
                  <span className="text-muted-foreground mr-1.5">30d 총지출:</span>
                  <span className="font-mono font-semibold text-destructive">-{groupDigits(expenditure.total_30d_wld)} WLD</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="overflow-x-auto">
              <Table className="min-w-[640px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">예산 목적 봉투</TableHead>
                    <TableHead className="text-right w-[140px]">최근 24시간 지출</TableHead>
                    <TableHead className="text-right w-[140px]">최근 7일 지출</TableHead>
                    <TableHead className="text-right w-[140px]">최근 30일 지출</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenditure.items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-xs text-muted-foreground">
                        집계된 세출 데이터가 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : (
                    expenditure.items.map((item) => (
                      <TableRow key={item.envelope_code}>
                        <TableCell className="font-medium text-xs">
                          <div>{item.envelope_name}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{item.envelope_code}</div>
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs text-destructive">
                          -{groupDigits(item.amount_24h_wld)} WLD
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs text-destructive">
                          -{groupDigits(item.amount_7d_wld)} WLD
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs font-semibold text-destructive">
                          -{groupDigits(item.amount_30d_wld)} WLD
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 6. 금고별 상세 현황 */}
      <div className="grid gap-4 sm:grid-cols-2">
        {overview.vaults.map((vault) => (
          <Card key={vault.code} className="border shadow-sm">
            <CardHeader className="p-4 sm:p-5 pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-sm font-semibold">{vault.name}</CardTitle>
                <Badge variant="outline" className="font-mono text-xs">
                  {vault.code}
                </Badge>
              </div>
              <CardDescription className="text-xs mt-1">{vault.description}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 pt-2">
              <div className="text-xl font-bold text-foreground">
                {groupDigits(vault.balance_wld)} <span className="text-xs font-normal text-muted-foreground">WLD</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 7. 국고 재정 관리 및 긴급 제어 타워 (Fiscal & Safety Control Tower) */}
      <Card className="border shadow-sm bg-muted/10">
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-base font-semibold whitespace-normal">국고 재정 환원 및 시장 안정화 관제 (Fiscal Operations)</CardTitle>
                <Badge className="bg-primary/90 text-white text-[10px] shrink-0">헌법적 재정준칙</Badge>
              </div>
              <CardDescription className="text-xs text-muted-foreground mt-1">
                4분할 목적별 예산 자동 배분(복지 40%, 인프라 30%, 비상비축 20%, 소각 10%) 및 룬스케이프형 역매수 소각을 집행합니다.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <TreasuryBudgetDialog mainVault={overview.vaults.find((v) => v.code === 'VAULT_MAIN') ?? overview.vaults[0]} />
              <TreasuryBuybackDialog mainVault={overview.vaults.find((v) => v.code === 'VAULT_MAIN') ?? overview.vaults[0]} />
              <TreasuryWealthTaxDialog />
              <TreasuryOperationsDialog vaults={overview.vaults} />
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs h-9"
                onClick={() => {
                  window.open('/api/v1/admin/treasury/ledger/export', '_blank');
                }}
              >
                <Download className="h-3.5 w-3.5" />
                원장 CSV 내보내기
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 8. 실시간 국고 회계 감사 원장 (Ledger Table) */}
      <Card className="border shadow-sm">
        <CardHeader className="p-4 sm:p-6 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold">국고 회계 감사 원장 (Authoritative Audit Ledger)</CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                국고의 모든 자금 변동(지출·배당·소각·주입)은 원장에 영구 보존되며 실시간 추적됩니다.
              </CardDescription>
            </div>
            {/* 원터치 필터 칩 */}
            <div className="flex flex-wrap items-center gap-1 bg-muted/60 p-1 rounded-xl border text-xs">
              <button
                type="button"
                onClick={() => setFilterType('ALL')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  filterType === 'ALL'
                    ? 'bg-primary text-primary-foreground shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                전체 ({ledger.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('OUTFLOW')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  filterType === 'OUTFLOW'
                    ? 'bg-rose-600 text-white shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                💸 국고 지출·배당
              </button>
              <button
                type="button"
                onClick={() => setFilterType('BURN')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  filterType === 'BURN'
                    ? 'bg-destructive text-white shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                🔥 영구 소각
              </button>
              <button
                type="button"
                onClick={() => setFilterType('INFLOW')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  filterType === 'INFLOW'
                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                ➕ 자금 주입
              </button>
              <button
                type="button"
                onClick={() => setFilterType('STOCK')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  filterType === 'STOCK'
                    ? 'bg-yellow-600 text-white shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                📈 주식정산
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          {/* 모바일 뷰: 카드 스택 (md:hidden) */}
          <div className="grid gap-3 p-4 md:hidden divide-y divide-border/40">
            {filteredLedger.map((entry) => {
              const outflow = isTreasuryOutflow(entry);
              return (
                <div key={entry.id} className="pt-3 first:pt-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{formatMoment(entry.created_at)}</span>
                    {txTypeBadge(entry.tx_type)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground">{entry.reason || '국고 원장 거래'}</span>
                    <span
                      className={`text-sm font-bold font-mono tracking-tight ${
                        outflow ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {outflow ? '-' : '+'}
                      {groupDigits(entry.amount_wld)} WLD
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>
                      변동 후 잔액:{' '}
                      <span className="font-mono font-semibold text-foreground">
                        {groupDigits(entry.balance_after)} WLD
                      </span>
                    </span>
                    <span>{entry.actor_name || '시스템'}</span>
                  </div>
                </div>
              );
            })}
            {filteredLedger.length === 0 && (
              <div className="py-8 text-center text-xs text-muted-foreground">
                해당 필터 조건의 원장 거래 내역이 없습니다.
              </div>
            )}
          </div>

          {/* 데스크톱 뷰: 테이블 (hidden md:block) */}
          <div className="hidden md:block overflow-x-auto">
            <Table className="min-w-[640px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">유형</TableHead>
                  <TableHead className="w-[140px]">대상 금고</TableHead>
                  <TableHead className="text-right w-[130px]">금액</TableHead>
                  <TableHead className="text-right w-[140px]">처리 후 잔액</TableHead>
                  <TableHead>감사 사유</TableHead>
                  <TableHead className="w-[100px]">작업자</TableHead>
                  <TableHead className="text-right w-[130px]">일시</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLedger.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-xs text-muted-foreground">
                      기록된 국고 원장 트랜잭션이 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLedger.map((row) => {
                    const outflow = isTreasuryOutflow(row);
                    return (
                      <TableRow key={row.id}>
                        <TableCell>{txTypeBadge(row.tx_type)}</TableCell>
                        <TableCell className="font-mono text-xs">{row.vault_name}</TableCell>
                        <TableCell
                          className={`text-right font-medium text-xs font-mono ${
                            outflow
                              ? 'text-rose-600 dark:text-rose-400 font-bold'
                              : 'text-emerald-600 dark:text-emerald-400 font-bold'
                          }`}
                        >
                          {outflow ? '-' : '+'}
                          {groupDigits(row.amount_wld)} WLD
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs text-muted-foreground">
                          {groupDigits(row.balance_after)} WLD
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[240px] truncate" title={row.reason}>
                          {row.reason}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{row.actor_name ?? 'SYSTEM'}</TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(row.created_at).toLocaleString('ko-KR', {
                            month: 'numeric',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
