const fs = require('fs');
const path = require('path');

const CALC_H1_MAP = {
  'loan-interest-calculator': {
    ko: '대출이자 계산기 (원리금균등 · 원금균등)',
    en: 'Loan Interest Calculator (Amortization & Equal Principal)',
    ja: 'ローン金利計算機（元利均等・元金均等）',
    zh: '贷款利息计算器（等额本息 · 等额本金）',
    vi: 'Máy tính Lãi suất Vay (Gốc & Lãi Đều)',
  },
  'stock-calculator': {
    ko: '주식 물타기·평단가 & 수익률 계산기',
    en: 'Stock DCA & Average Cost Calculator',
    ja: '株式ナンピン・平均取得単価＆収益率計算機',
    zh: '股票补仓摊薄成本与收益率计算器',
    vi: 'Máy tính Bình quân Giá Cổ phiếu (DCA)',
  },
  'dividend-tax-calculator': {
    ko: '배당소득세 계산기 (국내 · 미국주식)',
    en: 'Dividend Income Tax Calculator (Domestic & US Stocks)',
    ja: '配当所得税計算機（国内・米国株式）',
    zh: '股息红利所得税计算器（国内 · 美股）',
    vi: 'Máy tính Thuế Thu nhập Cổ tức',
  },
  'salary-calculator': {
    ko: '연봉별 실수령액 계산기 (4대보험 공제)',
    en: 'Salary Take-Home Pay & After-Tax Calculator',
    ja: '年収手取り額計算機（社会保険料控除）',
    zh: '税后薪资实际到手收入计算器',
    vi: 'Máy tính Lương Thực nhận Sau Thuế',
  },
  'real-estate-calculator': {
    ko: '부동산 가상 투자 수익률 계산기',
    en: 'Virtual Real Estate Investment Yield Calculator',
    ja: '不動産仮想投資利回り計算機',
    zh: '房地产虚拟投资收益率计算器',
    vi: 'Máy tính Lợi suất Đầu tư Bất động sản Ảo',
  },
  'retirement-calculator': {
    ko: '직장인 퇴직금 실수령액 & IRP 절세 계산기',
    en: 'Severance Pay & Retirement Pension Tax Calculator',
    ja: '退職金手取り額＆年金節税計算機',
    zh: '退休遣散费到手与税收优惠计算器',
    vi: 'Máy tính Trợ cấp Thôi việc & Hưu trí',
  },
  'youth-leap-calculator': {
    ko: '청년도약계좌 만기 5,000만원 계산기',
    en: 'Youth Savings Ladder Maturity Yield Calculator',
    ja: '青年跳躍口座満期利回り計算機',
    zh: '青年成长储蓄阶梯到期收益计算器',
    vi: 'Máy tính Tích lũy Tài chính Thanh niên',
  },
  'isa-calculator': {
    ko: 'ISA(개인종합자산관리계좌) 비과세 절세 계산기',
    en: 'ISA Tax-Exempt Wealth Growth Calculator',
    ja: 'ISA（個人総合資産管理）非課税節税計算機',
    zh: 'ISA免税个人财富账户计算器',
    vi: 'Máy tính Tiết kiệm Miễn thuế ISA',
  },
  'pension-tax-calculator': {
    ko: '연금저축 & IRP 세액공제 계산기',
    en: 'Pension Savings & Tax Credit Calculator',
    ja: '年金貯蓄＆税額控除計算機',
    zh: '个人养老金与税额扣除计算器',
    vi: 'Máy tính Khấu trừ Thuế Tiết kiệm Hưu trí',
  },
  'gift-tax-calculator': {
    ko: '2026 증여세 계산기 & 면제 한도 시뮬레이터',
    en: 'Gift Tax & Exemption Threshold Simulator',
    ja: '贈与税計算機＆非課税枠シミュレーター',
    zh: '赠与税与免税额度测算计算器',
    vi: 'Máy tính Thuế Quà tặng & Chuyển nhượng',
  },
  'capital-gains-tax-calculator': {
    ko: '해외주식 양도소득세 계산기 (250만원 기본공제)',
    en: 'Capital Gains Tax Calculator (Global Equities)',
    ja: '海外株式譲渡所得税計算機',
    zh: '海外股票资本利得税计算器',
    vi: 'Máy tính Thuế Thu nhập Chuyển nhượng Cổ phiếu',
  },
  'crypto-apy-calculator': {
    ko: '크립토 스테이킹 APY/APR 복리 계산기',
    en: 'Crypto Staking APY/APR Compound Calculator',
    ja: '暗号資産ステーキング APY/APR 計算機',
    zh: '加密资产质押 APY/APR 复利计算器',
    vi: 'Máy tính Lãi kép Staking APY/APR Crypto',
  },
  'kimchi-premium-calculator': {
    ko: '비트코인 김치프리미엄 & 환율 차익 계산기',
    en: 'Kimchi Premium & Arbitrage Spread Calculator',
    ja: 'キムチプレミアム＆為替差益計算機',
    zh: '泡菜溢价与汇率套利计算器',
    vi: 'Máy tính Chênh lệch Giá Kimchi Premium',
  },
  'farming-calculator': {
    ko: '직업별 일일 파밍 수익 최적화 계산기',
    en: 'Career Daily Yield & Farming Optimization Calculator',
    ja: '職業別デイリーファーミング収益最適化計算機',
    zh: '各职业日常产出收益最优化计算器',
    vi: 'Máy tính Tối ưu hóa Lợi nhuận Nghề nghiệp',
  },
};

const baseDir = 'c:\\Users\\sds\\Desktop\\tset\\Woldeok-Moneyverse-Migration\\frontend\\src\\app\\tools';

for (const [folder, labels] of Object.entries(CALC_H1_MAP)) {
  const filePath = path.join(baseDir, folder, 'page.tsx');
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');

  // Check if it's a client component
  const hasUseClient = content.includes("'use client'");

  if (hasUseClient) {
    // 1. Remove misplaced imports at the very beginning
    content = content.replace(/^import\s*\{\s*getServerLocale\s*\}\s*from\s*'@\/lib\/locale-server';\s*\n?/m, '');
    content = content.replace(/^import\s*\{\s*localeLabel\s*\}\s*from\s*'@\/lib\/locale';\s*\n?/m, '');
    content = content.replace(/'use client';\s*\n?/m, '');

    // 2. Put 'use client' at the very first line
    content = "'use client';\n\n" + content.trimStart();

    // 3. Ensure useLocale and localeLabel are imported
    if (!content.includes('useLocale')) {
      content = content.replace(
        /'use client';/,
        "'use client';\n\nimport { useLocale } from '@/components/locale-provider';\nimport { localeLabel } from '@/lib/locale';"
      );
    }

    // 4. Client component must NOT be async
    content = content.replace(
      /export default async function ([A-Za-z0-9_]+)\s*\(\)/,
      'export default function $1()'
    );

    // 5. Replace `const locale = await getServerLocale();` with `const { locale } = useLocale();`
    content = content.replace(
      /const locale = await getServerLocale\(\);/,
      'const { locale } = useLocale();'
    );
  } else {
    // Server component: ensure getServerLocale & localeLabel are properly imported
    if (!content.includes('getServerLocale')) {
      content = "import { getServerLocale } from '@/lib/locale-server';\nimport { localeLabel } from '@/lib/locale';\n" + content;
    }
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Cleaned up calculator ${folder} (Client: ${hasUseClient})`);
}
