import { PostingStrip } from '@/components/posting-strip';
import { formatMoment } from '@/lib/money';
import { postingAmount, sides, type TransactionView } from './sides';

/** Same verified owner movement in the compact wallet and full activity list. */
export function WalletPosting({ entry }: { readonly entry: TransactionView }) {
  const { debit, credit } = sides(entry);
  return (
    <PostingStrip
      debit={debit}
      credit={credit}
      amount={postingAmount(entry)}
      label={entry.label}
      at={formatMoment(entry.occurredAt)}
    />
  );
}
