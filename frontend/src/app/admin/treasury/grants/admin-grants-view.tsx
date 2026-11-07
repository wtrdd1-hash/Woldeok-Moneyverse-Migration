'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
  Rocket,
  CheckCircle2,
  XCircle,
  Clock,
  Coins,
  FileText,
  RefreshCw,
  ShieldAlert,
  AlertTriangle,
  Sparkles,
  Building2,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export interface GrantApp {
  id: string;
  userId?: string;
  applicantName?: string;
  applicantMasked: string;
  businessName: string;
  businessPlan: string;
  category?: string;
  tier?: 'TIER_1_SEED' | 'TIER_2_GROWTH' | 'TIER_3_INNOVATION';
  requestedAmountWld: number;
  approvedAmountWld?: number;
  fundingVault?: string;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'CLAWBACK_PENDING';
  aiScore?: number;
  aiEvaluation?: string;
  reviewerId?: string | null;
  reviewNote?: string | null;
  reviewedAt?: string | null;
  disbursedAt?: string | null;
  submittedAt: string;
  clawbackDeadline?: string | null;
}

interface AdminGrantsViewProps {
  readonly initialApplications: readonly GrantApp[];
  readonly isEn?: boolean;
}

export function AdminGrantsView({ initialApplications }: AdminGrantsViewProps) {
  const [applications, setApplications] = useState<readonly GrantApp[]>(initialApplications);
  const [selectedApp, setSelectedApp] = useState<GrantApp | null>(initialApplications[0] ?? null);
  const [reviewNote, setReviewNote] = useState('');
  const [approveAmount, setApproveAmount] = useState<string>('');
  const [selectedVault, setSelectedVault] = useState<string>('VAULT_WELFARE');
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());
  const [isFreezeActive, setIsFreezeActive] = useState<boolean>(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (selectedApp) {
      setApproveAmount(selectedApp.requestedAmountWld.toString());
      setReviewNote(
        selectedApp.status === 'APPROVED' && selectedApp.reviewNote
          ? selectedApp.reviewNote
          : `기술성 및 타당성 우수, 국고 ${selectedVault} 즉시 지급 승인`,
      );
    }
  }, [selectedApp, selectedVault]);

  const fetchApplications = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/admin/treasury/grants', { cache: 'no-store' });
      const data = await res.json();
      if (data.ok && Array.isArray(data.applications)) {
        setApplications(data.applications);
        setLastUpdated(new Date().toLocaleTimeString());
        if (selectedApp) {
          const fresh = data.applications.find((a: GrantApp) => a.id === selectedApp.id);
          if (fresh) setSelectedApp(fresh);
        }
      }
    } catch {
      // ignore
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      startTransition(() => {
        fetchApplications();
      });
    }, 20000);
    return () => clearInterval(timer);
  }, [selectedApp]);

  const handleReviewAction = async (action: 'APPROVE' | 'REJECT') => {
    if (!selectedApp) return;
    if (isFreezeActive && action === 'APPROVE') {
      setStatusMsg({ ok: false, text: '긴급 킬스위치가 활성화되어 있어 지급 승인이 일시 동결되었습니다.' });
      return;
    }

    setIsProcessing(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/admin/treasury/grants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: selectedApp.id,
          action,
          amountWld: action === 'APPROVE' ? approveAmount : undefined,
          vaultCode: action === 'APPROVE' ? selectedVault : undefined,
          reviewNote: reviewNote || (action === 'APPROVE' ? '창업 지원금 승인 집행' : '사업계획서 요건 미충족 반려'),
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setStatusMsg({ ok: false, text: `처리 오류: ${data.message || '심사 처리에 실패했습니다.'}` });
        setIsProcessing(false);
        return;
      }

      setStatusMsg({ ok: true, text: data.message || '심사 처리가 원자적으로 완료되었습니다.' });
      await fetchApplications();
    } catch {
      setStatusMsg({ ok: false, text: '네트워크 통신 중 오류가 발생했습니다.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const totalCount = applications.length;
  const pendingCount = applications.filter((a) => a.status === 'PENDING_REVIEW').length;
  const approvedCount = applications.filter((a) => a.status === 'APPROVED').length;
  const totalDisbursedWld = applications
    .filter((a) => a.status === 'APPROVED')
    .reduce((sum, a) => sum + (a.approvedAmountWld || a.requestedAmountWld || 0), 0);

  const filteredApps = applications.filter((a) => {
    if (activeTab === 'PENDING') return a.status === 'PENDING_REVIEW';
    if (activeTab === 'APPROVED') return a.status === 'APPROVED';
    if (activeTab === 'REJECTED') return a.status === 'REJECTED';
    return true;
  });

  const getTierBadge = (tier?: string) => {
    switch (tier) {
      case 'TIER_3_INNOVATION':
        return <Badge className="bg-purple-500/20 text-purple-400 border border-purple-500/40 font-mono text-[10px]">Tier 3 (500만 WLD)</Badge>;
      case 'TIER_2_GROWTH':
        return <Badge className="bg-sky-500/20 text-sky-400 border border-sky-500/40 font-mono text-[10px]">Tier 2 (200만 WLD)</Badge>;
      default:
        return <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono text-[10px]">Tier 1 (50만 WLD)</Badge>;
    }
  };

  const getStatusBadge = (status: GrantApp['status']) => {
    switch (status) {
      case 'PENDING_REVIEW':
        return (
          <Badge variant="outline" className="font-mono text-[11px] bg-amber-500/10 text-amber-400 border-amber-500/30">
            <Clock className="size-3 mr-1" />
            심사 대기
          </Badge>
        );
      case 'APPROVED':
        return (
          <Badge variant="outline" className="font-mono text-[11px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
            <CheckCircle2 className="size-3 mr-1" />
            원장 지급 완료
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge variant="outline" className="font-mono text-[11px] bg-rose-500/10 text-rose-400 border-rose-500/30">
            <XCircle className="size-3 mr-1" />
            반려됨
          </Badge>
        );
      case 'CLAWBACK_PENDING':
        return (
          <Badge variant="outline" className="font-mono text-[11px] bg-orange-500/10 text-orange-400 border-orange-500/30">
            <AlertTriangle className="size-3 mr-1" />
            미창업 환수 대기
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 최상단: 상태 바 및 새로고침 / 킬스위치 제어 */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-border/80 bg-card/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="font-mono text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/30 flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            원장 원자적 복식부기 활성
          </Badge>
          <span className="text-xs text-muted-foreground font-mono">
            동기화: {lastUpdated} (20초 자동 갱신)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchApplications}
            disabled={isRefreshing}
            className="text-xs font-mono h-8"
          >
            <RefreshCw className={`size-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsFreezeActive(!isFreezeActive)}
            className={`text-xs font-mono h-8 border ${
              isFreezeActive
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/50'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Lock className="size-3.5 mr-1.5" />
            {isFreezeActive ? '지급 긴급 동결 중 (해제)' : '긴급 킬스위치'}
          </Button>
        </div>
      </div>

      {/* 4대 핵심 지표 위젯 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="moneyverse-card border-border/80 bg-card/75 p-4 shadow-sm">
          <div className="text-xs text-muted-foreground font-medium flex items-center justify-between">
            <span>총 접수 신청서</span>
            <Rocket className="size-4 text-sky-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-foreground">
            {totalCount} <span className="text-xs font-normal text-muted-foreground">건</span>
          </div>
          <div className="mt-1 text-[11px] text-amber-400 font-mono">
            심사 대기: {pendingCount}건
          </div>
        </Card>

        <Card className="moneyverse-card border-border/80 bg-card/75 p-4 shadow-sm">
          <div className="text-xs text-muted-foreground font-medium flex items-center justify-between">
            <span>총 국고 지급 승인액</span>
            <Coins className="size-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-emerald-400">
            {totalDisbursedWld.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">WLD</span>
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground font-mono">
            승인 완료: {approvedCount}건
          </div>
        </Card>

        <Card className="moneyverse-card border-border/80 bg-card/75 p-4 shadow-sm">
          <div className="text-xs text-muted-foreground font-medium flex items-center justify-between">
            <span>주 재원 금고</span>
            <Building2 className="size-4 text-primary" />
          </div>
          <div className="mt-2 text-base font-bold font-mono text-foreground">
            VAULT_WELFARE
          </div>
          <div className="mt-1 text-[11px] text-emerald-400 font-mono">
            복지 및 시민 기본소득 환원 금고
          </div>
        </Card>

        <Card className="moneyverse-card border-border/80 bg-card/75 p-4 shadow-sm">
          <div className="text-xs text-muted-foreground font-medium flex items-center justify-between">
            <span>의무 창업 및 환수 정책</span>
            <ShieldAlert className="size-4 text-purple-400" />
          </div>
          <div className="mt-2 text-base font-bold text-foreground">
            14일 유예 환수제
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground font-mono">
            미창업 시 국고 자동 회수
          </div>
        </Card>
      </div>

      {statusMsg && (
        <div
          className={`p-3.5 rounded-xl border font-mono text-xs flex items-center gap-2 ${
            statusMsg.ok
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
              : 'border-rose-500/40 bg-rose-500/10 text-rose-300'
          }`}
        >
          {statusMsg.ok ? <CheckCircle2 className="size-4 shrink-0" /> : <XCircle className="size-4 shrink-0" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* 하단 2분할 뷰: 좌측 신청서 큐, 우측 정밀 심사 패널 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 좌측 2열: 신청서 큐 */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="moneyverse-card border-border/80 bg-card/75 shadow-sm overflow-hidden backdrop-blur-md">
            <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/50 bg-muted/20">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Rocket className="size-4 text-sky-400" />
                  <span>창업 그랜트 심사 대기열 ({filteredApps.length}건)</span>
                </CardTitle>
                <div className="flex items-center gap-1 bg-background/80 p-1 rounded-lg border border-border/60">
                  <button
                    onClick={() => setActiveTab('ALL')}
                    className={`px-2.5 py-1 text-xs font-mono rounded-md transition-colors ${
                      activeTab === 'ALL' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    전체
                  </button>
                  <button
                    onClick={() => setActiveTab('PENDING')}
                    className={`px-2.5 py-1 text-xs font-mono rounded-md transition-colors ${
                      activeTab === 'PENDING' ? 'bg-amber-500/20 text-amber-400 font-bold' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    대기 ({pendingCount})
                  </button>
                  <button
                    onClick={() => setActiveTab('APPROVED')}
                    className={`px-2.5 py-1 text-xs font-mono rounded-md transition-colors ${
                      activeTab === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    승인 ({approvedCount})
                  </button>
                  <button
                    onClick={() => setActiveTab('REJECTED')}
                    className={`px-2.5 py-1 text-xs font-mono rounded-md transition-colors ${
                      activeTab === 'REJECTED' ? 'bg-rose-500/20 text-rose-400 font-bold' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    반려
                  </button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/40 hover:bg-transparent">
                      <TableHead className="text-xs font-bold text-muted-foreground">접수번호</TableHead>
                      <TableHead className="text-xs font-bold text-muted-foreground">기업/프로젝트명</TableHead>
                      <TableHead className="text-xs font-bold text-muted-foreground">티어/AI평가</TableHead>
                      <TableHead className="text-xs font-bold text-muted-foreground">신청액</TableHead>
                      <TableHead className="text-xs font-bold text-muted-foreground">상태</TableHead>
                      <TableHead className="text-xs font-bold text-muted-foreground text-right">접수일</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApps.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-xs text-muted-foreground font-mono">
                          해당 조건의 창업 지원금 신청 내역이 없습니다.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredApps.map((app) => {
                        const isSelected = selectedApp?.id === app.id;
                        return (
                          <TableRow
                            key={app.id}
                            onClick={() => {
                              setSelectedApp(app);
                              setStatusMsg(null);
                            }}
                            className={`cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-primary/10 border-primary/30'
                                : 'border-border/30 hover:bg-muted/30'
                            }`}
                          >
                            <TableCell className="font-mono text-xs font-bold text-foreground">
                              {app.id}
                            </TableCell>
                            <TableCell className="text-xs font-medium">
                              <div className="text-foreground font-bold">{app.businessName}</div>
                              <div className="text-[11px] text-muted-foreground font-mono">
                                {app.applicantMasked}
                              </div>
                            </TableCell>
                            <TableCell className="space-y-1">
                              <div>{getTierBadge(app.tier)}</div>
                              {app.aiScore !== undefined && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-sky-400">
                                  <Sparkles className="size-2.5" />
                                  AI 적격: {app.aiScore}점
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="font-mono text-xs font-bold text-emerald-400 tabular-nums">
                              {app.requestedAmountWld.toLocaleString()} WLD
                            </TableCell>
                            <TableCell>{getStatusBadge(app.status)}</TableCell>
                            <TableCell className="font-mono text-[11px] text-muted-foreground text-right whitespace-nowrap">
                              {new Date(app.submittedAt).toLocaleDateString()}
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

        {/* 우측 1열: 상세 심사 및 국고 승인 패널 */}
        <div className="space-y-4">
          {selectedApp ? (
            <Card className="moneyverse-card border-border/80 bg-card/75 shadow-sm overflow-hidden backdrop-blur-md">
              <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/50 bg-muted/20">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-muted-foreground">
                    {selectedApp.id}
                  </span>
                  {getStatusBadge(selectedApp.status)}
                </div>
                <CardTitle className="text-lg font-bold text-foreground mt-1">
                  {selectedApp.businessName}
                </CardTitle>
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold">
                  <Coins className="size-3.5" />
                  <span>신청액: {selectedApp.requestedAmountWld.toLocaleString()} WLD</span>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-5 space-y-4 text-xs">
                {selectedApp.aiScore !== undefined && (
                  <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 space-y-1">
                    <div className="flex items-center justify-between text-sky-400 font-bold">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="size-3.5" />
                        1차 AI 적격성 스코어링
                      </span>
                      <span className="font-mono text-sm">{selectedApp.aiScore} / 100</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {selectedApp.aiEvaluation || '사업계획서 요건 기본 충족'}
                    </p>
                  </div>
                )}

                <div className="space-y-1">
                  <span className="font-bold text-foreground flex items-center gap-1">
                    <FileText className="size-3.5 text-sky-400" />
                    사업계획서 요약 및 자금 용처
                  </span>
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/50 text-muted-foreground leading-relaxed whitespace-pre-wrap font-sans text-xs">
                    {selectedApp.businessPlan}
                  </div>
                </div>

                {selectedApp.status === 'APPROVED' && (
                  <div className="space-y-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 font-mono text-[11px]">
                    <div className="flex items-center justify-between text-emerald-400 font-bold">
                      <span>국고 원자적 지급 완료</span>
                      <span>{selectedApp.approvedAmountWld?.toLocaleString()} WLD</span>
                    </div>
                    <div className="text-muted-foreground">
                      출처 금고: {selectedApp.fundingVault || 'VAULT_WELFARE'}
                    </div>
                    {selectedApp.clawbackDeadline && (
                      <div className="text-amber-400 font-medium">
                        창업 환수 기한: {new Date(selectedApp.clawbackDeadline).toLocaleDateString()}까지
                      </div>
                    )}
                    {selectedApp.reviewNote && (
                      <div className="text-foreground pt-1 border-t border-emerald-500/20">
                        심사관 사유: {selectedApp.reviewNote}
                      </div>
                    )}
                  </div>
                )}

                {selectedApp.status === 'REJECTED' && selectedApp.reviewNote && (
                  <div className="space-y-1 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 font-mono text-[11px]">
                    <span className="text-rose-400 font-bold block">반려 사유</span>
                    <span className="text-muted-foreground">{selectedApp.reviewNote}</span>
                  </div>
                )}

                {selectedApp.status === 'PENDING_REVIEW' && (
                  <div className="space-y-3 pt-2 border-t border-border/50">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="font-bold text-foreground block text-[11px]">
                          지급 금고
                        </label>
                        <select
                          value={selectedVault}
                          onChange={(e) => setSelectedVault(e.target.value)}
                          className="w-full rounded-xl border border-border/80 bg-background px-2.5 py-1.5 text-xs text-foreground font-mono focus:ring-1 focus:ring-primary"
                        >
                          <option value="VAULT_WELFARE">VAULT_WELFARE (복지)</option>
                          <option value="VAULT_MAIN">VAULT_MAIN (중앙)</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-foreground block text-[11px]">
                          승인 금액 (WLD)
                        </label>
                        <input
                          type="number"
                          value={approveAmount}
                          onChange={(e) => setApproveAmount(e.target.value)}
                          className="w-full rounded-xl border border-border/80 bg-background px-2.5 py-1.5 text-xs text-foreground font-mono focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-foreground block text-[11px]">
                        심사 감사 사유
                      </label>
                      <input
                        type="text"
                        placeholder="예: 기술성 및 고용 창출 효과 확인, 승인 집행"
                        value={reviewNote}
                        onChange={(e) => setReviewNote(e.target.value)}
                        className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-xs text-foreground focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Button
                        size="sm"
                        disabled={isProcessing}
                        onClick={() => handleReviewAction('REJECT')}
                        variant="outline"
                        className="text-xs font-bold border-rose-500/40 text-rose-400 hover:bg-rose-500/10 h-9"
                      >
                        <XCircle className="size-3.5 mr-1" />
                        심사 반려
                      </Button>
                      <Button
                        size="sm"
                        disabled={isProcessing || isFreezeActive}
                        onClick={() => handleReviewAction('APPROVE')}
                        className="text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs h-9"
                      >
                        <CheckCircle2 className="size-3.5 mr-1" />
                        국고 지급 승인
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="moneyverse-card border-border/80 bg-card/50 p-8 text-center text-xs text-muted-foreground">
              심사할 창업 지원금 신청서를 좌측 큐에서 선택하세요.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
