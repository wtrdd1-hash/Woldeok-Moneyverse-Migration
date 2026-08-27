import type { Metadata } from 'next';
import { PostingStrip } from '@/components/posting-strip';
import { Plate, PlateTitle, Unavailable } from '@/components/ui/plate';
import { api } from '@/lib/api';
import { requireViewer } from '@/lib/session';

/** Per-member data. Never cached, and never offered to a crawler. */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '내 지갑',
  robots: { index: false, follow: false },
};

interface BalanceView {
  readonly availableAmount: string;
  readonly updatedAt: string;
}

interface TransactionView {
  readonly transactionId: string;
  readonly type: string;
  readonly label: string;
  readonly netAmount: string;
  readonly direction: 'in' | 'out' | 'neutral';
  readonly occurredAt: string;
}

interface Overview {
  readonly balances: {
    readonly currency: string;
    readonly cash: BalanceView;
    readonly bank: BalanceView;
    readonly totalAvailableAmount: string;
  };
  readonly recentTransactions: readonly TransactionView[];
}

function formatMoment(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.valueOf())
    ? ''
    : new Intl.DateTimeFormat('ko-KR', { dateStyle: 'short', timeStyle: 'short' }).format(date);
}

function group(amount: string): string {
  const negative = amount.startsWith('-');
  const digits = negative ? amount.slice(1) : amount;
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return negative ? `−${grouped}` : grouped;
}

/**
 * The API reports a direction and a net amount rather than the two accounts a
 * posting names, because the underlying ledger transaction has more than two
 * legs and only the member's own side is theirs to see.
 *
 * The strip still shows both ends — one of them is the member's wallet and
 * the other is where the money came from or went — so the entry reads as the
 * balanced movement it is rather than as a signed number.
 */
function sides(entry: TransactionView): { debit: string; credit: string } {
  if (entry.direction === 'in') return { debit: entry.label, credit: '내 지갑' };
  if (entry.direction === 'out') return { debit: '내 지갑', credit: entry.label };
  return { debit: entry.label, credit: '내 지갑' };
}

export default async function WalletPage() {
  await requireViewer();
  const wallet = await api<Overview>('/api/v1/wallet');
  const { balances, recentTransactions } = wallet;

  return (
    <div className="grid gap-4">
      <h1 className="pt-4 text-2xl font-bold">내 지갑</h1>

      <Plate>
        <PlateTitle hint={balances.currency}>잔액</PlateTitle>
        <div className="grid gap-3 sm:grid-cols-3">
          <Balance term="현금" amount={balances.cash.availableAmount} />
          <Balance term="은행" amount={balances.bank.availableAmount} />
          <Balance term="합계" amount={balances.totalAvailableAmount} emphasis />
        </div>
      </Plate>

      <section aria-labelledby="ledger-title" className="grid gap-2">
        <h2 id="ledger-title" className="text-lg font-medium">
          최근 기록
        </h2>
        {/* The transaction list is the ledger, so it renders as postings rather
            than as rows with badges: each entry shows what the money left,
            what it reached, and the amount that balanced them. */}
        <Plate>
          {recentTransactions.length === 0 ? (
            <Unavailable>아직 기록이 없어요.</Unavailable>
          ) : (
            recentTransactions.map((entry) => {
              const { debit, credit } = sides(entry);
              return (
                <PostingStrip
                  key={entry.transactionId}
                  debit={debit}
                  credit={credit}
                  amount={entry.netAmount}
                  at={formatMoment(entry.occurredAt)}
                />
              );
            })
          )}
        </Plate>
      </section>
    </div>
  );
}

function Balance({
  term,
  amount,
  emphasis = false,
}: {
  readonly term: string;
  readonly amount: string;
  readonly emphasis?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-[var(--muted)]">{term}</p>
      <p
        className={`tabular text-2xl font-medium${emphasis ? ' text-[var(--primary)]' : ''}`}
      >
        {group(amount)}
      </p>
    </div>
  );
}
