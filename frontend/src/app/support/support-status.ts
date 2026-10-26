export type SupportStatus = 'all' | 'open' | 'waiting_user' | 'resolved';

export function parseSupportStatus(value: string | undefined): SupportStatus {
  if (value === 'open' || value === 'waiting_user' || value === 'resolved') return value;
  return 'all';
}

/** This filters a bounded, owner-scoped database window, never the entire archive. */
export function filterSupportThreads<T extends { readonly status: string }>(
  threads: readonly T[],
  status: SupportStatus,
): T[] {
  return status === 'all' ? [...threads] : threads.filter((thread) => thread.status === status);
}

export function supportStatusHref(status: SupportStatus, thread?: string): string {
  const params = new URLSearchParams();
  if (status !== 'all') params.set('status', status);
  if (thread) params.set('thread', thread);
  const query = params.toString();
  return query ? '/support?' + query : '/support';
}
