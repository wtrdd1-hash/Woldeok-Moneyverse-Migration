import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

function source(path: string): string {
  return readFileSync(join(__dirname, path), 'utf8');
}

describe('mobile responsive overflow guards', () => {
  it('keeps the global drawer and five-tab bottom navigation inside narrow viewports', () => {
    const header = source('../components/site-header.tsx');
    const bottomNav = source('../components/mobile-bottom-nav.tsx');

    expect(header).toContain('w-[min(20rem,calc(100vw-1rem))] max-w-full');
    expect(header).not.toContain('className="w-80 gap-0"');
    expect(bottomNav).toContain('grid-cols-5');
    expect(bottomNav).toContain('min-w-0');
    expect(bottomNav).not.toContain('min-w-[60px]');
  });

  it('stacks dense bank content before it can force horizontal scrolling', () => {
    const forms = source('bank/bank-forms.tsx');
    const page = source('bank/page.tsx');

    expect(
      forms.match(/flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between/g)?.length,
    ).toBeGreaterThanOrEqual(4);
    expect(forms).toContain('min-[480px]:grid-cols-3');
    expect(page).toContain('grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-4');
  });

  it('lets inventory profile and quick-slot content shrink on narrow phones', () => {
    const inventory = source('inventory/inventory-view.tsx');

    expect(inventory).toContain('flex w-full min-w-0 items-center gap-4 sm:gap-5');
    expect(inventory).toContain('p-2 rounded-xl bg-surface/60 border border-border/40 min-w-0');
    expect(inventory).not.toContain('min-w-[70px]');
  });
});
