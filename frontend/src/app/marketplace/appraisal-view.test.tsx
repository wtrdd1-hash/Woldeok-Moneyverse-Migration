import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AppraisalView } from './appraisal-view';

const { loadAppraisals, requestAppraisal } = vi.hoisted(() => ({ loadAppraisals: vi.fn(), requestAppraisal: vi.fn() }));
vi.mock('./appraisal-actions', () => ({ loadAppraisals, requestAppraisal }));
afterEach(() => { cleanup(); vi.resetAllMocks(); });

describe('marketplace appraisal display', () => {
  it('never displays invented certificates before an authenticated read', () => {
    const html = renderToStaticMarkup(<AppraisalView holdings={[]} userBalanceWld="0" />);
    expect(html).not.toContain('CERT-2026-89A4');
    expect(html).not.toContain('CERT-2026-31F7');
    expect(html).not.toContain('CERTIFIED');
    expect(html).toContain('조회 중');
  });
  it('shows a true empty state after the owner API returns no records', async () => {
    loadAppraisals.mockResolvedValueOnce([]);
    render(<AppraisalView holdings={[]} userBalanceWld="0" />);
    await waitFor(() => expect(screen.getByText('발급된 감정 기록이 없습니다.')).toBeDefined());
    expect(screen.queryByText('CERT-2026-89A4')).toBeNull();
  });
  it('distinguishes an API failure from an empty list and offers an accessible retry', async () => {
    loadAppraisals.mockRejectedValueOnce(new Error('network'));
    render(<AppraisalView holdings={[]} userBalanceWld="0" />);
    await waitFor(() => expect(screen.getByRole('button', { name: '감정 기록 다시 조회' })).toBeDefined());
    expect(screen.queryByText('발급된 감정 기록이 없습니다.')).toBeNull();
    loadAppraisals.mockResolvedValueOnce([]);
    fireEvent.click(screen.getByRole('button', { name: '감정 기록 다시 조회' }));
    await waitFor(() => expect(screen.getByText('발급된 감정 기록이 없습니다.')).toBeDefined());
  });
});
