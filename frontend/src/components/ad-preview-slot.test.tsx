import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const nav = vi.hoisted(() => ({ path: '/' }));
vi.mock('next/navigation', () => ({ usePathname: () => nav.path }));

const { AdPreviewSlot } = await import('./ad-preview-slot');

describe('AdPreviewSlot', () => {
  it('marks the reserved space as an advertisement on a public content route', () => {
    nav.path = '/blog';
    render(<AdPreviewSlot variant="in-article" />);
    expect(screen.getByTestId('ad-preview-slot')).toBeDefined();
    expect(screen.getByText(/광고 \(Sponsored\)|Advertisement \(Sponsored\)/)).toBeDefined();
  });

  it.each(['/wallet', '/bank', '/account/security', '/admin', '/login', '/chat'])('never appears on %s', (path) => {
    nav.path = path;
    const { container } = render(<AdPreviewSlot variant="display" />);
    expect(container.innerHTML).toBe('');
  });
});
