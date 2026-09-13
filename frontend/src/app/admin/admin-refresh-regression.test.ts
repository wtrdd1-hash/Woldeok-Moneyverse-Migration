import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const ADMIN_ROOT = resolve(process.cwd(), 'src/app/admin');
const guardedFiles = [
  'market/page.tsx',
  'market/ai-news/ai-news-console.tsx',
  'shop/admin-shop-view.tsx',
];

describe('admin edit-state refresh regression', () => {
  it.each(guardedFiles)('%s does not trigger automatic route refreshes', (relativePath) => {
    const source = readFileSync(resolve(ADMIN_ROOT, relativePath), 'utf8');

    expect(source).not.toContain('LiveRefresh');
    expect(source).not.toContain('router.refresh(');
    expect(source).not.toContain('setInterval(');
  });
});
