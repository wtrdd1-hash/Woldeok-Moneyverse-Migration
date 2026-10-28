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

/** Strict URL query parser; never reflect malformed filters into the private API. */
export function selectedWorkDifficulty(raw: unknown): string | null {
  return typeof raw === 'string' && /^[1-5]$/.test(raw) ? raw : null;
}
