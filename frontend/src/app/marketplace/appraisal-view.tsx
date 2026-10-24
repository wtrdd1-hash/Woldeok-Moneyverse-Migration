'use client';

import React, { useState } from 'react';
import { Award, ShieldCheck, Sparkles, RefreshCw, FileText } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { groupDigits } from '@/lib/money';
import type { MarketplaceHolding } from './marketplace';
import { loadAppraisals, requestAppraisal } from './appraisal-actions';
import type { AppraisalCertificate } from './appraisal-receipt';

interface AppraisalViewProps {
  readonly holdings: readonly MarketplaceHolding[];
  readonly userBalanceWld: string;
}

export function AppraisalView({ holdings }: AppraisalViewProps) {
  const [certificates, setCertificates] = useState<AppraisalCertificate[]>([]);
  const [listStatus, setListStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [notice, setNotice] = useState('');
  const [selectedHoldingId, setSelectedHoldingId] = useState<string>('');
  const [isAppraising, setIsAppraising] = useState(false);
  const [newCert, setNewCert] = useState<AppraisalCertificate | null>(null);

  const refreshAppraisals = async () => {
    setListStatus('loading');
    setNotice('');
    try {
      const items = await loadAppraisals();
      setCertificates(items);
      setListStatus('ready');
    } catch {
      setCertificates([]);
      setListStatus('error');
      setNotice('감정 기록을 확인하지 못했습니다. 잠시 후 다시 조회해 주세요.');
    }
  };

  React.useEffect(() => {
    let cancelled = false;
    loadAppraisals().then(
      (items) => {
        if (cancelled) return;
        setCertificates(items);
        setListStatus('ready');
      },
      () => {
        if (cancelled) return;
        setCertificates([]);
        setListStatus('error');
        setNotice('감정 기록을 확인하지 못했습니다. 잠시 후 다시 조회해 주세요.');
      },
    );
    return () => { cancelled = true; };
  }, []);

  const selectedItem = holdings.find((h) => h.catalog_id === selectedHoldingId && h.quantity > 0);
  // Migration 276 charges a fixed 250 WLD, not the older proposal's variable estimate.
  const appraisalFee = 250;

  const handleRequestAppraisal = async () => {
    if (!selectedItem || listStatus !== 'ready' || isAppraising) return;
    setIsAppraising(true);
    setNotice('');
    try {
      const result = await requestAppraisal(selectedItem.catalog_id);
      if (result.status === 'confirmed') {
        setCertificates(result.certificates);
        setNewCert(result.certificate);
      } else {
        setNotice(result.message);
        if (result.status === 'unknown') setListStatus('error');
      }
    } catch {
      setListStatus('error');
      setNotice('요청 결과를 확인하지 못했습니다. 재의뢰 전에 서버 기록을 다시 조회해 주세요.');
    } finally {
      setIsAppraising(false);
      setSelectedHoldingId('');
    }
  };

  return (
    <div className="grid gap-6">
      {/* 공인 감정소 안내 배너 */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Award className="size-4.5" />
            </span>
            <h3 className="font-semibold text-sm sm:text-base text-foreground">
              서버 기록 감정서 (Appraisal Receipts)
            </h3>
            <Badge variant="outline" className="text-[11px] font-mono border-amber-500/30 text-amber-600">
              PostgreSQL 기록 확인
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            서버에 저장된 감정 가치와 기록을 조회합니다. 현재 출처는 사용자 제공 정보이며 원작자 정품 인증이 아닙니다. 발급 수수료 250 WLD는 서버의 원장 거래로 처리되며, 성공 여부는 저장된 기록을 재조회해 확인합니다.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div className="text-[11px] text-muted-foreground">기본 감정 수수료</div>
            <div className="text-sm font-bold font-mono text-primary">250 WLD</div>
          </div>
        </div>
      </div>

      {/* 새 감정 의뢰 폼 카드 */}
      <Card className="border border-border/80 shadow-sm">
        <CardHeader className="p-4 sm:p-5 pb-3">
          <CardTitle className="text-sm sm:text-base flex items-center gap-2">
            <Sparkles className="size-4 text-amber-500" />
            <span>보유 아이템 감정 의뢰</span>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            감정서는 서버에 기록된 참고 가치입니다. 정품 보증이나 판매 배지 부착을 의미하지 않습니다.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 pt-0 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <label htmlFor="select-holding-item" className="text-xs font-semibold text-foreground">
                감정할 보유 아이템 선택
              </label>
              <select
                id="select-holding-item"
                value={selectedHoldingId}
                onChange={(e) => setSelectedHoldingId(e.target.value)}
                className="w-full min-h-11 rounded-md border border-input bg-background px-3 text-xs sm:text-sm"
              >
                <option value="">감정 의뢰할 수집품/장식품 선택...</option>
                {holdings.map((h) => (
                  <option key={h.catalog_id} value={h.catalog_id}>
                    {h.name} ({h.rarity}) - {h.category}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-foreground">예상 소각 수수료</div>
              <div className="h-10 rounded-md bg-muted/40 border border-border/60 px-3 flex items-center justify-between text-xs font-mono font-bold text-primary">
                <span>{selectedItem ? groupDigits(appraisalFee) : '0'} WLD</span>
                <span className="text-[10px] text-muted-foreground font-normal">영구 소각</span>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-0 pb-4 px-4 sm:px-5 flex justify-end">
          <Button
            onClick={handleRequestAppraisal}
            disabled={!selectedItem || isAppraising || listStatus !== 'ready'}
            className="min-h-11 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white"
          >
            {isAppraising ? (
              <>
                <RefreshCw className="mr-1.5 size-3.5 animate-spin" />
                서버 감정 기록 확인 중...
              </>
            ) : (
              '서버 감정서 발급 요청'
            )}
          </Button>
        </CardFooter>
      </Card>

      <div role="status" aria-live="polite" className="text-xs text-muted-foreground">
        {notice || (listStatus === 'loading' ? '감정 기록을 불러오는 중입니다.' : '')}
      </div>
      {listStatus === 'error' && (
        <Button variant="outline" className="min-h-11 w-fit" onClick={refreshAppraisals}>감정 기록 다시 조회</Button>
      )}
      {/* Only owner-readback certificates are rendered. */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <FileText className="size-4 text-primary" />
          <span>서버 확인 감정 기록 ({listStatus === 'ready' ? `${certificates.length}건` : listStatus === 'loading' ? '조회 중' : '조회 불가'})</span>
        </h4>

        {listStatus === 'ready' && certificates.length === 0 && (
          <p className="text-xs text-muted-foreground" role="status">발급된 감정 기록이 없습니다.</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certificates.map((cert) => (
            <Card
              key={cert.certId}
              className="border border-amber-500/30 bg-gradient-to-br from-card to-amber-500/[0.02] shadow-sm relative overflow-hidden"
            >
              {/* 우측 상단 공인 인증 리본 워터마크 */}
              <div className="absolute right-3 top-3 flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                <ShieldCheck className="size-3.5" />
                <span>서버 기록</span>
              </div>

              <CardHeader className="p-4 sm:p-5 pb-2">
                <div className="text-[10px] font-mono text-muted-foreground">{cert.certId}</div>
                <CardTitle className="text-base truncate font-semibold mt-0.5">{cert.itemName}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
                    {cert.rarity}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    감정일: {cert.appraisedAt.slice(0, 10)}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-5 pt-2 space-y-2.5 text-xs">
                <div className="rounded-lg bg-muted/40 p-3 border border-border/60 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">서버 평가 참고 가치</span>
                    <span className="font-mono font-bold text-primary">{groupDigits(cert.appraisedValueWld)} WLD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">서버 계산 참고 범위 (P25~P75)</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">
                      {groupDigits(cert.fairBandP25)} ~ {groupDigits(cert.fairBandP75)} WLD
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">출처 표기 (미검증)</span>
                    <span className="font-medium text-foreground truncate max-w-[180px]">{cert.provenanceAuthor}</span>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-muted-foreground truncate bg-muted/20 p-1.5 rounded border border-border/40">
                  기록 해시: {cert.certHash}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 발급 성공 모달 */}
      {newCert && (
        <Dialog open={!!newCert} onOpenChange={() => setNewCert(null)}>
          <DialogContent className="max-w-md text-center py-6">
            <div className="size-12 rounded-full bg-amber-500/10 text-amber-600 mx-auto flex items-center justify-center mb-2">
              <Award className="size-6" />
            </div>
            <DialogTitle className="text-base">서버 감정서 기록 확인</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              [{newCert.itemName}] 물품의 감정 기록이 서버에서 확인되었습니다. 원작자·정품 검증은 포함되지 않습니다.
            </DialogDescription>

            <div className="my-4 rounded-lg bg-muted/40 p-3.5 border border-border/60 text-xs text-left space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">인증서 ID</span>
                <span className="font-mono font-bold text-foreground">{newCert.certId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">서버 계산 참고 범위</span>
                <span className="font-mono text-emerald-600 font-semibold">
                  {groupDigits(newCert.fairBandP25)} ~ {groupDigits(newCert.fairBandP75)} WLD
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">감정 수수료 소각</span>
                <span className="font-mono text-primary font-bold">250 WLD (서버 원장 처리)</span>
              </div>
            </div>

            <Button onClick={() => setNewCert(null)} className="w-full min-h-11 bg-primary text-primary-foreground text-xs font-semibold">
              확인 완료
            </Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
