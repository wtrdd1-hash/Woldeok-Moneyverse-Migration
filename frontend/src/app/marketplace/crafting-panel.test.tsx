import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CraftingPanel } from './crafting-panel';

describe('legacy crafting UI source hold', () => {
  it('renders an accessible mobile-safe hold instead of a synthetic craftable offer', () => {
    render(<CraftingPanel holdings={[]} userBalanceWld="1000000" />);
    expect(screen.getByRole('status').textContent).toMatch(/제작.*(중단|이용 불가|점검)/);
    expect(screen.getByRole('status').textContent).toMatch(/원장|정산/);
    expect(screen.queryByRole('button', { name: /제작하기|수수료 WLD 부족|필요 재료 부족/ })).toBeNull();
    expect(screen.queryByText(/제작 수수료 \(소각\)/)).toBeNull();
  });
});
