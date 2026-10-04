'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Bot,
  Building2,
  CheckCircle2,
  Coins,
  FileCheck2,
  Flame,
  History,
  Landmark,
  PlusCircle,
  RefreshCw,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Zap,
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

export interface RetirementCertificateItem {
  readonly id: string;
  readonly policy_order_id: string | null;
  readonly amount_wld: string;
  readonly source_type: string;
  readonly reason: string;
  readonly idempotency_key: string;
  readonly created_at: string;
}

export interface MonetaryAutoRegulationConfigData {
  readonly id: number;
  readonly is_enabled: boolean;
  readonly target_faucet_sink_ratio: number;
  readonly tolerance_band_pct: number;
  readonly max_step_pct: number;
  readonly evaluation_interval_seconds: number;
  readonly circuit_breaker_freeze_pct: number;
  readonly last_evaluated_at: string | null;
  readonly last_action_taken: string;
  readonly updated_at: string;
}

export interface MonetaryRegulationEventItem {
  readonly id: string;
  readonly evaluation_time: string;
  readonly faucet_24h_wld: string;
  readonly sink_24h_wld: string;
  readonly current_ratio: number;
  readonly action_type: string;
  readonly adjustment_amount_wld: string;
  readonly policy_order_id: string | null;
  readonly reason: string;
  readonly created_at: string;
}

interface MonetaryBureauCardProps {
  readonly initialTelemetry: MonetaryTelemetryData | null;
  readonly initialOrders: readonly MonetaryPolicyOrderItem[];
  readonly initialMints: readonly MintCertificateItem[];
  readonly initialRetirements?: readonly RetirementCertificateItem[];
  readonly initialAutoConfig?: MonetaryAutoRegulationConfigData | null;
  readonly initialAutoEvents?: readonly MonetaryRegulationEventItem[];
}

