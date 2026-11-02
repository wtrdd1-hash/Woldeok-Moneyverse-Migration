import type { Metadata } from 'next';
import { apiOrNull } from '@/lib/api';
import { getServerLocale } from '@/lib/locale-server';
import { parseLeagueSource } from './league-source';
import { StocksLeagueClient } from './stocks-league-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: '가상 주식 리그 — 서버 집계 순위',
  description: '게임 내 가상 주식 리그의 서버 집계 순위를 조회합니다. 카피 트레이딩은 원장 정산 검증 전까지 중단됩니다.',
  robots: { index: false, follow: false },
};

export default async function StocksLeaguePage() {
  const locale = await getServerLocale();
  const response = await apiOrNull<unknown>('/api/v1/stocks/league/current');
  const league = parseLeagueSource(response);
  return (
    <main data-page="stocks-league" className="mv-page mx-auto grid max-w-5xl gap-6 px-4 py-8 sm:px-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold sm:text-3xl">
          {locale === 'en' ? 'Virtual stock league (Whale League)' : '가상 주식 리그 (Whale League)'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {locale === 'en'
            ? 'Server-reported league standings are informational only. Copy trading and fee settlement are unavailable until ledger verification.'
            : '서버 집계 순위는 참고용입니다. 카피 트레이딩과 수수료 정산은 원장 검증 전까지 제공하지 않습니다.'}
        </p>
      </header>
      <StocksLeagueClient league={league} isEn={locale === 'en'} />
    </main>
  );
}
