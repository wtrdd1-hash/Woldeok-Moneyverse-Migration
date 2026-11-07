'use client';

import Link from 'next/link';
import { BellRing, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StockQuickAlertDialog } from './stock-quick-alert-dialog';

interface StockConditionalOrdersProps {
  readonly stockId: string;
  readonly symbol: string;
  readonly name: string;
  readonly currentPrice: string;
  readonly holdingQuantity?: string | undefined;
  readonly isHalted?: boolean | undefined;
  readonly isEn?: boolean | undefined;
}

/**
 * The server supports owner-scoped price notifications, not conditional sell orders.
 * Never rehydrate legacy browser-only rules: their TRIGGERED flag is not a trade receipt.
 */
export function StockConditionalOrders({
  stockId,
  symbol,
  name,
  currentPrice,
  isHalted = false,
  isEn = false,
}: StockConditionalOrdersProps) {
  return (
    <Card data-testid="stock-conditional-alerts" className="moneyverse-card min-w-0 border-amber-500/30 bg-card/70">
      <CardHeader className="space-y-2 p-4 pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <BellRing aria-hidden="true" className="size-5 shrink-0 text-amber-600" />
          {isEn ? 'Server-backed price alerts' : '서버에 저장되는 가격 알림'}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 p-4 pt-2">
        <p role="status" className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm leading-6">
          <ShieldAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-amber-600" />
          <span>
            {isEn
              ? 'A price alert does not place automatic sell orders or transfer WLD. Only a confirmed manual trade can change holdings.'
              : '가격 알림은 자동 매도 주문을 실행하지 않습니다. 실제 보유 수량과 WLD 잔액은 서버에서 확인된 수동 거래로만 변경됩니다.'}
          </span>
        </p>
        <p className="text-sm leading-6 text-muted-foreground">
          {isEn
            ? 'Previous browser-only watch rules are not server orders or trade receipts. This screen never treats their local triggered state as a fill.'
            : '기존 브라우저 감시 규칙은 서버 주문이나 체결 기록이 아닙니다. 과거 브라우저의 발동 표시는 실제 체결로 인정되지 않습니다.'}
        </p>
        {isHalted && (
          <p className="text-sm text-amber-700 dark:text-amber-300">
            {isEn ? 'Trading is halted; price alerts do not override the halt.' : '거래 중단 상태입니다. 가격 알림을 설정해도 거래가 재개되지는 않습니다.'}
          </p>
        )}
        <nav aria-label={isEn ? 'Stock price alert actions' : '주식 가격 알림 기능'} className="flex flex-wrap items-center gap-3">
          <StockQuickAlertDialog stockId={stockId} symbol={symbol} name={name} currentPrice={currentPrice} isEn={isEn} />
          <Button asChild variant="outline" className="min-h-11 max-w-full">
            <Link href="/stocks/alerts">{isEn ? 'View my price alerts' : '내 가격 알림 보기'}</Link>
          </Button>
        </nav>
        <p className="text-xs leading-5 text-muted-foreground">
          {isEn
            ? 'Alerts are saved only after the authenticated API confirms the owner-specific record. Delivery timing is not guaranteed.'
            : '알림은 인증된 서버가 회원별 저장 결과를 확인한 뒤 등록됩니다. 알림 전달 시각은 보장되지 않습니다.'}
        </p>
      </CardContent>
    </Card>
  );
}
