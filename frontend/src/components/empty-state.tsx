import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';

/**
 * Nothing here, said plainly.
 *
 * Kept as one component so that "no rows yet" always reads the same across
 * eleven screens, and so that it never quietly becomes the answer for "the
 * service is unreachable" — those are different facts and the original was
 * careful to keep them apart.
 */
export function EmptyState({
  title,
  description,
  children,
}: {
  readonly title: string;
  readonly description?: string;
  readonly children?: React.ReactNode;
}) {
  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyTitle>{title}</EmptyTitle>
        {description && <EmptyDescription>{description}</EmptyDescription>}
      </EmptyHeader>
      {children}
    </Empty>
  );
}
