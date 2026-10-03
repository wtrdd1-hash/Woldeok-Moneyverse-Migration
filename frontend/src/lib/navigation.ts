import type { Locale } from './locale';

export interface NavEntry {
  readonly href: string;
  readonly label: string;
}

export interface NavCategoryEntry extends NavEntry {
  readonly description?: string;
  readonly badge?: string;
}

export interface NavCategory {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly description: string;
  readonly entries: readonly NavCategoryEntry[];
}

export interface NavGroup {
  readonly label: string;
  readonly entries: readonly NavEntry[];
}

export type NavItem = NavEntry | NavGroup;

export function isGroup(item: NavItem): item is NavGroup {
  return 'entries' in item;
}

const ENGLISH_LABELS: Readonly<Record<string, string>> = {
  // Top-level categories & Masthead
  '홈': 'Home',
  '거래소': 'Exchange',
  '월덕거래소': 'Woldeok Exchange',
  '경제 브리프': 'Economy Brief',
  '주간 경제 브리프': 'Weekly Economy Brief',
  '자산': 'Assets',
  '덕지갑': 'Wallet',
  '커뮤니티': 'Community',
  '안내': 'Guide',
  '가이드 & 사용법': 'Guides & Tutorials',
  '실전 성장 로드맵': 'Growth Roadmap',
  '6대 핵심 기능 조작법': '6 Core Features Guide',
  '핵심 기능 안내': 'Visual Features Guide',
  '기능 안내': 'Features Guide',
  'AI 투자 성향 진단': 'AI Investor Profile',

  '내 대시보드': 'Dashboard',

  '활동': 'Activity',
  '소식': 'News',
  '운영': 'Operations',
  '마스터 콘솔': 'Master Console',

  // Mega Navigation 4 Main Categories
  '금융·투자': 'Finance & Investment',
  '경제·활동': 'Economy & Careers',
  '플레이·시즌': 'Games & Seasons',

  // Sub-items & Detail Links
  '월덕거래소 (주식)': 'Woldeok Exchange (Stocks)',
  '가상 주식': 'Virtual Stocks',
  '가상 금융': 'Virtual Banking',
  '가상 은행': 'Virtual Bank',
  '가상 금융 (은행)': 'Virtual Banking (Bank)',
  '자산 활동 내역': 'Asset Activity',
  '잡보드 (직업)': 'Job Board (Careers)',
  '잡보드 (작업)': 'Job Board (Work)',
  '직업 업무': 'Career Work',
  '마이비즈 (사업)': 'MyBiz (Enterprise)',
  '게임 사업': 'Game Businesses',
  '덕마켓 (상점)': 'Item Shop',
  '아이템 상점': 'Item Shop',
  '커리어패스 (성장)': 'Career Path',
  '장기 성장 단계': 'Progression',
  '퀘스트': 'Quests',
  '일일·주간 퀘스트': 'Daily & Weekly Quests',
  '럭키존 (카지노)': 'Lucky Zone (Casino)',
  '카지노': 'Casino',
  '월드사이클 (시즌)': 'World Cycle (Seasons)',
  '시즌': 'Seasons',
  '이벤트 일정': 'Event Calendar',
  '일정': 'Calendar',
  '클럽·협동조합': 'Clubs & Co-ops',
  '컬렉션 전시관': 'Collections',
  '개인 공간 & 도시': 'Spaces & City',
  '커뮤니티 게시판': 'Community Board',
  '개발자 포털': 'Developer Portal',
  '사진 갤러리': 'Photo Gallery',
  '사진': 'Photos',
  '운영 소식': 'Announcements',
  '이용 가이드': 'User Guide',
  '이용 방법': 'User Guide',
  '1:1 관리자 문의': '1:1 Support Ticket',
  '관리자 문의': 'Support Ticket',
  '서비스 상태': 'System Status',
  '이용약관': 'Terms of Service',
  '개인정보처리방침': 'Privacy Policy',
  '내 프로필': 'My Profile',
  '쪽지함': 'Direct Messages',
  '계정 보안': 'Security',
  '환경설정': 'Preferences',

  // Admin Items
  '문의 채팅': 'Support Chats',
  '경제': 'Economy',
  '콘텐츠': 'Content',
  '감사 로그': 'Audit Logs',
};

