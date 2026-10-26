'use client';

import { useState } from 'react';
import {
  ShieldCheck,
  Coins,
  TrendingUp,
  Percent,
  Clock,
  RefreshCw,
  AlertTriangle,
  Users,
  Award,
} from 'lucide-react';
import { toast } from 'sonner';
import { parsePensionOverview, parsePensionPayoutLogs } from './pension-evidence';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { groupDigits } from '@/lib/money';

export interface NationalPensionOverview {
  totalAumWld: string;
  totalSubscribersCount: number;
  totalRetiredReceiversCount: number;
  totalPensionPaidWld: string;
  benchmarkAnnualPayoutRate: string;
  vaultMainBalanceWld: string;
}

export interface PayoutLogItem {
  id: string;
  account_id: string;
  user_id: string;
  payout_amount_wld: string;
  snapshot_accumulated_wld: string;
  created_at: string;
}

interface PensionControlTowerProps {
  initialOverview: NationalPensionOverview | null;
  initialPayoutLogs: PayoutLogItem[] | null;
}

export function PensionControlTower({
  initialOverview,
  initialPayoutLogs,
}: PensionControlTowerProps) {
  const [overview, setOverview] = useState<NationalPensionOverview | null>(initialOverview);
  const [payoutLogs, setPayoutLogs] = useState<PayoutLogItem[] | null>(initialPayoutLogs);
  const [loading, setLoading] = useState(false);

  const refreshData = async () => {
    setLoading(true);
    try {
      const [overviewResponse, payoutResponse] = await Promise.all([
        fetch('/api/admin/pension/overview', { cache: 'no-store' }),
        fetch('/api/admin/pension/recent-payouts', { cache: 'no-store' }),
      ]);
      const [rawOverview, rawPayouts] = await Promise.all([
        overviewResponse.ok ? overviewResponse.json() : Promise.resolve(null),
        payoutResponse.ok ? payoutResponse.json() : Promise.resolve(null),
      ]);
      const verifiedOverview = parsePensionOverview(rawOverview);
      const verifiedPayouts = parsePensionPayoutLogs(rawPayouts);
      setOverview(verifiedOverview);
      setPayoutLogs(verifiedPayouts);
      if (verifiedOverview === null || verifiedPayouts === null) {
        toast.error('일부 연금 관제 데이터를 확인할 수 없습니다.');
      }
    } catch {
      // A failed refresh must never leave stale figures appearing current.
      setOverview(null);
      setPayoutLogs(null);
      toast.error('국민연금 관제 데이터 갱신에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 상단 헤더 & 컨트롤 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <ShieldCheck className="h-7 w-7 text-emerald-500" />
              국민연금공단(NPS) 공적 연금 총괄 관제 센터
            </h1>
            <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10">
              Sovereign Pension Fund
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            국민 기여금 적립 총액(AUM), 은퇴자 기초연금 수령 현황, 중앙 국고(VAULT_MAIN) 편입 및 복리 운용 레버리지를 조회된 자료만 표시합니다. 데이터 장애는 실제 0건과 구분합니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={loading}
            className="min-h-11 min-w-11 gap-1.5"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled
            aria-describedby="pension-payout-hold"
            className="min-h-11 min-w-11 gap-1.5"
          >
            <AlertTriangle className="h-4 w-4" />
            기초연금 즉시 일괄 지급 (중단)
          </Button>
        </div>
      </div>

      <p id="pension-payout-hold" role="status" className="text-sm text-amber-600 dark:text-amber-400">
        현재 Backend는 원장 인증이 완료되지 않은 연금 일괄 지급을 HTTP 503으로 차단합니다. 검증 전에는 수동 지급을 실행할 수 없습니다.
      </p>
      {overview === null && (
        <div role="alert" className="rounded-lg border border-destructive/40 p-4 text-sm text-destructive">
          연금 관제 데이터를 확인할 수 없습니다. API 연결 또는 응답 형식을 확인하고 새로고침해 주세요. 실제 기금이 0원이라는 의미가 아닙니다.
        </div>
      )}
            {/* 4대 핵심 지표 카드 */}
      {overview !== null && <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/60 bg-card/60 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              총 연금 적립 기금 (AUM)
            </CardTitle>
            <Coins className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {groupDigits(overview.totalAumWld)} <span className="text-xs font-normal text-muted-foreground">WLD</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-emerald-400" />
              국고 및 국부펀드 편입 운용자산
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              연금 가입 국민 수 / 은퇴 수령자
            </CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {overview.totalSubscribersCount.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">명</span>
              <span className="text-sm font-normal text-emerald-400 ml-2">
                (은퇴 {overview.totalRetiredReceiversCount}명)
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              가입 자격: 전 국민 자유 기여제
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              기준 연간 연금율 / 시간당 지급률
            </CardTitle>
            <Percent className="h-4 w-4 text-violet-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {overview.benchmarkAnnualPayoutRate}
              <span className="text-xs font-normal text-muted-foreground ml-2">
                (시간당 0.08~0.12%)
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              기여 등급별 차등 우대 지급
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              중앙 국고(VAULT_MAIN) 잔액
            </CardTitle>
            <Award className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {groupDigits(overview.vaultMainBalanceWld)} <span className="text-xs font-normal text-muted-foreground">WLD</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              서비스 내 가상 기금 잔액이며 실제 국가 보증이나 신용등급이 아닙니다.
            </p>
          </CardContent>
        </Card>
      </div>}

      {/* 5단계 연금 가입 티어 안내 */}
      <Card className="border-border/60 bg-card/60">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Award className="h-5 w-5 text-emerald-400" />
            월덕 국민연금 5단계 가입 등급 및 지급 체계 (NPS Tier Structure)
          </CardTitle>
          <CardDescription>
            국민(유저)의 누적 납입 기여금에 따라 자동으로 승급되며, 은퇴 후 평생 시간당 기초연금이 차등 확정 지급됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="rounded-lg border border-border/70 p-3 bg-muted/20">
              <div className="text-xs font-semibold text-muted-foreground">Tier 1 · 청년적립형</div>
              <div className="text-sm font-bold mt-1">10만 WLD 미만</div>
              <div className="text-xs text-emerald-400 mt-2">연 7.0% (시간당 0.08%)</div>
              <div className="text-[11px] text-muted-foreground mt-1">누구나 즉시 가입 가능</div>
            </div>
            <div className="rounded-lg border border-border/70 p-3 bg-muted/20">
              <div className="text-xs font-semibold text-muted-foreground">Tier 2 · 표준국민형</div>
              <div className="text-sm font-bold mt-1">10만 ~ 50만 WLD</div>
              <div className="text-xs text-emerald-400 mt-2">연 7.8% (시간당 0.09%)</div>
              <div className="text-[11px] text-muted-foreground mt-1">성실 납입 우대 구간</div>
            </div>
            <div className="rounded-lg border border-border/70 p-3 bg-muted/20">
              <div className="text-xs font-semibold text-muted-foreground">Tier 3 · 골드은퇴형</div>
              <div className="text-sm font-bold mt-1">50만 ~ 200만 WLD</div>
              <div className="text-xs text-emerald-400 mt-2">연 8.7% (시간당 0.10%)</div>
              <div className="text-[11px] text-muted-foreground mt-1">안정적 노후 자립 구간</div>
            </div>
            <div className="rounded-lg border border-border/70 p-3 bg-muted/20">
              <div className="text-xs font-semibold text-muted-foreground">Tier 4 · 플래티넘형</div>
              <div className="text-sm font-bold mt-1">200만 ~ 1,000만 WLD</div>
              <div className="text-xs text-emerald-400 mt-2">연 9.6% (시간당 0.11%)</div>
              <div className="text-[11px] text-muted-foreground mt-1">고액 자산가 공적 기여</div>
            </div>
            <div className="rounded-lg border border-border/70 p-3 bg-emerald-500/10 border-emerald-500/30">
              <div className="text-xs font-semibold text-emerald-400">Tier 5 · 명예원로형</div>
              <div className="text-sm font-bold mt-1 text-emerald-300">1,000만 WLD 이상</div>
              <div className="text-xs text-emerald-400 mt-2">연 10.5% (시간당 0.12%)</div>
              <div className="text-[11px] text-emerald-200/80 mt-1">국가 공로 훈장 뱃지 부여</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 최근 연금 지급 이력 */}
      <Card className="border-border/60 bg-card/60">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-emerald-400" />
            최근 기초연금 지급 내역 (Payout Audit Logs)
          </CardTitle>
          <CardDescription>
            인증된 Backend에서 조회한 최근 최대 30건의 가상 연금 지급 기록입니다. 실시간 집행 보증이 아닙니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payoutLogs === null ? (
            <div role="status" className="py-8 text-center text-sm text-destructive">
              지급 내역을 확인할 수 없습니다. API 연결 상태를 확인하고 새로고침해 주세요.
            </div>
          ) : payoutLogs.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              아직 집행된 기초연금 지급 기록이 없습니다.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>지급 일시</TableHead>
                  <TableHead>수령자 ID</TableHead>
                  <TableHead>지급 연금액</TableHead>
                  <TableHead>적립금 스냅샷</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payoutLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(log.created_at).toLocaleString('ko-KR')}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {log.user_id.slice(0, 10)}...
                    </TableCell>
                    <TableCell className="font-semibold text-emerald-400">
                      +{groupDigits(log.payout_amount_wld)} WLD
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {groupDigits(log.snapshot_accumulated_wld)} WLD
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
