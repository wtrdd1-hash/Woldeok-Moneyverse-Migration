import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

/** Authenticated page renders this only after a successful owner-ledger read. */
export function StatementDownloadLink() {
  return (
    <Button asChild variant="outline" size="sm" className="w-fit">
      <a href="/app-api/v1/wallet/statement.csv" download="moneyverse-wallet-recent-50.csv">
        <Download aria-hidden="true" className="size-4" />
        최근 최대 50건 CSV 다운로드
      </a>
    </Button>
  );
}
