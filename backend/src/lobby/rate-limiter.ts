interface Window {
  startedAt: number;
  count: number;
}

export interface FixedWindowLimiterOptions {
  readonly now?: () => number;
  readonly windowMs?: number;
  readonly maxEntries?: number;
}

export interface FixedWindowLimiter {
  allow(key: string, limit: number): boolean;
}

/**
 * A process-local fixed-window counter, carried over from the original.
 *
 * The HTTP surface is rate limited by ThrottlerModule, but a Socket.IO
 * handshake never reaches a Nest guard: Engine.IO's `attach()` re-wraps the
 * server's own `request` and `upgrade` listeners, so the handshake bypasses
 * the whole middleware chain. `allowRequest` is the only gate that sees it,
 * and this is what it consults.
 *
 * Deliberately exposes allow/deny and nothing else: a caller never receives
 * the key, the count, or how long is left.
 */
export function createFixedWindowLimiter(
  options: FixedWindowLimiterOptions = {},
): FixedWindowLimiter {
  const { now = () => Date.now(), windowMs = 60_000, maxEntries = 10_000 } = options;
  if (!Number.isSafeInteger(maxEntries) || maxEntries < 1) {
    throw new TypeError('maxEntries must be a positive integer');
  }
  const windows = new Map<string, Window>();

  return {
    allow(key, limit) {
      const at = now();
      const existing = windows.get(key);

      // A full table is swept of expired windows before anything new is
      // admitted; if it is still full afterwards, the answer is no. Growing
      // without bound would turn the limiter itself into the memory
      // exhaustion it exists to prevent.
      if (!existing && windows.size >= maxEntries) {
        for (const [candidate, window] of windows) {
          if (at - window.startedAt >= windowMs) windows.delete(candidate);
        }
        if (windows.size >= maxEntries) return false;
      }

      if (!existing || at - existing.startedAt >= windowMs) {
        windows.set(key, { startedAt: at, count: 1 });
        return true;
      }
      if (existing.count >= limit) return false;
      existing.count += 1;
      return true;
    },
  };
}
