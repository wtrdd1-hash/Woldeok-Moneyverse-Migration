export interface NavEntry {
  readonly href: string;
  readonly label: string;
}

const ENGLISH_LABELS: Readonly<Record<string, string>> = {
  '홈': 'Home',
  '이용 방법': 'Guide',
  '공지': 'Updates',
  '운영 소식': 'Updates',
  '안내': 'Information',
  '이용약관': 'Terms',
  '개인정보처리방침': 'Privacy',
  '사진': 'Gallery',
  '서비스 상태': 'Service status',
  '상점': 'Shop',
  '내 지갑': 'My wallet',
  '작업': 'Work',
  '직업 업무': 'Career work',
  '가상 금융': 'Banking',
  '가상 은행': 'Virtual Bank',
  '가상 금융 (은행)': 'Virtual Banking',
  '가상 주식': 'Virtual stocks',
  '게임 사업': 'Businesses',
  '시즌': 'Seasons',
  '퀘스트': 'Quests',
  '일일·주간 퀘스트': 'Daily & weekly quests',
  '카지노': 'Casino',
  '성장 단계': 'Progression',
  '장기 성장 단계': 'Long-term progression',
  '내 프로필': 'My profile',
  '아이템 상점': 'Item shop',
  '게시판': 'Board',
  '내 계정': 'My account',
  '운영': 'Admin',
  '경제': 'Economy',
  '콘텐츠': 'Content',
  '소식': 'Explore',
  '활동': 'Earn',
  '커뮤니티': 'Community',
  '운영 콘솔': 'Admin console',
  '마스터 콘솔': 'Master Console',
  '덕지갑': 'Deok Wallet',
  '잡보드': 'Job Board',
  '잡보드 (작업)': 'Job Board (Work)',
  '월덕거래소': 'Woldeok Exchange',
  '월덕거래소 (주식)': 'Woldeok Exchange (Stocks)',
  '마이비즈': 'MyBiz',
  '마이비즈 (사업)': 'MyBiz (Businesses)',
  '월드사이클': 'World Cycle',
  '월드사이클 (시즌)': 'World Cycle (Seasons)',
  '럭키존': 'Lucky Zone',
  '럭키존 (카지노)': 'Lucky Zone (Casino)',
  '커리어패스': 'Career Path',
  '커리어패스 (성장)': 'Career Path (Progression)',
  '덕마켓': 'Deok Market',
  '덕마켓 (상점)': 'Deok Market (Shop)',
  '감사 로그': 'Audit Trail',
  '로그': 'Logs',
  '전달 로그': 'Delivery Log',
  '무결성': 'Integrity',
};

export function navLabel(label: string, locale: 'ko' | 'en'): string {
  return locale === 'en' ? (ENGLISH_LABELS[label] ?? label) : label;
}

/** Readable by anyone, indexed, and the only group a signed-out visitor sees. */
export const PUBLIC_NAV: readonly NavEntry[] = [
  { href: '/', label: '홈' },
  { href: '/guide', label: '이용 방법' },
  { href: '/announcements', label: '운영 소식' },
  { href: '/gallery', label: '사진' },
  { href: '/board', label: '게시판' },
  { href: '/status', label: '서비스 상태' },
  { href: '/terms', label: '이용약관' },
  { href: '/privacy', label: '개인정보처리방침' },
  { href: '/bank', label: '가상 금융' },
  { href: '/shop', label: '아이템 상점' },
];

/** Needs a session and current consent. Every one of these is `noindex`. */
export const MEMBER_NAV: readonly NavEntry[] = [
  { href: '/wallet', label: '덕지갑' },
  { href: '/bank', label: '가상 금융 (은행)' },
  { href: '/work', label: '잡보드 (작업)' },
  { href: '/stocks', label: '월덕거래소 (주식)' },
  { href: '/businesses', label: '마이비즈 (사업)' },
  { href: '/shop', label: '아이템 상점' },
  { href: '/seasons', label: '월드사이클 (시즌)' },
  { href: '/quests', label: '퀘스트' },
  { href: '/casino', label: '럭키존 (카지노)' },
  { href: '/progression', label: '커리어패스 (성장)' },
  { href: '/profile', label: '내 프로필' },
  { href: '/account', label: '내 계정' },
];

/** Shown only to a member holding at least one administrator role. */
export const ADMIN_NAV: readonly NavEntry[] = [
  { href: '/admin', label: '운영' },
  { href: '/admin/economy', label: '경제' },
  { href: '/admin/content', label: '콘텐츠' },
  { href: '/admin/logs', label: '감사 로그' },
];

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
  { href: '/guide', label: '이용 방법' },
  { href: '/gallery', label: '사진' },
  { href: '/board', label: '게시판' },
  {
    label: '안내',
    entries: [
      { href: '/announcements', label: '운영 소식' },
      { href: '/status', label: '서비스 상태' },
      { href: '/terms', label: '이용약관' },
      { href: '/privacy', label: '개인정보처리방침' },
    ],
  },
  {
    label: '경제',
    entries: [
      { href: '/bank', label: '가상 금융' },
      { href: '/stocks', label: '가상 주식' },
      { href: '/businesses', label: '게임 사업' },
      { href: '/shop', label: '아이템 상점' },
    ],
  },
];

export const HEADER_MEMBER: readonly NavItem[] = [
  {
    label: '경제',
    entries: [
      { href: '/bank', label: '가상 금융' },
      { href: '/stocks', label: '가상 주식' },
      { href: '/businesses', label: '게임 사업' },
      { href: '/shop', label: '아이템 상점' },
      { href: '/casino', label: '카지노' },
    ],
  },
  {
    label: '활동',
    entries: [
      { href: '/work', label: '직업 업무' },
      { href: '/quests', label: '일일·주간 퀘스트' },
      { href: '/progression', label: '장기 성장 단계' },
    ],
  },
  {
    label: '커뮤니티',
    entries: [
      { href: '/seasons', label: '시즌' },
      { href: '/profile', label: '내 프로필' },
    ],
  },
];

export const HEADER_ADMIN: readonly NavItem[] = [
  {
    label: '운영',
    entries: [
      { href: '/admin', label: '마스터 콘솔' },
      { href: '/admin/economy', label: '경제' },
      { href: '/admin/content', label: '콘텐츠' },
      { href: '/admin/logs', label: '감사 로그' },
    ],
  },
];

/** True when the reader is inside any of a group's destinations. */
export function isGroupCurrent(pathname: string, group: NavGroup): boolean {
  return group.entries.some((entry) => isCurrent(pathname, entry.href));
}

/**
 * `/` matches only itself; everything else matches its subtree.
 */
export function isCurrent(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  if (href === '/shop') return pathname === '/shop';
  return pathname === href || pathname.startsWith(`${href}/`);
}
