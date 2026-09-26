import type { Locale } from './locale';

export type TranslationDictionary = Record<string, Record<Locale, string>>;

/**
 * Woldeok Moneyverse Comprehensive 4-Language Master Dictionary
 * Covering Finance, Virtual Stocks, Central Bank, Mini-games, Career, Quests, Spaces, Community, and Admin.
 */
export const I18N_DICTIONARY: TranslationDictionary = {
  // === Navigation & Layout ===
  'nav.home': {
    ko: '홈',
    en: 'Home',
    ja: 'ホーム',
    zh: '首页',
  },
  'nav.finance': {
    ko: '금융·투자',
    en: 'Finance & Invest',
    ja: '金融・投資',
    zh: '金融·投资',
  },
  'nav.economy': {
    ko: '경제·활동',
    en: 'Economy & Activity',
    ja: '経済・活動',
    zh: '经济·活动',
  },
  'nav.play': {
    ko: '플레이·시즌',
    en: 'Play & Season',
    ja: 'プレイ・シーズン',
    zh: '游玩·赛季',
  },
  'nav.community': {
    ko: '커뮤니티',
    en: 'Community',
    ja: 'コミュニティ',
    zh: '社区',
  },
  'nav.stocks': {
    ko: '가상 주식 거래소',
    en: 'Virtual Stock Exchange',
    ja: '仮想株式取引所',
    zh: '虚拟股票交易所',
  },
  'nav.bank': {
    ko: '가상 중앙은행',
    en: 'Virtual Central Bank',
    ja: '仮想中央銀行',
    zh: '虚拟中央银行',
  },
  'nav.wallet': {
    ko: '덕지갑 & 자산',
    en: 'Duck Wallet & Assets',
    ja: 'ダック財布＆資産',
    zh: '德钱包与资产',
  },
  'nav.work': {
    ko: '직업 & 업무 스테이션',
    en: 'Careers & Work Station',
    ja: '職業＆ワークステーション',
    zh: '职业与工作站',
  },
  'nav.shop': {
    ko: '아이템 상점',
    en: 'Item Shop',
    ja: 'アイテムショップ',
    zh: '道具商店',
  },
  'nav.marketplace': {
    ko: '유저 거래소 (P2P)',
    en: 'User Marketplace (P2P)',
    ja: 'ユーザー取引所 (P2P)',
    zh: '玩家交易市场 (P2P)',
  },
  'nav.newspaper': {
    ko: '월덕 경제신문',
    en: 'Woldeok Economic Times',
    ja: 'ウォルドク経済新聞',
    zh: '月德经济时报',
  },
  'nav.spaces': {
    ko: '메타버스 영토',
    en: 'Metaverse Spaces',
    ja: 'メタバース領土',
    zh: '元宇宙领地',
  },
  'nav.casino': {
    ko: '행운의 미니게임',
    en: 'Lucky Mini-games',
    ja: 'ラッキーミニゲーム',
    zh: '幸运小游戏',
  },
  'nav.quests': {
    ko: '퀘스트 & 업적',
    en: 'Quests & Achievements',
    ja: 'クエスト＆実績',
    zh: '任务与成就',
  },
  'nav.seasons': {
    ko: '시즌 패스 & 랭킹',
    en: 'Season Pass & Rank',
    ja: 'シーズンパス＆ランキング',
    zh: '赛季通行证与排名',
  },
  'nav.gallery': {
    ko: '사진 갤러리',
    en: 'Photo Gallery',
    ja: 'フォトギャラリー',
    zh: '照片画廊',
  },
  'nav.clubs': {
    ko: '클럽 & 길드',
    en: 'Clubs & Guilds',
    ja: 'クラブ＆ギルド',
    zh: '俱乐部与公会',
  },
  'nav.admin': {
    ko: '운영 통제 타워',
    en: 'Operations Control Tower',
    ja: '運営管制タワー',
    zh: '运营控制塔',
  },
  'nav.login': {
    ko: '로그인',
    en: 'Sign in',
    ja: 'ログイン',
    zh: '登录',
  },
  'nav.logout': {
    ko: '로그아웃',
    en: 'Sign out',
    ja: 'ログアウト',
    zh: '登出',
  },
  'nav.my_account': {
    ko: '내 계정',
    en: 'My Account',
    ja: 'マイアカウント',
    zh: '我的账户',
  },
  'nav.security': {
    ko: '계정 보안 & 2FA',
    en: 'Account Security & 2FA',
    ja: 'アカウントセキュリティ＆2FA',
    zh: '账户安全与2FA',
  },

  // === Stocks & Financial Terms ===
  'stocks.title': {
    ko: '가상 주식 거래소',
    en: 'Virtual Stock Exchange',
    ja: '仮想株式取引所',
    zh: '虚拟股票交易所',
  },
  'stocks.orderbook': {
    ko: '실시간 10단계 호가창',
    en: 'Real-time 10-Depth Orderbook',
    ja: 'リアルタイム10段階気配値板',
    zh: '实时10档深度买卖盘',
  },
  'stocks.buy': {
    ko: '매수 (Buy)',
    en: 'Buy Order',
    ja: '買い注文 (Buy)',
    zh: '买入订单 (Buy)',
  },
  'stocks.sell': {
    ko: '매도 (Sell)',
    en: 'Sell Order',
    ja: '売り注文 (Sell)',
    zh: '卖出订单 (Sell)',
  },
  'stocks.market_price': {
    ko: '시장가 주문',
    en: 'Market Order',
    ja: '成行注文',
    zh: '市价订单',
  },
  'stocks.limit_price': {
    ko: '지정가 주문',
    en: 'Limit Order',
    ja: '指値注文',
    zh: '限价订单',
  },
  'stocks.current_price': {
    ko: '현재가',
    en: 'Current Price',
    ja: '現在値',
    zh: '当前价',
  },
  'stocks.change_rate': {
    ko: '전일 대비 등락률',
    en: 'Change Rate',
    ja: '前日比騰落率',
    zh: '涨跌幅',
  },
  'stocks.volume_24h': {
    ko: '24시간 거래량',
    en: '24h Volume',
    ja: '24時間取引高',
    zh: '24小时成交量',
  },
  'stocks.market_cap': {
    ko: '가상 시가총액',
    en: 'Market Capitalization',
    ja: '時価総額',
    zh: '总市值',
  },
  'stocks.sentiment_gauge': {
    ko: 'AI 뉴스 시장 감성 지수',
    en: 'AI Market Sentiment Index',
    ja: 'AI市場心理指数',
    zh: 'AI市场情绪指数',
  },
  'stocks.live_ticks': {
    ko: '실시간 체결 내역',
    en: 'Real-time Execution Ticks',
    ja: 'リアルタイム約定履歴',
    zh: '实时成交明细',
  },
  'stocks.candle_chart': {
    ko: '인터랙티브 캔들 차트',
    en: 'Interactive Candle Chart',
    ja: 'インタラクティブローソク足チャート',
    zh: '交互式K线图',
  },

  // Stock Company Names (Bilingual / Fully Localized)
  'company.WDG': {
    ko: '월덕게임즈 (WDG)',
    en: 'Woldeok Games (WDG)',
    ja: 'ウォルドクゲームズ (WDG)',
    zh: '月德游戏 (WDG)',
  },
  'company.FNAK': {
    ko: '파이낸스덕 (FNAK)',
    en: 'Finance Duck (FNAK)',
    ja: 'ファイナンスダック (FNAK)',
    zh: '财务鸭金融 (FNAK)',
  },
  'company.CHIMU': {
    ko: '치무테크 (CHIMU)',
    en: 'Chimu Robotics (CHIMU)',
    ja: 'チムテックロボ (CHIMU)',
    zh: '奇木科技机器人 (CHIMU)',
  },
  'company.CHIPS': {
    ko: '월덕 반도체 (CHIPS)',
    en: 'Woldeok Semiconductor (CHIPS)',
    ja: 'ウォルドク半導体 (CHIPS)',
    zh: '月德半导体 (CHIPS)',
  },
  'company.KPOP': {
    ko: '월덕 엔터테인먼트 (KPOP)',
    en: 'Woldeok Entertainment (KPOP)',
    ja: 'ウォルドクエンタテインメント (KPOP)',
    zh: '月德娱乐文化 (KPOP)',
  },

  // === Virtual Central Bank ===
  'bank.title': {
    ko: '가상 중앙은행',
    en: 'Virtual Central Bank',
    ja: '仮想中央銀行',
    zh: '虚拟中央银行',
  },
  'bank.balance': {
    ko: '총 예금 잔액',
    en: 'Total Bank Balance',
    ja: '総預金残高',
    zh: '总存款余额',
  },
  'bank.compound_interest': {
    ko: '복리 이자율',
    en: 'Compound Interest Rate',
    ja: '複利利率',
    zh: '复利年利率',
  },
  'bank.saving_pockets': {
    ko: '맞춤형 저축 포켓',
    en: 'Saving Pockets',
    ja: 'カスタム貯金ポケット',
    zh: '自定义储蓄口袋',
  },
  'bank.virtual_bonds': {
    ko: '만기 확정 국채 시뮬레이터',
    en: 'Virtual Treasury Bond Simulator',
    ja: '満期確定国債シミュレーター',
    zh: '到期固定国债模拟器',
  },
  'bank.deposit': {
    ko: '입금하기',
    en: 'Deposit Funds',
    ja: '預け入れ',
    zh: '存入资金',
  },
  'bank.withdraw': {
    ko: '출금하기',
    en: 'Withdraw Funds',
    ja: '引き出し',
    zh: '取出资金',
  },
  'bank.transfer': {
    ko: '멱등성 실시간 송금',
    en: 'Idempotent Real-time Transfer',
    ja: '冪等性リアルタイム送金',
    zh: '幂等性实时转账',
  },

  // === Mini-games & Casino ===
  'casino.title': {
    ko: '행운의 미니게임 아케이드',
    en: 'Lucky Mini-games Arcade',
    ja: 'ラッキーミニゲームアーケード',
    zh: '幸运小游戏游乐场',
  },
  'casino.dice': {
    ko: '주사위 배틀 (Dice)',
    en: 'Dice Battle',
    ja: 'ダイスバトル (Dice)',
    zh: '骰子大作战 (Dice)',
  },
  'casino.coinflip': {
    ko: '코인 플립 (Coinflip)',
    en: 'Coin Flip',
    ja: 'コイントス (Coinflip)',
    zh: '幸运硬币翻转 (Coinflip)',
  },
  'casino.roulette': {
    ko: '유러피언 룰렛 (Roulette)',
    en: 'European Roulette',
    ja: 'ヨーロピアンルーレット (Roulette)',
    zh: '欧式轮盘赌 (Roulette)',
  },
  'casino.slots': {
    ko: '월덕 럭키 슬롯 (Slots)',
    en: 'Woldeok Lucky Slots',
    ja: 'ウォルドクラッキースロット (Slots)',
    zh: '月德幸运拉霸机 (Slots)',
  },
  'casino.bet_amount': {
    ko: '베팅 금액 (WLD)',
    en: 'Bet Amount (WLD)',
    ja: 'ベット額 (WLD)',
    zh: '投注金额 (WLD)',
  },
  'casino.payout': {
    ko: '예상 배당금',
    en: 'Potential Payout',
    ja: '予想配当金',
    zh: '预期派彩',
  },
  'casino.self_exclusion': {
    ko: '책임 있는 게임 & 자가 보호 한도',
    en: 'Responsible Gaming & Self-Exclusion Limit',
    ja: '責任あるゲーミング＆自己規制限度',
    zh: '理性游戏与自我保护限额',
  },

  // === Careers & Work Station ===
  'work.title': {
    ko: '직업 센터 & 일일 업무',
    en: 'Career Center & Daily Shift',
    ja: '職業センター＆デイリーワーク',
    zh: '职业中心与每日工作',
  },
  'work.shift_start': {
    ko: '업무 시작하기',
    en: 'Start Work Shift',
    ja: '勤務開始',
    zh: '开始上班',
  },
  'work.promotion': {
    ko: '직급 승급 시험',
    en: 'Job Promotion Exam',
    ja: '昇格試験',
    zh: '职位晋升考核',
  },
  'work.daily_quota': {
    ko: '일일 보상 수령 한도',
    en: 'Daily Quota Limit',
    ja: 'デイリー報酬上限',
    zh: '每日奖励额度',
  },

  // === Common Buttons & Status ===
  'common.confirm': {
    ko: '확인',
    en: 'Confirm',
    ja: '確認',
    zh: '确认',
  },
  'common.cancel': {
    ko: '취소',
    en: 'Cancel',
    ja: 'キャンセル',
    zh: '取消',
  },
  'common.save': {
    ko: '저장',
    en: 'Save',
    ja: '保存',
    zh: '保存',
  },
  'common.delete': {
    ko: '삭제',
    en: 'Delete',
    ja: '削除',
    zh: '删除',
  },
  'common.close': {
    ko: '닫기',
    en: 'Close',
    ja: '閉じる',
    zh: '关闭',
  },
  'common.refresh': {
    ko: '새로고침',
    en: 'Refresh',
    ja: '更新',
    zh: '刷新',
  },
  'common.loading': {
    ko: '데이터 로딩 중...',
    en: 'Loading data...',
    ja: '読み込み中...',
    zh: '数据加载中...',
  },
  'common.success': {
    ko: '성공적으로 처리되었습니다.',
    en: 'Operation completed successfully.',
    ja: '正常に処理されました。',
    zh: '操作已成功完成。',
  },
  'common.error': {
    ko: '요청 처리 중 오류가 발생했습니다.',
    en: 'An error occurred during request processing.',
    ja: '処理中にエラーが発生しました。',
    zh: '处理请求时发生错误。',
  },
};

/**
 * Translate a translation key to the requested locale.
 * Fallbacks to Korean if key or locale not found.
 */
export function t(key: string, locale: Locale, fallback?: string): string {
  const entry = I18N_DICTIONARY[key];
  if (!entry) return fallback ?? key;
  return entry[locale] ?? entry.ko ?? fallback ?? key;
}
