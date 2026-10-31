import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { InventoryView, type HeldItem } from './inventory-view';

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock('@/components/profile-cosmetics', () => ({
  AvatarWithCosmetics: () => <div>Avatar</div>,
  NameplateWithTitle: () => <div>Member</div>,
}));

const item: HeldItem = {
  catalog_id: '00000000-0000-4000-8000-000000000001', code: 'item', name: 'Item', description: '', category: 'frame', quantity: 1,
  acquired_at: '2026-10-01T00:00:00Z', expires_at: null, effect_kind: 'durable', rarity: 'common', animation_css: null,
  preview_data: {}, is_equipped: false, equipped_slot: null, serial_number: null,
  weekly_cost: '9007199254740993', arrears_due: '0', arrears_cap: '9007199254740995', unpaid_weeks: 0, suspended: false,
};

describe('owner inventory condition disclosure', () => {
  it('offers keyboard-native details without implying paid upkeep or eternal ownership', () => {
    const html = renderToStaticMarkup(<InventoryView holdings={[item]} />);
    expect(html).toContain('<details');
    expect(html).toContain('<summary');
    expect(html).toContain('상태 자세히');
    expect(html).toContain('9,007,199,254,740,993');
    expect(html).toContain('확인 불가');
    expect(html).toContain('정산 인증 아님');
    expect(html).not.toContain('완납');
  });
});
