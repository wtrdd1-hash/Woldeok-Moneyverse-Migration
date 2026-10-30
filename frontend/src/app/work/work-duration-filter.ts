/** The web UI offers stable presets; the API accepts any valid integer 1–86400. */
const PRESETS = new Set(['60', '120', '180', '300', '600', '900']);

export function normalizedWorkDuration(raw: unknown): string | null {
  return typeof raw === 'string' && PRESETS.has(raw) ? raw : null;
}

const REWARD_PRESETS = new Set(['100', '200', '500', '1000', '2000', '5000', '10000']);

export function normalizedWorkRewardCeiling(raw: unknown): string | null {
  return typeof raw === 'string' && REWARD_PRESETS.has(raw) ? raw : null;
}

export function workTasksApiPath(selected: string | null, maxReward: string | null = null): string {
  const duration = normalizedWorkDuration(selected);
  const ceiling = normalizedWorkRewardCeiling(maxReward);
  const params = new URLSearchParams();
  if (duration !== null) params.set('maxDurationSeconds', duration);
  if (ceiling !== null) params.set('maxReward', ceiling);
  const query = params.toString();
  return query ? `/api/v1/work/tasks?${query}` : '/api/v1/work/tasks';
}
