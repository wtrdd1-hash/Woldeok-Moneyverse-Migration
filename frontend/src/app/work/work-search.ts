import type { WorkTask } from './work';

export function filterWorkTasks(
  tasks: readonly WorkTask[],
  rawQuery: string,
): readonly WorkTask[] {
  const query = rawQuery.trim().toLocaleLowerCase();
  if (!query) return tasks;

  return tasks.filter((task) =>
    [task.name, task.description, task.code, task.job_type].some((value) =>
      value.toLocaleLowerCase().includes(query),
    ),
  );
}

/** Filter only server-provided payout previews, never base rewards or rounded JS numbers. */
export function filterWorkTasksByMinReward(
  tasks: readonly WorkTask[],
  minReward: string,
): readonly WorkTask[] {
  if (!minReward) return tasks;
  if (!/^(?:0|[1-9][0-9]{0,17})$/.test(minReward)) return [];
  const minimum = BigInt(minReward);
  return tasks.filter((task) =>
    task.reward_preview !== null &&
    /^(?:0|[1-9][0-9]*)$/.test(task.reward_preview) &&
    BigInt(task.reward_preview) >= minimum,
  );
}

/** The server computes each member's three daily picks; never guess them from reward values. */
export function filterRecommendedWorkTasks(
  tasks: readonly WorkTask[],
  recommendedOnly: boolean,
): readonly WorkTask[] {
  return recommendedOnly ? tasks.filter((task) => task.recommended) : tasks;
}
