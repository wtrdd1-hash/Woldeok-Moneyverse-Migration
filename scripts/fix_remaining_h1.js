const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const frontendApp = path.join(repoRoot, 'frontend', 'src', 'app');
const frontendComponents = path.join(repoRoot, 'frontend', 'src', 'components');

console.log('Starting remaining H1 and pages localization...');

// 1. guide/career-mastery/page.tsx
{
  const p = path.join(frontendApp, 'guide', 'career-mastery', 'page.tsx');
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf-8');
    if (!content.includes('localeLabel')) {
      content = content.replace("import { getServerLocale } from '@/lib/locale-server';", "import { getServerLocale } from '@/lib/locale-server';\nimport { localeLabel } from '@/lib/locale';");
    }
    content = content.replace(
      /title=\{isEn \? '8 Professional Careers & Daily Farming Master Guide' : '8대 전문 직업 2\.0 & 실전 급여 파밍 완벽 가이드'\}/,
      "title={localeLabel(locale, '8대 전문 직업 2.0 & 실전 급여 파밍 완벽 가이드', '8 Professional Careers & Daily Farming Master Guide', '8大専門職業2.0＆実践給与ファーミング完全ガイド', '8大专业职业2.0与实战工资挖矿完全指南', 'Hướng dẫn chuyên sâu 8 nghề nghiệp 2.0 & cày lương thực tế')}"
    );
    fs.writeFileSync(p, content, 'utf-8');
    console.log('Fixed guide/career-mastery/page.tsx');
  }
}

// 2. guide/dopamine-system/page.tsx
{
  const p = path.join(frontendApp, 'guide', 'dopamine-system', 'page.tsx');
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf-8');
    if (!content.includes('getServerLocale')) {
      content = "import { getServerLocale } from '@/lib/locale-server';\nimport { localeLabel } from '@/lib/locale';\n" + content;
      content = content.replace('export default function DopamineSystemGuidePage()', 'export default async function DopamineSystemGuidePage()');
      content = content.replace('const jsonLd = {', 'const locale = await getServerLocale();\n  const jsonLd = {');
      content = content.replace(
        /<h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">\s*도파민 보상 루프 & 공정 확률 가이드\s*<\/h1>/,
        `<h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              {localeLabel(locale, '도파민 보상 루프 & 공정 확률 가이드', 'Dopamine Reward Loop & Fair Probability Guide', 'ドーパミン報酬ループ＆公正確率ガイド', '多巴胺奖励循环与公平概率指南', 'Hướng dẫn vòng lặp phần thưởng dopamine & xác suất công bằng')}
            </h1>`
      );
      fs.writeFileSync(p, content, 'utf-8');
      console.log('Fixed guide/dopamine-system/page.tsx');
    }
  }
}

// 3. guide/stock-trading/page.tsx
{
  const p = path.join(frontendApp, 'guide', 'stock-trading', 'page.tsx');
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf-8');
    if (!content.includes('localeLabel')) {
      content = content.replace("import { getServerLocale } from '@/lib/locale-server';", "import { getServerLocale } from '@/lib/locale-server';\nimport { localeLabel } from '@/lib/locale';");
    }
    content = content.replace(
      /title=\{isEn \? 'Virtual Stock Trading & Order Book Guide' : '가상 주식 실전 매매 & 호가창 분석 가이드'\}/,
      "title={localeLabel(locale, '가상 주식 실전 매매 & 호가창 분석 가이드', 'Virtual Stock Trading & Order Book Guide', '仮想株式実践売買＆板情報分析ガイド', '虚拟股票实战交易与买卖盘分析指南', 'Hướng dẫn giao dịch chứng khoán ảo & phân tích sổ lệnh')}"
    );
    fs.writeFileSync(p, content, 'utf-8');
    console.log('Fixed guide/stock-trading/page.tsx');
  }
}

// 4. guide/virtual-banking/page.tsx
{
  const p = path.join(frontendApp, 'guide', 'virtual-banking', 'page.tsx');
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf-8');
    if (!content.includes('localeLabel')) {
      content = content.replace("import { getServerLocale } from '@/lib/locale-server';", "import { getServerLocale } from '@/lib/locale-server';\nimport { localeLabel } from '@/lib/locale';");
    }
    content = content.replace(
      /title=\{isEn \? 'Virtual Banking & Compound Savings Guide' : '가상 금융 & 복리 예금·국채 전략 가이드'\}/,
      "title={localeLabel(locale, '가상 금융 & 복리 예금·국채 전략 가이드', 'Virtual Banking & Compound Savings Guide', '仮想金融＆複利預金・国債戦略ガイド', '虚拟金融与复利存款·国债策略指南', 'Hướng dẫn tài chính ảo & tiết kiệm lãi kép')}"
    );
    fs.writeFileSync(p, content, 'utf-8');
    console.log('Fixed guide/virtual-banking/page.tsx');
  }
}

