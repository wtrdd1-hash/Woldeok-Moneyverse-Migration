import { describe, expect, it, vi } from 'vitest';
import { ProfileImageController } from './profile-image.controller';

const KEY = '11111111-2222-4333-8444-555555555555.png';

function setup(allowed: boolean) {
  const imageVisible = vi.fn(async () => allowed);
  const read = vi.fn(async () => Buffer.from('image bytes'));
  const headers = new Map<string, string>();
  const end = vi.fn();
  const response = { setHeader: vi.fn((key: string, value: string) => { headers.set(key, value); }), end };
  const controller = new ProfileImageController(
    { imageVisible } as never,
    { read } as never,
    null,
    {} as never,
  );
  const request = { session: { user_id: '22222222-2222-4222-8222-222222222222' }, headers: {} };
  return { controller, request, response, headers, imageVisible, read, end };
}

describe('profile picture visibility revocation response', () => {
  it('does not cache image bytes that may be revoked immediately', async () => {
    const fixture = setup(true);
    await fixture.controller.image(fixture.request as never, KEY, fixture.response as never);
    expect(fixture.headers.get('cache-control')).toBe('private, no-store');
    expect(fixture.end).toHaveBeenCalledOnce();
  });

  it('does not cache a denied image lookup either', async () => {
    const fixture = setup(false);
    await expect(fixture.controller.image(fixture.request as never, KEY, fixture.response as never)).rejects.toMatchObject({ status: 404 });
    expect(fixture.headers.get('cache-control')).toBe('private, no-store');
    expect(fixture.read).not.toHaveBeenCalled();
  });
});
