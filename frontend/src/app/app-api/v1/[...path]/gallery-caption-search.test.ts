import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';
const context = { params: Promise.resolve({ path: ['photos'] }) };
const photo = { photoId:'2e090c86-3cd8-47ca-b7db-4be7d7b8daad', imageUrl:'/media/7eede72c-432b-4a45-8ba6-420dd24350c7.jpg', altText:'제주 바다', publishedAt:'2026-10-30T12:00:00.000Z' };
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
describe('Android gallery search', () => {
  it('rejects duplicates before upstream', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN','x'.repeat(32)); const upstream=vi.fn(); vi.stubGlobal('fetch',upstream);
    expect((await GET(new NextRequest('https://easy-scraping.com/app-api/v1/photos?q=제주&q=서울'),context)).status).toBe(400);
    expect(upstream).not.toHaveBeenCalled();
  });
  it('fails closed for legacy 200 and validates new proof with noindex', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN','x'.repeat(32));
    const upstream=vi.fn(async () => new Response(JSON.stringify({photos:[photo]}),{status:200,headers:{'content-type':'application/json','cache-control':'public, max-age=86400'}})); vi.stubGlobal('fetch',upstream);
    const request=new NextRequest('https://easy-scraping.com/app-api/v1/photos?q=제주');
    expect((await GET(request,context)).status).toBe(503);
    upstream.mockImplementationOnce(async () => new Response(JSON.stringify({photos:[photo],query:'제주',scope:'latest_24_published'}),{status:200,headers:{'content-type':'application/json','cache-control':'public, max-age=86400'}}));
    const res=await GET(request,context); expect(res.status).toBe(200); expect(res.headers.get('cache-control')).toBe('no-store'); expect(res.headers.get('x-robots-tag')).toBe('noindex');
  });
});