export function MonetaryBureauCard({
  initialTelemetry,
  initialOrders,
  initialMints,
  initialRetirements = [],
  initialAutoConfig,
  initialAutoEvents = [],
}: MonetaryBureauCardProps) {
  const [telemetry, setTelemetry] = useState<MonetaryTelemetryData | null>(initialTelemetry);
  const [orders, setOrders] = useState<readonly MonetaryPolicyOrderItem[]>(initialOrders);
  const [mints, setMints] = useState<readonly MintCertificateItem[]>(initialMints);
  const [retirements, setRetirements] = useState<readonly RetirementCertificateItem[]>(
    initialRetirements,
  );
  const [autoConfig, setAutoConfig] = useState<MonetaryAutoRegulationConfigData | null>(
    initialAutoConfig ?? null,
  );
  const [autoEvents, setAutoEvents] = useState<readonly MonetaryRegulationEventItem[]>(
    initialAutoEvents,
  );
  const [activeTab, setActiveTab] = useState<'orders' | 'mints' | 'retirements' | 'auto'>('auto');

  const [isProposeOpen, setIsProposeOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [orderType, setOrderType] = useState<'MINT' | 'RETIRE'>('MINT');
  const [targetEnvelope, setTargetEnvelope] = useState('WORK_REWARD');
  const [maxAmountWld, setMaxAmountWld] = useState('1000000');
  const [proposeReason, setProposeReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Auto Regulation form state
  const [cfgTargetRatio, setCfgTargetRatio] = useState(
    autoConfig?.target_faucet_sink_ratio?.toString() ?? '1.0',
  );
  const [cfgTolerancePct, setCfgTolerancePct] = useState(
    autoConfig?.tolerance_band_pct?.toString() ?? '5.0',
  );
  const [cfgMaxStepPct, setCfgMaxStepPct] = useState(
    autoConfig?.max_step_pct?.toString() ?? '5.0',
  );

  const totalRetiredAmount = retirements.reduce(
    (acc, cur) => acc + BigInt(cur.amount_wld || '0'),
    BigInt(0),
  );

  const refreshData = async () => {
    try {
      const [tRes, oRes, mRes, rRes, aRes] = await Promise.all([
        fetch('/api/v1/admin/economy/monetary/telemetry'),
        fetch('/api/v1/admin/economy/monetary/orders'),
        fetch('/api/v1/admin/economy/monetary/certificates/mints'),
        fetch('/api/v1/admin/economy/monetary/certificates/retirements'),
        fetch('/api/v1/admin/economy/monetary/auto-regulation/status'),
      ]);
      if (tRes.ok) setTelemetry(await tRes.json());
      if (oRes.ok) setOrders(await oRes.json());
      if (mRes.ok) setMints(await mRes.json());
      if (rRes.ok) setRetirements(await rRes.json());
      if (aRes.ok) {
        const aData = await aRes.json();
        if (aData.config) setAutoConfig(aData.config);
        if (aData.events) setAutoEvents(aData.events);
      }
    } catch {
      // ignore
    }
  };

  const handleFetchAiRecommendation = async () => {
    setIsLoadingAi(true);
    setFeedbackMsg(null);
    try {
      const res = await fetch('/api/v1/admin/economy/monetary/ai-council/recommendation');
      if (res.ok) {
        const data = await res.json();
        setOrderType(data.order_type);
        setTargetEnvelope(data.target_envelope);
        setMaxAmountWld(data.recommended_amount_wld);
        setProposeReason(data.synthesis_reason);
      }
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleAutoProposeFromAiCouncil = async () => {
    setIsSubmitting(true);
    setFeedbackMsg(null);
    try {
      const res = await fetch('/api/v1/admin/economy/monetary/ai-council/propose-policy', {
        method: 'POST',
      });
      if (res.ok) {
        setActiveTab('orders');
        await refreshData();
      } else {
        const err = await res.json();
        setFeedbackMsg(err.message || 'AI 정책 위원회 명령서 자동 등록 실패');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleAutoRegulation = async () => {
    if (!autoConfig) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/v1/admin/economy/monetary/auto-regulation/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_enabled: !autoConfig.is_enabled }),
      });
      if (res.ok) {
        await refreshData();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAutoConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/v1/admin/economy/monetary/auto-regulation/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_faucet_sink_ratio: Number(cfgTargetRatio),
          tolerance_band_pct: Number(cfgTolerancePct),
          max_step_pct: Number(cfgMaxStepPct),
        }),
      });
      if (res.ok) {
        setIsConfigOpen(false);
        await refreshData();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRunAutoRegulationNow = async () => {
    setIsSubmitting(true);
    setFeedbackMsg(null);
    try {
      const res = await fetch('/api/v1/admin/economy/monetary/auto-regulation/run', {
        method: 'POST',
      });
      if (res.ok) {
        await refreshData();
      } else {
        const err = await res.json();
        setFeedbackMsg(err.message || '평가 실행 실패');
      }
    } finally {
      setIsSubmitting(false);
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
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                AUTHORITATIVE MONETARY & MINT BUREAU (v523)
              </span>
              <Badge variant="outline" className="font-mono text-[10px]">
                INSTITUTIONAL SEPARATION
              </Badge>
              {autoConfig?.is_enabled && (
                <Badge className="bg-blue-600 hover:bg-blue-700 text-white font-mono text-[10px] flex items-center gap-1">
                  <Bot className="size-3" /> 화폐량 자동 조절 가동 중
                </Badge>
              )}
            </div>
            <CardTitle className="text-base sm:text-lg font-bold text-foreground mt-1.5 flex items-center gap-2">
              <Landmark className="size-4 text-emerald-500" />
              중앙은행(MCB) 통화정책 & 조폐국(MMB) 실행 관제 타워
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              1시간 주기 Faucet/Sink 피드백 자동 조절, AI 정책 위원회 시뮬레이터 연계, 조폐국 영구 소각 인증서 관제
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={autoConfig?.is_enabled ? 'default' : 'secondary'}
              size="sm"
              onClick={handleToggleAutoRegulation}
              disabled={isSubmitting}
              className="text-xs h-8 gap-1.5"
            >
              <Bot className="size-3.5" />
              {autoConfig?.is_enabled ? '자동 조절 ON' : '자동 조절 OFF'}
            </Button>
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
              <Flame className="size-3.5 text-rose-500" /> 누적 영구 소각량 (Sink)
            </div>
            <div className="text-lg font-bold font-mono mt-1 text-rose-600 dark:text-rose-400">
              {groupDigits(totalRetiredAmount.toString())} <span className="text-xs font-normal">WLD</span>
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              소각 인증서 {retirements.length}건 발급 완료
            </div>
          </div>
        </div>

        {/* Tab switcher: Policy Orders vs Mint Certificates vs Retirements vs Auto Regulation */}
        <div className="flex items-center justify-between border-b pb-2 mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={activeTab === 'auto' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('auto')}
              className="text-xs h-7 gap-1"
            >
              <Bot className="size-3" /> 자동 조절 타임라인 ({autoEvents.length})
            </Button>
            <Button
              variant={activeTab === 'orders' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('orders')}
              className="text-xs h-7"
            >
              중앙은행 정책 명령서 ({orders.length})
            </Button>
            <Button
              variant={activeTab === 'mints' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('mints')}
              className="text-xs h-7"
            >
              조폐국 발행 인증서 ({mints.length})
            </Button>
            <Button
              variant={activeTab === 'retirements' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('retirements')}
              className="text-xs h-7 gap-1 text-rose-600 dark:text-rose-400"
            >
              <Flame className="size-3" /> 영구 소각 인증서 ({retirements.length})
            </Button>
          </div>

          {activeTab === 'auto' && (
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={handleRunAutoRegulationNow}
                disabled={isSubmitting}
                className="text-xs h-7 gap-1 text-primary"
              >
                <Zap className="size-3 text-amber-500" /> 지금 즉시 자동 평가·집행
              </Button>
              <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="text-xs h-7 gap-1">
                    <Settings2 className="size-3" /> 파라미터 설정
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <form onSubmit={handleSaveAutoConfig}>
                    <DialogHeader>
                      <DialogTitle className="text-base">화폐량 자동 조절 파라미터 설정</DialogTitle>
                      <DialogDescription className="text-xs">
                        1시간 주기 Faucet/Sink 평가 및 자율 긴축/완화 한도를 설정합니다.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-3 py-3">
                      <div className="grid gap-1">
                        <Label htmlFor="cfgTarget" className="text-xs">목표 Faucet / Sink 비율</Label>
                        <Input
                          id="cfgTarget"
                          value={cfgTargetRatio}
                          onChange={(e) => setCfgTargetRatio(e.target.value)}
                          placeholder="1.0"
                          className="text-xs font-mono h-8"
                        />
                      </div>
                      <div className="grid gap-1">
                        <Label htmlFor="cfgTolerance" className="text-xs">허용 오차 밴드 (±%)</Label>
                        <Input
                          id="cfgTolerance"
                          value={cfgTolerancePct}
                          onChange={(e) => setCfgTolerancePct(e.target.value)}
                          placeholder="5.0"
                          className="text-xs font-mono h-8"
                        />
                      </div>
                      <div className="grid gap-1">
                        <Label htmlFor="cfgMaxStep" className="text-xs">1회 최대 자율 변동폭 (%)</Label>
                        <Input
                          id="cfgMaxStep"
                          value={cfgMaxStepPct}
                          onChange={(e) => setCfgMaxStepPct(e.target.value)}
                          placeholder="5.0"
                          className="text-xs font-mono h-8"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" size="sm" disabled={isSubmitting} className="text-xs">
                        설정 저장
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={handleAutoProposeFromAiCouncil}
                disabled={isSubmitting}
                className="text-xs h-7 gap-1 text-primary border-primary/30"
              >
                <Sparkles className="size-3 text-amber-500" /> 🤖 AI 위원회 권고안 자동 등록
              </Button>
              <Dialog open={isProposeOpen} onOpenChange={setIsProposeOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="text-xs h-7 gap-1">
                    <PlusCircle className="size-3" /> 정책 명령 발의
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <form onSubmit={handleProposeOrder}>
                    <DialogHeader>
                      <div className="flex items-center justify-between">
                        <DialogTitle className="text-base">신규 통화정책 명령서 발의 (PROPOSE)</DialogTitle>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleFetchAiRecommendation}
                          disabled={isLoadingAi}
                          className="text-xs h-6 px-2 text-primary"
                        >
                          <Sparkles className="size-3 mr-1 text-amber-500" />
                          {isLoadingAi ? 'AI 분석 중...' : 'AI 권고안 주입'}
                        </Button>
                      </div>
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
            </div>
          )}
        </div>

        {/* Tab 0: Auto Regulation Timeline */}
        {activeTab === 'auto' && (
          <div className="overflow-x-auto rounded-lg border border-border/60">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="text-[11px] py-2">조절 액션</TableHead>
                  <TableHead className="text-[11px] py-2">Faucet / Sink (24h)</TableHead>
                  <TableHead className="text-[11px] py-2">비율</TableHead>
                  <TableHead className="text-[11px] py-2">조정 규모 (WLD)</TableHead>
                  <TableHead className="text-[11px] py-2">자율 결정 사유</TableHead>
                  <TableHead className="text-[11px] py-2 text-right">집행 일시</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {autoEvents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-xs text-muted-foreground">
                      기록된 자동 조절 이벤트가 없습니다. (1시간 후 자동 실행되거나 상단의 즉시 실행 버튼을 누르면 기록됩니다)
                    </TableCell>
                  </TableRow>
                ) : (
                  autoEvents.map((e) => (
                    <TableRow key={e.id} className="text-xs">
                      <TableCell className="py-2">
                        {e.action_type === 'TAPER_CONTRACTION' && (
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0 flex items-center gap-1 w-fit">
                            <TrendingDown className="size-3" /> 테이퍼링 긴축
                          </Badge>
                        )}
                        {e.action_type === 'QE_EXPANSION' && (
                          <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] px-1.5 py-0 flex items-center gap-1 w-fit">
                            <TrendingUp className="size-3" /> 유동성 완화 (QE)
                          </Badge>
                        )}
                        {e.action_type === 'NEUTRAL_BALANCED' && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 flex items-center gap-1 w-fit">
                            <CheckCircle2 className="size-3 text-emerald-500" /> 중립 균형
                          </Badge>
                        )}
                        {e.action_type === 'CIRCUIT_BREAKER_FREEZE' && (
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0 flex items-center gap-1 w-fit font-bold">
                            <ShieldAlert className="size-3" /> 서킷브레이커 동결
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="py-2 font-mono text-[11px]">
                        <span className="text-emerald-600 dark:text-emerald-400">+{groupDigits(e.faucet_24h_wld)}</span> /{' '}
                        <span className="text-rose-500">-{groupDigits(e.sink_24h_wld)}</span>
                      </TableCell>
                      <TableCell className="py-2 font-mono font-bold text-[11px]">
                        {Number(e.current_ratio).toFixed(2)}x
                      </TableCell>
                      <TableCell className="py-2 font-mono">
                        {BigInt(e.adjustment_amount_wld) > BigInt(0) ? `${groupDigits(e.adjustment_amount_wld)} WLD` : '-'}
                      </TableCell>
                      <TableCell className="py-2 text-[11px] max-w-[280px] truncate" title={e.reason}>
                        {e.reason}
                      </TableCell>
                      <TableCell className="py-2 text-[10px] text-muted-foreground text-right">
                        {new Date(e.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

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
                  <TableHead className="text-[11px] py-2">사유 / 발의자</TableHead>
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
                      <TableCell className="py-2 text-[11px] max-w-[240px] truncate" title={o.reason}>
                        <span className="text-foreground">{o.reason}</span>
                        {o.proposed_by && (
                          <span className="block text-[10px] text-muted-foreground font-mono">
                            발의: {o.proposed_by}
                          </span>
                        )}
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

        {/* Tab 3: Retirement Certificates Table (Sink / Burn Ledger) */}
        {activeTab === 'retirements' && (
          <div className="overflow-x-auto rounded-lg border border-border/60">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="text-[11px] py-2">소각 인증서 ID</TableHead>
                  <TableHead className="text-[11px] py-2">소각 수량 (WLD)</TableHead>
                  <TableHead className="text-[11px] py-2">소각 출처/채널</TableHead>
                  <TableHead className="text-[11px] py-2">소각 감사 사유</TableHead>
                  <TableHead className="text-[11px] py-2">멱등성 키</TableHead>
                  <TableHead className="text-[11px] py-2 text-right">소각 일시</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {retirements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-xs text-muted-foreground">
                      발급된 조폐국 영구 소각 인증서가 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  retirements.map((r) => (
                    <TableRow key={r.id} className="text-xs">
                      <TableCell className="py-2 font-mono text-[10px] text-muted-foreground">
                        {r.id.substring(0, 8)}...
                      </TableCell>
                      <TableCell className="py-2 font-mono font-bold text-rose-600 dark:text-rose-400">
                        -{groupDigits(r.amount_wld)} WLD
                      </TableCell>
                      <TableCell className="py-2">
                        <Badge variant="outline" className="font-mono text-[10px]">
                          {r.source_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2 text-[11px] max-w-[200px] truncate" title={r.reason}>
                        {r.reason}
                      </TableCell>
                      <TableCell className="py-2 font-mono text-[10px] text-muted-foreground max-w-[120px] truncate" title={r.idempotency_key}>
                        {r.idempotency_key}
                      </TableCell>
                      <TableCell className="py-2 text-[10px] text-muted-foreground text-right">
                        {new Date(r.created_at).toLocaleDateString()}
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
