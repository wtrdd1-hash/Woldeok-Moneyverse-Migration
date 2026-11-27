import type { Copy } from '@/lib/copy';
import { pick } from '@/lib/copy';
import type { Locale } from '@/lib/locale';

/**
 * Five-locale copy for the administrator console chrome and its home page. Korean is the
 * carried-over product copy and is kept byte-for-byte; the other columns translate it. `{name}`
 * slots are filled after picking, so counts and timestamps keep their own formatting.
 *
 * This module has no 'use client' marker on purpose: server components (the console home, the
 * member page) pick from it with getServerLocale(), client components through useAdminCopy().
 */

/** Fills `{name}` slots in a picked copy string; the values themselves are never translated. */
export function fill(text: string, values: Readonly<Record<string, string>>): string {
  return text.replace(/\{(\w+)\}/g, (slot, name: string) => values[name] ?? slot);
}

/** Picks one locale of a copy entry and fills its slots. */
export function copyText(locale: Locale, copy: Copy, values?: Readonly<Record<string, string>>): string {
  const text = pick(locale, copy);
  return values ? fill(text, values) : text;
}

export const ADMIN_CHROME_COPY = {
  // layout.tsx
  layoutNote: {
    ko: '서비스 상태는 각 관리자 API의 실제 조회 결과를 기준으로 표시합니다.',
    en: 'Service status reflects what each administrator API actually returned.',
    ja: 'サービス状態は各管理者APIの実際の照会結果に基づいて表示します。',
    zh: '服务状态以各管理员 API 的实际查询结果为准显示。',
    vi: 'Trạng thái dịch vụ được hiển thị dựa trên kết quả truy vấn thực tế của từng API quản trị.',
  },
  // admin-sub-nav.tsx
  subNavHint: {
    ko: '고위험 작업 전에는 2단계 인증으로 세션을 승격하세요.',
    en: 'Elevate your session with two-factor authentication before high-risk actions.',
    ja: '高リスクの操作の前に、2段階認証でセッションを昇格してください。',
    zh: '执行高风险操作前，请通过两步验证提升会话权限。',
    vi: 'Hãy nâng cấp phiên bằng xác thực hai bước trước các thao tác rủi ro cao.',
  },
  subNavLockTitle: { ko: '세션 즉시 잠금', en: 'Lock the session now', ja: 'セッションを今すぐロック', zh: '立即锁定会话', vi: 'Khóa phiên ngay' },
  subNavLock: { ko: '잠금', en: 'Lock', ja: 'ロック', zh: '锁定', vi: 'Khóa' },
  subNavElevateTitle: {
    ko: '텔레그램/디스코드 2FA 세션 승격 (15분)',
    en: 'Elevate the session with Telegram/Discord 2FA (15 minutes)',
    ja: 'Telegram/Discordの2FAでセッション昇格（15分）',
    zh: '通过 Telegram/Discord 2FA 提升会话（15 分钟）',
    vi: 'Nâng cấp phiên bằng 2FA Telegram/Discord (15 phút)',
  },
  subNavElevate: { ko: '2FA 승격', en: 'Elevate 2FA', ja: '2FA昇格', zh: '2FA 提升', vi: 'Nâng cấp 2FA' },
  subNavAria: {
    ko: '관리자 세부 내비게이션',
    en: 'Administrator section navigation',
    ja: '管理者の詳細ナビゲーション',
    zh: '管理员子导航',
    vi: 'Điều hướng chi tiết quản trị',
  },
  subNavActionName: {
    ko: '관리자 콘솔 15분 세션 승격',
    en: '15-minute administrator console session elevation',
    ja: '管理コンソールの15分間セッション昇格',
    zh: '管理控制台 15 分钟会话提升',
    vi: 'Nâng cấp phiên bảng quản trị trong 15 phút',
  },
  // admin-back.tsx
  back: { ko: '운영 콘솔', en: 'Operations console', ja: '運営コンソール', zh: '运营控制台', vi: 'Bảng điều hành' },
  // console-gate.tsx
  gateOpen: { ko: '관리자 페이지 열기 →', en: 'Open the admin console →', ja: '管理者ページを開く →', zh: '打开管理页面 →', vi: 'Mở trang quản trị →' },
  gateSessionNote: {
    ko: '콘솔 세션은 최대 30일 유지되며, 24시간 사용하지 않으면 잠깁니다.',
    en: 'A console session lasts up to 30 days and locks after 24 hours without use.',
    ja: 'コンソールセッションは最長30日間維持され、24時間使用しないとロックされます。',
    zh: '控制台会话最长保持 30 天，24 小时未使用将被锁定。',
    vi: 'Phiên bảng điều khiển kéo dài tối đa 30 ngày và bị khóa nếu không dùng trong 24 giờ.',
  },
  gateClose: { ko: '콘솔 닫기', en: 'Close console', ja: 'コンソールを閉じる', zh: '关闭控制台', vi: 'Đóng bảng điều khiển' },
  // admin-quick-jumper-modal.tsx
  jumperOpenAria: {
    ko: '{count}개 관리자 전체 메뉴 열기',
    en: 'Open all {count} administrator menus',
    ja: '{count}件の管理者メニューをすべて開く',
    zh: '打开全部 {count} 个管理员菜单',
    vi: 'Mở toàn bộ {count} menu quản trị',
  },
  jumperButton: { ko: '전체 메뉴 ({count})', en: 'All menus ({count})', ja: '全メニュー（{count}）', zh: '全部菜单（{count}）', vi: 'Tất cả menu ({count})' },
  jumperTitle: {
    ko: '관리자 전체 관제 타워 네비게이터',
    en: 'Administrator control tower navigator',
    ja: '管理者コントロールタワー・ナビゲーター',
    zh: '管理员总控制塔导航',
    vi: 'Bộ điều hướng tháp điều khiển quản trị',
  },
  jumperRouteCount: { ko: '{count}개 전 라우트', en: '{count} routes', ja: '全{count}ルート', zh: '共 {count} 个路由', vi: '{count} tuyến' },
  jumperSubtitle: {
    ko: 'URL 누락 없이 원하는 관리자 페이지로 1초 만에 즉시 이동합니다.',
    en: 'Jump straight to any administrator page, with no URL left out.',
    ja: 'URLの漏れなく、目的の管理者ページへすぐに移動できます。',
    zh: '无遗漏地一键直达任意管理页面。',
    vi: 'Chuyển ngay đến bất kỳ trang quản trị nào, không sót URL nào.',
  },
  jumperSearchPlaceholder: {
    ko: '메뉴명, 주소(/admin/...), 설명 검색 (예: 국고, 시나리오, 크롤러, 2FA)...',
    en: 'Search menu name, path (/admin/...) or description (e.g. treasury, scenario, crawler, 2FA)...',
    ja: 'メニュー名、パス（/admin/...）、説明を検索（例: 国庫、シナリオ、クローラー、2FA）...',
    zh: '搜索菜单名、路径（/admin/...）或说明（例如：国库、情景、爬虫、2FA）...',
    vi: 'Tìm theo tên menu, đường dẫn (/admin/...) hoặc mô tả (ví dụ: ngân khố, kịch bản, crawler, 2FA)...',
  },
  jumperEmpty: {
    ko: '검색 결과와 일치하는 관리자 라우트가 없습니다.',
    en: 'No administrator route matches your search.',
    ja: '検索条件に一致する管理者ルートはありません。',
    zh: '没有与搜索匹配的管理路由。',
    vi: 'Không có tuyến quản trị nào khớp với tìm kiếm.',
  },
  jumperFooter: {
    ko: '총 31개 관리자 주소 완벽 바인딩',
    en: 'All 31 administrator paths bound',
    ja: '管理者アドレス全31件をバインド済み',
    zh: '已绑定全部 31 个管理地址',
    vi: 'Đã liên kết đủ 31 địa chỉ quản trị',
  },
  close: { ko: '닫기', en: 'Close', ja: '閉じる', zh: '关闭', vi: 'Đóng' },
} as const satisfies Record<string, Copy>;

