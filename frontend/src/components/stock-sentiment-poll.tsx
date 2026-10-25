import Link from 'next/link';
import { Activity, Info, Newspaper } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TranslatedText as T } from '@/components/translated-text';

/** A market-wide index derived from PostgreSQL active events, never member votes. */
export interface MarketEventPulse {
  readonly sentimentScore: number;
  readonly sentimentLabel: 'VERY_BULLISH' | 'BULLISH' | 'NEUTRAL' | 'BEARISH' | 'VERY_BEARISH';
  readonly activeEventsCount: number;
  readonly leadHeadline: string;
  readonly leadSummary: string;
  /** Timestamp of the newest active event, not the time of this HTTP response. */
  readonly updatedAt: string;
}

const LABELS: Record<MarketEventPulse['sentimentLabel'], { ko: string; en: string }> = {
  VERY_BULLISH: { ko: '상승 압력 매우 높음', en: 'Very strong upward pressure' },
  BULLISH: { ko: '상승 압력', en: 'Upward pressure' },
  NEUTRAL: { ko: '중립', en: 'Neutral' },
  BEARISH: { ko: '하락 압력', en: 'Downward pressure' },
  VERY_BEARISH: { ko: '하락 압력 매우 높음', en: 'Very strong downward pressure' },
};

function verifiedPulse(value: MarketEventPulse | null | undefined): value is MarketEventPulse {
  return Boolean(value &&
    Number.isInteger(value.sentimentScore) && value.sentimentScore >= 0 && value.sentimentScore <= 100 &&
    Number.isInteger(value.activeEventsCount) && value.activeEventsCount >= 0 && value.activeEventsCount <= 100 &&
    Object.prototype.hasOwnProperty.call(LABELS, value.sentimentLabel) &&
    typeof value.leadHeadline === 'string' && typeof value.leadSummary === 'string' &&
    typeof value.updatedAt === 'string' && Number.isFinite(Date.parse(value.updatedAt)));
}

interface StockSentimentPollProps {
  readonly symbol: string;
  readonly name: string;
  readonly pulse?: MarketEventPulse | null;
}

/** Legacy export name retained for the stock page; there is no client-side poll. */
export function StockSentimentPoll({ symbol, name, pulse }: StockSentimentPollProps) {
  const verified = verifiedPulse(pulse);
  const hasEvents = verified && pulse.activeEventsCount > 0;
  const label = verified ? LABELS[pulse.sentimentLabel] : null;

  return (
    <Card className="overflow-hidden rounded-2xl border-border/80 bg-card/95">
      <CardHeader className="border-b border-border/60 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <Activity className="size-4 text-primary" aria-hidden="true" />
          <CardTitle className="text-sm sm:text-base">
            <T korean="전체 시장 이벤트 압력" english="Market-wide event pressure" japanese="市場全体のイベント圧力" chinese="全市场事件压力" />
          </CardTitle>
          <Badge variant="outline">MARKET-WIDE</Badge>
        </div>
        <CardDescription className="text-xs leading-relaxed">
          <T korean="PostgreSQL에 기록된 진행 중인 시장 이벤트를 바탕으로 계산한 지표입니다. 회원 투표나 해당 종목의 매매 신호가 아닙니다." english="Calculated from active PostgreSQL market events. Not member votes, a stock-specific forecast, or a trading signal." japanese="進行中の市場イベントに基づく全市場指標です。会員投票や個別銘柄の売買シグナルではありません。" chinese="根据进行中的市场事件计算，不代表用户投票、个股预测或交易信号。" />
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 p-4">
        {!verified ? (
          <p role="status" className="rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">
            <T korean="시장 이벤트 지표를 확인할 수 없습니다. 잠시 후 다시 확인해 주세요." english="Market event data is unavailable. Please try again later." japanese="市場イベント情報を確認できません。後ほど再試行してください。" chinese="无法验证市场事件数据，请稍后重试。" />
          </p>
        ) : !hasEvents ? (
          <p role="status" className="rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">
            <T korean="현재 진행 중인 시장 이벤트가 없습니다. 참여자 수나 상승·하락 투표를 추정하지 않습니다." english="There are no active market events. No participant counts or votes are inferred." japanese="進行中の市場イベントはありません。投票数は推定しません。" chinese="当前没有进行中的市场事件，不推测投票或参与人数。" />
          </p>
        ) : (
          <div className="space-y-3" aria-label="Verified market events">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-semibold"><T korean={label!.ko} english={label!.en} /></span>
              <span className="font-mono text-lg font-bold tabular-nums">{pulse.sentimentScore}/100</span>
            </div>
            <meter min={0} max={100} value={pulse.sentimentScore} className="h-3 w-full" aria-label="Market event pressure index" />
            <p className="text-xs text-muted-foreground">
              <T korean="검증된 진행 중 이벤트" english="Verified active events" />: {pulse.activeEventsCount}건
            </p>
            <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
              <p className="break-words text-sm font-semibold">{pulse.leadHeadline.slice(0, 160)}</p>
              <p className="mt-1 break-words text-xs text-muted-foreground">{pulse.leadSummary.slice(0, 500)}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                <T korean="가장 최근 이벤트 시각 (UTC)" english="Latest event timestamp (UTC)" />: {new Date(pulse.updatedAt).toISOString().slice(0, 16).replace('T', ' ')}
              </p>
            </div>
          </div>
        )}
        <p className="flex items-start gap-2 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          <span>{name} ({symbol}) <T korean="상세 화면에 표시되는 전체 시장 공통 지표입니다." english="shows this market-wide indicator, not a symbol-specific vote." /></span>
        </p>
        <Link href="/newspaper" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Newspaper className="size-4" aria-hidden="true" />
          <T korean="시장 소식 확인" english="View market news" japanese="市場ニュースを見る" chinese="查看市场新闻" />
        </Link>
      </CardContent>
    </Card>
  );
}
