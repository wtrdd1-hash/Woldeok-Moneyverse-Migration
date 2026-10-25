import { type Locale } from './locale';

export type TranslationDictionary = Record<string, {
  ko: string;
  en: string;
  ja: string;
  zh: string;
  vi?: string;
}>;

export interface CurrencyConfig {
  symbol: string;
  code: string;
  prefix: boolean;
  rateMultiplier: number; // KRW 1 = 0.00075 USD approx for simulation display
}

export function getCurrencyConfig(locale: Locale): CurrencyConfig {
  switch (locale) {
    case 'en':
      return { symbol: '$', code: 'USD', prefix: true, rateMultiplier: 0.00075 };
    case 'ja':
      return { symbol: '¥', code: 'JPY', prefix: true, rateMultiplier: 0.11 };
    case 'zh':
      return { symbol: '¥', code: 'CNY', prefix: true, rateMultiplier: 0.0053 };
    case 'vi':
      return { symbol: '₫', code: 'VND', prefix: false, rateMultiplier: 18.5 };
    case 'ko':
    default:
      return { symbol: '₩', code: 'KRW', prefix: true, rateMultiplier: 1.0 };
  }
}

export function formatCurrencyAmount(amount: number, locale: Locale, isRawCurrency = false): string {
  const config = getCurrencyConfig(locale);
  const displayAmount = isRawCurrency ? Math.round(amount * config.rateMultiplier) : Math.round(amount);
  const formattedNum = displayAmount.toLocaleString();
  return config.prefix ? `${config.symbol}${formattedNum}` : `${formattedNum}${config.symbol}`;
}

