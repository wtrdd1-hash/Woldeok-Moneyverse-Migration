const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const frontendApp = path.join(repoRoot, 'frontend', 'src', 'app');
const frontendComponents = path.join(repoRoot, 'frontend', 'src', 'components');

// 1. guide/stock-trading/page.tsx
{
  const p = path.join(frontendApp, 'guide', 'stock-trading', 'page.tsx');
  let content = fs.readFileSync(p, 'utf-8');
  content = content.replace(
    /title=\{isEn \? 'Virtual Stock Trading & Orderbook Mastery' : '가상 주식 실전 매매 & 호가창 분석 가이드'\}/,
    "title={localeLabel(locale, '가상 주식 실전 매매 & 호가창 분석 가이드', 'Virtual Stock Trading & Orderbook Mastery', '仮想株式実践売買＆板情報分析マスターガイド', '虚拟股票实战交易与买卖盘精通指南', 'Hướng dẫn giao dịch chứng khoán ảo & làm chủ sổ lệnh')}"
  );
  fs.writeFileSync(p, content, 'utf-8');
  console.log('Fixed stock-trading/page.tsx');
}

// 2. guide/virtual-banking/page.tsx
{
  const p = path.join(frontendApp, 'guide', 'virtual-banking', 'page.tsx');
  let content = fs.readFileSync(p, 'utf-8');
  content = content.replace(
    /title=\{isEn \? 'Virtual Banking & Compound Interest Strategy' : '가상 금융 & 복리 예금·국채 전략 가이드'\}/,
    "title={localeLabel(locale, '가상 금융 & 복리 예금·국채 전략 가이드', 'Virtual Banking & Compound Interest Strategy', '仮想金融＆複利預金・国債戦略ガイド', '虚拟金融与复利存款·国债策略指南', 'Hướng dẫn tài chính ảo & chiến lược gửi tiết kiệm lãi kép')}"
  );
  fs.writeFileSync(p, content, 'utf-8');
  console.log('Fixed virtual-banking/page.tsx');
}

// 3. components/kimchi-premium-calculator-view.tsx
{
  const p = path.join(frontendComponents, 'kimchi-premium-calculator-view.tsx');
  let content = fs.readFileSync(p, 'utf-8');
  if (!content.includes('useLocale')) {
    content = content.replace("import React,", "import { useLocale } from '@/components/locale-provider';\nimport { localeLabel } from '@/lib/locale';\nimport React,");
    content = content.replace(
      "export function KimchiPremiumCalculatorView({ initialPreset }: KimchiPremiumCalculatorViewProps) {",
      "export function KimchiPremiumCalculatorView({ initialPreset }: KimchiPremiumCalculatorViewProps) {\n  const { locale } = useLocale();"
    );
  }
  content = content.replace(
    /\{initialPreset \? `\$\{initialPreset\.name\} \(\$\{initialPreset\.symbol\}\) 김치프리미엄 계산기` : '코인 김치프리미엄 & 환율 차익 계산기'\}/,
    `{localeLabel(locale, initialPreset ? (initialPreset.name + ' (' + initialPreset.symbol + ') 김치프리미엄 계산기') : '코인 김치프리미엄 & 환율 차익 계산기', initialPreset ? (initialPreset.symbol + ' Kimchi Premium Calculator') : 'Crypto Kimchi Premium & Arbitrage Calculator', initialPreset ? (initialPreset.symbol + ' キムチプレミアム計算機') : '暗号資産キムチプレミアム＆為替差益計算機', initialPreset ? (initialPreset.symbol + ' 泡菜溢价计算器') : '加密货币泡菜溢价与汇率套利计算器', initialPreset ? (initialPreset.symbol + ' Máy tính Kimchi Premium') : 'Máy tính chênh lệch giá Kimchi Premium')}`
  );
  fs.writeFileSync(p, content, 'utf-8');
  console.log('Fixed kimchi-premium-calculator-view.tsx');
}

// 4. tools/quant-studio/page.tsx
{
  const p = path.join(frontendApp, 'tools', 'quant-studio', 'page.tsx');
  let content = fs.readFileSync(p, 'utf-8');
  if (!content.includes('useLocale')) {
    content = content.replace("import React,", "import { useLocale } from '@/components/locale-provider';\nimport { localeLabel } from '@/lib/locale';\nimport React,");
    content = content.replace(
      "export default function QuantStudioPage() {",
      "export default function QuantStudioPage() {\n  const { locale } = useLocale();"
    );
  }
  content = content.replace(
    /<span>노코드 퀀트 봇 스튜디오<\/span>/,
    `<span>{localeLabel(locale, '노코드 퀀트 봇 스튜디오', 'No-Code Quant Bot Studio', 'ノーコード クオンツボット スタジオ', '无代码量化机器人工作室', 'Studio bot định lượng không cần mã')}</span>`
  );
  fs.writeFileSync(p, content, 'utf-8');
  console.log('Fixed quant-studio/page.tsx');
}

console.log('Final 4 files fixed.');
