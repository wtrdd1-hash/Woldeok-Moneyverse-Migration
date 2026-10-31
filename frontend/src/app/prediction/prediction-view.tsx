import Link from 'next/link';
import { AlertTriangle, ArrowRight, Info, TrendingUp } from 'lucide-react';
import type { PredictionSource } from './prediction-source';

/** Reference-only market view. A trade UI cannot exist without an authoritative ledger contract. */
export function PredictionView({ source }: { readonly source: PredictionSource }) {
  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8 sm:px-6 sm:py-12" data-page="prediction">
      <header className="space-y-3">
        <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold">
          <Info aria-hidden="true" className="size-4" /> VIRTUAL ECONOMY · REFERENCE ONLY
        </span>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">월덕 가상 예측 마켓</h1>
        <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
          예측 지분의 실제 주문·체결·정산 및 보상 원장 계약이 확인되지 않아 거래를 제공하지 않습니다.
          표시되는 종목 정보는 기존 주식 조회 API의 참고 자료이며 예측시장 가격이나 배당률이 아닙니다.
        </p>
      </header>

      <section aria-labelledby="prediction-availability" className="rounded-2xl border border-amber-500/40 bg-amber-500/5 p-5 sm:p-6">
        <h2 id="prediction-availability" className="flex items-center gap-2 text-base font-semibold">
          <AlertTriangle aria-hidden="true" className="size-5 text-amber-600" /> 예측 지분 거래는 현재 이용할 수 없습니다
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          예측시장 주문·수수료·예상 환급금·풀 규모를 검증할 수 없습니다. WLD 차감이나 예측 지분 매수가 발생하지 않습니다.
        </p>
      </section>

      <section aria-labelledby="stock-reference-heading" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="stock-reference-heading" className="flex items-center gap-2 text-lg font-semibold">
            <TrendingUp aria-hidden="true" className="size-5" /> 가상 주식 참고 정보
          </h2>
          <Link href="/prediction" className="inline-flex min-h-11 items-center rounded-lg border px-4 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            다시 조회
          </Link>
        </div>
        {source.status === 'unavailable' ? (
          <div role="status" aria-live="polite" className="rounded-xl border p-5 text-sm leading-7">
            현재 주식 참고 자료를 확인할 수 없습니다. 조회 장애나 잘못된 응답을 종목 0건으로 처리하지 않습니다.
          </div>
        ) : source.status === 'empty' ? (
          <p role="status" aria-live="polite" className="rounded-xl border p-5 text-sm">
            주식 조회 API에서 현재 등록된 종목이 없음을 확인했습니다. 예측시장 개설 여부와는 무관합니다.
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2" aria-label="서버에서 확인된 가상 주식 종목">
            {source.stocks.map((stock) => (
              <li key={stock.symbol} className="min-w-0 rounded-xl border bg-card p-4">
                <p className="break-words font-semibold">{stock.name} <span className="text-sm text-muted-foreground">({stock.symbol})</span></p>
                <p className="mt-2 break-all font-mono text-sm">{BigInt(stock.price).toLocaleString('en-US')} WLD</p>
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs leading-6 text-muted-foreground">
          가격의 최신성은 검증되지 않았습니다. 실제 거래 여부와 체결 가격은 주식 거래소에서 별도로 확인하세요.
        </p>
      </section>
      <nav aria-label="관련 서비스" className="flex flex-wrap gap-3">
        <Link href="/stocks" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          가상 주식 거래소 <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
        <Link href="/help" className="inline-flex min-h-11 items-center rounded-xl border px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          도움말
        </Link>
      </nav>
    </main>
  );
}