// 5. safety/takedown/page.tsx
{
  const p = path.join(frontendApp, 'safety', 'takedown', 'page.tsx');
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf-8');
    if (!content.includes('useLocale')) {
      content = content.replace("import { IDLE } from '@/lib/action-state';", "import { IDLE } from '@/lib/action-state';\nimport { useLocale } from '@/components/locale-provider';\nimport { localeLabel } from '@/lib/locale';");
      content = content.replace(
        "export default function EmergencyTakedownPage() {",
        "export default function EmergencyTakedownPage() {\n  const { locale } = useLocale();"
      );
      content = content.replace(
        'title="비회원 긴급 콘텐츠 삭제 요청"',
        "title={localeLabel(locale, '비회원 긴급 콘텐츠 삭제 요청', 'Emergency Content Takedown Request', '非会員緊急コンテンツ削除リクエスト', '非会员紧急内容删除申请', 'Yêu cầu gỡ bỏ nội dung khẩn cấp không cần tài khoản')}"
      );
      fs.writeFileSync(p, content, 'utf-8');
      console.log('Fixed safety/takedown/page.tsx');
    }
  }
}

// 6. tools/gift-tax-calculator/page.tsx
{
  const p = path.join(frontendApp, 'tools', 'gift-tax-calculator', 'page.tsx');
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf-8');
    content = content.replace(
      'title="2026 증여세 계산기 & 면제 한도 시뮬레이터"',
      "title={localeLabel(locale, '2026 증여세 계산기 & 면제 한도 시뮬레이터', '2026 Gift Tax Calculator & Exemption Simulator', '2026 贈与税計算機＆非課税枠シミュレーター', '2026 赠与税计算器与免税额度模拟器', 'Máy tính thuế tặng cho & mô phỏng miễn trừ 2026')}"
    );
    fs.writeFileSync(p, content, 'utf-8');
    console.log('Fixed tools/gift-tax-calculator/page.tsx');
  }
}

// 7. components/real-estate-calculator-view.tsx
{
  const p = path.join(frontendComponents, 'real-estate-calculator-view.tsx');
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf-8');
    if (!content.includes('useLocale')) {
      content = content.replace("import React,", "import { useLocale } from '@/components/locale-provider';\nimport { localeLabel } from '@/lib/locale';\nimport React,");
      content = content.replace(
        "export function RealEstateCalculatorView({ initialPreset }: RealEstateCalculatorViewProps) {",
        "export function RealEstateCalculatorView({ initialPreset }: RealEstateCalculatorViewProps) {\n  const { locale } = useLocale();"
      );
      content = content.replace(
        "{initialPreset ? initialPreset.name : '가상 부동산 월세/임대 수익률 계산기'}",
        "{localeLabel(locale, initialPreset ? initialPreset.name : '가상 부동산 월세/임대 수익률 계산기', initialPreset ? ('Virtual Real Estate: ' + initialPreset.slug) : 'Virtual Real Estate Cap Rate Calculator', initialPreset ? ('仮想不動産: ' + initialPreset.slug) : '仮想不動産賃貸利回り計算機', initialPreset ? ('虚拟房地产: ' + initialPreset.slug) : '虚拟房地产租金回报率计算器', initialPreset ? ('BĐS Ảo: ' + initialPreset.slug) : 'Máy tính lợi nhuận BĐS ảo')}"
      );
      fs.writeFileSync(p, content, 'utf-8');
      console.log('Fixed components/real-estate-calculator-view.tsx');
    }
  }
}

// 8. components/capital-gains-tax-calculator-view.tsx
{
  const p = path.join(frontendComponents, 'capital-gains-tax-calculator-view.tsx');
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf-8');
    if (!content.includes('useLocale')) {
      content = content.replace("import React,", "import { useLocale } from '@/components/locale-provider';\nimport { localeLabel } from '@/lib/locale';\nimport React,");
      content = content.replace(
        "export function CapitalGainsTaxCalculatorView({ initialPreset }: CapitalGainsTaxCalculatorViewProps) {",
        "export function CapitalGainsTaxCalculatorView({ initialPreset }: CapitalGainsTaxCalculatorViewProps) {\n  const { locale } = useLocale();"
      );
      content = content.replace(
        "{initialPreset ? initialPreset.name : '해외주식 양도소득세 & 250만원 절세 시뮬레이터'}",
        "{localeLabel(locale, initialPreset ? initialPreset.name : '해외주식 양도소득세 & 250만원 절세 시뮬레이터', initialPreset ? ('Capital Gains Tax: ' + initialPreset.ticker) : 'Capital Gains Tax Calculator', initialPreset ? ('譲渡所得税: ' + initialPreset.ticker) : '海外株式譲渡所得税計算機', initialPreset ? ('资本利得税: ' + initialPreset.ticker) : '海外股票资本利得税计算器', initialPreset ? ('Thuế vốn: ' + initialPreset.ticker) : 'Máy tính thuế lãi vốn chứng khoán')}"
      );
      fs.writeFileSync(p, content, 'utf-8');
      console.log('Fixed components/capital-gains-tax-calculator-view.tsx');
    }
  }
}

