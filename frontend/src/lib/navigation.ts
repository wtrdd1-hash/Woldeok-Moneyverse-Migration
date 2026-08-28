export interface NavEntry {
  readonly href: string;
  readonly label: string;
}

/** Readable by anyone, indexed, and the only group a signed-out visitor sees. */
export const PUBLIC_NAV: readonly NavEntry[] = [
  { href: '/', label: '홈' },
  { href: '/announcements', label: '공지' },
  { href: '/gallery', label: '사진' },
  { href: '/status', label: '서비스 상태' },
  { href: '/shop', label: '상점' },
];

/** Needs a session and current consent. Every one of these is `noindex`. */
export const MEMBER_NAV: readonly NavEntry[] = [
  { href: '/wallet', label: '내 지갑' },
  { href: '/stocks', label: '가상 주식' },
  { href: '/businesses', label: '게임 사업' },
  { href: '/seasons', label: '시즌' },
  { href: '/board', label: '게시판' },
  { href: '/account', label: '내 계정' },
];

/** Shown only to a member holding at least one administrator role. */
export const ADMIN_NAV: readonly NavEntry[] = [
  { href: '/admin', label: '운영' },
  { href: '/admin/content', label: '콘텐츠' },
];

/**
 * How the masthead groups those links on a wide screen.
 *
 * Flat, the three lists above are thirteen items for a signed-in
 * administrator, and thirteen does not fit on one row — it wrapped into two
 * and the wordmark lost its line. Grouping is not decoration here: 공지·사진·
 * 서비스 상태 are one errand, and so are the four game screens.
 *
 * 내 지갑 and 내 계정 are deliberately absent. They are the controls on the
 * right of the bar, and a link that already has a button does not need a
 * second place to live.
 *
 * The sheet on a phone still renders the flat lists: a drawer has room, and
 * a menu inside a menu is worse than a long list.
 */
export interface NavGroup {
  readonly label: string;
  readonly entries: readonly NavEntry[];
}

export type NavItem = NavEntry | NavGroup;

export function isGroup(item: NavItem): item is NavGroup {
  return 'entries' in item;
}

export const HEADER_PUBLIC: readonly NavItem[] = [
  { href: '/', label: '홈' },
  {
    label: '소식',
    entries: [
      { href: '/announcements', label: '공지' },
      { href: '/gallery', label: '사진' },
      { href: '/status', label: '서비스 상태' },
    ],
  },
  { href: '/shop', label: '상점' },
];

export const HEADER_MEMBER: readonly NavItem[] = [
  {
    label: '게임',
    entries: [
      { href: '/stocks', label: '가상 주식' },
      { href: '/businesses', label: '게임 사업' },
      { href: '/seasons', label: '시즌' },
    ],
  },
  { href: '/board', label: '게시판' },
];

export const HEADER_ADMIN: readonly NavItem[] = [
  {
    label: '운영',
    entries: [
      { href: '/admin', label: '운영 콘솔' },
      { href: '/admin/content', label: '콘텐츠' },
    ],
  },
];

/** True when the reader is inside any of a group's destinations. */
export function isGroupCurrent(pathname: string, group: NavGroup): boolean {
  return group.entries.some((entry) => isCurrent(pathname, entry.href));
}

/**
 * `/` matches only itself; everything else matches its subtree, so
 * `/admin/content` marks `/admin/content` current rather than `/admin`.
 */
export function isCurrent(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  if (pathname === href) return true;
  return pathname.startsWith(`${href}/`);
}
