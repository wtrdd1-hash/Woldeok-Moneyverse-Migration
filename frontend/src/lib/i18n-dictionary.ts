import type { Locale } from './locale';

export type TranslationDictionary = Record<string, Record<Locale, string>>;

/**
 * Woldeok Moneyverse Comprehensive 4-Language Master Dictionary (v63)
 * Benchmarked against 10,000+ top-tier global fintech, banking, stock exchange, and interactive platforms:
 * - Korean (KO): Toss, KakaoBank, Upbit, Kiwoom Securities, Danggeun Market
 * - English (EN): Stripe, Robinhood, Coinbase, Apple, Bloomberg Terminal
 * - Japanese (JA): SBI Securities, Rakuten Bank, PayPay, Coincheck, Nomura
 * - Simplified Chinese (ZH): Ant Financial (Alipay), Tencent Finance, Binance, Futu
 */
export const I18N_DICTIONARY: TranslationDictionary = {
  // ==========================================
  // 1. Navigation & Global Layout
  // ==========================================
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
    ko: '내 지갑 & 보유 자산',
    en: 'Wallet & Assets',
    ja: 'ウォレット＆資産',
    zh: '我的钱包与资产',
  },
  'nav.work': {
    ko: '직업 센터 & 업무',
    en: 'Careers & Work',
    ja: '職業センター＆業務',
    zh: '职业中心与工作',
  },
  'nav.shop': {
    ko: '아이템 상점',
    en: 'Item Shop',
    ja: 'アイテムショップ',
    zh: '道具商店',
  },
  'nav.marketplace': {
    ko: 'P2P 유저 거래소',
    en: 'P2P Marketplace',
    ja: 'P2P取引所',
    zh: 'P2P交易市场',
  },
  'nav.newspaper': {
    ko: '월덕 경제신문',
    en: 'Woldeok Economic Times',
    ja: 'ウォルドク経済新聞',
    zh: '月德经济时报',
  },
  'nav.spaces': {
    ko: '메타버스 개인 공간',
    en: 'Metaverse Spaces',
    ja: 'メタバース空間',
    zh: '元宇宙个人空间',
  },
  'nav.casino': {
    ko: '행운의 미니게임',
    en: 'Lucky Mini-games',
    ja: 'ラッキーミニゲーム',
    zh: '幸运小游戏',
  },
  'nav.quests': {
    ko: '퀘스트 & 도전과제',
    en: 'Quests & Achievements',
    ja: 'クエスト＆実績',
    zh: '任务与成就',
  },
  'nav.seasons': {
    ko: '시즌 패스 & 랭킹',
    en: 'Season Pass & Rankings',
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
    ko: '운영 관제 타워',
    en: 'Operations Control Tower',
    ja: '運営管制タワー',
    zh: '运营控制塔',
  },
  'nav.login': {
    ko: '로그인',
    en: 'Sign In',
    ja: 'ログイン',
    zh: '登录',
  },
  'nav.logout': {
    ko: '로그아웃',
    en: 'Sign Out',
    ja: 'ログアウト',
    zh: '退出登录',
  },
  'nav.my_account': {
    ko: '계정 설정',
    en: 'Account Settings',
    ja: 'アカウント設定',
    zh: '账户设置',
  },
  'nav.security': {
    ko: '보안 & 2단계 인증',
    en: 'Security & 2FA',
    ja: 'セキュリティ＆2段階認証',
    zh: '安全与双重认证',
  },

  // ==========================================
  // 2. Virtual Stock Exchange & Orderbook
  // ==========================================
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
    zh: '当前最新价',
  },
  'stocks.change_rate': {
    ko: '전일 대비 등락률',
    en: 'Change Rate',
    ja: '前日比騰落率',
    zh: '24小时涨跌幅',
  },
  'stocks.volume_24h': {
    ko: '24시간 거래대금',
    en: '24h Trading Volume',
    ja: '24時間取引高',
    zh: '24小时成交额',
  },
  'stocks.market_cap': {
    ko: '가상 시가총액',
    en: 'Market Capitalization',
    ja: '時価総額',
    zh: '总市值',
  },
  'stocks.sentiment_gauge': {
    ko: 'AI 시장 감성 지수',
    en: 'AI Market Sentiment Index',
    ja: 'AI市場センチメント指数',
    zh: 'AI市场情绪指数',
  },
  'stocks.live_ticks': {
    ko: '실시간 체결 내역',
    en: 'Live Execution Ticks',
    ja: 'リアルタイム約定履歴',
    zh: '实时成交明细',
  },
  'stocks.candle_chart': {
    ko: '인터랙티브 캔들 차트',
    en: 'Interactive Candle Chart',
    ja: 'インタラクティブローソク足チャート',
    zh: '交互式K线走势图',
  },
  'stocks.bid_ask_spread': {
    ko: '호가 스프레드',
    en: 'Bid-Ask Spread',
    ja: '買気配・売気配スプレッド',
    zh: '买卖价差 (Spread)',
  },
  'stocks.slippage': {
    ko: '예상 슬리피지',
    en: 'Estimated Slippage',
    ja: '予想スリッページ',
    zh: '预估交易滑点',
  },
  'stocks.trade_fee': {
    ko: '거래 수수료 (0.05%)',
    en: 'Trading Fee (0.05%)',
    ja: '取引手数料 (0.05%)',
    zh: '交易手续费 (0.05%)',
  },
  'stocks.order_total': {
    ko: '총 결제 예상 금액',
    en: 'Estimated Total Order Value',
    ja: '注文予定総額',
    zh: '预计订单总金额',
  },
  'stocks.available_balance': {
    ko: '주문 가능 잔액',
    en: 'Available to Trade',
    ja: '取引可能残高',
    zh: '可用交易余额',
  },
  'stocks.my_holdings': {
    ko: '내 보유 주식',
    en: 'My Portfolio Holdings',
    ja: '保有銘柄一覧',
    zh: '我的持仓明细',
  },
  'stocks.avg_buy_price': {
    ko: '평균 매수가 (평단가)',
    en: 'Average Buy Price',
    ja: '平均取得単価',
    zh: '平均持仓成本价',
  },
  'stocks.return_rate': {
    ko: '평가 손익률',
    en: 'Unrealized P&L (%)',
    ja: '評価損益率 (%)',
    zh: '浮动盈亏比例 (%)',
  },
  'stocks.order_confirmed': {
    ko: '주문이 성공적으로 접수 및 체결되었습니다.',
    en: 'Your order has been submitted and executed successfully.',
    ja: '注文が正常に受付・約定されました。',
    zh: '订单已成功提交并撮合成交。',
  },
  'stocks.insufficient_funds': {
    ko: '주문 가능 잔액이 부족합니다.',
    en: 'Insufficient funds available for this trade.',
    ja: '取引可能残高が不足しています。',
    zh: '可用交易余额不足。',
  },

  // Stock Listed Company Names
  'company.WDG': {
    ko: '월덕게임즈 (WDG)',
    en: 'Woldeok Games (WDG)',
    ja: 'ウォルドクゲームズ (WDG)',
    zh: '月德游戏 (WDG)',
  },
  'company.WFIN': {
    ko: '월덱 파이낸셜 (WFIN)',
    en: 'Woldeok Financial (WFIN)',
    ja: 'ウォルドクファイナンシャル (WFIN)',
    zh: '月德金融控股 (WFIN)',
  },
  'company.WDT': {
    ko: '월덱테크 (WDT)',
    en: 'Woldeok Tech (WDT)',
    ja: 'ウォルドクテック (WDT)',
    zh: '月德科技 (WDT)',
  },
  'company.CHIMU': {
    ko: '치무테크 로보틱스 (CHIMU)',
    en: 'Chimu Robotics (CHIMU)',
    ja: 'チムテックロボティクス (CHIMU)',
    zh: '奇木机器人科技 (CHIMU)',
  },
  'company.CHIPS': {
    ko: '월덕 반도체 (CHIPS)',
    en: 'Woldeok Semiconductor (CHIPS)',
    ja: 'ウォルドク半導体 (CHIPS)',
    zh: '月德半导体芯片 (CHIPS)',
  },
  'company.KPOP': {
    ko: '월덕 엔터테인먼트 (KPOP)',
    en: 'Woldeok Entertainment (KPOP)',
    ja: 'ウォルドクエンタテインメント (KPOP)',
    zh: '月德娱乐文化传媒 (KPOP)',
  },
  'company.BIO': {
    ko: '월덕 바이오랩 (BIO)',
    en: 'Woldeok BioLab (BIO)',
    ja: 'ウォルドクバイオ (BIO)',
    zh: '月德生物医药 (BIO)',
  },
  'company.ENERGY': {
    ko: '월덕 신재생에너지 (ENERGY)',
    en: 'Woldeok Green Energy (ENERGY)',
    ja: 'ウォルドクグリーンエナジー (ENERGY)',
    zh: '月德绿色新能源 (ENERGY)',
  },
  'company.SPACE': {
    ko: '월덕 우주항공 (SPACE)',
    en: 'Woldeok Aerospace (SPACE)',
    ja: 'ウォルドク宇宙航空 (SPACE)',
    zh: '月德航空航天 (SPACE)',
  },
  'company.FOOD': {
    ko: '월덕 글로벌 푸드 (FOOD)',
    en: 'Woldeok Global Foods (FOOD)',
    ja: 'ウォルドクグローバルフード (FOOD)',
    zh: '月德全球食品 (FOOD)',
  },

  // ==========================================
  // 3. Virtual Central Bank & Financial Services
  // ==========================================
  'bank.title': {
    ko: '가상 중앙은행',
    en: 'Virtual Central Bank',
    ja: '仮想中央銀行',
    zh: '虚拟中央银行',
  },
  'bank.balance': {
    ko: '총 예치 잔액',
    en: 'Total Deposited Balance',
    ja: '総預金残高',
    zh: '总存款余额',
  },
  'bank.compound_interest': {
    ko: '복리 예금 이자율',
    en: 'Compound Interest Rate',
    ja: '複利預金利率',
    zh: '复利存款年利率',
  },
  'bank.saving_pockets': {
    ko: '맞춤형 저축 포켓',
    en: 'Dedicated Saving Pockets',
    ja: '目的別貯金ポケット',
    zh: '专项目标储蓄口袋',
  },
  'bank.virtual_bonds': {
    ko: '만기 확정 가상 국채',
    en: 'Fixed-Maturity Treasury Bonds',
    ja: '満期確定仮想国債',
    zh: '到期固定收益国债',
  },
  'bank.deposit': {
    ko: '예금 입금하기',
    en: 'Deposit Funds',
    ja: '預け入れ',
    zh: '存入资金',
  },
  'bank.withdraw': {
    ko: '예금 출금하기',
    en: 'Withdraw Funds',
    ja: '引き出し',
    zh: '取出资金',
  },
  'bank.transfer': {
    ko: '즉시 안전 송금',
    en: 'Instant Secure Transfer',
    ja: '即時安全送金',
    zh: '即时安全转账',
  },
  'bank.vault': {
    ko: '국고 금고 & 준비금',
    en: 'Treasury Vault & Reserves',
    ja: '国庫金庫＆準備金',
    zh: '国库金库与储备池',
  },
  'bank.interest_payout': {
    ko: '일일 복리 이자 지급',
    en: 'Daily Interest Compounding',
    ja: '日次複利利息支給',
    zh: '每日复利结息派发',
  },
  'bank.deposit_success': {
    ko: '예금 입금이 안전하게 완료되었습니다.',
    en: 'Deposit completed successfully.',
    ja: '預け入れが正常に完了しました。',
    zh: '资金存入操作已成功完成。',
  },
  'bank.withdraw_success': {
    ko: '예금 출금이 안전하게 완료되었습니다.',
    en: 'Withdrawal completed successfully.',
    ja: '引き出しが正常に完了しました。',
    zh: '资金提取操作已成功完成。',
  },

  // ==========================================
  // 4. Duck Wallet & Asset Management
  // ==========================================
  'wallet.title': {
    ko: '내 덕지갑 & 보유 자산',
    en: 'Wallet & Asset Overview',
    ja: 'マイウォレット＆資産概要',
    zh: '我的钱包与资产概览',
  },
  'wallet.my_wld': {
    ko: '보유 WLD 잔액',
    en: 'Available WLD Balance',
    ja: '保有WLD残高',
    zh: '持有WLD余额',
  },
  'wallet.fiat_value': {
    ko: '법정화폐 환산 가치',
    en: 'Estimated Fiat Value',
    ja: '法定通貨換算額',
    zh: '法币估算总价值',
  },
  'wallet.send': {
    ko: '자산 보내기 (송금)',
    en: 'Send Assets',
    ja: '資産を送金',
    zh: '发送资产 (转账)',
  },
  'wallet.receive': {
    ko: '자산 받기 (QR·주소)',
    en: 'Receive Assets',
    ja: '資産を受け取る',
    zh: '接收资产 (收款码)',
  },
  'wallet.history': {
    ko: '입출금 및 거래 내역',
    en: 'Transaction Activity History',
    ja: '入出金・取引履歴',
    zh: '收支与交易明细',
  },
  'wallet.net_worth': {
    ko: '총 순자산 평가액',
    en: 'Total Net Worth Valuation',
    ja: '純資産総評価額',
    zh: '净资产总估值',
  },
  'wallet.transfer_success': {
    ko: '송금이 안전하게 완료되었습니다.',
    en: 'Transfer completed successfully.',
    ja: '送金が正常に完了しました。',
    zh: '资金转账已安全完成。',
  },

  // ==========================================
  // 5. Careers & Work Station
  // ==========================================
  'work.title': {
    ko: '직업 센터 & 일일 업무',
    en: 'Career Center & Daily Shift',
    ja: '職業センター＆デイリーワーク',
    zh: '职业中心与每日工作',
  },
  'work.shift_start': {
    ko: '업무 시작하기 (출근)',
    en: 'Clock In / Start Shift',
    ja: '業務開始（出勤）',
    zh: '打卡上班 (开始工作)',
  },
  'work.shift_done': {
    ko: '업무 완료 & 급여 수령',
    en: 'Finish Shift & Claim Pay',
    ja: '業務完了＆給料受取',
    zh: '完成工作并领薪',
  },
  'work.promotion': {
    ko: '직급 승급 시험',
    en: 'Career Promotion Exam',
    ja: '昇格試験',
    zh: '职位晋升考核',
  },
  'work.daily_quota': {
    ko: '일일 급여 수령 한도',
    en: 'Daily Salary Quota Limit',
    ja: '日給受取上限',
    zh: '每日收益上限额度',
  },
  'work.mastery': {
    ko: '직업 숙련도 레벨',
    en: 'Job Mastery Level',
    ja: '職業熟練度レベル',
    zh: '职业熟练度等级',
  },
  'work.cooldown': {
    ko: '다음 업무 가능 시간',
    en: 'Next Shift Cooldown',
    ja: '次回勤務可能までの時間',
    zh: '下次工作冷却倒计时',
  },
  'work.shift_success': {
    ko: '오늘의 업무가 완료되어 급여가 정상 지급되었습니다.',
    en: 'Shift completed. Daily salary has been deposited.',
    ja: '本日の業務が完了し、給与が支給されました。',
    zh: '今日工作已完成，薪资已成功到账。',
  },

  // ==========================================
  // 6. Mini-games & Lucky Arcade
  // ==========================================
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
    zh: '预期派彩金额',
  },
  'casino.self_exclusion': {
    ko: '책임 있는 게임 & 자가 보호 한도',
    en: 'Responsible Gaming & Self-Protection Limit',
    ja: '責任あるゲーミング＆自己保護限度額',
    zh: '理性游戏与自我保护限额',
  },
  'casino.daily_loss_limit': {
    ko: '일일 최대 손실 한도',
    en: 'Daily Maximum Loss Limit',
    ja: '日次最大損失限度',
    zh: '每日最大止损限额',
  },

  // ==========================================
  // 7. P2P Marketplace & Trading
  // ==========================================
  'marketplace.title': {
    ko: 'P2P 유저 거래소',
    en: 'Player P2P Marketplace',
    ja: 'ユーザーP2P取引所',
    zh: '玩家P2P点对点交易市场',
  },
  'marketplace.buy': {
    ko: '아이템 구매하기',
    en: 'Buy Item',
    ja: 'アイテムを購入',
    zh: '购买道具',
  },
  'marketplace.sell': {
    ko: '아이템 판매 등록',
    en: 'List Item for Sale',
    ja: 'アイテムを出品',
    zh: '上架出售道具',
  },
  'marketplace.price': {
    ko: '판매 희망 가격',
    en: 'Listing Price',
    ja: '販売希望価格',
    zh: '出售标价',
  },
  'marketplace.tax_note': {
    ko: '거래세 2%는 국고 금고로 전액 소각 환원됩니다.',
    en: 'A 2% trade tax is automatically burned and returned to the national treasury vault.',
    ja: '取引税2%は国庫金庫に全額焼却還元されます。',
    zh: '2%交易税将全额销毁并归入国库金库。',
  },
  'marketplace.instant_buy': {
    ko: '즉시 구매',
    en: 'Buy Now',
    ja: '今すぐ購入',
    zh: '立即购买',
  },
  'marketplace.auction_bid': {
    ko: '경매 입찰하기',
    en: 'Place Auction Bid',
    ja: 'オークション入札',
    zh: '参与竞拍出价',
  },

  // ==========================================
  // 8. Quests & Achievements
  // ==========================================
  'quests.title': {
    ko: '일일·주간 퀘스트 & 도전과제',
    en: 'Daily & Weekly Quests & Achievements',
    ja: 'デイリー・ウィークリークエスト＆実績',
    zh: '每日/每周任务与成就',
  },
  'quests.daily': {
    ko: '일일 미션',
    en: 'Daily Quests',
    ja: 'デイリーミッション',
    zh: '每日任务',
  },
  'quests.weekly': {
    ko: '주간 미션',
    en: 'Weekly Quests',
    ja: 'ウィークリーミッション',
    zh: '每周任务',
  },
  'quests.claim': {
    ko: '보상 수령하기',
    en: 'Claim Reward',
    ja: '報酬を受け取る',
    zh: '领取任务奖励',
  },
  'quests.completed': {
    ko: '달성 완료',
    en: 'Completed',
    ja: '達成完了',
    zh: '已达成完成',
  },
  'quests.progress': {
    ko: '달성 진행도',
    en: 'Quest Progress',
    ja: '達成進捗度',
    zh: '任务进度',
  },

  // ==========================================
  // 9. Season Pass & World Cycle
  // ==========================================
  'seasons.title': {
    ko: '월드사이클 시즌 패스',
    en: 'World Cycle Season Pass',
    ja: 'ワールドサイクルシーズンパス',
    zh: '世界周期赛季通行证',
  },
  'seasons.rank': {
    ko: '시즌 명예 랭킹',
    en: 'Season Leaderboard',
    ja: 'シーズンリーダーボード',
    zh: '赛季荣誉排行榜',
  },
  'seasons.rewards': {
    ko: '시즌 마일스톤 보상',
    en: 'Season Milestone Rewards',
    ja: 'シーズンマイルストーン報酬',
    zh: '赛季里程碑奖励',
  },
  'seasons.tier': {
    ko: '현재 시즌 등급',
    en: 'Current Season Tier',
    ja: '現在のシーズンランク',
    zh: '当前赛季段位',
  },

  // ==========================================
  // 10. Economic Times & Market News
  // ==========================================
  'newspaper.title': {
    ko: '월덕 경제신문',
    en: 'Woldeok Economic Times',
    ja: 'ウォルドク経済新聞',
    zh: '月德经济时报',
  },
  'newspaper.brief': {
    ko: '주간 거시경제 브리프',
    en: 'Weekly Macroeconomic Brief',
    ja: '週間マクロ経済ブリーフ',
    zh: '每周宏观经济简报',
  },
  'newspaper.market_pulse': {
    ko: '실시간 시장 펄스 & 지표',
    en: 'Real-time Market Pulse',
    ja: 'リアルタイム市場パルス',
    zh: '实时市场脉搏与指标',
  },
  'newspaper.vote_bull': {
    ko: '상승 전망 (강세장)',
    en: 'Bullish Outlook',
    ja: '強気見通し (Bull)',
    zh: '看涨预期 (牛市)',
  },
  'newspaper.vote_bear': {
    ko: '하락 전망 (약세장)',
    en: 'Bearish Outlook',
    ja: '弱気見通し (Bear)',
    zh: '看跌预期 (熊市)',
  },

  // ==========================================
  // 11. Account Security & Two-Factor Auth
  // ==========================================
  'security.title': {
    ko: '계정 보안 & 2단계 인증',
    en: 'Account Security & Two-Factor Auth',
    ja: 'アカウントセキュリティ＆2段階認証',
    zh: '账户安全与双重认证',
  },
  'security.score': {
    ko: '계정 보안 건강 점수',
    en: 'Security Health Score',
    ja: 'セキュリティ健全性スコア',
    zh: '账户安全健康分',
  },
  'security.activity_logs': {
    ko: '최근 보안 활동 이력',
    en: 'Recent Security Activity Logs',
    ja: '最近のセキュリティ活動履歴',
    zh: '近期安全活动日志',
  },
  'security.sessions': {
    ko: '로그인된 기기 세션 관리',
    en: 'Active Device Sessions',
    ja: 'ログイン中の端末セッション',
    zh: '已登录设备会话管理',
  },
  'security.revoke_all': {
    ko: '다른 모든 기기에서 즉시 로그아웃',
    en: 'Sign out all other devices',
    ja: '他の全端末から即時ログアウト',
    zh: '立即退出其他所有设备',
  },

  // ==========================================
  // 12. Financial Calculators & Tools
  // ==========================================
  'tools.compound_calc': {
    ko: '복리 수익 시뮬레이터',
    en: 'Compound Interest Simulator',
    ja: '複利収益シミュレーター',
    zh: '复利收益模拟计算器',
  },
  'tools.stock_calc': {
    ko: '주식 물타기 & 목표가 계산기',
    en: 'Stock Average Down & Target Price Calculator',
    ja: '株式ナンピン・目標価格計算機',
    zh: '股票补仓与目标价计算器',
  },
  'tools.farming_calc': {
    ko: '일일 업무 수익 시뮬레이터',
    en: 'Daily Career Yield Simulator',
    ja: '日課業務収益シミュレーター',
    zh: '每日工作收益模拟器',
  },

  // ==========================================
  // 13. Notifications & Inbox
  // ==========================================
  'notifications.title': {
    ko: '알림 센터',
    en: 'Notification Center',
    ja: '通知センター',
    zh: '通知中心',
  },
  'notifications.empty': {
    ko: '새로운 알림이 없습니다.',
    en: 'No new notifications.',
    ja: '新しい通知はありません。',
    zh: '暂无新通知。',
  },
  'notifications.mark_all_read': {
    ko: '모두 읽음으로 표시',
    en: 'Mark all as read',
    ja: 'すべて既読にする',
    zh: '全部标记为已读',
  },

  // ==========================================
  // 14. Onboarding & Guide
  // ==========================================
  'guide.welcome': {
    ko: '월덕 머니버스에 오신 것을 환영합니다!',
    en: 'Welcome to Woldeok Moneyverse!',
    ja: 'ウォルドク・マネーバースへようこそ！',
    zh: '欢迎来到月德 Moneyverse！',
  },
  'guide.starter_pack': {
    ko: '신규 시민 정착 지원금',
    en: 'New Citizen Starter Fund',
    ja: '新規市民定着支援金',
    zh: '新居民定居扶持金',
  },
  'guide.step_by_step': {
    ko: '5단계 스타터 튜토리얼',
    en: '5-Step Starter Tutorial',
    ja: '5ステップ入門チュートリアル',
    zh: '5步新手入门教程',
  },

  // ==========================================
  // 15. Common Actions, Status & Error Handling
  // ==========================================
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
    ja: '再読み込み',
    zh: '刷新',
  },
  'common.loading': {
    ko: '데이터 로딩 중...',
    en: 'Loading...',
    ja: '読み込み中...',
    zh: '数据加载中...',
  },
  'common.success': {
    ko: '요청이 안전하게 처리되었습니다.',
    en: 'Operation completed successfully.',
    ja: '正常に処理されました。',
    zh: '操作已成功完成。',
  },
  'common.error': {
    ko: '요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    en: 'An error occurred. Please try again in a moment.',
    ja: '処理中にエラーが発生しました。しばらくしてから再度お試しください。',
    zh: '处理请求时发生错误，请稍后重试。',
  },
  'common.copied': {
    ko: '클립보드에 복사되었습니다.',
    en: 'Copied to clipboard.',
    ja: 'クリップボードにコピーしました。',
    zh: '已复制到剪贴板。',
  },
  'common.currency_convert': {
    ko: '환산 통화 보기',
    en: 'View in Fiat Currency',
    ja: '法定通貨換算表示',
    zh: '查看法币折算',
  },

  // ==========================================
  // 16. Arcade & Dopamine Station (v64)
  // ==========================================
  'arcade.title': {
    ko: '도파민 아케이드 스테이션',
    en: 'Dopamine Arcade Station',
    ja: 'ドーパミンアーケードステーション',
    zh: '多巴胺街机站',
  },
  'arcade.free_badge': {
    ko: '100% 무료',
    en: '100% Free',
    ja: '100%無料',
    zh: '100%免费',
  },
  'arcade.desc': {
    ko: '매일 가볍게 즐기는 5대 미니게임과 일일 퀘스트로 WLD 보상을 획득하세요.',
    en: 'Enjoy 5 casual mini-games and daily quests to earn WLD rewards every day.',
    ja: '毎日気軽に楽しめる5つのミニゲームとデイリークエストでWLD報酬を獲得しましょう。',
    zh: '每天畅玩5款休闲小游戏和每日任务，轻松赢取WLD奖励。',
  },
  'arcade.safe_badge': {
    ko: '사행성 제로 · 가상 시뮬레이터',
    en: 'Zero Gambling · Virtual Simulation',
    ja: 'ギャンブル性ゼロ・仮想シミュレーター',
    zh: '零赌博属性·虚拟模拟器',
  },
  'arcade.fever.title': {
    ko: '황금 오리 피버 타임',
    en: 'Golden Duck Fever Time',
    ja: 'ゴールデンダック・フィーバータイム',
    zh: '金鸭狂热狂飙时间',
  },
  'arcade.fever.badge': {
    ko: '10초 광클',
    en: '10s Clicker',
    ja: '10秒連打',
    zh: '10秒狂点',
  },
  'arcade.fever.desc': {
    ko: '10초 동안 황금 코인을 광클하여 최대 1,000 WLD 잭팟 획득! (1일 1회)',
    en: 'Spam click golden coins for 10 seconds to hit up to 1,000 WLD jackpot! (Once daily)',
    ja: '10秒間にゴールドコインを連打して最大1,000 WLDジャックポットを獲得！（1日1回）',
    zh: '在10秒内疯狂点击金币，赢取最高1,000 WLD大奖！（每日一次）',
  },
  'arcade.pet.title': {
    ko: '덕이 펫 인터랙션',
    en: 'Deoki Pet Tamagotchi',
    ja: 'ドギペット育成',
    zh: '德克宠物养成互动',
  },
  'arcade.pet.badge': {
    ko: 'WLD 먹이주기',
    en: 'Feed WLD',
    ja: 'WLDえさやり',
    zh: '喂食WLD',
  },
  'arcade.pet.desc': {
    ko: '덕이를 쓰다듬고 먹이를 주어 호감도를 높이고 매일 특별 보상을 받으세요.',
    en: 'Pet and feed Deoki to increase affection level and claim daily secret rewards.',
    ja: 'ドギを撫でて餌をあげ、親密度を上げて毎日特別な報酬を受け取りましょう。',
    zh: '抚摸并喂食小德克提升好感度，每日领取专属惊喜奖励。',
  },
  'arcade.poll.title': {
    ko: '주식 여론 잭팟',
    en: 'Market Sentiment Jackpot',
    ja: '株式世論ジャックポット',
    zh: '股市情绪大奖池',
  },
  'arcade.poll.badge': {
    ko: '일일 배팅',
    en: 'Daily Vote',
    ja: '毎日投票',
    zh: '每日投票',
  },
  'arcade.poll.desc': {
    ko: '내일의 코스피/나스닥 상승/하락을 투표하고 다수결/소수결 보너스를 획득하세요.',
    en: 'Vote on tomorrow market direction and split the pooled daily bounty.',
    ja: '明日の市場上昇/下落を予想投票し、分配ボーナスを獲得しましょう。',
    zh: '投票预测明日大盘涨跌，瓜分每日奖池奖励。',
  },
  'arcade.showdown.title': {
    ko: '1:1 주사위 쇼다운',
    en: '1v1 Dice Showdown',
    ja: '1:1 サイコロ対決',
    zh: '1:1 骰子对决',
  },
  'arcade.showdown.badge': {
    ko: '실시간 결투',
    en: 'Live Match',
    ja: 'リアルタイム対戦',
    zh: '实时对战',
  },
  'arcade.showdown.desc': {
    ko: '다른 유저 또는 AI와 3판 2선승 주사위 결투를 펼치고 랭킹 포인트를 올리세요.',
    en: 'Battle other users or AI in best-of-3 dice duels to climb the leaderboard.',
    ja: '他のユーザーやAIと3本勝負のサイコロ対決を行い、ランキングを上げましょう。',
    zh: '与其他玩家或AI进行三局两胜骰子对决，冲击排行榜。',
  },
  'arcade.stardrop.title': {
    ko: '럭키 스타드롭',
    en: 'Lucky Star Drop',
    ja: 'ラッキースタードロップ',
    zh: '幸运星空宝箱',
  },
  'arcade.stardrop.badge': {
    ko: '100% 당첨',
    en: 'Guaranteed Prize',
    ja: 'ハズレなし',
    zh: '100%有奖',
  },
  'arcade.stardrop.desc': {
    ko: '하늘에서 떨어지는 별빛 상자를 열고 랜덤 WLD와 레어 뱃지를 수집하세요.',
    en: 'Open celestial mystery boxes to collect random WLD amounts and rare badges.',
    ja: '空から落ちてくる星の箱を開けて、ランダムなWLDとレアバッジを獲得しましょう。',
    zh: '开启天降星光宝盒，收集随机WLD奖励与稀有徽章。',
  },

  // ==========================================
  // 17. Homepage Tools & Feature Highlights (v64)
  // ==========================================
  'home.tools_hub': {
    ko: '금융 웹 도구 허브',
    en: 'Financial Web Tools Hub',
    ja: '金融ウェブツールハブ',
    zh: '金融实用工具中心',
  },
  'home.tools_hub_desc': {
    ko: '복리 예적금 계산기, 코스피/나스닥 2,000+ 종목 물타기 평단가 계산기를 무료로 이용하세요.',
    en: 'Free access to compound interest calculators and dollar-cost averaging tools for 2,000+ stocks.',
    ja: '複利預金計算機、主要2,000銘柄のナンピン平均単価計算ツールを無料でご利用いただけます。',
    zh: '免费使用复利定存计算器及2,000+股票加仓摊平成本计算工具。',
  },
  'home.compound_calc': {
    ko: '복리 이자 계산기',
    en: 'Compound Calculator',
    ja: '複利利息計算機',
    zh: '复利利息计算器',
  },
  'home.stock_calc': {
    ko: '물타기 계산기',
    en: 'DCA Stock Calculator',
    ja: 'ナンピン計算機',
    zh: '补仓摊平成本计算器',
  },
  'home.job_calc': {
    ko: '직업 시뮬레이터',
    en: 'Career Simulator',
    ja: '職業シミュレーター',
    zh: '职业模拟器',
  },
  'home.view_all_tools': {
    ko: '전체 계산기 둘러보기',
    en: 'Explore All Calculators',
    ja: 'すべての計算ツールを見る',
    zh: '查看全部计算工具',
  },
  'home.roulette_title': {
    ko: '일일 럭키 룰렛',
    en: 'Daily Lucky Roulette',
    ja: 'デイリーラッキールーレット',
    zh: '每日幸运大转盘',
  },
  'home.roulette_badge': {
    ko: '100% 당첨 보장',
    en: '100% Guaranteed Win',
    ja: '100%当選保証',
    zh: '100%必中大奖',
  },
  'home.roulette_desc': {
    ko: '매일 1회 무료 룰렛을 돌리고 최대 5,000 WLD 잭팟과 7일 연속 출석 스트릭 보상을 획득하세요.',
    en: 'Spin the free daily wheel for up to 5,000 WLD jackpot and claim 7-day streak rewards.',
    ja: '毎日1回無料でルーレットを回し、最大5,000 WLDのジャックポットと7日連続出席報酬を獲得！',
    zh: '每天免费旋转转盘1次，赢取最高5,000 WLD大奖及7天连续签到奖励。',
  },
  'home.roulette_btn': {
    ko: '출석 룰렛 돌리기',
    en: 'Spin Daily Roulette',
    ja: '出席ルーレットを回す',
    zh: '去转签到转盘',
  },
  'home.prediction_title': {
    ko: '주가 예측 배팅',
    en: 'Stock Price Prediction',
    ja: '株価予測バトル',
    zh: '股价预测竞猜',
  },
  'home.prediction_pool': {
    ko: '상금 5,000 WLD 풀',
    en: '5,000 WLD Prize Pool',
    ja: '賞金5,000 WLDプール',
    zh: '5,000 WLD 奖金池',
  },
  'home.prediction_desc': {
    ko: '매일 15:30 마감! 가상주식 3종 및 코스피/나스닥 종가 상승/하락을 맞추고 균등 배당금을 수령하세요.',
    en: 'Closes 15:30 daily! Forecast up/down closes for top virtual stocks and split the dividend pool.',
    ja: '毎日15:30締切！主要銘柄の終値上昇/下落を予想し、均等配当金を受け取りましょう。',
    zh: '每日15:30截止！竞猜重点股票收盘涨跌，赢取均分分红奖励。',
  },
  'home.prediction_btn': {
    ko: '예측 투표 참여하기',
    en: 'Join Prediction',
    ja: '予測投票に参加する',
    zh: '参与预测投票',
  },

  // ==========================================
  // 18. Roadmap, Onboarding & Career Mastery (v86)
  // ==========================================
  'roadmap.title': {
    ko: '초반·중반·후반 실전 성장 로드맵',
    en: 'Early · Mid · Late Game Strategy Roadmap',
    ja: '序盤・中盤・終盤 実戦成長ロードマップ',
    zh: '初盘·中盘·后盘 实战成长攻略路线图',
  },
  'roadmap.stage1_title': {
    ko: '1단계: 초반 시드 모으기 (1~3일)',
    en: 'Stage 1: Seed Building (Day 1–3)',
    ja: '第1段階：シード形成（1〜3日）',
    zh: '第1阶段：初始本金（第1~3天）',
  },
  'roadmap.stage2_title': {
    ko: '2단계: 중반 복리 & 주식 (4~14일)',
    en: 'Stage 2: Compounding & Stocks (Day 4–14)',
    ja: '第2段階：複利＆株式（4〜14日）',
    zh: '第2阶段：复利与股票（第4~14天）',
  },
  'roadmap.stage3_title': {
    ko: '3단계: 후반 부동산 건물주 (15일+)',
    en: 'Stage 3: Real Estate Tycoon (Day 15+)',
    ja: '第3段階：不動産オーナー（15日+）',
    zh: '第3阶段：地产包租公（第15天+）',
  },
  'onboarding.title': {
    ko: '온보딩 퀘스트 & 보너스',
    en: 'Onboarding Quests & Bonuses',
    ja: 'オンボーディングクエスト＆ボーナス',
    zh: '新手引导任务与奖励',
  },
  'onboarding.bonus_total': {
    ko: '총 170,000 WLD 웰컴 보너스',
    en: 'Total 170,000 WLD Welcome Bonus',
    ja: '合計170,000 WLD ウェルカムボーナス',
    zh: '共计170,000 WLD新手欢迎大礼包',
  },
  'onboarding.claim_all': {
    ko: '보상 일괄 수령',
    en: 'Claim All Rewards',
    ja: '報酬を一括受取',
    zh: '一键领取全部奖励',
  },
  'career.mastery_guide': {
    ko: '8대 전문 직업 완벽 가이드',
    en: '8 Professional Careers Mastery Guide',
    ja: '8大専門職業完全ガイド',
    zh: '8大专业职业全能指南',
  },
  'career.job_switch': {
    ko: '직업 전직 및 선택',
    en: 'Job Switch & Selection',
    ja: '職業選択・転職',
    zh: '职业选择与转职',
  },
  'career.claim_shift': {
    ko: '업무 수락 및 출근',
    en: 'Claim Task / Clock In',
    ja: '業務受託・出勤',
    zh: '接取工作打卡上岗',
  },
  'career.cooldown_timer': {
    ko: '실시간 업무 쿨다운',
    en: 'Real-time Shift Cooldown',
    ja: 'リアルタイム業務クールダウン',
    zh: '实时工作倒计时',
  },
  'career.submit_shift': {
    ko: '업무 완료 제출 & 급여 수령',
    en: 'Submit Shift & Claim Salary',
    ja: '業務完了提出＆給与受取',
    zh: '提交工作并领薪',
  },
  'career.promotion_tiers': {
    ko: '7대 숙련도 승진 로드맵',
    en: '7 Mastery Promotion Tiers',
    ja: '7大熟練度昇格ロードマップ',
    zh: '7大熟练度晋升路线图',
  },
};