export type AdminChromeCopyKey = keyof typeof ADMIN_CHROME_COPY;

/** Sub-navigation tab labels, keyed by href; `ko` equals the ADMIN_TABS label byte-for-byte. */
export const ADMIN_TAB_COPY: Readonly<Record<string, Copy>> = {
  '/admin': { ko: '대시보드', en: 'Dashboard', ja: 'ダッシュボード', zh: '仪表盘', vi: 'Bảng tổng quan' },
  '/admin/money-flow': { ko: '유저 자금 흐름', en: 'Member money flow', ja: 'ユーザー資金フロー', zh: '用户资金流向', vi: 'Dòng tiền người dùng' },
  '/admin/analytics': { ko: '그래프 분석', en: 'Graph analytics', ja: 'グラフ分析', zh: '图表分析', vi: 'Phân tích biểu đồ' },
  '/admin/api-health': { ko: 'API 관제', en: 'API monitoring', ja: 'API監視', zh: 'API 监控', vi: 'Giám sát API' },
  '/admin/seo': { ko: 'SEO·색인', en: 'SEO & indexing', ja: 'SEO・インデックス', zh: 'SEO·索引', vi: 'SEO & lập chỉ mục' },
  '/admin/blog': { ko: '블로그 관리', en: 'Blog management', ja: 'ブログ管理', zh: '博客管理', vi: 'Quản lý blog' },
  '/admin/treasury/grants': { ko: '창업 지원금 심사', en: 'Start-up grant review', ja: '創業支援金の審査', zh: '创业补助审核', vi: 'Xét duyệt trợ cấp khởi nghiệp' },
  '/admin/users': { ko: '회원 관리', en: 'Members', ja: '会員管理', zh: '会员管理', vi: 'Quản lý thành viên' },
  '/admin/security': { ko: '보안·차단', en: 'Security & blocking', ja: 'セキュリティ・遮断', zh: '安全·封禁', vi: 'Bảo mật & chặn' },
  '/admin/support': { ko: '문의 채팅', en: 'Support chat', ja: 'お問い合わせチャット', zh: '咨询聊天', vi: 'Trò chuyện hỗ trợ' },
  '/admin/economy': { ko: '경제·원장', en: 'Economy & ledger', ja: '経済・元帳', zh: '经济·账本', vi: 'Kinh tế & sổ cái' },
  '/admin/mint': { ko: '조폐국', en: 'Mint', ja: '造幣局', zh: '造币局', vi: 'Xưởng đúc tiền' },
  '/admin/central-bank': { ko: '중앙은행', en: 'Central bank', ja: '中央銀行', zh: '中央银行', vi: 'Ngân hàng trung ương' },
  '/admin/treasury': { ko: '국고·비축', en: 'Treasury & reserves', ja: '国庫・備蓄', zh: '国库·储备', vi: 'Ngân khố & dự trữ' },
  '/admin/enterprises': { ko: '공기업·지배구조', en: 'Public enterprises & governance', ja: '公企業・ガバナンス', zh: '国企·治理结构', vi: 'Doanh nghiệp công & quản trị' },
  '/admin/bonds': { ko: '국채 거래소', en: 'Bond exchange', ja: '国債取引所', zh: '国债交易所', vi: 'Sàn trái phiếu' },
  '/admin/pension': { ko: '국민연금', en: 'National pension', ja: '国民年金', zh: '国民年金', vi: 'Lương hưu quốc gia' },
  '/admin/kdic': { ko: '예금보험공사', en: 'Deposit insurance', ja: '預金保険公社', zh: '存款保险公司', vi: 'Bảo hiểm tiền gửi' },
  '/admin/fx': { ko: '서울외환시장', en: 'Seoul FX market', ja: 'ソウル外国為替市場', zh: '首尔外汇市场', vi: 'Thị trường ngoại hối Seoul' },
  '/admin/catalog': { ko: '사업·시즌', en: 'Businesses & seasons', ja: '事業・シーズン', zh: '产业·赛季', vi: 'Kinh doanh & mùa' },
  '/admin/work': { ko: '작업·직업', en: 'Work & jobs', ja: '作業・職業', zh: '工作·职业', vi: 'Công việc & nghề' },
  '/admin/shop': { ko: '상점 관리', en: 'Shop management', ja: 'ショップ管理', zh: '商店管理', vi: 'Quản lý cửa hàng' },
  '/admin/logs': { ko: '감사 로그', en: 'Audit log', ja: '監査ログ', zh: '审计日志', vi: 'Nhật ký kiểm toán' },
  '/admin/controls': { ko: '기능 스위치', en: 'Feature switches', ja: '機能スイッチ', zh: '功能开关', vi: 'Công tắc tính năng' },
  '/admin/content': { ko: '공지·갤러리', en: 'Notices & gallery', ja: 'お知らせ・ギャラリー', zh: '公告·图库', vi: 'Thông báo & thư viện' },
  '/admin/discord': { ko: 'Discord', en: 'Discord', ja: 'Discord', zh: 'Discord', vi: 'Discord' },
  '/admin/bank': { ko: '은행·대출', en: 'Bank & loans', ja: '銀行・ローン', zh: '银行·贷款', vi: 'Ngân hàng & khoản vay' },
  '/admin/market': { ko: '가상 시장', en: 'Virtual market', ja: '仮想市場', zh: '虚拟市场', vi: 'Thị trường ảo' },
  '/admin/safety': { ko: '안전·삭제', en: 'Safety & takedown', ja: '安全・削除', zh: '安全·删除', vi: 'An toàn & gỡ bỏ' },
};

