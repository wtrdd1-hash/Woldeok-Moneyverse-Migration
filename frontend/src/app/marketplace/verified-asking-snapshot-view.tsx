import { Activity, AlertTriangle, Info } from 'lucide-react';
import type { MarketplaceAskingSnapshot } from './verified-asking-snapshot';

export function VerifiedAskingSnapshot({ snapshot }: { readonly snapshot: MarketplaceAskingSnapshot | null }) {
  return (
    <section aria-labelledby="marketplace-asking-title" className="rounded-xl border border-border/80 bg-card p-4 shadow-sm sm:p-5">
      <div className="flex items-start gap-3">
        <Activity aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
        <div className="min-w-0 flex-1 space-y-2">
          <h2 id="marketplace-asking-title" className="text-base font-semibold">등록 호가 표본</h2>
          <p className="text-xs leading-relaxed text-muted-foreground">
            로그인된 회원에게 서버가 반환한 최신 활성 매물 최대 50건의 등록 가격입니다.
            체결 내역·7일/30일 거래량·전체 시장의 공정 가격을 나타내지 않습니다.
          </p>
          {snapshot === null ? (
            <div role="status" aria-live="polite" className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm">
              <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              <span>조회 불가 — 매물 호가를 검증할 수 없습니다. 잠시 후 다시 확인해 주세요.</span>
            </div>
          ) : snapshot.count === 0 ? (
            <p role="status" aria-live="polite" className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
              활성 매물 0건 — 서버가 반환한 표본에 표시할 호가가 없습니다.
            </p>
          ) : (
            <div role="status" aria-live="polite" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="min-w-0 rounded-lg border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">조회된 활성 매물</p>
                <p className="mt-1 text-lg font-semibold tabular-nums">{snapshot.count}건</p>
              </div>
              <div className="min-w-0 rounded-lg border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">표본 최저 등록 호가</p>
                <p className="mt-1 break-all text-base font-semibold tabular-nums">{snapshot.minPriceWld} WLD</p>
              </div>
              <div className="min-w-0 rounded-lg border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">표본 최고 등록 호가</p>
                <p className="mt-1 break-all text-base font-semibold tabular-nums">{snapshot.maxPriceWld} WLD</p>
              </div>
            </div>
          )}
          {snapshot?.limited && (
            <p className="flex items-start gap-1 text-xs text-muted-foreground">
              <Info aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
              표본 상한 50건에 도달했습니다. 전체 활성 매물 건수는 확인되지 않았습니다.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
