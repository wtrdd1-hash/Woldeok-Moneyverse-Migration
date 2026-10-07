'use client';

import { useState } from 'react';
import {
  FileText,
  Coins,
  TrendingUp,
  Percent,
  Clock,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Play,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';
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

export interface TreasuryBondItem {
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

export interface CouponLogItem {
  id: string;
  holding_id: string | null;
  user_id: string;
  bond_symbol: string;
  bond_name: string;
  event_type: string;
  amount_wld: string;
  created_at: string;
}

export interface TreasuryBondsOverview {
  totalBondsActive: number;
  totalFundedWld: string;
  totalHoldersCount: number;
  totalCouponsPaidWld: string;
  benchmark1YYield: string;
  benchmark3YYield: string;
  benchmark5YYield: string;
}

interface BondControlTowerProps {
  initialOverview: TreasuryBondsOverview;
  initialBonds: TreasuryBondItem[];
  initialLogs: CouponLogItem[];
}

export function BondControlTower({
  initialOverview,
  initialBonds,
  initialLogs,
}: BondControlTowerProps) {
  const [overview, setOverview] = useState<TreasuryBondsOverview>(initialOverview);
  const [bonds, setBonds] = useState<TreasuryBondItem[]>(initialBonds);
  const [logs, setLogs] = useState<CouponLogItem[]>(initialLogs);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDistributing, setIsDistributing] = useState(false);

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/admin/bonds/overview');
      if (!res.ok) throw new Error('데이터 갱신 실패');
      const data = await res.json();
      setOverview(data.overview);
      setBonds(data.bonds);
      setLogs(data.couponLogs);
      toast.success('국채 관제 데이터가 최신으로 동기화되었습니다.');
    } catch {
      toast.error('국채 관제 데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDistributeCoupons = async () => {
    setIsDistributing(true);
    try {
      const res = await fetch('/api/admin/bonds/distribute-coupons', {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '이자 지급 실패');

      toast.success(
        `국채 쿠폰 이자 ${groupDigits(data.couponsDistributedWld)} WLD 정산 완료! (관리자 Discord DM 발송됨)`,
      );
      await refreshData();
    } catch (err: any) {
      toast.error(err.message || '쿠폰 이자 일괄 지급에 실패했습니다.');
    } finally {
      setIsDistributing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-sky-500/30 text-sky-600 dark:text-sky-400 font-mono text-xs">
              SOVEREIGN DEBT TRADING DESK
            </Badge>
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono text-xs">
              AAA RATED
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">
            기획재정국채 (KTB) 통합 관제 타워
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            기획재정부 국채 1/3/5년물 발행, 표면금리 조정, 시간당 쿠폰 이자 정산 및 국고 자금 조달을 총괄 관제합니다.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isRefreshing}
            className="gap-1.5"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            새로고침
          </Button>

          <Button
            size="sm"
            onClick={handleDistributeCoupons}
            disabled={isDistributing}
            className="gap-1.5 bg-sky-600 hover:bg-sky-700 text-white font-medium"
          >
            <Play className="h-4 w-4" />
            쿠폰 이자 즉시 일괄 지급
          </Button>
        </div>
      </div>

      {/* 2. Telemetry Overview 4 Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/80 shadow-sm bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">활성 국채 종목</span>
              <FileText className="h-4 w-4 text-sky-500" />
            </div>
            <CardTitle className="text-2xl font-mono font-bold mt-1">
              {overview.totalBondsActive}
              <span className="text-sm font-sans font-normal text-muted-foreground ml-1.5">개 종목</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              1년물(단기), 3년물(벤치마크), 5년물(장기)
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">국채 조달 국고 총액</span>
              <Coins className="h-4 w-4 text-emerald-500" />
            </div>
            <CardTitle className="text-2xl font-mono font-bold mt-1 text-emerald-600 dark:text-emerald-400">
              {groupDigits(overview.totalFundedWld)}
              <span className="text-sm font-sans font-normal text-muted-foreground ml-1">WLD</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              청약 자금 중앙 국고(VAULT_MAIN) 귀속
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">국채 투자 참여자 수</span>
              <ShieldCheck className="h-4 w-4 text-indigo-500" />
            </div>
            <CardTitle className="text-2xl font-mono font-bold mt-1">
              {overview.totalHoldersCount}
              <span className="text-sm font-sans font-normal text-muted-foreground ml-1.5">명</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              국가가 원리금 100% 지급 보증 (AAA)
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">누적 지급 쿠폰 이자</span>
              <TrendingUp className="h-4 w-4 text-amber-500" />
            </div>
            <CardTitle className="text-2xl font-mono font-bold mt-1 text-amber-600 dark:text-amber-400">
              {groupDigits(overview.totalCouponsPaidWld)}
              <span className="text-sm font-sans font-normal text-muted-foreground ml-1">WLD</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              1시간 단위 자동 복리 정산 파이프라인
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 3. Discord Real-time Alert Status */}
      <Card className="border-border/80 bg-gradient-to-r from-sky-500/5 to-indigo-500/5">
        <CardContent className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 mt-0.5">
              <Send className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                디스코드 관리자 1:1 DM 실시간 알림 연동 중 (ID: 886478189520637992)
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                신규 국채 청약 자금 조달 및 매시간 쿠폰 이자/만기 상환 집행 시 관리자 DM으로 즉시 전송됩니다.
              </p>
            </div>
          </div>
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-mono text-xs px-2.5 py-1">
            ACTIVE PIPELINE
          </Badge>
        </CardContent>
      </Card>

      {/* 4. Sovereign Bond Products Table */}
      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">발행 국채 종목 및 표면금리 현황</CardTitle>
              <CardDescription className="text-xs">
                대한민국 국채법 및 미국 재무부 TreasuryDirect 표준 상품 포트폴리오
              </CardDescription>
            </div>
            <Badge variant="outline" className="font-mono text-xs">
              3 ACTIVE OFFERINGS
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>종목코드 / 명칭</TableHead>
                  <TableHead className="text-right">만기 주기</TableHead>
                  <TableHead className="text-right">확정 표면금리 (연/시간)</TableHead>
                  <TableHead className="text-right">액면가 (1좌)</TableHead>
                  <TableHead className="text-right">잔여 / 총발행량</TableHead>
                  <TableHead className="text-right">조달 국고</TableHead>
                  <TableHead className="text-center">상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bonds.map((bond) => (
                  <TableRow key={bond.id}>
                    <TableCell>
                      <div>
                        <div className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                          {bond.name}
                          <Badge variant="secondary" className="font-mono text-[10px] px-1.5">
                            {bond.symbol}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {bond.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {bond.maturity_hours}시간
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm text-sky-600 dark:text-sky-400 font-semibold">
                      연 {(bond.annual_coupon_rate_bps / 100).toFixed(2)}%
                      <span className="text-[11px] text-muted-foreground ml-1">
                        (h: {(bond.hourly_coupon_rate_bps / 100).toFixed(2)}%)
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {groupDigits(bond.par_value_wld)} WLD
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {groupDigits(bond.available_units)} / {groupDigits(bond.total_issued_units)}좌
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                      {groupDigits(bond.total_funded_wld)} WLD
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={
                          bond.status === 'OPEN_SUBSCRIPTION'
                            ? 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
                            : 'border-zinc-500/30 text-zinc-600 dark:text-zinc-400'
                        }
                      >
                        {bond.status === 'OPEN_SUBSCRIPTION' ? '청약중' : bond.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 5. Coupon Distribution & Redemption Audit Logs */}
      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">국채 이자 지급 및 만기 상환 감사 로그</CardTitle>
              <CardDescription className="text-xs">
                시간당 쿠폰 이자 정산 및 만기 원금 상환 실시간 트랜잭션 (최근 30건)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>채권 종목</TableHead>
                  <TableHead>구분</TableHead>
                  <TableHead className="text-right">지급액</TableHead>
                  <TableHead className="text-right">수령 유저 ID</TableHead>
                  <TableHead className="text-right">처리 일시</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-sm">
                      아직 정산된 국채 이자 로그가 없습니다. 상단의 '쿠폰 이자 즉시 일괄 지급' 버튼을 눌러 테스트할 수 있습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium text-sm">
                        {log.bond_name} ({log.bond_symbol})
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            log.event_type === 'COUPON_INTEREST'
                              ? 'border-sky-500/30 text-sky-600 dark:text-sky-400'
                              : 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                          }
                        >
                          {log.event_type === 'COUPON_INTEREST' ? '쿠폰이자' : '만기상환'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
                        +{groupDigits(log.amount_wld)} WLD
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-muted-foreground">
                        {log.user_id.slice(0, 8)}...
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleString('ko-KR')}
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
