import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SeasonEventReauthenticationHelp } from './season-event-reauth-help';

describe('SeasonEventReauthenticationHelp', () => {
  it('offers the real account-security recovery route after a coded recent-auth refusal', () => {
    render(<SeasonEventReauthenticationHelp state={{
      status: 'error', errorCode: 'reauthentication_required', message: 'recent reauthentication required',
    }} />);
    const link = screen.getByRole('link', { name: /계정 보안에서 본인 확인/ });
    expect(link.getAttribute('href')).toBe('/account/security');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
    expect(link.className).toContain('min-h-11');
    expect(link.className).toContain('focus-visible');
    expect(screen.getByRole('note').textContent).toContain('15분');
  });

  it('never suggests reauthentication for login, role, or generic failures', () => {
    const { rerender } = render(<SeasonEventReauthenticationHelp state={{ status: 'idle' }} />);
    expect(screen.queryByRole('note')).toBeNull();
    rerender(<SeasonEventReauthenticationHelp state={{ status: 'error', message: '로그인이 필요합니다' }} />);
    expect(screen.queryByRole('link')).toBeNull();
    rerender(<SeasonEventReauthenticationHelp state={{ status: 'error', message: '권한 없음' }} />);
    expect(screen.queryByRole('note')).toBeNull();
  });
});
