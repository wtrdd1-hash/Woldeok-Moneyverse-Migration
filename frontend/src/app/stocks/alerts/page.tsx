import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { apiOrNull } from '@/lib/api';
import { getServerLocale } from '@/lib/locale-server';
import { requireMember } from '@/lib/session';
import { AlertManager } from './alert-manager';
import { resolveInitialAlertStockId } from './alert-deeplink';
import { parseStockAlertPage } from './alert-source';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const metadata: Metadata = {
  title: '가상 주식 조건부 알림',
  description: '서버에서 가상 주식 가격과 일일 변동 조건을 감시하는 회원 전용 알림 설정입니다.',
  robots: { index: false, follow: false },
};

export default async function StockAlertsPage({ searchParams }: { readonly searchParams: Promise<{ readonly stock?: string | string[] }> }) {
  await requireMember();
  const locale = await getServerLocale();
  const { stock: stockParam } = await searchParams;
  const isEn = locale === 'en';
  const [market, alertResult, eventResult] = await Promise.all([
    apiOrNull<unknown>('/api/v1/stocks'),
    apiOrNull<unknown>('/api/v1/stocks/alerts'),
    apiOrNull<unknown>('/api/v1/stocks/alerts/events?limit=30'),
  ]);

  const verified = parseStockAlertPage(market, alertResult, eventResult);
  const initialStockId = verified ? resolveInitialAlertStockId(verified.stocks, stockParam) : undefined;

  return <div data-page="stocks-alerts" className="mv-page mv-page--finance grid gap-6"><PageHeader eyebrow="VIRTUAL MARKET" title={isEn ? 'Conditional Alerts' : '조건부 알림'}>{isEn ? 'Create server-evaluated alerts for virtual stock prices and daily changes. This is game data, not investment advice.' : '가상 주식 가격과 일일 변동을 서버가 확인해 알림 기록을 남깁니다. 실제 투자 조언이 아닌 게임 데이터입니다.'}</PageHeader>{!verified ? <section role="alert" className="grid justify-items-start gap-3"><EmptyState title={isEn ? 'Failed to verify stock alerts.' : '주식 알림 정보를 확인할 수 없어요.'} description={isEn ? 'The server response could not be verified. Your existing alerts have not been changed.' : '서버 응답을 확인하지 못했습니다. 기존 알림 설정은 변경되지 않았습니다.'} /><Link href="/stocks/alerts" className="inline-flex min-h-11 items-center rounded-lg border px-4 py-2 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">{isEn ? 'Retry loading alerts' : '알림 다시 조회'}</Link></section> : <AlertManager stocks={verified.stocks} alerts={verified.alerts} events={verified.events} isEn={isEn} initialStockId={initialStockId} />}</div>;
}
