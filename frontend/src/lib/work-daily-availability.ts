/** Verify owner-scoped daily quota evidence before showing an "available" filter. */
export function isVerifiedAvailableWorkBoard(payload: unknown): boolean {
  if (typeof payload !== 'object' || payload === null) return false;
  if (
    !('featureState' in payload) ||
    !['enabled', 'paused', 'safe_mode', 'disabled'].includes(String(payload.featureState))
  )
    return false;
  if (!('tasks' in payload) || !Array.isArray(payload.tasks) || payload.tasks.length > 200)
    return false;
  return payload.tasks.every((task: unknown) => {
    if (
      typeof task !== 'object' ||
      task === null ||
      !('task_id' in task) ||
      !('daily_limit' in task) ||
      !('taken_today' in task)
    )
      return false;
    if (
      typeof task.task_id !== 'string' ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        task.task_id,
      )
    )
      return false;
    const limit = task.daily_limit;
    const taken = task.taken_today;
    return (
      Number.isSafeInteger(limit) &&
      Number.isSafeInteger(taken) &&
      (limit as number) >= 0 &&
      (taken as number) >= 0 &&
      ((limit as number) === 0 || (taken as number) < (limit as number))
    );
  });
}
