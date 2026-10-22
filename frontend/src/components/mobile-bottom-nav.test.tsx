import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MobileBottomNav } from './mobile-bottom-nav';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

vi.mock('@/components/translated-text', () => ({
  TranslatedText: ({ korean }: { korean: string }) => <span>{korean}</span>,
}));

describe('MobileBottomNav (Fintech Responsive Layout Shield)', () => {
  it('renders all 5 core navigation surfaces with 44px minimum touch target height', () => {
    const { container } = render(<MobileBottomNav />);
    const nav = screen.getByRole('navigation', { name: /Mobile Navigation/i });
    expect(nav).toBeDefined();

    const links = container.querySelectorAll('a');
    expect(links.length).toBe(5);

    const hrefs = Array.from(links).map((l) => l.getAttribute('href'));
    expect(hrefs).toEqual(['/', '/stocks', '/wallet', '/work', '/admin']);

    links.forEach((link) => {
      expect(link.className).toContain('min-h-[44px]');
      expect(link.className).toContain('min-w-0');
    });
  });

  it('marks Home as active when pathname is root', () => {
    const { container } = render(<MobileBottomNav />);
    const activeLink = container.querySelector('a[href="/"]');
    expect(activeLink?.className).toContain('text-primary');
    expect(activeLink?.className).toContain('font-bold');
  });
});
