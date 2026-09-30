'use client';

import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import type { ActionState } from '@/lib/action-state';

interface Props {
  readonly state?: ActionState;
}

export function ActionFeedback({ state }: Props) {
  if (!state || state.status === 'idle' || !state.message) {
    return null;
  }

  if (state.status === 'error') {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive flex items-start gap-2">
        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
        <span className="leading-tight">{state.message}</span>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-600 dark:text-emerald-400 flex items-start gap-2">
      <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
      <span className="leading-tight">{state.message}</span>
    </div>
  );
}
