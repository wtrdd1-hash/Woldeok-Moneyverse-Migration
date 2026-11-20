/**
 * Moneyverse 5-Language Unified i18n Engine (v2026.11.20.1 Authority)
 * Supported Locales: English (en, default), 한국어 (ko), 日本語 (ja), 简体中文 (zh), Tiếng Việt (vi)
 */

(function(window) {
  'use strict';

  var SUPPORTED_LOCALES = ['en', 'ko', 'ja', 'zh', 'vi'];
  var DEFAULT_LOCALE = 'en';

  var LOCALE_NAMES = {
    en: 'English',
    ko: '한국어',
    ja: '日本語',
    zh: '简体中文',
    vi: 'Tiếng Việt'
  };

  var DICTIONARY = {
    // Navigation & Common
    'nav.home': { en: 'Home', ko: '홈', ja: 'ホーム', zh: '首页', vi: 'Trang chủ' },
    'nav.wallet': { en: 'Wallet', ko: '지갑', ja: 'ウォレット', zh: '钱包', vi: 'Ví tiền' },
    'nav.stocks': { en: 'Market', ko: '주식', ja: '株式', zh: '股市', vi: 'Thị trường' },
    'nav.quests': { en: 'Quests', ko: '퀘스트', ja: 'クエスト', zh: '任务', vi: 'Nhiệm vụ' },
    'nav.shop': { en: 'Shop', ko: '상점', ja: 'ショップ', zh: '商店', vi: 'Cửa hàng' },
    'nav.board': { en: 'Community', ko: '커뮤니티', ja: '掲示板', zh: '社区', vi: 'Cộng đồng' },
    'nav.tools': { en: 'Tools', ko: '도구', ja: 'ツール', zh: '工具', vi: 'Công cụ' },
    'nav.admin': { en: 'Admin', ko: '관리자', ja: '管理者', zh: '管理后台', vi: 'Quản trị' },
    'nav.login': { en: 'Sign In', ko: '로그인', ja: 'ログイン', zh: '登录', vi: 'Đăng nhập' },
    'nav.logout': { en: 'Sign Out', ko: '로그아웃', ja: 'ログアウト', zh: '退出登录', vi: 'Đăng xuất' },

    // Maintenance Banner
    'banner.maintenance': {
      en: '⚠️ [System Notice] Service & Frontend problem resolution in progress (Backend Spring connection & double-entry ledger preservation)',
      ko: '⚠️ [시스템 안내] 연결 서비스 프론트엔드 서비스 문제 해결중 (백엔드 연동 및 복식부기 원장 데이터 보존 재구축 작업)',
      ja: '⚠️ [システム通知] サービスおよびフロントエンドの問題解決中（バックエンド連携および複式簿記元帳データの保全作業）',
      zh: '⚠️ [系统公告] 正在解决服务与前端问题（后端 Spring 接口适配与复式记账账本保全）',
      vi: '⚠️ [Thông báo hệ thống] Đang giải quyết sự cố dịch vụ và giao diện (Đồng bộ Spring backend & bảo toàn sổ cái kép)'
    },

    // Wallet & Ledger
    'wallet.title': { en: 'Asset Wallet', ko: '자산 지갑', ja: '資産ウォレット', zh: '资产钱包', vi: 'Ví tài sản' },
    'wallet.cash': { en: 'Cash Wallet (USER_CASH)', ko: '현금 지갑 (USER_CASH)', ja: '現金ウォレット (USER_CASH)', zh: '现金钱包 (USER_CASH)', vi: 'Ví tiền mặt (USER_CASH)' },
    'wallet.bank': { en: 'Bank Deposit (USER_BANK)', ko: '은행 예치금 (USER_BANK)', ja: '銀行預金 (USER_BANK)', zh: '银行存款 (USER_BANK)', vi: 'Tiền gửi ngân hàng (USER_BANK)' },
    'wallet.verified_ledger': { en: 'Double-Entry Ledger Verified', ko: '복식부기 원장 검증 완료', ja: '複式簿記元帳検証済み', zh: '复式记账账本已验证', vi: 'Đã xác minh sổ cái kép' },
    'wallet.transfer_title': { en: 'Instant Ledger Transfer', ko: '즉시 원장 송금 (복식부기 트랜잭션)', ja: '即時送金 (複式簿記トランザクション)', zh: '即时转账 (复式记账交易)', vi: 'Chuyển tiền sổ cái tức thì' },
    'wallet.recipient': { en: 'Recipient Account / User ID', ko: '받는 사람 계정 / 유저 ID', ja: '受取人口座 / ユーザーID', zh: '收款人账号 / 用户ID', vi: 'Tài khoản nhận / ID người dùng' },
    'wallet.amount': { en: 'Transfer Amount (WLD)', ko: '송금 금액 (WLD)', ja: '送金金額 (WLD)', zh: '转账金额 (WLD)', vi: 'Số tiền chuyển (WLD)' },
    'wallet.btn_transfer': { en: 'Execute Secure Transfer (0% Fee)', ko: '안전 송금 실행 (수수료 0%)', ja: '安全送金を実行 (手数料0%)', zh: '执行安全转账 (免手续费)', vi: 'Thực hiện chuyển tiền (0% phí)' },
    'wallet.recent_txs': { en: 'Recent Double-Entry Transactions', ko: '최근 복식부기 원장 거래 내역', ja: '最近の複式簿記取引履歴', zh: '近期复式记账交易明细', vi: 'Lịch sử giao dịch sổ cái kép gần đây' },
    'wallet.tx_id': { en: 'Transaction ID', ko: '거래 번호 (TX ID)', ja: '取引番号 (TX ID)', zh: '交易编号 (TX ID)', vi: 'Mã giao dịch (TX ID)' },
    'wallet.tx_type': { en: 'Type', ko: '거래 구분', ja: '取引種別', zh: '交易类型', vi: 'Loại' },
    'wallet.amount_col': { en: 'Amount', ko: '변동 금액', ja: '金額', zh: '变动金额', vi: 'Số tiền' },
    'wallet.direction': { en: 'Direction', ko: '방향', ja: '方向', zh: '方向', vi: 'Hướng' },
    'wallet.date': { en: 'Date & Time', ko: '일시', ja: '日時', zh: '日期时间', vi: 'Thời gian' },

    // Floating Support & Chat
    'chat.floating_title': { en: 'Support & Chat', ko: '문의 및 채팅', ja: 'サポート＆チャット', zh: '客服与聊天', vi: 'Hỗ trợ & Trò chuyện' },
    'chat.tab_support': { en: 'Admin Support', ko: '관리자 고객 문의', ja: '管理者への問合せ', zh: '客服支持', vi: 'Hỗ trợ quản trị' },
    'chat.tab_dm': { en: '1:1 Member DM', ko: '회원 1:1 채팅', ja: 'メンバー1:1チャット', zh: '会员私信', vi: 'Trò chuyện 1:1' },
    'chat.category_label': { en: 'Inquiry Category', ko: '문의 분류', ja: 'お問合せカテゴリ', zh: '问题分类', vi: 'Danh mục hỗ trợ' },
    'chat.cat_account': { en: 'Account & Security', ko: '계정 및 보안', ja: 'アカウントとセキュリティ', zh: '账号与安全', vi: 'Tài khoản & Bảo mật' },
    'chat.cat_ledger': { en: 'WLD Ledger & Balance', ko: 'WLD 원장 및 잔액', ja: 'WLD元帳と残高', zh: 'WLD 账本与余额', vi: 'Sổ cái WLD & Số dư' },
    'chat.cat_market': { en: 'Stock Exchange & Orders', ko: '가상 주식 및 거래소', ja: '仮想株式・取引所', zh: '虚拟股票与交易所', vi: 'Thị trường chứng khoán' },
    'chat.cat_bug': { en: 'System Bug Report', ko: '시스템 버그 및 오류 신고', ja: '不具合・バグ報告', zh: '系统错误反馈', vi: 'Báo lỗi hệ thống' },
    'chat.cat_other': { en: 'General Inquiry', ko: '기타 일반 문의', ja: 'その他の問合せ', zh: '其他咨询', vi: 'Thắc mắc khác' },
    'chat.msg_placeholder': { en: 'Type your message (up to 1,000 characters)...', ko: '문의하실 내용을 자세히 입력해주세요 (최대 1,000자)...', ja: 'お問合せ内容を入力してください (最大1,000文字)...', zh: '请输入您的咨询内容 (最多1,000字)...', vi: 'Nhập nội dung cần hỗ trợ (tối đa 1.000 ký tự)...' },
    'chat.btn_send': { en: 'Submit Inquiry', ko: '문의 접수하기', ja: '問合せを送信', zh: '提交咨询', vi: 'Gửi yêu cầu' },
    'chat.sent_success': { en: 'Your inquiry has been registered with a verified server receipt.', ko: '문의가 실제 서버 영수증과 함께 정상 접수되었습니다.', ja: 'お問合せがサーバー受付番号とともに登録されました。', zh: '咨询已成功提交并生成服务器凭证。', vi: 'Yêu cầu của bạn đã được ghi nhận thành công.' }
  };

  function detectLocale() {
    var stored = localStorage.getItem('mv_lang');
    if (stored && SUPPORTED_LOCALES.indexOf(stored) !== -1) {
      return stored;
    }
    var navLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
    for (var i = 0; i < SUPPORTED_LOCALES.length; i++) {
      var loc = SUPPORTED_LOCALES[i];
      if (navLang.indexOf(loc) === 0) {
        return loc;
      }
    }
    return DEFAULT_LOCALE;
  }

  var currentLocale = detectLocale();

  function t(key) {
    var entry = DICTIONARY[key];
    if (!entry) return key;
    return entry[currentLocale] || entry[DEFAULT_LOCALE] || key;
  }

  function setLocale(newLocale) {
    if (SUPPORTED_LOCALES.indexOf(newLocale) === -1) return;
    currentLocale = newLocale;
    localStorage.setItem('mv_lang', newLocale);
    document.documentElement.lang = newLocale;
    applyTranslations();
    updateSelectorUI();
  }

  function applyTranslations() {
    var elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(function(el) {
      var key = el.getAttribute('data-i18n');
      var translated = t(key);
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        if (el.getAttribute('placeholder')) {
          el.placeholder = translated;
        } else {
          el.value = translated;
        }
      } else {
        el.textContent = translated;
      }
    });

    // Also update any elements with data-i18n-placeholder
    var placeholders = document.querySelectorAll('[data-i18n-placeholder]');
    placeholders.forEach(function(el) {
      var key = el.getAttribute('data-i18n-placeholder');
      el.placeholder = t(key);
    });
  }

  function renderLanguageSelector(container) {
    if (!container) return;
    container.innerHTML = 
      '<div class="mv-lang-selector">' +
        '<button type="button" class="mv-lang-btn" id="mv-current-lang-btn">' +
          '🌐 <span id="mv-current-lang-label">' + LOCALE_NAMES[currentLocale] + '</span> ▾' +
        '</button>' +
        '<div class="mv-lang-dropdown" id="mv-lang-dropdown-menu">' +
          SUPPORTED_LOCALES.map(function(loc) {
            return '<div class="mv-lang-option ' + (loc === currentLocale ? 'active' : '') + '" data-loc="' + loc + '">' +
              LOCALE_NAMES[loc] +
            '</div>';
          }).join('') +
        '</div>' +
      '</div>';

    var btn = container.querySelector('#mv-current-lang-btn');
    var menu = container.querySelector('#mv-lang-dropdown-menu');

    if (btn && menu) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        menu.classList.toggle('show');
      });

      menu.querySelectorAll('.mv-lang-option').forEach(function(opt) {
        opt.addEventListener('click', function() {
          var selected = this.getAttribute('data-loc');
          setLocale(selected);
          menu.classList.remove('show');
        });
      });

      document.addEventListener('click', function() {
        menu.classList.remove('show');
      });
    }
  }

  function updateSelectorUI() {
    var label = document.getElementById('mv-current-lang-label');
    if (label) {
      label.textContent = LOCALE_NAMES[currentLocale];
    }
    var options = document.querySelectorAll('.mv-lang-option');
    options.forEach(function(opt) {
      if (opt.getAttribute('data-loc') === currentLocale) {
        opt.classList.add('active');
      } else {
        opt.classList.remove('active');
      }
    });
  }

  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', function() {
    document.documentElement.lang = currentLocale;
    applyTranslations();
    var selectorContainers = document.querySelectorAll('.mv-lang-container');
    selectorContainers.forEach(function(c) {
      renderLanguageSelector(c);
    });
  });

  window.MVI18n = {
    t: t,
    getLocale: function() { return currentLocale; },
    setLocale: setLocale,
    applyTranslations: applyTranslations,
    renderLanguageSelector: renderLanguageSelector,
    SUPPORTED_LOCALES: SUPPORTED_LOCALES
  };

})(window);
