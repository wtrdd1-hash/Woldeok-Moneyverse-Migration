/** Render only currently offered tasks; a stale saved ID must not become a reward promise. */
export function favoriteWorkTasks<T extends { readonly task_id: string }>(
  tasks: readonly T[],
  favoriteTaskIds: readonly string[] | null,
): T[] {
  if (!favoriteTaskIds) return [];
  const saved = new Set(favoriteTaskIds);
  return tasks.filter((task) => saved.has(task.task_id));
}
