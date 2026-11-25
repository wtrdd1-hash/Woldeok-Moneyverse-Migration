import type { G1SceneKind } from '@/components/g1/scene';

/**
 * Which G1 hero scene a route shows. The same grouping the approved G1
 * mockups were generated with (scripts/design/game-ui-g1/generate.py), so a
 * page renders the scene its preview shows.
 */
const GROUPS: ReadonlyArray<readonly [G1SceneKind, readonly string[]]> = [
  ['citadel', ['/admin', '/status']],
  ['gate', ['/login', '/register', '/forgot-password', '/reset-password', '/invite', '/account', '/profile', '/account-deletion', '/data-deletion', '/terms', '/privacy', '/roadmap', '/features', '/developer', '/search', '/design-preview', '/verify-email', '/verify-email-change', '/safety']],
  ['vault', ['/wallet', '/inventory', '/mint', '/collections', '/dashboard', '/bank', '/central-bank', '/bonds', '/pension', '/kdic', '/treasury', '/fx']],
  ['chart', ['/stocks', '/businesses', '/enterprises', '/prediction']],
  ['board', ['/quests', '/progression', '/seasons', '/arcade', '/casino', '/lobby', '/calendar', '/work', '/blog', '/board', '/announcements', '/gallery', '/clubs', '/newspaper', '/spaces', '/feed']],
  ['stall', ['/shop', '/marketplace', '/cosmetics']],
  ['tavern', ['/support', '/chat', '/help', '/advisor']],
  ['lab', ['/tools', '/calculators', '/guide']],
];

export function sceneForPath(pathname: string): G1SceneKind {
  const path = pathname.replace(/^\/(ko|en|ja|zh|vi)(?=\/|$)/, '') || '/';
  if (path === '/') return 'skyline';
  for (const [scene, prefixes] of GROUPS) {
    if (prefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) return scene;
  }
  return 'gate';
}
