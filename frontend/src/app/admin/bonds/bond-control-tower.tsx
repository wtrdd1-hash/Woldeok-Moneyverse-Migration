'use client';

import { useState } from 'react';
import {
  FileText,
  Coins,
  TrendingUp,
  ShieldCheck,
  RefreshCw,
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
import { parseBondEvidence } from './bond-evidence';
import { AdminActionModal } from '@/components/admin/admin-action-modal';
import { Landmark, Zap, PlusCircle } from 'lucide-react';

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
  initialOverview: TreasuryBondsOverview | null;
  initialBonds: TreasuryBondItem[];
  initialLogs: CouponLogItem[];
}

export function BondControlTower({
  initialOverview,
  initialBonds,
  initialLogs,
}: BondControlTowerProps) {
  const [overview, setOverview] = useState<TreasuryBondsOverview | null>(initialOverview);
  const [bonds, setBonds] = useState<TreasuryBondItem[]>(initialBonds);
  const [logs, setLogs] = useState<CouponLogItem[]>(initialLogs);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Form states for issue
  const [symbol, setSymbol] = useState('KTB-10Y');
  const [name, setName] = useState('월덱 10년물 혁신성장국채');
  const [parValueWld, setParValueWld] = useState('10000');
  const [annualCouponRateBps, setAnnualCouponRateBps] = useState(550);
  const [maturityHours, setMaturityHours] = useState(8760);
  const [totalIssuedUnits, setTotalIssuedUnits] = useState(1000);
  const [description, setDescription] = useState('국가 혁신 성장 및 벤처 자금 조달을 위한 공인 국채');

  const handleCreateIssue = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/bonds/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol,
          name,
          parValueWld,
          annualCouponRateBps: Number(annualCouponRateBps),
          maturityHours: Number(maturityHours),
          totalIssuedUnits: Number(totalIssuedUnits),
          description,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '국채 발행 실패');
      setActionSuccessMsg(`국채 종목 ${symbol} (${name}) ${totalIssuedUnits}좌가 성공적으로 발행 공고되었습니다.`);
      refreshData();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '국채 발행 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDistributeCoupons = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/bonds/distribute-coupons', {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '쿠폰 이자 집행 실패');
      setActionSuccessMsg(
        `일일 쿠폰 이자 및 만기 상환이 복식부기로 집행되었습니다. (지급 이자: +${data.couponsDistributedWld || 0} WLD, 상환 원금: +${data.maturitiesRedeemedWld || 0} WLD, 처리 계좌: ${data.holdingsProcessed || 0}건)`
      );
      refreshData();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '이자 집행 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/admin/bonds/overview');
      if (!res.ok) throw new Error('데이터 갱신 실패');
      const data = parseBondEvidence(await res.json());
      setOverview(data.overview);
      setBonds(data.bonds);
      setLogs(data.couponLogs);
      toast.success('국채 관제 데이터가 최신으로 동기화되었습니다.');
    } catch {
      setOverview(null);
      setBonds([]);
      setLogs([]);
      toast.error('국채 관제 데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsRefreshing(false);
    }
  };

  if (overview === null) {
    return (
      <section className="space-y-4" aria-labelledby="bond-console-error">
        <h1 id="bond-console-error" className="text-2xl font-bold">가상 국채 관제</h1>
        <div role="alert" className="rounded-lg border border-destructive/50 p-4 text-sm">
          국채 관제 조회 결과를 검증할 수 없습니다. 실제 기록 0건을 의미하지 않습니다.
        </div>
        <Button type="button" onClick={refreshData} disabled={isRefreshing} className="min-h-11">
          <RefreshCw aria-hidden="true" className="size-4" /> 새로고침
        </Button>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-sky-500/30 text-sky-600 dark:text-sky-400 font-mono text-xs">
              VIRTUAL BOND CONSOLE
            </Badge>
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono text-xs">
              CERTIFIED DOUBLE-ENTRY ENGINE
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">
            기획재정국채 (KTB) 통합 관제 타워
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            서버가 반환한 가상 국채 목록과 정산 기록을 조회합니다. 원장 인증이 완료되기 전까지 수동 지급은 보류됩니다.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setActionSuccessMsg(null); setIsIssueModalOpen(true); }}
            className="gap-1.5 min-h-11 border-sky-500/30 hover:bg-sky-500/10 text-sky-400 font-bold"
          >
            <PlusCircle className="size-4" />
            신규 국채 발행
          </Button>

          <Button
            size="sm"
            onClick={() => { setActionSuccessMsg(null); setIsCouponModalOpen(true); }}
            className="gap-1.5 min-h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-950/40"
          >
            <Zap className="size-4" />
            일일 쿠폰 이자 즉시 집행
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isRefreshing}
            className="gap-1.5 min-h-11"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            새로고침
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
              현재 서버에서 확인된 활성 국채 수
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
              가상 경제 데이터이며 실제 국가 보증 상품이 아닙니다.
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
              전체 쿠폰 이자 기록의 합계입니다. 만기 원금 상환은 포함하지 않습니다. 실제 지급 인증은 별도 확인이 필요합니다.
            </p>
          </CardContent>
        </Card>
      </div>

      <div role="status" className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
        국채 수동 쿠폰 지급은 원장 무결성 인증 전까지 보류됩니다. Discord 관리자 DM 전달 상태는 이 화면에서 검증되지 않았습니다.
      </div>

      {/* 4. Sovereign Bond Products Table */}
      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">발행 국채 종목 및 표면금리 현황</CardTitle>
              <CardDescription className="text-xs">
                서버에서 확인한 가상 국채 상품 목록
              </CardDescription>
            </div>
            <Badge variant="outline" className="font-mono text-xs">
              {bonds.length} LISTED BONDS
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
                      최근 30건 범위에 조회된 정산 기록이 없습니다. 수동 지급 테스트는 제공되지 않습니다.
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
      {/* 🏛️ 신규 국채 종목 발행 공고 모달 */}
      <AdminActionModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        title="신규 국채(KTB) 종목 공모 발행"
        subtitle="중앙 정부(국고)의 공인 가상 채권을 시장에 신규 공모합니다."
        icon={<Landmark className="size-4" />}
        confirmLabel="국채 공모 발행 실행"
        confirmVariant="primary"
        isLoading={isSubmitting}
        successMessage={actionSuccessMsg}
        onConfirm={handleCreateIssue}
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-mono">종목 심볼</label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-mono">종목 명칭</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-mono">액면가 (WLD)</label>
              <input
                type="text"
                value={parValueWld}
                onChange={(e) => setParValueWld(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-mono">표면금리 (bps)</label>
              <input
                type="number"
                value={annualCouponRateBps}
                onChange={(e) => setAnnualCouponRateBps(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
              />
              <span className="text-[10px] text-emerald-400">연 {(annualCouponRateBps / 100).toFixed(2)}%</span>
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-mono">총 발행좌수</label>
              <input
                type="number"
                value={totalIssuedUnits}
                onChange={(e) => setTotalIssuedUnits(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-mono">발행 목적 및 상세 설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
            />
          </div>

          <div className="p-3 bg-sky-950/30 border border-sky-500/30 rounded-xl text-[11px] text-sky-300">
            💡 발행된 국채는 즉시 청약 가용 상태(`OPEN_SUBSCRIPTION`)가 되며, 시민들의 청약 대금은 국고 본금고(`VAULT_MAIN`)로 복식부기 자동 입금됩니다.
          </div>
        </div>
      </AdminActionModal>

      {/* ⚡ 일일 쿠폰 이자 즉시 집행 모달 */}
      <AdminActionModal
        isOpen={isCouponModalOpen}
        onClose={() => setIsCouponModalOpen(false)}
        title="일일 쿠폰 이자 및 만기 원리금 복식부기 집행"
        subtitle="국고 본금고(VAULT_MAIN)로부터 전체 활성 국채 보유자에게 즉시 이자를 분개 집행합니다."
        icon={<Zap className="size-4" />}
        confirmLabel="원자적 이자 집행 승인"
        confirmVariant="emerald"
        isLoading={isSubmitting}
        successMessage={actionSuccessMsg}
        onConfirm={handleDistributeCoupons}
      >
        <div className="space-y-3 text-xs leading-relaxed">
          <p className="text-slate-300">
            본 작업은 PostgreSQL 원자적 불변 프로시저(`treasury_bond_distribute_daily_coupons`)를 호출하여:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 font-mono text-[11px]">
            <li>모든 활성(`ACTIVE`) 국채 보유 계좌에 대해 1일 치 표면이자를 계산합니다.</li>
            <li>국고 본금고(`treasury`) 계좌에서 차변/대변 대차평형을 맞춰 원자적으로 출금 및 입금합니다.</li>
            <li>만기(maturity_at &le; now())가 도래한 채권은 원금을 전액 자동 환급하고 상태를 `MATURED`로 갱신합니다.</li>
            <li>모든 분개 내역은 `economy_post_transaction` 불변 원장에 영구 기록됩니다.</li>
          </ul>
          <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-emerald-300 font-mono text-[11px]">
            🛡️ 헌법적 무결성: 잔액 직접 수정이 원천 차단되며, 대차평형 불일치 시 0건 롤백됩니다.
          </div>
        </div>
      </AdminActionModal>
    </div>
  );
}
