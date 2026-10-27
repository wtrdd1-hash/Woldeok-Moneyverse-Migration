import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MarketEventReauthenticationHelp } from './market-event-reauth-help';

describe('MarketEventReauthenticationHelp', () => {
  it('links directly to secure reauthentication only on an explicit recent-auth rejection', () => {
    render(<MarketEventReauthenticationHelp state={{
      status: 'error', errorCode: 'reauthentication_required', message: 'Recent verification required',
    }} />);
    const link = screen.getByRole('link', { name: /계정 보안에서 본인 확인/ });
    expect(link.getAttribute('href')).toBe('/account/security');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
    expect(screen.getByRole('note').textContent).toContain('OTP 인증은 폐지');
  });

  it('does not misroute expired login, missing role, or other failures to identity verification', () => {
    const { rerender } = render(<MarketEventReauthenticationHelp state={{ status: 'idle' }} />);
    expect(screen.queryByRole('link')).toBeNull();
    rerender(<MarketEventReauthenticationHelp state={{ status: 'error', message: '로그인이 필요합니다' }} />);
    expect(screen.queryByRole('link')).toBeNull();
    rerender(<MarketEventReauthenticationHelp state={{ status: 'error', message: '권한 없음' }} />);
    expect(screen.queryByRole('note')).toBeNull();
  });
});