const JAPANESE_LABELS: Readonly<Record<string, string>> = {
  // Top-level categories & Masthead
  '홈': 'ホーム',
  '거래소': '取引所',
  '월덕거래소': 'ウォルドク取引所',
  '경제 브리프': '経済ブリーフ',
  '주간 경제 브리프': '週間経済ブリーフ',
  '자산': '資産',
  '덕지갑': 'ウォレット',
  '커뮤니티': 'コミュニティ',
  '안내': 'ガイド',
  '가이드 & 사용법': 'ガイド＆使い方',
  '실전 성장 로드맵': '実践ロードマップ',
  '6대 핵심 기능 조작법': '6大機能操作ガイド',
  '핵심 기능 안내': '機能案内',
  '기능 안내': '機能案内',
  'AI 투자 성향 진단': 'AI投資傾向診断',
  '내 대시보드': 'マイダッシュボード',
  '활동': 'アクティビティ',
  '소식': 'お知らせ',
  '운영': '運営',
  '마스터 콘솔': 'マスターコンソール',

  // Mega Navigation 4 Main Categories
  '금융·투자': '金融・投資',
  '경제·활동': '経済・活動',
  '플레이·시즌': 'ゲーム・シーズン',

  // Sub-items & Detail Links
  '월덕거래소 (주식)': 'ウォルドク取引所（株式）',
  '가상 주식': '仮想株式',
  '가상 금융': '仮想金融',
  '가상 은행': '仮想銀行',
  '가상 금융 (은행)': '仮想金融（銀行）',
  '자산 활동 내역': '資産活動履歴',
  '잡보드 (직업)': 'ジョブボード（職業）',
  '잡보드 (작업)': 'ジョブボード（作業）',
  '직업 업무': '職業業務',
  '마이비즈 (사업)': 'マイビズ（事業）',
  '게임 사업': 'ゲーム事業',
  '덕마켓 (상점)': 'アイテムショップ',
  '아이템 상점': 'アイテムショップ',
  '커리어패스 (성장)': 'キャリアパス',
  '장기 성장 단계': '長期成長ステージ',
  '퀘스트': 'クエスト',
  '일일·주간 퀘스트': 'デイリー・ウィークリークエスト',
  '럭키존 (카지노)': 'ラッキーゾーン（カジノ）',
  '카지노': 'カジノ',
  '월드사이클 (시즌)': 'ワールドサイクル（シーズン）',
  '시즌': 'シーズン',
  '이벤트 일정': 'イベント日程',
  '일정': '日程',
  '클럽·협동조합': 'クラブ・協同組合',
  '컬렉션 전시관': 'コレクション展示館',
  '개인 공간 & 도시': '個人スペース・都市',
  '커뮤니티 게시판': 'コミュニティ掲示板',
  '개발자 포털': '開発者ポータル',
  '사진 갤러리': '写真ギャラリー',
  '사진': '写真',
  '운영 소식': '運営ニュース',
  '이용 가이드': '利用ガイド',
  '이용 방법': '利用方法',
  '1:1 관리자 문의': '1:1 お問い合わせ',
  '관리자 문의': 'お問い合わせ',
  '서비스 상태': 'サービス状態',
  '이용약관': '利用規約',
  '개인정보처리방침': 'プライバシーポリシー',
  '내 프로필': 'マイプロフィール',
  '쪽지함': 'メッセージ',
  '계정 보안': 'セキュリティ',
  '환경설정': '環境設定',
  '문의 채팅': 'チャット対応',
  '경제': '経済',
  '콘텐츠': 'コンテンツ',
  '감사 로그': '監査ログ',
};