/** Quick jumper copy: route labels (`label:`), descriptions (`desc:`) and categories (`cat:`). */
export const QUICK_JUMPER_COPY: Readonly<Record<string, Copy>> = {
  'cat:총괄 & 시스템': { ko: '총괄 & 시스템', en: 'Overview & system', ja: '総括 & システム', zh: '总览 & 系统', vi: 'Tổng quan & hệ thống' },
  'cat:거시 경제 & 국고': { ko: '거시 경제 & 국고', en: 'Macroeconomy & treasury', ja: 'マクロ経済 & 国庫', zh: '宏观经济 & 国库', vi: 'Kinh tế vĩ mô & ngân khố' },
  'cat:시장 & 비즈니스': { ko: '시장 & 비즈니스', en: 'Market & business', ja: '市場 & ビジネス', zh: '市场 & 商业', vi: 'Thị trường & kinh doanh' },
  'cat:트래픽 & SEO': { ko: '트래픽 & SEO', en: 'Traffic & SEO', ja: 'トラフィック & SEO', zh: '流量 & SEO', vi: 'Lưu lượng & SEO' },
  'cat:회원 & 모더레이션': { ko: '회원 & 모더레이션', en: 'Members & moderation', ja: '会員 & モデレーション', zh: '会员 & 内容审核', vi: 'Thành viên & kiểm duyệt' },
  'cat:감사 로그 & 무결성': { ko: '감사 로그 & 무결성', en: 'Audit log & integrity', ja: '監査ログ & 完全性', zh: '审计日志 & 完整性', vi: 'Nhật ký kiểm toán & toàn vẹn' },

  'label:/admin': { ko: '대시보드', en: 'Dashboard', ja: 'ダッシュボード', zh: '仪表盘', vi: 'Bảng tổng quan' },
  'desc:/admin': { ko: '활성 유저, 24h 유통량, 노드 가동률 총괄 관제', en: 'Active members, 24h circulation and node uptime at a glance', ja: 'アクティブユーザー、24時間の流通量、ノード稼働率を総括監視', zh: '统一监控活跃用户、24 小时流通量与节点可用率', vi: 'Giám sát tổng thể người dùng hoạt động, lưu thông 24h và thời gian hoạt động của node' },
  'label:/admin/analytics': { ko: '그래프 분석', en: 'Graph analytics', ja: 'グラフ分析', zh: '图表分析', vi: 'Phân tích biểu đồ' },
  'desc:/admin/analytics': { ko: '코호트, 잔존율, DAU/MAU 지표 통계 시각화', en: 'Cohort, retention and DAU/MAU statistics visualised', ja: 'コホート、継続率、DAU/MAU指標の統計を可視化', zh: '同期群、留存率、DAU/MAU 指标统计可视化', vi: 'Trực quan hóa thống kê cohort, tỷ lệ giữ chân và DAU/MAU' },
  'label:/admin/api-health': { ko: 'API 관제 타워', en: 'API control tower', ja: 'API管制タワー', zh: 'API 控制塔', vi: 'Tháp điều khiển API' },
  'desc:/admin/api-health': { ko: '14대 도메인 300+개 API 헬스체크 및 레이턴시 모니터링', en: 'Health checks and latency monitoring for 300+ APIs across 14 domains', ja: '14ドメイン・300以上のAPIのヘルスチェックとレイテンシ監視', zh: '14 大领域 300+ 个 API 的健康检查与延迟监控', vi: 'Kiểm tra sức khỏe và giám sát độ trễ của hơn 300 API thuộc 14 miền' },
  'label:/admin/controls': { ko: '기능 스위치', en: 'Feature switches', ja: '機能スイッチ', zh: '功能开关', vi: 'Công tắc tính năng' },
  'desc:/admin/controls': { ko: '긴급 킬스위치, 피처 플래그 및 2FA 안전 토글', en: 'Emergency kill switches, feature flags and 2FA safety toggles', ja: '緊急キルスイッチ、機能フラグ、2FA安全トグル', zh: '紧急熔断开关、功能标志与 2FA 安全切换', vi: 'Công tắc khẩn cấp, cờ tính năng và nút an toàn 2FA' },
  'label:/admin/security': { ko: '보안·차단', en: 'Security & blocking', ja: 'セキュリティ・遮断', zh: '安全·封禁', vi: 'Bảo mật & chặn' },
  'desc:/admin/security': { ko: '의심 IP/세션 차단 및 Step-Up 2FA 모달 제어', en: 'Block suspicious IPs/sessions and control the step-up 2FA dialog', ja: '不審なIP/セッションの遮断とStep-Up 2FAモーダルの制御', zh: '封禁可疑 IP/会话并控制 Step-Up 2FA 弹窗', vi: 'Chặn IP/phiên đáng ngờ và điều khiển hộp thoại 2FA Step-Up' },

  'label:/admin/economy': { ko: '경제·원장', en: 'Economy & ledger', ja: '経済・元帳', zh: '经济·账本', vi: 'Kinh tế & sổ cái' },
  'desc:/admin/economy': { ko: '중앙은행(MCB) 통화정책 명령서, 조폐국 발행/소각 인증서', en: 'Central bank (MCB) policy orders and mint issue/burn certificates', ja: '中央銀行（MCB）の金融政策命令書、造幣局の発行/焼却証明書', zh: '中央银行（MCB）货币政策指令与造币局发行/销毁证书', vi: 'Lệnh chính sách tiền tệ của NHTW (MCB) và chứng nhận phát hành/hủy của xưởng đúc' },
  'label:/admin/mint': { ko: '국가조폐국', en: 'National mint', ja: '国家造幣局', zh: '国家造币局', vi: 'Xưởng đúc tiền quốc gia' },
  'desc:/admin/mint': { ko: '본원통화(M0) 발행/소각 인증서, 발행 동결 및 통화량 불변식 검증', en: 'Base money (M0) issue/burn certificates, issuance freeze and supply invariant checks', ja: 'マネタリーベース（M0）の発行/焼却証明書、発行凍結、通貨量不変条件の検証', zh: '基础货币（M0）发行/销毁证书、发行冻结与货币量不变式校验', vi: 'Chứng nhận phát hành/hủy tiền cơ sở (M0), đóng băng phát hành và kiểm tra bất biến cung tiền' },
  'label:/admin/central-bank': { ko: '중앙은행', en: 'Central bank', ja: '中央銀行', zh: '中央银行', vi: 'Ngân hàng trung ương' },
  'desc:/admin/central-bank': { ko: '금융통화위원회 기준금리, 지급준비율 정책 및 거시 통화 지표', en: 'Monetary policy board base rate, reserve ratio policy and macro money indicators', ja: '金融通貨委員会の政策金利、支払準備率政策、マクロ通貨指標', zh: '货币政策委员会基准利率、存款准备金率政策与宏观货币指标', vi: 'Lãi suất cơ bản, chính sách dự trữ bắt buộc và chỉ số tiền tệ vĩ mô' },
  'label:/admin/money-flow': { ko: '유저 자금 흐름 관제', en: 'Member money flow monitor', ja: 'ユーザー資金フロー監視', zh: '用户资金流向监控', vi: 'Giám sát dòng tiền người dùng' },
  'desc:/admin/money-flow': { ko: '전체 유저 입출금, 주식, 상점, 급여, 카지노 실시간 원장 추적', en: 'Live ledger tracking of all member deposits, withdrawals, stocks, shop, pay and casino', ja: '全ユーザーの入出金、株式、ショップ、給与、カジノのリアルタイム元帳追跡', zh: '实时追踪全体用户存取款、股票、商店、工资与赌场账本', vi: 'Theo dõi sổ cái thời gian thực về nạp/rút, cổ phiếu, cửa hàng, lương và casino của mọi người dùng' },
  'label:/admin/economy/scenario-lab': { ko: '경제 시나리오 랩', en: 'Economy scenario lab', ja: '経済シナリオラボ', zh: '经济情景实验室', vi: 'Phòng thí nghiệm kịch bản kinh tế' },
  'desc:/admin/economy/scenario-lab': { ko: 'M2 통화량의 읽기 전용 수학적 투사 (AI 심의 미실행)', en: 'Read-only mathematical projection of M2 money supply (no AI deliberation run)', ja: 'M2通貨量の読み取り専用の数理予測（AI審議は未実行）', zh: 'M2 货币量的只读数学推演（未执行 AI 审议）', vi: 'Dự phóng toán học chỉ đọc của cung tiền M2 (không chạy thẩm định AI)' },
  'label:/admin/treasury': { ko: '국고·비축금', en: 'Treasury & reserves', ja: '国庫・備蓄金', zh: '国库·储备金', vi: 'Ngân khố & quỹ dự trữ' },
  'desc:/admin/treasury': { ko: '2,500만 WLD 앵커, 85% 현금 정상화 및 자율 세수 회수', en: '25,000,000 WLD anchor, 85% cash normalisation and autonomous tax recovery', ja: '2,500万WLDのアンカー、85%の現金正常化、自律的な税収回収', zh: '2,500 万 WLD 锚定、85% 现金常态化与自主税收回收', vi: 'Mốc neo 25.000.000 WLD, chuẩn hóa 85% tiền mặt và thu hồi thuế tự động' },
  'label:/admin/treasury/grants': { ko: '창업 지원금 심사', en: 'Start-up grant review', ja: '創業支援金の審査', zh: '创业补助审核', vi: 'Xét duyệt trợ cấp khởi nghiệp' },
  'desc:/admin/treasury/grants': { ko: '창업 지원금 신청 심사 및 국고 원자적 지급 관제탑', en: 'Review start-up grant applications and control atomic treasury payouts', ja: '創業支援金の申請審査と国庫からのアトミック支給の管制塔', zh: '创业补助申请审核与国库原子化发放控制塔', vi: 'Xét duyệt đơn trợ cấp khởi nghiệp và điều khiển chi trả nguyên tử từ ngân khố' },
  'label:/admin/enterprises': { ko: '공기업·지배구조', en: 'Public enterprises & governance', ja: '公企業・ガバナンス', zh: '国企·治理结构', vi: 'Doanh nghiệp công & quản trị' },
  'desc:/admin/enterprises': { ko: 'WSHC 산하 에너지/인프라/금융 3사 30% 배당 및 알리오 공시', en: '30% dividends and ALIO disclosures for the three WSHC energy/infrastructure/finance companies', ja: 'WSHC傘下のエネルギー/インフラ/金融3社の30%配当とALIO公示', zh: 'WSHC 旗下能源/基建/金融三家公司 30% 分红与 ALIO 公示', vi: 'Cổ tức 30% và công bố ALIO của 3 công ty năng lượng/hạ tầng/tài chính thuộc WSHC' },
  'label:/admin/bonds': { ko: '국채 거래소', en: 'Bond exchange', ja: '国債取引所', zh: '国债交易所', vi: 'Sàn trái phiếu' },
  'desc:/admin/bonds': { ko: '대한민국 국채(KTB) 3종 발행, 24시간 레포 대출 및 이자 지급', en: 'Issue three Korean Treasury Bond (KTB) series, 24-hour repo loans and interest payments', ja: '韓国国債（KTB）3種の発行、24時間レポ貸付、利息支払い', zh: '发行 3 种韩国国债（KTB）、24 小时回购贷款与利息支付', vi: 'Phát hành 3 loại trái phiếu chính phủ (KTB), cho vay repo 24 giờ và trả lãi' },
  'label:/admin/pension': { ko: '국민연금 (NPS)', en: 'National pension (NPS)', ja: '国民年金（NPS）', zh: '国民年金（NPS）', vi: 'Lương hưu quốc gia (NPS)' },
  'desc:/admin/pension': { ko: '5단계 공적 연금 적립, 국고 100% 매칭 및 평생 기초연금', en: 'Five-tier public pension savings, 100% treasury matching and lifelong basic pension', ja: '5段階の公的年金積立、国庫100%マッチング、生涯基礎年金', zh: '5 级公共年金积累、国库 100% 配比与终身基础年金', vi: 'Tích lũy lương hưu công 5 bậc, ngân khố đối ứng 100% và lương hưu cơ bản trọn đời' },
  'label:/admin/kdic': { ko: '예금보험공사', en: 'Deposit insurance', ja: '預金保険公社', zh: '存款保险公司', vi: 'Bảo hiểm tiền gửi' },
  'desc:/admin/kdic': { ko: '1인당 50만 WLD 예금자보호, 예보기금 및 뱅크런 대위변제', en: '500,000 WLD per-member deposit protection, insurance fund and bank-run subrogation', ja: '1人あたり50万WLDの預金者保護、預金保険基金、取り付け時の代位弁済', zh: '每人 50 万 WLD 存款保护、存保基金与挤兑代位清偿', vi: 'Bảo vệ tiền gửi 500.000 WLD mỗi người, quỹ bảo hiểm và trả thay khi rút tiền ồ ạt' },
  'label:/admin/fx': { ko: '서울외환시장', en: 'Seoul FX market', ja: 'ソウル外国為替市場', zh: '首尔外汇市场', vi: 'Thị trường ngoại hối Seoul' },
  'desc:/admin/fx': { ko: '한국은행 100만 USD 외환보유액, 변동환율 및 스무딩 오퍼레이션', en: 'Bank of Korea USD 1,000,000 FX reserves, floating rate and smoothing operations', ja: '韓国銀行の100万USD外貨準備、変動相場、スムージングオペレーション', zh: '韩国银行 100 万美元外汇储备、浮动汇率与平滑操作', vi: 'Dự trữ ngoại hối 1.000.000 USD của Ngân hàng Hàn Quốc, tỷ giá thả nổi và nghiệp vụ làm mượt' },
  'label:/admin/bank': { ko: '은행·대출', en: 'Bank & loans', ja: '銀行・ローン', zh: '银行·贷款', vi: 'Ngân hàng & khoản vay' },
  'desc:/admin/bank': { ko: '시중은행 지급준비율, 신용대출 리스크 및 예적금 금리', en: 'Commercial bank reserve ratio, credit loan risk and deposit rates', ja: '市中銀行の支払準備率、信用貸付リスク、預金金利', zh: '商业银行存款准备金率、信用贷款风险与存款利率', vi: 'Tỷ lệ dự trữ ngân hàng thương mại, rủi ro tín dụng và lãi suất tiền gửi' },

  'label:/admin/market': { ko: '가상 시장', en: 'Virtual market', ja: '仮想市場', zh: '虚拟市场', vi: 'Thị trường ảo' },
  'desc:/admin/market': { ko: '10대 가상 상장사 호가창, 시장 감성 지수 및 틱 제어', en: 'Order books of the ten virtual listed companies, market sentiment index and tick control', ja: '仮想上場10社の板情報、市場センチメント指数、ティック制御', zh: '十大虚拟上市公司盘口、市场情绪指数与 tick 控制', vi: 'Sổ lệnh của 10 công ty niêm yết ảo, chỉ số tâm lý thị trường và điều khiển tick' },
  'label:/admin/market/ai-news': { ko: 'AI 시장 속보', en: 'AI market news', ja: 'AI市場速報', zh: 'AI 市场快讯', vi: 'Tin nhanh thị trường AI' },
  'desc:/admin/market/ai-news': { ko: 'LLM 기반 가상 증시 뉴스 및 긴급 기업 공시 생성', en: 'LLM-generated virtual market news and urgent corporate disclosures', ja: 'LLMによる仮想株式市場ニュースと緊急企業公示の生成', zh: '基于 LLM 生成虚拟股市新闻与紧急企业公告', vi: 'Tạo tin tức thị trường ảo và công bố khẩn của doanh nghiệp bằng LLM' },
  'label:/admin/catalog': { ko: '사업·시즌', en: 'Businesses & seasons', ja: '事業・シーズン', zh: '产业·赛季', vi: 'Kinh doanh & mùa' },
  'desc:/admin/catalog': { ko: '유저 사업체 등록 심사, 시즌 패스 퀘스트 및 티어 보상', en: 'Member business registration review, season pass quests and tier rewards', ja: 'ユーザー事業体の登録審査、シーズンパスのクエストとティア報酬', zh: '用户企业登记审核、赛季通行证任务与等级奖励', vi: 'Xét duyệt đăng ký doanh nghiệp, nhiệm vụ season pass và phần thưởng bậc' },
  'label:/admin/work': { ko: '작업·직업', en: 'Work & jobs', ja: '作業・職業', zh: '工作·职业', vi: 'Công việc & nghề' },
  'desc:/admin/work': { ko: '8대 전문직 파밍 쿼터, 에너지 소모율 및 숙련도 승급', en: 'Farming quotas for the eight professions, energy use rate and skill promotion', ja: '8大専門職のファーミング枠、エネルギー消費率、熟練度昇級', zh: '八大专业职业的采集配额、能量消耗率与熟练度晋升', vi: 'Hạn mức farm của 8 nghề chuyên môn, tốc độ tiêu hao năng lượng và thăng cấp kỹ năng' },
  'label:/admin/shop': { ko: '상점 관리', en: 'Shop management', ja: 'ショップ管理', zh: '商店管理', vi: 'Quản lý cửa hàng' },
  'desc:/admin/shop': { ko: '아이템 인벤토리, 한정판 상품 재고 및 WLD 가격 정책', en: 'Item inventory, limited-edition stock and WLD pricing policy', ja: 'アイテム在庫、限定商品の在庫、WLD価格ポリシー', zh: '物品库存、限量商品库存与 WLD 定价策略', vi: 'Kho vật phẩm, tồn kho hàng giới hạn và chính sách giá WLD' },

  'label:/admin/seo': { ko: 'SEO·색인 관제', en: 'SEO & indexing monitor', ja: 'SEO・インデックス監視', zh: 'SEO·索引监控', vi: 'Giám sát SEO & lập chỉ mục' },
  'desc:/admin/seo': { ko: '실시간 검색 봇(Googlebot, Yeti) 크롤링 로그 & GSC/IndexNow', en: 'Live search bot (Googlebot, Yeti) crawl logs & GSC/IndexNow', ja: '検索ボット（Googlebot、Yeti）のリアルタイムクロールログ & GSC/IndexNow', zh: '实时搜索机器人（Googlebot、Yeti）抓取日志 & GSC/IndexNow', vi: 'Nhật ký thu thập thời gian thực của bot tìm kiếm (Googlebot, Yeti) & GSC/IndexNow' },
  'label:/admin/seo-audit': { ko: '크롤러 수집 감사', en: 'Crawler collection audit', ja: 'クローラー収集監査', zh: '爬虫采集审计', vi: 'Kiểm tra thu thập của crawler' },
  'desc:/admin/seo-audit': { ko: '구조화 데이터 무결성 검증 및 일괄 색인 핑 전송', en: 'Structured data integrity checks and bulk index pings', ja: '構造化データの完全性検証と一括インデックスPing送信', zh: '结构化数据完整性校验与批量索引 ping 发送', vi: 'Kiểm tra toàn vẹn dữ liệu có cấu trúc và gửi ping lập chỉ mục hàng loạt' },
  'label:/admin/blog': { ko: '블로그 관리', en: 'Blog management', ja: 'ブログ管理', zh: '博客管理', vi: 'Quản lý blog' },
  'desc:/admin/blog': { ko: 'AI 금융 블로그 발행 목록 및 수동 생성·SEO 자동화 관제', en: 'AI finance blog publications, manual generation and SEO automation', ja: 'AI金融ブログの発行一覧と手動生成・SEO自動化の監視', zh: 'AI 金融博客发布列表与手动生成·SEO 自动化监控', vi: 'Danh sách bài blog tài chính AI, tạo thủ công và tự động hóa SEO' },

  'label:/admin/users': { ko: '회원 관리', en: 'Members', ja: '会員管理', zh: '会员管理', vi: 'Quản lý thành viên' },
  'desc:/admin/users': { ko: '전체 유저 디렉토리, WLD 잔고 조정, 권한 부여 및 제재', en: 'Member directory, WLD balance adjustments, role grants and sanctions', ja: '全ユーザーのディレクトリ、WLD残高調整、権限付与と制裁', zh: '全体用户目录、WLD 余额调整、权限授予与处罚', vi: 'Danh bạ người dùng, điều chỉnh số dư WLD, cấp quyền và xử phạt' },
  'label:/admin/support': { ko: '문의 채팅', en: 'Support chat', ja: 'お問い合わせチャット', zh: '咨询聊天', vi: 'Trò chuyện hỗ trợ' },
  'desc:/admin/support': { ko: '1:1 실시간 고객지원 티켓 및 관리자 전용 답변 콘솔', en: 'One-to-one live support tickets and the administrator reply console', ja: '1:1リアルタイムサポートチケットと管理者専用の返信コンソール', zh: '1:1 实时客服工单与管理员专用回复控制台', vi: 'Phiếu hỗ trợ trực tiếp 1:1 và bảng trả lời dành cho quản trị viên' },
  'label:/admin/content': { ko: '공지·갤러리', en: 'Notices & gallery', ja: 'お知らせ・ギャラリー', zh: '公告·图库', vi: 'Thông báo & thư viện' },
  'desc:/admin/content': { ko: '공식 공지사항 발행 및 커뮤니티 게시글 모더레이션', en: 'Publish official notices and moderate community posts', ja: '公式お知らせの発行とコミュニティ投稿のモデレーション', zh: '发布官方公告与审核社区帖子', vi: 'Đăng thông báo chính thức và kiểm duyệt bài viết cộng đồng' },
  'label:/admin/safety': { ko: '안전·삭제', en: 'Safety & takedown', ja: '安全・削除', zh: '安全·删除', vi: 'An toàn & gỡ bỏ' },
  'desc:/admin/safety': { ko: '미성년자 안전 보호 및 24시간 비회원 긴급 삭제(TAKE IT DOWN)', en: 'Minor safety protection and 24-hour non-member emergency takedown (TAKE IT DOWN)', ja: '未成年者の安全保護と24時間の非会員緊急削除（TAKE IT DOWN）', zh: '未成年人安全保护与 24 小时非会员紧急删除（TAKE IT DOWN）', vi: 'Bảo vệ an toàn trẻ vị thành niên và gỡ bỏ khẩn cấp 24 giờ cho người không phải thành viên (TAKE IT DOWN)' },
  'label:/admin/discord': { ko: 'Discord 봇', en: 'Discord bot', ja: 'Discordボット', zh: 'Discord 机器人', vi: 'Bot Discord' },
  'desc:/admin/discord': { ko: '음성 상주 데몬, 음악 플레이어 및 관리자 1:1 DM 알림', en: 'Resident voice daemon, music player and administrator one-to-one DM alerts', ja: '音声常駐デーモン、音楽プレーヤー、管理者への1:1 DM通知', zh: '语音常驻守护进程、音乐播放器与管理员 1:1 私信通知', vi: 'Daemon thoại thường trú, trình phát nhạc và thông báo DM 1:1 cho quản trị viên' },

  'label:/admin/logs': { ko: '전역 감사 로그', en: 'Global audit log', ja: 'グローバル監査ログ', zh: '全局审计日志', vi: 'Nhật ký kiểm toán toàn cục' },
  'desc:/admin/logs': { ko: '모든 관리자 권한 조작의 불변 시퀀스 및 감사 원장', en: 'Immutable sequence and audit ledger of every administrator action', ja: 'すべての管理者権限操作の不変シーケンスと監査元帳', zh: '所有管理员权限操作的不可变序列与审计账本', vi: 'Chuỗi bất biến và sổ kiểm toán của mọi thao tác quyền quản trị' },
  'label:/admin/logs/activity': { ko: '접속·체류 로그', en: 'Access & dwell log', ja: 'アクセス・滞在ログ', zh: '访问·停留日志', vi: 'Nhật ký truy cập & thời gian ở lại' },
  'desc:/admin/logs/activity': { ko: '유저 로그인, 세션 갱신 및 주요 페이지 클릭 텔레메트리', en: 'Member sign-ins, session renewals and key page click telemetry', ja: 'ユーザーのログイン、セッション更新、主要ページのクリックテレメトリ', zh: '用户登录、会话续期与主要页面点击遥测', vi: 'Đăng nhập, gia hạn phiên và dữ liệu nhấp chuột trên các trang chính' },
  'label:/admin/logs/delivery': { ko: 'Discord 전달 로그', en: 'Discord delivery log', ja: 'Discord配信ログ', zh: 'Discord 投递日志', vi: 'Nhật ký gửi Discord' },
  'desc:/admin/logs/delivery': { ko: '디스코드 채널 및 관리자 DM 아웃박스 전송 성공/실패 원장', en: 'Success/failure ledger for Discord channel and administrator DM outbox deliveries', ja: 'Discordチャンネルと管理者DMアウトボックス送信の成功/失敗元帳', zh: 'Discord 频道与管理员私信发件箱投递成功/失败账本', vi: 'Sổ thành công/thất bại khi gửi tới kênh Discord và hộp thư DM quản trị' },
  'label:/admin/logs/integrity': { ko: '해시체인 무결성', en: 'Hash chain integrity', ja: 'ハッシュチェーンの完全性', zh: '哈希链完整性', vi: 'Toàn vẹn chuỗi băm' },
  'desc:/admin/logs/integrity': { ko: 'PostgreSQL 감사 로그의 SHA-256 체인 위변조 전수 검증', en: 'Full SHA-256 chain tamper check of the PostgreSQL audit log', ja: 'PostgreSQL監査ログのSHA-256チェーン改ざんを全件検証', zh: '对 PostgreSQL 审计日志 SHA-256 链进行全量防篡改校验', vi: 'Kiểm tra toàn bộ chuỗi SHA-256 của nhật ký kiểm toán PostgreSQL để phát hiện giả mạo' },
};

