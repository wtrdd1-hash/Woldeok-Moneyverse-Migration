import Link from 'next/link';
import { groupDigits } from '@/lib/money';

export interface BondMaturityOverview {
  readonly asOf: string;
  readonly holdingCount: number;
  readonly dueWithinSevenDays: number;
  readonly maturedUnredeemed: number;
  readonly totalPrincipalWld: string;
  readonly totalMaturityWld: string;
  readonly bonds: readonly {
    readonly id: string;
    readonly bondCode: string;
    readonly bondName: string;
    readonly principalWld: string;
    readonly maturityWld: string;
    readonly maturityAt: string;
    readonly maturityState: 'MATURED_UNREDEEMED' | 'DUE_WITHIN_SEVEN_DAYS' | 'LATER';
    readonly redemptionVerified: false;
  }[];
}

export function BondMaturityView({data, isEn}: {data: BondMaturityOverview | null; isEn: boolean}) {
  if (!data) {
    return (
      <section aria-live="polite" className="rounded-2xl border p-6 space-y-3">
        <h1 className="text-xl font-bold">{isEn ? 'Bond maturity data unavailable' : '채권 만기 정보를 불러올 수 없습니다'}</h1>
        <p>{isEn ? 'No verified portfolio was returned. Try again later.' : '확인된 보유 내역이 없습니다. 잠시 후 다시 시도해 주세요.'}</p>
        <Link href="/bank" className="underline">{isEn ? 'Back to bank' : '은행으로 돌아가기'}</Link>
      </section>
    );
  }
  return (
    <section aria-label={isEn ? 'Verified bond maturity overview' : '확인된 채권 만기 현황'} className="space-y-5">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">{isEn ? 'My virtual bond maturities' : '내 가상 채권 만기 현황'}</h1>
        <p className="text-sm text-muted-foreground">{isEn ? 'Game-only virtual bonds. Amounts are contractual estimates, not confirmed payouts.' : '게임 내 가상 채권입니다. 만기 금액은 계약상 예정 금액이며 실제 지급 완료를 의미하지 않습니다.'}</p>
      </header>
      <dl className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border p-4"><dt>{isEn ? 'Held principal' : '보유 원금'}</dt><dd className="break-all font-semibold">{groupDigits(data.totalPrincipalWld)} WLD</dd></div>
        <div className="rounded-xl border p-4"><dt>{isEn ? 'Scheduled maturity value' : '계약상 만기 예정액'}</dt><dd className="break-all font-semibold">{groupDigits(data.totalMaturityWld)} WLD</dd></div>
        <div className="rounded-xl border p-4"><dt>{isEn ? 'Due within 7 days' : '7일 이내 만기 예정'}</dt><dd>{data.dueWithinSevenDays}</dd></div>
        <div className="rounded-xl border p-4"><dt>{isEn ? 'Matured, redemption unverified' : '만기 경과·상환 미확인'}</dt><dd>{data.maturedUnredeemed}</dd></div>
      </dl>
      {data.holdingCount === 0 ? (
        <p role="status">{isEn ? 'No bond holdings' : '현재 보유 중인 채권이 없습니다.'}</p>
      ) : (
        <ol className="space-y-3" aria-label={isEn ? 'Holdings ordered by maturity' : '만기순 보유 채권'}>
          {data.bonds.map((bond) => (
            <li key={bond.id} className="rounded-xl border p-4 space-y-2">
              <h2 className="font-semibold">{bond.bondName}</h2>
              <p className="text-sm">{isEn ? 'Maturity (UTC)' : '만기 시각 (UTC)'}: <time dateTime={bond.maturityAt}>{bond.maturityAt}</time></p>
              <p className="break-all text-sm">{isEn ? 'Principal' : '원금'}: {groupDigits(bond.principalWld)} WLD</p>
              <p className="break-all text-sm">{isEn ? 'Scheduled amount' : '예정 만기액'}: {groupDigits(bond.maturityWld)} WLD</p>
              <p className="text-sm font-medium" role="status">{
                bond.maturityState === 'MATURED_UNREDEEMED'
                  ? (isEn ? 'Matured — redemption unverified' : '만기 경과 — 상환 미확인')
                  : bond.maturityState === 'DUE_WITHIN_SEVEN_DAYS'
                    ? (isEn ? 'Due within 7 days' : '7일 이내 만기 예정')
                    : (isEn ? 'Maturity later than 7 days' : '만기까지 7일 초과')
              }</p>
            </li>
          ))}
        </ol>
      )}
      <p className="text-xs text-muted-foreground">{isEn ? 'Verified snapshot (UTC)' : '확인 기준 시각 (UTC)'}: <time dateTime={data.asOf}>{data.asOf}</time></p>
      <Link href="/bank" className="inline-block underline">{isEn ? 'Back to bank' : '은행으로 돌아가기'}</Link>
    </section>
  );
}
