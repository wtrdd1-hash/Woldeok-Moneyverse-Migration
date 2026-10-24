const fs = require('fs');
const path = require('path');

const p = path.resolve(__dirname, '../frontend/src/app/stocks/derivatives/page.tsx');
let content = fs.readFileSync(p, 'utf-8');

// remove duplicate import at lines 18-19
content = content.replace("import React, { useState, useEffect } from 'react';\nimport Link from 'next/link';\nimport { useLocale } from '@/components/locale-provider';\nimport { localeLabel } from '@/lib/locale';\n\nfunction getStockDisplayName(symbol: string, defaultName: string, locale: string): string {\n  if (locale === 'ko') return defaultName;\n  const map: Record<string, { en: string; ja: string; zh: string; vi: string }> = {\n    'WDG': { en: 'Woldeok Games', ja: 'ウォルドクゲームズ', zh: '沃尔德克游戏', vi: 'Woldeok Games' },\n    'WLD': { en: 'Woldeok Core', ja: 'ウォルドクコア', zh: '沃尔德克核心', vi: 'Woldeok Core' }\n  };\n  const item = map[symbol.toUpperCase()];\n  if (!item) return defaultName;\n  return locale === 'ja' ? item.ja : (locale === 'zh' ? item.zh : (locale === 'vi' ? item.vi : item.en));\n}\nimport React, { useState, useEffect } from 'react';\nimport Link from 'next/link';", "import React, { useState, useEffect } from 'react';\nimport Link from 'next/link';\nimport { useLocale } from '@/components/locale-provider';\nimport { localeLabel } from '@/lib/locale';\n\nfunction getStockDisplayName(symbol: string, defaultName: string, locale: string): string {\n  if (locale === 'ko') return defaultName;\n  const map: Record<string, { en: string; ja: string; zh: string; vi: string }> = {\n    'WDG': { en: 'Woldeok Games', ja: 'ウォルドクゲームズ', zh: '沃尔德克游戏', vi: 'Woldeok Games' },\n    'WLD': { en: 'Woldeok Core', ja: 'ウォルドクコア', zh: '沃尔德克核心', vi: 'Woldeok Core' }\n  };\n  const item = map[symbol.toUpperCase()];\n  if (!item) return defaultName;\n  return locale === 'ja' ? item.ja : (locale === 'zh' ? item.zh : (locale === 'vi' ? item.vi : item.en));\n}");

if (!content.includes('const { locale } = useLocale();')) {
  content = content.replace('export default function DerivativesExchangePage() {', 'export default function DerivativesExchangePage() {\n  const { locale } = useLocale();');
}

fs.writeFileSync(p, content, 'utf-8');
console.log('Fixed derivatives page cleanly.');
