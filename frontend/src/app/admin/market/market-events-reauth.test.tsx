import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../actions', () => ({
  publishMarketEvent: vi.fn(),
  cancelMarketEvent: vi.fn(),
}));

import { CancelMarketEventButton, PublishMarketEventDialog } from './market-events';

afterEach(cleanup);

describe('market event publish and cancel recovery integration', () => {
  it('explains recent reauthentication before publishing and links to the existing secure flow', () => {
    render(<PublishMarketEventDialog stocks={[]} />);
    fireEvent.click(screen.getByRole('button', { name: '소식 내기' }));
    const link = screen.getByRole('link', { name: '계정 보안에서 본인 확인' });
    expect(link.getAttribute('href')).toBe('/account/security#reauthentication');
    expect(link.className).toContain('min-h-11');
    expect(screen.getByText(/시장 소식 변경에는 최근 본인 확인이 필요합니다/)).toBeDefined();
    expect(screen.queryByLabelText(/인증 앱 코드/)).toBeNull();
  });

  it('explains the same recent reauthentication requirement before ending an event', () => {
    render(<CancelMarketEventButton eventId="event-1" />);
    expect(screen.getByRole('button', { name: '지금 끝내기' })).toBeDefined();
    expect(screen.getByRole('link', { name: '계정 보안에서 본인 확인' }).getAttribute('href'))
      .toBe('/account/security#reauthentication');
  });
});
