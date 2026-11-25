/**
 * Spring answers `{ success: true, data: T }` (ApiResponse) on most domains,
 * while a few BFF callers expect T. Returns the payload either way, and null
 * for a failure envelope or nothing.
 */
export function springData<T>(raw: unknown): T | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === 'object' && 'success' in raw && 'data' in raw) {
    const env = raw as { success?: unknown; data?: unknown };
    return env.success === true && env.data !== null && env.data !== undefined ? (env.data as T) : null;
  }
  return raw as T;
}
