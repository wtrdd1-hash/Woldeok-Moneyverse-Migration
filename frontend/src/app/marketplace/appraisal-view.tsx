'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, FileText, RefreshCw, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  formatAppraisalWld,
  parseAppraisalCertificates,
  type AppraisalCertificate,
} from './appraisal-evidence';

type AppraisalState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; certificates: AppraisalCertificate[] };

export function AppraisalView() {
  const [state, setState] = useState<AppraisalState>({ status: 'loading' });
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const abort = new AbortController();
    setState({ status: 'loading' });
    async function load() {
      try {
        const response = await fetch('/api/v1/marketplace/appraisals', {
          signal: abort.signal,
          cache: 'no-store',
          credentials: 'same-origin',
        });
        if (!response.ok) throw new Error('appraisal source unavailable');
        const certificates = parseAppraisalCertificates(await response.json());
        if (!abort.signal.aborted) setState({ status: 'ready', certificates });
      } catch {
        if (!abort.signal.aborted) setState({ status: 'error' });
      }
    }
    void load();
    return () => abort.abort();
  }, [refresh]);

  return (
    <section className="space-y-5" aria-label="Marketplace appraisal records">
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-600" aria-hidden="true" />
          <div className="space-y-2">
            <h2 className="text-base font-semibold">감정 기록 조회</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              발급 기록은 서버에서 확인된 항목만 표시합니다. 기록의 평가액과 출처는
              실제 거래 시세나 소유권·원작자 인증을 의미하지 않습니다.
            </p>
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
              실제 보유 아이템과 발급 원장의 결합 검증이 완료될 때까지 신규 감정서 발급은 중단됩니다.
              WLD 수수료도 청구하지 않습니다.
            </p>
          </div>
        </div>
      </div>

      {state.status === 'loading' && (
        <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
          서버에서 감정 기록을 확인하는 중입니다.
        </p>
      )}

      {state.status === 'error' && (
        <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 space-y-3">
          <div className="flex items-start gap-2 text-sm">
            <AlertCircle className="size-5 shrink-0" aria-hidden="true" />
            <span>감정 기록을 확인할 수 없습니다. 기록이 없다는 의미가 아닙니다.</span>
          </div>
          <Button type="button" variant="outline" className="min-h-11" onClick={() => setRefresh((n) => n + 1)}>
            <RefreshCw className="mr-2 size-4" aria-hidden="true" />
            다시 조회
          </Button>
        </div>
      )}

      {state.status === 'ready' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <FileText className="size-4" aria-hidden="true" />
              서버 조회 기록 ({state.certificates.length}건)
            </h3>
            <Button type="button" variant="outline" className="min-h-11" onClick={() => setRefresh((n) => n + 1)}>
              <RefreshCw className="mr-2 size-4" aria-hidden="true" />
              새로고침
            </Button>
          </div>
          {state.certificates.length === 0 ? (
            <p role="status" className="rounded-xl border p-5 text-sm text-muted-foreground">
              서버에서 확인된 발급 기록이 없습니다.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {state.certificates.map((cert) => (
                <Card key={cert.certId} className="min-w-0">
                  <CardHeader className="space-y-2">
                    <Badge variant="outline" className="w-fit">서버 기록 · 출처 미검증</Badge>
                    <CardTitle className="break-words text-base">{cert.itemName}</CardTitle>
                    <p className="break-all font-mono text-xs text-muted-foreground">{cert.certId}</p>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p>시스템 참고 평가액 (실거래가 아님): {formatAppraisalWld(cert.appraisedValueWld)} WLD</p>
                    <p>기록된 추정 범위: {formatAppraisalWld(cert.fairBandP25)} ~ {formatAppraisalWld(cert.fairBandP75)} WLD</p>
                    <p className="break-words">기록된 출처 (미검증): {cert.provenanceAuthor}</p>
                    <p>기록 시각: <time dateTime={cert.appraisedAt}>{cert.appraisedAt.slice(0, 10)}</time></p>
                    <p className="break-all font-mono text-xs text-muted-foreground">기록 해시 (검증 증명 아님): {cert.certHash}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
