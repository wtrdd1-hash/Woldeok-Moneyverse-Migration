// @vitest-environment jsdom
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('./actions', () => ({ createSupportThread: vi.fn(), replySupportThread: vi.fn() }));
import { NewSupportThreadForm, SupportReplyForm } from './member-support-forms';

describe('member support responsive accessible forms', () => {
  it('names every new-thread input and exposes a pending-safe submit button', () => {
    render(<NewSupportThreadForm />);
    expect(screen.getByRole('textbox', { name: '문의 제목' })).toBeDefined();
    expect(screen.getByRole('textbox', { name: '문의 내용' })).toBeDefined();
    expect(screen.getByRole('button', { name: '문의 시작' })).toBeDefined();
  });

  it('names the reply input and keeps a responsive narrow-screen layout', () => {
    const { container } = render(<SupportReplyForm threadId="4bb16d4d-6d18-4fb6-b581-1d5a716c1e3a" />);
    expect(screen.getByRole('textbox', { name: '답장 내용' })).toBeDefined();
    expect(screen.getByRole('button', { name: '전송' })).toBeDefined();
    expect(container.querySelector('.sm\\:flex-row')).not.toBeNull();
  });
});
