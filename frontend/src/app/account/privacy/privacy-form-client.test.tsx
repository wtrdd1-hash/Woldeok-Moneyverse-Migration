import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrivacyRequestForm } from '../account-forms';

vi.mock('../actions', () => ({
  createPrivacyRequest: vi.fn(async () => ({ status: 'idle' })),
  deleteAccount: vi.fn(),
  startLink: vi.fn(),
  startReauthentication: vi.fn(),
  unlinkIdentity: vi.fn(),
}));

const FIRST = 'ebd4379a-cd9b-4d1f-b73c-6c94060ca529';
const NEXT = '40c01273-201b-4498-a4ae-879bc9c1a5a0';

describe('privacy request client form', () => {
  beforeEach(() => {
    vi.stubGlobal('crypto', { randomUUID: vi.fn(() => NEXT) });
  });

  it('renders the server-generated key without a hydration mismatch and rotates it when payload changes', () => {
    const { container } = render(<PrivacyRequestForm submissionKey={FIRST} />);
    const key = container.querySelector('input[name="idempotencyKey"]') as HTMLInputElement;
    expect(key.value).toBe(FIRST);
    const details = screen.getByRole('textbox', { name: /간단한 설명/ }) as HTMLTextAreaElement;
    expect(details.maxLength).toBe(1000);
    fireEvent.change(details, { target: { value: '필요한 항목만 정정해 주세요.' } });
    expect(key.value).toBe(NEXT);
    expect(screen.getByRole('button', { name: /개인정보 요청 기록하기/ }).getAttribute('type')).toBe('submit');
  });
});
