'use client';

import { useEffect, useState } from 'react';
import { Landmark, Percent, ShieldAlert, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Policy {
  source: 'persistent_monetary_policy';
  ratePercent?: string;
  ratioPercent?: string;
  targetInflationPercent?: string;
  rationale: string;
  decidedAt?: string;
  enforcedAt?: string;
}
interface Snapshot {
  source: 'ledger_partial_and_persistent_policy';
  monetary: {
    m_total: string;
    m_circulating: string;
    m_treasury: string;
    m_bank_liquidity: string | null;
    m_locked: string | null;
    verified_invariant: false;
    active_policy_orders_count: number;
    total_mint_certificates_count: number;
    is_issuance_frozen: boolean;
  };
  policy: Policy;
  reserve: Policy;
}
function money(value: string | null | undefined): string {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) return '검증 대기';
  return new Intl.NumberFormat('ko-KR').format(BigInt(value)) + ' WLD';
}

export function CentralBankPanel() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [rate, setRate] = useState('');
  const [inflation, setInflation] = useState('2.00');
  const [reserve, setReserve] = useState('');
  const [reason, setReason] = useState('');

  async function reload(signal?: AbortSignal) {
    const response = await fetch('/api/admin/central-bank/status', { cache: 'no-store', signal: signal ?? null });
    if (!response.ok) throw new Error('원장 및 정책 DB 조회에 실패했습니다.');
    const result: Snapshot = await response.json();
    if (result.source !== 'ledger_partial_and_persistent_policy') throw new Error('정책 데이터 출처가 검증되지 않았습니다.');
    if (signal?.aborted) return;
    setSnapshot(result);
    setRate(result.policy.ratePercent ?? '');
    setInflation(result.policy.targetInflationPercent ?? '2.00');
    setReserve(result.reserve.ratioPercent ?? '');
    setError('');
  }

  useEffect(() => {
    const abort = new AbortController();
    void reload(abort.signal).catch(() => {
      if (!abort.signal.aborted) setError('서버 원장과 통화정책 DB를 확인할 수 없습니다. 성공으로 표시하지 않습니다.');
    });
    return () => abort.abort();
  }, []);

  async function save(kind: 'base-rate' | 'reserve-requirement') {
    if (reason.trim().length < 10) {
      toast.error('결정 사유를 10자 이상 입력하세요.');
      return;
    }
    const requested = kind === 'base-rate' ? rate : reserve;
    if (!/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(requested)) {
      toast.error('정확한 금리 또는 비율을 입력하세요.');
      return;
    }
    setBusy(true);
    try {
      const response = await fetch('/api/admin/central-bank/policy', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ kind, value: requested, rationale: reason.trim(), inflationTarget: inflation }),
      });
      if (!response.ok) throw new Error('정책 DB 저장에 실패했습니다. (HTTP ' + response.status + ')');
      const result = await response.json();
      if (result.source !== 'persistent_monetary_policy') throw new Error('정책 영속 저장 증빙이 없습니다.');
      await reload();
      setReason('');
      toast.success(kind === 'base-rate' ? '기준금리 정책 및 감사 기록 저장 완료' : '지급준비율 정책 및 감사 기록 저장 완료');
    } catch (failure) {
      toast.error(failure instanceof Error ? failure.message : '정책 저장에 실패했습니다.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Landmark className="h-6 w-6 text-blue-500" />
        <h2 className="text-xl font-bold">국가중앙은행 (Woldeok Central Bank)</h2>
        <Badge variant="outline">{snapshot ? '정책 DB 연동' : '데이터 확인 중'}</Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        기준금리와 지급준비율은 정책 DB에 영구 기록하고 감사 이력을 남깁니다. 실제 화폐 발행과 국고 이동은 별도 복식부기 승인 대상입니다.
      </p>
      {error ? <div role="alert" className="rounded-lg border border-red-500/40 p-4 text-sm">{error}</div> : null}
      {!snapshot && !error ? <p role="status">정책 DB와 원장 조회 중...</p> : null}
      {snapshot ? (
        <>
          <div role="status" className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
            아래 통화량은 실제 금융 테이블의 확인된 일부 합계이며 은행 유동성·에스크로 합산이 아직 빠져 있어 전체 통화량 불변식을 인증한 것은 아닙니다.
            조폐국 신규 화폐의 공식 원장 발행 기능은 별도 승인·정산 검증 전까지 실행하지 않습니다.
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ['원장 확인 합계 (부분)', money(snapshot.monetary.m_total)],
              ['회원 유통 계정 (부분)', money(snapshot.monetary.m_circulating)],
              ['국고 보유 금고 (부분)', money(snapshot.monetary.m_treasury)],
            ].map(([label, value]) => (
              <Card key={label}>
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs">{label}</CardDescription>
                  <CardTitle className="break-all font-mono text-xl">{value}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldAlert className="h-4 w-4 text-blue-500" />
                조폐국 화폐 인수 및 승인 현황
              </CardTitle>
              <CardDescription>실제 통화정책 명령서와 발행 증명서 DB 집계</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>승인된 통화정책 명령서: <strong>{snapshot.monetary.active_policy_orders_count}건</strong></p>
              <p>기록된 실제 화폐 발행 증명서: <strong>{snapshot.monetary.total_mint_certificates_count}건</strong></p>
              <p>신규 화폐 발행 상태: <strong>{snapshot.monetary.is_issuance_frozen ? '발행 동결' : '추가 원장 정산 검증 필요'}</strong></p>
              <p className="text-muted-foreground">명령서 승인과 화폐 실제 발행·국고 입금은 별도 단계입니다. 발행 증명서가 없으면 인수가 완료된 것으로 표시하지 않습니다.</p>
            </CardContent>
          </Card>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Percent className="h-4 w-4 text-blue-500" /> 국가 기준금리
                </CardTitle>
                <CardDescription>운영 PostgreSQL 정책 원본: {snapshot.policy.ratePercent}%</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <label htmlFor="cb-rate" className="block text-sm">기준금리 (%)</label>
                <input id="cb-rate" type="number" min="0" max="25" step="0.01" value={rate}
                  onChange={(e) => setRate(e.target.value)} className="w-full rounded border bg-transparent p-2" />
                <label htmlFor="cb-inflation" className="block text-sm">물가안정 목표 (%)</label>
                <input id="cb-inflation" type="number" min="0" max="25" step="0.01" value={inflation}
                  onChange={(e) => setInflation(e.target.value)} className="w-full rounded border bg-transparent p-2" />
                <Button disabled={busy} onClick={() => void save('base-rate')}>기준금리 정책 저장</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4 text-indigo-500" /> 지급준비율
                </CardTitle>
                <CardDescription>운영 PostgreSQL 정책 원본: {snapshot.reserve.ratioPercent}%</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <label htmlFor="cb-reserve" className="block text-sm">지급준비율 (%)</label>
                <input id="cb-reserve" type="number" min="1" max="50" step="0.01" value={reserve}
                  onChange={(e) => setReserve(e.target.value)} className="w-full rounded border bg-transparent p-2" />
                <Button disabled={busy} onClick={() => void save('reserve-requirement')}>지급준비율 정책 저장</Button>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">결정 사유 및 정책 감사 기록</CardTitle>
              <CardDescription>두 정책의 변경에 공통으로 사용하며, 변경 내역은 DB 감사 테이블에 추가됩니다. 기존 회원 잔액은 변경하지 않습니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <label htmlFor="cb-reason" className="block text-sm">정책 변경 사유 (10자 이상)</label>
              <textarea id="cb-reason" value={reason} onChange={(e) => setReason(e.target.value)}
                minLength={10} maxLength={2000} rows={3} className="w-full rounded border bg-transparent p-2" />
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
