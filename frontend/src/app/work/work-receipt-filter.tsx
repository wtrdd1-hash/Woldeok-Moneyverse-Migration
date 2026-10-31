/** Server-rendered accessible read-only filter; it never submits a payout command. */
export function WorkReceiptRewardFilter({
  selected,
  invalid,
  unavailable,
  verifiedEmpty,
  isEn,
}: {
  readonly selected?: string | undefined;
  readonly invalid: boolean;
  readonly unavailable: boolean;
  readonly verifiedEmpty: boolean;
  readonly isEn: boolean;
}) {
  return (
    <section
      aria-labelledby="work-receipt-filter-heading"
      className="grid min-w-0 gap-2 rounded-xl border p-3 sm:p-4"
    >
      <h2 id="work-receipt-filter-heading" className="text-base font-semibold">
        {isEn ? 'Find recent reward receipts' : '최근 업무 보상 영수증 찾기'}
      </h2>
      <form action="/work" method="get" className="flex min-w-0 flex-wrap items-end gap-2">
        <label htmlFor="work-receipt-floor" className="grid min-w-0 gap-1 text-sm">
          {isEn ? 'Minimum received WLD' : '최소 수령 WLD'}
          <input
            id="work-receipt-floor"
            name="receiptMinReward"
            type="text"
            inputMode="numeric"
            pattern="(?:0|[1-9][0-9]{0,17})"
            maxLength={18}
            defaultValue={selected ?? ''}
            className="min-h-11 w-44 max-w-full rounded-lg border bg-background px-3"
          />
        </label>
        <button type="submit" className="min-h-11 rounded-lg border px-4 text-sm font-medium">
          {isEn ? 'Filter' : '조회'}
        </button>
        <a
          href="/work"
          className="inline-flex min-h-11 items-center rounded-lg border px-4 text-sm"
        >
          {isEn ? 'Clear' : '초기화'}
        </a>
      </form>
      <p className="text-xs text-muted-foreground">
        {isEn
          ? 'Only your latest 20 reward receipts are searched; this is not a lifetime total.'
          : '본인의 최근 보상 영수증 20건에서만 검색합니다. 전체 기간의 보상 합계가 아닙니다.'}
      </p>
      {invalid && (
        <p role="alert" className="text-sm text-destructive">
          {isEn
            ? 'Enter a canonical non-negative WLD integer (up to 18 digits).'
            : '0 이상의 WLD 정수를 최대 18자리로 입력하세요.'}
        </p>
      )}
      {!invalid && unavailable && (
        <p role="alert" className="text-sm text-destructive">
          {isEn
            ? 'Reward evidence is unavailable. Try again.'
            : '보상 영수증을 확인할 수 없습니다. 다시 시도해 주세요.'}
        </p>
      )}
      {!invalid && !unavailable && verifiedEmpty && (
        <p role="status" className="text-sm">
          {isEn
            ? 'No matching receipts among your latest 20.'
            : '최근 20건 중 조건에 맞는 영수증이 없습니다.'}
        </p>
      )}
    </section>
  );
}
