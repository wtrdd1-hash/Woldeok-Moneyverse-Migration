import type { Metadata } from 'next';
import Link from 'next/link';
import { StocksLeagueClient } from './stocks-league-client';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: '가상 주식 챔피언십 리그 | 월덕 머니버스',
  description: '서버에 기록된 가상 주식 리그 현황을 확인합니다. 카피 트레이딩은 원장 정산 검증 전 이용할 수 없습니다.',
  robots: { index: false, follow: false },
};

export default function StocksLeaguePage() {
  return <main className="mx-auto grid max-w-5xl gap-6 px-4 py-8 sm:px-6">
    <header className="grid gap-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Whale League · Virtual Stocks</p>
      <h1 className="text-2xl font-bold sm:text-3xl">가상 주식 챔피언십 리그</h1>
      <p className="text-sm text-muted-foreground">실제 증권 거래나 투자 서비스가 아닌 게임 내 가상 주식 기록입니다. 확인되지 않은 거래나 수익률은 표시하지 않습니다.</p>
      <Link href="/stocks" className="inline-flex min-h-11 w-fit items-center rounded-lg border px-4 py-2 text-sm underline underline-offset-4">가상 주식 거래소로 돌아가기</Link>
    </header>
    <StocksLeagueClient />
  </main>;
}
