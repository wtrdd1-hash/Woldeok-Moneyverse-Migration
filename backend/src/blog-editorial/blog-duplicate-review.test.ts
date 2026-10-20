import { describe, expect, it } from 'vitest';
import { reviewBlogDuplicateCandidates, type BlogTopicForReview } from './blog-duplicate-review';

const post: BlogTopicForReview = {
  id: 'post-1', locale: 'ko', jurisdiction: 'KR',
  slug: 'savings-interest-guide',
  title: '예금 이자 계산 방법 총정리',
  content: '만기 시 세후 이자를 구하는 예금 계산 원리와 예시를 살펴봅니다.',
};

describe('AI blog duplicate topic review v976', () => {
  it('blocks normalized title/slug duplicates irrespective of punctuation', () => {
    const candidate = { ...post, id: 'new', title: '예금이자 계산방법, 총정리!!', slug: 'new-slug' };
    expect(reviewBlogDuplicateCandidates(candidate, [post]).status).toBe('BLOCK_EXACT');
    expect(reviewBlogDuplicateCandidates({ ...candidate, slug: post.slug, title: '별개의 제목' }, [post]).status)
      .toBe('BLOCK_EXACT');
  });
  it('surfaces 80 repeated legacy drafts, instead of silently selecting one', () => {
    const same = Array.from({ length: 80 }, (_, i) => ({ ...post, id: 'legacy-' + i }));
    const result = reviewBlogDuplicateCandidates({ ...post, id: 'new' }, same);
    expect(result.status).toBe('BLOCK_EXACT');
    expect(result.matches).toHaveLength(80);
  });
  it('does not treat substantively different jurisdiction editions as exact duplicates', () => {
    const country = { ...post, id: 'jp-new', jurisdiction: 'JP' as const, slug: post.slug };
    expect(reviewBlogDuplicateCandidates(country, [post]).status).toBe('CLEAR_FOR_EDITORIAL_REVIEW');
  });
  it('never equates a draft duplicate screen with publication approval', () => {
    const result = reviewBlogDuplicateCandidates({
      ...post, id: 'new', title: '신용대출 상환액 분석', slug: 'loan-amortization',
      content: '매달 상환하는 대출 이자와 대출금 원금을 원리금균등 상환 방식으로 계산하는 방법을 설명합니다.',
    }, [post]);
    expect(result.status).toBe('CLEAR_FOR_EDITORIAL_REVIEW');
    expect(result).not.toHaveProperty('approved');
    expect(result).not.toHaveProperty('publish');
  });
  it('flags similar copy even with a distinct title but reserves human review', () => {
    const other = { ...post, id: 'new', slug: 'different', title: '적금 이자 안내' };
    const result = reviewBlogDuplicateCandidates(other, [post]);
    expect(result.status).toBe('REVIEW_SIMILAR');
  });
});
