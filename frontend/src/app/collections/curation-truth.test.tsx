import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { CurationRetentionFlow } from './curation-retention-flow';

afterEach(() => { vi.unstubAllGlobals(); window.localStorage.clear(); });

describe('collections truthful ownership', () => {
  it('does not display fabricated ownership when the API reports unverified legacy rows', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => new Response(JSON.stringify(
      String(input).endsWith('/curation/status')
        ? { status: null, verificationStatus: 'unavailable' }
        : { pieces: [], unverifiedRecords: '4', verificationStatus: 'unavailable' },
    ), { status: 200, headers: { 'content-type': 'application/json' } }));
    vi.stubGlobal('fetch', fetchMock);
    render(<CurationRetentionFlow userName="Test member" />);
    await waitFor(() => expect(screen.getByText(/검증된 소장품이 없습니다/)).toBeTruthy());
    expect(screen.queryByText('최초의 수도 개척 훈장')).toBeNull();
    expect(screen.queryByText(/쇼케이스 공유 링크 복사/)).toBeNull();
    expect(screen.getByText(/미검증 기록 4건/)).toBeTruthy();
  });

  it('shows a distinct error and never resurrects another account localStorage cache', async () => {
    window.localStorage.setItem('moneyverse_curation_pieces', JSON.stringify([{ id: 'other', name: 'other account badge' }]));
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('offline'); }));
    render(<CurationRetentionFlow />);
    await waitFor(() => expect(screen.getByRole('alert').textContent).toMatch(/소장품 정보를 확인할 수 없습니다/));
    expect(screen.queryByText('other account badge')).toBeNull();
  });
});
