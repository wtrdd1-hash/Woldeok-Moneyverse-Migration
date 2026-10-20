/**
 * Published public-read versus session-protected endpoint status contract.
 * Public announcements/photos contain only published rows;
 * /photos/mine is private and must require a member session.
 */
export const BACKEND_API_EXPECTATIONS = Object.freeze([
  { path: '/health', expectedStatus: 200, kind: 'public' },
  { path: '/api/version', expectedStatus: 200, kind: 'public' },
  { path: '/api/v1/stocks', expectedStatus: 200, kind: 'public' },
  { path: '/api/v1/announcements', expectedStatus: 200, kind: 'published-public-read' },
  { path: '/api/v1/photos', expectedStatus: 200, kind: 'published-public-read' },
  { path: '/api/v1/photos/mine', expectedStatus: 401, kind: 'member-private-read' },
  { path: '/api/v1/central-bank/base-rate', expectedStatus: 401, kind: 'protected-guard' },
  { path: '/api/v1/central-bank/commercial-rates', expectedStatus: 401, kind: 'protected-guard' },
  { path: '/api/v1/mint/batches', expectedStatus: 401, kind: 'protected-guard' },
  { path: '/api/v1/mint/seigniorage', expectedStatus: 401, kind: 'protected-guard' },
  { path: '/api/v1/casino/jackpot', expectedStatus: 401, kind: 'protected-guard' },
  { path: '/api/v1/casino/clock', expectedStatus: 401, kind: 'protected-guard' },
]);
