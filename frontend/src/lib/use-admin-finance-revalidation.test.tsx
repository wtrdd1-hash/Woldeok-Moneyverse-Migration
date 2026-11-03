// @vitest-environment jsdom
import React from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { act, render, waitFor } from '@testing-library/react';
import { useAdminFinanceRevalidation } from './use-admin-finance-revalidation';

function Probe({ refresh, onMount = true }: { refresh: () => Promise<void>; onMount?: boolean }) {
  useAdminFinanceRevalidation(refresh, { onMount });
  return <span>ready</span>;
}
afterEach(() => {
  vi.restoreAllMocks();
});

it('refreshes immediately and when long-lived finance tab returns to focus without bursts', async () => {
  let now = 50_000;
  vi.spyOn(Date, 'now').mockImplementation(() => now);
  const refresh = vi.fn(async () => {});
  render(<Probe refresh={refresh} />);
  await waitFor(() => expect(refresh).toHaveBeenCalledTimes(1));
  act(() => { window.dispatchEvent(new Event('focus')); });
  await Promise.resolve();
  expect(refresh).toHaveBeenCalledTimes(1);
  now += 20_000;
  act(() => { window.dispatchEvent(new Event('pageshow')); });
  await waitFor(() => expect(refresh).toHaveBeenCalledTimes(2));
});

it('supports server-rendered finance pages refreshing only on tab resume', async () => {
  const now = 100_000;
  vi.spyOn(Date, 'now').mockImplementation(() => now);
  const refresh = vi.fn(async () => {});
  render(<Probe refresh={refresh} onMount={false} />);
  await Promise.resolve();
  expect(refresh).not.toHaveBeenCalled();
  act(() => { window.dispatchEvent(new Event('focus')); });
  await waitFor(() => expect(refresh).toHaveBeenCalledTimes(1));
});
