/**
 * The operations console's areas.
 *
 * One list, read by the overview that links to them and by each page that
 * titles itself from its own entry, so a name cannot say one thing on the
 * card and another on the page it opens.
 *
 * The console used to be a single page with five tabs, which meant four
 * fifths of what an operator could do was invisible — the original showed
 * every panel stacked on one screen, and the port had quietly made the
 * surface look smaller than it is. These are those panels, each with room to
 * be a page.
 */
import type { Copy } from '@/lib/copy';
import { pick } from '@/lib/copy';
import type { Locale } from '@/lib/locale';

export interface AdminArea {
  readonly href: string;
  readonly eyebrow: string;
  readonly title: string;
  /** One line on the overview card, saying what the area is for. */
  readonly summary: string;
  readonly group: 'safety' | 'economy' | 'records';
}

export const ADMIN_AREAS: readonly AdminArea[] = [
  {
    href: '/admin/analytics',
    eyebrow: 'VISUAL ANALYTICS & TELEMETRY',
    title: '텔레메트리 · 그래프 분석실',
    summary: 'MAU/DAU 유저 코호트, 통화 구성비 도넛, 5분위 자산 계층 곡선, 주식 시총 랭킹 차트 및 CSV 내보내기.',
    group: 'records',
  },
  {
    href: '/admin/api-health',
    eyebrow: 'API TELEMETRY & HEALTH',
    title: '14대 도메인 API 실시간 관제',
    summary: '전 도메인 300+개 REST API의 실시간 지연시간, 가동률, 에러율을 관제합니다.',
    group: 'records',
  },
  {
    href: '/admin/seo',
    eyebrow: 'SEARCH ENGINE CRAWLER & INDEXING',
    title: 'SEO 및 검색엔진 색인 관제',
    summary: 'Googlebot, Naver Yeti, Bingbot의 실시간 크롤링 현황 및 IndexNow 사이트맵 제출을 관제합니다.',
    group: 'records',
  },
  {
    href: '/admin/blog',
    eyebrow: 'AI BLOG / CONTENT AUDIT',
    title: '블로그 관리 · AI 금융 칼럼',
    summary: 'AI 금융 블로그 글 목록, 수동 발행 및 검색엔진 색인 자동화 상태를 관리합니다.',
    group: 'records',
  },
  {
    href: '/admin/treasury/grants',
    eyebrow: 'TREASURY GRANTS / LIVE LEDGER',
    title: '창업·벤처 지원금 심사 관제탑',
    summary: '실시간 신청서 심사, 1차 AI 스코어링, 복지금고(VAULT_WELFARE) 원자적 지급 및 14일 의무 창업 환수 관제.',
    group: 'economy',
  },
  {
    href: '/admin/controls',
    eyebrow: 'FEATURE CONTROL',
    title: '기능 스위치 · 정책 버전',
    summary: '기능을 켜고 끄고, 경제 정책 버전을 만들고 되돌립니다.',
    group: 'economy',
  },
  {
    href: '/admin/security',
    eyebrow: 'ABUSE SECURITY',
    title: '계정 정지 · IP 차단',
    summary: '이상 요청 계정의 영구 정지와 IP/CIDR 차단·해제를 관리합니다.',
    group: 'safety',
  },
  {
    href: '/admin/users',
    eyebrow: 'USER SAFETY',
    title: '사용자 제한 관리',
    summary: '제한과 해제 모두 사유가 남고, 감사 기록에 기록됩니다.',
    group: 'safety',
  },
  {
    href: '/admin/support',
    eyebrow: 'MEMBER SUPPORT',
    title: '문의 채팅',
    summary: '회원 문의를 확인하고 운영자 응답을 남깁니다.',
    group: 'safety',
  },
  {
    href: '/admin/market',
    eyebrow: 'VIRTUAL MARKET',
    title: '가상 주식 종목 관리',
    summary: '종목 등록, 거래 정지, 액면분할 같은 기업 행위.',
    group: 'economy',
  },
  {
    href: '/admin/catalog',
    eyebrow: 'GAME CATALOG',
    title: '사업 · 시즌 이벤트',
    summary: '구입 가능한 사업과 시즌 소비 이벤트를 켜고 끕니다.',
    group: 'economy',
  },
  {
    href: '/admin/work',
    eyebrow: 'WORK AND JOBS',
    title: '작업 · 직업',
    summary: '작업 카탈로그와 보상 한도, 직업별 숙련도.',
    group: 'economy',
  },
  {
    href: '/admin/bank',
    eyebrow: 'BANK AND CREDIT',
    title: '은행 · 대출',
    summary: '예금과 남은 대출, 신용 등급별 한도와 연체.',
    group: 'economy',
  },
  {
    href: '/admin/economy',
    eyebrow: 'ECONOMY OPERATIONS',
    title: '경제 운영',
    summary: '통화량과 발행, 알림, 자동 조정 엔진, 일괄 지급.',
    group: 'economy',
  },
  {
    href: '/admin/mint',
    eyebrow: 'KOMSCO NATIONAL MINT BUREAU',
    title: '한국조폐공사 (KOMSCO)',
    summary: '본원통화(M0) 주조 승인, 영구 소각, 발행 긴급 동결 및 통화량 불변식 전수 검증을 관제합니다.',
    group: 'economy',
  },
  {
    href: '/admin/central-bank',
    eyebrow: 'BANK OF KOREA (BOK) MONETARY POLICY',
    title: '한국은행 (BOK) 금융통화위원회',
    summary: '기준금리, 지급준비율, 목표 인플레이션 정책 수립 및 M0/M1/M2 거시 통화 지표를 관제합니다.',
    group: 'economy',
  },
  {
    href: '/admin/treasury',
    eyebrow: 'SYSTEM TREASURY',
    title: '국고 · 비축 자금',
    summary: '중앙 국고 비축금과 발행/소각 재순환 흐름을 관제합니다.',
    group: 'economy',
  },
  {
    href: '/admin/enterprises',
    eyebrow: 'STATE & CORPORATE GOVERNANCE',
    title: '공기업 · 기업 지배구조',
    summary: '월덱 국가투자공사(WSHC) 산하 3대 공기업과 민간 스타트업 생태계, 배당 및 법인세를 총괄 관제합니다.',
    group: 'economy',
  },
  {
    href: '/admin/bonds',
    eyebrow: 'TREASURY BONDS (KTB) EXCHANGE',
    title: '국채 거래소 · 재정 채권',
    summary: '기획재정국채(KTB) 1/3/5년물 발행, 표면금리 조정, 시간당 쿠폰 이자 일괄 지급 및 조달 자금을 총괄 관제합니다.',
    group: 'economy',
  },
  {
    href: '/admin/pension',
    eyebrow: 'NATIONAL PENSION SERVICE (NPS)',
    title: '국민연금 · 공적 연금 기금',
    summary: '국민 기여금 적립 총액(AUM), 연금 수령자 관리, 시간당 평생 기초연금 일괄 지급 및 기금 운용을 총괄 관제합니다.',
    group: 'economy',
  },
  {
    href: '/admin/kdic',
    eyebrow: 'KOREA DEPOSIT INSURANCE (KDIC)',
    title: '예금보험공사 · 금융안정기금',
    summary: '1인당 50만 WLD 예금자보호, 부보 금융기관 BIS 비율 및 예보료 징수, 뱅크런 긴급 대여 및 대위변제를 총괄 관제합니다.',
    group: 'economy',
  },
  {
    href: '/admin/fx',
    eyebrow: 'FOREIGN EXCHANGE & RESERVES',
    title: '서울외환시장 · 외환보유액',
    summary: '외환보유액 운용, SDR 바스켓·금보유고 다변화, 통화스왑 비상 라인, 내외금리차 CIP 선물환 및 스무딩 오퍼레이션을 총괄 관제합니다.',
    group: 'economy',
  },
  {
    href: '/admin/shop',
    eyebrow: 'SHOP OPERATIONS',
    title: '상점 관리',
    summary: '상점 상품의 가격, 재고, 활성 상태를 관리합니다.',
    group: 'economy',
  },
  {
    href: '/admin/money-flow',
    eyebrow: 'USER CASH FLOW & LEDGER AUDIT',
    title: '유저 자금 흐름 · 원장 관제',
    summary: '입출금, 주식 매매, 상점 구매, 보상 지급 등 전체 유저의 자금 이동과 복식부기 원장 기록을 실시간 모니터링합니다.',
    group: 'records',
  },
  {
    href: '/admin/logs/errors',
    eyebrow: 'INCIDENT & ERROR AUDIT',
    title: '오류 & 장애 로그 원장',
    summary: '화면 로드 실패, 런타임 크래시 및 시스템 장애 기록을 시간별, 날짜별, 오류 코드별로 정밀 분석합니다.',
    group: 'records',
  },
  {
    href: '/admin/logs/system',
    eyebrow: 'SYSTEM RUNTIME LOGS',
    title: '시스템 런타임 로그',
    summary: 'Nginx 웹서버, 코어 API 백엔드 및 Next.js 프론트엔드의 실시간 런타임 로그를 모니터링합니다.',
    group: 'records',
  },
  {
    href: '/admin/logs',
    eyebrow: 'AUDIT TRAIL',
    title: '감사 로그',
    summary: '누가 무엇을 했는지 조건별로 검색하고 상세 기록을 확인합니다.',
    group: 'records',
  },
  {
    href: '/admin/logs/activity',
    eyebrow: 'USER ACTIVITY TELEMETRY',
    title: '사용자 접속 · 체류 · 클릭 로그',
    summary: '페이지 접속 기록, 페이지별 체류 시간, 버튼 클릭 이벤트를 실시간 확인합니다.',
    group: 'records',
  },
  {
    href: '/admin/logs/delivery',
    eyebrow: 'DELIVERY LOG',
    title: 'Discord 전달 로그',
    summary: '알림 전달 성공 여부와 재시도 상태를 별도 화면에서 확인합니다.',
    group: 'records',
  },
  {
    href: '/admin/logs/integrity',
    eyebrow: 'CHAIN INTEGRITY',
    title: '무결성 검증 · 보존 정책',
    summary: '사슬을 다시 계산하고, 보존 기간과 파기 기록을 남깁니다.',
    group: 'records',
  },
  {
    href: '/admin/discord',
    eyebrow: 'DISCORD DELIVERY',
    title: 'Discord 전달 경로',
    summary: '어떤 사건이 어느 채널로 나가는지, 무엇이 밀려 있는지.',
    group: 'records',
  },
  {
    href: '/admin/content',
    eyebrow: 'PUBLISHED CONTENT CONTROL',
    title: '공지 · 사진',
    summary: '검토를 마친 소식과 사진만 공개합니다.',
    group: 'safety',
  },
  {
    href: '/admin/safety',
    eyebrow: 'MINOR & EMERGENCY TAKEDOWN',
    title: '긴급 콘텐츠 삭제 · 안전 센터',
    summary: '비회원 긴급 콘텐츠 삭제 요청 및 미성년자 안전 모더레이션을 심사합니다.',
    group: 'safety',
  },
];

