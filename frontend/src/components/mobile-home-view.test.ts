import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync('src/components/mobile-home-view.tsx', 'utf8');

describe('home dashboard responsive visibility', () => {
  it('keeps the quick-action dashboard visible on desktop', () => {
    expect(source).toContain('<div className=\"flex flex-col gap-6\">');
    expect(source).not.toContain('flex flex-col gap-6 lg:hidden');
  });
});
