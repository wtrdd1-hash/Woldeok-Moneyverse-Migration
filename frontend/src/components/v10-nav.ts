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

export const V10_ACCOUNT_ITEM: V10NavItem = {
  label: '내 계정',
  href: '/account',
  icon: 'account',
  match: ['/profile', '/login', '/register', '/auth'],
};

/** The five tabs of every G1 mobile frame, quests raised in the centre. */
export const V10_MOBILE_DOCK: readonly V10NavItem[] = [
  V10_PRIMARY_NAV[0]!,
  V10_PRIMARY_NAV[1]!,
  V10_PRIMARY_NAV[4]!,
  V10_PRIMARY_NAV[3]!,
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
