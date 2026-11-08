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
  Download,
  Flame,
  Award,
  ChevronRight,
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
import { AdminActionModal } from '@/components/admin/admin-action-modal';

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
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'CLAWBACK_PENDING' | 'COMPLETED' | 'CLAWBACK_COMPLETED' | 'CLAWBACK_PARTIAL';
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
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CLAWBACK'>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('방금 전');
  const [statusMsg, setStatusMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // 심사 양식 파라미터
  const [approveAmount, setApproveAmount] = useState<number>(500000);
  const [reviewNote, setReviewNote] = useState<string>('');
  const [selectedVault, setSelectedVault] = useState<'VAULT_WELFARE' | 'VAULT_MAIN' | 'VAULT_RESERVE'>('VAULT_WELFARE');
  const [isFreezeActive, setIsFreezeActive] = useState<boolean>(false);

  // 모달 제어 상태
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isSweepModalOpen, setIsSweepModalOpen] = useState(false);
  const [isAiReportModalOpen, setIsAiReportModalOpen] = useState(false);
  const [modalSuccessMsg, setModalSuccessMsg] = useState<string | null>(null);

  const [, startTransition] = useTransition();

  useEffect(() => {
    if (selectedApp) {
      setApproveAmount(selectedApp.requestedAmountWld || 500000);
      setReviewNote(
        selectedApp.aiScore && selectedApp.aiScore >= 80
          ? `[AI 추천 승인] 스코어 ${selectedApp.aiScore}점, 기술성 및 고용 창출 타당성 충족`
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
          const updated = data.applications.find((a: GrantApp) => a.id === selectedApp.id);
          if (updated) setSelectedApp(updated);
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

  // 심사 승인 / 반려 실행
  const executeReviewAction = async (action: 'APPROVE' | 'REJECT') => {
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
          approvedAmountWld: action === 'APPROVE' ? approveAmount : undefined,
          fundingVault: action === 'APPROVE' ? selectedVault : undefined,
          reviewNote: reviewNote || (action === 'APPROVE' ? '창업 지원금 승인 집행' : '사업계획서 요건 미충족 반려'),
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setStatusMsg({ ok: false, text: `처리 오류: ${data.message || '심사 처리에 실패했습니다.'}` });
        return;
      }

      const msg = data.message || (action === 'APPROVE' ? '창업 지원금이 복식부기로 국고 지급 승인되었습니다.' : '신청서가 반려 처리되었습니다.');
      setModalSuccessMsg(msg);
      setStatusMsg({ ok: true, text: msg });
      await fetchApplications();
    } catch {
      setStatusMsg({ ok: false, text: '네트워크 통신 중 오류가 발생했습니다.' });
    } finally {
      setIsProcessing(false);
    }
  };

  // 14일 경과 미창업 지원금 즉시 환수(Sweep Now)
  const executeClawbackSweep = async () => {
    setIsProcessing(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/admin/treasury/grants/clawback', {
        method: 'POST',
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setStatusMsg({ ok: false, text: `환수 스윕 실패: ${data.message || '처리 오류'}` });
        return;
      }

      const msg = data.message || `미창업 환수 스윕 집행 완료 (회수: ${data.result?.reclaimed_count ?? 0}건)`;
      setModalSuccessMsg(msg);
      setStatusMsg({ ok: true, text: msg });
      await fetchApplications();
    } catch {
      setStatusMsg({ ok: false, text: '네트워크 통신 중 오류가 발생했습니다.' });
    } finally {
      setIsProcessing(false);
    }
  };

  // CSV 내보내기
  const handleExportCsv = () => {
    if (applications.length === 0) return;
    const headers = ['신청서ID', '신청자', '사업체명', '카테고리', '티어', '신청금액(WLD)', '승인금액(WLD)', '상태', 'AI스코어', '신청일시', '환수기한'];
    const rows = applications.map((a) => [
      a.id,
      a.applicantMasked,
      `"${a.businessName.replaceAll('"', '""')}"`,
      a.category || 'FINTECH',
      a.tier || 'TIER_1_SEED',
      a.requestedAmountWld,
      a.approvedAmountWld || 0,
      a.status,
      a.aiScore || 0,
      a.submittedAt,
      a.clawbackDeadline || '-',
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `treasury-grants-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalCount = applications.length;
  const pendingCount = applications.filter((a) => a.status === 'PENDING_REVIEW').length;
  const approvedCount = applications.filter((a) => a.status === 'APPROVED' || a.status === 'COMPLETED').length;
  const clawbackPendingCount = applications.filter((a) => a.status === 'CLAWBACK_PENDING').length;
  const totalDisbursedWld = applications
    .filter((a) => a.status === 'APPROVED' || a.status === 'COMPLETED')
    .reduce((sum, a) => sum + (a.approvedAmountWld || a.requestedAmountWld || 0), 0);

  const filteredApps = applications.filter((a) => {
    if (activeTab === 'PENDING') return a.status === 'PENDING_REVIEW';
    if (activeTab === 'APPROVED') return a.status === 'APPROVED' || a.status === 'COMPLETED';
    if (activeTab === 'REJECTED') return a.status === 'REJECTED';
    if (activeTab === 'CLAWBACK') return a.status === 'CLAWBACK_PENDING' || a.status === 'CLAWBACK_COMPLETED' || a.status === 'CLAWBACK_PARTIAL';
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
            원장 지급 (창업 대기)
          </Badge>
        );
      case 'COMPLETED':
        return (
          <Badge variant="outline" className="font-mono text-[11px] bg-emerald-600/20 text-emerald-300 border-emerald-500/40">
            <Award className="size-3 mr-1" />
            창업 성공 (환수 면제)
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
      case 'CLAWBACK_COMPLETED':
        return (
          <Badge variant="outline" className="font-mono text-[11px] bg-purple-500/10 text-purple-400 border-purple-500/30">
            <Coins className="size-3 mr-1" />
            국고 환수 완료
          </Badge>
        );
      case 'CLAWBACK_PARTIAL':
        return (
          <Badge variant="outline" className="font-mono text-[11px] bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
            <Coins className="size-3 mr-1" />
            국고 부분 환수
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 최상단: 상태 바 및 새로고침 / 킬스위치 / 환수 스윕 / CSV 제어 */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-border/80 bg-card/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="font-mono text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/30 flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            원장 복식부기 실시간 집행 엔진
          </Badge>
          <span className="text-xs text-muted-foreground font-mono">
            동기화: {lastUpdated} (20초 자동 갱신)
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
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
            onClick={handleExportCsv}
            disabled={applications.length === 0}
            className="text-xs font-mono h-8"
          >
            <Download className="size-3.5 mr-1.5" />
            CSV 내보내기
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setModalSuccessMsg(null);
              setIsSweepModalOpen(true);
            }}
            className="text-xs font-mono h-8 border-orange-500/40 text-orange-400 hover:bg-orange-500/10"
          >
            <Flame className="size-3.5 mr-1.5" />
            환수 즉시 집행 (Sweep Now)
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
        <Card className="border border-border/80 bg-card/60">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs text-muted-foreground font-mono uppercase tracking-wider flex items-center justify-between">
              <span>총 누적 접수건</span>
              <FileText className="size-4 text-primary/70" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black font-mono text-foreground">{totalCount}건</div>
            <p className="text-[11px] text-muted-foreground mt-1">대국민 창업 지원금 전체 신청</p>
          </CardContent>
        </Card>

        <Card className="border border-border/80 bg-card/60">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs text-muted-foreground font-mono uppercase tracking-wider flex items-center justify-between">
              <span>심사 대기 큐</span>
              <Clock className="size-4 text-amber-400/80" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black font-mono text-amber-400">{pendingCount}건</div>
            <p className="text-[11px] text-muted-foreground mt-1">관리자 심사 대기 중인 신청서</p>
          </CardContent>
        </Card>

        <Card className="border border-border/80 bg-card/60">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs text-muted-foreground font-mono uppercase tracking-wider flex items-center justify-between">
              <span>원장 누적 지급액</span>
              <Coins className="size-4 text-emerald-400/80" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black font-mono text-emerald-400">
              {totalDisbursedWld.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">WLD</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">총 {approvedCount}건 승인 집행 완료</p>
          </CardContent>
        </Card>

        <Card className="border border-border/80 bg-card/60">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs text-muted-foreground font-mono uppercase tracking-wider flex items-center justify-between">
              <span>14일 의무 창업제</span>
              <ShieldAlert className="size-4 text-sky-400/80" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black font-mono text-sky-400">
              {clawbackPendingCount} <span className="text-xs font-normal text-muted-foreground">건 관제</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">미창업 시 국고 자동 회수</p>
          </CardContent>
        </Card>
      </div>

      {statusMsg && (
        <div
          role="status"
          className={`p-3.5 rounded-xl border text-xs font-medium flex items-center gap-2 ${
            statusMsg.ok
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {statusMsg.ok ? <CheckCircle2 className="size-4 shrink-0" /> : <XCircle className="size-4 shrink-0" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* 메인 관제 서피스: 2열 레이아웃 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 좌측: 신청서 대기열 목록 (5열) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border border-border/80 bg-card/60">
            <CardHeader className="p-4 border-b border-border/80">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <FileText className="size-4 text-primary" />
                  <span>창업 지원금 신청 대기열 ({filteredApps.length}건)</span>
                </CardTitle>
              </div>
              <div className="flex gap-1.5 mt-3">
                {(['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CLAWBACK'] as const).map((tab) => (
                  <Button
                    key={tab}
                    size="sm"
                    variant={activeTab === tab ? 'default' : 'ghost'}
                    onClick={() => setActiveTab(tab)}
                    className="text-xs h-7 px-2.5 font-mono"
                  >
                    {tab === 'ALL' && '전체'}
                    {tab === 'PENDING' && '심사대기'}
                    {tab === 'APPROVED' && '승인완료'}
                    {tab === 'REJECTED' && '반려'}
                    {tab === 'CLAWBACK' && '환수관제'}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/60 max-h-[620px] overflow-y-auto">
                {filteredApps.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground">
                    해당 조건의 창업 지원금 신청 내역이 없습니다.
                  </div>
                ) : (
                  filteredApps.map((app) => {
                    const isSelected = selectedApp?.id === app.id;
                    return (
                      <div
                        key={app.id}
                        onClick={() => setSelectedApp(app)}
                        className={`p-4 transition-colors cursor-pointer text-left ${
                          isSelected
                            ? 'bg-primary/10 border-l-4 border-primary'
                            : 'hover:bg-muted/30'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                              {app.businessName}
                            </span>
                            <span className="text-[11px] text-muted-foreground font-mono">
                              신청자: {app.applicantMasked} · {new Date(app.submittedAt).toLocaleDateString()}
                            </span>
                          </div>
                          {getStatusBadge(app.status)}
                        </div>

                        <div className="flex items-center justify-between mt-2.5 text-xs">
                          {getTierBadge(app.tier)}
                          <div className="flex items-center gap-2 font-mono">
                            {app.aiScore !== undefined && (
                              <span className="flex items-center gap-1 text-[11px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                                <Sparkles className="size-3" />
                                AI {app.aiScore}점
                              </span>
                            )}
                            <span className="font-bold text-foreground">
                              {app.requestedAmountWld.toLocaleString()} WLD
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 우측: 상세 심사 및 복식부기 지급 콘솔 (7열) */}
        <div className="lg:col-span-7 space-y-4">
          {selectedApp ? (
            <Card className="border border-border/80 bg-card/60">
              <CardHeader className="p-5 border-b border-border/80 bg-muted/20">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono text-primary uppercase tracking-wider">
                      {selectedApp.id} · {selectedApp.category || 'FINTECH'}
                    </span>
                    <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2 mt-0.5">
                      {selectedApp.businessName}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedApp.status)}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsAiReportModalOpen(true)}
                      className="text-xs font-mono h-8 border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
                    >
                      <Sparkles className="size-3.5 mr-1" />
                      AI 심사 보고서
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-5 space-y-5">
                {/* 1차 AI 스코어링 진단 배너 */}
                <div className="p-4 rounded-xl border border-border/80 bg-gradient-to-r from-amber-500/5 via-card to-primary/5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold flex items-center gap-1.5 text-foreground">
                      <Sparkles className="size-4 text-amber-400" />
                      1차 자동화 AI 심사 스코어링 (0~100)
                    </span>
                    <span className="text-base font-black font-mono text-amber-400">
                      {selectedApp.aiScore ?? 85} / 100점
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    {selectedApp.aiEvaluation || '사업계획서의 논리적 완결성, 고용 효과 및 자금 회수 가능성을 1차적으로 검증하였습니다.'}
                  </p>
                </div>

                {/* 사업계획서 요약 본문 */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <FileText className="size-3.5 text-primary" />
                    제출된 사업계획서 요약 (전문)
                  </label>
                  <div className="p-4 rounded-xl border border-border/70 bg-muted/15 text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed font-sans max-h-48 overflow-y-auto">
                    {selectedApp.businessPlan}
                  </div>
                </div>

                {/* 지원금 신청 스펙 */}
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl border border-border/60 bg-muted/10 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">신청자(가명)</span>
                    <span className="font-mono font-bold text-foreground">{selectedApp.applicantMasked}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">지원 요청 티어</span>
                    <span className="font-mono font-bold text-foreground">{selectedApp.tier || 'TIER_1_SEED'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">신청 금액</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      {selectedApp.requestedAmountWld.toLocaleString()} WLD
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">환수 유예 기한</span>
                    <span className="font-mono font-bold text-foreground">승인 후 14일 이내 창업</span>
                  </div>
                </div>

                {/* 심사 액션 영역: PENDING_REVIEW인 경우에만 폼 노출 */}
                {selectedApp.status === 'PENDING_REVIEW' ? (
                  <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-4">
                    <div className="flex items-center justify-between border-b border-primary/20 pb-2">
                      <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                        <Coins className="size-4" />
                        복식부기 실집행 심사 결정
                      </span>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        출처: {selectedVault}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                          승인 집행 금액 (WLD)
                        </label>
                        <input
                          type="number"
                          value={approveAmount}
                          onChange={(e) => setApproveAmount(Number(e.target.value))}
                          className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs font-mono font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                          출처 국고 금고
                        </label>
                        <select
                          value={selectedVault}
                          onChange={(e) => setSelectedVault(e.target.value as any)}
                          className="w-full h-9 rounded-lg border border-border bg-background px-2.5 text-xs font-mono font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          <option value="VAULT_WELFARE">복지금고 (VAULT_WELFARE)</option>
                          <option value="VAULT_MAIN">본금고 (VAULT_MAIN)</option>
                          <option value="VAULT_RESERVE">비축금고 (VAULT_RESERVE)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                        심사 의견 및 감사 기록 (Audit Note)
                      </label>
                      <input
                        type="text"
                        value={reviewNote}
                        onChange={(e) => setReviewNote(e.target.value)}
                        placeholder="심사 승인/반려 근거를 구체적으로 입력하세요."
                        className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setModalSuccessMsg(null);
                          setIsApproveModalOpen(true);
                        }}
                        disabled={isProcessing || isFreezeActive}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9"
                      >
                        <CheckCircle2 className="size-4 mr-1.5" />
                        승인 집행 (원장 지급 전표 발행)
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setModalSuccessMsg(null);
                          setIsRejectModalOpen(true);
                        }}
                        disabled={isProcessing}
                        className="flex-1 border-rose-500/40 text-rose-400 hover:bg-rose-500/10 font-bold text-xs h-9"
                      >
                        <XCircle className="size-4 mr-1.5" />
                        반려 처리
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-border/80 bg-muted/15 space-y-2">
                    <span className="text-xs font-bold text-foreground block">심사 종결 내역</span>
                    <p className="text-xs text-muted-foreground">
                      심사자 의견: <span className="text-foreground">{selectedApp.reviewNote || '기록 없음'}</span>
                    </p>
                    {selectedApp.disbursedAt && (
                      <p className="text-[11px] font-mono text-emerald-400">
                        원장 지급 완료 시점: {new Date(selectedApp.disbursedAt).toLocaleString()}
                      </p>
                    )}
                    {selectedApp.clawbackDeadline && (
                      <p className="text-[11px] font-mono text-orange-400">
                        창업 환수 기한: {new Date(selectedApp.clawbackDeadline).toLocaleDateString()}까지
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border border-border/80 bg-card/60 p-12 text-center">
              <p className="text-xs text-muted-foreground">
                심사할 창업 지원금 신청서를 좌측 큐에서 선택하세요.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* 🏛️ AdminActionModal 1: 승인 집행 확인 모달 */}
      <AdminActionModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        title="창업 지원금 국고 승인 집행"
        subtitle="중앙 국고 복지금고에서 신청자 지갑으로 자금을 원자적으로 이체합니다."
        icon={<CheckCircle2 className="size-5 text-emerald-400" />}
        confirmLabel="승인 집행 확정"
        confirmVariant="emerald"
        isLoading={isProcessing}
        successMessage={modalSuccessMsg}
        onSuccessAcknowledge={() => {
          setIsApproveModalOpen(false);
          setModalSuccessMsg(null);
        }}
        onConfirm={() => executeReviewAction('APPROVE')}
      >
        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-muted-foreground">신청 사업체:</span>
              <span className="font-bold text-foreground">{selectedApp?.businessName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">출처 금고:</span>
              <span className="font-mono font-bold text-emerald-400">{selectedVault}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">지급 금액:</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                {approveAmount.toLocaleString()} WLD
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">창업 의무 기한:</span>
              <span className="font-mono text-orange-400">지급 시점으로부터 14일</span>
            </div>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            확인 버튼을 누르면 <strong className="text-foreground">복식부기 전표</strong>가 불변 원장에 기록되며, 지원금이 즉시 입금됩니다. 14일 이내 미창업 시 데몬에 의해 자동 회수됩니다.
          </p>
        </div>
      </AdminActionModal>

      {/* 🏛️ AdminActionModal 2: 반려 처리 확인 모달 */}
      <AdminActionModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="창업 지원금 신청 반려"
        subtitle="요건 미충족 사유를 기록하고 신청서를 반려 처리합니다."
        icon={<XCircle className="size-5 text-rose-400" />}
        confirmLabel="반려 처리 확정"
        confirmVariant="destructive"
        isLoading={isProcessing}
        successMessage={modalSuccessMsg}
        onSuccessAcknowledge={() => {
          setIsRejectModalOpen(false);
          setModalSuccessMsg(null);
        }}
        onConfirm={() => executeReviewAction('REJECT')}
      >
        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-xl border border-rose-500/20 bg-rose-500/5 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-muted-foreground">신청 사업체:</span>
              <span className="font-bold text-foreground">{selectedApp?.businessName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">신청자:</span>
              <span className="font-mono text-foreground">{selectedApp?.applicantMasked}</span>
            </div>
            <div>
              <span className="text-muted-foreground block mb-1">반려 사유:</span>
              <p className="font-medium text-foreground bg-background/60 p-2 rounded border border-border/60">
                {reviewNote || '사업계획서 요건 미충족으로 인한 반려'}
              </p>
            </div>
          </div>
        </div>
      </AdminActionModal>

      {/* 🏛️ AdminActionModal 3: 환수 즉시 집행 (Sweep Now) 모달 */}
      <AdminActionModal
        isOpen={isSweepModalOpen}
        onClose={() => setIsSweepModalOpen(false)}
        title="14일 경과 미창업 지원금 즉시 환수 (Sweep Now)"
        subtitle="스케줄러 주기를 기다리지 않고, 14일 기한이 경과한 미창업자의 잔여 자금을 즉시 국고로 원자적 회수합니다."
        icon={<Flame className="size-5 text-orange-400" />}
        confirmLabel="환수 스윕 즉시 집행"
        confirmVariant="emerald"
        isLoading={isProcessing}
        successMessage={modalSuccessMsg}
        onSuccessAcknowledge={() => {
          setIsSweepModalOpen(false);
          setModalSuccessMsg(null);
        }}
        onConfirm={executeClawbackSweep}
      >
        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-xl border border-orange-500/30 bg-orange-500/10 space-y-2">
            <span className="font-bold text-orange-300 block">환수 집행 규칙</span>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground leading-relaxed">
              <li>승인 후 14일 경과(`clawback_deadline &le; now()`) 건 자동 대상</li>
              <li>마이비즈(/businesses)에서 실제 법인 설립이 확인된 유저는 면제</li>
              <li>미창업 유저 지갑 잔액을 한도로 차감 후 복지금고(VAULT_WELFARE)로 복구</li>
              <li>국고 원장에 불변 전표(`GRANT_CLAWBACK`) 생성</li>
            </ul>
          </div>
        </div>
      </AdminActionModal>

      {/* 🏛️ AdminActionModal 4: AI 심사 보고서 상세 팝업 */}
      <AdminActionModal
        isOpen={isAiReportModalOpen}
        onClose={() => setIsAiReportModalOpen(false)}
        title="1차 AI 자동 심사 심층 평가 보고서"
        subtitle={`${selectedApp?.businessName || ''} (${selectedApp?.id || ''}) 종합 진단`}
        icon={<Sparkles className="size-5 text-amber-400" />}
        confirmLabel="확인 완료"
        confirmVariant="primary"
        onConfirm={() => setIsAiReportModalOpen(false)}
      >
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10">
            <div>
              <span className="text-[11px] text-muted-foreground block">AI 종합 적합도 점수</span>
              <span className="text-xl font-black font-mono text-amber-400">
                {selectedApp?.aiScore ?? 85}점 <span className="text-xs text-muted-foreground font-normal">/ 100</span>
              </span>
            </div>
            <Badge className="bg-amber-400/20 text-amber-300 border border-amber-400/40 font-mono">
              {((selectedApp?.aiScore ?? 85) >= 80) ? '추천 등급: 우수 (PASS)' : '추천 등급: 보통 (REVIEW)'}
            </Badge>
          </div>

          <div className="space-y-2.5">
            <div className="p-3 rounded-lg border border-border/80 bg-muted/20">
              <span className="font-bold text-foreground block mb-1">1. 비즈니스 모델 및 시장성</span>
              <p className="text-muted-foreground leading-relaxed">
                제출된 계획서의 가상 경제 생태계 기여도와 자금 운용의 타당성이 정밀하게 검토되었습니다.
              </p>
            </div>
            <div className="p-3 rounded-lg border border-border/80 bg-muted/20">
              <span className="font-bold text-foreground block mb-1">2. 고용 창출 및 일일 정산 계획</span>
              <p className="text-muted-foreground leading-relaxed">
                향후 사업체 설립 시 다른 시민 플레이어를 고용하고 일일 배당을 분배할 수 있는 선순환 구조를 보유하고 있습니다.
              </p>
            </div>
            <div className="p-3 rounded-lg border border-border/80 bg-muted/20">
              <span className="font-bold text-foreground block mb-1">3. AI 종합 심사 의견</span>
              <p className="text-foreground leading-relaxed font-sans bg-background/70 p-2.5 rounded border border-border/60">
                {selectedApp?.aiEvaluation || '계획서 요건을 정상 충족하며, 지원금 수령 후 14일 의무 창업 조항을 준수할 경우 국고 복식부기 승인을 적극 권장합니다.'}
              </p>
            </div>
          </div>
        </div>
      </AdminActionModal>
    </div>
  );
}
