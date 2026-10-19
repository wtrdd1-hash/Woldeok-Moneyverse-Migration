import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (file: string) => readFileSync(join(__dirname, file), 'utf8');
const section = (text: string, start: string, end: string) =>
  text.slice(text.indexOf(start), text.indexOf(end, text.indexOf(start)));

const unverifiedBonus = /10(?:,000|k)\s*WLD|1만\s*WLD|1万\s*WLD|1,000만\s*WLD|千万头奖彩票/iu;

describe('SEO public promise evidence', () => {
  it('does not advertise unverified signup reward or lottery in KO EN JA ZH metadata and social previews', () => {
    const global = section(read('layout.tsx'), 'const META_BY_LOCALE', 'export async function generateMetadata');
    const home = section(read('page.tsx'), 'const HOME_META_BY_LOCALE', 'export async function generateMetadata');
    expect(global).not.toMatch(unverifiedBonus);
    expect(home).not.toMatch(unverifiedBonus);
    expect(home).toMatch(/virtual|fictional|가상경제/i);
  });

  it('does not use FAQ structured data to assert a guaranteed WLD credit without a ledger receipt', () => {
    const faq = section(read('layout.tsx'), "'@type': 'FAQPage'", 'export default async function RootLayout');
    expect(faq).not.toMatch(unverifiedBonus);
    expect(faq).toMatch(/가상경제|가상 주식/);
  });
});
