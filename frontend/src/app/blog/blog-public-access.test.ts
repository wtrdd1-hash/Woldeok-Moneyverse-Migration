// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { isPublicBlogArticle } from './blog-public-access';
import type { BlogPost } from './blog.types';
const article = (status: BlogPost['status']) => ({ status, isAiGenerated: true } as BlogPost);
describe('public blog article access', () => {
  it('does not expose draft, withdrawn or unreviewed article bodies by guessed slug', () => {
    expect(isPublicBlogArticle(article('DRAFT'))).toBe(false);
    expect(isPublicBlogArticle(article('WITHDRAWN'))).toBe(false);
    expect(isPublicBlogArticle(article(undefined))).toBe(false);
  });
  it('wires the public guard to both SSR body and metadata paths', () => {
    const server = readFileSync(new URL('./blog-page-server.tsx', import.meta.url), 'utf8');
    expect(server.match(/!original \|\| !isPublicBlogArticle\(original\)/g)).toHaveLength(2);
  });
  it('permits published editorial articles', () => {
    expect(isPublicBlogArticle(article('PUBLISHED'))).toBe(true);
  });
});
