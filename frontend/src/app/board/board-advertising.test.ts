import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const listSource = readFileSync('src/app/board/page.tsx', 'utf8');
const detailSource = readFileSync('src/app/board/[postId]/page.tsx', 'utf8');

describe('board advertising boundary', () => {
  it('renders one public ad on the board index after the post list', () => {
    expect(listSource.match(/<PublicAdvertisement \/>/g)).toHaveLength(1);
    expect(listSource.indexOf('<PublicAdvertisement />')).toBeGreaterThan(
      listSource.indexOf('aria-labelledby="posts-title"'),
    );
  });

  it('keeps individual user-generated post and comment pages ad-free', () => {
    expect(detailSource).not.toContain('PublicAdvertisement');
  });
});
