/**
 * The porting safety net.
 *
 * The original application's route surface was pinned by a snapshot test.
 * This rebuild redesigns the API, so that snapshot cannot be carried over --
 * this map replaces it. Every application route of the original appears here
 * exactly once, paired with the route that now serves it, or with `null` and
 * a reason if it was deliberately dropped.
 *
 * The snapshot is NOT the source of this list, and an earlier version of this
 * map that took it at face value was ten routes short. That file is a
 * hand-maintained list of probes: it never exercised the `google` half of any
 * `(discord|google)` alternation, `/api/v1/bank/withdraw`, either reward
 * command, `/sitemap.xml`, `/discord/interactions` or `/media/*`. The list
 * below is derived from the route modules themselves by
 * `scripts/extract-original-routes.py`.
 *
 * `replacement: null` with no `reason` fails the test. That is the point: a
 * route cannot disappear quietly.
 *
 * The original's 27 `/assets/*` entries are absent by design -- Next.js emits
 * hashed asset URLs and those paths have no successor -- as are the 4
 * negative probes, which were never routes.
 *
 * A `module` of `frontend` means the path is served by a Next.js page or
 * route handler rather than by the API. Those rows still belong here: the
 * public surface is what must survive the port, regardless of which process
 * answers.
 *
 * Three conventions produced the replacement column:
 *
 *   1. An action becomes a sub-resource collection. `/repay` becomes
 *      `/repayments`, `/settle` becomes `/settlements`, `/consume` becomes
 *      `/consumptions`. The verb moves into the HTTP method.
 *   2. A resource whose identifier the action needs takes it in the path, so
 *      `POST /stocks/trade` carrying a stock id in the body becomes
 *      `POST /stocks/{id}/orders`.
 *   3. Idempotent replacement uses PUT, removal uses DELETE -- never a POST
 *      to an `/unlink` or `/delete` path.
 *
 * One collision is resolved deliberately: the original served the business
 * catalogue at `/api/v1/businesses` and the caller's own holdings at
 * `/api/v1/businesses/mine`. Those are different resources, so the catalogue
 * became `/api/v1/business-types` and the holdings took the plain path.
 */
export interface RouteMapping {
  readonly original: string;
  readonly replacement: string | null;
  readonly reason?: string;
  readonly module: string;
}