const CHINESE_LABELS: Readonly<Record<string, string>> = {
  // Top-level categories & Masthead
  '홈': '首页',
  '거래소': '交易所',
  '월덕거래소': '月德交易所',
  '경제 브리프': '经济简报',
  '주간 경제 브리프': '每周经济简报',
  '자산': '资产',
  '덕지갑': '钱包',
  '커뮤니티': '社区',
  '안내': '指南',
  '가이드 & 사용법': '指南与教程',
  '실전 성장 로드맵': '实战成长路线图',
  '6대 핵심 기능 조작법': '6大核心功能操作指南',
  '핵심 기능 안내': '核心功能指南',
  '기능 안내': '功能指南',
  'AI 투자 성향 진단': 'AI投资偏好诊断',
  '내 대시보드': '我的仪表盘',
  '활동': '活动',
  '소식': '消息',
  '운영': '管理运营',
  '마스터 콘솔': '主控制台',

  // Mega Navigation 4 Main Categories
  '금융·투자': '金融·投资',
  '경제·활동': '经济·活动',
  '플레이·시즌': '游戏·赛季',

  // Sub-items & Detail Links
  '월덕거래소 (주식)': '月德交易所（股票）',
  '가상 주식': '虚拟股票',
  '가상 금융': '虚拟金融',
  '가상 은행': '虚拟银行',
  '가상 금융 (은행)': '虚拟金融（银行）',
  '자산 활동 내역': '资产活动明细',
  '잡보드 (직업)': '工作板（职业）',
  '잡보드 (작업)': '工作板（作业）',
  '직업 업무': '职业工作',
  '마이비즈 (사업)': '我的企业（商业）',
  '게임 사업': '游戏事业',
  '덕마켓 (상점)': '道具商城',
  '아이템 상점': '道具商城',
  '커리어패스 (성장)': '职业进阶',
  '장기 성장 단계': '成长历程',
  '퀘스트': '任务',
  '일일·주간 퀘스트': '每日/每周任务',
  '럭키존 (카지노)': '幸运区（娱乐）',
  '카지노': '娱乐场',
  '월드사이클 (시즌)': '世界周期（赛季）',
  '시즌': '赛季',
  '이벤트 일정': '活动日程',
  '일정': '日程',
  '클럽·협동조합': '俱乐部·公会',
  '컬렉션 전시관': '藏品展览馆',
  '개인 공간 & 도시': '个人空间·城市',
  '커뮤니티 게시판': '社区论坛',
  '개발자 포털': '开发者门户',
  '사진 갤러리': '照片画廊',
  '사진': '照片',
  '운영 소식': '官方公告',
  '이용 가이드': '使用指南',
  '이용 방법': '使用方法',
  '1:1 관리자 문의': '1对1 在线客服',
  '관리자 문의': '客服咨询',
  '서비스 상태': '服务状态',
  '이용약관': '服务条款',
  '개인정보처리방침': '隐私政策',
  '내 프로필': '个人主页',
  '쪽지함': '私信箱',
  '계정 보안': '安全设置',
  '환경설정': '偏好设置',
  '문의 채팅': '客服对话',
  '경제': '经济控制',
  '콘텐츠': '内容管理',
  '감사 로그': '审计日志',
};

const ENGLISH_DESCRIPTIONS: Readonly<Record<string, string>> = {
  '가상 주식 매매, 덕지갑 자산 관리, 가상 은행 금융 상품, 주간 경제 브리프': 'Virtual stock trading, wallet assets, banking yield products, weekly briefs',
  '직업 업무 수행, 법인 사업체 운영, 아이템 상점 및 커리어': 'Daily career work, corporate business operations, item shop & progression',
  '월드 시즌 패스, 경제 일정 및 소셜 클럽': 'World season passes, economic calendar & social clubs',
  '회원 간 커뮤니티, 사진 갤러리 및 공지사항': 'Community forum, photo gallery & official announcements',
  '실시간 가상 주식 매매 및 차트 호가': 'Real-time virtual stock orderbook & chart trading',
  '실시간 월드 펄스 및 AI 시장 시나리오 속보': 'Real-time World Pulse & AI market scenario breaking news',
  '총 보유 자산 현황 및 즉시 송금': 'Total net worth overview & instant peer transfers',
  '예적금 이자 수령 및 대출 상품': 'Savings deposit yield claiming & credit loan products',
  '수익 및 지출 원장 타임라인': 'Income & expense ledger transaction timeline',
  '일일 업무 수행 및 WLD 보상 획득': 'Execute daily shifts & earn WLD career rewards',
  '사업체 인수, 수익 일괄 정산 및 부스트': 'Acquire enterprises, batch claim revenue & boost efficiency',
  '인벤토리 장비 및 소비 아이템 구매': 'Purchase inventory equipment & consumable utility items',
  '숙련도 성장 단계 및 전직 해금': 'Proficiency mastery progression & career promotions',
  '일일 및 주간 미션 달성 추가 보상': 'Daily & weekly quest missions with bonus rewards',
  '시즌 랭킹, 미션 패스 및 한정 보상': 'Seasonal leaderboard rankings, battle pass & limited rewards',
  '경제 이벤트 및 시장 일정 캘린더': 'Economic events & market schedule calendar',
  '유저 길드 창설, 가입 및 협동 펀딩': 'Found or join user guilds & co-op venture funding',
  '소장품 전시관 및 D1~D7 리텐션 큐레이션': 'Rare collectibles showcase & retention curations',
  '가상 도시 부지 및 개인 룸 공간': 'Virtual mega-city parcels & personal spaces',
  '전체 회원 자유 토론 및 정보 공유': 'Member discussions & financial market insights',
  '회원 일상 및 월덕 인증샷 갤러리': 'Community lifestyle & verified photo gallery',
  '패치노트, 이벤트 및 시스템 점검 공지': 'Patch notes, events & maintenance notices',
  '초보자 튜토리얼 및 시스템 가이드': 'Getting started tutorials & game system guides',
  '운영진 1:1 고객지원 문의 접수': 'Official 1:1 admin support & ticket desk',
};

