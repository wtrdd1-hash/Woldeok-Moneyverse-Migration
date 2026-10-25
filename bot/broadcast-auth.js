import { createHash, timingSafeEqual } from 'node:crypto';

// The loopback listener is reachable by other local processes. Do not trust
// loopback alone, and never fall back to a checked-in shared credential.
export function authorizeBroadcastRequest(presented, configured) {
  if (typeof configured !== 'string' || Buffer.byteLength(configured, 'utf8') < 32 ||
      typeof presented !== 'string' || presented.length > 4096) {
    return false;
  }
  const received = createHash('sha256').update(presented).digest();
  const expected = createHash('sha256').update(configured).digest();
  return timingSafeEqual(received, expected);
}
