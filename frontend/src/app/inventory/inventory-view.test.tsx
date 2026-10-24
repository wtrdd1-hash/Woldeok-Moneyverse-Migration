import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { InventoryView, type HeldItem } from './inventory-view';

vi.mock('@/components/profile-cosmetics', () => ({
  AvatarWithCosmetics: () => <span>avatar</span>,
  NameplateWithTitle: () => <span>nameplate</span>,
}));
vi.mock('./actions', () => ({ equipHeldItem: async () => ({ status: 'idle' }) }));

const ID = '11111111-1111-4111-8111-111111111111';
const item: HeldItem = {
  catalog_id: ID, code: 'test_frame', name: '검증 프레임', description: '테스트 장비',
  category: 'frame', quantity: 1, acquired_at: '2026-10-01T00:00:00Z',
  expires_at: null, effect_kind: 'decoration', rarity: 'common', animation_css: null,
  preview_data: {}, is_equipped: false, equipped_slot: null, serial_number: null,
};

describe('inventory accessible equipment controls', () => {
  it('uses an actual server-action form with verified item and slot, not a direct browser API fetch', () => {
    const html = renderToStaticMarkup(<InventoryView holdings={[item]} />);
    expect(html).toContain('name="catalogId"');
    expect(html).toContain(`value="${ID}"`);
    expect(html).toContain('name="slot" value="frame"');
    expect(html).toContain('name="equip" value="true"');
    expect(html).toContain('검증 프레임</span>');
    expect(html).toContain('min-h-11');
    expect(html).toContain('aria-pressed="true"');
    expect(html).not.toContain('/api/v1/shop/holdings/');
  });

  it('gives a verified empty inventory an accessible shop navigation target', () => {
    const html = renderToStaticMarkup(<InventoryView holdings={[]} />);
    expect(html).toContain('href="/shop/catalog"');
    expect(html).toContain('min-h-11');
  });

  it('uses the persisted badge slot for unequip instead of silently clearing badge_1', () => {
    const html = renderToStaticMarkup(<InventoryView holdings={[{ ...item, category: 'badge', is_equipped: true, equipped_slot: 'badge_2' }]} />);
    expect(html).toContain('name="slot" value="badge_2"');
    expect(html).toContain('name="equip" value="false"');
  });
});
