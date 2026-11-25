// Screenshots every generated G1 page to PNG. Needs `playwright` resolvable
// from wherever this file is run (it is not a repository dependency).
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const [, , outDir, pngDir, only] = process.argv;
const index = JSON.parse(readFileSync(join(outDir, 'index.json'), 'utf8'));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1680, height: 1000 } });
for (const { name } of index) {
  if (only && !only.split(',').includes(name)) continue;
  await page.goto(pathToFileURL(join(outDir, 'pages', `${name}.html`)).href, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: join(pngDir, `${name}.png`) });
}
await browser.close();
console.log('rendered');
