import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

/** Every area page opens with the way back to its nearest useful parent. */
export function AdminBack({
  href = '/admin',
  label = '운영 콘솔',
}: {
  readonly href?: string;
  readonly label?: string;
}) {
  return (
    <Button asChild variant="ghost" className="-ml-3 w-fit text-muted-foreground">
      <Link href={href}>
        <ArrowLeft />
        {label}
      </Link>
    </Button>
  );
}
