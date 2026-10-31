/** Reject stale/forged filtered task boards without converting large EXP strings to Number. */
export function isVerifiedWorkExperienceFloor(payload: unknown, floor: string): boolean {
  if (!/^(?:0|[1-9][0-9]{0,17})$/.test(floor)) return false;
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  const board = payload as Record<string, unknown>;
  if (!['enabled', 'paused', 'safe_mode', 'disabled'].includes(String(board.featureState))) return false;
  if (!Array.isArray(board.tasks) || board.tasks.length > 200) return false;
  return board.tasks.every((row: unknown) => {
    if (!row || typeof row !== 'object' || Array.isArray(row)) return false;
    const task = row as Record<string, unknown>;
    return typeof task.task_id === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(task.task_id) &&
      typeof task.experience_preview === 'string' &&
      /^(?:0|[1-9][0-9]{0,18})$/.test(task.experience_preview) &&
      BigInt(task.experience_preview) >= BigInt(floor);
  });
}
