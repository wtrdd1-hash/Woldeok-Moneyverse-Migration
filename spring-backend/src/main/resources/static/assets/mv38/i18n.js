/* The original product locales are en, ko, ja, zh and vi. The member may override auto-detection. */
(function (root) {
  'use strict';
  const SUPPORTED = ['en', 'ko', 'ja', 'zh', 'vi'];
  const CODE_INDEX = Object.freeze({en:0, ko:1, ja:2, zh:3, vi:4});
  const STORE_KEY = 'wdmv_locale_preference';
  const COOKIE_KEY = 'wdmv_locale';
  const OPTIONS = [
    ['auto', 'Auto · Browser'], ['en', 'English'], ['ko', '한국어'],
    ['ja', '日本語'], ['zh', '简体中文'], ['vi', 'Tiếng Việt']
  ];
  // Keep every supported language in this table. A missing key must fall back to English, not a mock.
  const dictionary = {
    home:['Home','홈','ホーム','首页','Trang chủ'],
    wallet:['Wallet','지갑','ウォレット','钱包','Ví'],
    stocks:['Invest','투자','投資','投资','Đầu tư'],
    quests:['Quests','퀘스트','クエスト','任务','Nhiệm vụ'],
    shop:['Shop','상점','ショップ','商店','Cửa hàng'],
    board:['Community','커뮤니티','コミュニティ','社区','Cộng đồng'],
    support:['Help & chat','문의·채팅','サポート','客服与聊天','Hỗ trợ'],
    account:['My account','내 계정','アカウント','我的账户','Tài khoản'],
    calculators:['Calculators','계산기','計算機','计算器','Máy tính'],
    guide:['Guide','가이드','ガイド','指南','Hướng dẫn'],
    menu:['Menu','메뉴','メニュー','菜单','Trình đơn'],
    close:['Close','닫기','閉じる','关闭','Đóng'],
    language:['Language','언어','言語','语言','Ngôn ngữ'],
    auto:['Auto (browser)','자동 (브라우저)','自動（ブラウザー）','自动（浏览器）','Tự động (trình duyệt)'],
    login:['Log in','로그인','ログイン','登录','Đăng nhập'],
    logout:['Log out','로그아웃','ログアウト','退出登录','Đăng xuất'],
    search:['Search','검색','検索','搜索','Tìm kiếm'],
    loggedOut:['Log in to view your assets','로그인 후 내 자산을 확인하세요','ログインして資産を確認','登录后查看您的资产','Đăng nhập để xem tài sản'],
    loading:['Loading verified data…','실제 데이터 조회 중…','データ取得中…','正在读取真实数据…','Đang tải dữ liệu thực…'],
    unavailable:['Unable to load data','데이터를 불러올 수 없습니다','データを取得できません','无法加载数据','Không thể tải dữ liệu'],
    retry:['Try again','다시 시도','再試行','重试','Thử lại'],
    empty:['Nothing to display yet','표시할 내역이 없습니다','表示するデータがありません','暂无记录','Chưa có dữ liệu'],
    seeAll:['View details','자세히 보기','詳細を見る','查看详情','Xem chi tiết'],
    lastUpdated:['Updated','갱신','更新','更新时间','Đã cập nhật'],
    welcome:['My financial world','나의 금융 세계','私の資産の世界','我的金融世界','Thế giới tài chính của tôi'],
    homeLead:['See your wallet, investments and activity in one place.','내 지갑·투자·활동을 한곳에서 확인하세요.','ウォレット、投資、活動をひと目で確認。','一站式查看钱包、投资与活动。','Xem ví, đầu tư và hoạt động tại một nơi.'],
    personalTitle:['My assets dashboard','내 자산 대시보드','マイ資産ダッシュボード','我的资产概览','Tổng quan tài sản'],
    walletAvailable:['Available wallet balance','사용 가능 지갑 잔액','利用可能な残高','可用钱包余额','Số dư ví khả dụng'],
    positionsCount:['Shares held','보유 주식 종목','保有銘柄','持有股票种类','Số mã đang nắm giữ'],
    myQuests:['My quests','내 퀘스트','マイクエスト','我的任务','Nhiệm vụ của tôi'],
    goToQuests:['See quest activity','퀘스트 진행 보기','クエストを確認','查看任务','Xem nhiệm vụ'],
    trendTitle:['My asset history','내 자산 변화 추이','資産推移','我的资产走势','Biến động tài sản'],
    trendUnavailable:['Verified asset history is not yet available.','검증된 자산 추이는 아직 제공되지 않습니다.','確認済み資産履歴は未提供です。','暂未提供经核实的资产历史。','Chưa có lịch sử tài sản đã xác thực.'],
    marketTitle:['Market prices','시장 시세','市場価格','市场行情','Giá thị trường'],
    marketDesc:['Live values from the market service; delayed or unavailable data will be marked.','시장 서비스가 제공하는 실제 시세이며 오류 시 조회 불가로 표시합니다.','市場サービスの実データを表示します。','显示市场服务提供的真实行情。','Dữ liệu thị trường thực; lỗi sẽ được hiển thị rõ.'],
    symbol:['Symbol','종목코드','銘柄コード','股票代码','Mã'],
    stockName:['Company','기업명','企業名','公司','Công ty'],
    sector:['Description','설명','説明','说明','Mô tả'],
    currentPrice:['Price (WLD)','현재가 (WLD)','価格 (WLD)','价格 (WLD)','Giá (WLD)'],
    change:['Change','등락률','騰落率','涨跌幅','Thay đổi'],
    status:['Status','상태','状態','状态','Trạng thái'],
    action:['Action','바로가기','操作','操作','Hành động'],
    marketView:['Visit market','시장 자세히','市場へ','查看市场','Xem thị trường'],
    quickActions:['Quick actions','빠른 작업','クイック操作','快捷操作','Thao tác nhanh'],
    walletHero:['My wallet','내 지갑','マイウォレット','我的钱包','Ví của tôi'],
    walletLead:['Your verified wallet balance and transaction history.','실제 지갑 잔액과 거래 내역을 확인하세요.','残高と取引履歴を確認します。','查看真实钱包余额与交易记录。','Xem số dư và lịch sử giao dịch xác thực.'],
    pendingBalance:['Pending','처리 중 잔액','処理中','处理中','Đang xử lý'],
    lockedBalance:['Reserved','보류 잔액','保留残高','冻结余额','Số dư tạm giữ'],
    transactions:['Recent transactions','최근 거래 내역','最近の取引','近期交易','Giao dịch gần đây'],
    walletNotice:['Transactions only appear after your account is verified.','본인 인증 세션이 확인된 경우에만 거래 내역을 표시합니다.','本人認証後のみ取引を表示します。','仅在验证您的登录后显示交易记录。','Chỉ hiển thị giao dịch sau khi xác minh tài khoản.'],
    stocksHero:['My investments','내 투자·주식','マイ投資','我的投资','Đầu tư của tôi'],
    stocksLead:['Browse market prices and your own holdings.','시장 시세와 내 보유 종목을 확인하세요.','市場価格と保有銘柄を確認。','查看行情与您的持仓。','Xem thị trường và danh mục của bạn.'],
    myHoldings:['My holdings','내 보유 종목','保有銘柄','我的持仓','Danh mục của tôi'],
    quantity:['Quantity','수량','数量','数量','Số lượng'],
    marketValue:['Market value','평가액','評価額','市值','Giá trị thị trường'],
    questsHero:['Quest progress','퀘스트 진행','クエスト進捗','任务进度','Tiến độ nhiệm vụ'],
    questsLead:['Only verified activity and earned rewards count.','검증된 활동과 실제 지급 보상만 표시합니다.','確認済みの活動のみ表示します。','仅显示已核实的活动与奖励。','Chỉ hiển thị hoạt động và phần thưởng đã xác thực.'],
    questsPending:['Your verified quest history is not yet connected here.','본인 퀘스트 검증 데이터가 아직 연결되지 않았습니다.','クエスト履歴は現在未連携です。','尚未接入您的已验证任务记录。','Chưa kết nối lịch sử nhiệm vụ được xác minh.'],
    shopHero:['Item shop','아이템 상점','アイテムショップ','道具商店','Cửa hàng vật phẩm'],
    shopLead:['Browse real catalog items and availability.','실제 상품과 재고 정보를 확인하세요.','実際の商品と在庫を表示します。','查看真实商品与库存。','Xem vật phẩm và tồn kho thực tế.'],
    price:['Price','가격','価格','价格','Giá'],
    inStock:['Available','재고','在庫','库存','Còn hàng'],
    soldOut:['Out of stock','품절','売り切れ','售罄','Hết hàng'],
    boardHero:['Community','커뮤니티','コミュニティ','社区','Cộng đồng'],
    boardLead:['Read real posts and recent conversations.','실제 게시글과 소통 내용을 확인하세요.','実際の投稿を閲覧できます。','浏览真实帖子与讨论。','Xem bài viết và thảo luận thực tế.'],
    recentPosts:['Recent posts','최근 게시글','最近の投稿','最新帖子','Bài viết gần đây'],
    supportHero:['Contact support','고객지원·문의','お問い合わせ','联系支持','Liên hệ hỗ trợ'],
    supportLead:['Open help resources or contact the support team.','도움말과 1:1 문의를 이용하세요.','ヘルプとサポートをご利用ください。','查看帮助或联系客服。','Mở trợ giúp và liên hệ hỗ trợ.'],
    supportUnavailable:['Private support messages require a verified member service.','개인 문의 내역은 인증·권한 검증 후 제공됩니다.','お問い合わせ履歴は認証が必要です。','私人客服记录需要认证。','Lịch sử hỗ trợ riêng tư yêu cầu xác minh.'],
    openHelp:['Help center','도움말 센터','ヘルプセンター','帮助中心','Trung tâm trợ giúp'],
    accountHero:['My profile','내 프로필','マイプロフィール','我的资料','Hồ sơ của tôi'],
    accountLead:['Secure access to your own profile and preferences.','내 계정과 언어 설정을 안전하게 관리하세요.','アカウントと言語設定を管理します。','安全管理账户与语言偏好。','Quản lý tài khoản và tùy chọn ngôn ngữ.'],
    accountName:['Display name','표시 이름','表示名','显示名称','Tên hiển thị'],
    personalOnly:['Private information is only loaded after login.','개인정보는 로그인 후에만 조회합니다.','個人情報はログイン後に表示します。','登录后才加载私人信息。','Chỉ tải thông tin cá nhân sau đăng nhập.'],
    more:['More','더보기','その他','更多','Thêm'],
    notices:['Updates','소식','お知らせ','公告','Tin tức'],
    allRights:['Virtual WLD is not legal tender.','WLD는 서비스 내 가상 화폐이며 법정통화가 아닙니다.','WLDはサービス内の仮想通貨です。','WLD是服务内虚拟货币，并非法定货币。','WLD là tiền ảo trong dịch vụ, không phải tiền pháp định.'],
    helpButton:['Contact us','문의하기','お問い合わせ','联系我们','Liên hệ'],
    errorAuth:['Please sign in to continue.','계속하려면 로그인하세요.','ログインしてください。','请先登录。','Vui lòng đăng nhập.'],
    signInAction:['Sign in','로그인하기','ログイン','登录','Đăng nhập'],
    netError:['The service is temporarily unavailable.','현재 서비스를 이용할 수 없습니다.','サービスをご利用いただけません。','服务暂时不可用。','Dịch vụ tạm thời không khả dụng.'],
    viewAll:['View all','전체 보기','すべて表示','查看全部','Xem tất cả'],
    roleDenied:['Only authorized administrators can view operational data.','관리자 권한이 확인된 사용자만 운영 정보를 볼 수 있습니다.','管理者のみ閲覧できます。','仅授权管理员可查看运营数据。','Chỉ quản trị viên được phép xem dữ liệu.'],
    admin:['Admin console','관리자','管理コンソール','管理控制台','Quản trị'],
    tradable:['Trading open','거래 가능','取引可能','可交易','Đang giao dịch'],
    halted:['Trading halted','거래 중지','取引停止','暂停交易','Tạm ngừng'],
    selectLanguage:['Choose language','언어 선택','言語を選択','选择语言','Chọn ngôn ngữ']
  };
  const supports = code => SUPPORTED.includes(code);
  const storage = {
    read() { try { return root.localStorage.getItem(STORE_KEY); } catch { return null; } },
    put(value) { try { root.localStorage.setItem(STORE_KEY, value); return true; } catch { return false; } }
  };
  function readCookie() {
    const found = (root.document && root.document.cookie || '').split(';').map(s=>s.trim()).find(s=>s.startsWith(COOKIE_KEY+'='));
    return found ? decodeURIComponent(found.slice(COOKIE_KEY.length+1)) : null;
  }
  function detectBrowser() {
    const nav = root.navigator || {};
    const langs = (nav.languages && nav.languages.length ? nav.languages : [nav.language || 'en']);
    for (const value of langs) {
      const code = String(value || '').toLowerCase().split(/[-_]/)[0];
      if (supports(code)) return code;
    }
    return 'en';
  }
  let preference = storage.read() || readCookie() || 'auto';
  if (preference !== 'auto' && !supports(preference)) preference='auto';
  let current = preference === 'auto' ? detectBrowser() : preference;
  function tx(key) {
    const entries = dictionary[key];
    return entries ? entries[CODE_INDEX[current]] || entries[0] : key;
  }
  function setPreference(value) {
    const next = value === 'auto' || supports(value) ? value : 'auto';
    preference = next;
    current = next === 'auto' ? detectBrowser() : next;
    storage.put(next);
    if (root.document) {
      // The legacy app and Spring frontend share a compatible manual preference cookie.
      root.document.cookie = COOKIE_KEY + '=' + (next === 'auto' ? '' : encodeURIComponent(next)) + '; Path=/; Max-Age=' + (next === 'auto' ? '0' : '31536000') + '; SameSite=Lax';
      root.document.documentElement.lang=current;
      root.dispatchEvent(new Event('mv38-language-change'));
    }
    return current;
  }
  if (root.document) root.document.documentElement.lang=current;
  const api = {SUPPORTED, OPTIONS, dictionary, tx, setPreference, detectBrowser,
    current:()=>current, preference:()=>preference};
  root.MV38Locale=api;
  if (typeof module !== 'undefined' && module.exports) module.exports=api;
})(typeof window !== 'undefined' ? window : globalThis);
