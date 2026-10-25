import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CraftingPanel } from './crafting-panel';

const mocked = vi.hoisted(() => ({ executeCraftingAction: vi.fn() }));
vi.mock('./crafting-actions', () => ({ executeCraftingAction: mocked.executeCraftingAction }));

afterEach(() => { cleanup(); vi.clearAllMocks(); });

const holdings = [
  { catalog_id: 'material-a', code: 'frame_basic', name: 'Basic frame', description: '', category: 'frame', quantity: 1, acquired_at: '2026-10-25T00:00:00Z', rarity: 'common', effect_kind: 'decoration', is_equipped: false, serial_number: null },
  { catalog_id: 'material-b', code: 'dye_moonlight', name: 'Moonlight dye', description: '', category: 'dye', quantity: 2, acquired_at: '2026-10-25T00:00:00Z', rarity: 'common', effect_kind: 'decoration', is_equipped: false, serial_number: null },
];

describe('crafting settlement feedback', () => {
  it('shows an accessible warning and blocks a blind retry after uncertain settlement', async () => {
    mocked.executeCraftingAction.mockResolvedValue({ status: 'error', settlementUnknown: true, message: '제작 결과 확인 불가' });
    render(<CraftingPanel holdings={holdings} userBalanceWld="1000" />);
    fireEvent.click(screen.getByRole('button', { name: /^제작하기$/ }));
    fireEvent.click(screen.getByRole('button', { name: /제작 승인 및 실행/ }));
    expect((await screen.findByRole('alert')).textContent).toContain('제작 결과 확인 불가');
    expect(screen.getByRole('button', { name: /제작 승인 및 실행/ }).hasAttribute('disabled')).toBe(true);
    expect(screen.getByRole('button', { name: /지갑·인벤토리 다시 확인하기/ })).toBeTruthy();
    await waitFor(() => expect(mocked.executeCraftingAction).toHaveBeenCalledTimes(1));
  });
});