/**
 * The other four locales of each area's title and summary, as [en, ja, zh, vi]. Korean is not
 * repeated here: ADMIN_AREA_COPY takes it from ADMIN_AREAS itself, so the product copy cannot
 * drift between the card and its translation table.
 */
type Others = readonly [en: string, ja: string, zh: string, vi: string];

const AREA_TRANSLATIONS: Readonly<Record<string, { readonly title: Others; readonly summary: Others }>> = {
  '/admin/analytics': {
    title: ['Telemetry · graph analytics room', 'テレメトリ · グラフ分析室', '遥测 · 图表分析室', 'Phòng telemetry · phân tích biểu đồ'],
    summary: [
      'MAU/DAU member cohorts, currency mix donut, quintile wealth curve, stock market-cap ranking charts and CSV export.',
      'MAU/DAUユーザーコホート、通貨構成比ドーナツ、5分位資産階層曲線、株式時価総額ランキングチャートとCSVエクスポート。',
      'MAU/DAU 用户同期群、货币构成环形图、五分位资产分层曲线、股票市值排名图表及 CSV 导出。',
      'Cohort người dùng MAU/DAU, biểu đồ vòng cơ cấu tiền tệ, đường phân tầng tài sản theo ngũ phân vị, bảng xếp hạng vốn hóa và xuất CSV.',
    ],
  },
  '/admin/api-health': {
    title: ['Live monitoring of APIs across 14 domains', '14ドメインAPIのリアルタイム監視', '14 大领域 API 实时监控', 'Giám sát thời gian thực API của 14 miền'],
    summary: [
      'Monitors live latency, uptime and error rate of 300+ REST APIs across every domain.',
      '全ドメイン300以上のREST APIのリアルタイムのレイテンシ、稼働率、エラー率を監視します。',
      '监控全领域 300+ 个 REST API 的实时延迟、可用率与错误率。',
      'Giám sát độ trễ, thời gian hoạt động và tỷ lệ lỗi theo thời gian thực của hơn 300 REST API ở mọi miền.',
    ],
  },
  '/admin/seo': {
    title: ['SEO and search engine indexing monitor', 'SEOと検索エンジンのインデックス監視', 'SEO 与搜索引擎索引监控', 'Giám sát SEO và lập chỉ mục công cụ tìm kiếm'],
    summary: [
      'Monitors live crawling by Googlebot, Naver Yeti and Bingbot, and IndexNow sitemap submissions.',
      'Googlebot、Naver Yeti、Bingbotのリアルタイムのクロール状況とIndexNowサイトマップ送信を監視します。',
      '监控 Googlebot、Naver Yeti、Bingbot 的实时抓取情况与 IndexNow 站点地图提交。',
      'Giám sát thu thập thời gian thực của Googlebot, Naver Yeti, Bingbot và việc gửi sitemap IndexNow.',
    ],
  },
  '/admin/blog': {
    title: ['Blog management · AI finance columns', 'ブログ管理 · AI金融コラム', '博客管理 · AI 金融专栏', 'Quản lý blog · chuyên mục tài chính AI'],
    summary: [
      'Manages the AI finance blog post list, manual publishing and search-engine indexing automation.',
      'AI金融ブログの記事一覧、手動発行、検索エンジンのインデックス自動化の状態を管理します。',
      '管理 AI 金融博客文章列表、手动发布及搜索引擎索引自动化状态。',
      'Quản lý danh sách bài blog tài chính AI, xuất bản thủ công và trạng thái tự động lập chỉ mục.',
    ],
  },
  '/admin/treasury/grants': {
    title: ['Start-up & venture grant review tower', '創業・ベンチャー支援金の審査管制塔', '创业·风投补助审核控制塔', 'Tháp xét duyệt trợ cấp khởi nghiệp & mạo hiểm'],
    summary: [
      'Live application review, first-pass AI scoring, atomic payouts from the welfare vault (VAULT_WELFARE) and the 14-day mandatory start-up clawback.',
      'リアルタイムの申請審査、一次AIスコアリング、福祉金庫（VAULT_WELFARE）からのアトミック支給、14日間の創業義務に基づく回収を管制。',
      '实时申请审核、首轮 AI 评分、福利金库（VAULT_WELFARE）原子化发放及 14 天强制创业回收管控。',
      'Xét duyệt đơn thời gian thực, chấm điểm AI vòng một, chi trả nguyên tử từ quỹ phúc lợi (VAULT_WELFARE) và thu hồi bắt buộc sau 14 ngày.',
    ],
  },
  '/admin/controls': {
    title: ['Feature switches · policy versions', '機能スイッチ · ポリシーバージョン', '功能开关 · 政策版本', 'Công tắc tính năng · phiên bản chính sách'],
    summary: [
      'Turn features on and off, and create and roll back economic policy versions.',
      '機能をオン/オフし、経済ポリシーのバージョンを作成・復元します。',
      '开启或关闭功能，创建并回滚经济政策版本。',
      'Bật/tắt tính năng, tạo và khôi phục phiên bản chính sách kinh tế.',
    ],
  },
  '/admin/security': {
    title: ['Account suspension · IP blocking', 'アカウント停止 · IP遮断', '账号封停 · IP 封禁', 'Đình chỉ tài khoản · chặn IP'],
    summary: [
      'Manages permanent suspension of abusive accounts and IP/CIDR blocks and unblocks.',
      '異常リクエストのアカウントの永久停止とIP/CIDRの遮断・解除を管理します。',
      '管理异常请求账号的永久封停及 IP/CIDR 封禁与解封。',
      'Quản lý đình chỉ vĩnh viễn tài khoản yêu cầu bất thường và chặn/bỏ chặn IP/CIDR.',
    ],
  },
  '/admin/users': {
    title: ['Member restriction management', 'ユーザー制限の管理', '用户限制管理', 'Quản lý hạn chế người dùng'],
    summary: [
      'Every restriction and release keeps a reason and is written to the audit log.',
      '制限も解除もすべて理由が残り、監査記録に記録されます。',
      '限制与解除都会保留原因，并写入审计记录。',
      'Mọi lần hạn chế và gỡ hạn chế đều lưu lý do và được ghi vào nhật ký kiểm toán.',
    ],
  },
  '/admin/support': {
    title: ['Support chat', 'お問い合わせチャット', '咨询聊天', 'Trò chuyện hỗ trợ'],
    summary: [
      'Review member enquiries and leave operator replies.',
      '会員のお問い合わせを確認し、運営者の返信を残します。',
      '查看会员咨询并留下运营者回复。',
      'Xem yêu cầu của thành viên và để lại phản hồi của nhà vận hành.',
    ],
  },
  '/admin/market': {
    title: ['Virtual stock listing management', '仮想株式銘柄の管理', '虚拟股票管理', 'Quản lý mã cổ phiếu ảo'],
    summary: [
      'Corporate actions such as listings, trading halts and stock splits.',
      '銘柄の登録、取引停止、株式分割などの企業行為。',
      '股票上市、停牌、拆股等公司行为。',
      'Các hành động doanh nghiệp như niêm yết, tạm ngừng giao dịch và chia tách cổ phiếu.',
    ],
  },
  '/admin/catalog': {
    title: ['Businesses · season events', '事業 · シーズンイベント', '产业 · 赛季活动', 'Kinh doanh · sự kiện mùa'],
    summary: [
      'Turn purchasable businesses and seasonal spending events on and off.',
      '購入可能な事業とシーズン消費イベントをオン/オフします。',
      '开启或关闭可购买的产业及赛季消费活动。',
      'Bật/tắt các doanh nghiệp có thể mua và sự kiện chi tiêu theo mùa.',
    ],
  },
  '/admin/work': {
    title: ['Work · jobs', '作業 · 職業', '工作 · 职业', 'Công việc · nghề'],
    summary: [
      'The work catalogue, reward caps and per-job proficiency.',
      '作業カタログと報酬上限、職業別の熟練度。',
      '工作目录、奖励上限及各职业熟练度。',
      'Danh mục công việc, hạn mức thưởng và độ thành thạo theo nghề.',
    ],
  },
  '/admin/bank': {
    title: ['Bank · loans', '銀行 · ローン', '银行 · 贷款', 'Ngân hàng · khoản vay'],
    summary: [
      'Deposits and outstanding loans, limits and arrears by credit grade.',
      '預金と残りのローン、信用等級別の限度額と延滞。',
      '存款与未偿贷款、按信用等级划分的额度与逾期。',
      'Tiền gửi và dư nợ, hạn mức và nợ quá hạn theo hạng tín dụng.',
    ],
  },
  '/admin/economy': {
    title: ['Economy operations', '経済運営', '经济运营', 'Điều hành kinh tế'],
    summary: [
      'Money supply and issuance, alerts, the automatic adjustment engine and bulk payouts.',
      '通貨量と発行、通知、自動調整エンジン、一括支給。',
      '货币量与发行、通知、自动调节引擎、批量发放。',
      'Cung tiền và phát hành, cảnh báo, công cụ tự điều chỉnh và chi trả hàng loạt.',
    ],
  },
  '/admin/mint': {
    title: ['Korea Minting and Security Printing Corporation (KOMSCO)', '韓国造幣公社（KOMSCO）', '韩国造币公社（KOMSCO）', 'Tổng công ty Đúc tiền Hàn Quốc (KOMSCO)'],
    summary: [
      'Controls base money (M0) minting approvals, permanent burns, emergency issuance freezes and full money-supply invariant checks.',
      'マネタリーベース（M0）の鋳造承認、永久焼却、発行の緊急凍結、通貨量不変条件の全件検証を管制します。',
      '管控基础货币（M0）铸造批准、永久销毁、紧急冻结发行及货币量不变式全量校验。',
      'Kiểm soát phê duyệt đúc tiền cơ sở (M0), hủy vĩnh viễn, đóng băng phát hành khẩn cấp và kiểm tra toàn bộ bất biến cung tiền.',
    ],
  },
  '/admin/central-bank': {
    title: ['Bank of Korea (BOK) Monetary Policy Board', '韓国銀行（BOK）金融通貨委員会', '韩国银行（BOK）货币政策委员会', 'Hội đồng Chính sách Tiền tệ Ngân hàng Hàn Quốc (BOK)'],
    summary: [
      'Sets the base rate, reserve requirement and inflation target, and monitors M0/M1/M2 macro money indicators.',
      '政策金利、支払準備率、目標インフレ政策を策定し、M0/M1/M2のマクロ通貨指標を監視します。',
      '制定基准利率、存款准备金率与通胀目标政策，并监控 M0/M1/M2 宏观货币指标。',
      'Xây dựng lãi suất cơ bản, tỷ lệ dự trữ bắt buộc, mục tiêu lạm phát và giám sát chỉ số tiền tệ vĩ mô M0/M1/M2.',
    ],
  },
  '/admin/treasury': {
    title: ['Treasury · reserve funds', '国庫 · 備蓄資金', '国库 · 储备资金', 'Ngân khố · quỹ dự trữ'],
    summary: [
      'Monitors the central treasury reserve and the issuance/burn recirculation flow.',
      '中央国庫の備蓄金と発行/焼却の再循環フローを監視します。',
      '监控中央国库储备金及发行/销毁的再循环流向。',
      'Giám sát quỹ dự trữ ngân khố trung ương và dòng tái tuần hoàn phát hành/hủy.',
    ],
  },
  '/admin/enterprises': {
    title: ['Public enterprises · corporate governance', '公企業 · 企業ガバナンス', '国企 · 公司治理', 'Doanh nghiệp công · quản trị doanh nghiệp'],
    summary: [
      'Oversees the three public enterprises under the Woldeok State Holding Corporation (WSHC), the private start-up ecosystem, dividends and corporate tax.',
      'ウォルドク国家投資公社（WSHC）傘下の3大公企業と民間スタートアップのエコシステム、配当、法人税を総括監視します。',
      '统筹管控月德国家投资公社（WSHC）旗下三大国企、民间初创生态、分红及企业所得税。',
      'Giám sát tổng thể 3 doanh nghiệp công thuộc Tổng công ty Đầu tư Nhà nước Woldeok (WSHC), hệ sinh thái khởi nghiệp tư nhân, cổ tức và thuế doanh nghiệp.',
    ],
  },
  '/admin/bonds': {
    title: ['Bond exchange · fiscal bonds', '国債取引所 · 財政債券', '国债交易所 · 财政债券', 'Sàn trái phiếu · trái phiếu tài khóa'],
    summary: [
      'Oversees issuance of 1/3/5-year Korean Treasury Bonds (KTB), coupon rate changes, hourly bulk coupon payments and the funds raised.',
      '企画財政国債（KTB）1/3/5年物の発行、表面金利の調整、1時間ごとのクーポン利息一括支払い、調達資金を総括監視します。',
      '统筹管控企划财政国债（KTB）1/3/5 年期发行、票面利率调整、每小时票息批量支付及募集资金。',
      'Giám sát phát hành trái phiếu KTB kỳ hạn 1/3/5 năm, điều chỉnh lãi suất coupon, trả lãi hàng loạt mỗi giờ và nguồn vốn huy động.',
    ],
  },
  '/admin/pension': {
    title: ['National pension · public pension fund', '国民年金 · 公的年金基金', '国民年金 · 公共年金基金', 'Lương hưu quốc gia · quỹ lương hưu công'],
    summary: [
      'Oversees total contributions (AUM), pension recipients, hourly bulk payment of the lifelong basic pension and fund management.',
      '国民拠出金の積立総額（AUM）、年金受給者管理、1時間ごとの生涯基礎年金一括支給、基金運用を総括監視します。',
      '统筹管控国民缴费累计总额（AUM）、年金领取人管理、每小时终身基础年金批量发放及基金运作。',
      'Giám sát tổng đóng góp (AUM), quản lý người nhận lương hưu, chi trả hàng loạt lương hưu cơ bản trọn đời mỗi giờ và vận hành quỹ.',
    ],
  },
  '/admin/kdic': {
    title: ['Deposit insurance · financial stability fund', '預金保険公社 · 金融安定基金', '存款保险公司 · 金融稳定基金', 'Bảo hiểm tiền gửi · quỹ ổn định tài chính'],
    summary: [
      'Oversees 500,000 WLD per-member deposit protection, insured institutions’ BIS ratios and premium collection, emergency bank-run lending and subrogation.',
      '1人あたり50万WLDの預金者保護、付保金融機関のBIS比率と預金保険料の徴収、取り付け時の緊急貸付と代位弁済を総括監視します。',
      '统筹管控每人 50 万 WLD 存款保护、投保金融机构 BIS 比率与保费征收、挤兑紧急贷款及代位清偿。',
      'Giám sát bảo vệ tiền gửi 500.000 WLD mỗi người, tỷ lệ BIS và thu phí bảo hiểm của tổ chức tham gia, cho vay khẩn khi rút tiền ồ ạt và trả thay.',
    ],
  },
  '/admin/fx': {
    title: ['Seoul FX market · foreign reserves', 'ソウル外国為替市場 · 外貨準備高', '首尔外汇市场 · 外汇储备', 'Thị trường ngoại hối Seoul · dự trữ ngoại hối'],
    summary: [
      'Oversees FX reserve management, SDR basket and gold diversification, emergency currency swap lines, CIP forwards on interest differentials and smoothing operations.',
      '外貨準備の運用、SDRバスケット・金保有の多様化、通貨スワップの緊急ライン、内外金利差に基づくCIP先物為替、スムージングオペレーションを総括監視します。',
      '统筹管控外汇储备运作、SDR 篮子·黄金储备多元化、货币互换应急额度、内外利差 CIP 远期外汇及平滑操作。',
      'Giám sát quản lý dự trữ ngoại hối, đa dạng hóa rổ SDR và vàng, hạn mức hoán đổi tiền tệ khẩn cấp, kỳ hạn CIP theo chênh lệch lãi suất và nghiệp vụ làm mượt.',
    ],
  },
  '/admin/shop': {
    title: ['Shop management', 'ショップ管理', '商店管理', 'Quản lý cửa hàng'],
    summary: [
      'Manages shop item prices, stock and active status.',
      'ショップ商品の価格、在庫、有効状態を管理します。',
      '管理商店商品的价格、库存与启用状态。',
      'Quản lý giá, tồn kho và trạng thái kích hoạt của sản phẩm cửa hàng.',
    ],
  },
  '/admin/money-flow': {
    title: ['Member money flow · ledger monitor', 'ユーザー資金フロー · 元帳監視', '用户资金流向 · 账本监控', 'Dòng tiền người dùng · giám sát sổ cái'],
    summary: [
      'Monitors every member money movement — deposits, withdrawals, stock trades, shop purchases, reward payouts — and the double-entry ledger in real time.',
      '入出金、株式売買、ショップ購入、報酬支給など全ユーザーの資金移動と複式簿記元帳の記録をリアルタイムで監視します。',
      '实时监控存取款、股票买卖、商店购买、奖励发放等全体用户的资金流动及复式记账账本记录。',
      'Giám sát thời gian thực mọi dịch chuyển tiền của người dùng — nạp/rút, mua bán cổ phiếu, mua hàng, chi thưởng — và sổ cái kép.',
    ],
  },
  '/admin/logs/errors': {
    title: ['Error & incident log ledger', 'エラー & 障害ログ元帳', '错误 & 故障日志账本', 'Sổ nhật ký lỗi & sự cố'],
    summary: [
      'Analyses screen load failures, runtime crashes and system incidents by hour, date and error code.',
      '画面読み込み失敗、ランタイムクラッシュ、システム障害の記録を時間別・日付別・エラーコード別に精密分析します。',
      '按小时、日期和错误代码精细分析页面加载失败、运行时崩溃及系统故障记录。',
      'Phân tích chi tiết lỗi tải màn hình, sự cố runtime và sự cố hệ thống theo giờ, ngày và mã lỗi.',
    ],
  },
  '/admin/logs/system': {
    title: ['System runtime logs', 'システムランタイムログ', '系统运行日志', 'Nhật ký runtime hệ thống'],
    summary: [
      'Monitors live runtime logs from the Nginx web server, the core API backend and the Next.js frontend.',
      'Nginxウェブサーバー、コアAPIバックエンド、Next.jsフロントエンドのリアルタイムランタイムログを監視します。',
      '监控 Nginx Web 服务器、核心 API 后端及 Next.js 前端的实时运行日志。',
      'Giám sát nhật ký runtime thời gian thực của máy chủ web Nginx, backend API lõi và frontend Next.js.',
    ],
  },
  '/admin/logs': {
    title: ['Audit log', '監査ログ', '审计日志', 'Nhật ký kiểm toán'],
    summary: [
      'Search who did what by condition and open the detailed record.',
      '誰が何をしたかを条件別に検索し、詳細な記録を確認します。',
      '按条件搜索谁做了什么，并查看详细记录。',
      'Tìm theo điều kiện ai đã làm gì và xem bản ghi chi tiết.',
    ],
  },
  '/admin/logs/activity': {
    title: ['Member access · dwell · click log', 'ユーザーのアクセス · 滞在 · クリックログ', '用户访问 · 停留 · 点击日志', 'Nhật ký truy cập · thời gian ở lại · nhấp chuột'],
    summary: [
      'Shows page visits, time spent per page and button click events in real time.',
      'ページアクセス記録、ページ別滞在時間、ボタンクリックイベントをリアルタイムで確認します。',
      '实时查看页面访问记录、各页面停留时间及按钮点击事件。',
      'Xem theo thời gian thực lượt truy cập trang, thời gian ở mỗi trang và sự kiện nhấp nút.',
    ],
  },
  '/admin/logs/delivery': {
    title: ['Discord delivery log', 'Discord配信ログ', 'Discord 投递日志', 'Nhật ký gửi Discord'],
    summary: [
      'Shows notification delivery success and retry status on a separate screen.',
      '通知配信の成否と再試行状態を別画面で確認します。',
      '在单独页面查看通知投递是否成功及重试状态。',
      'Xem kết quả gửi thông báo và trạng thái thử lại trên màn hình riêng.',
    ],
  },
  '/admin/logs/integrity': {
    title: ['Integrity verification · retention policy', '完全性検証 · 保存ポリシー', '完整性校验 · 保留策略', 'Xác minh toàn vẹn · chính sách lưu giữ'],
    summary: [
      'Recompute the chain and record retention periods and destruction records.',
      'チェーンを再計算し、保存期間と破棄記録を残します。',
      '重新计算链，并记录保留期限与销毁记录。',
      'Tính lại chuỗi và ghi lại thời hạn lưu giữ cùng hồ sơ hủy.',
    ],
  },
  '/admin/discord': {
    title: ['Discord delivery routes', 'Discord配信経路', 'Discord 投递路径', 'Tuyến gửi Discord'],
    summary: [
      'Which events go to which channel, and what is queued.',
      'どのイベントがどのチャンネルに送られ、何が滞留しているか。',
      '哪些事件发往哪个频道，以及哪些仍在排队。',
      'Sự kiện nào được gửi tới kênh nào và những gì đang tồn đọng.',
    ],
  },
  '/admin/content': {
    title: ['Notices · photos', 'お知らせ · 写真', '公告 · 照片', 'Thông báo · ảnh'],
    summary: [
      'Only reviewed news and photos are published.',
      '確認済みのお知らせと写真だけを公開します。',
      '只公开审核完毕的消息与照片。',
      'Chỉ công khai tin tức và ảnh đã được duyệt.',
    ],
  },
  '/admin/safety': {
    title: ['Emergency content takedown · safety centre', '緊急コンテンツ削除 · 安全センター', '紧急内容删除 · 安全中心', 'Gỡ nội dung khẩn cấp · trung tâm an toàn'],
    summary: [
      'Reviews non-member emergency takedown requests and minor-safety moderation.',
      '非会員からの緊急コンテンツ削除要請と未成年者の安全モデレーションを審査します。',
      '审核非会员紧急内容删除请求及未成年人安全审核。',
      'Xét duyệt yêu cầu gỡ nội dung khẩn cấp từ người không phải thành viên và kiểm duyệt an toàn trẻ vị thành niên.',
    ],
  },
};

