/** The web UI offers stable presets; the API accepts any valid integer 1–86400. */
const PRESETS = new Set(['60', '120', '180', '300', '600', '900']);

export function normalizedWorkDuration(raw: unknown): string | null {
  return typeof raw === 'string' && PRESETS.has(raw) ? raw : null;
}

export function workTasksApiPath(selected: string | null): string {
  const valid = normalizedWorkDuration(selected);
  return valid === null ? '/api/v1/work/tasks' : `/api/v1/work/tasks?maxDurationSeconds=${valid}`;
}
