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
