import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { AdminSupportDock } from './admin-support-dock';

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock('@/components/locale-provider', () => ({
  useLocale: () => ({ locale: 'ko' }),
}));

describe('AdminSupportDock — safe global help', () => {
  afterEach(() => { cleanup(); vi.restoreAllMocks(); });

  it('renders a circular, accessible 56px trigger and no member chat on mount', () => {
    render(<AdminSupportDock />);
    const trigger = screen.getByRole('button', { name: '관리자 문의/지원 열기' });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.className).toContain('size-14');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('opens readonly admin help with safe routes but never calls chat API', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('No API in help dock'));
    render(<AdminSupportDock />);
    fireEvent.click(screen.getByRole('button', { name: '관리자 문의/지원 열기' }));
    expect(screen.getByRole('dialog', { name: '관리자 도움 및 문의' })).toBeDefined();
    expect(screen.getByText(/메시지 전송은 현재 비활성/)).toBeDefined();
    expect(screen.getByRole('link', { name: /관리자 고객지원/ }).getAttribute('href')).toBe('/admin/support');
    expect(screen.getByRole('link', { name: /도움말/ }).getAttribute('href')).toBe('/help');
    expect(screen.getByRole('link', { name: /일반 고객센터/ }).getAttribute('href')).toBe('/support');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('Escape closes the panel and restores focus to the launcher', () => {
    render(<AdminSupportDock />);
    const trigger = screen.getByRole('button', { name: '관리자 문의/지원 열기' });
    fireEvent.click(trigger);
    const close = screen.getByRole('button', { name: '관리자 문의창 닫기' });
    expect(document.activeElement).toBe(close);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('closing by explicit button works without creating a support ticket', () => {
    render(<AdminSupportDock />);
    const trigger = screen.getByRole('button', { name: '관리자 문의/지원 열기' });
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole('button', { name: '관리자 문의창 닫기' }));
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
