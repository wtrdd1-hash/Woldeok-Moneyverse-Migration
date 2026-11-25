/**
 * Navigation model for the G1 shell (approved 2026-11-24; replaced the Nov23 v10 shell). The sidebar, the page title in the
 * top bar and the mobile dock all read this one list, so a route cannot be in
 * the menu with one name and titled with another.
 *
 * Labels are the Korean strings drawn in the G1 previews
 * (docs/design/game-ui-v2026.11.24.G1/previews/*.png); they are product copy.
 */

export type V10Icon =
  | 'home'
  | 'wallet'
  | 'bank'
  | 'invest'
  | 'quest'
  | 'shop'
  | 'community'
  | 'support'
  | 'tools'
  | 'account';

export interface V10NavItem {
  readonly label: string;
  readonly href: string;
  readonly icon: V10Icon;
  /** Extra path prefixes that light this item up. */
  readonly match?: readonly string[];
}

export const V10_PRIMARY_NAV: readonly V10NavItem[] = [
  { label: '홈', href: '/', icon: 'home' },
  { label: '지갑', href: '/wallet', icon: 'wallet', match: ['/inventory', '/mint'] },
  { label: '은행', href: '/bank', icon: 'bank', match: ['/central-bank', '/bonds', '/pension', '/kdic', '/treasury', '/fx'] },
  { label: '거래소', href: '/stocks', icon: 'invest', match: ['/businesses', '/enterprises', '/prediction', '/marketplace'] },
  { label: '퀘스트', href: '/quests', icon: 'quest', match: ['/work', '/progression', '/seasons', '/collections', '/arcade', '/casino', '/lobby'] },
  { label: '상점', href: '/shop', icon: 'shop' },
  { label: '광장', href: '/board', icon: 'community', match: ['/blog', '/announcements', '/gallery', '/clubs', '/newspaper', '/feed', '/spaces', '/ko/blog', '/en/blog', '/ja/blog', '/zh/blog'] },
  { label: '문의', href: '/support', icon: 'support', match: ['/chat', '/help'] },
];

/** DESIGN180 "Tools": calculators and guides, between community and account. */
export const V10_TOOLS_ITEM: V10NavItem = {
  label: '계산기',
  href: '/calculators',
  icon: 'tools',
  match: ['/tools', '/guide', '/ko/tools', '/en/tools', '/ja/tools', '/zh/tools', '/vi/tools', '/en/guide', '/ko/guide'],
};

/** DESIGN180 member order: 홈 지갑 은행 거래소 퀘스트 상점 광장 계산기 (+ 내 계정). */
export const D180_MEMBER_NAV: readonly V10NavItem[] = [
  V10_PRIMARY_NAV[0]!,
  V10_PRIMARY_NAV[1]!,
  V10_PRIMARY_NAV[2]!,
  V10_PRIMARY_NAV[3]!,
  V10_PRIMARY_NAV[4]!,
  V10_PRIMARY_NAV[5]!,
  V10_PRIMARY_NAV[6]!,
  V10_TOOLS_ITEM,
];

export type D180AdminIcon = 'overview' | 'members' | 'economy' | 'shop' | 'content' | 'support' | 'security' | 'audit';

export interface D180AdminItem {
  readonly label: string;
  readonly href: string;
  readonly icon: D180AdminIcon;
  readonly match?: readonly string[];
}

/** DESIGN180 administrator navigation; rendered only for a server-reported administrator. */
export const D180_ADMIN_NAV: readonly D180AdminItem[] = [
  { label: '개요', href: '/admin', icon: 'overview' },
  { label: '회원', href: '/admin/users', icon: 'members' },
  { label: '경제', href: '/admin/economy', icon: 'economy', match: ['/admin/bank', '/admin/central-bank', '/admin/bonds', '/admin/treasury', '/admin/mint', '/admin/money-flow', '/admin/market', '/admin/enterprises', '/admin/fx', '/admin/kdic', '/admin/pension', '/admin/work'] },
  { label: '상점', href: '/admin/shop', icon: 'shop', match: ['/admin/catalog'] },
  { label: '콘텐츠', href: '/admin/content', icon: 'content', match: ['/admin/blog', '/admin/seo', '/admin/seo-audit', '/admin/discord', '/admin/help', '/admin/analytics'] },
  { label: '문의', href: '/admin/support', icon: 'support' },
  { label: '보안', href: '/admin/security', icon: 'security', match: ['/admin/safety', '/admin/controls', '/admin/api-health', '/admin/operations'] },
  { label: '감사 기록', href: '/admin/logs', icon: 'audit' },
];

export function isAdminItemActive(item: D180AdminItem, pathname: string): boolean {
  if (item.href === '/admin') return pathname === '/admin';
  const hit = (p: string) => pathname === p || pathname.startsWith(p + '/');
  return hit(item.href) || (item.match ?? []).some(hit);
}

export const V10_ACCOUNT_ITEM: V10NavItem = {
  label: '내 계정',
  href: '/account',
  icon: 'account',
  match: ['/profile', '/login', '/register', '/auth'],
};

/** DESIGN180 mobile dock: 홈 퀘스트 거래소 지갑 계정. */
export const V10_MOBILE_DOCK: readonly V10NavItem[] = [
  V10_PRIMARY_NAV[0]!,
  V10_PRIMARY_NAV[4]!,
  V10_PRIMARY_NAV[3]!,
  V10_PRIMARY_NAV[1]!,
  { ...V10_ACCOUNT_ITEM, label: '계정' },
];

function stripLocale(pathname: string): string {
  const stripped = pathname.replace(/^\/(ko|en|ja|zh|vi)(?=\/|$)/, '');
  return stripped === '' ? '/' : stripped;
}

function startsWithSegment(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(prefix + '/');
}

export function isNavItemActive(item: V10NavItem, pathname: string): boolean {
  const path = stripLocale(pathname);
  if (item.href === '/') return path === '/';
  if (startsWithSegment(path, item.href)) return true;
  return (item.match ?? []).some((prefix) => startsWithSegment(path, stripLocale(prefix)));
}

/** Specific titles that differ from the menu label of their section. */
const SPECIFIC_TITLES: ReadonlyArray<readonly [string, string]> = [
  ['/blog', '블로그'],
  ['/announcements', '공지사항'],
  ['/gallery', '갤러리'],
  ['/stocks', '거래소'],
  ['/central-bank', '중앙은행'],
  ['/bonds', '채권'],
  ['/pension', '연금'],
  ['/work', '직업·업무'],
  ['/login', '로그인'],
  ['/register', '회원가입'],
  ['/admin', '관리자 콘솔'],
  ['/terms', '이용약관'],
  ['/privacy', '개인정보처리방침'],
  ['/status', '서비스 상태'],
  ['/help', '도움말'],
  ['/guide', '가이드'],
  ['/tools', '금융 계산기'],
  ['/calculators', '금융 계산기'],
];

export function v10PageTitle(pathname: string): string {
  const path = stripLocale(pathname);
  if (path === '/') return '길드 홀';
  for (const [prefix, title] of SPECIFIC_TITLES) {
    if (startsWithSegment(path, prefix)) return title;
  }
  const item = [...V10_PRIMARY_NAV, V10_ACCOUNT_ITEM].find((candidate) => isNavItemActive(candidate, path));
  return item?.label ?? 'W Moneyverse';
}
