/** A deep link is only actionable after the owner-scoped thread list confirms it. */
export function selectSupportThread(
  threads: readonly { thread_id: string }[],
  requested: unknown,
): { selected: string | undefined; unavailable: boolean } {
  if (requested === undefined) return { selected: threads[0]?.thread_id, unavailable: false };
  const owned = typeof requested === 'string' && threads.some((thread) => thread.thread_id === requested);
  return {
    selected: owned ? requested : threads[0]?.thread_id,
    unavailable: !owned,
  };
}
