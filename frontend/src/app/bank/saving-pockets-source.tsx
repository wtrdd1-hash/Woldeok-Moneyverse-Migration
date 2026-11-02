import Link from 'next/link';
import { EmptyState } from '@/components/empty-state';
import { Button } from '@/components/ui/button';
import { localeLabel, type Locale } from '@/lib/locale';
import { SavingPocketsCard } from './saving-pockets-card';
import { parseSavingPockets } from './saving-pocket-source';

/** A failed owner read must never enable an empty-list create flow. */
export function SavingPocketsSource({
  raw, cashBalance, bankBalance, locale,
}: {
  readonly raw: unknown;
  readonly cashBalance: string;
  readonly bankBalance: string;
  readonly locale: Locale;
}) {
  const pockets = parseSavingPockets(raw);
  if (pockets === null) {
    return (
      <div role="alert" className="grid min-w-0 gap-3">
        <EmptyState
          title={localeLabel(locale, '저축 포켓을 확인할 수 없습니다.', 'Saving pockets are unavailable.', '貯蓄ポケットを確認できません。', '无法确认储蓄口袋。')}
          description={localeLabel(locale, '저장된 포켓이 0개라는 뜻이 아닙니다. 조회를 다시 시도해 주세요.', 'This does not mean you have zero pockets. Please retry.', 'ポケットが0件という意味ではありません。再度お試しください。', '这不代表您的储蓄口袋为零，请重试。')}
        >
          <Button asChild variant="outline" className="min-h-11">
            <Link href="/bank">{localeLabel(locale, '다시 조회', 'Retry', '再試行', '重试')}</Link>
          </Button>
        </EmptyState>
      </div>
    );
  }
  return <SavingPocketsCard pockets={pockets} cashBalance={cashBalance} bankBalance={bankBalance} />;
}
