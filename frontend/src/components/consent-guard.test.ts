import { describe, it, expect } from 'vitest';
import { normalizePath } from '@/lib/path-utils';

const EXEMPT_PATHS = [
  '/login',
  '/terms',
  '/privacy',
  '/data-deletion',
  '/account-deletion',
  '/safety',
  '/safety/takedown',
  '/robots.txt',
  '/sitemap.xml',
  '/api/og',
  '/icon.svg',
  '/apple-icon.png',
  '/frontend-version',
  '/api/health',
];

function isPathExempt(rawPath: string): boolean {
  const cleanPath = normalizePath(rawPath);
  return EXEMPT_PATHS.some(
    (path) => cleanPath === path || cleanPath.startsWith(`${path}/`)
  );
}

describe('normalizePath and ConsentGuard Whitelist Security', () => {
  it('allows canonical exempt paths', () => {
    expect(isPathExempt('/login')).toBe(true);
    expect(isPathExempt('/terms')).toBe(true);
    expect(isPathExempt('/privacy')).toBe(true);
    expect(isPathExempt('/safety/takedown')).toBe(true);
    expect(isPathExempt('/robots.txt')).toBe(true);
  });

  it('handles case-insensitivity securely', () => {
    expect(isPathExempt('/TERMS')).toBe(true);
    expect(isPathExempt('/Privacy')).toBe(true);
    expect(isPathExempt('/LOGIN')).toBe(true);
  });

  it('collapses consecutive duplicate slashes', () => {
    expect(isPathExempt('//terms')).toBe(true);
    expect(isPathExempt('///privacy')).toBe(true);
    expect(isPathExempt('//safety//takedown')).toBe(true);
  });

  it('decodes percent-encoded bypass attempts', () => {
    expect(isPathExempt('/%74erms')).toBe(true); // %74 = 't'
    expect(isPathExempt('/%70rivacy')).toBe(true); // %70 = 'p'
  });

  it('strips trailing slashes correctly', () => {
    expect(isPathExempt('/terms/')).toBe(true);
    expect(isPathExempt('/privacy/')).toBe(true);
  });

  it('neutralizes directory traversal bypass attempts', () => {
    // Traversal from exempt to non-exempt path should be normalized to target and denied
    expect(isPathExempt('/terms/../dashboard')).toBe(false);
    expect(isPathExempt('/privacy/../wallet')).toBe(false);
    expect(isPathExempt('/login/../stocks')).toBe(false);

    // Traversal from non-exempt into exempt should be resolved
    expect(isPathExempt('/dashboard/../terms')).toBe(true);
  });

  it('strictly rejects non-exempt protected paths', () => {
    expect(isPathExempt('/')).toBe(false);
    expect(isPathExempt('/dashboard')).toBe(false);
    expect(isPathExempt('/wallet')).toBe(false);
    expect(isPathExempt('/stocks')).toBe(false);
    expect(isPathExempt('/casino')).toBe(false);
    expect(isPathExempt('/admin')).toBe(false);
    expect(isPathExempt('/admin/controls')).toBe(false);
  });
});
