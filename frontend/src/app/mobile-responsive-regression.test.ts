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

describe('ultra-narrow responsive guards', () => {
  it('prevents legal and deletion documents from expanding their parent grid', () => {
    const deletion = source('../components/deletion-request-info.tsx');
    const privacy = source('../components/policy/privacy-document.tsx');
    const terms = source('../components/policy/terms-document.tsx');
    const pageHeader = source('../components/page-header.tsx');

    for (const content of [deletion, privacy, terms, pageHeader]) {
      expect(content).toContain('min-w-0');
      expect(content).toContain('grid-cols-[minmax(0,1fr)]');
    }
    expect(deletion).toContain('[overflow-wrap:anywhere]');
    expect(privacy).toContain('[overflow-wrap:anywhere]');
    expect(terms).toContain('[overflow-wrap:anywhere]');
  });

  it('keeps the shop shrinkable and avoids mobile browser input zoom', () => {
    const shop = source('shop/page.tsx');

    expect(shop).toContain('grid min-w-0 grid-cols-[minmax(0,1fr)] gap-8 pb-16');
    expect(shop).toContain('flex min-w-0 w-full max-w-2xl gap-2');
    expect(shop).toContain('text-base outline-none focus:border-amber-500 md:text-sm');
  });
});
