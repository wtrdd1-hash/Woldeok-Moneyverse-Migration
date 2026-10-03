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
    path: '/features',
    label: { ko: '핵심 기능 & 사용법 가이드', en: 'Features & Visual Guide', ja: '主要機能＆使い方ガイド', zh: '核心功能与操作指南' },
    isPublic: true,
    authRequired: false,
    indexable: true,
    sitemapPriority: 0.95,
    changeFrequency: 'weekly',
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
    path: '/guide/dopamine-system',
    label: { ko: '도파민 보상 & 확률 가이드', en: 'Dopamine & Probabilities Guide', ja: 'ドーパミン報酬ガイド', zh: '多巴胺奖励与概率指南' },
    isPublic: true,
    authRequired: false,
    indexable: true,
    sitemapPriority: 0.85,
    changeFrequency: 'daily',
    group: 'public',
  },
  {
    path: '/guide/stock-trading',
    label: { ko: '가상 주식 실전 매매 가이드', en: 'Virtual Stock Trading Guide', ja: '仮想株式実践取引ガイド', zh: '虚拟股票实战交易指南' },
    isPublic: true,
    authRequired: false,
    indexable: true,
    sitemapPriority: 0.85,
    changeFrequency: 'daily',
    group: 'public',
  },
  {
    path: '/guide/virtual-banking',
    label: { ko: '가상 금융 & 복리 예금 가이드', en: 'Virtual Banking & Compound Interest', ja: '仮想金融＆複利預金ガイド', zh: '虚拟金融与复利储蓄指南' },
    isPublic: true,
    authRequired: false,
    indexable: true,
    sitemapPriority: 0.85,
    changeFrequency: 'daily',
    group: 'public',
  },
  {
    path: '/guide/career-mastery',
    label: { ko: '직업 & 일일 파밍 루틴 가이드', en: 'Career Mastery & Farming Guide', ja: '職業＆デイリーファーミングガイド', zh: '职业与日常收益指南' },
    isPublic: true,
    authRequired: false,
    indexable: true,
    sitemapPriority: 0.85,
    changeFrequency: 'daily',
    group: 'public',
  },
  {
    path: '/guide/glossary',
    label: { ko: '핀테크 & 가상경제 핵심 용어사전', en: 'FinTech & Economy Glossary', ja: 'フィンテック＆仮想経済用語辞典', zh: '金融科技与虚拟经济术语词典' },
    isPublic: true,
    authRequired: false,
    indexable: true,
    sitemapPriority: 0.85,
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
    path: '/spaces',
    label: { ko: '개인 공간 & 인테리어 쇼룸', en: 'Personal Spaces', ja: 'パーソナルスペース', zh: '个人空间与装潢' },
    isPublic: true,
    authRequired: false,
    indexable: true,
    sitemapPriority: 0.85,
    changeFrequency: 'daily',
    group: 'public',
  },
  {
    path: '/spaces/real-estate',
    label: { ko: '가상 부동산 메가시티 랜드 분양', en: 'Virtual Real Estate Megacity', ja: '仮想不動産メガシティ', zh: '虚拟地产大都市' },
    isPublic: true,
    authRequired: false,
    indexable: true,
    sitemapPriority: 0.85,
    changeFrequency: 'daily',
    group: 'public',
  },
  {
    path: '/invite/[code]',
    label: { ko: '친구 초대 웰컴 랜딩', en: 'Friend Invite Welcome Landing', ja: '友達招待ウェルカムランディング', zh: '好友邀请专属迎新落地页' },
    isPublic: true,
    authRequired: false,
    indexable: true,
    sitemapPriority: 0.8,
    changeFrequency: 'daily',
    group: 'public',
  },
  {
    path: '/tools',
    label: { ko: '금융 & 시뮬레이터 도구 허브', en: 'Financial Tools Hub', ja: '金融ツールハブ', zh: '金融工具导航' },
    isPublic: true,
    authRequired: false,
    indexable: true,
    sitemapPriority: 0.9,
    changeFrequency: 'weekly',
    group: 'public',
  },
  {
    path: '/tools/compound-calculator',
    label: { ko: '복리 예금·적금 이자 계산기', en: 'Compound Interest Calculator', ja: '複利預金計算機', zh: '复利储蓄计算器' },
    isPublic: true,
    authRequired: false,
    indexable: true,
    sitemapPriority: 0.95,
    changeFrequency: 'daily',
    group: 'public',
  },
  {
    path: '/tools/compound-calculator/10m-3y-5p',
    label: { ko: '1천만원 3년 연 5% 복리 계산기', en: '10M 3Y 5% Compound Calculator', ja: '1000万3年5%複利計算機', zh: '1000万3年5%复利计算器' },
    isPublic: true,
    authRequired: false,
    indexable: true,
    sitemapPriority: 0.9,
    changeFrequency: 'daily',
    group: 'public',
  },
  {
    path: '/tools/compound-calculator/10m-5y-10p',
    label: { ko: '1천만원 5년 연 10% 복리 시뮬레이터', en: '10M 5Y 10% Compound Calculator', ja: '1000万5年10%複利計算機', zh: '1000万5年10%复利计算器' },
    isPublic: true,
    authRequired: false,
    indexable: true,
    sitemapPriority: 0.9,
    changeFrequency: 'daily',
    group: 'public',
  },
  {
    path: '/tools/compound-calculator/monthly-1m-5y',
    label: { ko: '월 100만원 5년 1억 모으기 적금 계산기', en: 'Monthly 1M 5Y Savings Calculator', ja: '月100万5年貯金計算機', zh: '月存100万5年储蓄计算器' },
    isPublic: true,
    authRequired: false,
    indexable: true,
    sitemapPriority: 0.9,
    changeFrequency: 'daily',
    group: 'public',
  },
  {
    path: '/tools/compound-calculator/50m-1y-7p',
    label: { ko: '5천만원 1년 연 7% 정기예금 이자', en: '50M 1Y 7% Deposit Calculator', ja: '5000万1年7%定期預金計算機', zh: '5000万1年7%定期存款计算器' },
    isPublic: true,
    authRequired: false,
    indexable: true,
    sitemapPriority: 0.9,
    changeFrequency: 'daily',
    group: 'public',
  },
  {
    path: '/tools/compound-calculator/100m-10y-15p',
    label: { ko: '1억원 10년 15% 가상 복리 투자 수익', en: '100M 10Y 15% Super Compound', ja: '1億10年15%スーパー複利', zh: '1亿10年15%超级复利' },
    isPublic: true,
    authRequired: false,
    indexable: true,
    sitemapPriority: 0.9,
    changeFrequency: 'daily',
    group: 'public',
  },
  {
    path: '/tools/stock-calculator',
    label: { ko: '주식 물타기·평단가 및 수익률 계산기', en: 'Stock Average Down Calculator', ja: '株式平均取得単価計算機', zh: '股票补仓均价计算器' },
    isPublic: true,
    authRequired: false,
    indexable: true,
    sitemapPriority: 0.95,
    changeFrequency: 'daily',
    group: 'public',
  },
  {
    path: '/tools/stock-calculator/chips-minus-20',
    label: { ko: '침팬지 반도체(CHIPS) -20% 물타기 계산기', en: 'CHIPS -20% Average Down Calculator', ja: 'CHIPS -20% 買増し計算機', zh: 'CHIPS -20% 补仓均价计算器' },
    isPublic: true,
    authRequired: false,
    indexable: true,
    sitemapPriority: 0.9,
    changeFrequency: 'daily',
    group: 'public',
  },
  {
    path: '/tools/stock-calculator/ducks-minus-50',
    label: { ko: '월덕 인더스트리(DUCKS) -50% 반토막 2배수 탈출', en: 'DUCKS -50% Double Down Escape', ja: 'DUCKS -50% 2倍買増し脱出', zh: 'DUCKS -50% 双倍补仓解套' },
    isPublic: true,
    authRequired: false,
    indexable: true,
    sitemapPriority: 0.9,
    changeFrequency: 'daily',
    group: 'public',
  },
  {
    path: '/tools/stock-calculator/coin-minus-30',
    label: { ko: '도지 밈 파이낸스(COIN) -30% 손익분기점 매도가', en: 'COIN -30% Break Even Exit', ja: 'COIN -30% 損益分岐点', zh: 'COIN -30% 保本卖出点' },
    isPublic: true,
    authRequired: false,
    indexable: true,
    sitemapPriority: 0.9,
    changeFrequency: 'daily',
    group: 'public',
  },
  {
    path: '/tools/farming-calculator',
    label: { ko: '직업별 일일 파밍 수익 최적화 시뮬레이터', en: 'Career Farming Routine Calculator', ja: '職業ファーミング計算機', zh: '职业日常收益计算器' },
    isPublic: true,
    authRequired: false,
    indexable: true,
    sitemapPriority: 0.9,
    changeFrequency: 'daily',
    group: 'public',
  },
  {
    path: '/tools/farming-calculator/intern-vs-executive',
    label: { ko: '인턴 vs 임원 일일 수익 17배 비교', en: 'Intern vs Executive Farming Yield', ja: 'インターン vs 役員収益比較', zh: '实习生 vs 高管收益对比' },
    isPublic: true,
    authRequired: false,
    indexable: true,
    sitemapPriority: 0.85,
    changeFrequency: 'daily',
    group: 'public',
  },
  {
    path: '/tools/goal-wealth-calculator',
    label: { ko: '목표 자산·은퇴·FIRE 달성 계산기', en: 'FIRE & Wealth Goal Calculator', ja: '目標資産・FIRE計算機', zh: '目标资产与提前退休计算器' },
    isPublic: true,
    authRequired: false,
    indexable: true,
    sitemapPriority: 0.95,
    changeFrequency: 'daily',
    group: 'public',
  },
  {
    path: '/tools/tax-calculator',
    label: { ko: '가상자산·금융투자 세금 계산기', en: 'Crypto & Investment Tax Calculator', ja: '暗号資産・金融投資税金計算機', zh: '加密资产与金融投资税收计算器' },
    isPublic: true,
    authRequired: false,
    indexable: true,
    sitemapPriority: 0.95,
    changeFrequency: 'daily',
    group: 'public',
  },
  {
    path: '/tools/farming-calculator/daily-100k-farming-route',
    label: { ko: '하루 10만 WLD 4시간 파밍 루트', en: 'Daily 100k WLD 4h Routine', ja: '1日10万WLD攻略ルーティン', zh: '日入10万WLD 4小时速刷攻略' },
    isPublic: true,
    authRequired: false,
    indexable: true,
    sitemapPriority: 0.85,
    changeFrequency: 'daily',
    group: 'public',
  },
  {
    path: '/newspaper',
    label: { ko: 'AI 경제 브리프 & 시황 뉴스', en: 'Daily Economy News', ja: 'デイリー経済ニュース', zh: '每日经济早报' },
    isPublic: true,
    authRequired: false,
    indexable: true,
    sitemapPriority: 0.85,
    changeFrequency: 'daily',
    group: 'public',
  },
  {
    path: '/marketplace/auction',
    label: { ko: 'P2P 실시간 아이템 경매장', en: 'P2P Live Auctions', ja: 'P2Pライブオークション', zh: 'P2P实时拍卖行' },
    isPublic: true,
    authRequired: false,
    indexable: true,
    sitemapPriority: 0.85,
    changeFrequency: 'daily',
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

  // === 5대 차세대 신규 가상경제 & 금융 도메인 (Public SEO Landing Hubs) ===
  {
    path: '/spaces/real-estate',
    label: { ko: '가상 부동산 랜드 임대 거래소', en: 'Virtual Real Estate & Land', ja: '仮想不動産ランド取引所', zh: '虚拟房地产与土地交易所' },
    isPublic: true,
    authRequired: false,
    indexable: true,
    sitemapPriority: 0.95,
    changeFrequency: 'daily',
    group: 'economy',
  },
  {
    path: '/stocks/derivatives',
    label: { ko: '10X 레버리지 가상 파생상품 선물', en: '10X Leverage Virtual Derivatives', ja: '10倍レバレッジ仮想先物', zh: '10倍杠杆虚拟衍生品期货' },
    isPublic: true,
    authRequired: false,
    indexable: true,
    sitemapPriority: 0.95,
    changeFrequency: 'daily',
    group: 'finance',
  },
  {
    path: '/businesses/ventures',
    label: { ko: '스타트업 VC 엔젤투자 & 펀딩', en: 'Startup VC Angel Investment', ja: 'スタートアップVCエンジェル投資', zh: '初创企业VC天使投资与众筹' },
    isPublic: true,
    authRequired: false,
    indexable: true,
    sitemapPriority: 0.9,
    changeFrequency: 'daily',
    group: 'economy',
  },
  {
    path: '/clubs/warfare',
    label: { ko: '디스코드 길드 영지 공성전', en: 'Discord Guild Territory Warfare', ja: 'Discordギルド領地攻城戦', zh: 'Discord公会领地攻城战' },
    isPublic: true,
    authRequired: false,
    indexable: true,
    sitemapPriority: 0.9,
    changeFrequency: 'daily',
    group: 'community',
  },
  {
    path: '/tools/quant-studio',
    label: { ko: '노코드 퀀트 봇 스튜디오', en: 'No-Code Quant Bot Studio', ja: 'ノーコードクオンツBotスタジオ', zh: '无代码量化策略Bot工作室' },
    isPublic: true,
    authRequired: false,
    indexable: true,
    sitemapPriority: 0.9,
    changeFrequency: 'daily',
    group: 'finance',
  },
  {
    path: '/casino',
    label: { ko: '럭키 룰렛 & 엔터테인먼트 허브', en: 'Lucky Roulette & Casino Hub', ja: 'ラッキールーレット＆カジノ', zh: '幸运轮盘与游戏中心' },
    isPublic: true,
    authRequired: false,
    indexable: true,
    sitemapPriority: 0.85,
    changeFrequency: 'daily',
    group: 'play',
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
    label: { ko: '가상 종목 실시간 시세 & 호가', en: 'Stock Live Quote & Orderbook', ja: '銘柄リアルタイム気配値', zh: '虚拟个股行情与买卖档' },
    isPublic: true,
    authRequired: false,
    indexable: true,
    sitemapPriority: 0.9,
    changeFrequency: 'daily',
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
    path: '/bank/savings-pot',
    label: { ko: '4인 공동 저축 챌린지 팟', en: '4-Player Savings Pot', ja: '4人共同貯蓄ポット', zh: '4人储蓄挑战池' },
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
    path: '/progression/prestige',
    label: { ko: '프레스티지 환생', en: 'Prestige Rebirth', ja: 'プレステージ転生', zh: '声望转生系统' },
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
    path: '/marketplace',
    label: { ko: '마켓플레이스', en: 'Marketplace', ja: 'マーケットプレイス', zh: '交易市场' },
    isPublic: false,
    authRequired: true,
    indexable: false,
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
  {
    path: '/admin/seo',
    label: { ko: 'SEO 및 인덱싱 관제', en: 'SEO & Indexing Console', ja: 'SEO＆インデックス監視', zh: 'SEO与索引控制台' },
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
 * Strictly prevents blocking public sub-routes (e.g. /spaces/real-estate).
 */
export function getDisallowedCrawlerRoutes(): string[] {
  return [
    '/admin',
    '/admin/',
    '/api/',
    '/auth/',
    '/developer',
    '/account',
    '/account/',
    '/chat',
    '/gallery/submit',
    '/status',
    '/quests',
    '/businesses',
    '/bank',
    '/wallet',
    '/work',
    '/seasons',
    '/bank/savings-pot',
    '/progression/prestige',
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

