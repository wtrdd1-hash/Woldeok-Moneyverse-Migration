export interface NavEntry {
  readonly href: string;
  readonly label: string;
}

/** Readable by anyone, indexed, and the only group a signed-out visitor sees. */
export const PUBLIC_NAV: readonly NavEntry[] = [
  { href: '/', label: '홈' },
  { href: '/guide', label: '이용 방법' },
  { href: '/announcements', label: '공지' },
  { href: '/gallery', label: '사진' },
  { href: '/status', label: '서비스 상태' },
  { href: '/shop', label: '상점' },
];

/** Needs a session and current consent. Every one of these is `noindex`. */
export const MEMBER_NAV: readonly NavEntry[] = [
  { href: '/wallet', label: '내 지갑' },
  { href: '/work', label: '작업' },
  { href: '/stocks', label: '가상 주식' },
  { href: '/businesses', label: '게임 사업' },
  { href: '/seasons', label: '시즌' },
  { href: '/quests', label: '퀘스트' },
  { href: '/casino', label: '카지노' },
  { href: '/progression', label: '성장 단계' },
  { href: '/profile', label: '내 프로필' },
  { href: '/shop/catalog', label: '아이템 상점' },
  { href: '/board', label: '게시판' },
  { href: '/account', label: '내 계정' },
];

/** Shown only to a member holding at least one administrator role. */
export const ADMIN_NAV: readonly NavEntry[] = [
  { href: '/admin', label: '운영' },
  { href: '/admin/economy', label: '경제' },
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
  // Second, and top level rather than inside a group: it is the one page that
  // explains what this site is to somebody who has not signed in, and burying
  // it under 소식 would put the answer to "how do I start" behind a hover.
  { href: '/guide', label: '이용 방법' },
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

/**
 * Grouped by what a member is trying to do, not by which module built it.
 *
 * The first arrangement grouped seven screens under 게임 and two under 성장,
 * which is how the code is organised rather than how the site is used: 작업
 * and 가상 주식 have nothing to do with each other except that both were
 * built as games, and a two-item dropdown is a menu that should not have been
 * a menu. These three read as answers to "where do I earn", "where does the
 * money go" and "where are other people".
 *
 * 작업 leads 활동 because it is where a member with nothing earns their first
 * WLD; everything under 경제 costs money to start.
 */
export const HEADER_MEMBER: readonly NavItem[] = [
  {
    label: '활동',
    entries: [
      { href: '/work', label: '작업' },
      { href: '/quests', label: '퀘스트' },
      { href: '/progression', label: '성장 단계' },
    ],
  },
  {
    label: '경제',
    entries: [
      { href: '/shop/catalog', label: '아이템 상점' },
      { href: '/businesses', label: '게임 사업' },
      { href: '/stocks', label: '가상 주식' },
      // Behind a feature switch that is off until the stage-3 gates pass. The
      // link stays, and the page says so in a sentence -- hiding it would make
      // "why can I not find it" a support question.
      { href: '/casino', label: '카지노' },
    ],
  },
  {
    label: '커뮤니티',
    entries: [
      { href: '/board', label: '게시판' },
      { href: '/seasons', label: '시즌' },
      { href: '/profile', label: '내 프로필' },
    ],
  },
];

export const HEADER_ADMIN: readonly NavItem[] = [
  {
    label: '운영',
    entries: [
      { href: '/admin', label: '운영 콘솔' },
      { href: '/admin/economy', label: '경제' },
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
  // `/shop` is the only entry with another entry beneath it. A subtree match
  // would put `aria-current="page"` on both links at once when the reader is
  // in the catalogue, which reads to a screen reader as two current pages.
  if (href === '/shop') return pathname === '/shop';
  return pathname === href || pathname.startsWith(`${href}/`);
}
