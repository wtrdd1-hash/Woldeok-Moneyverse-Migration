/** Export is explicitly limited to the owner's recent 20 receipts, not a ledger certificate. */
export function WorkReceiptsExportLink({ isEn }: { readonly isEn: boolean }) {
  return (
    <div className="grid justify-items-start gap-2">
      <p className="text-xs text-muted-foreground">
        {isEn
          ? 'Export covers only your 20 most recent reward receipts, not lifetime earnings or settlement proof.'
          : 'CSV는 본인의 최근 보상 영수증 최대 20건만 포함하며 전체 누적 수익이나 정산 증빙이 아닙니다.'}
      </p>
      <a
        href="/work/receipts/export.csv"
        download
        className="inline-flex min-h-11 w-fit items-center rounded-md border border-input bg-background px-4 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {isEn ? 'Download recent receipts CSV' : '최근 보상 영수증 CSV 다운로드'}
      </a>
    </div>
  );
}
