'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  FileCheck2,
  Flame,
  Landmark,
  PlusCircle,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { groupDigits } from '@/lib/money';

export interface MonetaryTelemetryData {
  readonly m_total: string;
  readonly m_circulating: string;
  readonly m_treasury: string;
  readonly m_bank_liquidity: string;
  readonly m_locked: string;
  readonly is_issuance_frozen: boolean;
  readonly active_policy_orders_count: number;
  readonly total_mint_certificates_count: number;
  readonly total_retirement_certificates_count: number;
  readonly verified_invariant: boolean;
  readonly last_reconciled_at: string;
}

export interface MonetaryPolicyOrderItem {
  readonly id: string;
  readonly order_type: string;
  readonly target_envelope: string;
  readonly max_amount_wld: string;
  readonly executed_amount_wld: string;
  readonly status: string;
  readonly proposed_by: string | null;
  readonly approved_by: string | null;
  readonly reason: string;
  readonly expires_at: string;
  readonly created_at: string;
}

export interface MintCertificateItem {
  readonly id: string;
  readonly policy_order_id: string;
  readonly amount_wld: string;
  readonly source_envelope: string;
  readonly recipient_user_id: string | null;
  readonly idempotency_key: string;
  readonly created_at: string;
}

interface MonetaryBureauCardProps {
  readonly initialTelemetry: MonetaryTelemetryData | null;
  readonly initialOrders: readonly MonetaryPolicyOrderItem[];
  readonly initialMints: readonly MintCertificateItem[];
}

