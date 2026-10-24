const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const frontendApp = path.join(repoRoot, 'frontend', 'src', 'app');
const frontendComponents = path.join(repoRoot, 'frontend', 'src', 'components');

// 1. stocks/derivatives/page.tsx
{
  const p = path.join(frontendApp, 'stocks', 'derivatives', 'page.tsx');
  let content = fs.readFileSync(p, 'utf-8');
  // ensure 'use client' is line 1
  content = content.replace(/\n?function getStockDisplayName[\s\S]*?\}\n/g, '');
  content = content.replace(/^['"]use client['"];?\s*/, '');
  
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
  content = "'use client';\n" + helper + "\nimport { useLocale } from '@/components/locale-provider';\nimport { localeLabel } from '@/lib/locale';\n" + content;
  content = content.replace('export default function DerivativesExchangePage() {', 'export default function DerivativesExchangePage() {\n  const { locale } = useLocale();');
  fs.writeFileSync(p, content, 'utf-8');
  console.log('Fixed derivatives/page.tsx');
}

// 2. tools/fire-calculator/page.tsx
{
  const p = path.join(frontendApp, 'tools', 'fire-calculator', 'page.tsx');
  let content = fs.readFileSync(p, 'utf-8');
  if (!content.includes("from '@/components/locale-provider'")) {
    content = content.replace("import { useState, useMemo } from 'react';", "import { useState, useMemo } from 'react';\nimport { useLocale } from '@/components/locale-provider';\nimport { localeLabel } from '@/lib/locale';");
  }
  fs.writeFileSync(p, content, 'utf-8');
  console.log('Fixed fire-calculator/page.tsx');
}

// 3. tools/goal-wealth-calculator/page.tsx
{
  const p = path.join(frontendApp, 'tools', 'goal-wealth-calculator', 'page.tsx');
  let content = fs.readFileSync(p, 'utf-8');
  if (!content.includes("from '@/components/locale-provider'")) {
    content = content.replace("import { useState, useMemo } from 'react';", "import { useState, useMemo } from 'react';\nimport { useLocale } from '@/components/locale-provider';\nimport { localeLabel } from '@/lib/locale';");
  }
  fs.writeFileSync(p, content, 'utf-8');
  console.log('Fixed goal-wealth-calculator/page.tsx');
}

// 4. tools/tax-calculator/page.tsx
{
  const p = path.join(frontendApp, 'tools', 'tax-calculator', 'page.tsx');
  let content = fs.readFileSync(p, 'utf-8');
  if (!content.includes("from '@/components/locale-provider'")) {
    content = content.replace("import { useState, useMemo } from 'react';", "import { useState, useMemo } from 'react';\nimport { useLocale } from '@/components/locale-provider';\nimport { localeLabel } from '@/lib/locale';");
  }
  fs.writeFileSync(p, content, 'utf-8');
  console.log('Fixed tax-calculator/page.tsx');
}

// 5. components/capital-gains-tax-calculator-view.tsx
{
  const p = path.join(frontendComponents, 'capital-gains-tax-calculator-view.tsx');
  let content = fs.readFileSync(p, 'utf-8');
  content = content.replace(/initialPreset\.ticker/g, 'initialPreset.slug');
  fs.writeFileSync(p, content, 'utf-8');
  console.log('Fixed capital-gains-tax-calculator-view.tsx');
}

console.log('Patches applied successfully.');
