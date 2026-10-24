import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Calculator,
  TrendingUp,
  Landmark,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  Target,
  Coins,
  Flame,
  Percent,
  Banknote,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DailyAttendanceRoulette } from '@/components/retention/daily-attendance-roulette';
import { DailyPredictionBattle } from '@/components/retention/daily-prediction-battle';
import { ReferralSystem } from '@/components/viral/referral-system';
import { PublicAdvertisement } from '@/components/public-advertisement';
import { PublicSitemapSubmitBox } from '@/components/public-sitemap-submit-box';
import { NationalTreasuryBalanceSimulator } from '@/components/economy/national-treasury-balance-simulator';
import { MegaJackpotLotteryDashboard } from '@/components/economy/mega-jackpot-lottery-dashboard';
import { TaylorRuleLendingMarginMonitor } from '@/components/economy/taylor-rule-lending-margin-monitor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getServerLocale } from '@/lib/locale-server';
import { canonicalUrl } from '@/lib/seo';

const TOOLS_META_BY_LOCALE = {
  en: {
    title: 'Financial Calculators & Simulation Tools | Woldeok Moneyverse',
    description: 'Explore free financial calculators and virtual-economy simulations, including compound interest, stock averaging, retirement planning, salary and tax estimates.',
    canonical: '/en/tools',
  },
  ko: {
    title: '금융 계산기·경제 시뮬레이터 도구 모음 | 월덕 머니버스',
    description: '복리·주식 평단가·연봉 실수령액·대출·은퇴·세금 추정과 가상경제 시뮬레이션을 브라우저에서 이용하세요. 실제 금융 정보와 게임 내 WLD 예시를 구분해 확인할 수 있습니다.',
    canonical: '/tools',
  },
  ja: {
    title: '金融計算・経済シミュレーションツール | ウォルドクマネーバース',
    description: '複利、株式平均取得単価、退職資金などの金融計算と仮想経済シミュレーションを確認できます。',
    canonical: '/ja/tools',
  },
  zh: {
    title: '金融计算与经济模拟工具 | 沃尔德克金融元宇宙',
    description: '提供复利、股票平均成本、退休目标等金融计算和虚拟经济模拟工具。',
    canonical: '/zh/tools',
  },
  vi: {
    title: 'Bộ máy tính tài chính & Mô phỏng kinh tế | Woldeok Moneyverse',
    description: 'Cung cấp các công cụ tính lãi kép, DCA cổ phiếu, hưu trí và mô phỏng kinh tế trực quan.',
    canonical: '/vi/tools',
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const meta = TOOLS_META_BY_LOCALE[locale] ?? TOOLS_META_BY_LOCALE.en;

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: canonicalUrl(meta.canonical),
      languages: {
        'ko-KR': canonicalUrl('/tools'),
        'en-US': canonicalUrl('/en/tools'),
        'ja-JP': canonicalUrl('/ja/tools'),
        'zh-CN': canonicalUrl('/zh/tools'),
        'x-default': canonicalUrl('/tools'),
      },
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: canonicalUrl(meta.canonical),
    },
  };
}

interface LocalizedToolItem {
  id: string;
  category: 'savings' | 'investment' | 'tax';
  badgeColor: string;
  href: string;
  icon: any;
  title: Record<string, string>;
  badge: Record<string, string>;
  description: Record<string, string>;
  features: Record<string, string[]>;
}

