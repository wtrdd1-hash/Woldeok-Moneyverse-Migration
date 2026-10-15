import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const dialog = readFileSync(new URL('./takedown-action-dialog.tsx', import.meta.url), 'utf8');
const page = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8');
const actions = readFileSync(new URL('./actions.ts', import.meta.url), 'utf8');

describe('emergency content moderation action truth', () => {
  it('clearly warns that status-only moderation is not automatic content removal', () => {
    expect(dialog).toContain('실제 게시물을 자동 삭제하거나 차단하지 않습니다');
    expect(dialog).not.toContain('콘텐츠 완전 소거');
    expect(dialog).not.toContain('조치 확정 및 원장 기록');
  });

  it('never claims physical removal was confirmed merely because the case status changed', () => {
    expect(page).toContain('삭제 처리 기록');
    expect(page).not.toContain('>삭제 완료</Badge>');
    expect(actions).toContain('실제 게시물 삭제나 차단은 자동 실행되지 않았습니다');
  });
});
