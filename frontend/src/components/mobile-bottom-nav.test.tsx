import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { Viewer } from '@/lib/viewer-state';
import { MobileBottomNav } from './mobile-bottom-nav';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

vi.mock('@/components/translated-text', () => ({
  TranslatedText: ({ korean }: { korean: string }) => <span>{korean}</span>,
}));

let currentViewer: Viewer | null = null;
vi.mock('@/lib/use-viewer', () => ({
  useViewer: () => currentViewer,
}));

const MEMBER: Viewer = { signedIn: true, consentCurrent: true, adminRoles: [] };
const ADMIN: Viewer = { signedIn: true, consentCurrent: true, adminRoles: ['superadmin'] };

function hrefs(container: HTMLElement): (string | null)[] {
  return Array.from(container.querySelectorAll('a')).map((l) => l.getAttribute('href'));
}

describe('MobileBottomNav', () => {
  beforeEach(() => {
    currentViewer = null;
  });

  it('renders 5 surfaces with a 44px minimum touch target', () => {
    const { container } = render(<MobileBottomNav />);
    expect(screen.getByRole('navigation', { name: /Mobile Navigation/i })).toBeDefined();
    const links = container.querySelectorAll('a');
    expect(links.length).toBe(5);
    links.forEach((link) => {
      expect(link.className).toContain('min-h-[44px]');
      expect(link.className).toContain('min-w-0');
    });
  });

  // The admin console link must only render for a server-authorized
  // administrator (CURRENT_UI_DESIGN.md rule 5). Showing it to every reader
  // advertised the console and sent members into a guaranteed refusal.
  it('does not show the admin console to a signed-out reader', () => {
    const { container } = render(<MobileBottomNav />);
    expect(hrefs(container)).toEqual(['/', '/stocks', '/wallet', '/work', '/login']);
  });

  it('does not show the admin console to a member without a role', () => {
    currentViewer = MEMBER;
    const { container } = render(<MobileBottomNav />);
    expect(hrefs(container)).toEqual(['/', '/stocks', '/wallet', '/work', '/account']);
  });

  it('shows the admin console to an administrator', () => {
    currentViewer = ADMIN;
    const { container } = render(<MobileBottomNav />);
    expect(hrefs(container)).toEqual(['/', '/stocks', '/wallet', '/work', '/admin']);
  });

  it('marks Home as active at the root and uses the theme token, not a hardcoded glow', () => {
    const { container } = render(<MobileBottomNav />);
    const activeLink = container.querySelector('a[href="/"]');
    expect(activeLink?.className).toContain('text-primary');
    expect(activeLink?.getAttribute('aria-current')).toBe('page');
    expect(container.innerHTML).not.toContain('rgba(16,185,129');
  });
});
