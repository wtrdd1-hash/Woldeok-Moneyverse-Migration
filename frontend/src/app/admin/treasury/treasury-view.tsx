'use client';

import { Badge } from '@/components/ui/badge';
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
import type { AdminTreasuryLedger, AdminTreasuryOverview } from '../types';
import { TreasuryOperationsDialog } from './treasury-operations-dialog';

interface Props {
  readonly overview: AdminTreasuryOverview;
  readonly ledger: readonly AdminTreasuryLedger[];
}

function txTypeBadge(type: string) {
  switch (type) {
    case 'INJECTION':
      return <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px]">긴급 주입</Badge>;
    case 'ABSORPTION_SINK':
      return <Badge className="bg-destructive hover:bg-destructive/90 text-white text-[11px]">영구 소각</Badge>;
    case 'STOCK_HALT_SETTLEMENT':
      return <Badge className="bg-amber-600 hover:bg-amber-700 text-white text-[11px]">주식정산 지원</Badge>;
    case 'FEE_RECIRCULATION':
      return <Badge className="bg-blue-600 hover:bg-blue-700 text-white text-[11px]">수수료 순환</Badge>;
    default:
      return <Badge variant="outline" className="text-[11px]">{type}</Badge>;
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

export function TreasuryView({ overview, ledger }: Props) {
  return (
    <div className="grid gap-6">
      {/* 1. 국고 총 잔액 및 비축률 지표 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-border/80 shadow-sm bg-card">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs">중앙 국고 총 비축 자금 (Vaults)</CardDescription>
            <CardTitle className="text-2xl font-bold font-mono tracking-tight text-primary">
              {groupDigits(overview.total_treasury_wld)} <span className="text-xs font-normal text-muted-foreground font-sans">WLD</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
            운영 금고 및 비상 완충 금고의 전체 보유액 합산
          </CardContent>
        </Card>

        <Card className="border border-border/80 shadow-sm bg-card">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs">통화량 대비 비축률 (Reserve Ratio)</CardDescription>
            <CardTitle className="text-2xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
              {overview.reserve_ratio_pct.toFixed(2)}%
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
            유저 유통 통화량 <span className="font-mono">{groupDigits(overview.total_circulating_wld)}</span> WLD 대비 비축 비율
          </CardContent>
        </Card>

        <Card className="border border-border/80 shadow-sm bg-card">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs">국고 방어 가능 일수</CardDescription>
              {coverageBadge(overview.reserve_coverage_days)}
            </div>
            <CardTitle className="text-2xl font-bold font-mono tracking-tight">
              {overview.reserve_coverage_days.toFixed(1)} <span className="text-sm font-normal text-muted-foreground font-sans">일</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
            24시간 순지출 기준 추가 유입 없이 방어 가능한 기간
          </CardContent>
        </Card>

        <Card className="border border-border/80 shadow-sm bg-card">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs">24시간 국고 순유입/유출</CardDescription>
            <CardTitle className={`text-2xl font-bold font-mono tracking-tight ${BigInt(overview.net_flow_24h_wld) >= 0n ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {BigInt(overview.net_flow_24h_wld) >= 0n ? '+' : ''}{groupDigits(overview.net_flow_24h_wld)} <span className="text-xs font-normal text-muted-foreground font-sans">WLD</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
            유입 <span className="font-mono">+{groupDigits(overview.total_inflow_24h_wld)}</span> / 지출 <span className="font-mono">-{groupDigits(overview.total_outflow_24h_wld)}</span>
          </CardContent>
        </Card>
      </div>

      {/* 2. 금고별 세부 잔액 및 운영 액션 */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border border-border/80 shadow-sm bg-card">
          <CardHeader>
            <CardTitle className="text-base">운영 금고 (Operations Vault)</CardTitle>
            <CardDescription className="text-xs">일일 퀘스트, 보상 및 일상 운영 지출용 금고</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-2xl font-bold font-mono tracking-tight text-foreground">
              {groupDigits(overview.operations_vault_wld)} <span className="text-sm font-normal text-muted-foreground font-sans">WLD</span>
            </div>
            <div className="text-xs text-muted-foreground">
              국고 내 비중: <span className="font-mono font-semibold">{(Number(overview.operations_vault_wld) / (Number(overview.total_treasury_wld) || 1) * 100).toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/80 shadow-sm bg-card">
          <CardHeader>
            <CardTitle className="text-base">비상 완충 금고 (Buffer Vault)</CardTitle>
            <CardDescription className="text-xs">인플레이션 억제 및 경제 위기 대응 비상 비축금</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-2xl font-bold font-mono tracking-tight text-foreground">
              {groupDigits(overview.buffer_vault_wld)} <span className="text-sm font-normal text-muted-foreground font-sans">WLD</span>
            </div>
            <div className="text-xs text-muted-foreground">
              국고 내 비중: <span className="font-mono font-semibold">{(Number(overview.buffer_vault_wld) / (Number(overview.total_treasury_wld) || 1) * 100).toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/80 shadow-sm bg-card flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-base">국고 조작 및 거버넌스</CardTitle>
            <CardDescription className="text-xs">비상 통화 공급 주입 및 영구 통화량 흡수(소각)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-xs text-muted-foreground">
              모든 국고 트랜잭션은 관리자 감사 로그 및 국고 원장에 영구 기록됩니다.
            </div>
            <TreasuryOperationsDialog />
          </CardContent>
        </Card>
      </div>

      {/* 3. 최근 국고 원장 변동 내역 */}
      <Card className="border border-border/80 shadow-sm bg-card">
        <CardHeader>
          <CardTitle className="text-base">최근 국고 원장 변동 내역</CardTitle>
          <CardDescription className="text-xs">국고 유입, 지출, 소각 및 비상 주입의 불변 원장 기록</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {/* 모바일 뷰: 카드 스택 (md:hidden) */}
          <div className="grid gap-3 p-4 md:hidden divide-y divide-border/40">
            {ledger.map((entry) => (
              <div key={entry.id} className="pt-3 first:pt-0 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{formatMoment(entry.created_at)}</span>
                  {txTypeBadge(entry.tx_type)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">{entry.description || '국고 원장 거래'}</span>
                  <span className={`text-sm font-bold font-mono tracking-tight ${BigInt(entry.amount_wld) >= 0n ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {BigInt(entry.amount_wld) >= 0n ? '+' : ''}{groupDigits(entry.amount_wld)} WLD
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>변동 후 잔액: <span className="font-mono font-semibold text-foreground">{groupDigits(entry.balance_after_wld)} WLD</span></span>
                  <span>{entry.operator_name || '시스템'}</span>
                </div>
              </div>
            ))}
            {ledger.length === 0 && (
              <div className="py-8 text-center text-xs text-muted-foreground">
                원장 변동 기록이 없습니다.
              </div>
            )}
          </div>

          {/* 데스크톱 뷰: 테이블 (hidden md:block) */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-36 text-xs">일시</TableHead>
                  <TableHead className="w-32 text-xs">유형</TableHead>
                  <TableHead className="text-xs">적요 / 사유</TableHead>
                  <TableHead className="text-right text-xs">변동 금액</TableHead>
                  <TableHead className="text-right text-xs">변동 후 국고 잔액</TableHead>
                  <TableHead className="w-28 text-right text-xs">담당자</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledger.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatMoment(entry.created_at)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {txTypeBadge(entry.tx_type)}
                    </TableCell>
                    <TableCell className="text-xs max-w-xs truncate">
                      {entry.description || '—'}
                    </TableCell>
                    <TableCell className={`text-right font-mono font-bold text-xs whitespace-nowrap ${BigInt(entry.amount_wld) >= 0n ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {BigInt(entry.amount_wld) >= 0n ? '+' : ''}{groupDigits(entry.amount_wld)} WLD
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs whitespace-nowrap">
                      {groupDigits(entry.balance_after_wld)} WLD
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap">
                      {entry.operator_name || '시스템'}
                    </TableCell>
                  </TableRow>
                ))}
                {ledger.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-xs text-muted-foreground py-8">
                      기록된 국고 원장 변동 내역이 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