// 9. components/kimchi-premium-calculator-view.tsx
{
  const p = path.join(frontendComponents, 'kimchi-premium-calculator-view.tsx');
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf-8');
    if (!content.includes('useLocale')) {
      content = content.replace("import React,", "import { useLocale } from '@/components/locale-provider';\nimport { localeLabel } from '@/lib/locale';\nimport React,");
      content = content.replace(
        "export function KimchiPremiumCalculatorView({ initialPreset }: KimchiPremiumCalculatorViewProps) {",
        "export function KimchiPremiumCalculatorView({ initialPreset }: KimchiPremiumCalculatorViewProps) {\n  const { locale } = useLocale();"
      );
      content = content.replace(
        "{initialPreset ? initialPreset.name : '비트코인·코인 김치프리미엄 & 차익거래 계산기'}",
        "{localeLabel(locale, initialPreset ? initialPreset.name : '비트코인·코인 김치프리미엄 & 차익거래 계산기', initialPreset ? ('Kimchi Premium: ' + initialPreset.symbol) : 'Kimchi Premium & Arbitrage Calculator', initialPreset ? ('キムチプレミアム: ' + initialPreset.symbol) : 'キムチプレミアム計算機', initialPreset ? ('泡菜溢价: ' + initialPreset.symbol) : '泡菜溢价计算器', initialPreset ? ('Kimchi Premium: ' + initialPreset.symbol) : 'Máy tính Kimchi Premium')}"
      );
      fs.writeFileSync(p, content, 'utf-8');
      console.log('Fixed components/kimchi-premium-calculator-view.tsx');
    }
  }
}

// 10. tools/fire-calculator/page.tsx
{
  const p = path.join(frontendApp, 'tools', 'fire-calculator', 'page.tsx');
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf-8');
    if (!content.includes('useLocale')) {
      content = content.replace("import React,", "import { useLocale } from '@/components/locale-provider';\nimport { localeLabel } from '@/lib/locale';\nimport React,");
      content = content.replace(
        "export default function FireCalculatorPage() {",
        "export default function FireCalculatorPage() {\n  const { locale } = useLocale();"
      );
      content = content.replace(
        '<h1 className="text-2xl sm:text-3xl font-bold tracking-tight">FIRE 조기은퇴 시뮬레이터</h1>',
        `<h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {localeLabel(locale, 'FIRE 조기은퇴 시뮬레이터', 'FIRE Early Retirement Simulator', 'FIRE 早期リタイア シミュレーター', 'FIRE 提前退休模拟器', 'Trình mô phỏng nghỉ hưu sớm FIRE')}
          </h1>`
      );
      fs.writeFileSync(p, content, 'utf-8');
      console.log('Fixed tools/fire-calculator/page.tsx');
    }
  }
}

// 11. tools/tax-calculator/page.tsx
{
  const p = path.join(frontendApp, 'tools', 'tax-calculator', 'page.tsx');
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf-8');
    if (!content.includes('useLocale')) {
      content = content.replace("import React,", "import { useLocale } from '@/components/locale-provider';\nimport { localeLabel } from '@/lib/locale';\nimport React,");
      content = content.replace(
        "export default function TaxCalculatorPage() {",
        "export default function TaxCalculatorPage() {\n  const { locale } = useLocale();"
      );
      content = content.replace(
        /<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">\s*가상자산·금융투자 세금 계산기\s*<\/h1>/,
        `<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {localeLabel(locale, '가상자산·금융투자 세금 계산기', 'Crypto & Investment Tax Calculator', '暗号資産・金融投資税金計算機', '加密资产与金融投资税收计算器', 'Máy tính thuế tài sản mã hóa & đầu tư')}
            </h1>`
      );
      fs.writeFileSync(p, content, 'utf-8');
      console.log('Fixed tools/tax-calculator/page.tsx');
    }
  }
}