export const TRANSLATIONS: TranslationDictionary = {
  // Navigation & Shell
  'nav.home': { ko: '홈', en: 'Home', ja: 'ホーム', zh: '首页', vi: 'Trang chủ' },
  'nav.finance': { ko: '금융·투자', en: 'Finance & Invest', ja: '金融・投資', zh: '金融与投资', vi: 'Tài chính & Đầu tư' },
  'nav.economy': { ko: '경제·활동', en: 'Economy & Work', ja: '経済・活動', zh: '经济与活动', vi: 'Kinh tế & Làm việc' },
  'nav.play': { ko: '플레이·시즌', en: 'Play & Season', ja: 'プレイ・シーズン', zh: '娱乐与赛季', vi: 'Trò chơi & Mùa giải' },
  'nav.community': { ko: '커뮤니티', en: 'Community', ja: 'コミュニティ', zh: '社区', vi: 'Cộng đồng' },
  'nav.admin': { ko: '운영 콘솔', en: 'Admin Console', ja: '管理コンソール', zh: '管理控制台', vi: 'Bảng quản trị' },
  'nav.wallet': { ko: '내 지갑', en: 'My Wallet', ja: 'マイウォレット', zh: '我的钱包', vi: 'Ví của tôi' },
  'nav.account': { ko: '내 계정', en: 'My Account', ja: 'マイアカウント', zh: '我的账户', vi: 'Tài khoản' },
  'nav.security': { ko: '계정 보안', en: 'Security', ja: 'セキュリティ', zh: '账户安全', vi: 'Bảo mật' },
  'nav.login': { ko: '로그인', en: 'Log In', ja: 'ログイン', zh: '登录', vi: 'Đăng nhập' },
  'nav.register': { ko: '회원가입', en: 'Sign Up', ja: '会員登録', zh: '注册', vi: 'Đăng ký' },
  'nav.logout': { ko: '로그아웃', en: 'Log Out', ja: 'ログアウト', zh: '退出登录', vi: 'Đăng xuất' },
  'nav.language': { ko: '언어 변경', en: 'Language', ja: '言語変更', zh: '语言设置', vi: 'Ngôn ngữ' },
  'nav.theme': { ko: '화면 테마', en: 'Theme', ja: 'テーマ', zh: '主题', vi: 'Giao diện' },

  // Tools Common UI
  'tools.back_to_hub': { ko: '도구 허브로 돌아가기', en: 'Back to Tools Hub', ja: 'ツール一覧へ戻る', zh: '返回工具中心', vi: 'Quay lại Trung tâm Công cụ' },
  'tools.share': { ko: '공유하기', en: 'Share', ja: '共有する', zh: '分享', vi: 'Chia sẻ' },
  'tools.export_image': { ko: '카드 이미지 저장', en: 'Export Card Image', ja: '画像カード保存', zh: '导出卡片图片', vi: 'Lưu ảnh thẻ' },
  'tools.reset': { ko: '초기화', en: 'Reset', ja: 'リセット', zh: '重置', vi: 'Đặt lại' },
  'tools.calculate': { ko: '계산하기', en: 'Calculate', ja: '計算する', zh: '立即计算', vi: 'Tính toán' },
  'tools.result_summary': { ko: '핵심 계산 결과', en: 'Key Calculation Summary', ja: '主要試算結果', zh: '核心测算结果', vi: 'Kết quả tóm tắt' },
  'tools.popular_presets': { ko: '인기 검색 프리셋', en: 'Popular Presets', ja: '人気プリセット', zh: '热门预设', vi: 'Cài đặt phổ biến' },
  'tools.domestic_notice_title': {
    ko: '대한민국 세법·금융 제도 기준 안내',
    en: 'Notice: Governed by South Korean Tax Regulations',
    ja: '韓国の税法・金融制度に基づく計算ツールです',
    zh: '提示：本工具基于韩国税法与金融制度设计',
    vi: 'Lưu ý: Áp dụng theo quy định thuế Hàn Quốc',
  },
  'tools.domestic_notice_desc': {
    ko: '본 계산기는 대한민국 세법 및 관련 금융 규정을 기준으로 산출됩니다. 글로벌 투자자는 환율 및 각국 세제 차이를 참고하세요.',
    en: 'This tool is calibrated to South Korean financial regulations and tax codes. International users should consult local tax policies.',
    ja: 'この計算機は韓国の現行税法・金融基準に準拠しています。海外投資家の方は各国の税制や為替差損益をご確認ください。',
    zh: '本计算器依据韩国现行税法及金融标准制定。海外投资者请结合当地税收政策及汇率进行参考。',
    vi: 'Công cụ này được tính toán theo quy định thuế của Hàn Quốc. Người dùng quốc tế vui lòng tham khảo chính sách thuế địa phương.',
  },

  // 1. Stock DCA / Averaging Calculator
  'stock_calc.title': {
    ko: '주식 물타기·평단가 & 수익률 계산기',
    en: 'Stock Average Down & Break-even Calculator',
    ja: '株式ナンピン・平均取得単価＆利回り計算機',
    zh: '股票补仓平均成本与保本价计算器',
    vi: 'Máy tính Bình quân giá & Điểm hòa vốn cổ phiếu',
  },
  'stock_calc.desc': {
    ko: '추가 매수 시 변동되는 평단가와 원금 회복 손익분기점, 목표 수익률 도달 매도가를 실시간으로 계산합니다.',
    en: 'Calculate new dynamic average price when averaging down, break-even exit price, and target sell price for desired ROI.',
    ja: '買い増し後の平均取得単価、元本回収損益分岐点、目標利回り達成に必要な売却価格を精密に試算します。',
    zh: '实时精确计算加仓补仓后的动态平均成本、保本解套点以及达到目标收益率所需的卖出价格。',
    vi: 'Tính giá vốn trung bình sau khi mua thêm, điểm hòa vốn và giá bán mục tiêu theo tỷ suất sinh lời mong muốn.',
  },
  'stock_calc.badge': { ko: '실전 주식 평단가 계산기', en: 'Stock DCA & Break-even Tool', ja: '実戦株式ナンピン計算機', zh: '实战股票补仓计算器', vi: 'Công cụ DCA cổ phiếu' },
  'stock_calc.initial_price': { ko: '1차 매수가 (현재 평단가)', en: 'Initial Purchase Price', ja: '1次買付価格 (現在の平均単価)', zh: '首次买入价 (当前持仓成本)', vi: 'Giá mua ban đầu' },
  'stock_calc.initial_qty': { ko: '보유 수량 (주)', en: 'Initial Shares Held', ja: '保有数量 (株)', zh: '持仓数量 (股)', vi: 'Số lượng cổ phiếu ban đầu' },
  'stock_calc.additional_price': { ko: '추가 매수가 (물타기 가격)', en: 'Additional Buy Price (DCA)', ja: '追加買付価格 (ナンピン価格)', zh: '追加买入价 (补仓价格)', vi: 'Giá mua thêm' },
  'stock_calc.additional_qty': { ko: '추가 매수 수량 (주)', en: 'Additional Shares to Buy', ja: '追加買付数量 (株)', zh: '追加买入数量 (股)', vi: 'Số lượng mua thêm' },
  'stock_calc.target_roi': { ko: '목표 수익률 (%)', en: 'Target Return / ROI (%)', ja: '目標リターン (%)', zh: '目标收益率 (%)', vi: 'Lợi nhuận mục tiêu (%)' },
  'stock_calc.fee_rate': { ko: '왕복 증권 수수료 & 거래세 (%)', en: 'Round-trip Trading Fee & Tax (%)', ja: '往復取引手数料・諸税率 (%)', zh: '往返交易佣金及印花税率 (%)', vi: 'Phí giao dịch & thuế (%)' },
  'stock_calc.final_avg_price': { ko: '물타기 후 최종 평단가', en: 'Final Blended Average Price', ja: '最終平均取得単価', zh: '最终加权平均持仓成本', vi: 'Giá bình quân cuối cùng' },
  'stock_calc.breakeven_price': { ko: '원금 회복 손익분기 매도가', en: 'Break-even Exit Price', ja: '損益分岐点売却価格', zh: '保本解套卖出价格', vi: 'Giá bán hòa vốn' },
  'stock_calc.target_sell_price': { ko: '목표 수익 달성 매도가', en: 'Target Goal Sell Price', ja: '目標達成売却価格', zh: '目标收益达成卖出价', vi: 'Giá bán đạt mục tiêu' },
  'stock_calc.total_investment': { ko: '총 투자 원금', en: 'Total Invested Capital', ja: '総投資資本金', zh: '累计总投资额', vi: 'Tổng vốn đầu tư' },
  'stock_calc.total_shares': { ko: '총 보유 주식 수', en: 'Total Shares Held', ja: '合計保有株式数', zh: '累计持股总量', vi: 'Tổng số cổ phiếu' },

  // 2. Loan Interest & Amortization Calculator
  'loan_calc.title': {
    ko: '대출 이자 및 원리금 균등 상환 계산기',
    en: 'Loan Amortization & Repayment Calculator',
    ja: 'ローン利息・元利均等返済シミュレーター',
    zh: '贷款利息与等额本息还款测算计算器',
    vi: 'Máy tính Trả nợ & Lãi suất vay',
  },
  'loan_calc.desc': {
    ko: '원리금 균등, 원금 균등, 만기 일시 상환 방식별 월 납입금과 총 이자 비용을 정밀하게 역산합니다.',
    en: 'Calculate monthly payments, total interest, and amortization schedules across equal principal & interest, equal principal, and balloon repayment methods.',
    ja: '元利均等、元金均等、期日一括返済ごとの月々返済額と総支払利息を詳細にシミュレーション。',
    zh: '对比等额本息、等额本金与先息后本模式下的月供金额、累计利息支出及还款明细。',
    vi: 'Tính số tiền trả hàng tháng và tổng lãi vay theo phương thức trả góp đều hoặc gốc đều.',
  },
  'loan_calc.badge': { ko: '스마트 대출 시뮬레이터', en: 'Smart Loan Amortization', ja: 'スマート返済試算', zh: '智能贷款测算', vi: 'Mô phỏng khoản vay' },
  'loan_calc.principal': { ko: '대출 원금', en: 'Loan Principal', ja: '借入元金', zh: '贷款本金', vi: 'Số tiền vay' },
  'loan_calc.interest_rate': { ko: '연 이자율 (%)', en: 'Annual Interest Rate (%)', ja: '年利 (%)', zh: '年利率 (%)', vi: 'Lãi suất hàng năm (%)' },
  'loan_calc.duration_months': { ko: '대출 기간 (개월)', en: 'Loan Term (Months)', ja: '返済期間 (ヶ月)', zh: '贷款期限 (月)', vi: 'Thời hạn vay (tháng)' },
  'loan_calc.method': { ko: '상환 방식', en: 'Repayment Method', ja: '返済方式', zh: '还款方式', vi: 'Phương thức trả nợ' },
  'loan_calc.monthly_payment': { ko: '월 평균 상환금', en: 'Estimated Monthly Payment', ja: '月々の平均返済額', zh: '预计月均还款额', vi: 'Số tiền trả mỗi tháng' },
  'loan_calc.total_interest': { ko: '총 대출 이자액', en: 'Total Interest Payable', ja: '支払利息総額', zh: '累计总利息支出', vi: 'Tổng tiền lãi' },
  'loan_calc.total_repayment': { ko: '총 원리금 상환액', en: 'Total Repayment Amount', ja: '総返済額 (元金+利息)', zh: '还款总额 (本金+利息)', vi: 'Tổng số tiền phải trả' },

  // 3. Compound Interest & Savings Calculator
  'compound_calc.title': {
    ko: '복리·CAGR 계산기 (연평균 복리수익률 & DCA 시뮬레이터)',
    en: 'Compound Interest & CAGR Investment Calculator',
    ja: '複利・CAGR投資シミュレーター (年平均成長率＆積立試算)',
    zh: '复利与CAGR年化复合收益率及定投模拟器',
    vi: 'Máy tính Lãi kép & Tỷ suất CAGR',
  },
  'compound_calc.desc': {
    ko: '초기 예치 원금과 매월 적립액, 연평균 복리 수익률(CAGR), 투자 기간을 입력하여 만기 시 수령액과 복리 효과를 정밀 시뮬레이션하세요.',
    en: 'Simulate long-term wealth compounding with monthly recurring contributions, CAGR returns, and visualize the power of compounding.',
    ja: '当初元金、毎月の積立額、年平均利回り(CAGR)、投資年数を設定し、満期時の資産推移と複利効果を視覚化します。',
    zh: '设定初始本金、每月定投额、年化复合收益率（CAGR）和投资年限，直观预测长期财富增长与复利奇迹。',
    vi: 'Mô phỏng sức mạnh lãi kép với số tiền gửi định kỳ hàng tháng và tỷ suất tăng trưởng dài hạn.',
  },
  'compound_calc.badge': { ko: '실시간 복리 시뮬레이터', en: 'Real-time Compounding Engine', ja: 'リアルタイム複利試算', zh: '实时复利模拟器', vi: 'Mô phỏng lãi kép' },
  'compound_calc.initial_deposit': { ko: '초기 예치 원금', en: 'Initial Principal Deposit', ja: '当初預入元金', zh: '初始投入本金', vi: 'Vốn ban đầu' },
  'compound_calc.monthly_addition': { ko: '월 추가 적립액', en: 'Monthly Contribution', ja: '毎月の追加積立額', zh: '每月定投追加额', vi: 'Số tiền nộp thêm mỗi tháng' },
  'compound_calc.annual_return': { ko: '예상 연평균 수익률 (%)', en: 'Estimated Annual Return (%)', ja: '想定年平均利回り (%)', zh: '预期年化收益率 (%)', vi: 'Lợi nhuận năm ước tính (%)' },
  'compound_calc.investment_period': { ko: '투자 기간 (년)', en: 'Investment Horizon (Years)', ja: '投資期間 (年)', zh: '投资期限 (年)', vi: 'Thời gian đầu tư (năm)' },
  'compound_calc.future_value': { ko: '만기 시 총 예상 자산', en: 'Projected Total Future Value', ja: '満期時想定総資産', zh: '到期预计总财富资产', vi: 'Giá trị tài sản tương lai' },
  'compound_calc.compound_interest_earned': { ko: '복리로 불어난 순수 이자 수익', en: 'Net Compound Returns Earned', ja: '複利による純利益額', zh: '复利所创造的净超额收益', vi: 'Tiền lãi kép kiếm được' },

  // 4. FIRE Retirement Calculator
  'fire_calc.title': {
    ko: 'FIRE 조기은퇴·경제적 자유 시뮬레이터',
    en: 'FIRE Early Retirement & Financial Freedom Simulator',
    ja: 'FIRE 早期リタイア＆経済的自由シミュレーター',
    zh: 'FIRE 提前退休与财务自由终极测算器',
    vi: 'Trình mô phỏng Nghỉ hưu sớm & Tự do tài chính FIRE',
  },
  'fire_calc.desc': {
    ko: '연간 생활비와 4% 안전 인출률 규칙을 기반으로 FIRE 은퇴 목표 자산과 도달 가능 시점을 정밀 계산합니다.',
    en: 'Calculate your target FIRE nest egg based on annual living expenses and the 4% safe withdrawal rule to project financial freedom.',
    ja: '年間生活費とトリニティスタディの4%ルールに基づき、リタイアに必要な目標純資産と到達年数を試算。',
    zh: '根据年生活支出和4%安全提款率规则，精准测算实现FIRE财务自由所需的资产总额与预计达成年限。',
    vi: 'Xác định số tiền mục tiêu để nghỉ hưu sớm dựa trên chi tiêu hàng năm và quy tắc rút tiền an toàn 4%.',
  },
  'fire_calc.badge': { ko: '조기은퇴 로드맵', en: 'Early Retirement Roadmap', ja: '早期リタイア設計', zh: '提前退休路线图', vi: 'Lộ trình nghỉ hưu' },

  // 5. Salary Take-home Pay Calculator
  'salary_calc.title': {
    ko: '연봉 실수령액 & 4대보험 소득세 계산기',
    en: 'Salary Net Take-home Pay & Deductions Calculator',
    ja: '年収手取り＆社会保険・所得税計算機',
    zh: '年薪税后到手收入与社保个人所得税计算器',
    vi: 'Máy tính Lương thực nhận & Thuế thu nhập',
  },
  'salary_calc.desc': {
    ko: '세전 연봉에서 4대 보험과 근로소득세를 공제한 실제 월 통장 입금액을 1초 만에 확인하세요.',
    en: 'Estimate net monthly take-home pay after statutory social insurance and income tax deductions.',
    ja: '額面年収から厚生年金、健康保険、雇用保険、所得税、住民税を差し引いた実際の手取り月額を即座に算出。',
    zh: '扣除各项社会保险和个人所得税后，一秒测算每月实际到手打卡工资净额。',
    vi: 'Ước tính lương thực lĩnh hàng tháng sau khi khấu trừ bảo hiểm xã hội và thuế.',
  },
  'salary_calc.badge': { ko: '연봉 실수령액 도구', en: 'Net Pay Calculator', ja: '手取り年収計算', zh: '税后净薪测算', vi: 'Tính lương thực nhận' },

  // 6. Dividend & Tax Calculator
  'dividend_calc.title': {
    ko: '배당금 및 배당소득세 실수령액 계산기',
    en: 'Dividend Income & Withholding Tax Calculator',
    ja: '配当金・配当所得税実質手取り計算機',
    zh: '股息红利与预扣所得税到手收益计算器',
    vi: 'Máy tính Cổ tức & Thuế khấu trừ tại nguồn',
  },
  'dividend_calc.desc': {
    ko: '보유 주식 수와 주당 배당금(DPS), 배당소득세(15.4%)를 차감한 실질 계좌 입금 배당금을 산출합니다.',
    en: 'Calculate net dividend payouts after statutory dividend withholding taxes based on shares held and DPS.',
    ja: '保有株数と1株当たり配当金（DPS）、配当所得税を控除した税引き後手取り配当金額を瞬時に算出。',
    zh: '根据持股数量、每股股息及预扣税率，准确计算税后实际到账的现金分红金额。',
    vi: 'Tính số tiền cổ tức thực nhận vào tài khoản sau khi trừ thuế cổ tức.',
  },
  'dividend_calc.badge': { ko: '배당소득 시뮬레이터', en: 'Dividend Yield Tool', ja: '配当金シミュレーター', zh: '股息红利测算', vi: 'Mô phỏng cổ tức' },

  // Legal & Regulatory Safe Notices
  'legal.sim_notice': {
    ko: '월덕 머니버스는 순수 시뮬레이션 기반 가상경제 플랫폼입니다. WLD 재화는 현금 환전이 절대 불가합니다.',
    en: 'Woldeok Moneyverse is an educational simulation. WLD currency holds zero monetary value and cannot be redeemed for fiat.',
    ja: 'ウォルドク・マネーバースは純粋なシミュレーション仮想経済です。WLDの現金換金は一切不可能です。',
    zh: '月德 Moneyverse 仅用于虚拟经济模拟。WLD 虚拟代币不具备现实货币价值，严禁充值提现。',
    vi: 'Woldeok Moneyverse là nền tảng mô phỏng kinh tế giáo dục. Tiền tệ WLD không có giá trị quy đổi tiền mặt.',
  },
  'legal.terms': { ko: '이용약관', en: 'Terms of Service', ja: '利用規約', zh: '服务条款', vi: 'Điều khoản dịch vụ' },
  'legal.privacy': { ko: '개인정보 처리방침', en: 'Privacy Policy', ja: 'プライバシーポリシー', zh: '隐私政策', vi: 'Chính sách quyền riêng tư' },
  'privacy.title': { ko: '개인정보 처리방침 & 데이터 관리', en: 'Privacy & Data Export', ja: 'プライバシー・データ管理', zh: '隐私政策与数据管理', vi: 'Quyền riêng tư & Quản lý dữ liệu' },
};

export function t(key: string, locale: Locale, fallback?: string): string {
  const item = TRANSLATIONS[key];
  if (!item) return fallback || key;
  return (item as any)[locale] || item.en || item.ko || fallback || key;
}
