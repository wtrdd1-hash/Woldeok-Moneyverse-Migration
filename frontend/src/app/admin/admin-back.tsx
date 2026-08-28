import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

/** Every area page opens with the way back to the console. */
export function AdminBack() {
  return (
    <Button asChild variant="ghost" className="-ml-3 w-fit text-muted-foreground">
      <Link href="/admin">
        <ArrowLeft />
        운영 콘솔
      </Link>
    </Button>
  );
}
