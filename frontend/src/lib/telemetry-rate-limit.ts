/** Per-client bound for the public client-error log (route files may only export handlers). */
const WINDOW_MS = 60_000;
const PER_WINDOW = 20;
const seen = new Map<string, { start: number; n: number }>();
export function allowTelemetry(key: string, now = Date.now()): boolean {
  const slot = seen.get(key);
  if (!slot || now - slot.start >= WINDOW_MS) {
    if (seen.size > 5000) seen.clear();
    seen.set(key, { start: now, n: 1 });
    return true;
  }
  slot.n += 1;
  return slot.n <= PER_WINDOW;
}

