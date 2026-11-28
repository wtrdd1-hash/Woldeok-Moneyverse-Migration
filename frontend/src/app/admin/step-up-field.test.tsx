import { render as rtlRender } from '@testing-library/react';
import type { ReactElement } from 'react';
import { LocaleProvider } from '@/components/locale-provider';
import { describe, expect, it } from 'vitest';
import { StepUpField } from './step-up-field';

// Korean product copy is asserted, so the locale is explicit (the app default may be English).
const render = (ui: ReactElement) => rtlRender(ui, { wrapper: ({ children }) => <LocaleProvider initialLocale="ko">{children}</LocaleProvider> });

// Owner decision v2026.11.27.1457.1: administrator step-up is enforced by the server (recent
// password re-verification of the current session, 15 minutes). The field explains that and links
// to where it is done; it no longer collects a code the server never read, and never offers the
// retired authenticator or a messenger channel.
describe('StepUpField', () => {
  it('keeps recovery guidance without a retired authenticator code field', () => {
    const { container } = render(<StepUpField id="feature" undo="restore the previous value" />);
    expect(container.querySelector('input[name="code"]')).toBeNull();
    expect(container.textContent).toContain('되돌리기');
    expect(container.textContent).not.toContain('2단계 인증');
  });

  it('collects no OTP and offers no messenger channel', () => {
    const { container } = render(<StepUpField id="feature" undo="restore" />);
    expect(container.querySelector('input[name="otpCode"]')).toBeNull();
    expect(container.textContent).not.toMatch(/OTP|텔레그램|디스코드/);
  });

  it('points to the server-enforced re-verification', () => {
    const { container } = render(<StepUpField id="feature" undo="restore" />);
    const link = container.querySelector('a[href="/account/security"]');
    expect(link).not.toBeNull();
    expect(link?.getAttribute('target')).toBe('_blank');
    expect(container.textContent).toContain('15분');
  });
});
