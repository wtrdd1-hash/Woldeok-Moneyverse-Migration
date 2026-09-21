import { type Locale } from './locale';

export type TranslationDictionary = Record<string, {
  ko: string;
  en: string;
  ja: string;
  zh: string;
}>;

export const TRANSLATIONS: TranslationDictionary = {
  // Navigation & Shell
  'nav.home': { ko: '홈', en: 'Home', ja: 'ホーム', zh: '首页' },
  'nav.finance': { ko: '금융·투자', en: 'Finance & Invest', ja: '金融・投資', zh: '金融与投资' },
  'nav.economy': { ko: '경제·활동', en: 'Economy & Work', ja: '経済・活動', zh: '经济与活动' },
  'nav.play': { ko: '플레이·시즌', en: 'Play & Season', ja: 'プレイ・シーズン', zh: '娱乐与赛季' },
  'nav.community': { ko: '커뮤니티', en: 'Community', ja: 'コミュニティ', zh: '社区' },
  'nav.admin': { ko: '운영 콘솔', en: 'Admin Console', ja: '管理コンソール', zh: '管理控制台' },
  'nav.wallet': { ko: '내 지갑', en: 'My Wallet', ja: 'マイウォレット', zh: '我的钱包' },
  'nav.account': { ko: '내 계정', en: 'My Account', ja: 'マイアカウント', zh: '我的账户' },
  'nav.security': { ko: '계정 보안', en: 'Security', ja: 'セキュリティ', zh: '账户安全' },
  'nav.login': { ko: '로그인', en: 'Log In', ja: 'ログイン', zh: '登录' },
  'nav.register': { ko: '회원가입', en: 'Sign Up', ja: '会員登録', zh: '注册' },
  'nav.logout': { ko: '로그아웃', en: 'Log Out', ja: 'ログアウト', zh: '退出登录' },
  'nav.language': { ko: '언어 변경', en: 'Language', ja: '言語変更', zh: '语言设置' },
  'nav.theme': { ko: '화면 테마', en: 'Theme', ja: 'テーマ', zh: '主题' },

  // Live Ticker
  'ticker.live': { ko: '실시간 지표', en: 'LIVE METRICS', ja: 'リアルタイム指標', zh: '实时指标' },
  'ticker.ledger': { ko: 'WLD 원장 상태', en: 'WLD Network Ledger', ja: 'WLD元帳ステータス', zh: 'WLD总账状态' },
  'ticker.ledger_value': { ko: '정상 가동 (805개 노드)', en: 'Optimal (805 Nodes)', ja: '正常稼働 (805ノード)', zh: '正常运行 (805节点)' },
  'ticker.top_mover': { ko: '최고 상승: 월덕게임즈', en: 'Top Mover: WDG', ja: '急上昇: ウォルドクゲームズ', zh: '领涨: 沃德游戏' },
  'ticker.work_window': { ko: '일일 직업 보상창', en: 'Daily Work Window', ja: 'デイリー職務報酬窓口', zh: '每日职业奖励窗口' },
  'ticker.work_window_value': { ko: '진행 중 · 8대 직업 가동', en: 'Open · 8 Careers Active', ja: '進行中 · 8大職業稼働', zh: '进行中 · 8大职业运行' },
  'ticker.integrity': { ko: '금융 무결성', en: 'System Integrity', ja: '金融完全性', zh: '金融完整性' },
  'ticker.liquidity': { ko: '통화 유동성 지수', en: 'Currency Liquidity Index', ja: '通貨流動性指数', zh: '货币流动性指数' },

  // Home & Dashboard
  'home.badge': { ko: '커뮤니티 가상경제', en: 'Virtual Economy Hub', ja: 'コミュニティ仮想経済', zh: '社区虚拟经济' },
  'home.badge_sub': { ko: '모든 WLD와 보상은 게임 안에서만 쓰는 가상 데이터입니다.', en: 'All WLD and assets are virtual within the simulator.', ja: 'すべてのWLDと報酬はゲーム内でのみ使用される仮想データです。', zh: '所有WLD和资产均为游戏内虚拟数据。' },
  'home.terms': { ko: '이용 기준', en: 'Terms', ja: '利用規約', zh: '使用条款' },
  'home.welcome': { ko: '반가워요!', en: 'Welcome back!', ja: 'おかえりなさい！', zh: '欢迎光临！' },
  'home.welcome_sub': { ko: '월덕 머니버스에서 경제와 자산을 시작해보세요.', en: 'Start your financial journey in Woldeok Moneyverse.', ja: 'ウォルドクマネーバースで経済と資産を始めましょう。', zh: '在沃德金融宇宙中开启您的经济与资产之旅。' },
  'home.today_actions': { ko: '오늘의 동선', en: 'Daily Action Flow', ja: '本日のアクション', zh: '今日行动路线' },
  'home.today_sub': { ko: '오늘 할 일, 잔액, 시장과 커뮤니티를 한 화면에서 이어서 확인하세요.', en: 'Check your tasks, balance, markets, and forum in one seamless stream.', ja: 'タスク、残高、市場、コミュニティを一つの画面で確認できます。', zh: '在同一界面无缝查看任务、余额、市场与社区。' },

  // Work & Careers
  'work.title': { ko: '직업 및 작업 센터', en: 'Career & Work Hub', ja: '職業・業務センター', zh: '职业与工作中心' },
  'work.desc': { ko: '8가지 전문 직업을 수행하고 매일 정직한 WLD 보상과 숙련도를 획득하세요.', en: 'Perform 8 specialized careers and earn honest daily WLD rewards and mastery.', ja: '8つの専門職に従事し、毎日の公正なWLD報酬と習熟度を獲得しましょう。', zh: '从事8大专业职业，每日获取公正的WLD奖励与熟练度。' },
  'work.start_task': { ko: '업무 시작하고 보상 받기', en: 'Start Task & Claim Reward', ja: '業務開始・報酬受取', zh: '开始工作并领取奖励' },
  'work.saving': { ko: '보상과 직업 숙련도를 안전하게 저장하고 있어요…', en: 'Securely recording rewards and mastery…', ja: '報酬と熟練度を安全に記録しています…', zh: '正在安全记录奖励与熟练度…' },
  'work.completed': { ko: '업무 완료! 지갑에 WLD 보상이 입금되고 직업 숙련도가 올랐어요.', en: 'Task completed! WLD rewards deposited and mastery increased.', ja: '業務完了！ウォレットにWLDが支給され、熟練度が上がりました。', zh: '工作完成！WLD奖励已存入钱包，熟练度提升。' },
  'work.daily_quota': { ko: '오늘 획득한 일일 보상', en: 'Daily Reward Earned', ja: '本日の獲得報酬', zh: '今日已获奖励' },
  'work.daily_cap_reached': { ko: '오늘 일일 한도에 도달했습니다 (자정에 초기화)', en: 'Daily cap reached (resets at midnight UTC)', ja: '本日の上限に達しました (UTC午前0時にリセット)', zh: '已达今日上限 (午夜重置)' },

  // Bank & Bonds
  'bank.title': { ko: '가상 중앙은행 및 채권', en: 'Virtual Bank & Treasury Bonds', ja: '仮想中央銀行・国債', zh: '虚拟中央银行与国债' },
  'bank.desc': { ko: '복리 예적금으로 안정적인 이자를 챙기고, 만기 국채와 스마트 대출을 이용해보세요.', en: 'Grow your wealth with compound savings, fixed-term treasury bonds, and smart loans.', ja: '複利預金で安定した利息を得て、満期国債やスマートローンをご利用ください。', zh: '通过复利储蓄获得稳定利息，投资到期国债与智能贷款。' },
  'bank.bond_invest': { ko: '국채 투자하기', en: 'Invest in Treasury Bonds', ja: '国債に投資する', zh: '投资国债' },
  'bank.bond_desc': { ko: '원하는 기간 동안 WLD를 보관하고 만기에 확정 이자를 챙겨받아요.', en: 'Lock WLD for a set duration and receive guaranteed fixed yield at maturity.', ja: '希望期間WLDを預け入れ、満期時に確定利息を受け取ります。', zh: '在约定周期内存入WLD并在到期时获得确定利息。' },
  'bank.claim_maturity': { ko: '원금과 이자 챙겨받기', en: 'Claim Principal & Yield', ja: '元本と利息を受け取る', zh: '领取本金与利息' },
  'bank.loan_apply': { ko: '대출금 받기', en: 'Apply for Loan', ja: 'ローンを申し込む', zh: '申请借款' },
  'bank.loan_repay': { ko: '대출금 갚기', en: 'Repay Loan', ja: 'ローンを返済する', zh: '偿还借款' },

  // Wallet & Transfers
  'wallet.title': { ko: '덕지갑 및 자산 관리', en: 'WLD Wallet & Ledger', ja: 'WLDウォレット・資産管理', zh: 'WLD钱包与资产管理' },
  'wallet.desc': { ko: '내 자산 현황을 한눈에 확인하고, 수수료 없는 멱등 송금으로 안전하게 WLD를 보내세요.', en: 'View your net worth at a glance and send zero-fee idempotent WLD transfers securely.', ja: '純資産を一目で確認し、手数料無料の安全なWLD送金を利用できます。', zh: '一览您的净资产，使用无手续费的幂等安全转账发送WLD。' },
  'wallet.net_worth': { ko: '총 보유 순자산', en: 'Total Net Worth', ja: '保有総純資産', zh: '总持净资产' },
  'wallet.send_button': { ko: '돈 보내기', en: 'Send Funds', ja: '送金する', zh: '发送资金' },
  'wallet.send_notice': { ko: '송금 즉시 지갑에서 전송돼요. 받는 사람과 보낼 금액을 한 번 더 확인해 주세요.', en: 'Transfers execute immediately. Please double check recipient and amount.', ja: '送金は即時に実行されます。受取人と金額を再度ご確認ください。', zh: '转账将立即执行。请仔细核对收款人与金额。' },
  'wallet.csv_export': { ko: '거래 내역 CSV 내보내기', en: 'Export CSV Ledger', ja: '取引明細CSV出力', zh: '导出CSV交易明细' },

  // Stocks & Markets
  'stocks.title': { ko: '가상 주식 거래소', en: 'Virtual Stock Exchange', ja: '仮想株式取引所', zh: '虚拟股票交易所' },
  'stocks.desc': { ko: '실시간 호가창과 캔들 차트를 분석하고, 100% 가상 머니로 전략 투자를 경험하세요.', en: 'Analyze real-time order books and candle charts, experiencing strategic trading with virtual funds.', ja: 'リアルタイム板情報とローソク足チャートを分析し、戦略的投資を体験しましょう。', zh: '分析实时买卖盘与K线图，使用虚拟资金体验策略投资。' },
  'stocks.buy': { ko: '주식 매수', en: 'Buy Shares', ja: '買い注文', zh: '买入股票' },
  'stocks.sell': { ko: '주식 매도', en: 'Sell Shares', ja: '売り注文', zh: '卖出股票' },
  'stocks.discussions': { ko: '종목 실시간 토론방', en: 'Stock Discussions', ja: '銘柄別ディスカッション', zh: '股票实时讨论区' },
  'stocks.price_alert': { ko: '목표가 도달 알림', en: 'Price Target Alert', ja: '目標株価通知', zh: '目标价提醒' },

  // Casino & Responsible Gaming
  'casino.title': { ko: '엔터테인먼트 카지노 & 책임도박', en: 'Entertainment Casino', ja: 'エンタメカジノ・責任あるプレイ', zh: '娱乐场与理性娱乐' },
  'casino.desc': { ko: '암호학적 SHA-256 공정성(Provably Fair)이 보증된 미니게임을 안전한 자가 한도 안에서 즐기세요.', en: 'Enjoy cryptographic Provably Fair (SHA-256) minigames within your responsible self-limits.', ja: '暗号学的SHA-256公正性(Provably Fair)が保証されたミニゲームを自己制限内でお楽しみください。', zh: '在设定的理性限额内体验受密码学SHA-256公正性保证的益智迷你游戏。' },
  'casino.provably_fair': { ko: '공정성 검증 (Provably Fair)', en: 'Verify Provably Fair', ja: '公正性の検証 (Provably Fair)', zh: '公正性验证 (Provably Fair)' },
  'casino.self_limit': { ko: '책임도박 자가 한도 설정', en: 'Responsible Gaming Limits', ja: '自己制限設定', zh: '理性娱乐限额设定' },

  // Forum & Media & Spaces & Clubs & Seasons & Progression & Shop & Support & Privacy
  'board.title': { ko: '커뮤니티 광장', en: 'Community Forum', ja: 'コミュニティ広場', zh: '社区广场' },
  'gallery.title': { ko: '미디어 갤러리', en: 'Media Gallery', ja: 'メディアギャラリー', zh: '媒体画廊' },
  'spaces.title': { ko: '가상 부동산 & 스페이스', en: 'Spaces & Real Estate', ja: 'スペース・不動産', zh: '空间与虚拟地产' },
  'clubs.title': { ko: '클럽 & 길드 연합', en: 'Clubs & Guilds', ja: 'クラブ・ギルド連合', zh: '俱乐部与公会联盟' },
  'seasons.title': { ko: '시즌 패스 & 랭킹', en: 'Season Pass & Tiers', ja: 'シーズンパス・ランキング', zh: '赛季通行证与排行榜' },
  'progression.title': { ko: '성장 여정 & 업적', en: 'Progression & Badges', ja: '成長の軌跡・実績', zh: '成长历程与成就' },
  'shop.title': { ko: '아이템 상점 & 인벤토리', en: 'Item Shop & Inventory', ja: 'アイテムショップ・インベントリ', zh: '道具商城与背包' },
  'support.title': { ko: '고객 지원 & 문의', en: 'Support & Help Desk', ja: 'サポート・ヘルプデスク', zh: '客户支持与帮助中心' },
  'privacy.title': { ko: '개인정보 처리방침 & 데이터 관리', en: 'Privacy & Data Export', ja: 'プライバシー・データ管理', zh: '隐私政策与数据管理' },
};

export function t(key: string, locale: Locale, fallback?: string): string {
  const item = TRANSLATIONS[key];
  if (!item) return fallback || key;
  return item[locale] || item.ko || item.en || fallback || key;
}
