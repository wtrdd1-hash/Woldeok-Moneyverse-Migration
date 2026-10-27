// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { PolicyVersionCard } from './policy-version-card';

vi.mock('./actions', () => ({ publishConsentVersionAction: vi.fn() }));

afterEach(() => cleanup());

describe('legal consent policy publication UI', () => {
  it('never exposes the publication control to an operator without superadmin role', () => {
    render(<PolicyVersionCard currentTermsVersion="2026-10-27" currentPrivacyVersion="2026-10-27" isSuperadmin={false} />);
    expect(screen.queryByRole('button', { name: '새 버전 개정' })).toBeNull();
    expect(screen.getByText(/약관: 2026-10-27/)).toBeTruthy();
  });

  it('exposes a keyboard-accessible minimum-touch-size control to verified superadmins', () => {
    render(<PolicyVersionCard currentTermsVersion="2026-10-27" currentPrivacyVersion="2026-10-27" isSuperadmin />);
    const button = screen.getByRole('button', { name: '새 버전 개정' });
    expect(button).toBeTruthy();
    expect(button.className).toContain('min-h-11');
    fireEvent.click(button);
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByLabelText('이용약관 버전')).toBeTruthy();
    expect(screen.getByLabelText('개인정보처리방침 버전')).toBeTruthy();
  });
});
