/** The web UI offers stable presets; the API accepts any valid integer 1–86400. */
const PRESETS = new Set(['60', '120', '180', '300', '600', '900']);

export function normalizedWorkDuration(raw: unknown): string | null {
  return typeof raw === 'string' && PRESETS.has(raw) ? raw : null;
}

export function normalizedWorkAvailableOnly(raw: unknown): boolean {
  return raw === '1';
}

export function workTasksApiPath(selected: string | null, availableOnly = false): string {
  const valid = normalizedWorkDuration(selected);
  const query = new URLSearchParams();
  if (valid !== null) query.set('maxDurationSeconds', valid);
  if (availableOnly) query.set('availableOnly', '1');
  const params = query.toString();
  return params ? `/api/v1/work/tasks?${params}` : '/api/v1/work/tasks';
}
