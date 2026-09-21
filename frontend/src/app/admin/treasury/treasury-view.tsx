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
import { groupDigits } from '@/lib/money';
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

export function TreasuryView({ overview, ledger }: Props) {
  return (
    <div className="grid gap-6">
      {/* 1. 국고 총 잔액 및 비축률 지표 */}
      <div className="grid gap-4 sm:grid-cols-3">
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

      {/* 2. 24시간 자금 흐름 관제 */}
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

      {/* 3. 금고별 상세 현황 */}
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

      {/* 4. 자금 긴급 제어 (Step-Up Guard) */}
      <TreasuryOperationsDialog vaults={overview.vaults} />

      {/* 5. 실시간 국고 회계 감사 원장 (Ledger Table) */}
      <Card className="border shadow-sm">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base font-semibold">국고 회계 감사 원장 (Authoritative Audit Ledger)</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            국고의 모든 자금 변동은 원장에 영구 보존되며 역분개 및 변조가 엄격히 차단됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[640px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">유형</TableHead>
                  <TableHead className="w-[140px]">대상 금고</TableHead>
                  <TableHead className="text-right w-[120px]">금액</TableHead>
                  <TableHead className="text-right w-[140px]">처리 후 잔액</TableHead>
                  <TableHead>감사 사유</TableHead>
                  <TableHead className="w-[90px]">작업자</TableHead>
                  <TableHead className="text-right w-[130px]">일시</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledger.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-xs text-muted-foreground">
                      기록된 국고 원장 트랜잭션이 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  ledger.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{txTypeBadge(row.tx_type)}</TableCell>
                      <TableCell className="font-mono text-xs">{row.vault_name}</TableCell>
                      <TableCell className="text-right font-medium text-xs">
                        {row.tx_type === 'ABSORPTION_SINK' || row.tx_type === 'STOCK_HALT_SETTLEMENT' ? '-' : '+'}
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
