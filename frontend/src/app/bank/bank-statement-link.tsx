import type { Locale } from '@/lib/locale';
import { localeLabel } from '@/lib/locale';

/** A native download must bypass Next's client-side RSC link navigation. */
export function BankStatementDownloadLink({ locale }: { locale: Locale }) {
  return (
    <a
      href="/bank/statement.csv"
      download="moneyverse-bank-statement.csv"
      className="text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:underline"
    >
      {localeLabel(locale, '내 은행 잔액 CSV 저장', 'Download my bank snapshot (CSV)', '銀行残高のCSVを保存', '下载我的银行余额CSV')}
    </a>
  );
}