const LOCALIZED_TOOLS: LocalizedToolItem[] = [
  {
    id: 'compound-calculator',
    category: 'savings',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    href: '/tools/compound-calculator',
    icon: Landmark,
    title: {
      ko: '복리 예금·적금 이자 계산기',
      en: 'Compound Interest & Savings Calculator',
      ja: '複利預金・積立利息計算機',
      zh: '复利存款与储蓄利息计算器',
      vi: 'Máy tính Lãi kép & Tiết kiệm',
    },
    badge: {
      ko: '인기 1위',
      en: 'Most Popular',
      ja: '人気 No.1',
      zh: '最热门',
      vi: 'Phổ biến nhất',
    },
    description: {
      ko: '일 복리, 월 복리, 연 복리 수익을 시뮬레이션하고 만기 수령액과 단리 대비 복리 초과분을 역산합니다.',
      en: 'Simulate daily, monthly, and annual compound interest, estimating maturity amounts and compound gains over simple interest.',
      ja: '日次・月次・年次の複利利息をシミュレーションし、単利に対する複利効果を瞬時に算出します。',
      zh: '模拟按日、按月、按年复利收益，测算到期金额以及相比单利的超额回报。',
      vi: 'Mô phỏng lãi kép theo ngày, tháng, năm, ước tính số tiền đáo hạn so với lãi đơn.',
    },
    features: {
      ko: ['일/월/연 복리 비교', '목표액 도달 기간 역산', '이자 소득 시뮬레이션'],
      en: ['Daily/Monthly/Yearly Compare', 'Target Horizon Calculator', 'Tax & Interest Estimation'],
      ja: ['日/月/年 複利比較', '目標達成期間逆算', '利息手取り試算'],
      zh: ['日/月/年复利对比', '目标金额达成年限测算', '利息收益税后测算'],
      vi: ['So sánh lãi kép ngày/tháng/năm', 'Tính thời gian đạt mục tiêu', 'Ước tính lợi nhuận'],
    },
  },
  {
    id: 'stock-calculator',
    category: 'investment',
    badgeColor: 'bg-primary/10 text-primary border-primary/30',
    href: '/tools/stock-calculator',
    icon: TrendingUp,
    title: {
      ko: '주식 물타기·평단가 & 수익률 계산기',
      en: 'Stock Average Down & Break-even Calculator',
      ja: '株式ナンピン・平均取得単価＆利回り計算機',
      zh: '股票补仓平均成本与保本价计算器',
      vi: 'Máy tính Bình quân giá & Điểm hòa vốn cổ phiếu',
    },
    badge: {
      ko: '실전 트레이딩',
      en: 'Trading Tool',
      ja: '実戦トレード',
      zh: '实战交易',
      vi: 'Công cụ giao dịch',
    },
    description: {
      ko: '추가 매수 시 실시간으로 변하는 평단가를 계산하고, 목표 수익률 도달을 위한 매도가를 정밀 산출합니다.',
      en: 'Recalculate dynamic average buy price when dollar-cost averaging and determine target sell price for desired ROI.',
      ja: '買い増し時の平均取得単価を自動再計算し、目標リターン達成に必要な売却価格を精密に算出します。',
      zh: '计算加仓补仓后的动态平均持仓成本，并精确反算达到目标收益率所需的卖出价格。',
      vi: 'Tính giá vốn trung bình sau khi mua thêm và tính giá bán mục tiêu.',
    },
    features: {
      ko: ['추가 매수 물타기 평단가', '목표 수익률 역산 매도가', '10대 종목 실시간 연동'],
      en: ['DCA Average Price', 'Target ROI Sell Price', 'Multi-Ticker Integration'],
      ja: ['ナンピン平均単価計算', '目標利回り逆算価格', 'リアルタイム銘柄連動'],
      zh: ['补仓后平均持仓成本', '目标收益反算卖出价', '多币种股票支持'],
      vi: ['Giá bình quân sau DCA', 'Giá bán theo mục tiêu ROI', 'Hỗ trợ đa tài sản'],
    },
  },
  {
    id: 'fire-calculator',
    category: 'savings',
    badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    href: '/tools/fire-calculator',
    icon: Flame,
    title: {
      ko: 'FIRE 조기은퇴·경제적 자유 시뮬레이터',
      en: 'FIRE Early Retirement & Financial Freedom Simulator',
      ja: 'FIRE 早期リタイア＆経済的自立シミュレーター',
      zh: 'FIRE 提前退休与财务自由模拟器',
      vi: 'Trình mô phỏng Nghỉ hưu sớm FIRE',
    },
    badge: {
      ko: '조기은퇴',
      en: 'Early Retirement',
      ja: 'アーリーリタイア',
      zh: '提前退休',
      vi: 'Nghỉ hưu sớm',
    },
    description: {
      ko: '트리니티 스터디 4% 안전 인출률과 인플레이션 실질 복리를 적용하여 목표 자산과 은퇴 가능 나이를 계산합니다.',
      en: 'Apply Trinity Study 4% safe withdrawal rule and real inflation rates to evaluate target net worth and retirement age.',
      ja: 'トリニティ・スタディの4%安全引き出しルールと実質インフレ率を適用し、目標資産とリタイア可能年齢を診断します。',
      zh: '结合三一学院4%安全取款法则与实际通胀率，模拟测算目标资产净值与可行退休年龄。',
      vi: 'Áp dụng quy tắc rút an toàn 4% của Trinity Study và lạm phát để ước tính độ tuổi nghỉ hưu.',
    },
    features: {
      ko: ['트리니티 4% 안전 인출률', '5대 FIRE 유형 비교', '은퇴 도달 나이 실시간 역산'],
      en: ['Trinity 4% Safe Withdrawal', '5 FIRE Archetypes', 'Dynamic Retirement Age'],
      ja: ['トリニティ4%ルール', '5大FIRE類型比較', '引退年齢リアルタイム逆算'],
      zh: ['三一4%安全提款法则', '5大FIRE类型对比', '退休年龄动态反算'],
      vi: ['Quy tắc rút 4%', '5 trường phái FIRE', 'Tính tuổi nghỉ hưu'],
    },
  },
  {
    id: 'loan-interest-calculator',
    category: 'tax',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    href: '/tools/loan-interest-calculator',
    icon: Percent,
    title: {
      ko: '대출이자 & 원리금 상환 계산기',
      en: 'Loan Amortization & Repayment Calculator',
      ja: 'ローン利息＆元利金均等返済計算機',
      zh: '贷款利息与本息还款测算器',
      vi: 'Máy tính Lãi vay & Trả góp',
    },
    badge: {
      ko: '대출 필수',
      en: 'Loan Essential',
      ja: 'ローン必須',
      zh: '贷款必备',
      vi: 'Tín dụng thiết yếu',
    },
    description: {
      ko: '원리금균등, 원금균등, 만기일시 상환방식별 총 이자와 월 상환액을 한눈에 비교합니다.',
      en: 'Compare equal payment, equal principal, and balloon repayment schedules with monthly breakdown and total interest.',
      ja: '元利均等、元金均等、期日一括返済ごとの月額返済額および総支払利息を一括比較します。',
      zh: '对比等额本息、等额本金与先息后本等不同还款方式的月供及累计总利息。',
      vi: 'So sánh dư nợ giảm dần, gốc đều và trả lãi hàng tháng.',
    },
    features: {
      ko: ['원리금균등 vs 원금균등 비교', '월별 상환 스케줄 시각화', '중도상환수수료 계산'],
      en: ['Amortization Comparison', 'Monthly Payment Visualizer', 'Prepayment Penalty Tool'],
      ja: ['元利均等 vs 元金均等比較', '月別返済スケジュール表', '中途解約違約金試算'],
      zh: ['等额本息 vs 等额本金', '月度还款计划表', '提前还款违约金测算'],
      vi: ['So sánh các gói trả góp', 'Lịch trả nợ hàng tháng', 'Phí trả nợ trước hạn'],
    },
  },
  {
    id: 'dividend-tax-calculator',
    category: 'investment',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    href: '/tools/dividend-tax-calculator',
    icon: Coins,
    title: {
      ko: '배당소득세 계산기 (국내 · 미국주식)',
      en: 'Dividend Withholding Tax Calculator',
      ja: '配当所得税計算機（国内・米国株）',
      zh: '股息红利预扣税测算器',
      vi: 'Máy tính Thuế cổ tức & Thu nhập ròng',
    },
    badge: {
      ko: '배당 투자',
      en: 'Dividend Investing',
      ja: '高配当投資',
      zh: '高息股投资',
      vi: 'Đầu tư cổ tức',
    },
    description: {
      ko: '국내 및 미국 주식 배당금의 15.4% 원천징수 실수령액과 2,000만원 초과 시 금융종합과세 여부를 계산합니다.',
      en: 'Calculate net dividend payouts after 15.4% domestic or 15% US withholding tax, and verify global financial income thresholds.',
      ja: '国内・米国株式配当の源泉徴収後手取り額と、総合課税対象となる基準額を診断します。',
      zh: '测算境内外股票股息扣缴税款后的实际到手红利，并评估大额综合理财所得税务门槛。',
      vi: 'Tính số tiền cổ tức thực nhận sau thuế khấu trừ và kiểm tra hạn mức thuế.',
    },
    features: {
      ko: ['국내 15.4% vs 미국 15.0%', '2,000만원 한도 소진율', '실수령 배당금 산출'],
      en: ['Domestic vs Foreign Rates', 'Threshold Exhaustion Gauge', 'Net After-tax Payout'],
      ja: ['国内税率 vs 外国税率比較', '限度額消化メーター', '手取り配当金自動算出'],
      zh: ['境内 vs 跨境扣缴对比', '免税/优惠额度进度条', '净到手股息精确算'],
      vi: ['So sánh thuế suất trong/ngoài nước', 'Thước đo hạn mức', 'Cổ tức thực nhận'],
    },
  },
  {
    id: 'salary-calculator',
    category: 'tax',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    href: '/tools/salary-calculator',
    icon: Calculator,
    title: {
      ko: '연봉별 실수령액 & 4대보험 공제 계산기',
      en: 'Net Salary & Social Security Deduction Calculator',
      ja: '給与手取り＆社会保険料控除計算機',
      zh: '年薪税后净收入与社保五险一金测算器',
      vi: 'Máy tính Lương thực nhận & Khấu trừ Bảo hiểm',
    },
    badge: {
      ko: '직장인 1위',
      en: 'Career Essential',
      ja: '会社員必須',
      zh: '职场必备',
      vi: 'Dân văn phòng',
    },
    description: {
      ko: '2026년 최신 4대 보험 요율과 근로소득세 간이세액표를 반영한 연봉별 월 실수령액을 확인합니다.',
      en: 'Check accurate monthly take-home salary after income tax and national insurance contributions.',
      ja: '最新の社会保険料率および所得税テーブルに基づき、年収ごとの月次手取り受取額を算出します。',
      zh: '根据最新个人所得税预扣率表与社保基数，精准计算各薪资阶层的月度实际税后到手收入。',
      vi: 'Kiểm tra lương thực nhận hàng tháng sau khi trừ thuế thu nhập và các loại bảo hiểm bắt buộc.',
    },
    features: {
      ko: ['4대보험 1원 단위 산출', '비과세 식대 20만원 자동 반영', '부양가족별 공제'],
      en: ['Detailed Deduction Breakdown', 'Tax-free Allowances Included', 'Dependent Allowances'],
      ja: ['社会保険料の詳細算出', '非課税手当自動控除', '扶養控除シミュレーション'],
      zh: ['社保扣除明细全览', '专项附加免税扣除', '赡养扶养子女减免'],
      vi: ['Chi tiết các khoản khấu trừ', 'Phụ cấp miễn thuế', 'Giảm trừ gia cảnh'],
    },
  },
  {
    id: 'crypto-apy-calculator',
    category: 'investment',
    badgeColor: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
    href: '/tools/crypto-apy-calculator',
    icon: Banknote,
    title: {
      ko: '크립토 스테이킹 APY/APR 복리 계산기',
      en: 'Crypto Staking APY vs APR Calculator',
      ja: '暗号資産ステーキング APY/APR 複利計算機',
      zh: '加密货币质押 APY与APR复利换算器',
      vi: 'Máy tính Lãi kép Staking Crypto APY/APR',
    },
    badge: {
      ko: 'DeFi',
      en: 'DeFi Tool',
      ja: 'DeFiツール',
      zh: '去中心化金融',
      vi: 'Công cụ DeFi',
    },
    description: {
      ko: '스테이킹 및 DeFi 유동성 풀의 단리(APR)와 복리(APY)를 상호 변환하고 자동 재예치 복리를 계산합니다.',
      en: 'Convert APR to APY with continuous auto-compounding frequencies (daily, weekly, monthly) for staking and LP pools.',
      ja: '単利（APR）と複利（APY）を相互変換し、自動再投資頻度による収益格差を精密にシミュレーションします。',
      zh: '相互转换单利（APR）与复利（APY），测算按日、按周自动再质押复利累积效应。',
      vi: 'Chuyển đổi linh hoạt giữa APR và APY với tần suất tái đầu tư tự động hàng ngày/tuần/tháng.',
    },
    features: {
      ko: ['APR ↔ APY 상호 변환', '매일/매주/매월 재예치 복리', '일별/월별 수령액 정밀 산출'],
      en: ['APR ↔ APY Conversion', 'Flexible Compound Frequency', 'Daily/Monthly Returns'],
      ja: ['APR ↔ APY 相互換算', '高頻度オートコンパウンド', '日次・月次リターン表示'],
      zh: ['APR ↔ APY 相互转换', '多频次自动复投', '日收益/月收益测算'],
      vi: ['Chuyển đổi APR ↔ APY', 'Tái đầu tư linh hoạt', 'Tính lợi nhuận ngày/tháng'],
    },
  },
  {
    id: 'goal-wealth-calculator',
    category: 'savings',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    href: '/tools/goal-wealth-calculator',
    icon: Target,
    title: {
      ko: '목표 자산·은퇴·목돈 모으기 계산기',
      en: 'Target Wealth & Milestone Goal Calculator',
      ja: '目標資産・リタイア・まとまった資金形成計算機',
      zh: '财富目标与大额储蓄目标达成测算器',
      vi: 'Máy tính Mục tiêu Tích lũy Tài sản',
    },
    badge: {
      ko: '목표 달성',
      en: 'Goal Milestone',
      ja: '目標達成',
      zh: '目标达成',
      vi: 'Đạt mục tiêu',
    },
    description: {
      ko: '월 저축액과 투자 수익률, 인플레이션을 반영하여 목표 자산 도달 시점과 4% 룰 안전 은퇴 생활비를 계산합니다.',
      en: 'Estimate time horizon to hit your net worth target with monthly contributions, compound ROI, and inflation adjustments.',
      ja: '毎月の積立額、想定利回り、インフレ率を織り込み、目標資産到達時期と安全な取り崩し可能額を逆算します。',
      zh: '综合每月定投额、投资年化回报与通货膨胀，精准测算达成既定净资产目标的时间节点。',
      vi: 'Ước tính thời gian đạt mốc tài sản mục tiêu với các khoản tích lũy định kỳ và tỷ suất sinh lời.',
    },
    features: {
      ko: ['목표 자산 도달 기간 역산', '트리니티 4% 룰 안전 인출액', '사회초년생 프리셋'],
      en: ['Horizon Time Reverse Lookup', 'Trinity 4% Rule Integration', 'Starter Presets Included'],
      ja: ['目標到達年数逆算', 'トリニティ4%ルール連動', '初心者向けプリセット'],
      zh: ['目标达成所需年限逆算', '三一4%安全取款', '小白起步预设'],
      vi: ['Tính ngược thời gian hoàn thành', 'Tích hợp quy tắc 4%', 'Có sẵn mẫu thiết lập'],
    },
  },
  {
    id: 'isa-calculator',
    category: 'tax',
    badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    href: '/tools/isa-calculator',
    icon: ShieldCheck,
    title: {
      ko: 'ISA 개인종합자산관리계좌 비과세 계산기',
      en: 'ISA Tax-Exempt & Tax-Advantaged Account Calculator',
      ja: 'ISA 個人総合資産管理口座 非課税シミュレーター',
      zh: 'ISA 个人综合资产账户免税与减税计算器',
      vi: 'Máy tính Miễn thuế Tài khoản Quản lý Tài sản ISA',
    },
    badge: {
      ko: '만능 절세',
      en: 'Tax Shield',
      ja: '万能節税',
      zh: '省税神器',
      vi: 'Tiết kiệm thuế',
    },
    description: {
      ko: '일반형(200만)과 서민형(400만) 비과세 한도 및 초과분 9.9% 분리과세로 일반 계좌 대비 절세액을 비교합니다.',
      en: 'Model tax savings from tax-exempt limits and reduced 9.9% separate taxation compared to standard brokerage accounts.',
      ja: '一般型（200万）と低所得型（400万）の非課税枠および超過分の9.9%分離課税による節税額を一般口座と比較します。',
      zh: '对比免税额度及超出部分9.9%低税率独立计税模式，测算相比普通投资账户的实收节税收益。',
      vi: 'So sánh mức tiết kiệm thuế từ hạn mức miễn trừ và thuế suất ưu đãi so với tài khoản thông thường.',
    },
    features: {
      ko: ['일반형 vs 서민형 비과세', '초과분 9.9% 저율 분리과세', '금융소득종합과세 방어'],
      en: ['Standard vs Preferential Tiers', 'Low-rate Separate Taxation', 'Comprehensive Shield'],
      ja: ['一般型 vs 優遇型非課税比較', '9.9%低率分離課税', '金融所得総合課税ガード'],
      zh: ['普通型 vs 优惠型免税对比', '9.9%低税率分离计税', '综合金融税负规避'],
      vi: ['So sánh loại phổ thông và ưu đãi', 'Thuế suất tách riêng 9.9%', 'Bảo vệ thuế toàn diện'],
    },
  },
  {
    id: 'pension-tax-calculator',
    category: 'tax',
    badgeColor: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
    href: '/tools/pension-tax-calculator',
    icon: Landmark,
    title: {
      ko: '연금저축 & IRP 세액공제 환급 계산기',
      en: 'Pension Savings & Retirement Account Tax Credit Calculator',
      ja: '年金貯蓄＆IRP 税額控除還付シミュレーター',
      zh: '个人养老金与储蓄税收抵免退税测算器',
      vi: 'Máy tính Hoàn thuế Quỹ Hưu trí & Tiết kiệm',
    },
    badge: {
      ko: '13월의 월급',
      en: 'Tax Refund',
      ja: '13月の給与',
      zh: '年末退税',
      vi: 'Hoàn thuế hưu trí',
    },
    description: {
      ko: '총급여 5,500만 원 기준 16.5%/13.2% 공제율과 연 900만 원 한도 최대 148만 5천 원 환급금을 산출합니다.',
      en: 'Calculate maximum tax refunds based on qualifying contribution limits and graduated salary tax credit brackets.',
      ja: '給与水準別の税額控除率と年間限度額を基に、年末調整での最大還付金額を正確に試算します。',
      zh: '依据不同年收入区间的抵免比例与年度上限，一键估算个人年金账户可享有的最大退税红包。',
      vi: 'Tính toán khoản hoàn thuế tối đa dựa trên hạn mức đóng góp và mức lương tương ứng.',
    },
    features: {
      ko: ['총급여 구간별 세액공제율', '연금저축 600만 + IRP 300만 한도', '10년 누적 절세액 시뮬레이션'],
      en: ['Salary-bracket Credit Rates', 'Combined Contribution Cap', '10-Year Cumulative Savings'],
      ja: ['給与帯別控除率対応', '年金貯蓄＋IRP合算枠', '10年累積節税シミュレーション'],
      zh: ['薪资阶梯抵扣比例', '双账户合并限额测算', '十年累计节税复利'],
      vi: ['Tỷ lệ hoàn thuế theo lương', 'Hạn mức đóng góp kép', 'Mô phỏng tiết kiệm 10 năm'],
    },
  },
];