/** Console home (app/admin/page.tsx). */
export const ADMIN_HOME_COPY = {
  metaTitle: {
    ko: '운영 마스터 관제탑 (Admin Cockpit) · Woldeok Admin',
    en: 'Operations Master Control Tower (Admin Cockpit) · Woldeok Admin',
    ja: '運営マスター管制塔（Admin Cockpit）· Woldeok Admin',
    zh: '运营总控制塔（Admin Cockpit）· Woldeok Admin',
    vi: 'Tháp điều hành tổng (Admin Cockpit) · Woldeok Admin',
  },
  groupSafetyTitle: { ko: '회원 보안 · 이상 거래 탐지', en: 'Member security · anomaly detection', ja: '会員セキュリティ · 異常取引検知', zh: '会员安全 · 异常交易检测', vi: 'Bảo mật thành viên · phát hiện giao dịch bất thường' },
  groupSafetyDescription: {
    ko: '사용자 권한, 이상 거래 차단, IP 보안 및 대외 공개 소식을 통제합니다.',
    en: 'Controls member permissions, anomalous-trade blocking, IP security and public news.',
    ja: 'ユーザー権限、異常取引の遮断、IPセキュリティ、対外公開のお知らせを管理します。',
    zh: '管控用户权限、异常交易拦截、IP 安全与对外公开消息。',
    vi: 'Kiểm soát quyền người dùng, chặn giao dịch bất thường, bảo mật IP và tin tức công khai.',
  },
  groupEconomyTitle: { ko: '가상 경제 · 핀테크 코어', en: 'Virtual economy · fintech core', ja: '仮想経済 · フィンテックコア', zh: '虚拟经济 · 金融科技核心', vi: 'Kinh tế ảo · lõi fintech' },
  groupEconomyDescription: {
    ko: '가상 주식 시장, 국고 비축금, 금융 서비스, 직업/사업 카탈로그를 운영합니다.',
    en: 'Runs the virtual stock market, treasury reserves, financial services and the job/business catalogue.',
    ja: '仮想株式市場、国庫備蓄金、金融サービス、職業/事業カタログを運営します。',
    zh: '运营虚拟股市、国库储备金、金融服务与职业/产业目录。',
    vi: 'Vận hành thị trường cổ phiếu ảo, quỹ dự trữ ngân khố, dịch vụ tài chính và danh mục nghề/kinh doanh.',
  },
  groupRecordsTitle: { ko: '감사 추적 · 텔레메트리 펄스', en: 'Audit trail · telemetry pulse', ja: '監査追跡 · テレメトリパルス', zh: '审计追踪 · 遥测脉搏', vi: 'Dấu vết kiểm toán · nhịp telemetry' },
  groupRecordsDescription: {
    ko: 'SHA-256 체인 무결성, 접속/체류 텔레메트리, 발송 기록을 실시간 추적합니다.',
    en: 'Tracks SHA-256 chain integrity, access/dwell telemetry and delivery records in real time.',
    ja: 'SHA-256チェーンの完全性、アクセス/滞在テレメトリ、送信記録をリアルタイムで追跡します。',
    zh: '实时追踪 SHA-256 链完整性、访问/停留遥测与发送记录。',
    vi: 'Theo dõi thời gian thực tính toàn vẹn chuỗi SHA-256, telemetry truy cập/ở lại và lịch sử gửi.',
  },
  unverifiedMembers: { ko: '회원', en: 'members', ja: '会員', zh: '会员', vi: 'thành viên' },
  unverifiedLedger: { ko: '원장', en: 'ledger', ja: '元帳', zh: '账本', vi: 'sổ cái' },
  unverifiedControls: { ko: '기능 스위치', en: 'feature switches', ja: '機能スイッチ', zh: '功能开关', vi: 'công tắc tính năng' },
  unverifiedMarket: { ko: '시장', en: 'market', ja: '市場', zh: '市场', vi: 'thị trường' },
  unverifiedSome: { ko: '일부', en: 'some', ja: '一部', zh: '部分', vi: 'một số' },
  heading: { ko: '운영 마스터 관제탑', en: 'Operations master control tower', ja: '運営マスター管制塔', zh: '运营总控制塔', vi: 'Tháp điều hành tổng' },
  allVerified: { ko: '모든 지표 정상 조회', en: 'All metrics loaded', ja: 'すべての指標を正常に取得', zh: '所有指标均已正常获取', vi: 'Đã tải đủ mọi chỉ số' },
  unverifiedBadge: {
    ko: '{names} 지표를 불러오지 못했어요',
    en: 'Could not load {names} metrics',
    ja: '{names}の指標を読み込めませんでした',
    zh: '无法加载{names}指标',
    vi: 'Không tải được chỉ số {names}',
  },
  subtitle: {
    ko: '실제 관리자 API에서 조회한 지표입니다. 불러오지 못한 항목은 따로 표시합니다.',
    en: 'Metrics come from the live administrator APIs. Anything that could not be loaded is marked separately.',
    ja: '実際の管理者APIから取得した指標です。読み込めなかった項目は別途表示します。',
    zh: '指标来自实际的管理员 API。未能加载的项目会单独标示。',
    vi: 'Các chỉ số lấy từ API quản trị thực tế. Mục nào không tải được sẽ được đánh dấu riêng.',
  },
  btnCentralBank: { ko: '중앙은행 발의·승인', en: 'Central bank proposals', ja: '中央銀行の発議・承認', zh: '央行提案·批准', vi: 'Đề xuất & phê duyệt NHTW' },
  btnKillSwitch: { ko: '킬스위치 제어', en: 'Kill switch control', ja: 'キルスイッチ制御', zh: '熔断开关控制', vi: 'Điều khiển công tắc khẩn' },
  btnMoneyFlow: { ko: '자금 흐름', en: 'Money flow', ja: '資金フロー', zh: '资金流向', vi: 'Dòng tiền' },
  ledgerVerified: {
    ko: '원장 정합성 보고 {at} (체인 해시 별도)',
    en: 'Ledger reconciliation reported {at} (chain hash checked separately)',
    ja: '元帳整合性レポート {at}（チェーンハッシュは別途）',
    zh: '账本一致性报告 {at}（链哈希另行校验）',
    vi: 'Báo cáo đối soát sổ cái {at} (hash chuỗi kiểm tra riêng)',
  },
  ledgerMismatch: {
    ko: '원장 정합성 이상 {at} — 조사 필요',
    en: 'Ledger reconciliation mismatch {at} — investigate',
    ja: '元帳整合性の異常 {at} — 調査が必要',
    zh: '账本一致性异常 {at} — 需要调查',
    vi: 'Sổ cái không khớp {at} — cần điều tra',
  },
  ledgerUnknown: {
    ko: '원장 정합성 확인 불가 — 재조회 필요',
    en: 'Ledger reconciliation unavailable — reload needed',
    ja: '元帳整合性を確認できません — 再照会が必要',
    zh: '无法确认账本一致性 — 需要重新查询',
    vi: 'Không xác nhận được đối soát sổ cái — cần tải lại',
  },
  treasuryTitle: { ko: '복식부기 원장 · 5대 금고', en: 'Double-entry ledger · five vaults', ja: '複式簿記元帳 · 5大金庫', zh: '复式记账账本 · 五大金库', vi: 'Sổ cái kép · năm kho quỹ' },
  treasuryPolicy: {
    ko: '세수 및 카지노 피구세(10%) 자동 분할 환원 정책 가동 중 (안전비축 30% 불변 가드)',
    en: 'Automatic split-return policy for tax revenue and the 10% casino levy is running (30% safety reserve guard is fixed)',
    ja: '税収とカジノ課徴金（10%）の自動分割還元ポリシーが稼働中（安全備蓄30%の不変ガード）',
    zh: '税收与赌场抽成（10%）自动分配返还政策运行中（30% 安全储备不变保护）',
    vi: 'Chính sách tự động chia hoàn thu thuế và phí casino (10%) đang chạy (bảo vệ cố định 30% dự trữ an toàn)',
  },
  barWelfare: { ko: '복지 40%', en: 'Welfare 40%', ja: '福祉 40%', zh: '福利 40%', vi: 'Phúc lợi 40%' },
  barTreasury: { ko: '국고 30%', en: 'Treasury 30%', ja: '国庫 30%', zh: '国库 30%', vi: 'Ngân khố 30%' },
  barRelief: { ko: '긴급구호 20%', en: 'Emergency relief 20%', ja: '緊急救護 20%', zh: '紧急救助 20%', vi: 'Cứu trợ khẩn cấp 20%' },
  barSafety: { ko: '안전비축 10%', en: 'Safety reserve 10%', ja: '安全備蓄 10%', zh: '安全储备 10%', vi: 'Dự trữ an toàn 10%' },
  legendWelfare: { ko: '복지 40%', en: 'Welfare 40%', ja: '福祉 40%', zh: '福利 40%', vi: 'Phúc lợi 40%' },
  legendTreasury: { ko: '국고 30%', en: 'Treasury 30%', ja: '国庫 30%', zh: '国库 30%', vi: 'Ngân khố 30%' },
  legendRelief: { ko: '구호 20%', en: 'Relief 20%', ja: '救護 20%', zh: '救助 20%', vi: 'Cứu trợ 20%' },
  legendSafety: { ko: '안전 10%', en: 'Safety 10%', ja: '安全 10%', zh: '安全 10%', vi: 'An toàn 10%' },
  killTitle: { ko: '비상 킬스위치', en: 'Emergency kill switches', ja: '緊急キルスイッチ', zh: '紧急熔断开关', vi: 'Công tắc khẩn cấp' },
  unavailable: { ko: '확인 불가', en: 'Unavailable', ja: '確認不可', zh: '无法确认', vi: 'Không xác nhận được' },
  noSwitches: { ko: '스위치 없음', en: 'No switches', ja: 'スイッチなし', zh: '无开关', vi: 'Không có công tắc' },
  switchesHeld: { ko: '{count}개 보류', en: '{count} held', ja: '{count}件保留', zh: '{count} 个暂停', vi: '{count} đang tạm dừng' },
  allNormal: { ko: '모두 정상', en: 'All normal', ja: 'すべて正常', zh: '全部正常', vi: 'Tất cả bình thường' },
  switchesTotal: { ko: '총 {count}개 플래그 관제', en: '{count} flags monitored', ja: '計{count}件のフラグを監視', zh: '共监控 {count} 个标志', vi: 'Đang giám sát {count} cờ' },
  noResponse: { ko: '서버 응답 미확인', en: 'No server response confirmed', ja: 'サーバー応答未確認', zh: '未确认服务器响应', vi: 'Chưa xác nhận phản hồi máy chủ' },
  stocksTitle: { ko: '가상 주식 시장', en: 'Virtual stock market', ja: '仮想株式市場', zh: '虚拟股市', vi: 'Thị trường cổ phiếu ảo' },
  stocksListed: { ko: '{count}종목 상장', en: '{count} listed', ja: '{count}銘柄上場', zh: '{count} 只上市', vi: '{count} mã niêm yết' },
  stocksHalted: { ko: '거래 정지 {count}종목', en: '{count} halted', ja: '取引停止 {count}銘柄', zh: '停牌 {count} 只', vi: '{count} mã tạm ngừng' },
  membersTitle: { ko: '조회된 회원', en: 'Members loaded', ja: '照会された会員', zh: '已查询会员', vi: 'Thành viên đã tải' },
  membersCount: { ko: '{count}명', en: '{count}', ja: '{count}人', zh: '{count} 人', vi: '{count} người' },
  membersUnavailable: { ko: '조회 불가', en: 'Unavailable', ja: '照会不可', zh: '无法查询', vi: 'Không tải được' },
  membersNote: {
    ko: '잔액 상위 100명 기준 (전체 회원 수 아님)',
    en: 'Top 100 by balance (not the total member count)',
    ja: '残高上位100人基準（全会員数ではありません）',
    zh: '按余额前 100 名统计（非会员总数）',
    vi: 'Theo 100 người có số dư cao nhất (không phải tổng số thành viên)',
  },
  tabLauncher: { ko: '핵심 퀵 런처', en: 'Quick launcher', ja: 'コアクイックランチャー', zh: '核心快捷入口', vi: 'Trình khởi chạy nhanh' },
  tabSurfaces: { ko: '27대 서피스 맵', en: 'Surface map', ja: '27面サーフェスマップ', zh: '27 个界面地图', vi: 'Bản đồ 27 khu vực' },
  tabTelemetry: { ko: '텔레메트리 펄스', en: 'Telemetry pulse', ja: 'テレメトリパルス', zh: '遥测脉搏', vi: 'Nhịp telemetry' },
  launcherTitle: { ko: '핵심 운영 관제 바로가기', en: 'Core operations shortcuts', ja: 'コア運営管制へのショートカット', zh: '核心运营控制快捷方式', vi: 'Lối tắt điều hành chính' },
  launchMoneyFlowTitle: { ko: '유저 자금 흐름', en: 'Member money flow', ja: 'ユーザー資金フロー', zh: '用户资金流向', vi: 'Dòng tiền người dùng' },
  launchMoneyFlowDesc: { ko: '입출금 전수 추적', en: 'Every deposit and withdrawal traced', ja: '入出金を全件追跡', zh: '全量追踪存取款', vi: 'Theo dõi mọi giao dịch nạp/rút' },
  launchTreasuryTitle: { ko: '국고 & 비축금', en: 'Treasury & reserves', ja: '国庫 & 備蓄金', zh: '国库 & 储备金', vi: 'Ngân khố & dự trữ' },
  launchTreasuryDesc: { ko: '원스톱 충전 · 5대 금고', en: 'One-stop top-up · five vaults', ja: 'ワンストップ補充 · 5大金庫', zh: '一站式充值 · 五大金库', vi: 'Nạp một chạm · năm kho quỹ' },
  launchSecurityTitle: { ko: '보안 · IP 차단', en: 'Security · IP blocking', ja: 'セキュリティ · IP遮断', zh: '安全 · IP 封禁', vi: 'Bảo mật · chặn IP' },
  launchSecurityDesc: { ko: '2FA OTP · 이상 거래', en: '2FA OTP · anomalous trades', ja: '2FA OTP · 異常取引', zh: '2FA OTP · 异常交易', vi: '2FA OTP · giao dịch bất thường' },
  launchNewsTitle: { ko: '주식 속보 제어', en: 'Stock news control', ja: '株式速報の制御', zh: '股市快讯控制', vi: 'Điều khiển tin nhanh cổ phiếu' },
  launchNewsDesc: { ko: '1시간 자동 시나리오', en: 'Hourly automatic scenarios', ja: '1時間ごとの自動シナリオ', zh: '每小时自动情景', vi: 'Kịch bản tự động mỗi giờ' },
  launchBlogTitle: { ko: 'AI 블로그 관리', en: 'AI blog management', ja: 'AIブログ管理', zh: 'AI 博客管理', vi: 'Quản lý blog AI' },
  launchBlogDesc: { ko: '에디토리얼 자동 발행', en: 'Automatic editorial publishing', ja: '記事の自動発行', zh: '社论自动发布', vi: 'Tự động xuất bản bài viết' },
  launchDiscordTitle: { ko: '디스코드 관제', en: 'Discord monitor', ja: 'Discord監視', zh: 'Discord 监控', vi: 'Giám sát Discord' },
  launchDiscordDesc: { ko: '관리자 1:1 DM 알림', en: 'Administrator one-to-one DM alerts', ja: '管理者への1:1 DM通知', zh: '管理员 1:1 私信通知', vi: 'Thông báo DM 1:1 cho quản trị viên' },
  launchBondsTitle: { ko: 'KTB 국채 발행', en: 'KTB bond issuance', ja: 'KTB国債の発行', zh: 'KTB 国债发行', vi: 'Phát hành trái phiếu KTB' },
  launchBondsDesc: { ko: '이자 쿠폰 자동 정산', en: 'Automatic coupon settlement', ja: '利息クーポンの自動精算', zh: '利息票息自动结算', vi: 'Tự động quyết toán lãi coupon' },
  launchPensionTitle: { ko: '국민연금 기금', en: 'National pension fund', ja: '国民年金基金', zh: '国民年金基金', vi: 'Quỹ lương hưu quốc gia' },
  launchPensionDesc: { ko: '1시간 정기 지급 스윕', en: 'Hourly scheduled payout sweep', ja: '1時間ごとの定期支給スイープ', zh: '每小时定期发放扫描', vi: 'Quét chi trả định kỳ mỗi giờ' },
  launchKdicTitle: { ko: '예금보험공사', en: 'Deposit insurance', ja: '預金保険公社', zh: '存款保险公司', vi: 'Bảo hiểm tiền gửi' },
  launchKdicDesc: { ko: '보호 한도 및 대위변제', en: 'Protection limits and subrogation', ja: '保護限度と代位弁済', zh: '保护限额与代位清偿', vi: 'Hạn mức bảo vệ và trả thay' },
  rankTitle: { ko: '조회된 회원 자산 순위', en: 'Loaded member wealth ranking', ja: '照会された会員の資産順位', zh: '已查询会员资产排名', vi: 'Xếp hạng tài sản thành viên đã tải' },
  rankUnavailable: { ko: '회원 자산 순위를 확인할 수 없습니다.', en: 'The member wealth ranking is unavailable.', ja: '会員の資産順位を確認できません。', zh: '无法确认会员资产排名。', vi: 'Không xác nhận được xếp hạng tài sản thành viên.' },
  rankEmpty: { ko: '조회 범위에 표시할 회원이 없습니다.', en: 'No members to show in the loaded range.', ja: '照会範囲に表示する会員がいません。', zh: '查询范围内没有可显示的会员。', vi: 'Không có thành viên nào để hiển thị trong phạm vi đã tải.' },
  telemetryUnavailable: {
    ko: '회원 텔레메트리를 확인할 수 없습니다. 서버 조회를 다시 시도하세요.',
    en: 'Member telemetry is unavailable. Try loading it from the server again.',
    ja: '会員テレメトリを確認できません。サーバー照会を再試行してください。',
    zh: '无法确认会员遥测。请重新向服务器查询。',
    vi: 'Không xác nhận được telemetry thành viên. Hãy thử tải lại từ máy chủ.',
  },
  telemetryNote: {
    ko: '전수 경제·회원 통계는 이 화면에서 검증되지 않았습니다. 한정된 회원 목록을 전체 인구·총자산으로 표시하지 않습니다.',
    en: 'Full economy and member statistics are not verified on this screen. A limited member list is not shown as the whole population or total wealth.',
    ja: '全数の経済・会員統計はこの画面では検証されていません。限定された会員一覧を全人口・総資産として表示しません。',
    zh: '本页面未验证全量经济·会员统计。不会将有限的会员列表显示为总人口·总资产。',
    vi: 'Thống kê kinh tế và thành viên toàn bộ chưa được xác minh trên màn hình này. Danh sách thành viên giới hạn không được hiển thị như toàn bộ dân số hay tổng tài sản.',
  },
  telemetryLink: { ko: '별도 통계 화면 확인', en: 'Open the statistics screen', ja: '統計画面を確認', zh: '查看独立统计页面', vi: 'Mở màn hình thống kê' },
  gateTitle: { ko: '운영 콘솔 게이트', en: 'Operations console gate', ja: '運営コンソールゲート', zh: '运营控制台入口', vi: 'Cổng bảng điều hành' },
  gateBody: {
    ko: '관리자 관제탑에 접근하려면 관리자 비밀번호 세션 잠금 해제가 필요합니다.',
    en: 'Unlock the administrator password session to enter the control tower.',
    ja: '管理者管制塔にアクセスするには、管理者パスワードセッションのロック解除が必要です。',
    zh: '进入管理员控制塔需要解锁管理员密码会话。',
    vi: 'Cần mở khóa phiên mật khẩu quản trị để truy cập tháp điều hành.',
  },
} as const satisfies Record<string, Copy>;

export type AdminHomeCopyKey = keyof typeof ADMIN_HOME_COPY;

/** Picks a tab label; an href without an entry keeps its Korean label rather than vanishing. */
export function adminTabLabel(href: string, korean: string, locale: Locale): string {
  const copy = ADMIN_TAB_COPY[href];
  return copy ? pick(locale, copy) : korean;
}

/** Picks a quick jumper string by its `label:`/`desc:`/`cat:` key, keeping the Korean when unknown. */
export function quickJumperText(key: string, korean: string, locale: Locale): string {
  const copy = QUICK_JUMPER_COPY[key];
  return copy ? pick(locale, copy) : korean;
}

/** Intl locale tags for dates and times only; money keeps its integer-string formatting. */
export const INTL_LOCALE: Readonly<Record<Locale, string>> = {
  ko: 'ko-KR', en: 'en-US', ja: 'ja-JP', zh: 'zh-CN', vi: 'vi-VN',
};
