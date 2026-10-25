'use client';

import { Star } from 'lucide-react';
import { useActionState } from 'react';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { useLocale } from '@/components/locale-provider';
import { IDLE } from '@/lib/action-state';
import { setWatchlist } from './actions';

export function WatchlistToggle({ stockId, watching }: { readonly stockId: string; readonly watching: boolean }) {
  const { locale } = useLocale();
  const isEn = locale === 'en';
  const [state, action] = useActionState(setWatchlist, IDLE);

  return (
    <form action={action} className="flex max-w-full flex-col items-start gap-2">
      <input type="hidden" name="stockId" value={stockId} />
      <input type="hidden" name="watching" value={watching ? 'false' : 'true'} />
      <SubmitButton
        variant={watching ? 'secondary' : 'outline'}
        size="sm"
        className="min-h-11"
      >
        <Star aria-hidden="true" className={watching ? 'fill-current' : undefined} />
        {watching ? (isEn ? 'Watching' : '관심종목') : (isEn ? 'Watch' : '관심 추가')}
      </SubmitButton>
      <ActionAlert state={state} />
    </form>
  );
}
