import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PublicSitemapSubmitBox } from './public-sitemap-submit-box';

describe('public sitemap display stays read-only', () => {
  it('provides public sitemap link and never invokes admin write APIs', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    render(<PublicSitemapSubmitBox />);
    expect(screen.getByRole('heading', { name: '공개 사이트맵 안내' })).toBeTruthy();
    const select = screen.getByLabelText('사이트맵 선택');
    fireEvent.change(select, { target: { value: 'sitemap-static.xml' } });
    const link = screen.getByRole('link', { name: /공개 사이트맵 보기/ });
    expect(link.getAttribute('href')).toBe('/sitemap-static.xml');
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});
