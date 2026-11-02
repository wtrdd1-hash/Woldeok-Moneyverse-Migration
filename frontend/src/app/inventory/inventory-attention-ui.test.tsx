import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { InventoryView, type HeldItem } from './inventory-view';
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
const item: HeldItem = {
  catalog_id: '11111111-1111-4111-8111-111111111111', code: 'frame', name: 'Test Frame', description: '', category: 'frame', quantity: 1,
  acquired_at: '2026-10-01T00:00:00.000Z', expires_at: null, effect_kind: 'durable', rarity: 'common', animation_css: null,
  preview_data: {}, is_equipped: false, equipped_slot: null, serial_number: null,
};
describe('inventory attention member interface', () => {
  it('offers a labelled accessible toggle when the verified source is available', () => {
    const html = renderToStaticMarkup(<InventoryView holdings={[item]} attentionHoldings={[item]} />);
    expect(html).toContain('관리 필요 아이템만 보기');
    expect(html).toContain('aria-pressed="false"');
    expect(html).toContain('min-h-11');
    expect(html).toContain('Test Frame');
  });
  it('disables attention filtering when the source is unavailable without hiding existing holdings', () => {
    const html = renderToStaticMarkup(<InventoryView holdings={[item]} attentionHoldings={null} />);
    expect(html).toContain('disabled=""');
    expect(html).toContain('관리 필요 상태를 확인할 수 없습니다');
    expect(html).toContain('Test Frame');
  });
  it('keeps the optional feature hidden while its release flag is off', () => {
    const html = renderToStaticMarkup(<InventoryView holdings={[item]} />);
    expect(html).not.toContain('관리 필요 아이템만 보기');
  });
});