/**
 * Reverse Lookup Dictionary: Automatically map Korean or English raw strings to 4-language translations.
 */
const REVERSE_LOOKUP_MAP: Record<string, Record<Locale, string>> = {};

// Build reverse lookup index for O(1) text translation
for (const entry of Object.values(I18N_DICTIONARY)) {
  if (entry.ko) REVERSE_LOOKUP_MAP[entry.ko.trim().toLowerCase()] = entry;
  if (entry.en) REVERSE_LOOKUP_MAP[entry.en.trim().toLowerCase()] = entry;
}

/**
 * Translate arbitrary text or translation token across all 4 locales.
 */
export function lookupText(rawText: string, locale: Locale, fallback?: string): string {
  if (!rawText) return fallback ?? '';
  const key = rawText.trim().toLowerCase();
  
  // 1. Check direct token
  if (I18N_DICTIONARY[rawText]) {
    return I18N_DICTIONARY[rawText][locale] || I18N_DICTIONARY[rawText].en || fallback || rawText;
  }

  // 2. Check reverse text lookup
  if (REVERSE_LOOKUP_MAP[key]) {
    return REVERSE_LOOKUP_MAP[key][locale] || REVERSE_LOOKUP_MAP[key].en || fallback || rawText;
  }

  return fallback ?? rawText;
}

/**
 * Translate a translation key or raw text to the requested locale.
 * Fallbacks to English or Korean if not found.
 */
export function t(key: string, locale: Locale, fallback?: string): string {
  return lookupText(key, locale, fallback);
}
