'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Coins,
  CheckCircle2,
  Flame,
  Snowflake,
  Play,
  FileText,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Clock,
  Shield,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { parseMintStatusEvidence, type MintStatusEvidence } from './mint-status-evidence';
import {
  MintExecutionDialog,
  RetireExecutionDialog,
  type PolicyOrderSummary,
} from './mint-dialogs';

interface MintCertificate {
  id: string;
  policy_order_id: string;
  amount_wld: string;
  source_envelope: string;
  recipient_user_id: string | null;
  idempotency_key: string;
  created_at: string;
}

interface RetirementCertificate {
  id: string;
  policy_order_id: string | null;
  amount_wld: string;
  source_type: string;
  actor_id: string;
  reason: string;
  idempotency_key: string;
  created_at: string;
}

export function NationalMintPanel() {
  const [evidence, setEvidence] = useState<MintStatusEvidence | null>(null);
  const [orders, setOrders] = useState<PolicyOrderSummary[]>([]);
  const [mintCerts, setMintCerts] = useState<MintCertificate[]>([]);
  const [retireCerts, setRetireCerts] = useState<RetirementCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Dialog & Action states
  const [mintDialogOpen, setMintDialogOpen] = useState(false);
  const [retireDialogOpen, setRetireDialogOpen] = useState(false);
  const [selectedOrderIdForMint, setSelectedOrderIdForMint] = useState<string | null>(null);
  const [freezeLoading, setFreezeLoading] = useState(false);
  const [activeLedgerTab, setActiveLedgerTab] = useState<'MINTS' | 'RETIREMENTS'>('MINTS');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const loadAllData = useCallback(async () => {
    try {
      const [statusRes, ordersRes, certsRes] = await Promise.all([
        fetch(`/api/admin/mint/status?_t=${Date.now()}`, { cache: 'no-store' }),
        fetch(`/api/admin/mint/orders?_t=${Date.now()}`, { cache: 'no-store' }).catch(() => null),
        fetch(`/api/admin/mint/certificates?_t=${Date.now()}`, { cache: 'no-store' }).catch(() => null),
      ]);

      if (statusRes.ok) {
        const body = await statusRes.json();
        if (body?.source === 'persistent_monetary_policy') {
          const parsed = parseMintStatusEvidence(body);
          setEvidence(parsed);
          setError(parsed === null);
        } else {
          setError(true);
        }
      } else {
        setError(true);
      }

      if (ordersRes && ordersRes.ok) {
        const data = await ordersRes.json();
        if (Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
      }

      if (certsRes && certsRes.ok) {
        const data = await certsRes.json();
        if (Array.isArray(data.mints)) setMintCerts(data.mints);
        if (Array.isArray(data.retirements)) setRetireCerts(data.retirements);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // 20s auto sync
  useEffect(() => {
    const timer = setInterval(() => {
      loadAllData();
    }, 20000);
    return () => clearInterval(timer);
  }, [loadAllData]);

  // 긴급 동결 / 동결 해제 핸들러
  const handleToggleFreeze = async () => {
    if (!evidence) return;
    const willFreeze = !evidence.is_issuance_frozen;
    const confirmMessage = willFreeze
      ? '신규 화폐 발행을 즉시 긴급 동결하시겠습니까? 모든 신규 M0 주조가 차단됩니다.'
      : '통화 발행 긴급 동결을 해제하시겠습니까? 정식 주조가 재개됩니다.';

    if (!window.confirm(confirmMessage)) return;

    setFreezeLoading(true);
    try {
      const res = await fetch('/api/admin/mint/freeze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          freeze: willFreeze,
          reason: willFreeze ? '관리자 관제탑 수동 긴급 동결 발동' : undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || '동결 상태 변경에 실패했습니다.');
      } else {
        await loadAllData();
      }
    } catch {
      alert('동결 상태 변경 중 네트워크 오류가 발생했습니다.');
    } finally {
      setFreezeLoading(false);
    }
  };

  const approvedOrders = orders.filter((o) => o.status === 'APPROVED');

  const totalMintedWld = mintCerts.reduce(
    (acc, c) => acc + BigInt(c.amount_wld || '0'),
    BigInt(0),
  );
  const totalRetiredWld = retireCerts.reduce(
    (acc, c) => acc + BigInt(c.amount_wld || '0'),
    BigInt(0),
  );

  return (
    <section className="space-y-6" aria-label="국가조폐국 실시간 관제탑">
      {/* 상단 헤더 & 액션 컨트롤 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm">
            <Coins className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                국가조폐국 (National Mint Bureau)
              </h2>
              <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                M0 Currency Issuer
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              공식 승인된 통화정책 명령에 따라 M0 법정화폐를 주조·소각하고 인증서를 발급합니다.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 text-xs rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            20초 자동 동기화
          </div>

          <Button
            size="sm"
            variant="outline"
            disabled={freezeLoading}
            onClick={handleToggleFreeze}
            className={`rounded-xl text-xs font-semibold h-8 border ${
              evidence?.is_issuance_frozen
                ? 'border-rose-500/50 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                : 'border-amber-500/40 text-amber-400 hover:bg-amber-500/10'
            }`}
          >
            <Snowflake className="size-3.5 mr-1" />
            {evidence?.is_issuance_frozen ? '긴급 동결 해제' : '긴급 발행 동결'}
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setSelectedOrderIdForMint(null);
              setMintDialogOpen(true);
            }}
            disabled={evidence?.is_issuance_frozen}
            className="rounded-xl text-xs font-semibold h-8 bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
          >
            <Coins className="size-3.5 mr-1" />
            신규 통화 주조
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setRetireDialogOpen(true)}
            className="rounded-xl text-xs font-semibold h-8 border-rose-500/40 text-rose-400 hover:bg-rose-500/10"
          >
            <Flame className="size-3.5 mr-1" />
            화폐 영구 소각
          </Button>
        </div>
      </div>

      {loading && (
        <div role="status" className="flex items-center gap-2 text-sm text-muted-foreground p-4">
          <RefreshCw className="size-4 animate-spin text-primary" />
          <span>조폐국 원장 및 정책 DB 동기화 검증 중...</span>
        </div>
      )}

      {error && (
        <div role="alert" className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-300 flex items-center gap-2.5">
          <AlertCircle className="size-5 shrink-0 text-rose-400" />
          <span>조폐국 공식 정책·증명서 조회가 실패했습니다. 실시간 집행 상태로 인정하지 않습니다.</span>
        </div>
      )}

      {evidence && (
        <>
          {/* 핵심 통계 카드 그리드 */}
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-emerald-400" />
              <span>정책 DB 조회 완료</span>
              <span className="text-muted-foreground/80 font-normal hidden sm:inline">(운영 통화정책 원장 실시간 동기화)</span>
            </span>
            {evidence.is_issuance_frozen && (
              <span role="alert" className="text-xs font-bold text-rose-400 px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 animate-pulse">
                발행 동결
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border/80 bg-card/60">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <span className="block text-xs font-medium text-muted-foreground">승인된 정책 명령</span>
                  <strong className="text-2xl font-bold font-mono tracking-tight text-foreground">
                    {evidence.active_policy_orders_count.toLocaleString('ko-KR')}
                    <span className="text-xs font-normal text-muted-foreground ml-1">건</span>
                  </strong>
                  <span className="block text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                    <Play className="size-2.5" /> 즉시 주조 가능
                  </span>
                </div>
                <div className="size-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <FileText className="size-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80 bg-card/60">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <span className="block text-xs font-medium text-muted-foreground">정식 발행 증명서 기록</span>
                  <strong className="text-2xl font-bold font-mono tracking-tight text-emerald-400">
                    {evidence.total_mint_certificates_count.toLocaleString('ko-KR')}
                    <span className="text-xs font-normal text-muted-foreground ml-1">건</span>
                  </strong>
                  <span className="block text-[11px] text-muted-foreground mt-1 font-mono">
                    누적 +{totalMintedWld.toLocaleString('ko-KR')} WLD
                  </span>
                </div>
                <div className="size-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <ArrowUpRight className="size-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80 bg-card/60">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <span className="block text-xs font-medium text-muted-foreground">폐기(소각) 증명서 기록</span>
                  <strong className="text-2xl font-bold font-mono tracking-tight text-rose-400">
                    {evidence.total_retirement_certificates_count.toLocaleString('ko-KR')}
                    <span className="text-xs font-normal text-muted-foreground ml-1">건</span>
                  </strong>
                  <span className="block text-[11px] text-muted-foreground mt-1 font-mono">
                    누적 -{totalRetiredWld.toLocaleString('ko-KR')} WLD
                  </span>
                </div>
                <div className="size-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                  <ArrowDownRight className="size-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80 bg-card/60">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <span className="block text-xs font-medium text-muted-foreground">발행 관제 상태</span>
                  <strong className={`text-lg font-bold tracking-tight ${evidence.is_issuance_frozen ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {evidence.is_issuance_frozen ? '긴급 동결 중' : '정상 주조 가능'}
                  </strong>
                  <span className="block text-[11px] text-muted-foreground mt-1">
                    {evidence.is_issuance_frozen ? '신규 M0 발행 차단됨' : '통화정책 명령 집행 허가'}
                  </span>
                </div>
                <div className={`size-10 rounded-xl border flex items-center justify-center ${
                  evidence.is_issuance_frozen
                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                }`}>
                  <Shield className="size-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 불변식 인증 배너 */}
          {evidence.verified_invariant ? (
            <div role="status" className="flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs sm:text-sm text-emerald-300">
              <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
              <span>통화량 불변식 전수 인증 완료: 조폐국 정책 DB와 국고/유통 원장 대차대조표가 100% 일치합니다.</span>
            </div>
          ) : (
            <div role="status" className="flex items-center gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs sm:text-sm text-amber-300">
              <AlertCircle className="size-4 text-amber-400 shrink-0" />
              <span>현재 통화량 지표는 일부 계정만 포함합니다. 전체 공급량과 정식 원장 발행·폐기 정산은 별도 검증 대상입니다.</span>
            </div>
          )}

          {/* 승인된 통화정책 명령서 (APPROVED Orders) 섹션 */}
          <Card className="border-border/80">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <FileText className="size-4 text-primary" />
                    승인된 통화정책 명령서 (Active Approved Policy Orders)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    중앙은행 및 AI 위원회에서 공식 승인된 명령입니다. 잔여 한도 내에서 정식 화폐를 즉시 주조할 수 있습니다.
                  </CardDescription>
                </div>
                <span className="text-xs font-mono font-semibold text-muted-foreground px-2 py-1 rounded-md bg-muted/50 border border-border/60">
                  승인 {approvedOrders.length}건
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {approvedOrders.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground rounded-xl border border-dashed border-border/60 bg-muted/10">
                  현재 즉시 주조 가능한 승인 상태의 정책 명령서가 없습니다.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {approvedOrders.map((order) => {
                    const max = BigInt(order.max_amount_wld || '0');
                    const exec = BigInt(order.executed_amount_wld || '0');
                    const remaining = max - exec;
                    const pct = max > BigInt(0) ? Number((exec * BigInt(100)) / max) : 0;

                    return (
                      <div
                        key={order.id}
                        className="rounded-xl border border-border/70 bg-card/80 p-4 space-y-3 hover:border-border transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              {order.order_type}
                            </span>
                            <span className="text-xs font-semibold text-foreground">
                              {order.target_envelope}
                            </span>
                          </div>
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
                            <Clock className="size-3" />
                            만료: {new Date(order.expires_at).toLocaleDateString('ko-KR')}
                          </span>
                        </div>

                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {order.reason}
                        </p>

                        <div className="space-y-1.5 pt-1">
                          <div className="flex justify-between text-xs font-mono">
                            <span className="text-muted-foreground">집행 진행률 ({pct}%)</span>
                            <span className="font-semibold text-foreground">
                              {exec.toLocaleString('ko-KR')} / {max.toLocaleString('ko-KR')} WLD
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-muted/60 overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full transition-all"
                              style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                            />
                          </div>
                          <div className="flex justify-between items-center pt-1">
                            <span className="text-xs text-muted-foreground">
                              남은 한도: <strong className="text-emerald-400 font-mono">{remaining.toLocaleString('ko-KR')} WLD</strong>
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={evidence.is_issuance_frozen || remaining <= BigInt(0)}
                              onClick={() => {
                                setSelectedOrderIdForMint(order.id);
                                setMintDialogOpen(true);
                              }}
                              className="h-7 text-xs rounded-lg px-2.5 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                            >
                              <Coins className="size-3 mr-1" />
                              이 명령으로 주조
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 공인 증명서 원장 테이블 섹션 */}
          <Card className="border-border/80">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Layers className="size-4 text-primary" />
                    공인 증명서 실시간 원장 (Authoritative Certificates Ledger)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    조폐국에서 정식 발급된 M0 화폐 발행 및 영구 폐기 증명서의 불변 원장입니다.
                  </CardDescription>
                </div>

                <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/50 border border-border/60 self-start sm:self-auto">
                  <button
                    onClick={() => setActiveLedgerTab('MINTS')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                      activeLedgerTab === 'MINTS'
                        ? 'bg-card text-emerald-400 shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    정식 발행 증명서 ({mintCerts.length})
                  </button>
                  <button
                    onClick={() => setActiveLedgerTab('RETIREMENTS')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                      activeLedgerTab === 'RETIREMENTS'
                        ? 'bg-card text-rose-400 shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    영구 소각 증명서 ({retireCerts.length})
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {activeLedgerTab === 'MINTS' ? (
                mintCerts.length === 0 ? (
                  <div className="text-center py-12 text-xs text-muted-foreground">
                    정식 발행된 증명서 기록이 아직 없습니다.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-border/60 text-muted-foreground">
                          <th className="py-2.5 px-3 font-semibold">증명서 UUID</th>
                          <th className="py-2.5 px-3 font-semibold">발행 수량</th>
                          <th className="py-2.5 px-3 font-semibold">엔벨로프</th>
                          <th className="py-2.5 px-3 font-semibold">귀속 대상</th>
                          <th className="py-2.5 px-3 font-semibold">발행 일시</th>
                          <th className="py-2.5 px-3 font-semibold text-right">상태</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40 font-mono">
                        {mintCerts.map((cert) => (
                          <tr key={cert.id} className="hover:bg-muted/20 transition-colors">
                            <td className="py-2.5 px-3">
                              <button
                                onClick={() => copyToClipboard(cert.id, cert.id)}
                                className="flex items-center gap-1.5 text-foreground hover:text-primary"
                                title="전체 UUID 복사"
                              >
                                <span>{cert.id.slice(0, 8)}...{cert.id.slice(-4)}</span>
                                {copiedId === cert.id ? (
                                  <Check className="size-3 text-emerald-400" />
                                ) : (
                                  <Copy className="size-3 text-muted-foreground" />
                                )}
                              </button>
                            </td>
                            <td className="py-2.5 px-3 font-bold text-emerald-400">
                              +{BigInt(cert.amount_wld).toLocaleString('ko-KR')} WLD
                            </td>
                            <td className="py-2.5 px-3 text-muted-foreground font-sans">
                              {cert.source_envelope}
                            </td>
                            <td className="py-2.5 px-3 text-muted-foreground font-sans">
                              {cert.recipient_user_id ? (
                                <span>개인 계좌 ({cert.recipient_user_id.slice(0, 6)}...)</span>
                              ) : (
                                <span className="text-emerald-400 font-semibold">중앙 국고 금고 (VAULT_MAIN)</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-muted-foreground">
                              {new Date(cert.created_at).toLocaleString('ko-KR')}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-sans">
                                <CheckCircle2 className="size-2.5" /> 공인 발행
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              ) : (
                retireCerts.length === 0 ? (
                  <div className="text-center py-12 text-xs text-muted-foreground">
                    영구 소각 증명서 기록이 아직 없습니다.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-border/60 text-muted-foreground">
                          <th className="py-2.5 px-3 font-semibold">증명서 UUID</th>
                          <th className="py-2.5 px-3 font-semibold">소각 수량</th>
                          <th className="py-2.5 px-3 font-semibold">소각 원천</th>
                          <th className="py-2.5 px-3 font-semibold">감사 사유</th>
                          <th className="py-2.5 px-3 font-semibold">소각 일시</th>
                          <th className="py-2.5 px-3 font-semibold text-right">상태</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40 font-mono">
                        {retireCerts.map((cert) => (
                          <tr key={cert.id} className="hover:bg-muted/20 transition-colors">
                            <td className="py-2.5 px-3">
                              <button
                                onClick={() => copyToClipboard(cert.id, cert.id)}
                                className="flex items-center gap-1.5 text-foreground hover:text-primary"
                                title="전체 UUID 복사"
                              >
                                <span>{cert.id.slice(0, 8)}...{cert.id.slice(-4)}</span>
                                {copiedId === cert.id ? (
                                  <Check className="size-3 text-rose-400" />
                                ) : (
                                  <Copy className="size-3 text-muted-foreground" />
                                )}
                              </button>
                            </td>
                            <td className="py-2.5 px-3 font-bold text-rose-400">
                              -{BigInt(cert.amount_wld).toLocaleString('ko-KR')} WLD
                            </td>
                            <td className="py-2.5 px-3 text-muted-foreground font-sans">
                              {cert.source_type}
                            </td>
                            <td className="py-2.5 px-3 text-muted-foreground font-sans max-w-xs truncate" title={cert.reason}>
                              {cert.reason}
                            </td>
                            <td className="py-2.5 px-3 text-muted-foreground">
                              {new Date(cert.created_at).toLocaleString('ko-KR')}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-sans">
                                <Flame className="size-2.5" /> 영구 폐기
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              )}
            </CardContent>
          </Card>

          {/* 모달 2종 마운트 */}
          <MintExecutionDialog
            isOpen={mintDialogOpen}
            onClose={() => setMintDialogOpen(false)}
            onSuccess={loadAllData}
            activeOrders={approvedOrders}
            initialOrderId={selectedOrderIdForMint}
          />

          <RetireExecutionDialog
            isOpen={retireDialogOpen}
            onClose={() => setRetireDialogOpen(false)}
            onSuccess={loadAllData}
          />
        </>
      )}
    </section>
  );
}
