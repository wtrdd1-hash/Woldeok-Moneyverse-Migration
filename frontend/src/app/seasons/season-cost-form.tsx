import Link from 'next/link';

const CAPS = [
  { value: '', label: '모든 참가비' },
  { value: '0', label: '무료 이벤트만' },
  { value: '100', label: '100 WLD 이하' },
  { value: '1000', label: '1,000 WLD 이하' },
  { value: '10000', label: '10,000 WLD 이하' },
  { value: '100000', label: '100,000 WLD 이하' },
] as const;

export function SeasonCostForm({ maxCost }: { readonly maxCost?: string }) {
  return (
    <form method="get" action="/seasons" className="flex flex-wrap items-end gap-3 rounded-xl border border-border p-4">
      <div className="grid min-w-44 gap-2">
        <label htmlFor="season-max-cost" className="text-sm font-semibold">이벤트 1회 참가비 상한</label>
        <select id="season-max-cost" name="maxCost" defaultValue={maxCost ?? ''}
          className="min-h-11 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2">
          {CAPS.map((cap) => <option key={cap.value} value={cap.value}>{cap.label}</option>)}
          {maxCost && !CAPS.some((cap) => cap.value === maxCost) &&
            <option value={maxCost}>{maxCost} WLD 이하</option>}
        </select>
      </div>
      <button type="submit" className="min-h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2">검색</button>
      <Link href="/seasons" className="inline-flex min-h-11 items-center rounded-lg border border-border px-4 text-sm font-semibold">초기화</Link>
    </form>
  );
}
