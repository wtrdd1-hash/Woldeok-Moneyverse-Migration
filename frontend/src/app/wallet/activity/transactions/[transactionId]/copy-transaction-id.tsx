'use client';

import { useState } from 'react';
import { useLocale } from '@/components/locale-provider';
import { pick } from '@/lib/copy';
import { COPY } from '../../copy';

export function CopyTransactionId({ transactionId }: { transactionId: string }) {
  const [message, setMessage] = useState('');
  const { locale } = useLocale();
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        className="min-h-11 rounded-md border px-3 py-2 text-sm"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(transactionId);
            setMessage(pick(locale, COPY.copyDone));
          } catch {
            setMessage(pick(locale, COPY.copyFailed));
          }
        }}
      >
        {pick(locale, COPY.copyButton)}
      </button>
      <span role="status" aria-live="polite" className="text-sm text-muted-foreground">
        {message}
      </span>
    </div>
  );
}
