import { Skeleton } from '@/components/ui/skeleton';

/**
 * What a member page looks like while its data is on the way.
 *
 * Every member page is `force-dynamic`, so navigating to one waits on the
 * server's fetches before anything renders. Without a `loading.tsx` the App
 * Router holds the previous screen for that whole time and the click reads as
 * the page having ignored it — worse the slower the page.
 *
 * The shape matters more than the shimmer: a header block and cards in the
 * proportions the real page uses, so what arrives replaces this rather than
 * displacing it.
 */
export function PageSkeleton({
  cards = 3,
  columns = 1,
}: {
  readonly cards?: number;
  readonly columns?: 1 | 2;
}) {
  return (
    <div className="grid gap-6" aria-busy aria-live="polite">
      <span className="sr-only">불러오는 중</span>
      <div className="grid gap-3">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-full max-w-[520px]" />
      </div>
      <div className={columns === 2 ? 'grid gap-4 sm:grid-cols-2' : 'grid gap-4'}>
        {Array.from({ length: cards }, (_, index) => (
          <Skeleton key={index} className="h-40 w-full rounded-[14px]" />
        ))}
      </div>
    </div>
  );
}
