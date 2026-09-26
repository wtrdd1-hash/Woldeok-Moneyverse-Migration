export type RouteChangeFrequency =
  | 'always'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'never';

export type RouteGroup =
  | 'public'
  | 'finance'
  | 'economy'
  | 'play'
  | 'community'
  | 'legal'
  | 'admin'
  | 'auth';

export interface RouteDefinition {
  path: string;
  label: {
    ko: string;
    en: string;
    ja: string;
    zh: string;
  };
  isPublic: boolean;
  authRequired: boolean;
  indexable: boolean;
  sitemapPriority?: number;
  changeFrequency?: RouteChangeFrequency;
  group: RouteGroup;
}

/**
 * Single Source of Truth (SSOT) Route Registry for Woldeok Moneyverse.
 * Strictly defines access levels, crawler indexability, and sitemap metadata.
 */
export const APP_ROUTES: readonly RouteDefinition[] = [
  // === Public Landing & Information ===
  {
    path: '',
    label: { ko: '홈', en: 'Home', ja: 'ホーム', zh: '首页' },
    isPublic: true,
    authRequired: false,
    indexable: true,
    sitemapPriority: 1.0,
    changeFrequency: 'daily',
    group: 'public',
  },
  {
    path: '/guide',
    label: { ko: '초보자 가이드', en: 'Beginner Guide', ja: '初心者ガイド', zh: '新手指南' },
    isPublic: true,
    authRequired: false,
    indexable: true,
    sitemapPriority: 0.8,
    changeFrequency: 'weekly',
    group: 'public',
  },
  {
    path: '/announcements',
    label: { ko: '공지사항', en: 'Announcements', ja: 'お知らせ', zh: '官方公告' },
    isPublic: true,
    authRequired: false,
    indexable: true,
    sitemapPriority: 0.8,
    changeFrequency: 'daily',
    group: 'public',
  },
  {
    path: '/gallery',
    label: { ko: '갤러리', en: 'Gallery', ja: 'ギャラリー', zh: '画廊' },
    isPublic: true,
    authRequired: false,
    indexable: true,
    sitemapPriority: 0.7,
    changeFrequency: 'weekly',
    group: 'public',
  },
  {
    path: '/shop',
    label: { ko: '아이템 상점', en: 'Shop', ja: 'ショップ', zh: '商城' },
    isPublic: true,
    authRequired: false,
    indexable: true,
    sitemapPriority: 0.7,
    changeFrequency: 'weekly',
    group: 'public',
  },
  {
    path: '/board',
    label: { ko: '자유게시판', en: 'Community Board', ja: '掲示板', zh: '社区论坛' },
    isPublic: true,
    authRequired: false,
    indexable: true,
    sitemapPriority: 0.8,
    changeFrequency: 'daily',
    group: 'community',
  },

  // === Legal & Compliance ===
  {
    path: '/terms',
    label: { ko: '이용약관', en: 'Terms of Service', ja: '利用規約', zh: '用户协议' },
    isPublic: true,
    authRequired: false,
    indexable: true,
    sitemapPriority: 0.5,
    changeFrequency: 'monthly',
    group: 'legal',
  },
  {
    path: '/privacy',
    label: { ko: '개인정보처리방침', en: 'Privacy Policy', ja: 'プライバシーポリシー', zh: '隐私政策' },
    isPublic: true,
    authRequired: false,
    indexable: true,
    sitemapPriority: 0.5,
    changeFrequency: 'monthly',
    group: 'legal',
  },
  {
    path: '/account-deletion',
    label: { ko: '계정 삭제 안내', en: 'Account Deletion', ja: 'アカウント削除', zh: '账户注销指南' },
    isPublic: true,
    authRequired: false,
    indexable: true,
    sitemapPriority: 0.3,
    changeFrequency: 'yearly',
    group: 'legal',
  },
  {
    path: '/data-deletion',
    label: { ko: '데이터 소거 요청', en: 'Data Deletion', ja: 'データ削除要求', zh: '数据抹除申请' },
    isPublic: true,
    authRequired: false,
    indexable: true,
    sitemapPriority: 0.3,
    changeFrequency: 'yearly',
    group: 'legal',
  },

  // === Member-Protected Core Screens (Excluded from Sitemap, Disallowed in robots.txt) ===
  {
    path: '/stocks',
    label: { ko: '가상 주식 거래소', en: 'Virtual Stocks', ja: '仮想株式取引所', zh: '虚拟股票交易所' },
    isPublic: true, // Market hub overview can be viewed
    authRequired: false,
    indexable: true,
    sitemapPriority: 0.9,
    changeFrequency: 'daily',
    group: 'finance',
  },
  {
    path: '/prediction',
    label: { ko: '예측 마켓', en: 'Prediction Market', ja: '予測市場', zh: '预测市场' },
    isPublic: true,
    authRequired: false,
    indexable: true,
    sitemapPriority: 0.85,
    changeFrequency: 'daily',
    group: 'finance',
  },
  {
    path: '/stocks/[symbol]',
    label: { ko: '종목 상세 거래', en: 'Stock Detail Trading', ja: '銘柄詳細取引', zh: '个股详情交易' },
    isPublic: false,
    authRequired: true,
    indexable: false,
    group: 'finance',
  },
  {
    path: '/bank',
    label: { ko: '가상 중앙은행', en: 'Virtual Bank', ja: '仮想中央銀行', zh: '虚拟中央银行' },
    isPublic: false,
    authRequired: true,
    indexable: false,
    group: 'finance',
  },
  {
    path: '/wallet',
    label: { ko: '내 지갑', en: 'My Wallet', ja: 'マイウォレット', zh: '我的钱包' },
    isPublic: false,
    authRequired: true,
    indexable: false,
    group: 'finance',
  },
  {
    path: '/casino',
    label: { ko: '카지노 7대 게임', en: 'Casino Games', ja: 'カジノゲーム', zh: '娱乐城7大游戏' },
    isPublic: false,
    authRequired: true,
    indexable: false,
    group: 'play',
  },
  {
    path: '/quests',
    label: { ko: '퀘스트 센터', en: 'Quest Center', ja: 'クエストセンター', zh: '任务中心' },
    isPublic: false,
    authRequired: true,
    indexable: false,
    group: 'play',
  },
  {
    path: '/seasons',
    label: { ko: '시즌 패스', en: 'Season Pass', ja: 'シーズンパス', zh: '赛季通行证' },
    isPublic: false,
    authRequired: true,
    indexable: false,
    group: 'play',
  },
  {
    path: '/work',
    label: { ko: '직업 및 커리어', en: 'Career & Work', ja: '職業と業務', zh: '工作与职业' },
    isPublic: false,
    authRequired: true,
    indexable: false,
    group: 'economy',
  },
  {
    path: '/businesses',
    label: { ko: '사업체 운영', en: 'Businesses', ja: '事業運営', zh: '商业运营' },
    isPublic: false,
    authRequired: true,
    indexable: false,
    group: 'economy',
  },
  {
    path: '/spaces',
    label: { ko: '개인공간 및 도시', en: 'Spaces & City', ja: '個人空間と都市', zh: '空间与城市项目' },
    isPublic: false,
    authRequired: true,
    indexable: false,
    group: 'economy',
  },
  {
    path: '/newspaper',
    label: { ko: 'AI 경제신문', en: 'Economic Newspaper', ja: 'AI経済新聞', zh: 'AI经济新闻' },
    isPublic: false,
    authRequired: true,
    indexable: false,
    group: 'economy',
  },
  {
    path: '/marketplace',
    label: { ko: '마켓플레이스', en: 'Marketplace', ja: 'マーケットプレイス', zh: '交易市场' },
    isPublic: false,
    authRequired: true,
    indexable: false,
    group: 'economy',
  },
  {
    path: '/marketplace/auction',
    label: { ko: 'P2P 아티팩트 경매장', en: 'P2P Artifact Auction', ja: 'P2Pオークション', zh: 'P2P拍卖行' },
    isPublic: true,
    authRequired: false,
    indexable: true,
    sitemapPriority: 0.8,
    changeFrequency: 'daily',
    group: 'economy',
  },
  {
    path: '/chat',
    label: { ko: '1:1 쪽지함', en: 'Direct Messages', ja: '1:1メッセージ', zh: '私信箱' },
    isPublic: false,
    authRequired: true,
    indexable: false,
    group: 'community',
  },
  {
    path: '/account',
    label: { ko: '계정 설정', en: 'Account Settings', ja: 'アカウント設定', zh: '账户设置' },
    isPublic: false,
    authRequired: true,
    indexable: false,
    group: 'auth',
  },
  {
    path: '/admin',
    label: { ko: '관리자 콘솔', en: 'Admin Console', ja: '管理者コンソール', zh: '管理控制台' },
    isPublic: false,
    authRequired: true,
    indexable: false,
    group: 'admin',
  },
] as const;

/**
 * Filter all public indexable routes suitable for sitemap.xml.
 */
export function getPublicSitemapRoutes(): readonly RouteDefinition[] {
  return APP_ROUTES.filter((r) => r.isPublic && r.indexable && r.sitemapPriority !== undefined);
}

/**
 * Filter all member-only / non-indexable routes for robots.txt Disallow directives.
 */
export function getDisallowedCrawlerRoutes(): string[] {
  const disallowed = APP_ROUTES.filter((r) => !r.isPublic || !r.indexable)
    .map((r) => r.path)
    .filter((p) => p !== '' && !p.includes('[')); // Exclude dynamic patterns which are handled separately

  return [
    ...disallowed,
    '/api/',
    '/stocks/*',
    '/admin/',
    '/account/',
  ];
}

/**
 * Check if a given pathname should be indexed by search crawlers.
 */
export function isPathIndexable(pathname: string): boolean {
  const clean = pathname.replace(/\/$/, '') || '';
  const match = APP_ROUTES.find((r) => r.path === clean);
  return match ? match.indexable : false;
}
