import { formatWld } from '@/lib/money';
import { isCanonicalWld } from '../sides';

export interface RecentReceipt {
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
  readonly historyScope: 'LATEST_50';
}

/** Do not turn an absent or inconsistent owner pocket into a fake 0 WLD. */
export function receiptDisplay(receipt: RecentReceipt) {
  if (receipt.receiptVersion !== 1 || receipt.state !== 'CONFIRMED'
    || receipt.currency !== 'WLD' || receipt.historyScope !== 'LATEST_50'
    || !isCanonicalWld(receipt.netWalletDelta)) {
    throw new Error('unverified wallet receipt');
  }
  const cash = receipt.cashDelta;
  const bank = receipt.bankDelta;
  if (receipt.detailCompleteness === 'VERIFIED') {
    if (!isCanonicalWld(cash) || !isCanonicalWld(bank)
      || BigInt(cash) + BigInt(bank) !== BigInt(receipt.netWalletDelta)) {
      throw new Error('wallet receipt pocket mismatch');
    }
  } else if (cash !== null || bank !== null) {
    throw new Error('partial wallet receipt contains unverified pockets');
  }
  return {
    net: formatWld(receipt.netWalletDelta),
    cash: cash === null ? '확인할 수 없음' : formatWld(cash),
    bank: bank === null ? '확인할 수 없음' : formatWld(bank),
    scope: '최근 50건 중 확인된 원장 기록입니다. 이전 거래는 이 화면에서 조회할 수 없습니다.',
  };
}