const JAPANESE_DESCRIPTIONS: Readonly<Record<string, string>> = {
  '가상 주식 매매, 덕지갑 자산 관리, 가상 은행 금융 상품, 주간 경제 브리프': '仮想株式取引、ウォレット資産管理、仮想銀行金融商品、週間経済ブリーフ',
  '직업 업무 수행, 법인 사업체 운영, 아이템 상점 및 커리어': '職業業務遂行、法人事業体運営、アイテムショップおよびキャリア',
  '월드 시즌 패스, 경제 일정 및 소셜 클럽': 'ワールドシーズンパス、経済日程およびソーシャルクラブ',
  '회원 간 커뮤니티, 사진 갤러리 및 공지사항': 'コミュニティ掲示板、写真ギャラリーおよび公式お知らせ',
  '실시간 가상 주식 매매 및 차트 호가': 'リアルタイム仮想株式売買および板気配値チャート',
  '실시간 월드 펄스 및 AI 시장 시나리오 속보': 'リアルタイム・ワールドパルス＆AI市場シナリオ速報',
  '총 보유 자산 현황 및 즉시 송금': '総保有資産状況および即時送金',
  '예적금 이자 수령 및 대출 상품': '預金・積立利息受取および融資商品',
  '수익 및 지출 원장 타임라인': '収益・支出元帳タイムライン',
  '일일 업무 수행 및 WLD 보상 획득': '日々の業務遂行およびWLD報酬獲得',
  '사업체 인수, 수익 일괄 정산 및 부스트': '事業体の買収、収益一括精算およびブースト',
  '인벤토리 장비 및 소비 아이템 구매': 'インベントリ装備および消費アイテムの購入',
  '숙련도 성장 단계 및 전직 해금': '熟練度成長ステージおよび転職アンロック',
  '일일 및 주간 미션 달성 추가 보상': 'デイリー＆ウィークリーミッション達成の追加報酬',
  '시즌 랭킹, 미션 패스 및 한정 보상': 'シーズンランキング、ミッションパスおよび限定報酬',
  '경제 이벤트 및 시장 일정 캘린더': '経済イベントおよび市場日程カレンダー',
  '유저 길드 창설, 가입 및 협동 펀딩': 'ギルド創設・加入および協同ファンディング',
  '소장품 전시관 및 D1~D7 리텐션 큐레이션': 'コレクション展示館およびリテンション・キュレーション',
  '가상 도시 부지 및 개인 룸 공간': '仮想メガシティ区画および個人スペース',
  '전체 회원 자유 토론 및 정보 공유': '全会員の自由討論および情報共有',
  '회원 일상 및 월덕 인증샷 갤러리': '会員の日常および認証ショットギャラリー',
  '패치노트, 이벤트 및 시스템 점검 공지': 'パッチノート、イベントおよびメンテナンス告知',
  '초보자 튜토리얼 및 시스템 가이드': '初心者チュートリアルおよびシステムガイド',
  '운영진 1:1 고객지원 문의 접수': '運営1:1サポート受付',
};

