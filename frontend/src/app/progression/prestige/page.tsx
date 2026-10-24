import type { Metadata } from 'next';
import Link from 'next/link';
import { apiOrNull } from '@/lib/api';
import { groupDigits } from '@/lib/money';
import { requireMember } from '@/lib/session';
import type { Overview } from '@/app/wallet/sides';
import { isCanonicalWld } from '@/app/wallet/sides';
import type { ProgressionStatus } from '../stages';
import { stageLabel } from '../stages';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '프레스티지 안내와 실제 성장 상태',
  robots: { index: false, follow: false },
};

function verifiedBalances(wallet: Overview | null): { cash: string; bank: string } | null {
  const balances = wallet?.balances;
  if (
    !balances ||
    balances.currency !== 'WLD' ||
    !isCanonicalWld(balances.cash?.availableAmount) ||
    !isCanonicalWld(balances.bank?.availableAmount) ||
    !isCanonicalWld(balances.totalAvailableAmount)
  ) {
    return null;
  }

  const cash = BigInt(balances.cash.availableAmount);
  const bank = BigInt(balances.bank.availableAmount);
  if (cash < 0n || bank < 0n || cash + bank !== BigInt(balances.totalAvailableAmount)) {
    return null;
  }

  return { cash: balances.cash.availableAmount, bank: balances.bank.availableAmount };
}

export default async function PrestigePage() {
  await requireMember();

  const [progression, wallet] = await Promise.all([
    apiOrNull<{ progression: ProgressionStatus | null }>('/api/v1/progression'),
    apiOrNull<Overview>('/api/v1/wallet?recent=1'),
  ]);

  const status = progression?.progression ?? null;
  const balances = verifiedBalances(wallet);

  return (
    <main data-page="prestige" className="mx-auto grid w-full max-w-4xl gap-6 px-4 py-8 pb-16 sm:px-6">
      <header className="grid gap-3 border-b border-border pb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          MEMBER PROGRESSION
        </p>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          프레스티지 안내와 실제 성장 상태
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          환생 및 자산 소각 기능은 현재 제공되지 않습니다. 이 화면에서 WLD가 소각되거나
          영구 생산력 배수와 고대 유물이 지급되지 않습니다.
        </p>
      </header>

      <section aria-labelledby="verified-progress-heading" className="grid gap-4">
        <h2 id="verified-progress-heading" className="text-lg font-semibold">
          서버에서 확인한 내 성장 단계
        </h2>
        {progression === null ? (
          <p role="status" className="rounded-lg border border-amber-500/40 p-4 text-sm">
            성장 단계 정보를 불러오지 못했습니다. 잠시 후 성장 단계 화면에서 다시 확인해 주세요.
          </p>
        ) : status === null ? (
          <p role="status" className="rounded-lg border p-4 text-sm">
            아직 성장 단계가 계산되지 않았습니다. 성장 단계 화면에서 계산할 수 있습니다.
          </p>
        ) : (
          <div className="rounded-lg border bg-card p-5">
            <p className="text-xs text-muted-foreground">현재 성장 단계</p>
            <p className="mt-2 text-2xl font-bold">{stageLabel(status.stage_code)}</p>
          </div>
        )}
      </section>

      <section aria-labelledby="verified-wallet-heading" className="grid gap-4">
        <h2 id="verified-wallet-heading" className="text-lg font-semibold">
          서버에서 확인한 WLD 잔액
        </h2>
        {balances === null ? (
          <p role="status" className="rounded-lg border border-amber-500/40 p-4 text-sm">
            지갑 잔액을 확인할 수 없습니다. 확인되지 않은 자산 금액은 표시하지 않습니다.
          </p>
        ) : (
          <dl className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border bg-card p-5">
              <dt className="text-sm text-muted-foreground">활동 지갑</dt>
              <dd className="mt-2 break-words font-mono text-xl font-semibold">
                {groupDigits(balances.cash)} WLD
              </dd>
            </div>
            <div className="rounded-lg border bg-card p-5">
              <dt className="text-sm text-muted-foreground">은행 보관함</dt>
              <dd className="mt-2 break-words font-mono text-xl font-semibold">
                {groupDigits(balances.bank)} WLD
              </dd>
            </div>
          </dl>
        )}
      </section>

      <nav aria-label="검증된 성장 및 지갑 기능" className="grid gap-3 border-t border-border pt-6 sm:grid-cols-2">
        <Link
          href="/progression"
          className="flex min-h-11 items-center justify-center rounded-lg border border-primary bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          실제 성장 단계 확인
        </Link>
        <Link
          href="/wallet"
          className="flex min-h-11 items-center justify-center rounded-lg border px-4 py-3 text-center text-sm font-semibold hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          내 지갑 및 거래 내역 확인
        </Link>
      </nav>
    </main>
  );
}
