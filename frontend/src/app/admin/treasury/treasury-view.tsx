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

      {/* 3. 국고 법정 과세표준 및 세율 스케줄 */}
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

      {/* 4. 국고 목적별 예산 배정 체계 (Budget Envelopes) */}
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

      {/* 5. 금고별 상세 현황 */}
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

      {/* 6. 자금 긴급 제어 (Step-Up Guard) */}
      <TreasuryOperationsDialog vaults={overview.vaults} />

      {/* 7. 실시간 국고 회계 감사 원장 (Ledger Table) */}
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
