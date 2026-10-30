'use client';

import { useState } from 'react';

export function CopyTransactionId({ transactionId }: { transactionId: string }) {
  const [message, setMessage] = useState('');
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        className="min-h-11 rounded-md border px-3 py-2 text-sm"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(transactionId);
            setMessage('거래 ID를 복사했습니다.');
          } catch {
            setMessage('복사할 수 없습니다. 거래 ID를 직접 선택하세요.');
          }
        }}
      >
        거래 ID 복사
      </button>
      <span role="status" aria-live="polite" className="text-sm text-muted-foreground">
        {message}
      </span>
    </div>
  );
}
