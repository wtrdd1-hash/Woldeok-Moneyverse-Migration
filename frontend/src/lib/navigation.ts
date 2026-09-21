export interface NavEntry {
  readonly href: string;
  readonly label: string;
  readonly icon?: string;
  readonly description?: string;
  readonly badge?: string;
}

export interface NavCategory {
  readonly id: string;
  readonly label: string;
  readonly icon?: string;
  readonly description?: string;
  readonly entries: readonly NavEntry[];
}

const ENGLISH_LABELS: Readonly<Record<string, string>> = {
  '홈': 'Home',
  '내 대시보드': 'My Dashboard',
  '이용 방법': 'Guide',
  '공지': 'Updates',
  '운영 소식': 'Updates',
  '안내': 'Information',
  '이용약관': 'Terms',
  '개인정보처리방침': 'Privacy',
  '사진': 'Gallery',
  '서비스 상태': 'Service Status',
  '상점': 'Shop',
  '내 지갑': 'My Wallet',
  '자산': 'Assets',
  '거래소': 'Exchange',
  '작업': 'Work',
  '직업 업무': 'Career Work',
  '가상 금융': 'Banking',
  '가상 은행': 'Virtual Bank',
  '가상 금융 (은행)': 'Virtual Banking',
  '가상 주식': 'Virtual Stocks',
  '게임 사업': 'Businesses',
  '시즌': 'Seasons',
  '퀘스트': 'Quests',
  '일일·주간 퀘스트': 'Daily & Weekly Quests',
  '일정': 'Calendar',
  '이벤트 일정': 'Event Calendar',
  '카지노': 'Casino',
  '성장 단계': 'Progression',
  '장기 성장 단계': 'Long-term Progression',
  '내 프로필': 'My Profile',
  '쪽지함': 'Messages',
  '클럽·협동조합': 'Clubs & Co-ops',
  '개인 공간 & 도시': 'Spaces & City',
  '아이템 상점': 'Item Shop',
  '게시판': 'Board',
  '관리자 문의': 'Support',
  '문의 채팅': 'Support Inbox',
  '내 계정': 'My Account',
  '계정 보안': 'Account Security',
  '운영': 'Admin',
  '경제': 'Economy',
  '콘텐츠': 'Content',
  '소식': 'Explore',
  '활동': 'Earn',
  '커뮤니티': 'Community',
  '운영 콘솔': 'Admin Console',
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
  '금융·투자': 'Finance & Invest',
  '경제·활동': 'Economy & Career',
  '플레이·시즌': 'Play & Seasons',
  '자산 활동 내역': 'Asset Activity',
};

export function navLabel(label: string, locale: 'ko' | 'en'): string {
  return locale === 'en' ? (ENGLISH_LABELS[label] ?? label) : label;
}

/**
 * 5 Major Category Mega Navigation for Modern FinTech Super-App
 */
export const CATEGORY_NAV: readonly NavCategory[] = [
  {
    id: 'finance',
    label: '금융·투자',
    icon: 'TrendingUp',
    description: '가상 주식 매매, 덕지갑 자산 관리, 가상 은행 금융 상품',
    entries: [
      { href: '/stocks', label: '월덕거래소', description: '실시간 가상 주식 매매 및 차트 호가', badge: '인기' },
      { href: '/wallet', label: '덕지갑', description: '총 보유 자산 현황 및 즉시 송금' },
      { href: '/bank', label: '가상 은행', description: '예적금 이자 수령 및 대출 상품', badge: '금융' },
      { href: '/wallet/activity', label: '자산 활동 내역', description: '수익 및 지출 원장 타임라인' },
    ],
  },
  {
    id: 'economy',
    label: '경제·활동',
    icon: 'Briefcase',
    description: '직업 업무 수행, 법인 사업체 운영, 아이템 상점 및 커리어',
    entries: [
      { href: '/work', label: '잡보드 (직업)', description: '일일 업무 수행 및 WLD 보상 획득', badge: '필수' },
      { href: '/businesses', label: '마이비즈 (사업)', description: '사업체 인수, 수익 일괄 정산 및 부스트' },
      { href: '/shop', label: '덕마켓 (상점)', description: '인벤토리 장비 및 소비 아이템 구매' },
      { href: '/progression', label: '커리어패스 (성장)', description: '숙련도 성장 단계 및 전직 해금' },
      { href: '/quests', label: '퀘스트', description: '일일 및 주간 미션 달성 추가 보상' },
    ],
  },
  {
    id: 'entertainment',
    label: '플레이·시즌',
    icon: 'Sparkles',
    description: '카지노 미니게임, 시즌 랭킹 대전, 이벤트 일정 및 협동조합',
    entries: [
      { href: '/casino', label: '럭키존 (카지노)', description: '공정성 검증 주사위·코인토스 미니게임', badge: 'HOT' },
      { href: '/seasons', label: '월드사이클 (시즌)', description: '시즌 랭킹 티어 경쟁 및 시즌 패스' },
      { href: '/calendar', label: '이벤트 일정', description: '경제 이벤트 및 시장 일정 캘린더' },
      { href: '/clubs', label: '클럽·협동조합', description: '유저 길드 창설, 가입 및 협동 펀딩' },
      { href: '/spaces', label: '개인 공간 & 도시', description: '가상 도시 부지 및 개인 룸 공간' },
    ],
  },
  {
    id: 'community',
    label: '커뮤니티',
    icon: 'MessageSquare',
    description: '자유 토론 게시판, 사진 갤러리, 운영 소식 및 1:1 고객지원',
    entries: [
      { href: '/board', label: '커뮤니티 게시판', description: '종목 토론, 자유 소통 및 정보 공유' },
      { href: '/gallery', label: '사진 갤러리', description: '유저 인증샷 및 미디어 갤러리' },
      { href: '/announcements', label: '운영 소식', description: '시스템 패치 노트 및 공식 공지사항' },
      { href: '/guide', label: '이용 가이드', description: '신규 유저 가이드 및 게임 플레이 팁' },
      { href: '/support', label: '1:1 관리자 문의', description: '고객 지원 및 문의사항 접수' },
    ],
  },
];

