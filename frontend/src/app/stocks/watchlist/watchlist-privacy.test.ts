import { describe, expect, it } from 'vitest';
import { metadata } from './page';

describe('member stock watchlist privacy', () => {
  it('marks the owner-only watchlist page noindex and nofollow', () => {
    expect(metadata.robots).toMatchObject({ index: false, follow: false });
  });
});
