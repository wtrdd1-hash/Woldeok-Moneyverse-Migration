import { groupDigits } from '@/lib/money';

export interface BorrowQuoteView {
  eligible: boolean;
  reason?: 'ACTIVE_LOAN' | 'NO_CREDIT';
  principalWld?: string;
  interestWld?: string;
  totalDueWld?: string;
  creditLimitWld: string;
  interestRateBps: number;
  termDays: number;
  binding: false;
  notice: string;
}

const canonical = (value: unknown): value is string => typeof value === 'string' && /^(?:0|[1-9][0-9]*)$/.test(value);

export function BorrowQuoteCard({ quote }: { quote: BorrowQuoteView }) {
  if (quote.binding !== false || !canonical(quote.creditLimitWld) ||
      !Number.isInteger(quote.interestRateBps) || quote.interestRateBps < 0 || quote.interestRateBps > 10000 ||
      !Number.isInteger(quote.termDays) || quote.termDays < 1 || quote.termDays > 365) {
    return <p role="alert">검증된 대출 견적을 표시할 수 없습니다.</p>;
  }
  if (!quote.eligible) {
    return <p role="status">{quote.reason === 'ACTIVE_LOAN' ? '기존 대출이 있어 신규 대출 견적을 제공할 수 없습니다.' : '현재 신용 한도 내에서 신규 대출이 불가능합니다.'}</p>;
  }
  if (!canonical(quote.principalWld) || !canonical(quote.interestWld) || !canonical(quote.totalDueWld) ||
      BigInt(quote.principalWld) + BigInt(quote.interestWld) !== BigInt(quote.totalDueWld)) {
    return <p role="alert">검증된 대출 견적을 표시할 수 없습니다.</p>;
  }
  return (
    <section aria-label="가상 대출 예상 견적" className="rounded-xl border p-5 space-y-3">
      <h2 className="text-lg font-semibold">가상 대출 예상 견적</h2>
      <dl className="space-y-2">
        <div><dt>신청 예정 원금</dt><dd>{groupDigits(quote.principalWld)} WLD</dd></div>
        <div><dt>현재 정책 이율</dt><dd>{(quote.interestRateBps / 100).toFixed(2)}%</dd></div>
        <div><dt>예상 이자(올림)</dt><dd>{groupDigits(quote.interestWld)} WLD</dd></div>
        <div><dt>예상 총상환액</dt><dd>{groupDigits(quote.totalDueWld)} WLD</dd></div>
        <div><dt>현재 정책 대출 기간</dt><dd>{quote.termDays}일</dd></div>
      </dl>
      <p className="text-sm text-muted-foreground">실제 대출이 아닙니다. 신청 시 서버가 잔액·대출 여부·신용 정책을 다시 검증하며, 금액과 승인 여부는 달라질 수 있습니다.</p>
    </section>
  );
}