/**
 * 4 Primary Core Navigation Tabs for Clean Header Top Line
 */
export const PRIMARY_NAV: readonly NavEntry[] = [
  { href: '/', label: '홈' },
  { href: '/stocks', label: '거래소' },
  { href: '/wallet', label: '자산' },
  { href: '/board', label: '커뮤니티' },
];

/** Readable by anyone, indexed, and the only group a signed-out visitor sees. */
export const PUBLIC_NAV: readonly NavEntry[] = [
  { href: '/', label: '홈' },
  { href: '/stocks', label: '거래소' },
  { href: '/wallet', label: '자산' },
  { href: '/board', label: '커뮤니티' },
  { href: '/guide', label: '이용 방법' },
  { href: '/announcements', label: '운영 소식' },
  { href: '/gallery', label: '사진' },
  { href: '/status', label: '서비스 상태' },
  { href: '/terms', label: '이용약관' },
  { href: '/privacy', label: '개인정보처리방침' },
  { href: '/bank', label: '가상 금융' },
  { href: '/shop', label: '아이템 상점' },
];

/** Needs a session and current consent. Every one of these is `noindex`. */
export const MEMBER_NAV: readonly NavEntry[] = [
  { href: '/dashboard', label: '내 대시보드' },
  { href: '/wallet', label: '덕지갑' },
  { href: '/bank', label: '가상 금융 (은행)' },
  { href: '/work', label: '잡보드 (작업)' },
  { href: '/stocks', label: '월덕거래소 (주식)' },
  { href: '/businesses', label: '마이비즈 (사업)' },
  { href: '/shop', label: '아이템 상점' },
  { href: '/seasons', label: '월드사이클 (시즌)' },
  { href: '/quests', label: '퀘스트' },
  { href: '/calendar', label: '이벤트 일정' },
  { href: '/casino', label: '럭키존 (카지노)' },
  { href: '/progression', label: '커리어패스 (성장)' },
  { href: '/profile', label: '내 프로필' },
  { href: '/chat', label: '쪽지함' },
  { href: '/clubs', label: '클럽·협동조합' },
  { href: '/spaces', label: '개인 공간 & 도시' },
  { href: '/support', label: '관리자 문의' },
  { href: '/account', label: '내 계정' },
  { href: '/account/security', label: '계정 보안' },
];

/** Shown only to a member holding at least one administrator role. */
export const ADMIN_NAV: readonly NavEntry[] = [
  { href: '/admin', label: '운영' },
  { href: '/admin/support', label: '문의 채팅' },
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
  { href: '/stocks', label: '거래소' },
  { href: '/wallet', label: '자산' },
  { href: '/board', label: '커뮤니티' },
  {
    label: '안내',
    entries: [
      { href: '/guide', label: '이용 방법' },
      { href: '/announcements', label: '운영 소식' },
      { href: '/gallery', label: '사진' },
      { href: '/status', label: '서비스 상태' },
      { href: '/terms', label: '이용약관' },
      { href: '/privacy', label: '개인정보처리방침' },
    ],
  },
  {
    label: '경제',
    entries: [
      { href: '/bank', label: '가상 금융' },
      { href: '/businesses', label: '게임 사업' },
      { href: '/shop', label: '아이템 상점' },
    ],
  },
];

export const HEADER_MEMBER: readonly NavItem[] = [
  { href: '/dashboard', label: '내 대시보드' },
  {
    label: '활동',
    entries: [
      { href: '/work', label: '직업 업무' },
      { href: '/quests', label: '일일·주간 퀘스트' },
      { href: '/calendar', label: '일정' },
      { href: '/casino', label: '카지노' },
      { href: '/progression', label: '장기 성장 단계' },
    ],
  },
  {
    label: '소식',
    entries: [
      { href: '/seasons', label: '시즌' },
      { href: '/profile', label: '내 프로필' },
      { href: '/chat', label: '쪽지함' },
      { href: '/clubs', label: '클럽·협동조합' },
      { href: '/support', label: '관리자 문의' },
    ],
  },
];

export const HEADER_ADMIN: readonly NavItem[] = [
  {
    label: '운영',
    entries: [
      { href: '/admin', label: '마스터 콘솔' },
      { href: '/admin/support', label: '문의 채팅' },
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