const CHINESE_DESCRIPTIONS: Readonly<Record<string, string>> = {
  '가상 주식 매매, 덕지갑 자산 관리, 가상 은행 금융 상품, 주간 경제 브리프': '虚拟股票交易、钱包资产管理、虚拟银行金融产品、每周经济简报',
  '직업 업무 수행, 법인 사업체 운영, 아이템 상점 및 커리어': '职业工作执行、法人企业运营、道具商城及职业进阶',
  '월드 시즌 패스, 경제 일정 및 소셜 클럽': '世界赛季通行证、经济日程及社交俱乐部',
  '회원 간 커뮤니티, 사진 갤러리 및 공지사항': '社区论坛、照片画廊及官方公告',
  '실시간 가상 주식 매매 및 차트 호가': '实时虚拟股票买卖及委托盘图表',
  '실시간 월드 펄스 및 AI 시장 시나리오 속보': '实时世界脉搏与AI市场情景快讯',
  '총 보유 자산 현황 및 즉시 송금': '总资产概览及即时转账',
  '예적금 이자 수령 및 대출 상품': '储蓄存款利息领取及贷款产品',
  '수익 및 지출 원장 타임라인': '收益与支出账本时间线',
  '일일 업무 수행 및 WLD 보상 획득': '执行每日工作并获取WLD报酬',
  '사업체 인수, 수익 일괄 정산 및 부스트': '收购企业、批量结算收益及加速提升',
  '인벤토리 장비 및 소비 아이템 구매': '购买背包装备及消耗品道具',
  '숙련도 성장 단계 및 전직 해금': '熟练度成长阶段及转职解锁',
  '일일 및 주간 미션 달성 추가 보상': '每日及每周任务达成额外奖励',
  '시즌 랭킹, 미션 패스 및 한정 보상': '赛季排行榜、任务通行证及限定奖励',
  '경제 이벤트 및 시장 일정 캘린더': '经济事件及市场日程日历',
  '유저 길드 창설, 가입 및 협동 펀딩': '创建或加入公会及协同众筹',
  '소장품 전시관 및 D1~D7 리텐션 큐레이션': '藏品展览馆及留存精选',
  '가상 도시 부지 및 개인 룸 공간': '虚拟大都市地块及个人空间',
  '전체 회원 자유 토론 및 정보 공유': '全体会员自由讨论与见解分享',
  '회원 일상 및 월덕 인증샷 갤러리': '会员日常及认证照片画廊',
  '패치노트, 이벤트 및 시스템 점검 공지': '更新日志、活动及维护公告',
  '초보자 튜토리얼 및 시스템 가이드': '新手教程及系统指南',
  '운영진 1:1 고객지원 문의 접수': '官方1对1客服咨询受理',
};

const ENGLISH_BADGES: Readonly<Record<string, string>> = {
  '인기': 'HOT',
  '필수': 'CORE',
  '금융': 'BANK',
  'HOT': 'HOT',
  'NEW': 'NEW',
};

const JAPANESE_BADGES: Readonly<Record<string, string>> = {
  '인기': '人気',
  '필수': '必須',
  '금융': '金融',
  'HOT': 'HOT',
  'NEW': 'NEW',
};

const CHINESE_BADGES: Readonly<Record<string, string>> = {
  '인기': '热门',
  '필수': '必做',
  '금융': '金融',
  'HOT': 'HOT',
  'NEW': 'NEW',
};

export function navLabel(label: string, locale: Locale): string {
  if (locale === 'ja') return JAPANESE_LABELS[label] ?? ENGLISH_LABELS[label] ?? label;
  if (locale === 'zh') return CHINESE_LABELS[label] ?? ENGLISH_LABELS[label] ?? label;
  if (locale === 'en') return ENGLISH_LABELS[label] ?? label;
  return label;
}

export function navCategoryDescription(description: string, locale: Locale): string {
  if (locale === 'ja') return JAPANESE_DESCRIPTIONS[description] ?? ENGLISH_DESCRIPTIONS[description] ?? description;
  if (locale === 'zh') return CHINESE_DESCRIPTIONS[description] ?? ENGLISH_DESCRIPTIONS[description] ?? description;
  if (locale === 'en') return ENGLISH_DESCRIPTIONS[description] ?? description;
  return description;
}

export function navCategoryBadge(badge: string, locale: Locale): string {
  if (locale === 'ja') return JAPANESE_BADGES[badge] ?? badge;
  if (locale === 'zh') return CHINESE_BADGES[badge] ?? badge;
  if (locale === 'en') return ENGLISH_BADGES[badge] ?? badge;
  return badge;
}

/**
 * 5 Major Category Mega Navigation for Modern FinTech Super-App
 */
