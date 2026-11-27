import { type Locale } from '@/lib/locale';
import { t } from '@/lib/translations';
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
  /** Korean product copy; the displayed text comes from the catalog via navLabel(item, locale). */
  readonly label: string;
  /** Catalog key (lib/translations.ts) with all five languages. */
  readonly key: string;
  readonly href: string;
  readonly icon: V10Icon;
  /** Extra path prefixes that light this item up. */
  readonly match?: readonly string[];
}

export const V10_PRIMARY_NAV: readonly V10NavItem[] = [
  { label: '홈', key: 'nav.v10.home', href: '/', icon: 'home' },
  { label: '지갑', key: 'nav.v10.wallet', href: '/wallet', icon: 'wallet', match: ['/inventory', '/mint'] },
  { label: '은행', key: 'nav.v10.bank', href: '/bank', icon: 'bank', match: ['/central-bank', '/bonds', '/pension', '/kdic', '/treasury', '/fx'] },
  { label: '거래소', key: 'nav.v10.exchange', href: '/stocks', icon: 'invest', match: ['/businesses', '/enterprises', '/prediction', '/marketplace'] },
  { label: '퀘스트', key: 'nav.v10.quests', href: '/quests', icon: 'quest', match: ['/work', '/progression', '/seasons', '/collections', '/arcade', '/casino', '/lobby'] },
  { label: '상점', key: 'nav.v10.shop', href: '/shop', icon: 'shop' },
  { label: '광장', key: 'nav.v10.plaza', href: '/board', icon: 'community', match: ['/blog', '/announcements', '/gallery', '/clubs', '/newspaper', '/feed', '/spaces', '/ko/blog', '/en/blog', '/ja/blog', '/zh/blog'] },
  { label: '문의', key: 'nav.v10.support', href: '/support', icon: 'support', match: ['/chat', '/help'] },
];

/** DESIGN180 "Tools": calculators and guides, between community and account. */
export const V10_TOOLS_ITEM: V10NavItem = {
  label: '계산기',
  key: 'nav.v10.calculators',
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
  readonly key: string;
  readonly href: string;
  readonly icon: D180AdminIcon;
  readonly match?: readonly string[];
}

/** DESIGN180 administrator navigation; rendered only for a server-reported administrator. */
export const D180_ADMIN_NAV: readonly D180AdminItem[] = [
  { label: '개요', key: 'nav.admin.overview', href: '/admin', icon: 'overview' },
  { label: '회원', key: 'nav.admin.members', href: '/admin/users', icon: 'members' },
  { label: '경제', key: 'nav.admin.economy', href: '/admin/economy', icon: 'economy', match: ['/admin/bank', '/admin/central-bank', '/admin/bonds', '/admin/treasury', '/admin/mint', '/admin/money-flow', '/admin/market', '/admin/enterprises', '/admin/fx', '/admin/kdic', '/admin/pension', '/admin/work'] },
  { label: '상점', key: 'nav.admin.shop', href: '/admin/shop', icon: 'shop', match: ['/admin/catalog'] },
  { label: '콘텐츠', key: 'nav.admin.content', href: '/admin/content', icon: 'content', match: ['/admin/blog', '/admin/seo', '/admin/seo-audit', '/admin/discord', '/admin/help', '/admin/analytics'] },
  { label: '문의', key: 'nav.admin.support', href: '/admin/support', icon: 'support' },
  { label: '보안', key: 'nav.admin.security', href: '/admin/security', icon: 'security', match: ['/admin/safety', '/admin/controls', '/admin/api-health', '/admin/operations'] },
  { label: '감사 기록', key: 'nav.admin.audit', href: '/admin/logs', icon: 'audit' },
];

export function isAdminItemActive(item: D180AdminItem, pathname: string): boolean {
  if (item.href === '/admin') return pathname === '/admin';
  const hit = (p: string) => pathname === p || pathname.startsWith(p + '/');
  return hit(item.href) || (item.match ?? []).some(hit);
}

export const V10_ACCOUNT_ITEM: V10NavItem = {
  label: '내 계정',
  key: 'nav.v10.myAccount',
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
  { ...V10_ACCOUNT_ITEM, label: '계정', key: 'nav.v10.account' },
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
  ['/blog', 'title.blog'],
  ['/announcements', 'title.announcements'],
  ['/gallery', 'title.gallery'],
  ['/stocks', 'title.exchange'],
  ['/central-bank', 'title.centralBank'],
  ['/bonds', 'title.bonds'],
  ['/pension', 'title.pension'],
  ['/work', 'title.work'],
  ['/login', 'title.login'],
  ['/register', 'title.register'],
  ['/admin', 'title.admin'],
  ['/terms', 'title.terms'],
  ['/privacy', 'title.privacy'],
  ['/status', 'title.status'],
  ['/help', 'title.help'],
  ['/guide', 'title.guide'],
  ['/tools', 'title.calculators'],
  ['/calculators', 'title.calculators'],
];

export function v10PageTitle(pathname: string, locale: Locale): string {
  const path = stripLocale(pathname);
  if (path === '/') return t('title.guildHall', locale);
  for (const [prefix, key] of SPECIFIC_TITLES) {
    if (startsWithSegment(path, prefix)) return t(key, locale);
  }
  const item = [...V10_PRIMARY_NAV, V10_ACCOUNT_ITEM].find((candidate) => isNavItemActive(candidate, path));
  return item ? navLabel(item, locale) : 'W Moneyverse';
}

/** Displayed label of a navigation item in the reader's language (Korean copy as last resort). */
export function navLabel(item: { readonly key: string; readonly label: string }, locale: Locale): string {
  return t(item.key, locale, item.label);
}

/** Shell strings the frame renders; every one must exist in all five languages. */
export const SHELL_KEYS: readonly string[] = [
  'shell.skipToContent', 'shell.policies', 'shell.customerSupport', 'shell.bottomNav', 'shell.mainMenu',
  'shell.adminMenu', 'shell.fullMenu', 'shell.searchPages', 'shell.notifications', 'shell.myMoneyverse',
  'shell.administrator', 'shell.backToMember', 'shell.adminConsole', 'shell.tagline', 'shell.verifiedOnly',
  'shell.brand', 'shell.brandHome', 'shell.community', 'title.guildHall', 'title.terms', 'title.privacy',
  'home.todaySummary', 'home.topMovers', 'home.whatsNext',
];