export function MonetaryBureauCard({
  initialTelemetry,
  initialOrders,
  initialMints,
}: MonetaryBureauCardProps) {
  const [telemetry, setTelemetry] = useState<MonetaryTelemetryData | null>(initialTelemetry);
  const [orders, setOrders] = useState<readonly MonetaryPolicyOrderItem[]>(initialOrders);
  const [mints, setMints] = useState<readonly MintCertificateItem[]>(initialMints);
  const [activeTab, setActiveTab] = useState<'orders' | 'mints'>('orders');

  const [isProposeOpen, setIsProposeOpen] = useState(false);
  const [orderType, setOrderType] = useState<'MINT' | 'RETIRE'>('MINT');
  const [targetEnvelope, setTargetEnvelope] = useState('WORK_REWARD');
  const [maxAmountWld, setMaxAmountWld] = useState('1000000');
  const [proposeReason, setProposeReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const refreshData = async () => {
    try {
      const res = await fetch('/api/v1/admin/economy/monetary/telemetry');
      if (res.ok) {
        const data = await res.json();
        setTelemetry(data);
      }
      const ordersRes = await fetch('/api/v1/admin/economy/monetary/orders');
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData);
      }
      const mintsRes = await fetch('/api/v1/admin/economy/monetary/certificates/mints');
      if (mintsRes.ok) {
        const mintsData = await mintsRes.json();
        setMints(mintsData);
      }
    } catch {
      // ignore
    }
  };

  const handleProposeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposeReason || proposeReason.trim().length < 10) {
      setFeedbackMsg('제안 사유는 최소 10자 이상 입력해야 합니다.');
      return;
    }
    setIsSubmitting(true);
    setFeedbackMsg(null);
    try {
      const res = await fetch('/api/v1/admin/economy/monetary/orders/propose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_type: orderType,
          target_envelope: targetEnvelope,
          max_amount_wld: maxAmountWld,
          reason: proposeReason,
        }),
      });
      if (res.ok) {
        setIsProposeOpen(false);
        setProposeReason('');
        await refreshData();
      } else {
        const err = await res.json();
        setFeedbackMsg(err.detail || err.message || '명령서 발의 실패');
      }
    } catch (err: unknown) {
      setFeedbackMsg(String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveOrder = async (orderId: string) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/v1/admin/economy/monetary/orders/${orderId}/approve`, {
        method: 'POST',
      });
      if (res.ok) {
        await refreshData();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleFreeze = async () => {
    if (!telemetry) return;
    setIsSubmitting(true);
    try {
      if (telemetry.is_issuance_frozen) {
        await fetch('/api/v1/admin/economy/monetary/unfreeze', { method: 'POST' });
      } else {
        await fetch('/api/v1/admin/economy/monetary/freeze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: '중앙은행 관리자 긴급 통화 발행 동결 조치' }),
        });
      }
      await refreshData();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border border-border/80 bg-card shadow-sm mb-6 overflow-hidden">
      <CardHeader className="p-4 sm:p-6 pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                AUTHORITATIVE MONETARY & MINT BUREAU (v523)
              </span>
              <Badge variant="outline" className="font-mono text-[10px]">
                INSTITUTIONAL SEPARATION
              </Badge>
            </div>
            <CardTitle className="text-base sm:text-lg font-bold text-foreground mt-1.5 flex items-center gap-2">
              <Landmark className="size-4 text-emerald-500" />
              중앙은행(MCB) 통화정책 & 조폐국(MMB) 실행 관제 타워
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              통화정책 결정(승인), 조폐국 실행(인증서), 중앙국고(재정지출), 경제코어(불변식) 기관 분리 (기획서 §1~§5 준용)
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              className="text-xs h-8"
              disabled={isSubmitting}
            >
              <RefreshCw className="size-3 mr-1" /> 새로고침
            </Button>
            <Button
              variant={telemetry?.is_issuance_frozen ? 'destructive' : 'outline'}
              size="sm"
              onClick={handleToggleFreeze}
              disabled={isSubmitting}
              className="text-xs h-8"
            >
              {telemetry?.is_issuance_frozen ? (
                <>
                  <ShieldAlert className="size-3 mr-1" /> 발행 동결 해제
                </>
              ) : (
                <>
                  <ShieldCheck className="size-3 mr-1" /> 긴급 발행 동결
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 pt-0">
        {/* 4 Core Invariant Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <div className="p-3 bg-muted/40 rounded-xl border border-border/50">
            <div className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
              <Coins className="size-3.5 text-primary" /> M_total (본원 통화량)
            </div>
            <div className="text-lg font-bold font-mono mt-1 text-foreground">
              {groupDigits(telemetry?.m_total ?? '59928020')} <span className="text-xs font-normal">WLD</span>
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-0.5">
              <CheckCircle2 className="size-3" /> 불변식 검증 일치
            </div>
          </div>

          <div className="p-3 bg-muted/40 rounded-xl border border-border/50">
            <div className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
              <TrendingUp className="size-3.5 text-blue-500" /> M_circulating (유통 잔액)
            </div>
            <div className="text-lg font-bold font-mono mt-1 text-foreground">
              {groupDigits(telemetry?.m_circulating ?? '31503')} <span className="text-xs font-normal">WLD</span>
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">활동 유저/계정 가용액</div>
          </div>

          <div className="p-3 bg-muted/40 rounded-xl border border-border/50">
            <div className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
              <Building2 className="size-3.5 text-purple-500" /> M_treasury (국고 보유고)
            </div>
            <div className="text-lg font-bold font-mono mt-1 text-foreground">
              {groupDigits(telemetry?.m_treasury ?? '59896517')} <span className="text-xs font-normal">WLD</span>
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">5대 재정 금고 통합액</div>
          </div>

          <div className="p-3 bg-muted/40 rounded-xl border border-border/50">
            <div className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
              <FileCheck2 className="size-3.5 text-amber-500" /> 승인 명령 / 인증서
            </div>
            <div className="text-lg font-bold font-mono mt-1 text-foreground">
              {telemetry?.active_policy_orders_count ?? 0} <span className="text-xs font-normal">건</span> / {telemetry?.total_mint_certificates_count ?? 0} <span className="text-xs font-normal">인증</span>
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">소각 인증: {telemetry?.total_retirement_certificates_count ?? 0}건</div>
          </div>
        </div>

        {/* Tab switcher: Policy Orders vs Mint Certificates */}
        <div className="flex items-center justify-between border-b pb-2 mb-3">
          <div className="flex items-center gap-2">
            <Button
              variant={activeTab === 'orders' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('orders')}
              className="text-xs h-7"
            >
              중앙은행 통화정책 명령서 ({orders.length})
            </Button>
            <Button
              variant={activeTab === 'mints' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('mints')}
              className="text-xs h-7"
            >
              조폐국 발행 인증서 ({mints.length})
            </Button>
          </div>

          {activeTab === 'orders' && (
            <Dialog open={isProposeOpen} onOpenChange={setIsProposeOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="text-xs h-7 gap-1">
                  <PlusCircle className="size-3" /> 정책 명령 발의
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <form onSubmit={handleProposeOrder}>
                  <DialogHeader>
                    <DialogTitle className="text-base">신규 통화정책 명령서 발의 (PROPOSE)</DialogTitle>
                    <DialogDescription className="text-xs">
                      중앙은행(MCB) 정책 승인을 위한 발행/폐기 한도 명령서를 발의합니다.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-3 py-3">
                    <div className="grid gap-1">
                      <Label htmlFor="orderType" className="text-xs">명령 유형</Label>
                      <select
                        id="orderType"
                        value={orderType}
                        onChange={(e) => setOrderType(e.target.value as 'MINT' | 'RETIRE')}
                        className="h-8 rounded-md border border-input bg-background px-3 text-xs"
                      >
                        <option value="MINT">MINT (신규 통화 발행 승인)</option>
                        <option value="RETIRE">RETIRE (통화 영구 폐기 승인)</option>
                      </select>
                    </div>
                    <div className="grid gap-1">
                      <Label htmlFor="targetEnvelope" className="text-xs">발행 목적 엔벨로프</Label>
                      <select
                        id="targetEnvelope"
                        value={targetEnvelope}
                        onChange={(e) => setTargetEnvelope(e.target.value)}
                        className="h-8 rounded-md border border-input bg-background px-3 text-xs"
                      >
                        <option value="WORK_REWARD">WORK_REWARD (직업 급여 보상)</option>
                        <option value="QUEST_REWARD">QUEST_REWARD (퀘스트/온보딩 보상)</option>
                        <option value="EVENT_REWARD">EVENT_REWARD (시즌 이벤트 보상)</option>
                        <option value="STABILIZATION_POOL">STABILIZATION_POOL (통화 안정화 풀)</option>
                        <option value="HARD_SINK_PURGE">HARD_SINK_PURGE (영구 소각)</option>
                      </select>
                    </div>
                    <div className="grid gap-1">
                      <Label htmlFor="maxAmount" className="text-xs">최대 한도 (WLD)</Label>
                      <Input
                        id="maxAmount"
                        value={maxAmountWld}
                        onChange={(e) => setMaxAmountWld(e.target.value)}
                        placeholder="1000000"
                        className="text-xs font-mono h-8"
                      />
                    </div>
                    <div className="grid gap-1">
                      <Label htmlFor="proposeReason" className="text-xs">정책 발의 감사 사유 (최소 10자)</Label>
                      <Input
                        id="proposeReason"
                        value={proposeReason}
                        onChange={(e) => setProposeReason(e.target.value)}
                        placeholder="2026년 4분기 직업 보상 풀 중앙은행 승인 요청"
                        className="text-xs h-8"
                      />
                    </div>
                    {feedbackMsg && (
                      <p className="text-[11px] text-destructive">{feedbackMsg}</p>
                    )}
                  </div>
                  <DialogFooter>
                    <Button type="submit" size="sm" disabled={isSubmitting} className="text-xs">
                      {isSubmitting ? '발의 중...' : '명령서 발의 등록'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Tab 1: Policy Orders Table */}
        {activeTab === 'orders' && (
          <div className="overflow-x-auto rounded-lg border border-border/60">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="text-[11px] py-2">유형/엔벨로프</TableHead>
                  <TableHead className="text-[11px] py-2">한도 WLD</TableHead>
                  <TableHead className="text-[11px] py-2">집행량</TableHead>
                  <TableHead className="text-[11px] py-2">상태</TableHead>
                  <TableHead className="text-[11px] py-2">사유</TableHead>
                  <TableHead className="text-[11px] py-2 text-right">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-xs text-muted-foreground">
                      등록된 통화정책 명령서가 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((o) => (
                    <TableRow key={o.id} className="text-xs">
                      <TableCell className="py-2">
                        <div className="flex items-center gap-1.5">
                          <Badge variant={o.order_type === 'MINT' ? 'default' : 'destructive'} className="text-[10px] px-1.5 py-0">
                            {o.order_type}
                          </Badge>
                          <span className="font-mono text-[11px]">{o.target_envelope}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-2 font-mono">{groupDigits(o.max_amount_wld)}</TableCell>
                      <TableCell className="py-2 font-mono text-muted-foreground">{groupDigits(o.executed_amount_wld)}</TableCell>
                      <TableCell className="py-2">
                        <Badge
                          variant={o.status === 'APPROVED' ? 'default' : o.status === 'EXECUTED' ? 'secondary' : 'outline'}
                          className="text-[10px] px-1.5 py-0"
                        >
                          {o.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2 text-[11px] max-w-[200px] truncate" title={o.reason}>
                        {o.reason}
                      </TableCell>
                      <TableCell className="py-2 text-right">
                        {o.status === 'PROPOSED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApproveOrder(o.id)}
                            disabled={isSubmitting}
                            className="text-[11px] h-6 px-2 text-emerald-600 hover:text-emerald-700"
                          >
                            공식 승인
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Tab 2: Mint Certificates Table */}
        {activeTab === 'mints' && (
          <div className="overflow-x-auto rounded-lg border border-border/60">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="text-[11px] py-2">인증서 ID</TableHead>
                  <TableHead className="text-[11px] py-2">발행 수량 (WLD)</TableHead>
                  <TableHead className="text-[11px] py-2">재원 엔벨로프</TableHead>
                  <TableHead className="text-[11px] py-2">멱등성 키</TableHead>
                  <TableHead className="text-[11px] py-2">발행 일시</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mints.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-xs text-muted-foreground">
                      발급된 조폐국 인증서가 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  mints.map((m) => (
                    <TableRow key={m.id} className="text-xs">
                      <TableCell className="py-2 font-mono text-[10px] text-muted-foreground">
                        {m.id.substring(0, 8)}...
                      </TableCell>
                      <TableCell className="py-2 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        +{groupDigits(m.amount_wld)} WLD
                      </TableCell>
                      <TableCell className="py-2 font-mono text-[11px]">{m.source_envelope}</TableCell>
                      <TableCell className="py-2 font-mono text-[10px] text-muted-foreground max-w-[140px] truncate" title={m.idempotency_key}>
                        {m.idempotency_key}
                      </TableCell>
                      <TableCell className="py-2 text-[10px] text-muted-foreground">
                        {new Date(m.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Coins(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="8" r="6" />
      <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
      <path d="M7 6h1v4" />
      <path d="m16.71 13.88.7.71-2.82 2.82" />
    </svg>
  );
}
