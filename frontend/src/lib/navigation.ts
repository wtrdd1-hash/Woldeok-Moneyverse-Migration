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
  { href: '/admin/minecraft', label: '마인크래프트' },
];

/**
 * `/` matches only itself; everything else matches its subtree, so
 * `/admin/content` marks `/admin/content` current rather than `/admin`.
 */
export function isCurrent(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  if (pathname === href) return true;
  return pathname.startsWith(`${href}/`);
}
