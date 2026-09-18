import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = (path: string) => readFileSync(join(__dirname, path), 'utf8');

describe('metadata title composition', () => {
  it('lets the root layout append the brand exactly once on child pages', () => {
    const childPages = [
      'login/page.tsx',
      'login/providers/page.tsx',
      'verify-email/page.tsx',
      'support/page.tsx',
      'dashboard/page.tsx',
      'stocks/alerts/page.tsx',
      'stocks/compare/page.tsx',
      'stocks/portfolio/page.tsx',
      'work/page.tsx',
      'marketplace/page.tsx',
    ];

    for (const page of childPages) {
      const content = source(page);
      const metadataBlock = content.slice(content.indexOf('export const metadata'), content.indexOf('};', content.indexOf('export const metadata')) + 2);
      expect(metadataBlock).not.toMatch(/title:\s*['`][^'`]*(월덕 머니버스|Woldeok Moneyverse)/);
    }
  });

  it('uses an absolute title for the branded home page and unbranded dynamic notice titles', () => {
    expect(source('page.tsx')).toContain("title: { absolute: '월덕 머니버스 — Discord 커뮤니티 가상경제와 게임 보상' }");
    expect(source('announcements/[announcementId]/page.tsx')).toContain('title: notice.title');
  });
});
