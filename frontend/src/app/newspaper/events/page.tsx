import type { Metadata } from 'next';
import Link from 'next/link';
import { apiOrNull } from '@/lib/api';
import { canonicalUrl } from '@/lib/seo';
import { parseMarketEventDirection, verifiedMarketEvents } from '@/lib/market-event-direction';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: '진행 중인 가상시장 이벤트',
  description: '현재 진행 중인 가상시장 시나리오의 호재·악재를 구분해 확인합니다.',
  alternates: { canonical: canonicalUrl('/newspaper/events') },
  robots: { index: true, follow: true },
};

export default async function MarketEventsPage({ searchParams }: {
  searchParams: Promise<{ direction?: string | string[] }>;
}) {
  const params = await searchParams;
  let direction: 'up' | 'down' | null;
  try {
    if (Array.isArray(params.direction)) throw new Error('duplicate filter');
    direction = parseMarketEventDirection(params.direction);
  } catch {
    return <main className="mx-auto max-w-4xl p-6"><p role="alert">잘못된 이벤트 필터입니다.</p><Link href="/newspaper/events">필터 초기화</Link></main>;
  }
  const response = await apiOrNull<unknown>(`/api/v1/stocks/market-events${direction ? `?direction=${direction}` : ''}`);
  const events = verifiedMarketEvents(response, direction);
  const tabs = [
    { label: '전체', href: '/newspaper/events', value: null },
    { label: '호재', href: '/newspaper/events?direction=up', value: 'up' },
    { label: '악재', href: '/newspaper/events?direction=down', value: 'down' },
  ] as const;
  return (
    <main className="mx-auto grid max-w-4xl gap-6 px-4 py-8" data-page="market-events">
      <header className="space-y-2"><Link href="/newspaper" className="underline underline-offset-4">← 경제 신문</Link>
        <h1 className="text-2xl font-bold">진행 중인 가상시장 이벤트</h1>
        <p className="text-sm text-muted-foreground">PostgreSQL에서 확인된 현재 활성 시나리오만 표시합니다. 실제 주식·투자 정보가 아닙니다.</p>
      </header>
      <nav aria-label="이벤트 방향 필터" className="flex flex-wrap gap-3">
        {tabs.map((tab) => <Link key={tab.href} href={tab.href} aria-current={direction === tab.value ? 'page' : undefined}
          className="inline-flex min-h-11 items-center rounded-lg border border-border px-5 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2">{tab.label}</Link>)}
      </nav>
      {events === null ? <p role="alert" className="rounded-lg border p-4">시장 이벤트를 검증할 수 없습니다. 이벤트가 없다는 의미는 아닙니다. 잠시 후 다시 시도해 주세요.</p>
        : events.length === 0 ? <p role="status" className="rounded-lg border p-4">선택한 조건에 해당하는 진행 중인 이벤트가 없습니다.</p>
        : <><p role="status">현재 확인된 이벤트 {events.length}건</p><ul className="grid gap-4">
          {events.map((event) => <li key={event.id} className="space-y-2 rounded-xl border border-border p-5">
            <span className="text-xs font-semibold">{event.direction === 'up' ? '▲ 호재' : '▼ 악재'} · 강도 {event.strength}/3</span>
            <h2 className="text-lg font-bold">{event.headline}</h2><p className="whitespace-pre-wrap text-sm">{event.body}</p>
            <p className="text-xs text-muted-foreground">출처: {event.source} · 종료 예정: {new Date(event.ends_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}</p>
          </li>)}
        </ul></>}
    </main>
  );
}
