// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AppraisalView } from './appraisal-view';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('appraisal read-only source truth', () => {
  it('does not display invented certificates after an upstream failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    render(<AppraisalView />);
    expect((await screen.findByRole('alert')).textContent).toContain('확인할 수 없습니다');
    expect(screen.queryByText(/CERT-2026-89A4/)).toBeNull();
    expect(screen.queryByRole('button', { name: /발급하기/ })).toBeNull();
  });
  it('distinguishes a verified empty list from a failed request', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => [] }));
    render(<AppraisalView />);
    expect(await screen.findByText(/발급 기록이 없습니다/)).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
  });
  it('retries an unavailable source and then shows verified empty records', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });
    vi.stubGlobal('fetch', fetchMock);
    render(<AppraisalView />);
    expect(await screen.findByRole('alert')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '다시 조회' }));
    expect(await screen.findByText(/발급 기록이 없습니다/)).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it('rejects malformed success payload instead of rendering it', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => [{ certId: 'fake' }] }));
    render(<AppraisalView />);
    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('확인할 수 없습니다'));
  });
});
