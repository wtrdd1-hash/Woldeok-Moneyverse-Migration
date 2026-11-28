import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy } from './proxy';

/**
 * Security review 2026-11-28 (browser QA on the synthetic sandbox): the proxy stamped
 * "public, max-age=31536000, immutable" on every path ending in .png/.webp/.svg, including
 * authorised media — a private chat attachment, a member's unpublished photo, a members-only board
 * image, a profile image whose visibility depends on the viewer. A shared cache keys on the URL
 * alone, so one viewer's authorised bytes could be served to anyone for a year and survive
 * deletion or unpublishing. Only build assets and public static files may be marked immutable.
 */
function cacheControlFor(path: string): string | null {
  const response = proxy(new NextRequest(new URL(path, 'http://localhost:43000')));
  return response instanceof Response ? response.headers.get('Cache-Control') : null;
}

describe('proxy cache policy for authorised media', () => {
  it.each([
    '/api/v1/content/chat/media/chat_0b5c8f5e-6f7a-4c1d-9e2b-3a4b5c6d7e8f.png',
    '/app-api/v1/content/chat/media/chat_0b5c8f5e-6f7a-4c1d-9e2b-3a4b5c6d7e8f.webp',
    '/api/v1/board/images/0b5c8f5e-6f7a-4c1d-9e2b-3a4b5c6d7e8f.png',
    '/media/0b5c8f5e-6f7a-4c1d-9e2b-3a4b5c6d7e8f.png',
    '/media/profile/0b5c8f5e-6f7a-4c1d-9e2b-3a4b5c6d7e8f.webp',
    '/media/board/0b5c8f5e-6f7a-4c1d-9e2b-3a4b5c6d7e8f.png',
  ])('does not mark %s publicly immutable', (path) => {
    expect(cacheControlFor(path) ?? '').not.toContain('immutable');
  });

  it.each(['/_next/static/chunks/main.js', '/brand/logo.svg', '/fonts/body.woff2'])(
    'still marks build and public static asset %s immutable',
    (path) => {
      expect(cacheControlFor(path)).toBe('public, max-age=31536000, immutable');
    },
  );
});