function areaCopy(korean: string, others: Others | undefined): Copy {
  const [en, ja, zh, vi] = others ?? ['', '', '', ''];
  return { ko: korean, en, ja, zh, vi };
}

/** `<href>.title` and `<href>.summary` in all five locales, Korean taken from ADMIN_AREAS. */
export const ADMIN_AREA_COPY: Readonly<Record<string, Copy>> = Object.fromEntries(
  ADMIN_AREAS.flatMap((area) => [
    [`${area.href}.title`, areaCopy(area.title, AREA_TRANSLATIONS[area.href]?.title)],
    [`${area.href}.summary`, areaCopy(area.summary, AREA_TRANSLATIONS[area.href]?.summary)],
  ]),
);

/** An area's title in the reader's language. */
export function areaTitle(area: AdminArea, locale: Locale): string {
  return pick(locale, ADMIN_AREA_COPY[`${area.href}.title`] ?? areaCopy(area.title, undefined));
}

/** An area's one-line summary in the reader's language. */
export function areaSummary(area: AdminArea, locale: Locale): string {
  return pick(locale, ADMIN_AREA_COPY[`${area.href}.summary`] ?? areaCopy(area.summary, undefined));
}

export function adminArea(href: string): AdminArea {
  const area = ADMIN_AREAS.find((entry) => entry.href === href);
  if (!area) throw new Error(`no admin area for ${href}`);
  return area;
}

/** The area a console path belongs to, by longest prefix; null for the front door itself. */
export function adminAreaFor(path: string): AdminArea | null {
  let best: AdminArea | null = null;
  for (const area of ADMIN_AREAS) {
    const inside = path === area.href || path.startsWith(`${area.href}/`);
    if (inside && (best === null || area.href.length > best.href.length)) best = area;
  }
  return best;
}

/**
 * A console path the gate may send an operator back to.
 *
 * It arrives in the query string and in a form field, so it is checked
 * rather than trusted: only a path under /admin, made of plain path
 * characters, with no scheme, host, query or dot-segment that could turn
 * "back to the page you came from" into "off to somewhere else". The front
 * door itself is where the gate already is, so it answers null like anything
 * unusable.
 */
const CONSOLE_PATH = /^\/admin(\/(?!\.+(?:\/|$))[A-Za-z0-9._~%-]+)+\/?$/;

export function consoleReturnPath(value: unknown): string | null {
  return typeof value === 'string' && CONSOLE_PATH.test(value) ? value : null;
}
