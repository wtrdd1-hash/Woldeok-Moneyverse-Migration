import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TranslatedText } from '@/components/translated-text';
import { ADMIN_CHROME_COPY } from './admin-copy';

const BACK = ADMIN_CHROME_COPY.back;

/**
 * Every area page opens with the way back to its nearest useful parent. The default label is
 * localised on the client (this component stays a server component for its callers); a label a
 * caller passes is rendered as given.
 */
export function AdminBack({
  href = '/admin',
  label,
}: {
  readonly href?: string;
  readonly label?: string;
}) {
  return (
    <Button asChild variant="ghost" className="-ml-3 w-fit text-muted-foreground">
      <Link href={href}>
        <ArrowLeft />
        {label ?? (
          <TranslatedText korean={BACK.ko} english={BACK.en} japanese={BACK.ja} chinese={BACK.zh} vietnamese={BACK.vi} />
        )}
      </Link>
    </Button>
  );
}
