interface Props {
  readonly isEn: boolean;
  readonly selected: string | null;
  readonly maxDurationSeconds: string | null;
  readonly maxReward: string | null;
  readonly availableOnly: boolean;
}

/** Separate GET form preserves task-board filters without leaking a private query to public pages. */
export function WorkReceiptCeilingForm({ isEn, selected, maxDurationSeconds, maxReward, availableOnly }: Props) {
  return (
    <form action="/work" method="get" className="flex flex-wrap items-end gap-2">
      {maxDurationSeconds && <input type="hidden" name="maxDurationSeconds" value={maxDurationSeconds} />}
      {maxReward && <input type="hidden" name="maxReward" value={maxReward} />}
      {availableOnly && <input type="hidden" name="availableOnly" value="1" />}
      <label htmlFor="maxReceiptReward" className="grid gap-1 text-sm">
        {isEn ? 'Maximum receipt reward (WLD)' : '영수증 최대 보상 (WLD)'}
        <input id="maxReceiptReward" name="maxReceiptReward" type="text" inputMode="numeric"
          pattern="(?:0|[1-9][0-9]{0,17})" maxLength={18}
          defaultValue={selected ?? ''} placeholder={isEn ? 'e.g. 1000' : '예: 1000'}
          className="min-h-11 rounded-md border border-input bg-background px-3" />
      </label>
      <button type="submit" className="min-h-11 rounded-md border border-input px-4 text-sm">
        {isEn ? 'Filter receipts' : '영수증 검색'}
      </button>
      <a href="/work" className="inline-flex min-h-11 items-center px-3 text-sm">
        {isEn ? 'Reset' : '초기화'}
      </a>
    </form>
  );
}