const UI_TEXT = {
  ko: {
    tabs: {
      all: '전체 10종',
      savings: '자산·복리',
      investment: '주식·투자',
      tax: '대출·세금',
      macro: '거시경제 랩',
    },
    cta: '계산기 시작하기',
    faq: {
      title: '자주 묻는 질문 (FAQ)',
      q1: 'Q. 로그인이 필요한가요?',
      a1: '아닙니다. 모든 계산 도구는 비회원 및 게스트 사용자도 제한 없이 무료로 즉시 사용할 수 있습니다.',
      q2: 'Q. 계산 결과를 공유할 수 있나요?',
      a2: '네, 각 계산기 내의 공유 버튼을 누르면 인스타그램/디스코드용 예쁜 요약 카드 이미지 및 클립보드 텍스트로 즉시 복사됩니다.',
    },
  },
  en: {
    tabs: {
      all: 'All 10 Tools',
      savings: 'Savings & Compounding',
      investment: 'Stocks & Investing',
      tax: 'Loans & Taxes',
      macro: 'Macro Lab',
    },
    cta: 'Launch Calculator',
    faq: {
      title: 'Frequently Asked Questions (FAQ)',
      q1: 'Q. Is sign-in required to use these tools?',
      a1: 'No sign-in is required. All calculation tools are free and unrestricted for guests and unregistered visitors.',
      q2: 'Q. Can I share the calculated results?',
      a2: 'Yes, clicking the share button generates a viral summary card image and clipboard text ready for Discord, Instagram, and social media.',
    },
  },
  ja: {
    tabs: {
      all: '全10種',
      savings: '資産・複利',
      investment: '株式・投資',
      tax: 'ローン・税金',
      macro: 'マクロ経済ラボ',
    },
    cta: '計算機を起動',
    faq: {
      title: 'よくある質問 (FAQ)',
      q1: 'Q. ログインは必要ですか？',
      a1: 'いいえ、不要です。すべての計算ツールは非会員およびゲストでも制限なく完全無料でご利用いただけます。',
      q2: 'Q. 計算結果をシェアできますか？',
      a2: 'はい、各計算機の共有ボタンを押すと、DiscordやSNS用のサマリーカード画像やテキストをクリップボードにコピーできます。',
    },
  },
  zh: {
    tabs: {
      all: '全部10种',
      savings: '资产与复利',
      investment: '股票与投资',
      tax: '贷款与税费',
      macro: '宏观经济实验室',
    },
    cta: '启动计算器',
    faq: {
      title: '常见问题 (FAQ)',
      q1: 'Q. 使用这些工具需要登录吗？',
      a1: '不需要。所有金融计算工具均向免登录访客免费开放，无使用次数限制。',
      q2: 'Q. 可以分享计算结果吗？',
      a2: '可以，点击各计算器内的分享按钮即可自动生成社交分享长图卡片或复制文本至剪贴板。',
    },
  },
  vi: {
    tabs: {
      all: 'Tất cả 10 công cụ',
      savings: 'Tích lũy & Lãi kép',
      investment: 'Chứng khoán & Đầu tư',
      tax: 'Khoản vay & Thuế',
      macro: 'Phòng thí nghiệm vĩ mô',
    },
    cta: 'Bắt đầu tính toán',
    faq: {
      title: 'Câu hỏi thường gặp (FAQ)',
      q1: 'Q. Có cần đăng nhập để sử dụng không?',
      a1: 'Không cần. Mọi công cụ tính toán đều miễn phí hoàn toàn cho khách truy cập vãng lai mà không bị giới hạn.',
      q2: 'Q. Tôi có thể chia sẻ kết quả tính toán không?',
      a2: 'Có, nút chia sẻ trong mỗi máy tính sẽ tạo hình ảnh tóm tắt đẹp mắt để chia sẻ trên mạng xã hội.',
    },
  },
};

