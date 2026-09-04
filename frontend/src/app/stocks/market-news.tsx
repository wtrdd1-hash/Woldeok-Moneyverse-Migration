import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/cn';
import { formatMoment } from '@/lib/money';

/** `stock_market_events_active` (124), as the API returns it. */
export interface MarketEvent {
  readonly id: string;
  readonly stock_id: string | null;
  readonly symbol: string | null;
  readonly name: string | null;
  readonly direction: 'up' | 'down';
  readonly strength: number;
  readonly headline: string;
  readonly body: string;
  readonly source: string;
  readonly starts_at: string;
  readonly ends_at: string;
}

const STRENGTH_LABEL: Readonly<Record<number, string>> = { 1: '소폭', 2: '보통', 3: '강력' };

/** What the event is about: one stock by name, or the whole market. */
export function eventScope(event: Pick<MarketEvent, 'symbol' | 'name'>): string {
  return event.symbol ? `${event.symbol} ${event.name ?? ''}`.trim() : '시장 전체';
}

/**
 * The news that is leaning the market right now.
 *
 * Nothing here is decoration: each line names what it is about, which way
 * it leans and how hard, and when it stops -- the four things a member
 * trading on it needs. The figures behind the lean stay in the console.
 */
export function MarketNews({ events }: { readonly events: readonly MarketEvent[] }) {
  if (events.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">시장 소식</CardTitle>
        <CardDescription>
          진행 중인 소식이에요. 끝나는 시각까지 해당 종목의 흐름이 그쪽으로 기울어요.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {events.map((event) => {
          const up = event.direction === 'up';
          return (
            <article
              key={event.id}
              className={cn(
                'grid gap-1.5 rounded-[12px] border-l-4 bg-surface p-3',
                up ? 'border-l-rise' : 'border-l-fall',
              )}
            >
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <Badge
                  variant="outline"
                  className={cn('font-bold', up ? 'border-rise text-rise' : 'border-fall text-fall')}
                >
                  {up ? '▲ 호재' : '▼ 악재'} · {STRENGTH_LABEL[event.strength] ?? event.strength}
                </Badge>
                <span className="font-mono text-muted-foreground">{eventScope(event)}</span>
                <span className="ml-auto text-muted-foreground">
                  {formatMoment(event.ends_at)}까지
                </span>
              </div>
              <h3 className="font-sans text-sm font-bold tracking-normal">{event.headline}</h3>
              {event.body && (
                <p className="text-sm text-muted-foreground [word-break:keep-all]">{event.body}</p>
              )}
            </article>
          );
        })}
      </CardContent>
    </Card>
  );
}
