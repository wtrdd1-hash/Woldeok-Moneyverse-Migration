import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';

/**
 * Nothing here, said plainly.
 *
 * Kept as one component so that "no rows yet" always reads the same across
 * eleven screens, and so that it never quietly becomes the answer for "the
 * service is unreachable" — those are different facts and the original was
 * careful to keep them apart.
 *
 * The registry's Empty is sized for a page that is nothing but a zero state:
 * 48px of padding from `md` up and 24px between its parts. Here it is a note
 * inside a page that has other content, and a note that takes 96px of padding
 * to say there are no rows is louder than the rows would have been.
 */
export function EmptyState({
  title,
  description,
  children,
}: {
  readonly title: React.ReactNode;
  readonly description?: React.ReactNode;
  readonly children?: React.ReactNode;
}) {
  return (
    <Empty className="gap-3 border border-dashed md:p-8">
      <EmptyHeader>
        <EmptyTitle>{title}</EmptyTitle>
        {description && <EmptyDescription>{description}</EmptyDescription>}
      </EmptyHeader>
      {children}
    </Empty>
  );
}
