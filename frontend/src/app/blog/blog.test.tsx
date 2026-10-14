import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getAllBlogPosts,
  getBlogPostBySlug,
  generateDailyAiBlogPost,
  BLOG_CATEGORIES,
} from './blog-data';
import { GET as getBlogList } from '../api/blog/route';
import { POST as generateBlog } from '../api/blog/generate/route';

describe('AI Daily Blog System', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }))));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads seed blog posts correctly', () => {
    const posts = getAllBlogPosts();
    expect(posts.length).toBeGreaterThanOrEqual(3);

    const first = posts[0]!;
    expect(first.slug).toBeDefined();
    expect(first.title).toBeDefined();
    expect(first.content).toContain('##');
    expect(first.author.name).toBe('덕이 (Deoki)');
    expect(first.relatedCalculatorHref).toBeDefined();
  });

  it('retrieves post by slug', () => {
    const post = getBlogPostBySlug('2026-10-14-compound-interest-wealth-secret');
    expect(post).toBeDefined();
    expect(post?.title).toContain('복리');
    expect(post?.category).toBe('COMPOUND');
  });

  it('generates new daily AI blog post with high-converting keywords', () => {
    const initialCount = getAllBlogPosts().length;
    const newPost = generateDailyAiBlogPost();

    expect(newPost).toBeDefined();
    expect(newPost.title).toContain('[AI 금융칼럼]');
    expect(newPost.isAiGenerated).toBe(true);
    expect(newPost.content).toContain('덕이');
    expect(newPost.readTimeMinutes).toBeGreaterThan(0);

    const afterCount = getAllBlogPosts().length;
    expect(afterCount).toBe(initialCount + 1);
  });

  it('verifies GET /api/blog endpoint returns post array', async () => {
    const res = await getBlogList();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.posts)).toBe(true);
    expect(json.count).toBeGreaterThanOrEqual(3);
  });

  it('verifies POST /api/blog/generate creates and indexes post', async () => {
    const req = new Request('http://localhost:3000/api/blog/generate', {
      method: 'POST',
      headers: {
        'x-cron-secret': 'mv-internal-secure-key-2026',
      },
    });
    const res = await generateBlog(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.post).toBeDefined();
    expect(json.url).toContain('/blog/');
  });
});
