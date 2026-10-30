import type { Metadata } from 'next';
import { EmptyState } from '@/components/empty-state';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { apiOrNull } from '@/lib/api';
import { getServerLocale } from '@/lib/locale-server';
import { requireMember } from '@/lib/session';
import { parseStockAlertEvents, type StockAlertEventKind } from '@/lib/stock-alert-event-proof';
import { AlertManager } from './alert-manager';
import { resolveInitialAlertStockId } from './alert-deeplink';
import type { AlertRule, AlertStock } from './alert-manager';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const metadata: Metadata = {
  title: '가상 주식 조건부 알림',
  description: '서버에서 가상 주식 가격과 일일 변동 조건을 감시하는 회원 전용 알림 설정입니다.',
  robots: { index: false, follow: false },
};

export default async function StockAlertsPage({ searchParams }: { readonly searchParams: Promise<{ readonly stock?: string | string[]; readonly kind?: string | string[] }> }) {
  await requireMember();
  const locale = await getServerLocale();
  const { stock: stockParam, kind: rawKind } = await searchParams;
  const kind: StockAlertEventKind = rawKind === 'price' || rawKind === 'change' ? rawKind : 'all';
  const isEn = locale === 'en';
  const [market, alertResult, eventResult] = await Promise.all([
    apiOrNull<{ stocks: AlertStock[] }>('/api/v1/stocks'),
    apiOrNull<{ alerts: AlertRule[] }>('/api/v1/stocks/alerts'),
    apiOrNull<unknown>(`/api/v1/stocks/alerts/events?limit=30${kind === 'all' ? '' : `&kind=${kind}`}`),
  ]);

  const initialStockId = market ? resolveInitialAlertStockId(market.stocks, stockParam) : undefined;
  const verifiedEvents = eventResult === null ? null : parseStockAlertEvents(eventResult, kind, 30);

  return <div data-page="stocks-alerts" className="mv-page mv-page--finance grid gap-6"><PageHeader eyebrow="VIRTUAL MARKET" title={isEn ? 'Conditional Alerts' : '조건부 알림'}>{isEn ? 'Create server-evaluated alerts for virtual stock prices and daily changes. This is game data, not investment advice.' : '가상 주식 가격과 일일 변동을 서버가 확인해 알림 기록을 남깁니다. 실제 투자 조언이 아닌 게임 데이터입니다.'}</PageHeader><form method="get" role="search" className="flex flex-wrap items-end gap-3 rounded-lg border p-4"><label htmlFor="trigger-kind" className="grid gap-1 text-sm"><span>{isEn ? 'Trigger category' : '발생 알림 종류'}</span><select id="trigger-kind" name="kind" defaultValue={kind} className="min-h-11 rounded-md border bg-background px-3"><option value="all">{isEn ? 'All triggers' : '전체 알림'}</option><option value="price">{isEn ? 'Price thresholds' : '가격 조건'}</option><option value="change">{isEn ? 'Daily change' : '일일 변동률'}</option></select></label><Button type="submit">{isEn ? 'Filter triggers' : '알림 필터 적용'}</Button><p className="w-full text-sm text-muted-foreground">{isEn ? 'Only the latest 30 owner triggers are searched; this is not your complete alert history.' : '최근 30건 내에서만 검색하며 전체 알림 기록을 의미하지 않습니다.'}</p></form>{market === null || alertResult === null || verifiedEvents === null ? <EmptyState title={isEn ? 'Failed to load stock alerts.' : '주식 알림 정보를 불러오지 못했어요.'} description={isEn ? 'Please try again in a few moments.' : '잠시 후 다시 시도해 주세요.'} /> : <AlertManager stocks={market.stocks} alerts={alertResult.alerts} events={verifiedEvents.events} isEn={isEn} initialStockId={initialStockId} />}</div>;
}
