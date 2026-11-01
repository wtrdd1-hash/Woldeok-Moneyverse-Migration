import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseBoardImageFilter } from './board-image-filter';

describe('public board image-only discovery', () => {
  it('defaults to all posts and accepts only an explicit image-only flag', () => {
    expect(parseBoardImageFilter(undefined)).toEqual({ imageOnly: false, invalid: false });
    expect(parseBoardImageFilter('1')).toEqual({ imageOnly: true, invalid: false });
  });
  it.each(['', '0', 'true', ['1', '1'], ['1'], 1, null])(
    'rejects malformed or ambiguous flag %j', (value) => {
      expect(parseBoardImageFilter(value).invalid).toBe(true);
    },
  );
  it('exposes a labelled keyboard-accessible GET control with the bounded scope', () => {
    const page = readFileSync('src/app/board/page.tsx', 'utf8');
    expect(page).toContain('name="withImage"');
    expect(page).toContain('사진 첨부 글만 보기');
    expect(page).toContain('최근 공개 게시글 50건');
    expect(page).toContain('imageFilter.invalid');
  });
});
