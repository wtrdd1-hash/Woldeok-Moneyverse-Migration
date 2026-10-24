import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ShieldAlert, TrendingUp } from 'lucide-react';
import { apiOrNull } from '@/lib/api';
import { getServerLocale } from '@/lib/locale-server';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '가상 예측 마켓 | Prediction Market',
  description: '예측 지분 거래는 아직 제공되지 않습니다. 실제 서버에서 확인한 가상 주식 종목을 조회할 수 있습니다.',
  robots: { index: false, follow: false },
};

interface VerifiedStock {
  readonly symbol: string;
  readonly name: string;
  readonly currentPrice: string;
}

function verifiedStocks(value: unknown): VerifiedStock[] | null {
  if (!value || typeof value !== 'object' || !('stocks' in value)) return null;
  const rows = value.stocks;
  if (!Array.isArray(rows)) return null;

  const seen = new Set<string>();
  const stocks: VerifiedStock[] = [];
  for (const row of rows) {
    if (!row || typeof row !== 'object') continue;
    const { symbol, name, current_price: price } = row as Record<string, unknown>;
    if (
      typeof symbol !== 'string' || !/^[A-Z0-9]{1,12}$/.test(symbol) ||
      typeof name !== 'string' || !name.trim() || name.length > 100 ||
      typeof price !== 'string' || !/^[0-9]{1,40}$/.test(price) ||
      BigInt(price) <= 0n || seen.has(symbol)
    ) continue;
    seen.add(symbol);
    stocks.push({ symbol, name: name.trim(), currentPrice: price });
    if (stocks.length === 6) break;
  }
  return stocks;
}

export default async function PredictionPage() {
  const [locale, response] = await Promise.all([
    getServerLocale(),
    apiOrNull<{ stocks: unknown }>('/api/v1/stocks'),
  ]);
  const isEn = locale === 'en';
  const stocks = verifiedStocks(response);

  return (
    <main data-page="prediction" className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8 sm:px-6 sm:py-12">
      <header className="rounded-3xl border border-amber-500/30 bg-card p-5 sm:p-8">
        <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
          <ShieldAlert aria-hidden="true" className="size-6 shrink-0" />
          <span className="text-xs font-semibold uppercase tracking-widest">Prediction market</span>
        </div>
        <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
          {isEn ? 'Virtual Prediction Market' : '월덕 가상 예측 마켓'}
        </h1>
        <p role="status" className="mt-4 text-sm leading-7 text-muted-foreground">
          {isEn
            ? 'Prediction-share trading is not supported. There is no verified prediction order book, settlement or WLD receipt. No shares have been purchased.'
            : '예측 지분 거래는 현재 지원하지 않습니다. 검증된 예측 주문장·정산·WLD 거래 영수증이 없어 지분 매수는 실행되지 않습니다.'}
        </p>
        <p className="mt-2 text-xs leading-6 text-muted-foreground">
          {isEn
            ? 'WLD and stocks are in-service virtual assets, not real-world financial products.'
            : 'WLD와 가상 주식은 서비스 내 가상 자산이며 현실의 금융상품이 아닙니다.'}
        </p>
      </header>

      <section aria-labelledby="verified-stock-heading" className="rounded-3xl border border-border bg-card p-5 sm:p-8">
        <div className="flex items-center gap-2">
          <TrendingUp aria-hidden="true" className="size-5 text-primary" />
          <h2 id="verified-stock-heading" className="text-lg font-bold">
            {isEn ? 'Server-verified virtual stocks' : '서버에서 확인한 가상 주식 종목'}
          </h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {isEn
            ? 'These are stock catalogue quotes, not prediction-market odds or a promise of execution.'
            : '아래 시세는 가상 주식 카탈로그의 조회값이며 예측시장 배당률이나 체결 보장이 아닙니다.'}
        </p>

        {stocks === null ? (
          <p role="status" className="mt-5 rounded-xl bg-muted p-4 text-sm">
            {isEn ? 'Stock quotes cannot be loaded right now.' : '주식 시세를 지금 불러올 수 없습니다.'}
          </p>
        ) : stocks.length === 0 ? (
          <p role="status" className="mt-5 rounded-xl bg-muted p-4 text-sm">
            {isEn ? 'No virtual stocks were returned by the server.' : '조회된 가상 주식 종목이 없습니다.'}
          </p>
        ) : (
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {stocks.map((stock) => (
              <li key={stock.symbol}>
                <Link
                  href={`/stocks/${stock.symbol}`}
                  className="flex min-h-14 items-center justify-between gap-3 rounded-xl border border-border px-4 py-3 transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{stock.name} ({stock.symbol})</span>
                    <span className="block text-xs text-muted-foreground">
                      {BigInt(stock.currentPrice).toLocaleString('en-US')} WLD
                    </span>
                  </span>
                  <ArrowRight aria-hidden="true" className="size-5 shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Link
          href="/stocks"
          className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {isEn ? 'Open virtual stock exchange' : '가상 주식 거래소로 이동'}
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </section>
    </main>
  );
}
