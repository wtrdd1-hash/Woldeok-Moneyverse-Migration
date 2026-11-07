import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('recent public board edited-only web filter', () => {
  it('renders an accessible GET control and keeps the latest-50 scope explicit', () => {
    const page = readFileSync('src/app/board/page.tsx', 'utf8');
    expect(page).toContain('name="editedOnly"');
    expect(page).toContain('수정된 글만 보기');
    expect(page).toContain("query.set('editedOnly', '1')");
    expect(page).toContain('최근 공개 게시글 50건');
    expect(page).toContain('editedOnly');
    expect(page).toContain('수정 시간');
    expect(page).toContain('post.updatedAt');
  });
  it('blocks filtered URLs from search indexing', () => {
    const page = readFileSync('src/app/board/page.tsx', 'utf8');
    expect(page).toContain('params.editedOnly !== undefined');
    expect(page).toContain('robots: { index: !hasSearch');
  });
});
