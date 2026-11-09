import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';
import { verifiedPublicArticles } from '../blog/blog-verified-client';
import type { BlogPost } from '../blog/blog.types';

vi.mock('../blog/blog-verified-client', () => ({ verifiedPublicArticles: vi.fn() }));
const post = (status='PUBLISHED', receipt: string | undefined='12345678-1234-4123-a123-123456789012') => ({
  slug:'2026-11-09-cn-computer-1', title:'Verified native Chinese article',
  status,country:'CN',isAiGenerated:true,verificationReceipt:receipt,
  updatedAt:'2026-11-09T06:07:06.889Z',
}) as unknown as BlogPost;

describe('verified blog public sitemap',()=>{
  afterEach(()=>{vi.unstubAllEnvs();vi.clearAllMocks();});
  it('includes only native verified published articles and live hubs',async()=>{
    vi.stubEnv('SEO_INDEXING_ENABLED','true');
    vi.mocked(verifiedPublicArticles).mockResolvedValue([post(),post('WITHDRAWN'),post('PUBLISHED',undefined)]);
    const response=await GET(); const xml=await response.text();
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('application/xml');
    expect(xml).toContain('<loc>https://easy-scraping.com/zh/blog/2026-11-09-cn-computer-1</loc>');
    expect(xml).toContain('<loc>https://easy-scraping.com/zh/blog</loc>');
    expect(xml).toContain('<lastmod>2026-11-09T06:07:06.889Z</lastmod>');
    expect((xml.match(/2026-11-09-cn-computer-1/g) || [])).toHaveLength(1);
    expect(xml).not.toContain('https://easy-scraping.com/blog/2026-11-09-cn-computer-1');
  });
  it('fails closed rather than publishing an empty canonical sitemap on upstream outage',async()=>{
    vi.stubEnv('SEO_INDEXING_ENABLED','true');
    vi.mocked(verifiedPublicArticles).mockResolvedValue([]);
    const response=await GET();
    expect(response.status).toBe(503);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });
  it('does not emit indexable content when global SEO is disabled',async()=>{
    vi.stubEnv('SEO_INDEXING_ENABLED','false');
    vi.mocked(verifiedPublicArticles).mockResolvedValue([post()]);
    expect((await GET()).status).toBe(503);
    expect(verifiedPublicArticles).not.toHaveBeenCalled();
  });
});
