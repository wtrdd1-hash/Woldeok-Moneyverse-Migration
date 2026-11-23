import { describe, expect, it } from 'vitest';
import { getBlogAdPlan, isEligiblePublicAdPath, publicAdDisclosure } from './ad-placement-policy';

describe('advertising content-only allowlist', () => {
  it.each(['/', '/en', '/ko', '/ja', '/zh', '/vi', '/tools', '/en/tools/compound-calculator', '/ko/blog/article', '/vi/guide/introduction', '/guide/glossary', '/blog', '/en/blog', '/ja/blog/educational-post', '/zh/blog', '/gallery', '/announcements'])('allows vetted public content %s', (path) => {
    expect(isEligiblePublicAdPath(path)).toBe(true);
  });
  it.each(['/admin', '/wallet', '/bank', '/bonds', '/stocks/CHIPS', '/casino', '/arcade', '/account', '/login', '/register', '/privacy', '/chat', '/en/wallet', '/en/stocks/CHIPS', '/guide-malicious', '/tools-malicious'])('excludes decision/sensitive route %s', (path) => {
    expect(isEligiblePublicAdPath(path)).toBe(false);
  });
  it('fails closed when no path is available', () => expect(isEligiblePublicAdPath(null)).toBe(false));
  it.each(['/ko/bank', '/vi/login', '/ja/wallet', '/zh/admin', '/ko/stocks/CHIPS'])('keeps localized protected routes ad-free: %s', path => {
    expect(isEligiblePublicAdPath(path)).toBe(false);
  });
  it.each([
    ['/en/blog', 'Advertisement'], ['/ko/blog/article', '광고'],
    ['/ja/blog', '広告'], ['/zh/blog', '广告'], ['/vi/blog', 'Quảng cáo'],
  ])('discloses advertising in its selected locale on %s', (path, label) => {
    expect(publicAdDisclosure(path)).toBe(label);
  });
});

describe('content-length spacing and nonintrusive article ad inventory', () => {
  it('shows no ad on tiny posts', () => expect(getBlogAdPlan(2)).toEqual({showTop:false,inlineAfter:[],showBottom:false}));
  it('shows just one ad for a short article', () => expect(getBlogAdPlan(7)).toEqual({showTop:false,inlineAfter:[],showBottom:true}));
  it('keeps mid-length articles at two units', () => expect(getBlogAdPlan(10)).toEqual({showTop:true,inlineAfter:[],showBottom:true}));
  it('uses three units for long-enough articles', () => expect(getBlogAdPlan(15)).toEqual({showTop:true,inlineAfter:[6],showBottom:true}));
  it('caps deep articles to four nonadjacent units', () => expect(getBlogAdPlan(30)).toEqual({showTop:true,inlineAfter:[6,15],showBottom:true}));
  it('handles bad lengths without forcing an ad', () => expect(getBlogAdPlan(Number.NaN)).toEqual({showTop:false,inlineAfter:[],showBottom:false}));
});
