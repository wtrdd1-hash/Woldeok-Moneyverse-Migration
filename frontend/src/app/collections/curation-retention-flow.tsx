'use client';

import { useEffect, useState } from 'react';
import { Archive, Lock, RefreshCw, ShieldAlert } from 'lucide-react';

type CollectionState =
  | { readonly kind: 'loading' }
  | { readonly kind: 'error' }
  | { readonly kind: 'unverified'; readonly count: string };

function isQuarantinedCollectionResponse(value: unknown): value is {
  pieces: []; unverifiedRecords: string; verificationStatus: 'unavailable';
} {
  if (!value || typeof value !== 'object') return false;
  const data = value as Record<string, unknown>;
  return data.verificationStatus === 'unavailable' &&
    Array.isArray(data.pieces) && data.pieces.length === 0 &&
    typeof data.unverifiedRecords === 'string' && /^(0|[1-9]\d*)$/.test(data.unverifiedRecords);
}

/** Never turn a browser cache or a historical seed into proof of collection ownership. */
export function CurationRetentionFlow({ userName = '월덕 시민' }: { readonly userName?: string }) {
  const [state, setState] = useState<CollectionState>({ kind: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch('/api/v1/collections', { cache: 'no-store' });
        if (!response.ok) throw new Error('collections unavailable');
        const payload: unknown = await response.json();
        if (!isQuarantinedCollectionResponse(payload)) throw new Error('collection provenance is not verified');
        if (!cancelled) setState({ kind: 'unverified', count: payload.unverifiedRecords });
      } catch {
        if (!cancelled) setState({ kind: 'error' });
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [attempt]);

  return (
    <section aria-labelledby="collection-truth-title" className="space-y-5 rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl bg-primary/10 p-3 text-primary" aria-hidden="true"><Archive className="size-6" /></div>
        <div className="space-y-2">
          <h2 id="collection-truth-title" className="text-xl font-bold">{userName}님의 수집품 기록</h2>
          <p className="text-sm text-muted-foreground">수집품의 실제 지급 근거가 확인되기 전에는 소유 여부, 등급, 획득 날짜를 확정하여 표시하지 않습니다.</p>
        </div>
      </div>
      {state.kind === 'loading' && <p role="status" aria-live="polite" className="text-sm">소장품 기록의 검증 상태를 확인하고 있습니다.</p>}
      {state.kind === 'unverified' && (
        <div role="status" aria-live="polite" className="space-y-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
          <div className="flex items-center gap-2 font-semibold"><ShieldAlert className="size-5" aria-hidden="true" />검증된 소장품이 없습니다.</div>
          <p className="text-sm text-muted-foreground">미검증 기록 {state.count}건은 삭제되지 않았지만, 독립적인 지급 근거가 확인되기 전까지 소유품으로 표시하지 않습니다.</p>
          <p className="flex items-center gap-2 text-xs text-muted-foreground"><Lock className="size-4" aria-hidden="true" />메모 변경, 즐겨찾기, 단계 진행 및 공유는 검증 완료 전까지 중지됩니다.</p>
        </div>
      )}
      {state.kind === 'error' && (
        <div role="alert" className="space-y-3 rounded-xl border border-destructive/40 p-5">
          <p className="text-sm font-semibold">소장품 정보를 확인할 수 없습니다. 저장된 기록이 없다는 의미는 아닙니다.</p>
          <button type="button" onClick={() => { setState({ kind: 'loading' }); setAttempt((n) => n + 1); }} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2">
            <RefreshCw className="size-4" aria-hidden="true" />다시 확인
          </button>
        </div>
      )}
    </section>
  );
}
