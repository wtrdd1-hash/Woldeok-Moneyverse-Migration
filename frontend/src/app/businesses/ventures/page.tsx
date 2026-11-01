import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft, RefreshCw, ShieldOff } from 'lucide-react';
import { apiOrNull } from '@/lib/api';
import { getServerLocale } from '@/lib/locale-server';
import { requireMember } from '@/lib/session';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const metadata: Metadata = {
  title: '가상 벤처 투자 — 원장 확인 대기',
  description: '가상 벤처 투자·IPO·배당은 실제 회원별 정산 원장 검증 전까지 이용할 수 없습니다.',
  robots: { index: false, follow: false },
};

export default async function VenturesPage() {
  await requireMember();
  const isEn = (await getServerLocale()) === 'en';

  // Both owner-scoped endpoints currently refuse unverified financial evidence.
  // Do not interpret a legacy 200 or an empty array as certified equity or a
  // certified empty portfolio without a ledger-backed response contract.
  await Promise.all([
    apiOrNull<unknown>('/api/v1/businesses/ventures/pitches'),
    apiOrNull<unknown>('/api/v1/businesses/ventures/investments'),
  ]);

  return (
    <main data-page="ventures" className="mx-auto grid w-full max-w-4xl gap-6 px-4 py-8 sm:px-6">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">VENTURES · SOURCE STATUS</p>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {isEn ? 'Virtual startups and venture investments' : '가상 스타트업·벤처 투자'}
        </h1>
        <p className="max-w-prose text-sm leading-7 text-muted-foreground">
          {isEn
            ? 'Member investments, public offerings and dividends require verified, owner-scoped ledger receipts.'
            : '회원 투자, 공모주 청약 및 배당금은 회원별 원장 영수증으로 확인할 수 있어야 합니다.'}
        </p>
      </header>

      <section role="alert" aria-labelledby="venture-hold-title" className="space-y-4 rounded-2xl border border-amber-500/50 bg-amber-500/5 p-5 sm:p-7">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-1 size-6 shrink-0 text-amber-600" aria-hidden="true" />
          <div className="min-w-0 space-y-2">
            <h2 id="venture-hold-title" className="text-lg font-semibold leading-7">
              {isEn ? 'Venture financing is unavailable' : '벤처 투자 내역을 확인할 수 없어 현재 이용할 수 없습니다'}
            </h2>
            <p className="text-sm leading-7">
              {isEn
                ? 'The server has not certified an authoritative offering list or member-specific equity and dividend ledger. No WLD balance, shares, subscriptions, payouts or successful transactions are asserted.'
                : '서버에서 검증된 공모 목록과 회원별 지분·배당 원장을 확인하지 못했습니다. WLD 잔액, 보유 지분, 청약 금액, 미수령 배당금 또는 거래 성공을 임의로 표시하지 않습니다.'}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2 rounded-xl border border-border bg-background/70 p-4 text-sm leading-7">
          <ShieldOff className="mt-1 size-5 shrink-0" aria-hidden="true" />
          <p>{isEn
            ? 'Startup registration, IPO subscriptions, shareholder voting and dividend claims remain disabled. No WLD is charged or paid on this page.'
            : '창업 등록, 공모주 청약, 주주 투표 및 배당금 수령은 비활성화되어 있습니다. 이 화면에서 WLD가 차감되거나 지급되지 않습니다.'}</p>
        </div>
      </section>

      <nav aria-label={isEn ? 'Venture navigation' : '벤처 투자 이동'} className="flex flex-wrap gap-3">
        <Link href="/businesses" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-semibold hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          <ArrowLeft className="size-4" aria-hidden="true" />{isEn ? 'Businesses' : '사업 목록'}
        </Link>
        <Link href="/businesses/ventures" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-semibold hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          <RefreshCw className="size-4" aria-hidden="true" />{isEn ? 'Check again' : '다시 확인'}
        </Link>
      </nav>
    </main>
  );
}
