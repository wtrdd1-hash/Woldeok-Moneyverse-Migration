import type { Copy } from '@/lib/copy';

/**
 * Five-locale copy for /admin/users (the page and the member directory). Korean is the
 * carried-over product copy and is kept byte-for-byte; `{name}` slots are filled after picking.
 * Member names, ids, reasons and amounts are data and are never translated.
 */
export const ADMIN_USERS_COPY = {
  // page.tsx
  pageIntro: {
    ko: '사용자를 검색해 상세 화면에서 활동 로그, 이용 제한, 로그인 세션을 함께 관리할 수 있습니다.',
    en: 'Search for a member and manage their activity log, restrictions and sign-in sessions on the detail screen.',
    ja: 'ユーザーを検索し、詳細画面でアクティビティログ、利用制限、ログインセッションをまとめて管理できます。',
    zh: '搜索用户后，可在详情页面统一管理活动日志、使用限制与登录会话。',
    vi: 'Tìm người dùng và quản lý nhật ký hoạt động, hạn chế sử dụng và phiên đăng nhập trên màn hình chi tiết.',
  },
  pageUnavailable: { ko: '사용자 목록을 불러오지 못했어요.', en: 'The member list could not be loaded.', ja: 'ユーザー一覧を読み込めませんでした。', zh: '无法加载用户列表。', vi: 'Không tải được danh sách người dùng.' },
  pageEmpty: { ko: '표시할 사용자가 없습니다.', en: 'There are no members to show.', ja: '表示するユーザーがいません。', zh: '没有可显示的用户。', vi: 'Không có người dùng nào để hiển thị.' },

  // user-directory.tsx
  noRecord: { ko: '기록 없음', en: 'No record', ja: '記録なし', zh: '无记录', vi: 'Không có bản ghi' },
  scopeComplete: {
    ko: '조회 시점에 추가 회원 행이 확인되지 않았습니다 ({count}명). 검색은 조회된 목록을 대상으로 합니다.',
    en: 'No further member rows were found when this was loaded ({count} members). Search covers the loaded list.',
    ja: '照会時点で追加の会員行は確認されませんでした（{count}人）。検索は照会された一覧が対象です。',
    zh: '查询时未发现更多会员记录（{count} 人）。搜索范围为已查询的列表。',
    vi: 'Không tìm thấy thêm dòng thành viên nào khi tải ({count} người). Tìm kiếm áp dụng cho danh sách đã tải.',
  },
  scopePartial: {
    ko: '정렬된 회원 최대 {limit}명만 표시합니다. 검색은 조회된 목록으로 제한되며, 아래 숫자는 전체 회원 통계가 아닙니다.',
    en: 'Showing at most {limit} sorted members. Search is limited to the loaded list, and the figures below are not whole-membership statistics.',
    ja: '並べ替えた会員を最大{limit}人まで表示します。検索は照会された一覧に限られ、以下の数値は全会員の統計ではありません。',
    zh: '仅显示排序后的最多 {limit} 名会员。搜索仅限已查询的列表，下方数字并非全体会员统计。',
    vi: 'Chỉ hiển thị tối đa {limit} thành viên đã sắp xếp. Tìm kiếm giới hạn trong danh sách đã tải và các con số dưới đây không phải thống kê toàn bộ thành viên.',
  },
  statLoaded: { ko: '조회된 회원', en: 'Members loaded', ja: '照会された会員', zh: '已查询会员', vi: 'Thành viên đã tải' },
  statActive: { ko: '조회된 정상 이용', en: 'Active (loaded)', ja: '照会された通常利用', zh: '已查询的正常使用', vi: 'Đang hoạt động (đã tải)' },
  statRestricted: { ko: '조회된 이용 제한', en: 'Restricted (loaded)', ja: '照会された利用制限', zh: '已查询的使用限制', vi: 'Bị hạn chế (đã tải)' },
  statNetWorth: { ko: '조회된 회원 순자산 합계', en: 'Net worth of loaded members', ja: '照会された会員の純資産合計', zh: '已查询会员净资产合计', vi: 'Tổng tài sản ròng của thành viên đã tải' },
  people: { ko: '{count}명', en: '{count}', ja: '{count}人', zh: '{count} 人', vi: '{count} người' },
  leaderTitle: {
    ko: '회원 부자 순위(Leaderboard) 및 자산 관리',
    en: 'Member wealth leaderboard and asset management',
    ja: '会員の資産ランキング（Leaderboard）と資産管理',
    zh: '会员财富排行榜（Leaderboard）与资产管理',
    vi: 'Bảng xếp hạng tài sản thành viên (Leaderboard) và quản lý tài sản',
  },
  leaderNoteBefore: {
    ko: '회원별 총 순자산 랭킹과 활동 상태를 확인하고, 각 행의 ',
    en: 'Review each member’s net worth ranking and activity, and use the ',
    ja: '会員ごとの純資産ランキングと活動状態を確認し、各行の',
    zh: '查看各会员的净资产排名与活动状态，并可通过每行的',
    vi: 'Xem xếp hạng tài sản ròng và trạng thái hoạt động của từng thành viên, rồi dùng nút ',
  },
  leaderNoteTag: { ko: '[쪽지]', en: '[Message]', ja: '[メッセージ]', zh: '[私信]', vi: '[Tin nhắn]' },
  leaderNoteAfter: {
    ko: ' 버튼을 통해 1:1 공식 공지 및 알림을 즉시 발송할 수 있습니다.',
    en: ' button on any row to send a one-to-one official notice or alert immediately.',
    ja: 'ボタンから1:1の公式お知らせや通知をすぐに送信できます。',
    zh: '按钮立即发送 1:1 官方公告与通知。',
    vi: ' ở mỗi dòng để gửi ngay thông báo chính thức hoặc cảnh báo 1:1.',
  },
  sortLabel: { ko: '정렬:', en: 'Sort:', ja: '並べ替え:', zh: '排序：', vi: 'Sắp xếp:' },
  sortWealth: { ko: '🏆 부자 순위 순', en: '🏆 Wealth rank', ja: '🏆 資産順位順', zh: '🏆 按财富排名', vi: '🏆 Theo hạng tài sản' },
  sortCash: { ko: '💵 현금 많은 순', en: '💵 Most cash', ja: '💵 現金の多い順', zh: '💵 按现金从多到少', vi: '💵 Nhiều tiền mặt nhất' },
  sortStock: { ko: '📈 주식 자산 순', en: '📈 Stock holdings', ja: '📈 株式資産順', zh: '📈 按股票资产', vi: '📈 Theo tài sản cổ phiếu' },
  sortLastSeen: { ko: '최근 접속 순', en: 'Recently active', ja: '最近のアクセス順', zh: '按最近访问', vi: 'Truy cập gần đây' },
  sortCreated: { ko: '최근 가입 순', en: 'Recently joined', ja: '最近の登録順', zh: '按最近注册', vi: 'Tham gia gần đây' },
  searchLabel: { ko: '사용자 검색', en: 'Search members', ja: 'ユーザー検索', zh: '搜索用户', vi: 'Tìm người dùng' },
  searchPlaceholder: { ko: '닉네임 또는 사용자 UUID 검색...', en: 'Search by nickname or member UUID...', ja: 'ニックネームまたはユーザーUUIDで検索...', zh: '搜索昵称或用户 UUID...', vi: 'Tìm theo biệt danh hoặc UUID người dùng...' },
  statusFilter: { ko: '사용자 상태 필터', en: 'Member status filter', ja: 'ユーザー状態フィルター', zh: '用户状态筛选', vi: 'Bộ lọc trạng thái người dùng' },
  filterAll: { ko: '전체', en: 'All', ja: 'すべて', zh: '全部', vi: 'Tất cả' },
  statusActive: { ko: '정상', en: 'Active', ja: '正常', zh: '正常', vi: 'Bình thường' },
  statusRestricted: { ko: '제한됨', en: 'Restricted', ja: '制限中', zh: '已限制', vi: 'Bị hạn chế' },
  matching: { ko: '조회 조건에 맞는 회원', en: 'Matching members', ja: '条件に一致する会員', zh: '符合条件的会员', vi: 'Thành viên phù hợp' },
  netWorthFormula: {
    ko: '순자산 = 지갑 현금 + 은행 예금 + 활성 국채 + 주식 실시간 평가액',
    en: 'Net worth = wallet cash + bank deposits + active bonds + live stock valuation',
    ja: '純資産 = 財布の現金 + 銀行預金 + 有効な国債 + 株式のリアルタイム評価額',
    zh: '净资产 = 钱包现金 + 银行存款 + 有效国债 + 股票实时估值',
    vi: 'Tài sản ròng = tiền mặt trong ví + tiền gửi ngân hàng + trái phiếu còn hiệu lực + giá trị cổ phiếu thời gian thực',
  },
  emptyComplete: { ko: '검색 조건과 일치하는 회원이 없습니다.', en: 'No members match your search.', ja: '検索条件に一致する会員はいません。', zh: '没有符合搜索条件的会员。', vi: 'Không có thành viên nào khớp với tìm kiếm.' },
  emptyPartial: {
    ko: '조회된 목록에서는 검색 조건과 일치하는 회원이 없습니다.',
    en: 'No members in the loaded list match your search.',
    ja: '照会された一覧には検索条件に一致する会員はいません。',
    zh: '已查询的列表中没有符合搜索条件的会员。',
    vi: 'Không có thành viên nào trong danh sách đã tải khớp với tìm kiếm.',
  },
  emptyHint: { ko: '검색어를 수정하거나 상태 필터를 변경해 보세요.', en: 'Try changing the search term or the status filter.', ja: '検索語を修正するか、状態フィルターを変更してみてください。', zh: '请尝试修改搜索词或更改状态筛选。', vi: 'Hãy thử đổi từ khóa hoặc bộ lọc trạng thái.' },
  colRank: { ko: '순위', en: 'Rank', ja: '順位', zh: '排名', vi: 'Hạng' },
  colMember: { ko: '회원 정보', en: 'Member', ja: '会員情報', zh: '会员信息', vi: 'Thành viên' },
  colNetWorth: { ko: '총 순자산', en: 'Net worth', ja: '総純資産', zh: '总净资产', vi: 'Tổng tài sản ròng' },
  colBreakdown: { ko: '자산 세부 구성', en: 'Asset breakdown', ja: '資産の内訳', zh: '资产明细', vi: 'Cơ cấu tài sản' },
  colLastSeen: { ko: '최근 접속', en: 'Last active', ja: '最近のアクセス', zh: '最近访问', vi: 'Truy cập gần nhất' },
  colStatus: { ko: '상태', en: 'Status', ja: '状態', zh: '状态', vi: 'Trạng thái' },
  colActions: { ko: '관리 조치', en: 'Actions', ja: '管理操作', zh: '管理操作', vi: 'Thao tác' },
  chipCash: { ko: '지갑 현금', en: 'Wallet cash', ja: '財布の現金', zh: '钱包现金', vi: 'Tiền mặt trong ví' },
  chipBank: { ko: '은행 예금', en: 'Bank deposits', ja: '銀行預金', zh: '银行存款', vi: 'Tiền gửi ngân hàng' },
  chipBond: { ko: '가상 국채', en: 'Virtual bonds', ja: '仮想国債', zh: '虚拟国债', vi: 'Trái phiếu ảo' },
  chipStock: { ko: '보유 주식 평가액', en: 'Stock valuation', ja: '保有株式の評価額', zh: '持股估值', vi: 'Giá trị cổ phiếu nắm giữ' },
  accessLastSeen: { ko: '최근 접속', en: 'Last active', ja: '最近のアクセス', zh: '最近访问', vi: 'Truy cập gần nhất' },
  accessLastLogin: { ko: '마지막 로그인', en: 'Last sign-in', ja: '最終ログイン', zh: '上次登录', vi: 'Lần đăng nhập cuối' },
  accessAdmin: { ko: '관리자 접속', en: 'Admin access', ja: '管理者アクセス', zh: '管理员访问', vi: 'Truy cập quản trị' },
  message: { ko: '쪽지', en: 'Message', ja: 'メッセージ', zh: '私信', vi: 'Tin nhắn' },
  details: { ko: '상세·로그', en: 'Details & log', ja: '詳細・ログ', zh: '详情·日志', vi: 'Chi tiết & nhật ký' },
  rankExcluded: { ko: '제외', en: 'Excluded', ja: '除外', zh: '排除', vi: 'Loại trừ' },
} as const satisfies Record<string, Copy>;

export type AdminUsersCopyKey = keyof typeof ADMIN_USERS_COPY;
