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
  DialogTitle,
} from '@/components/ui/dialog';
import { groupDigits } from '@/lib/money';
import type { MarketplaceHolding } from './marketplace';

export interface AppraisalCertificate {
  readonly certId: string;
  readonly itemId: string;
  readonly itemName: string;
  readonly rarity: string;
  readonly appraisedValueWld: string;
  readonly fairBandP25: string;
  readonly fairBandP75: string;
  readonly provenanceAuthor: string;
  readonly craftedAt: string;
  readonly appraisedAt: string;
  readonly certHash: string;
}

interface AppraisalViewProps {
  readonly holdings: readonly MarketplaceHolding[];
  readonly userBalanceWld: string;
}

export function AppraisalView({ holdings, userBalanceWld: _userBalanceWld }: AppraisalViewProps) {
  const [certificates, setCertificates] = useState<AppraisalCertificate[]>([]);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');

  const [selectedHoldingId, setSelectedHoldingId] = useState<string>('');
  const [isAppraising, setIsAppraising] = useState(false);
  const [newCert, setNewCert] = useState<AppraisalCertificate | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // 실제 백엔드 공인 감정서 목록 로드
  React.useEffect(() => {
    let cancelled = false;
    async function loadAppraisals() {
      try {
        const res = await fetch('/api/v1/marketplace/appraisals');
        if (!res.ok) throw new Error('appraisal list request failed');
        const data = await res.json();
        if (!cancelled) {
          setCertificates(Array.isArray(data) ? data : []);
          setLoadState('ready');
        }
      } catch {
        if (!cancelled) {
          setCertificates([]);
          setLoadState('error');
        }
      }
    }
    loadAppraisals();
    return () => {
      cancelled = true;
    };
  }, []);

  // 기획서 §5.3 수수료 계산: max(250, ceil(reference * 0.0025))
  const selectedItem = holdings.find((h) => h.catalog_id === selectedHoldingId);
  const refValue = selectedItem?.rarity === 'LEGENDARY' ? 10000 : selectedItem?.rarity === 'EPIC' ? 4000 : 1500;
  const appraisalFee = Math.max(250, Math.ceil(refValue * 0.0025));

  const handleRequestAppraisal = async () => {
    if (!selectedItem) return;
    setIsAppraising(true);
    setActionError(null);

    try {
      const res = await fetch('/api/v1/marketplace/appraisals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: selectedItem.catalog_id,
          itemName: selectedItem.name,
          rarity: selectedItem.rarity,
        }),
      });

      if (!res.ok) throw new Error('appraisal request failed');
      const serverCert: AppraisalCertificate = await res.json();
      setCertificates((prev) => [serverCert, ...prev]);
      setNewCert(serverCert);
    } catch {
      setActionError(
        '감정서 발급은 소유권·출처 검증과 원장 수수료 정산이 완료될 때까지 사용할 수 없습니다.',
      );
    } finally {
      setIsAppraising(false);
      setSelectedHoldingId('');
    }
  };


  return (
    <div className="grid gap-6">
      {actionError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {actionError}
        </div>
      )}
      {/* 공인 감정소 안내 배너 */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Award className="size-4.5" />
            </span>
            <h3 className="font-semibold text-sm sm:text-base text-foreground">
              공인 시스템 감정소 (Appraisal Service & Provenance)
            </h3>
            <Badge variant="outline" className="text-[11px] font-mono border-amber-500/30 text-amber-600">
              기획서 §5.3 공인 인증
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            기존 서버 감정서는 조회할 수 있습니다. 소유권·출처 검증과 원장 기반 수수료 정산이 완성될 때까지 신규 공인 감정서 발급은 일시 중지되어 있습니다.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div className="text-[11px] text-muted-foreground">기본 감정 수수료</div>
            <div className="text-sm font-bold font-mono text-primary">250 WLD ~</div>
          </div>
        </div>
      </div>

      {/* 새 감정 의뢰 폼 카드 */}
      <Card className="border border-border/80 shadow-sm">
        <CardHeader className="p-4 sm:p-5 pb-3">
          <CardTitle className="text-sm sm:text-base flex items-center gap-2">
            <Sparkles className="size-4 text-amber-500" />
            <span>보유 아이템 공인 감정 의뢰</span>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            감정서를 발급받으면 거래소 판매 등록 시 [공인 감정필] 보증 배지가 자동으로 부착되어 구매자 신뢰도가 상승합니다.
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
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-xs sm:text-sm"
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
            disabled
            className="h-10 min-h-[40px] text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white"
          >
            {isAppraising ? (
              <>
                <RefreshCw className="mr-1.5 size-3.5 animate-spin" />
                출처 원장 무결성 검증 중...
              </>
            ) : (
              '감정서 신규 발급 일시 중지'
            )}
          </Button>
        </CardFooter>
      </Card>

      {loadState === 'loading' && (
        <div className="rounded-xl border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
          서버 감정서 목록을 불러오는 중입니다.
        </div>
      )}
      {loadState === 'error' && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          감정서 목록을 불러오지 못했습니다. 임시·예시 인증서는 표시하지 않습니다.
        </div>
      )}
      {loadState === 'ready' && certificates.length === 0 && (
        <div className="rounded-xl border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
          현재 서버에 발급된 감정서가 없습니다.
        </div>
      )}

      {/* 발급된 공인 감정서 인증 카드 목록 */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <FileText className="size-4 text-primary" />
          <span>보유 공인 감정서 인증 목록 ({certificates.length}건)</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certificates.map((cert) => (
            <Card
              key={cert.certId}
              className="border border-amber-500/30 bg-gradient-to-br from-card to-amber-500/[0.02] shadow-sm relative overflow-hidden"
            >
              {/* 우측 상단 공인 인증 리본 워터마크 */}
              <div className="absolute right-3 top-3 flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                <ShieldCheck className="size-3.5" />
                <span>CERTIFIED</span>
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
                    <span className="text-muted-foreground">공인 평가 가치</span>
                    <span className="font-mono font-bold text-primary">{groupDigits(cert.appraisedValueWld)} WLD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">공정 시세 밴드 (P25~P75)</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">
                      {groupDigits(cert.fairBandP25)} ~ {groupDigits(cert.fairBandP75)} WLD
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">원작자 / 제작 출처</span>
                    <span className="font-medium text-foreground truncate max-w-[180px]">{cert.provenanceAuthor}</span>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-muted-foreground truncate bg-muted/20 p-1.5 rounded border border-border/40">
                  해시 증명: {cert.certHash}
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
            <DialogTitle className="text-base">공인 시스템 감정서 발급 완료</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              [{newCert.itemName}] 물품의 출처 및 시세 밴드 무결성이 공인 인증되었습니다.
            </DialogDescription>

            <div className="my-4 rounded-lg bg-muted/40 p-3.5 border border-border/60 text-xs text-left space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">인증서 ID</span>
                <span className="font-mono font-bold text-foreground">{newCert.certId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">공정 시세 밴드</span>
                <span className="font-mono text-emerald-600 font-semibold">
                  {groupDigits(newCert.fairBandP25)} ~ {groupDigits(newCert.fairBandP75)} WLD
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">감정 수수료 소각</span>
                <span className="font-mono text-primary font-bold">250 WLD (HARD_SINK)</span>
              </div>
            </div>

            <Button onClick={() => setNewCert(null)} className="w-full bg-primary text-primary-foreground text-xs font-semibold">
              확인 완료
            </Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