export const ROUTE_MAP: readonly RouteMapping[] = [
  { original: 'GET /robots.txt', replacement: 'GET /robots.txt', module: 'frontend' },
  { original: 'GET /health', replacement: 'GET /health', module: 'health' },
  { original: 'GET /login', replacement: 'GET /login', module: 'frontend' },
  { original: 'GET /login/providers', replacement: 'GET /login/providers', module: 'frontend' },
  {
    original: 'POST /api/prelogin-consent',
    replacement: 'PUT /api/v1/auth/consent',
    module: 'auth',
  },
  { original: 'POST /auth/logout', replacement: 'POST /api/v1/auth/logout', module: 'auth' },
  {
    original: 'GET /auth/discord/start',
    replacement: 'GET /auth/discord/authorize',
    module: 'auth',
  },
  {
    original: 'GET /auth/discord/callback',
    replacement: 'GET /auth/discord/callback',
    module: 'auth',
  },
  { original: 'GET /account', replacement: 'GET /account', module: 'frontend' },
  {
    original: 'GET /api/v1/account/identities',
    replacement: 'GET /api/v1/account/identities',
    module: 'account',
  },
  {
    original: 'POST /api/v1/account/delete',
    replacement: 'DELETE /api/v1/account',
    module: 'account',
  },
  {
    original: 'POST /api/v1/account/identities/00000000-0000-4000-8000-000000000000/unlink',
    replacement: 'DELETE /api/v1/account/identities/{id}',
    module: 'account',
  },
  {
    original: 'POST /api/v1/account/link/discord/start',
    replacement: 'POST /api/v1/account/identities/discord/link',
    module: 'account',
  },
  {
    original: 'POST /api/v1/account/reauth/discord/start',
    replacement: 'POST /api/v1/auth/discord/reauthentication',
    module: 'auth',
  },
  { original: 'GET /wallet', replacement: 'GET /wallet', module: 'frontend' },
  { original: 'GET /api/v1/wallet', replacement: 'GET /api/v1/wallet', module: 'wallet' },
  {
    original: 'POST /api/v1/wallet/transfers',
    replacement: 'POST /api/v1/wallet/transfers',
    module: 'wallet',
  },
  {
    original: 'POST /api/v1/bank/deposit',
    replacement: 'POST /api/v1/bank/movements',
    module: 'wallet',
  },
  { original: 'GET /api/v1/bank/loans', replacement: 'GET /api/v1/bank/loans', module: 'wallet' },
  { original: 'POST /api/v1/bank/loans', replacement: 'POST /api/v1/bank/loans', module: 'wallet' },
  {
    original: 'POST /api/v1/bank/loans/00000000-0000-4000-8000-000000000000/repay',
    replacement: 'POST /api/v1/bank/loans/{id}/repayments',
    module: 'wallet',
  },
  { original: 'GET /stocks', replacement: 'GET /stocks', module: 'frontend' },
  { original: 'GET /api/v1/stocks', replacement: 'GET /api/v1/stocks', module: 'stock' },
  {
    original: 'GET /api/v1/stocks/portfolio',
    replacement: 'GET /api/v1/stocks/portfolio',
    module: 'stock',
  },
  {
    original: 'GET /api/v1/stocks/history',
    replacement: 'GET /api/v1/stocks/history',
    module: 'stock',
  },
  {
    original: 'POST /api/v1/stocks/trade',
    replacement: 'POST /api/v1/stocks/{id}/orders',
    module: 'stock',
  },
  {
    original: 'GET /api/v1/stocks/00000000-0000-4000-8000-000000000000/prices',
    replacement: 'GET /api/v1/stocks/{id}/prices',
    module: 'stock',
  },
  { original: 'GET /businesses', replacement: 'GET /businesses', module: 'frontend' },
  {
    original: 'GET /api/v1/businesses',
    replacement: 'GET /api/v1/business-types',
    module: 'business',
  },
  {
    original: 'GET /api/v1/businesses/mine',
    replacement: 'GET /api/v1/businesses',
    module: 'business',
  },
  {
    original: 'POST /api/v1/businesses/purchase',
    replacement: 'POST /api/v1/business-types/{id}/purchases',
    module: 'business',
  },
  {
    original: 'POST /api/v1/businesses/00000000-0000-4000-8000-000000000000/settle',
    replacement: 'POST /api/v1/businesses/{id}/settlements',
    module: 'business',
  },
  { original: 'GET /seasons', replacement: 'GET /seasons', module: 'frontend' },
  {
    original: 'GET /api/v1/seasons/events',
    replacement: 'GET /api/v1/seasons/events',
    module: 'season',
  },
  {
    original: 'POST /api/v1/seasons/events/consume',
    replacement: 'POST /api/v1/seasons/events/{id}/consumptions',
    module: 'season',
  },
  {
    original: 'GET /api/v1/seasons/events/00000000-0000-4000-8000-000000000000/leaderboard',
    replacement: 'GET /api/v1/seasons/events/{id}/leaderboard',
    module: 'season',
  },
  { original: 'GET /shop', replacement: 'GET /shop', module: 'frontend' },
  { original: 'GET /api/v1/shop', replacement: 'GET /api/v1/shop/items', module: 'shop' },
  {
    original: 'GET /api/v1/shop/purchases',
    replacement: 'GET /api/v1/shop/purchases',
    module: 'shop',
  },
  {
    original: 'POST /api/v1/shop/purchases',
    replacement: 'POST /api/v1/shop/items/{id}/purchases',
    module: 'shop',
  },
  { original: 'GET /board', replacement: 'GET /board', module: 'frontend' },
  {
    original: 'POST /api/v1/board/posts',
    replacement: 'POST /api/v1/board/posts',
    module: 'board',
  },
  {
    original: 'DELETE /api/v1/board/posts/00000000-0000-4000-8000-000000000000',
    replacement: 'DELETE /api/v1/board/posts/{id}',
    module: 'board',
  },
  { original: 'GET /', replacement: 'GET /', module: 'frontend' },
  { original: 'GET /announcements', replacement: 'GET /announcements', module: 'frontend' },
  { original: 'GET /gallery', replacement: 'GET /gallery', module: 'frontend' },
  { original: 'GET /status', replacement: 'GET /status', module: 'frontend' },
  { original: 'GET /terms', replacement: 'GET /terms', module: 'frontend' },
  { original: 'GET /privacy', replacement: 'GET /privacy', module: 'frontend' },
  {
    original: 'GET /api/v1/announcements',
    replacement: 'GET /api/v1/announcements',
    module: 'content',
  },
  { original: 'GET /api/v1/gallery', replacement: 'GET /api/v1/photos', module: 'content' },
  { original: 'GET /api/v1/status', replacement: 'GET /api/v1/status', module: 'content' },
  {
    original: 'GET /api/v1/privacy/requests',
    replacement: 'GET /api/v1/privacy/requests',
    module: 'privacy',
  },
  {
    original: 'POST /api/v1/privacy/requests',
    replacement: 'POST /api/v1/privacy/requests',
    module: 'privacy',
  },
  { original: 'GET /admin', replacement: 'GET /admin', module: 'frontend' },
  { original: 'GET /admin/content', replacement: 'GET /admin/content', module: 'frontend' },
  { original: 'GET /admin/minecraft', replacement: 'GET /admin/minecraft', module: 'frontend' },
  { original: 'GET /api/v1/admin/me', replacement: 'GET /api/v1/admin/me', module: 'admin' },
  { original: 'GET /api/v1/admin/users', replacement: 'GET /api/v1/admin/users', module: 'admin' },
  {
    original: 'POST /api/v1/admin/users/00000000-0000-4000-8000-000000000000/restriction',
    replacement: 'PUT /api/v1/admin/users/{id}/restriction',
    module: 'admin',
  },
  {
    original: 'GET /api/v1/admin/approvals',
    replacement: 'GET /api/v1/admin/approvals',
    module: 'admin',
  },
  {
    original: 'POST /api/v1/admin/approvals',
    replacement: 'POST /api/v1/admin/approvals',
    module: 'admin',
  },
  {
    original: 'POST /api/v1/admin/approvals/00000000-0000-4000-8000-000000000000/decision',
    replacement: 'POST /api/v1/admin/approvals/{id}/decisions',
    module: 'admin',
  },
  {
    original: 'GET /api/v1/admin/audit-events',
    replacement: 'GET /api/v1/admin/audit-events',
    module: 'admin',
  },
  {
    original: 'GET /api/v1/admin/discord-outbox-events',
    replacement: 'GET /api/v1/admin/discord-outbox-events',
    module: 'admin',
  },
  {
    original: 'GET /api/v1/admin/economy/reconciliation/latest',
    replacement: 'GET /api/v1/admin/economy/reconciliations/latest',
    module: 'admin',
  },
  {
    original: 'GET /api/v1/admin/stocks',
    replacement: 'GET /api/v1/admin/stocks',
    module: 'admin',
  },
  {
    original: 'POST /api/v1/admin/stocks',
    replacement: 'POST /api/v1/admin/stocks',
    module: 'admin',
  },
  {
    original: 'PATCH /api/v1/admin/stocks/00000000-0000-4000-8000-000000000000',
    replacement: 'PATCH /api/v1/admin/stocks/{id}',
    module: 'admin',
  },
  {
    original: 'POST /api/v1/admin/stocks/00000000-0000-4000-8000-000000000000/corporate-actions',
    replacement: 'POST /api/v1/admin/stocks/{id}/corporate-actions',
    module: 'admin',
  },
  {
    original: 'GET /api/v1/admin/businesses',
    replacement: 'GET /api/v1/admin/business-types',
    module: 'admin',
  },
  {
    original: 'PATCH /api/v1/admin/businesses/00000000-0000-4000-8000-000000000000',
    replacement: 'PATCH /api/v1/admin/business-types/{id}',
    module: 'admin',
  },
  {
    original: 'GET /api/v1/admin/season-events',
    replacement: 'GET /api/v1/admin/season-events',
    module: 'admin',
  },
  {
    original: 'POST /api/v1/admin/season-events',
    replacement: 'POST /api/v1/admin/season-events',
    module: 'admin',
  },
  {
    original: 'PATCH /api/v1/admin/season-events/00000000-0000-4000-8000-000000000000',
    replacement: 'PATCH /api/v1/admin/season-events/{id}',
    module: 'admin',
  },
  {
    original: 'POST /api/v1/admin/photos/upload',
    replacement: 'POST /api/v1/admin/photos',
    module: 'admin',
  },
  {
    original: 'POST /api/v1/admin/content/announcements',
    replacement: 'POST /api/v1/admin/announcements',
    module: 'content',
  },
  {
    original: 'POST /api/v1/admin/content/announcements/00000000-0000-4000-8000-000000000000/publication',
    replacement: 'PUT /api/v1/admin/announcements/{id}/publication',
    module: 'content',
  },
  {
    original: 'POST /api/v1/admin/content/photos',
    replacement: 'POST /api/v1/admin/photos/metadata',
    module: 'content',
  },
  {
    original: 'POST /api/v1/admin/content/photos/00000000-0000-4000-8000-000000000000/publication',
    replacement: 'PUT /api/v1/admin/photos/{id}/publication',
    module: 'content',
  },
  {
    original: 'POST /api/v1/admin/minecraft/operations',
    replacement: 'POST /api/v1/admin/minecraft/operations',
    module: 'minecraft',
  },
  {
    original: 'GET /api/v1/admin/minecraft/operations/00000000-0000-4000-8000-000000000000',
    replacement: 'GET /api/v1/admin/minecraft/operations/{id}',
    module: 'minecraft',
  },
  {
    original: 'GET /sitemap.xml',
    replacement: 'GET /sitemap.xml',
    module: 'frontend',
  },
  {
    original: 'POST /discord/interactions',
    replacement: 'POST /api/v1/integrations/discord/interactions',
    module: 'discord',
  },
  {
    original: 'GET /auth/google/start',
    replacement: 'GET /auth/google/authorize',
    module: 'auth',
  },
  {
    original: 'GET /auth/google/callback',
    replacement: 'GET /auth/google/callback',
    module: 'auth',
  },
  {
    original: 'POST /api/v1/account/link/google/start',
    replacement: 'POST /api/v1/account/identities/google/link',
    module: 'account',
  },
  {
    original: 'POST /api/v1/account/reauth/google/start',
    replacement: 'POST /api/v1/auth/google/reauthentication',
    module: 'auth',
  },
  {
    original: 'POST /api/v1/bank/withdraw',
    replacement: 'POST /api/v1/bank/movements',
    reason: 'merged with bank/deposit into one movements endpoint carrying a direction',
    module: 'wallet',
  },
  {
    original: 'POST /api/v1/rewards/daily',
    replacement: 'POST /api/v1/rewards/daily/claims',
    module: 'wallet',
  },
  {
    original: 'POST /api/v1/rewards/work',
    replacement: 'POST /api/v1/rewards/work/claims',
    module: 'wallet',
  },
  {
    original: 'GET /media/{key}',
    replacement: 'GET /media/{key}',
    // Backend, unprefixed and unversioned. Every photo row already stored in
    // production holds this exact path as its imageUrl, and the bytes live on
    // the volume the API container mounts, so the path could move neither to
    // /api nor to Next.
    module: 'content',
  },
];

export function originalRoutes(): string[] {
  return ROUTE_MAP.map((mapping) => mapping.original);
}

export function replacementFor(original: string): string | null {
  return ROUTE_MAP.find((mapping) => mapping.original === original)?.replacement ?? null;
}
