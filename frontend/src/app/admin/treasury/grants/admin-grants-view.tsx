'use client';

import React, { useState } from 'react';
import {
  Rocket,
  CheckCircle2,
  XCircle,
  Clock,
  Coins,
  FileText,
  UserCheck,
  ExternalLink,
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
import type { TreasuryGrantApplication } from '@/app/treasury/treasury.types';

interface AdminGrantsViewProps {
  readonly initialApplications: readonly TreasuryGrantApplication[];
  readonly isEn?: boolean | undefined;
}

export function AdminGrantsView({
  initialApplications,
  isEn = false,
}: AdminGrantsViewProps) {
  const [applications, setApplications] = useState<readonly TreasuryGrantApplication[]>(
    initialApplications
  );
  const [selectedApp, setSelectedApp] = useState<TreasuryGrantApplication | null>(
    initialApplications[0] ?? null
  );
  const [reviewNote, setReviewNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleReviewAction = async (action: 'APPROVE' | 'REJECT') => {
    if (!selectedApp) return;
    setIsProcessing(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/admin/treasury/grants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: selectedApp.id,
          action,
          reviewNote: reviewNote || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setStatusMsg(`오류: ${data.message || '심사 처리에 실패했습니다.'}`);
        setIsProcessing(false);
        return;
      }

      setStatusMsg(data.message);
      // 목록 상태 갱신
      const updated = applications.map((app) =>
        app.id === selectedApp.id
          ? {
              ...app,
              status: (action === 'APPROVE' ? 'APPROVED' : 'REJECTED') as 'APPROVED' | 'REJECTED',
              reviewNote: data.reviewNote,
              reviewedAt: data.reviewedAt,
            }
          : app
      );
      setApplications(updated);
      setSelectedApp((prev) =>
        prev
          ? {
              ...prev,
              status: (action === 'APPROVE' ? 'APPROVED' : 'REJECTED') as 'APPROVED' | 'REJECTED',
              reviewNote: data.reviewNote,
              reviewedAt: data.reviewedAt,
            }
          : null
      );
    } catch {
      setStatusMsg('네트워크 통신 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: TreasuryGrantApplication['status']) => {
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
            지급 승인
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge variant="outline" className="font-mono text-[11px] bg-rose-500/10 text-rose-400 border-rose-500/30">
            <XCircle className="size-3 mr-1" />
            반려됨
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {statusMsg && (
        <div className="p-3.5 rounded-xl border border-primary/40 bg-primary/10 text-primary font-mono text-xs flex items-center gap-2">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 좌측 2열: 접수된 그랜트 신청서 목록 테이블 */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="moneyverse-card border-border/80 bg-card/75 shadow-sm overflow-hidden backdrop-blur-md">
            <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/50 bg-muted/20">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                    <Rocket className="size-4 text-sky-400" />
                    <span>접수된 창업 그랜트 신청서 ({applications.length}건)</span>
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    대국민 포털에서 시민들이 접수한 벤처 지원금 신청 심사 큐
                  </p>
                </div>
                <Badge variant="outline" className="font-mono text-[11px]">
                  국고 VAULT_MAIN 출금 연동
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/40 hover:bg-transparent">
                      <TableHead className="text-xs font-bold text-muted-foreground">접수번호</TableHead>
                      <TableHead className="text-xs font-bold text-muted-foreground">기업/프로젝트명</TableHead>
                      <TableHead className="text-xs font-bold text-muted-foreground">신청액</TableHead>
                      <TableHead className="text-xs font-bold text-muted-foreground">상태</TableHead>
                      <TableHead className="text-xs font-bold text-muted-foreground text-right">접수일시</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((app) => {
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
                            <div className="text-foreground">{app.businessName}</div>
                            <div className="text-[11px] text-muted-foreground font-mono">
                              신청자: {app.applicantMasked}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-xs font-bold text-primary tabular-nums">
                            {app.requestedAmountWld.toLocaleString()} WLD
                          </TableCell>
                          <TableCell>{getStatusBadge(app.status)}</TableCell>
                          <TableCell className="font-mono text-[11px] text-muted-foreground text-right whitespace-nowrap">
                            {new Date(app.submittedAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 우측 1열: 선택된 신청서 심사 패널 */}
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
                <div className="flex items-center gap-2 text-xs font-mono text-primary font-bold">
                  <Coins className="size-3.5" />
                  <span>신청액: {selectedApp.requestedAmountWld.toLocaleString()} WLD</span>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-5 space-y-4 text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-foreground block flex items-center gap-1">
                    <FileText className="size-3.5 text-sky-400" />
                    사업 기획서 및 계획
                  </span>
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/50 text-muted-foreground leading-relaxed whitespace-pre-wrap font-sans">
                    {selectedApp.businessPlan}
                  </div>
                </div>

                {selectedApp.reviewNote && (
                  <div className="space-y-1">
                    <span className="font-bold text-foreground block flex items-center gap-1">
                      <UserCheck className="size-3.5 text-emerald-400" />
                      심사 결과 메모
                    </span>
                    <div className="p-3 rounded-xl bg-muted/60 border border-border/60 font-mono text-[11px] text-foreground">
                      {selectedApp.reviewNote}
                    </div>
                  </div>
                )}

                {selectedApp.status === 'PENDING_REVIEW' && (
                  <div className="space-y-3 pt-2 border-t border-border/50">
                    <div className="space-y-1">
                      <label className="font-bold text-foreground block">
                        심사 의견 / 사유 기록
                      </label>
                      <input
                        type="text"
                        placeholder="예: 기술 혁신성 입증, 시드 50,000 WLD 승인 집행"
                        value={reviewNote}
                        onChange={(e) => setReviewNote(e.target.value)}
                        className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Button
                        size="sm"
                        disabled={isProcessing}
                        onClick={() => handleReviewAction('REJECT')}
                        variant="outline"
                        className="text-xs font-bold border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                      >
                        <XCircle className="size-3.5 mr-1" />
                        반려 처리
                      </Button>
                      <Button
                        size="sm"
                        disabled={isProcessing}
                        onClick={() => handleReviewAction('APPROVE')}
                        className="text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
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
            <Card className="moneyverse-card border-border/80 bg-card/50 p-6 text-center text-xs text-muted-foreground">
              심사할 신청서를 목록에서 선택해주세요.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