export const CATEGORY_NAV: readonly NavCategory[] = [
  {
    id: 'finance',
    label: '금융·투자',
    icon: 'TrendingUp',
    description: '가상 주식 매매, 덕지갑 자산 관리, 가상 은행 금융 상품, 주간 경제 브리프',
    entries: [
      { href: '/stocks', label: '월덕거래소', description: '실시간 가상 주식 매매 및 차트 호가', badge: '인기' },
      { href: '/newspaper', label: '주간 경제 브리프', description: '실시간 월드 펄스 및 AI 시장 시나리오 속보', badge: 'NEW' },
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
    description: '월드 시즌 패스, 경제 일정 및 소셜 클럽',
    entries: [
      { href: '/seasons', label: '월드사이클 (시즌)', description: '시즌 랭킹, 미션 패스 및 한정 보상', badge: 'HOT' },
      { href: '/calendar', label: '이벤트 일정', description: '경제 이벤트 및 시장 일정 캘린더' },
      { href: '/clubs', label: '클럽·협동조합', description: '유저 길드 창설, 가입 및 협동 펀딩' },
      { href: '/collections', label: '컬렉션 전시관', description: '소장품 전시관 및 D1~D7 리텐션 큐레이션', badge: 'NEW' },
      { href: '/spaces', label: '개인 공간 & 도시', description: '가상 도시 부지 및 개인 룸 공간' },
    ],
  },
  {
    id: 'community',
    label: '커뮤니티',
    icon: 'MessageSquare',
    description: '자유 토론 게시판, 사진 갤러리, 운영 소식 및 1:1 고객지원',
    entries: [
      { href: '/roadmap', label: '실전 성장 로드맵', description: '초반·중반·후반 3단계 영상 시뮬레이터와 함께하는 완벽 입문 가이드', badge: 'HOT' },
      { href: '/features', label: '핵심 기능 안내', description: '실제 화면 스크린샷과 함께 보는 6대 기능 완벽 조작법', badge: 'NEW' },
      { href: '/board', label: '커뮤니티 게시판', description: '종목 토론, 자유 소통 및 정보 공유' },

      { href: '/gallery', label: '사진 갤러리', description: '유저 인증샷 및 미디어 갤러리' },
      { href: '/announcements', label: '운영 소식', description: '시스템 패치 노트 및 공식 공지사항' },
      { href: '/guide', label: '이용 가이드', description: '3분 입문 로드맵, 모의 자산 시뮬레이터 & 온보딩 퀘스트', badge: '인기' },
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
  { href: '/newspaper', label: '경제 브리프' },
  { href: '/wallet', label: '자산' },
  { href: '/board', label: '커뮤니티' },
];

/** Readable by anyone, indexed, and the only group a signed-out visitor sees. */
export const PUBLIC_NAV: readonly NavEntry[] = [
  { href: '/', label: '홈' },
  { href: '/roadmap', label: '실전 성장 로드맵' },
  { href: '/features', label: '6대 핵심 기능 조작법' },
  { href: '/guide', label: '이용 가이드' },
  { href: '/stocks', label: '거래소' },
  { href: '/newspaper', label: '주간 경제 브리프' },
  { href: '/wallet', label: '자산' },
  { href: '/board', label: '커뮤니티' },
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
  { href: '/roadmap', label: '실전 성장 로드맵' },
  { href: '/features', label: '6대 핵심 기능 조작법' },
  { href: '/newspaper', label: '주간 경제 브리프' },
  { href: '/wallet', label: '덕지갑' },
  { href: '/bank', label: '가상 금융 (은행)' },
  { href: '/work', label: '잡보드 (작업)' },
  { href: '/stocks', label: '월덕거래소 (주식)' },
  { href: '/businesses', label: '마이비즈 (사업)' },
  { href: '/shop', label: '아이템 상점' },
  { href: '/seasons', label: '월드사이클 (시즌)' },
  { href: '/quests', label: '퀘스트' },
  { href: '/calendar', label: '이벤트 일정' },
  { href: '/progression', label: '장기 성장 단계' },
  { href: '/clubs', label: '클럽·협동조합' },
  { href: '/collections', label: '컬렉션 전시관' },
  { href: '/spaces', label: '개인 공간 & 도시' },
  { href: '/board', label: '커뮤니티 게시판' },
  { href: '/gallery', label: '사진 갤러리' },
  { href: '/announcements', label: '운영 소식' },
  { href: '/support', label: '1:1 관리자 문의' },
  { href: '/profile', label: '내 프로필' },
  { href: '/chat', label: '쪽지함' },
];

/**
 * Console paths that stay under the console session gate.
 */
export const ADMIN_NAV: readonly NavEntry[] = [
  { href: '/admin', label: '마스터 콘솔' },
  { href: '/admin/users', label: '회원 관리' },
  { href: '/admin/security', label: '보안·차단' },
  { href: '/admin/support', label: '문의 채팅' },
  { href: '/admin/economy', label: '경제·원장' },
  { href: '/admin/treasury', label: '국고·비축' },
  { href: '/admin/catalog', label: '사업·시즌' },
  { href: '/admin/work', label: '작업·직업' },
  { href: '/admin/shop', label: '상점 관리' },
  { href: '/admin/logs', label: '감사 로그' },
  { href: '/admin/controls', label: '기능 스위치' },
  { href: '/admin/content', label: '공지·갤러리' },
  { href: '/admin/discord', label: 'Discord' },
  { href: '/admin/bank', label: '은행·대출' },
  { href: '/admin/market', label: '가상 시장' },
  { href: '/admin/safety', label: '안전·삭제' },
  { href: '/developer', label: '개발자 포털' },
];

export const HEADER_PUBLIC: readonly NavItem[] = [
  { href: '/', label: '홈' },
  {
    label: '가이드 & 사용법',
    entries: [
      { href: '/roadmap', label: '실전 성장 로드맵' },
      { href: '/features', label: '6대 핵심 기능 조작법' },
      { href: '/guide', label: '이용 가이드' },
    ],
  },
  {
    label: '금융·투자',
    entries: [
      { href: '/stocks', label: '월덕거래소' },
      { href: '/newspaper', label: '주간 경제 브리프' },
      { href: '/wallet', label: '덕지갑' },
      { href: '/bank', label: '가상 은행' },
      { href: '/wallet/activity', label: '자산 활동 내역' },
    ],
  },
  {
    label: '경제·활동',
    entries: [
      { href: '/work', label: '잡보드 (직업)' },
      { href: '/businesses', label: '마이비즈 (사업)' },
      { href: '/shop', label: '덕마켓 (상점)' },
      { href: '/progression', label: '커리어패스 (성장)' },
      { href: '/quests', label: '퀘스트' },
    ],
  },
  {
    label: '플레이·시즌',
    entries: [
      { href: '/seasons', label: '월드사이클 (시즌)' },
      { href: '/calendar', label: '이벤트 일정' },
      { href: '/clubs', label: '클럽·협동조합' },
      { href: '/collections', label: '컬렉션 전시관' },
      { href: '/spaces', label: '개인 공간 & 도시' },
    ],
  },
  {
    label: '커뮤니티',
    entries: [
      { href: '/board', label: '커뮤니티 게시판' },
      { href: '/gallery', label: '사진 갤러리' },
      { href: '/announcements', label: '운영 소식' },
      { href: '/guide', label: '이용 가이드' },
      { href: '/support', label: '1:1 관리자 문의' },
    ],
  },
];

export const HEADER_MEMBER: readonly NavItem[] = [
  { href: '/dashboard', label: '내 대시보드' },
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
      { href: '/developer', label: '개발자 포털' },
    ],
  },
];

/** True when the reader is inside any of a group's destinations. */
export function isGroupActive(group: NavGroup, pathname: string): boolean {
  return group.entries.some(
    (entry) => pathname === entry.href || pathname.startsWith(`${entry.href}/`),
  );
}

export function isGroupCurrent(pathname: string, group: NavGroup): boolean {
  return group.entries.some(
    (entry) => pathname === entry.href || (entry.href !== '/' && pathname.startsWith(`${entry.href}/`)),
  );
}

export function isCurrent(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** The nav item the reader is looking at, or null when off-menu. */
export function activeNavItem(items: readonly NavItem[], pathname: string): NavItem | null {
  for (const item of items) {
    if (isGroup(item)) {
      if (isGroupActive(item, pathname)) return item;
    } else if (item.href === pathname || (item.href !== '/' && pathname.startsWith(item.href))) {
      return item;
    }
  }
  return null;
}
