import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

afterEach(()=>{vi.unstubAllGlobals();vi.unstubAllEnvs();});
const context={params:Promise.resolve({path:['content','announcements']})};
const request=()=>new NextRequest('https://easy-scraping.com/app-api/v1/content/announcements');

describe('Android public announcement source truth',()=>{
  it.each([
    ['verified empty',{sourceStatus:'VERIFIED',count:0,announcements:[]},200],
    ['unverified empty',{announcements:[]},503],
    ['forged count',{sourceStatus:'VERIFIED',count:1,announcements:[]},503],
  ])('%s cannot invent published content',async(_name,payload,status)=>{
    vi.stubEnv('INTERNAL_API_TOKEN','x'.repeat(32));
    vi.stubEnv('APP_BASE_URL','https://easy-scraping.com');
    vi.stubGlobal('fetch',vi.fn(async()=>new Response(JSON.stringify(payload),{status:200,headers:{'content-type':'application/json','cache-control':'public, max-age=3600'}})));
    const response=await GET(request(),context);
    expect(response.status).toBe(status);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    if(status===503) expect((await response.json()).announcements).toBeUndefined();
  });
});
