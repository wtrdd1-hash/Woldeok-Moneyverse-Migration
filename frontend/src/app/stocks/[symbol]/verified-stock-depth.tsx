import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { groupDigits } from '@/lib/money';

export interface StockDepthAvailability {
  readonly stockId?: string;
  readonly status: 'UNAVAILABLE';
  readonly source: 'NO_VERIFIED_OPEN_ORDERS';
  readonly bids: readonly never[];
  readonly asks: readonly never[];
}

interface VerifiedStockDepthProps {
  readonly currentPrice: string;
  readonly status: StockDepthAvailability | null;
  readonly isEn?: boolean;
}

export function VerifiedStockDepth({ currentPrice, status, isEn = false }: VerifiedStockDepthProps) {
  const verifiedUnavailable = status?.status === 'UNAVAILABLE'
    && status.source === 'NO_VERIFIED_OPEN_ORDERS'
    && Array.isArray(status.bids) && status.bids.length === 0
    && Array.isArray(status.asks) && status.asks.length === 0;

  return (
    <Card className="toss-card border-border/80 shadow-sm">
      <CardHeader className="border-b border-border/60">
        <CardTitle className="text-base">{isEn ? 'Verified order depth' : '검증된 주문 호가 정보'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div>
          <p className="text-xs text-muted-foreground">{isEn ? 'Latest listed stock price (not an executable order)' : '최근 공시된 가상 주식 현재가 (체결 가능한 주문 호가가 아님)'}</p>
          <p className="text-lg font-bold tabular-nums">{groupDigits(currentPrice)} WLD</p>
        </div>
        {verifiedUnavailable ? (
          <p role="status" className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
            {isEn
              ? 'Verified bid/ask order quantities are not available. No live liquidity, spread or trade executions are implied by the quote.'
              : '현재 검증된 호가 잔량 정보가 제공되지 않습니다. 표시된 현재가는 실시간 주문 잔량, 스프레드 또는 체결 내역을 의미하지 않습니다.'}
          </p>
        ) : (
          <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm">
            {isEn
              ? 'Depth status could not be verified. No orderbook is shown.'
              : '호가 상태를 확인하지 못했습니다. 검증되지 않은 주문 잔량은 표시하지 않습니다.'}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
