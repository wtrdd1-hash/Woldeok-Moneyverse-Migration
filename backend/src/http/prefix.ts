/**
 * Routes that stay outside the `/api/v{n}` prefix.
 *
 * Every one of them is a path something outside this codebase already knows:
 * a container probe hits `/health`, Discord and Google redirect to the two
 * `/auth` paths registered with them, and `/media/:key` is the `imageUrl`
 * stored on photo rows that predate this rewrite. None can move.
 *
 * Declared once because it has to be applied identically by `main.ts` and by
 * every end-to-end test that builds the application graph; when the list lived
 * at each call site, adding `/media/:key` to production left five test
 * bootstraps mounting it at a different path than the server does.
 */
export const UNPREFIXED_ROUTES: readonly string[] = [
  'health',
  'media/:key',
  'auth/:provider/authorize',
  'auth/:provider/callback',
];
