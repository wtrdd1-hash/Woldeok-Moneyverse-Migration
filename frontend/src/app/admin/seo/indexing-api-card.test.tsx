import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { IndexingApiCard } from './indexing-api-card';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('SEO operator submission evidence', () => {
  it('does not claim immediate indexing, Google Indexing v3 support, or fixed inventory counts', () => {
    render(<IndexingApiCard />);
    const text = document.body.textContent ?? '';
    expect(text).not.toMatch(/즉시 색인|Google Indexing v3|580\+|500\+개 URL|색인 가속기/);
    expect(text).toMatch(/실제 검색 색인은 별개/);
  });

  it('records confirmed IndexNow submissions as notifications, not indexed URLs', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ success: true, submittedCount: 2, attemptedCount: 3,
        batchSize: 2, totalUrlsAvailable: 3, indexingConfirmed: false,
        submittedUrls: ['https://easy-scraping.com/tools'] , message: 'IndexNow 접수' }),
    }));
    vi.stubGlobal('fetch', fetchMock);
    render(<IndexingApiCard />);
    fireEvent.click(screen.getByRole('button', { name: /100개 배치 전송/ }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    await waitFor(() => expect(screen.getAllByText(/2개 URL 변경 통보 접수/).length).toBeGreaterThan(0));
    expect(document.body.textContent).not.toMatch(/2개 URL 색인 요청 완료/);
  });

  it('does not show success styling on a failed submission', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false,
      json: async () => ({ success: false, message: '권한 없음' }) })));
    render(<IndexingApiCard />);
    fireEvent.click(screen.getByRole('button', { name: /100개 배치 전송/ }));
    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy());
    expect(screen.getByRole('alert').textContent).toMatch(/권한 없음/);
  });
});
