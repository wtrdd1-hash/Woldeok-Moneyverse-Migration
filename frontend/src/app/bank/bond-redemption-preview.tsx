import Link from 'next/link';
import { groupDigits } from '@/lib/money';

export interface BondRedemptionQuote {
  readonly bondId: string;
  readonly bondName: string;
  readonly principalAmount: string;
  readonly maturityAmount: string;
  readonly maturityAt: string;
  readonly currentCashBalance: string;
  readonly projectedCashBalance: string;
  readonly maturityStatus: 'LOCKED' | 'MATURED';
  readonly eligibleForRedemption: boolean;
  readonly previewOnly: true;
  readonly payoutGuaranteed: false;
}

export function BondRedemptionPreview({ preview, locale }: { readonly preview: BondRedemptionQuote; readonly locale: string }) {
  const en = locale === 'en';
  return (
    <section aria-labelledby="bond-preview-title" className="mx-auto max-w-2xl space-y-5 rounded-2xl border border-border/60 bg-card p-5 sm:p-8" data-testid="bond-redemption-preview">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{en ? 'Read-only preview' : '읽기 전용 미리보기'}</p>
        <h1 id="bond-preview-title" className="text-2xl font-bold">{en ? 'Virtual bond redemption preview' : '가상 채권 만기 수령 미리보기'}</h1>
        <p className="break-words text-sm text-muted-foreground">{preview.bondName}</p>
      </header>
      <p role="status" className="rounded-lg bg-muted p-3 text-sm font-semibold">
        {preview.eligibleForRedemption && preview.maturityStatus === 'MATURED'
          ? (en ? 'Matured — payout has NOT been processed' : '만기 도래 — 실제 지급은 처리되지 않았습니다')
          : (en ? 'Locked — not yet matured' : '만기 전 — 아직 수령할 수 없습니다')}
      </p>
      <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <div><dt className="text-muted-foreground">{en ? 'Original principal' : '계약 원금'}</dt><dd className="break-all font-semibold">{groupDigits(preview.principalAmount)} WLD</dd></div>
        <div><dt className="text-muted-foreground">{en ? 'Contractual maturity payout' : '계약상 만기 예정액'}</dt><dd className="break-all font-semibold">{groupDigits(preview.maturityAmount)} WLD</dd></div>
        <div><dt className="text-muted-foreground">{en ? 'Current cash' : '현재 보유 현금'}</dt><dd className="break-all font-semibold">{groupDigits(preview.currentCashBalance)} WLD</dd></div>
        <div><dt className="text-muted-foreground">{en ? 'Cash if payout succeeds' : '실제 지급 성공 시 예상 현금'}</dt><dd className="break-all font-semibold">{groupDigits(preview.projectedCashBalance)} WLD</dd></div>
      </dl>
      <p className="rounded-lg border border-amber-500/30 p-3 text-sm text-muted-foreground">
        {en
          ? 'This is an estimate from your verified bank holding, not a payment receipt or payout guarantee. Balances and eligibility are checked again when you request redemption. No WLD is moved here.'
          : '본인 보유 채권을 조회한 예상값이며 지급 영수증이나 지급 보증이 아닙니다. 실제 수령 요청 시 잔액과 만기 조건을 다시 검증합니다. 이 화면에서는 WLD가 이동하지 않습니다.'}
      </p>
      <Link href="/bank" className="inline-flex min-h-11 items-center rounded-lg border border-border px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2">
        {en ? 'Back to virtual bank' : '가상 은행으로 돌아가기'}
      </Link>
    </section>
  );
}
