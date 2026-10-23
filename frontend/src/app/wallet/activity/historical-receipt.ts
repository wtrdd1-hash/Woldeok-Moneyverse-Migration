import { formatWld } from '@/lib/money';
import { isCanonicalWld } from '../sides';

/** Private owner receipt: amounts remain canonical strings, never JS numbers. */
export interface HistoricalReceipt {
  readonly receiptVersion: 1;
  readonly state: 'CONFIRMED';
  readonly transactionId: string;
  readonly currency: 'WLD';
  readonly reason: string;
  readonly occurredAt: string;
  readonly netWalletDelta: string;
  readonly cashDelta: string | null;
  readonly bankDelta: string | null;
  readonly detailCompleteness: 'VERIFIED' | 'PARTIAL';
  readonly historyScope: 'ALL_POSTED';
}

export function historicalReceiptDisplay(receipt: HistoricalReceipt) {
  if (receipt.receiptVersion !== 1 || receipt.state !== 'CONFIRMED'
    || receipt.currency !== 'WLD' || receipt.historyScope !== 'ALL_POSTED'
    || !isCanonicalWld(receipt.netWalletDelta)) {
    throw new Error('unverified historical receipt');
  }
  const complete = receipt.detailCompleteness === 'VERIFIED';
  if (complete && (!isCanonicalWld(receipt.cashDelta) || !isCanonicalWld(receipt.bankDelta)
    || BigInt(receipt.cashDelta) + BigInt(receipt.bankDelta) !== BigInt(receipt.netWalletDelta))) {
    throw new Error('historical receipt pocket mismatch');
  }
  if (!complete && receipt.detailCompleteness !== 'PARTIAL') throw new Error('invalid receipt completeness');
  return {
    net: formatWld(receipt.netWalletDelta),
    cash: complete ? formatWld(receipt.cashDelta) : '확인 불가',
    bank: complete ? formatWld(receipt.bankDelta) : '확인 불가',
    scope: '전체 게시 원장 중 본인 거래만 조회한 기록입니다. 법적 은행 거래증명서가 아닙니다.',
  };
}
