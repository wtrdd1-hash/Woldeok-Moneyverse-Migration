/** Validate owner weekly-goal completion before exposing an Android HTTP 200. */
export function isVerifiedCompletedGoalsBoard(payload: unknown): boolean {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  const board = payload as Record<string, unknown>;
  if (!Array.isArray(board.goals) || board.goals.length > 32 ||
      !Array.isArray(board.collections) || board.collections.length > 64) return false;
  const codes = new Set<string>();
  const nonnegative = /^(0|[1-9][0-9]{0,39})$/;
  const positive = /^[1-9][0-9]{0,39}$/;
  for (const entry of board.goals) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return false;
    const goal = entry as Record<string, unknown>;
    if (typeof goal.goal_code !== 'string' || !/^[a-z0-9_]{3,64}$/.test(goal.goal_code) ||
        codes.has(goal.goal_code) || goal.goal_completed !== true ||
        typeof goal.goal_self_reported !== 'boolean' ||
        typeof goal.goal_target !== 'string' || !positive.test(goal.goal_target) ||
        typeof goal.goal_progress !== 'string' || !nonnegative.test(goal.goal_progress) ||
        typeof goal.week_start !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(goal.week_start) ||
        BigInt(goal.goal_progress) < BigInt(goal.goal_target)) return false;
    for (const field of ['goal_label', 'goal_detail', 'goal_metric', 'goal_window', 'goal_unit']) {
      if (typeof goal[field] !== 'string' || (goal[field] as string).length > 500) return false;
    }
    codes.add(goal.goal_code);
  }
  return true;
}