// 12. tools/goal-wealth-calculator/page.tsx
{
  const p = path.join(frontendApp, 'tools', 'goal-wealth-calculator', 'page.tsx');
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf-8');
    if (!content.includes('useLocale')) {
      content = content.replace("import React,", "import { useLocale } from '@/components/locale-provider';\nimport { localeLabel } from '@/lib/locale';\nimport React,");
      content = content.replace(
        "export default function GoalWealthCalculatorPage() {",
        "export default function GoalWealthCalculatorPage() {\n  const { locale } = useLocale();"
      );
      content = content.replace(
        /<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">\s*목표 자산·은퇴·FIRE 달성 계산기\s*<\/h1>/,
        `<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {localeLabel(locale, '목표 자산·은퇴·FIRE 달성 계산기', 'Target Wealth & Retirement Calculator', '目標資産・リタイア・FIRE達成計算機', '目标资产·退休·FIRE达成计算器', 'Máy tính mục tiêu tài sản & FIRE')}
            </h1>`
      );
      fs.writeFileSync(p, content, 'utf-8');
      console.log('Fixed tools/goal-wealth-calculator/page.tsx');
    }
  }
}

// 13. tools/quant-studio/page.tsx
{
  const p = path.join(frontendApp, 'tools', 'quant-studio', 'page.tsx');
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf-8');
    if (!content.includes('useLocale')) {
      content = content.replace("import React,", "import { useLocale } from '@/components/locale-provider';\nimport { localeLabel } from '@/lib/locale';\nimport React,");
      content = content.replace(
        "export default function QuantStudioPage() {",
        "export default function QuantStudioPage() {\n  const { locale } = useLocale();"
      );
      content = content.replace(
        /<h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">\s*<Bot className="w-8 h-8 text-primary" \/>\s*노코드 퀀트 봇 스튜디오\s*<\/h1>/,
        `<h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
              <Bot className="w-8 h-8 text-primary" />
              {localeLabel(locale, '노코드 퀀트 봇 스튜디오', 'No-Code Quant Bot Studio', 'ノーコード クオンツボット スタジオ', '无代码量化机器人工作室', 'Studio bot định lượng không cần mã')}
            </h1>`
      );
      fs.writeFileSync(p, content, 'utf-8');
      console.log('Fixed tools/quant-studio/page.tsx');
    }
  }
}

// 14. stocks/[symbol]/page.tsx & stocks/derivatives/page.tsx
{
  const p = path.join(frontendApp, 'stocks', '[symbol]', 'page.tsx');
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf-8');
    if (!content.includes('localeLabel')) {
      content = content.replace("import { getServerLocale } from '@/lib/locale-server';", "import { getServerLocale } from '@/lib/locale-server';\nimport { localeLabel } from '@/lib/locale';");
    }
    // stock name localization helper
    if (!content.includes('getStockDisplayName')) {
      const helper = `
function getStockDisplayName(symbol: string, defaultName: string, locale: string): string {
  if (locale === 'ko') return defaultName;
  const map: Record<string, { en: string; ja: string; zh: string; vi: string }> = {
    'WDG': { en: 'Woldeok Games', ja: 'ウォルドクゲームズ', zh: '沃尔德克游戏', vi: 'Woldeok Games' },
    'WLD': { en: 'Woldeok Core', ja: 'ウォルドクコア', zh: '沃尔德克核心', vi: 'Woldeok Core' }
  };
  const item = map[symbol.toUpperCase()];
  if (!item) return defaultName;
  return locale === 'ja' ? item.ja : (locale === 'zh' ? item.zh : (locale === 'vi' ? item.vi : item.en));
}
`;
      content = helper + '\n' + content;
      content = content.replace(
        '<h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">\n              {stock.name}\n            </h1>',
        '<h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">\n              {getStockDisplayName(stock.symbol, stock.name, locale)}\n            </h1>'
      );
      fs.writeFileSync(p, content, 'utf-8');
      console.log('Fixed stocks/[symbol]/page.tsx');
    }
  }
}

{
  const p = path.join(frontendApp, 'stocks', 'derivatives', 'page.tsx');
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf-8');
    if (!content.includes('getStockDisplayName')) {
      const helper = `
function getStockDisplayName(symbol: string, defaultName: string, locale: string): string {
  if (locale === 'ko') return defaultName;
  const map: Record<string, { en: string; ja: string; zh: string; vi: string }> = {
    'WDG': { en: 'Woldeok Games', ja: 'ウォルドクゲームズ', zh: '沃尔德克游戏', vi: 'Woldeok Games' },
    'WLD': { en: 'Woldeok Core', ja: 'ウォルドクコア', zh: '沃尔德克核心', vi: 'Woldeok Core' }
  };
  const item = map[symbol.toUpperCase()];
  if (!item) return defaultName;
  return locale === 'ja' ? item.ja : (locale === 'zh' ? item.zh : (locale === 'vi' ? item.vi : item.en));
}
`;
      content = helper + '\n' + content;
      content = content.replace(
        '{selectedSymbol.name}',
        '{getStockDisplayName(selectedSymbol.symbol, selectedSymbol.name, locale)}'
      );
      fs.writeFileSync(p, content, 'utf-8');
      console.log('Fixed stocks/derivatives/page.tsx');
    }
  }
}

console.log('All remaining H1 fix logic completed.');