export default async function ToolsHubPage() {
  const locale = await getServerLocale();
  const lang = (locale in UI_TEXT ? locale : 'en') as keyof typeof UI_TEXT;
  const t = UI_TEXT[lang];

  const copy = {
    en: { badge: 'Financial Calculators & Simulation', heading: 'Financial Tools Hub', description: 'Explore compound interest, stock averaging, retirement planning, salary, loans and tax estimates.' },
    ko: { badge: '실전 금융 계산기 & 시뮬레이터', heading: '실전 금융 웹 계산기 10선', description: '복리·주식 평단가·대출이자·배당소득세·연봉 실수령액을 직관적인 차트와 함께 1초 만에 무료로 시뮬레이션하세요.' },
    ja: { badge: '金融計算・シミュレーション', heading: '金融計算ツールハブ', description: '複利、株式の平均取得単価、退職資金、給与、ローン、税金の試算ツールです。' },
    zh: { badge: '金融计算与模拟工具', heading: '金融工具中心', description: '复利、股票平均成本、退休、薪资、贷款和税费估算工具。' },
    vi: { badge: 'Công cụ Tính toán Tài chính', heading: 'Trung tâm Máy tính Tài chính', description: 'Tính toán lãi kép, bình quân giá cổ phiếu (DCA), kế hoạch hưu trí, lương và ước tính lãi vay.' },
  }[lang];

  return (
    <div className="min-h-screen pb-24 space-y-8">
      {/* 1. 상단 대형 토스형 헤더 */}
      <div className="toss-card p-6 sm:p-8 space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold">
          <Sparkles className="size-3.5" />
          <span>{copy.badge}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          {copy.heading}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
          {copy.description}
        </p>
      </div>

      {/* 2. 탭 기반 계산기 분류 */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="flex flex-wrap h-auto p-1 bg-muted/60 rounded-2xl gap-1 max-w-2xl">
          <TabsTrigger value="all" className="rounded-xl text-xs sm:text-sm font-semibold h-10 px-4">
            {t.tabs.all}
          </TabsTrigger>
          <TabsTrigger value="savings" className="rounded-xl text-xs sm:text-sm font-semibold h-10 px-4">
            {t.tabs.savings}
          </TabsTrigger>
          <TabsTrigger value="investment" className="rounded-xl text-xs sm:text-sm font-semibold h-10 px-4">
            {t.tabs.investment}
          </TabsTrigger>
          <TabsTrigger value="tax" className="rounded-xl text-xs sm:text-sm font-semibold h-10 px-4">
            {t.tabs.tax}
          </TabsTrigger>
          <TabsTrigger value="macro" className="rounded-xl text-xs sm:text-sm font-semibold h-10 px-4">
            {t.tabs.macro}
          </TabsTrigger>
        </TabsList>

        {/* 탭: 전체 10종 카드 그리드 */}
        <TabsContent value="all" className="space-y-6 focus-visible:outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {LOCALIZED_TOOLS.map((tool) => (
              <ToolCard key={tool.id} tool={tool} lang={lang} ctaLabel={t.cta} />
            ))}
          </div>
        </TabsContent>

        {/* 탭: 자산·복리 */}
        <TabsContent value="savings" className="space-y-6 focus-visible:outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {LOCALIZED_TOOLS.filter((t) => t.category === 'savings').map((tool) => (
              <ToolCard key={tool.id} tool={tool} lang={lang} ctaLabel={t.cta} />
            ))}
          </div>
        </TabsContent>

        {/* 탭: 주식·투자 */}
        <TabsContent value="investment" className="space-y-6 focus-visible:outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {LOCALIZED_TOOLS.filter((t) => t.category === 'investment').map((tool) => (
              <ToolCard key={tool.id} tool={tool} lang={lang} ctaLabel={t.cta} />
            ))}
          </div>
        </TabsContent>

        {/* 탭: 대출·세금 */}
        <TabsContent value="tax" className="space-y-6 focus-visible:outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {LOCALIZED_TOOLS.filter((t) => t.category === 'tax').map((tool) => (
              <ToolCard key={tool.id} tool={tool} lang={lang} ctaLabel={t.cta} />
            ))}
          </div>
        </TabsContent>

        {/* 탭: 거시경제 랩 & 리텐션 이벤트 */}
        <TabsContent value="macro" className="space-y-6 focus-visible:outline-none">
          <NationalTreasuryBalanceSimulator />
          <MegaJackpotLotteryDashboard />
          <TaylorRuleLendingMarginMonitor />
          <DailyAttendanceRoulette />
          <DailyPredictionBattle />
          <ReferralSystem />
        </TabsContent>
      </Tabs>

      {/* 스폰서 광고 슬롯 */}
      <PublicAdvertisement />

      {/* 자주 묻는 질문 FAQ (토스형 아코디언 스타일) */}
      <div className="toss-card p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-foreground font-bold text-base">
          <HelpCircle className="size-5 text-primary" />
          <span>{t.faq.title}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-muted-foreground">
          <div className="p-4 rounded-xl bg-muted/20 space-y-1.5 border border-border/40">
            <p className="font-bold text-foreground">{t.faq.q1}</p>
            <p className="leading-relaxed">{t.faq.a1}</p>
          </div>
          <div className="p-4 rounded-xl bg-muted/20 space-y-1.5 border border-border/40">
            <p className="font-bold text-foreground">{t.faq.q2}</p>
            <p className="leading-relaxed">{t.faq.a2}</p>
          </div>
        </div>
      </div>

      {/* 사이트맵 등록 */}
      <PublicSitemapSubmitBox />
    </div>
  );
}

