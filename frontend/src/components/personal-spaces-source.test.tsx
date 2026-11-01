import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { api } from '@/lib/api';
import { PersonalSpacesView } from './personal-spaces-view';

vi.mock('@/lib/api', () => ({ api: vi.fn() }));
const read = vi.mocked(api);
const owner = '11111111-2222-4333-8444-555555555555';
const row = { id: '33333333-4444-4555-8666-777777777777', user_id: owner, space_type: 'SPACE_STUDIO', name: 'Verified Studio', privacy: 'private', layout: {}, created_at: '2026-10-31T00:00:00.000Z', updated_at: '2026-10-31T01:00:00.000Z' };

beforeEach(() => read.mockReset());

describe('PersonalSpacesView source truth', () => {
  it('shows verified ownership from authenticated API without local storage or WLD actions', async () => {
    read.mockResolvedValue({ spaces: [row] });
    render(await PersonalSpacesView());
    expect(read).toHaveBeenCalledWith('/api/v1/spaces');
    expect(screen.getByText('Verified Studio')).toBeDefined();
    expect(screen.queryByText(/WLD.*입금|임대료.*정산/)).toBeNull();
    expect(screen.queryByRole('button', { name: /매입|수령|확장/ })).toBeNull();
  });
  it('shows verified zero ownership without inventing a starter space', async () => {
    read.mockResolvedValue({ spaces: [] });
    render(await PersonalSpacesView());
    expect(screen.getByText(/확인된 개인 공간이 없습니다/)).toBeDefined();
  });
  it('does not mistake missing upstream evidence for zero ownership', async () => {
    read.mockResolvedValue(null);
    render(await PersonalSpacesView());
    expect(screen.getByRole('status').textContent).toMatch(/확인할 수 없습니다/);
    expect(screen.queryByText(/확인된 개인 공간이 없습니다/)).toBeNull();
  });
  it('fails closed on malformed success and provides accessible retry', async () => {
    read.mockResolvedValue({ spaces: [{ ...row, id: 'local-space' }] });
    render(await PersonalSpacesView());
    expect(screen.getByRole('status').textContent).toMatch(/확인할 수 없습니다/);
    expect(screen.getByRole('link', { name: /다시 확인/ }).getAttribute('href')).toBe('/spaces');
  });
});
