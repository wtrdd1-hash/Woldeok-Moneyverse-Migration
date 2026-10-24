const fs = require('fs');
const path = require('path');

const frontendSrc = path.join(__dirname, '../frontend/src');

// 1. Load I18N_DICTIONARY
const dictFile = fs.readFileSync(path.join(frontendSrc, 'lib/i18n-dictionary.ts'), 'utf8');

// Count dictionary entries
const entryMatches = dictFile.match(/'[a-zA-Z0-9_.-]+':\s*\{/g);
console.log(`[1] Total Dictionary Keys Defined: ${entryMatches ? entryMatches.length : 0}`);

// 2. Scan all tsx files in app and components for Korean hardcoded text outside TranslatedText
const tsxFiles = [];
function findTsx(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', '.next'].includes(entry.name)) {
        findTsx(fullPath);
      }
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
      if (!entry.name.endsWith('.test.tsx') && !entry.name.endsWith('.test.ts')) {
        tsxFiles.push(fullPath);
      }
    }
  }
}
findTsx(frontendSrc);

console.log(`[2] Total TS/TSX Source Files Scanned: ${tsxFiles.length}`);

// Check which files import TranslatedText or i18n
let i18nConsumerCount = 0;
const missingI18nFiles = [];

for (const file of tsxFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const hasI18n = content.includes('TranslatedText') || content.includes('i18n-dictionary') || content.includes('useLocale') || content.includes('getServerLocale') || content.includes('localeLabel');
  if (hasI18n) {
    i18nConsumerCount++;
  } else {
    // Check if it has Korean text
    const hasKorean = /[\uac00-\ud7a3]/.test(content);
    if (hasKorean && !file.includes('/config/')) {
      const relPath = path.relative(frontendSrc, file);
      missingI18nFiles.push(relPath);
    }
  }
}

console.log(`[3] Files Consuming i18n: ${i18nConsumerCount}`);
console.log(`[4] Files with Korean text but WITHOUT i18n imports: ${missingI18nFiles.length}`);
console.log('Sample top 15 files needing translation wrap:');
missingI18nFiles.slice(0, 15).forEach((f) => console.log(`  - ${f}`));
