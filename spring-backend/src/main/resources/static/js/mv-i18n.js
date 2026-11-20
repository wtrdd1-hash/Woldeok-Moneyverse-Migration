/**
 * Woldeok Moneyverse Universal 5-Language & Auto-Translation Engine
 * Supported Locales: KO (한국어), EN (English), JA (日本語), ZH (简体中文), VI (Tiếng Việt)
 */
(function() {
  'use strict';

  const SUPPORTED_LOCALES = ['ko', 'en', 'ja', 'zh', 'vi'];
  const LOCALE_INFO = {
    ko: { name: '한국어', flag: '🇰🇷', code: 'KO' },
    en: { name: 'English', flag: '🇺🇸', code: 'EN' },
    ja: { name: '日本語', flag: '🇯🇵', code: 'JA' },
    zh: { name: '简体中文', flag: '🇨🇳', code: 'ZH' },
    vi: { name: 'Tiếng Việt', flag: '🇻🇳', code: 'VI' }
  };

  const I18N_DICT = {
    // Navigation & Global
    '홈': { en: 'Home', ja: 'ホーム', zh: '首页', vi: 'Trang chủ' },
    '홈 대시보드': { en: 'Home Dashboard', ja: 'ホームダッシュボード', zh: '主页仪表盘', vi: 'Bảng điều khiển' },
    '대시보드': { en: 'Dashboard', ja: 'ダッシュボード', zh: '仪表盘', vi: 'Bảng điều khiển' },
    '내 지갑': { en: 'My Wallet', ja: 'マイウォレット', zh: '我的钱包', vi: 'Ví của tôi' },
    '지갑': { en: 'Wallet', ja: 'ウォレット', zh: '钱包', vi: 'Ví' },
    '주식 거래소': { en: 'Stock Exchange', ja: '株式取引所', zh: '股票交易所', vi: 'Sàn Cổ phiếu' },
    '주식': { en: 'Stocks', ja: '株式', zh: '股票', vi: 'Cổ phiếu' },
    '퀘스트 센터': { en: 'Quest Center', ja: 'クエストセンター', zh: '任务中心', vi: 'Trung tâm Nhiệm vụ' },
    '퀘스트': { en: 'Quests', ja: 'クエスト', zh: '任务', vi: 'Nhiệm vụ' },
    '포인트 상점': { en: 'Point Shop', ja: 'ポイントショップ', zh: '积分商城', vi: 'Cửa hàng Điểm' },
    '상점': { en: 'Shop', ja: 'ショップ', zh: '商城', vi: 'Cửa hàng' },
    '자유 게시판': { en: 'Community Board', ja: '自由掲示板', zh: '社区公告栏', vi: 'Bảng Tin' },
    '게시판': { en: 'Board', ja: '掲示板', zh: '公告栏', vi: 'Bảng tin' },
    '실전 가이드': { en: 'Practical Guide', ja: '実践ガイド', zh: '实战指南', vi: 'Hướng dẫn Thực tế' },
    '가이드': { en: 'Guide', ja: 'ガイド', zh: '指南', vi: 'Hướng dẫn' },
    '시스템 상태': { en: 'System Status', ja: 'システム状態', zh: '系统状态', vi: 'Trạng thái Hệ thống' },
    '상태': { en: 'Status', ja: 'ステータス', zh: '状态', vi: 'Trạng thái' },
    '금융 계산기': { en: 'Financial Tools', ja: '金融計算ツール', zh: '金融计算器', vi: 'Công cụ Tài chính' },
    '도구': { en: 'Tools', ja: 'ツール', zh: '工具', vi: 'Công cụ' },
    '관리자': { en: 'Admin', ja: '管理者', zh: '管理员', vi: 'Quản trị viên' },
    '관리': { en: 'Admin', ja: '管理', zh: '管理', vi: 'Quản trị' },
    '로그인': { en: 'Sign In', ja: 'ログイン', zh: '登录', vi: 'Đăng nhập' },
    '회원가입': { en: 'Sign Up', ja: '新規登録', zh: '注册', vi: 'Đăng ký' },
    '로그아웃': { en: 'Sign Out', ja: 'ログアウト', zh: '退出', vi: 'Đăng xuất' },
    'MY 계정': { en: 'My Account', ja: 'マイアカウント', zh: '我的账户', vi: 'Tài khoản của tôi' },

    // Admin Specific
    '운영 총괄 관제탑 (Admin Cockpit)': { en: 'Admin Control Tower (Cockpit)', ja: '運営総括管制塔 (Admin Cockpit)', zh: '总控驾驶舱 (Admin Cockpit)', vi: 'Tháp Kiểm soát Tổng thể (Cockpit)' },
    '운영 마스터 관제탑 (Admin Cockpit)': { en: 'Admin Control Tower (Cockpit)', ja: '運営総括管制塔 (Admin Cockpit)', zh: '总控驾驶舱 (Admin Cockpit)', vi: 'Tháp Kiểm soát Tổng thể (Cockpit)' },
    '관리자 대시보드': { en: 'Admin Dashboard', ja: '管理者ダッシュボード', zh: '管理员控制台', vi: 'Bảng điều khiển Quản trị' },
    '운영 현황과 권한 기록을 정확하게 확인하는 관제 센터': { en: 'Central command for verified operations, ledger records and permission audit', ja: '運用状況と権限記録を正確に確認する管制センター', zh: '精准监控运营状态与权限审计的指挥中心', vi: 'Trung tâm chỉ huy xác thực vận hành và kiểm toán quyền hạn' },
    '실시간 금융 원장, 35개 서브시스템 관제 및 시스템 제어 센터': { en: 'Real-time financial ledger, 35 subsystem telemetry and system killswitch hub', ja: 'リアルタイム金融元帳、35のサブシステム監視およびシステム制御センター', zh: '实时金融账本、35个子系统遥测及紧急控制中心', vi: 'Sổ cái tài chính thời gian thực và 35 hệ thống con' },
    '전체 (35)': { en: 'All (35)', ja: 'すべて (35)', zh: '全部 (35)', vi: 'Tất cả (35)' },
    '거시·금융': { en: 'Macro / Finance', ja: 'マクロ・金融', zh: '宏观与金融', vi: 'Vĩ mô & Tài chính' },
    '국고·세정': { en: 'Treasury & Tax', ja: '国庫・税制', zh: '国库与税务', vi: 'Kho bạc & Thuế' },
    '시장·기업': { en: 'Market & Corp', ja: '市場・企業', zh: '市场与企业', vi: 'Thị trường & Doanh nghiệp' },
    '보안·감사': { en: 'Security & Audit', ja: 'セキュリティ・監査', zh: '安全与审计', vi: 'Bảo mật & Kiểm toán' },
    '유저·콘텐츠': { en: 'Users & Content', ja: 'ユーザー・コンテンツ', zh: '用户与内容', vi: 'Người dùng & Nội dung' },
    '시스템·관제': { en: 'System & Ops', ja: 'システム・運用', zh: '系统与运维', vi: 'Hệ thống & Vận hành' },
    '2FA 승격 (15분)': { en: '2FA Elevate (15m)', ja: '2FA昇格 (15分)', zh: '2FA权限提升 (15分)', vi: 'Nâng cấp 2FA (15p)' },
    '2FA 승격': { en: '2FA Elevate', ja: '2FA昇格', zh: '2FA权限提升', vi: 'Nâng cấp 2FA' },
    '빠른 관리 바로가기': { en: 'Quick Management Launcher', ja: 'クイック管理ショートカット', zh: '快捷管理入口', vi: 'Lối tắt Quản lý' },
    '회원 / 권한': { en: 'Users & Roles', ja: '会員・権限', zh: '用户与权限', vi: 'Người dùng & Quyền' },
    '거래 / 자산': { en: 'Trading & Ledger', ja: '取引・資産', zh: '交易与资产', vi: 'Giao dịch & Sổ cái' },
    '상점 / 아이템': { en: 'Shop & Items', ja: 'ショップ・アイテム', zh: '商城与道具', vi: 'Cửa hàng & Vật phẩm' },
    '공지 / 블로그': { en: 'Notices & Blog', ja: 'お知らせ・ブログ', zh: '公告与博客', vi: 'Thông báo & Blog' },
    '로그 / 보안': { en: 'Logs & Security', ja: 'ログ・セキュリティ', zh: '日志与安全', vi: 'Nhật ký & Bảo mật' },
    '회원 관리': { en: 'User Directory', ja: '会員管理', zh: '用户管理', vi: 'Quản lý Người dùng' },
    '경제 / 자산': { en: 'Economy & Assets', ja: '経済・資産', zh: '经济与资产', vi: 'Kinh tế & Tài sản' },
    '아이템 관리': { en: 'Item Catalog', ja: 'アイテム管理', zh: '道具管理', vi: 'Quản lý Vật phẩm' },
    '콘텐츠 관리': { en: 'Content Management', ja: 'コンテンツ管理', zh: '内容管理', vi: 'Quản lý Nội dung' },
    '거래 / 시장': { en: 'Market Trading', ja: '取引・市場', zh: '交易与市场', vi: 'Thị trường Giao dịch' },
    '통계 / 분석': { en: 'Analytics', ja: '統計・分析', zh: '统计与分析', vi: 'Thống kê & Phân tích' },
    '보안 / 권한': { en: 'Security & Auth', ja: 'セキュリティ・権限', zh: '安全与权限', vi: 'Bảo mật & Quyền hạn' },
    '가상 경제 / 원장': { en: 'Virtual Economy / Ledger', ja: '仮想経済・元帳', zh: '虚拟经济与账本', vi: 'Kinh tế Ảo / Sổ cái' },
    '복식부기 원장 동기화 정상': { en: 'Double-entry ledger verified in sync', ja: '複式簿記元帳の同期正常', zh: '复式簿记账本同步正常', vi: 'Sổ cái kép đồng bộ chuẩn xác' },
    '서버·API 점검 목록': { en: 'Server & API Health Status', ja: 'サーバー・API点検リスト', zh: '服务与API健康监测', vi: 'Kiểm tra Máy chủ & API' },
    '실시간 백엔드 서비스 가동 상태': { en: 'Live runtime service operational telemetry', ja: 'リアルタイムバックエンド稼働状態', zh: '实时后端服务运行状态', vi: 'Trạng thái hoạt động máy chủ trực tiếp' },
    '웹 서버 (Nginx)': { en: 'Web Server (Nginx)', ja: 'ウェブサーバー (Nginx)', zh: '网页服务器 (Nginx)', vi: 'Máy chủ Web (Nginx)' },
    '정상 (Port 443)': { en: 'Healthy (Port 443)', ja: '正常 (Port 443)', zh: '正常 (Port 443)', vi: 'Bình thường (Port 443)' },
    '정상 (Port 4550)': { en: 'Healthy (Port 4550)', ja: '正常 (Port 4550)', zh: '正常 (Port 4550)', vi: 'Bình thường (Port 4550)' },
    '정상 (Port 5433)': { en: 'Healthy (Port 5433)', ja: '正常 (Port 5433)', zh: '正常 (Port 5433)', vi: 'Bình thường (Port 5433)' },
    '운영 모니터링': { en: 'Operations Telemetry', ja: '運用監視テレメトリ', zh: '运营监控遥测', vi: 'Giám sát Vận hành' },
    '실시간 거래 지수 및 지표 추이': { en: 'Live transaction volume and stability trend', ja: 'リアルタイム取引指数および指標推移', zh: '实时交易指数与趋势指标', vi: 'Xu hướng chỉ số giao dịch trực tiếp' },
    '긴급 시스템 제어 (Kill Switch)': { en: 'Emergency System Controls (Kill Switch)', ja: '緊急システム制御 (Kill Switch)', zh: '紧急系统控制 (Kill Switch)', vi: 'Điều khiển Khẩn cấp (Kill Switch)' },
    '위험 시나리오 즉각 차단 및 피처 플래그': { en: 'Immediate circuit breaker and feature flags', ja: '危険シナリオの即時遮断と機能フラグ', zh: '高危熔断与功能开关', vi: 'Cầu dao khẩn cấp và cờ tính năng' },
    '카지노 베팅': { en: 'Casino Betting', ja: 'カジノベッティング', zh: '娱乐场投注', vi: 'Đặt cược Casino' },
    '주식 거래소 매매': { en: 'Stock Market Trading', ja: '株式市場取引', zh: '股市交易', vi: 'Giao dịch Cổ phiếu' },
    '유저 간 빠른 송금': { en: 'P2P Instant Transfer', ja: 'P2P即時送金', zh: '用户快速转账', vi: 'Chuyển tiền Nhanh P2P' },
    '신규 회원가입': { en: 'New Registration', ja: '新規会員登録', zh: '新用户注册', vi: 'Đăng ký Mới' },
    '은행 예적금 가입': { en: 'Banking Deposits', ja: '銀行預金加入', zh: '银行存款申购', vi: 'Gửi Tiết kiệm Ngân hàng' },
    'AI 블로그 자동 발행': { en: 'AI Blog Auto-Publish', ja: 'AIブログ自動公開', zh: 'AI博客自动发布', vi: 'Tự động Đăng Blog AI' },
    '정상 가동': { en: 'ACTIVE', ja: '稼働中', zh: '正常运行', vi: 'Đang hoạt động' },
    '즉시 차단': { en: 'HALTED', ja: '遮断中', zh: '已暂停', vi: 'Đã tạm dừng' },
    '조폐국': { en: 'National Mint', ja: '造幣局', zh: '造币局', vi: 'Cục Đúc tiền' },
    '중앙은행': { en: 'Central Bank', ja: '中央銀行', zh: '中央银行', vi: 'Ngân hàng Trung ương' },
    '국고·비축': { en: 'Treasury & Reserves', ja: '国庫・備蓄', zh: '国库与储备', vi: 'Kho bạc & Dự trữ' },
    '공기업·지배구조': { en: 'State Enterprises & Gov', ja: '公企業・ガバナンス', zh: '国企与治理', vi: 'Doanh nghiệp Nhà nước' },
    '국채 거래소': { en: 'Treasury Bonds', ja: '国債取引所', zh: '国债交易所', vi: 'Trái phiếu Chính phủ' },
    '국민연금': { en: 'National Pension', ja: '国民年金', zh: '国民年金', vi: 'Quỹ Hưu trí Quốc gia' },
    '서울외환시장': { en: 'FX Currency Market', ja: 'ソウル外国為替市場', zh: '首尔外汇市场', vi: 'Thị trường Ngoại hối' },
    '창업 지원금 심사': { en: 'Startup Grants Audit', ja: '創業支援金審査', zh: '创业补贴审批', vi: 'Thẩm định Trợ cấp Khởi nghiệp' },
    '예금보험공사': { en: 'Deposit Insurance (KDIC)', ja: '預金保険公社', zh: '存款保险公司', vi: 'Bảo hiểm Tiền gửi' },
    '사업·시즌': { en: 'Seasons & Ventures', ja: '事業・シーズン', zh: '商业与赛季', vi: 'Kinh doanh & Mùa giải' },
    '작업·직업': { en: 'Career & Jobs', ja: '職業・ジョブ', zh: '工作与职业', vi: 'Nghề nghiệp & Việc làm' },
    '상점 관리': { en: 'Shop Management', ja: 'ショップ管理', zh: '商城管理', vi: 'Quản lý Cửa hàng' },
    '보안·차단': { en: 'Security & Banlist', ja: 'セキュリティ・遮断', zh: '安全与封禁', vi: 'Bảo mật & Chặn' },
    '문의 채팅': { en: 'Support Desk', ja: '問い合わせチャット', zh: '客服工单', vi: 'Trò chuyện Hỗ trợ' },
    '경제·원장': { en: 'Ledger & Economy', ja: '経済・元帳', zh: '经济与总账', vi: 'Kinh tế & Sổ cái' },
    '유저 자금 흐름': { en: 'Money Flow Telemetry', ja: 'ユーザー資金フロー', zh: '资金流向监控', vi: 'Dòng tiền Người dùng' },
    '그래프 분석': { en: 'Graph Analytics', ja: 'グラフ分析', zh: '图表分析', vi: 'Phân tích Biểu đồ' },
    'API 관제': { en: 'API Telemetry', ja: 'API監視', zh: 'API遥测监控', vi: 'Giám sát API' },
    'SEO·색인': { en: 'SEO & Indexing', ja: 'SEO・インデックス', zh: 'SEO与索引', vi: 'SEO & Lập chỉ mục' },
    '블로그 관리': { en: 'Editorial & Blog', ja: 'ブログ管理', zh: '博客管理', vi: 'Quản lý Blog' },
    '시나리오 랩': { en: 'Scenario Lab', ja: 'シナリオラボ', zh: '场景实验室', vi: 'Phòng Thử nghiệm' },
    'AI 시장 뉴스': { en: 'AI Market Intelligence', ja: 'AI市場ニュース', zh: 'AI市场快讯', vi: 'Tin tức Thị trường AI' },
    '디스코드 봇': { en: 'Discord Bot Ops', ja: 'Discordボット運用', zh: 'Discord机器人', vi: 'Bot Discord' },
    '운영 스토리지': { en: 'Cloud Storage & Backups', ja: '運用ストレージ・バックアップ', zh: '存储与云备份', vi: 'Lưu trữ & Sao lưu' },
    '감사 로그': { en: 'Audit Logs', ja: '監査ログ', zh: '审计日志', vi: 'Nhật ký Kiểm toán' },
    '에러 로그': { en: 'Error Logs', ja: 'エラーログ', zh: '错误日志', vi: 'Nhật ký Lỗi' },
    '시스템 로그': { en: 'System Logs', ja: 'システムログ', zh: '系统日志', vi: 'Nhật ký Hệ thống' },
    '무결성 검증': { en: 'Integrity Verification', ja: '整合性検証', zh: '完整性校验', vi: 'Xác thực Toàn vẹn' },
    '배송 로그': { en: 'Delivery Logs', ja: '配送ログ', zh: '交付记录', vi: 'Nhật ký Giao nhận' },
    '안전 센터': { en: 'Safety Center', ja: 'セーフティセンター', zh: '安全中心', vi: 'Trung tâm An toàn' },
    'SEO 감사': { en: 'SEO Diagnostics', ja: 'SEO監査', zh: 'SEO审计', vi: 'Kiểm toán SEO' },
    '킬스위치/제어': { en: 'Controls & Switches', ja: 'キルスイッチ・制御', zh: '控制台与开关', vi: 'Kiểm soát & Ngắt khẩn' },

    // Financial & Wallet
    '총 보유 자산': { en: 'Total Net Worth', ja: '総保有資産', zh: '总持仓资产', vi: 'Tổng Tài sản Ròng' },
    '사용 가능 자산': { en: 'Available Balance', ja: '利用可能額', zh: '可用资金', vi: 'Số dư Khả dụng' },
    '실시간 10단 호가창': { en: 'Level 2 Order Book (10 Depths)', ja: 'リアルタイム10本気配値', zh: '实时十档盘口', vi: 'Sổ Lệnh 10 Cấp Trực tiếp' },
    '빠른 송금': { en: 'Instant Transfer', ja: 'クイック送金', zh: '快速转账', vi: 'Chuyển tiền Nhanh' },
    '받는 사람': { en: 'Recipient', ja: '受取人', zh: '收款人', vi: 'Người nhận' },
    '송금 금액': { en: 'Amount', ja: '送金額', zh: '转账金额', vi: 'Số tiền' },
    '송금하기': { en: 'Send Transfer', ja: '送金する', zh: '确认转账', vi: 'Thực hiện Chuyển' },
    '수수료 무료': { en: '0% Zero Fee', ja: '手数料無料', zh: '免手续费', vi: 'Miễn phí 0%' },

    // Language Modal & Common
    '언어 및 통화 설정': { en: 'Language & Currency Settings', ja: '言語・通貨設定', zh: '语言与货币设置', vi: 'Cài đặt Ngôn ngữ & Tiền tệ' },
    '자동 번역 (브라우저 자동 감지)': { en: 'Auto-Translate (Browser Detected)', ja: '自動翻訳 (ブラウザ自動検出)', zh: '自动翻译 (按浏览器识别)', vi: 'Tự động Dịch (Theo Trình duyệt)' },
    '현재 적용된 언어': { en: 'Active Language', ja: '現在の言語', zh: '当前语言', vi: 'Ngôn ngữ Hiện tại' },
    '닫기': { en: 'Close', ja: '閉じる', zh: '关闭', vi: 'Đóng' }
  };

  function getStoredLocale() {
    try {
      const param = new URLSearchParams(window.location.search).get('lang');
      if (param && SUPPORTED_LOCALES.includes(param.toLowerCase())) return param.toLowerCase();
      const stored = localStorage.getItem('wdmv_locale');
      if (stored && SUPPORTED_LOCALES.includes(stored)) return stored;
      const match = document.cookie.match(/(?:^|;\s*)wdmv_locale=([^;]+)/);
      if (match && SUPPORTED_LOCALES.includes(match[1])) return match[1];
    } catch (e) {}

    // Auto-detect from browser
    const navLangs = navigator.languages || [navigator.language || 'ko'];
    for (const l of navLangs) {
      const code = l.toLowerCase();
      if (code.startsWith('ko')) return 'ko';
      if (code.startsWith('en')) return 'en';
      if (code.startsWith('ja')) return 'ja';
      if (code.startsWith('zh')) return 'zh';
      if (code.startsWith('vi')) return 'vi';
    }
    return 'ko';
  }

  let currentLocale = getStoredLocale();

  function setLocale(newLocale) {
    if (!SUPPORTED_LOCALES.includes(newLocale)) return;
    currentLocale = newLocale;
    try {
      localStorage.setItem('wdmv_locale', newLocale);
      document.cookie = `wdmv_locale=${newLocale};path=/;max-age=31536000;SameSite=Lax`;
    } catch (e) {}
    document.documentElement.lang = newLocale;
    document.documentElement.dataset.locale = newLocale;

    updateUI();
    translateDOM();
    window.dispatchEvent(new CustomEvent('moneyverse:localeChanged', { detail: { locale: newLocale } }));
  }

  function translateText(text, targetLocale) {
    if (!text || targetLocale === 'ko') return text;
    const trimmed = text.trim();
    if (I18N_DICT[trimmed] && I18N_DICT[trimmed][targetLocale]) {
      return text.replace(trimmed, I18N_DICT[trimmed][targetLocale]);
    }
    return text;
  }

  function translateDOM() {
    if (currentLocale === 'ko') {
      // Revert or restore
      document.querySelectorAll('[data-original-text]').forEach(el => {
        el.textContent = el.getAttribute('data-original-text');
      });
      return;
    }

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        const parent = node.parentElement;
        if (!parent || parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE' || parent.tagName === 'NOSCRIPT' || parent.closest('.no-translate')) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const nodesToTranslate = [];
    while (walker.nextNode()) {
      nodesToTranslate.push(walker.currentNode);
    }

    nodesToTranslate.forEach(node => {
      const raw = node.nodeValue;
      const trimmed = raw.trim();
      if (I18N_DICT[trimmed] && I18N_DICT[trimmed][currentLocale]) {
        if (!node.parentElement.hasAttribute('data-original-text')) {
          node.parentElement.setAttribute('data-original-text', trimmed);
        }
        node.nodeValue = raw.replace(trimmed, I18N_DICT[trimmed][currentLocale]);
      }
    });

    // Also translate elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (I18N_DICT[key] && I18N_DICT[key][currentLocale]) {
        el.textContent = I18N_DICT[key][currentLocale];
      }
    });
  }

  function injectLanguageSwitcher() {
    // If a language switcher trigger exists, attach dropdown
    const triggers = document.querySelectorAll('.mv-lang-btn, [data-slot="dropdown-menu-trigger"][aria-label*="언어"], #radix-_R_3qhajb_');
    triggers.forEach(btn => {
      btn.innerHTML = `
        <span class="mv-lang-flag" style="font-size: 15px; margin-right: 4px;">${LOCALE_INFO[currentLocale].flag}</span>
        <span class="mv-lang-code" style="font-family: monospace; font-weight: 800;">${LOCALE_INFO[currentLocale].code}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 2px; opacity: 0.7;"><path d="m6 9 6 6 6-6"/></svg>
      `;
      btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleLanguageModal();
      };
    });
  }

  function toggleLanguageModal() {
    let modal = document.getElementById('mv-language-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'mv-language-modal';
      modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(8px);
        display: flex; align-items: center; justify-content: center;
        z-index: 99999; opacity: 0; pointer-events: none; transition: opacity 0.2s ease;
      `;
      modal.innerHTML = `
        <div class="mv-modal-box" style="
          background: #151d32; border: 1px solid rgba(156, 131, 255, 0.35);
          border-radius: 16px; padding: 24px; width: 90%; max-width: 420px;
          box-shadow: 0 16px 40px rgba(0,0,0,0.6); color: #ffffff;
          display: flex; flex-direction: column; gap: 16px;
        ">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(168, 188, 216, 0.12); padding-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 20px;">🌐</span>
              <span style="font-weight: 800; font-size: 16px;">언어 설정 (5개국어 지원)</span>
            </div>
            <button id="mv-lang-modal-close" style="background: none; border: none; color: #a8bcd8; font-size: 20px; cursor: pointer;">✕</button>
          </div>
          <div style="background: rgba(156, 131, 255, 0.08); border: 1px solid rgba(156, 131, 255, 0.2); border-radius: 10px; padding: 12px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 13px; font-weight: 600; color: #c4b5fd;">실시간 브라우저 자동 번역</span>
            <span style="font-size: 11px; font-weight: 800; background: #4ade80; color: #000; padding: 2px 8px; border-radius: 4px;">ACTIVE</span>
          </div>
          <div id="mv-lang-list" style="display: flex; flex-direction: column; gap: 8px;">
            ${SUPPORTED_LOCALES.map(loc => `
              <button data-set-lang="${loc}" style="
                display: flex; align-items: center; justify-content: space-between;
                padding: 12px 16px; border-radius: 10px; border: 1px solid ${currentLocale === loc ? 'rgba(156, 131, 255, 0.5)' : 'rgba(168, 188, 216, 0.1)'};
                background: ${currentLocale === loc ? 'rgba(156, 131, 255, 0.16)' : 'rgba(21, 29, 50, 0.6)'};
                color: #ffffff; cursor: pointer; transition: all 0.15s ease; text-align: left;
              ">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <span style="font-size: 22px;">${LOCALE_INFO[loc].flag}</span>
                  <div>
                    <div style="font-weight: 800; font-size: 14px;">${LOCALE_INFO[loc].name}</div>
                    <div style="font-size: 11px; color: #a8bcd8;">ISO-639: ${loc.toUpperCase()}</div>
                  </div>
                </div>
                ${currentLocale === loc ? '<span style="color: #9c83ff; font-weight: 900; font-size: 16px;">✓</span>' : ''}
              </button>
            `).join('')}
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      modal.addEventListener('click', (e) => {
        if (e.target === modal) toggleLanguageModal();
      });
      document.getElementById('mv-lang-modal-close').onclick = toggleLanguageModal;

      modal.querySelectorAll('[data-set-lang]').forEach(b => {
        b.onclick = () => {
          setLocale(b.getAttribute('data-set-lang'));
          toggleLanguageModal();
        };
      });
    }

    const isOpen = modal.style.opacity === '1';
    if (isOpen) {
      modal.style.opacity = '0';
      modal.style.pointerEvents = 'none';
    } else {
      modal.style.opacity = '1';
      modal.style.pointerEvents = 'auto';
    }
  }

  function updateUI() {
    const triggers = document.querySelectorAll('.mv-lang-btn, [data-slot="dropdown-menu-trigger"][aria-label*="언어"], #radix-_R_3qhajb_');
    triggers.forEach(btn => {
      const codeSpan = btn.querySelector('.mv-lang-code') || btn.querySelector('span.font-mono');
      const flagSpan = btn.querySelector('.mv-lang-flag');
      if (codeSpan) codeSpan.textContent = LOCALE_INFO[currentLocale].code;
      if (flagSpan) flagSpan.textContent = LOCALE_INFO[currentLocale].flag;
    });

    const modalList = document.getElementById('mv-lang-list');
    if (modalList) {
      modalList.querySelectorAll('[data-set-lang]').forEach(b => {
        const loc = b.getAttribute('data-set-lang');
        const isActive = loc === currentLocale;
        b.style.borderColor = isActive ? 'rgba(156, 131, 255, 0.5)' : 'rgba(168, 188, 216, 0.1)';
        b.style.background = isActive ? 'rgba(156, 131, 255, 0.16)' : 'rgba(21, 29, 50, 0.6)';
        const check = b.querySelector('span:last-child');
        if (isActive && !b.innerHTML.includes('✓')) {
          b.insertAdjacentHTML('beforeend', '<span style="color: #9c83ff; font-weight: 900; font-size: 16px;">✓</span>');
        } else if (!isActive && check && check.textContent === '✓') {
          check.remove();
        }
      });
    }
  }

  // Auto initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      injectLanguageSwitcher();
      if (currentLocale !== 'ko') translateDOM();
    });
  } else {
    injectLanguageSwitcher();
    if (currentLocale !== 'ko') translateDOM();
  }

  // Global API
  window.MoneyverseI18n = {
    getLocale: () => currentLocale,
    setLocale: setLocale,
    translate: translateText,
    translateDOM: translateDOM,
    toggleModal: toggleLanguageModal,
    LOCALES: SUPPORTED_LOCALES
  };
})();


  // System Under Maintenance / Troubleshooting Notice Banner
  function injectServiceNoticeBanner() {
    if (document.getElementById('mv-troubleshooting-banner')) return;
    const banner = document.createElement('div');
    banner.id = 'mv-troubleshooting-banner';
    banner.style.cssText = 'position:sticky;top:0;left:0;right:0;z-index:9999999;background:linear-gradient(90deg,#1e1b4b 0%,#4c0519 50%,#1e1b4b 100%);border-bottom:1px solid rgba(244,63,94,0.5);color:#fff;padding:10px 16px;font-size:13px;font-weight:600;text-align:center;display:flex;align-items:center;justify-content:center;gap:10px;box-shadow:0 4px 16px rgba(0,0,0,0.6);font-family:Pretendard,sans-serif;';
    banner.innerHTML = `
      <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#f43f5e;box-shadow:0 0 10px #f43f5e;"></span>
      <span data-i18n="serviceTroubleshootingNotice">⚠️ [시스템 안내] 연결 서비스 프론트엔드 서비스 문제 해결중 (백엔드 연동 및 복식부기 원장 데이터 보존 재구축 작업)</span>
    `;
    document.body.prepend(banner);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectServiceNoticeBanner);
  } else {
    injectServiceNoticeBanner();
  }
