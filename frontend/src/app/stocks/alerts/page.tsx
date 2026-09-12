import type { Metadata } from 'next';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { apiOrNull } from '@/lib/api';
import { getServerLocale } from '@/lib/locale-server';
import { requireMember } from '@/lib/session';
import { AlertManager } from './alert-manager';
import type { AlertEvent, AlertRule, AlertStock } from './alert-manager';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const metadata: Metadata = {
  title: '가상 주식 조건부 알림 — 월덕 머니버스',
  description: '서버에서 가상 주식 가격과 일일 변동 조건을 감시하는 회원 전용 알림 설정입니다.',
  robots: { index: false, follow: false },
};

export default async function StockAlertsPage() {
  await requireMember();
  const locale = await getServerLocale();
  const isEn = locale === 'en';
  const [market, alertResult, eventResult] = await Promise.all([
    apiOrNull<{ stocks: AlertStock[] }>('/api/v1/stocks'),
    apiOrNull<{ alerts: AlertRule[] }>('/api/v1/stocks/alerts'),
    apiOrNull<{ events: AlertEvent[] }>('/api/v1/stocks/alerts/events?limit=30'),
  ]);

  return <div className="grid gap-6"><PageHeader eyebrow="VIRTUAL MARKET" title={isEn ? 'Conditional Alerts' : '조건부 알림'}>{isEn ? 'Create server-evaluated alerts for virtual stock prices and daily changes. This is game data, not investment advice.' : '가상 주식 가격과 일일 변동을 서버가 확인해 알림 기록을 남깁니다. 실제 투자 조언이 아닌 게임 데이터입니다.'}</PageHeader>{market === null || alertResult === null || eventResult === null ? <EmptyState title={isEn ? 'Failed to load stock alerts.' : '주식 알림 정보를 불러오지 못했어요.'} description={isEn ? 'Please try again in a few moments.' : '잠시 후 다시 시도해 주세요.'} /> : <AlertManager stocks={market.stocks} alerts={alertResult.alerts} events={eventResult.events} isEn={isEn} />}</div>;
}
