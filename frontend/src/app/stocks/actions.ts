'use server';

import { revalidatePath } from 'next/cache';
import type { ActionState } from '@/lib/action-state';
import { failure, idempotencyKey, mutate, wholeNumber } from '@/lib/mutate';
import { groupDigits } from '@/lib/money';

interface TradeReceipt {
  readonly trade_id: string;
  readonly unit_price: string;
  readonly gross_amount: string;
  readonly tax_amount: string;
  readonly current_price: string;
}

/**
 * Buys or sells one stock.
 *
 * Neither the price nor the total is sent. The database function reads the
 * current price inside the transaction that moves the shares and the money,
 * so what the page was showing when the member pressed the button cannot
 * decide what they pay — which is also why the receipt reports the unit price
 * that was actually used.
 */
export async function placeOrder(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const stockId = String(formData.get('stockId') ?? '');
  const side = String(formData.get('side') ?? '');
  const quantity = wholeNumber(formData.get('quantity'));

  if (stockId === '') return { status: 'error', message: '종목을 확인할 수 없어요.' };
  if (side !== 'buy' && side !== 'sell') {
    return { status: 'error', message: '매수인지 매도인지 확인할 수 없어요.' };
  }
  if (quantity === null) return { status: 'error', message: '수량은 1 이상 정수로 입력해 주세요.' };

  try {
    const receipt = await mutate<TradeReceipt>(
      `/api/v1/stocks/${encodeURIComponent(stockId)}/orders`,
      { body: { side, quantity, idempotencyKey: idempotencyKey() } },
    );
    revalidatePath('/stocks');
    return {
      status: 'ok',
      message: `${side === 'buy' ? '매수' : '매도'}가 체결됐어요. 체결가 ${groupDigits(receipt.unit_price)} WLD · 세금 ${groupDigits(receipt.tax_amount)} WLD`,
    };
  } catch (error) {
    return failure(error, '지금은 거래를 완료할 수 없어요.');
  }
}