function ToolCard({
  tool,
  lang,
  ctaLabel,
}: {
  readonly tool: LocalizedToolItem;
  readonly lang: string;
  readonly ctaLabel: string;
}) {
  const Icon = tool.icon;
  const title = tool.title[lang] ?? tool.title.en ?? '';
  const badge = tool.badge[lang] ?? tool.badge.en ?? '';
  const description = tool.description[lang] ?? tool.description.en ?? '';
  const features = tool.features[lang] ?? tool.features.en ?? [];

  return (
    <div className="toss-card p-6 flex flex-col justify-between space-y-5 group hover:border-primary/50 transition-all">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
            <Icon className="size-5" />
          </div>
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${tool.badgeColor}`}>
            {badge}
          </span>
        </div>

        <div className="space-y-1">
          <h2 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
            {title}
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>

        <ul className="space-y-1 text-xs text-muted-foreground/80 pt-1">
          {features.map((feat, idx) => (
            <li key={idx} className="flex items-center gap-1.5">
              <div className="size-1 rounded-full bg-primary" />
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      <Button asChild className="h-12 rounded-2xl btn-toss font-bold text-xs w-full shadow-sm">
        <Link href={tool.href} className="flex items-center justify-center gap-1.5">
          <span>{ctaLabel}</span>
          <ArrowRight className="size-4" />
        </Link>
      </Button>
    </div>
  );
}
