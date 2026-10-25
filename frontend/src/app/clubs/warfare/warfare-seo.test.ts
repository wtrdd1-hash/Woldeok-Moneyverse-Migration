import { describe, expect, it } from 'vitest';
import { metadata } from './layout';

describe('Warfare member privacy and search presentation', () => {
  it('prevents indexing or falsely advertising WLD distributions', () => {
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(JSON.stringify(metadata)).not.toMatch(/배당금을 정산받으세요|최대 65만 WLD|즉시 자동 입금/);
  });
});
