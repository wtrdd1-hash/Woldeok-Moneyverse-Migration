'use client';

import Link from 'next/link';
import { Bell, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface StockConditionalOrdersProps {
  readonly stockId: string;
  readonly symbol: string;
  readonly name: string;
  readonly currentPrice: string;
  readonly holdingQuantity?: string | undefined;
  readonly isHalted?: boolean | undefined;
  readonly isEn?: boolean | undefined;
}

// There is no server-authoritative conditional order execution contract. Route to
// owner-scoped price alerts instead of treating browser storage as trade receipts.
export function StockConditionalOrders({ symbol, name, isEn = false }: StockConditionalOrdersProps) {
  const alertHref = `/stocks/alerts?stock=${encodeURIComponent(symbol)}`;

  return (
    <Card className="moneyverse-card min-w-0 overflow-hidden border-border/80 bg-card/70 shadow-sm">
      <CardHeader className="border-b border-border/50 bg-muted/20 p-4 pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-bold">
          <ShieldAlert aria-hidden="true" className="size-4 shrink-0 text-primary" />
          {isEn ? 'Verified stock price alerts' : '검증된 주식 가격 알림'}
        </CardTitle>
        <CardDescription className="text-xs">
          {isEn
            ? `Set price thresholds for ${name} (${symbol}) using the authenticated server alert service.`
            : `${name} (${symbol})의 가격 조건을 회원 전용 서버 알림에서 설정하세요.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 p-4">
        <p role="status" className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm leading-relaxed">
          {isEn
            ? 'The server evaluates price conditions and stores your alert events. Automatic sell orders, stop-loss execution and trade receipts are not supported.'
            : '서버가 가격 조건을 평가하고 회원별 알림 기록을 저장합니다. 자동 매도·손절 체결 및 거래 영수증 발급은 지원하지 않습니다.'}
        </p>
        <Button asChild className="min-h-11 w-full gap-2 whitespace-normal text-center focus-visible:ring-2 focus-visible:ring-ring sm:w-fit">
          <Link href={alertHref}>
            <Bell aria-hidden="true" className="size-4 shrink-0" />
            {isEn ? 'Configure price alerts' : '주식 가격 알림 설정'}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
