import { type Locale } from './locale';

export type TranslationDictionary = Record<string, {
  ko: string;
  en: string;
  ja: string;
  zh: string;
  vi?: string;
}>;

export const TRANSLATIONS: TranslationDictionary = {
  // Navigation & Shell
  'nav.home': { ko: '홈', en: 'Home', ja: 'ホーム', zh: '首页', vi: '首页' },
  'nav.finance': { ko: '금융·투자', en: 'Finance & Invest', ja: '金融・投資', zh: '金融与投资', vi: '金融与投资' },
  'nav.economy': { ko: '경제·활동', en: 'Economy & Work', ja: '経済・活動', zh: '经济与活动', vi: '经济与活动' },
  'nav.play': { ko: '플레이·시즌', en: 'Play & Season', ja: 'プレイ・シーズン', zh: '娱乐与赛季', vi: '娱乐与赛季' },
  'nav.community': { ko: '커뮤니티', en: 'Community', ja: 'コミュニティ', zh: '社区', vi: '社区' },
  'nav.admin': { ko: '운영 콘솔', en: 'Admin Console', ja: '管理コンソール', zh: '管理控制台', vi: '管理控制台' },
  'nav.wallet': { ko: '내 지갑', en: 'My Wallet', ja: 'マイウォレット', zh: '我的钱包', vi: '我的钱包' },
  'nav.account': { ko: '내 계정', en: 'My Account', ja: 'マイアカウント', zh: '我的账户', vi: '我的账户' },
  'nav.security': { ko: '계정 보안', en: 'Security', ja: 'セキュリティ', zh: '账户安全', vi: '账户安全' },
  'nav.login': { ko: '로그인', en: 'Log In', ja: 'ログイン', zh: '登录', vi: '登录' },
  'nav.register': { ko: '회원가입', en: 'Sign Up', ja: '会員登録', zh: '注册', vi: '注册' },
  'nav.logout': { ko: '로그아웃', en: 'Log Out', ja: 'ログアウト', zh: '退出登录', vi: '退出登录' },
  'nav.language': { ko: '언어 변경', en: 'Language', ja: '言語変更', zh: '语言设置', vi: '语言设置' },
  'nav.theme': { ko: '화면 테마', en: 'Theme', ja: 'テーマ', zh: '主题', vi: '主题' },

  // Stocks
  'stocks.title': { ko: '가상 주식 거래소', en: 'Virtual Stock Exchange', ja: '仮想株式取引所', zh: '虚拟股票交易所', vi: '虚拟股票交易所' },
  'stocks.desc': { ko: '초단타 매매부터 중장기 가치투자까지, 실시간 가상 주식을 거래하세요.', en: 'Trade virtual stocks with real-time order matching and zero financial risk.', ja: 'リアルタイムで仮想株式を取引し、本格的な資産形成を体験。', zh: '体验零风险的实时虚拟股票撮合交易与资产增值。', vi: '体验零风险的实时虚拟股票撮合交易与资产增值。' },
  'stocks.orderbook': { ko: '실시간 호가창', en: 'Live Orderbook', ja: '板情報', zh: '实时盘口', vi: '实时盘口' },
  'stocks.buy': { ko: '매수', en: 'Buy', ja: '買い', zh: '买入', vi: '买入' },
  'stocks.sell': { ko: '매도', en: 'Sell', ja: '売り', zh: '卖出', vi: '卖出' },
  'stocks.holdings': { ko: '보유 종목', en: 'Holdings', ja: '保有銘柄', zh: '持仓标的', vi: '持仓标的' },
  'stocks.watchlist': { ko: '관심 종목', en: 'Watchlist', ja: 'お気に入り', zh: '自选列表', vi: '自选列表' },

  // Bank
  'bank.title': { ko: '가상 중앙은행', en: 'Virtual Central Bank', ja: '仮想中央銀行', zh: '虚拟中央银行', vi: '虚拟中央银行' },
  'bank.desc': { ko: '안전한 정기예금 복리 이자와 필요할 때 즉시 실행하는 가상 신용대출.', en: 'Compound savings yields and instant collateral loans backed by sovereign reserves.', ja: '安心の定期預金複利利息と即座に実行可能な仮想信用融資。', zh: '享受稳健的复利储蓄收益与随借随还的虚拟信用贷款。', vi: '享受稳健的复利储蓄收益与随借随还的虚拟信用贷款。' },
  'bank.deposit': { ko: '복리 예금', en: 'Compound Deposit', ja: '複利預金', zh: '复利存款', vi: '复利存款' },
  'bank.loan': { ko: '신용 대출', en: 'Credit Loan', ja: '信用ローン', zh: '信用贷款', vi: '信用贷款' },
  'bank.pockets': { ko: '저축 통장', en: 'Savings Pockets', ja: '貯蓄ポケット', zh: '储蓄口袋', vi: '储蓄口袋' },

  // Work & Careers
  'work.title': { ko: '직업 센터 & 업무', en: 'Career Center', ja: '職業センター', zh: '职业中心', vi: '职业中心' },
  'work.desc': { ko: '적성에 맞는 전문 직업을 선택하고 업무를 수행하여 정기적인 보상을 획득하세요.', en: 'Choose specialized careers and complete daily tasks to earn sustainable yield.', ja: '適性に合った職業を選択し、業務を遂行して定期報酬を獲得。', zh: '选择适配职业并完成日常工作，获取稳定的虚拟经济报酬。', vi: '选择适配职业并完成日常工作，获取稳定的虚拟经济报酬。' },
  'work.shift': { ko: '업무 교대', en: 'Work Shift', ja: 'シフト勤務', zh: '工作班次', vi: '工作班次' },
  'work.promotion': { ko: '승진 시험', en: 'Promotion Exam', ja: '昇進試験', zh: '晋升考核', vi: '晋升考核' },

  // Casino
  'casino.title': { ko: '아케이드 & 카지노', en: 'Arcade & Casino', ja: 'アーケード＆カジノ', zh: '街机与娱乐', vi: '街机与娱乐' },
  'casino.desc': { ko: '슬롯, 하이로우, 다이스 등 암호학적으로 검증 가능한 공정한 미니게임을 즐기세요.', en: 'Provably fair mini-games including Slots, High-Low, and Dice powered by cryptographic seeds.', ja: 'スロットやハイローなど暗号学的に公平なミニゲームを満喫。', zh: '畅玩老虎机、高低牌和骰子等具备密码学可信验证的公平小游戏。', vi: '畅玩老虎机、高低牌和骰子等具备密码学可信验证的公平小游戏。' },
  'casino.slots': { ko: '클래식 슬롯', en: 'Classic Slots', ja: 'クラシックスロット', zh: '经典老虎机', vi: '经典老虎机' },
  'casino.highlow': { ko: '하이로우 카드', en: 'High-Low Cards', ja: 'ハイロー', zh: '高低牌', vi: '高低牌' },
  'casino.dice': { ko: '럭키 다이스', en: 'Lucky Dice', ja: 'ラッキーダイス', zh: '幸运骰子', vi: '幸运骰子' },

  // Legal & Regulatory Safe Notices
  'legal.sim_notice': {
    ko: '월덕 머니버스는 순수 시뮬레이션 기반 가상경제 플랫폼입니다. WLD 재화는 현금 환전이 절대 불가합니다.',
    en: 'Woldeok Moneyverse is an educational simulation. WLD currency holds zero monetary value and cannot be redeemed for fiat.',
    ja: 'ウォルドク・マネーバースは純粋なシミュレーション仮想経済です。WLDの現金換金は一切不可能です。',
    zh: '月德 Moneyverse 仅用于虚拟经济模拟。WLD 虚拟代币不具备现实货币价值，严禁充值提现。',
    vi: 'Woldeok Moneyverse là nền tảng mô phỏng kinh tế giáo dục. Tiền tệ WLD không có giá trị quy đổi tiền mặt.',
  },
  'legal.terms': { ko: '이용약관', en: 'Terms of Service', ja: '利用規約', zh: '服务条款', vi: '服务条款' },
  'legal.privacy': { ko: '개인정보 처리방침', en: 'Privacy Policy', ja: 'プライバシーポリシー', zh: '隐私政策', vi: '隐私政策' },
  'privacy.title': { ko: '개인정보 처리방침 & 데이터 관리', en: 'Privacy & Data Export', ja: 'プライバシー・データ管理', zh: '隐私政策与数据管理', vi: '隐私政策与数据管理' },
};

export function t(key: string, locale: Locale, fallback?: string): string {
  const item = TRANSLATIONS[key];
  if (!item) return fallback || key;
  return (item as any)[locale] || item.ko || item.en || fallback || key;
}
