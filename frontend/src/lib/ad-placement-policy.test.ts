import { describe, expect, it } from 'vitest';
import { getBlogAdPlan, isEligiblePublicAdPath } from './ad-placement-policy';

describe('advertising content-only allowlist', () => {
  it.each(['/', '/en', '/ja', '/zh', '/tools', '/en/tools/compound-calculator', '/guide/glossary', '/blog/educational-post', '/gallery', '/announcements'])('allows vetted public content %s', (path) => {
    expect(isEligiblePublicAdPath(path)).toBe(true);
  });
  it.each(['/admin', '/wallet', '/bank', '/bonds', '/stocks/CHIPS', '/casino', '/arcade', '/account', '/login', '/register', '/privacy', '/chat', '/en/wallet', '/en/stocks/CHIPS', '/guide-malicious', '/tools-malicious'])('excludes decision/sensitive route %s', (path) => {
    expect(isEligiblePublicAdPath(path)).toBe(false);
  });
  it('fails closed when no path is available', () => expect(isEligiblePublicAdPath(null)).toBe(false));
});

describe('content-length spacing and nonintrusive article ad inventory', () => {
  it('shows no ad on tiny posts', () => expect(getBlogAdPlan(2)).toEqual({showTop:false,inlineAfter:[],showBottom:false}));
  it('shows just one ad for a short article', () => expect(getBlogAdPlan(7)).toEqual({showTop:false,inlineAfter:[],showBottom:true}));
  it('keeps mid-length articles at two units', () => expect(getBlogAdPlan(10)).toEqual({showTop:true,inlineAfter:[],showBottom:true}));
  it('uses three units for long-enough articles', () => expect(getBlogAdPlan(15)).toEqual({showTop:true,inlineAfter:[6],showBottom:true}));
  it('caps deep articles to four nonadjacent units', () => expect(getBlogAdPlan(30)).toEqual({showTop:true,inlineAfter:[6,15],showBottom:true}));
  it('handles bad lengths without forcing an ad', () => expect(getBlogAdPlan(Number.NaN)).toEqual({showTop:false,inlineAfter:[],showBottom:false}));
});
