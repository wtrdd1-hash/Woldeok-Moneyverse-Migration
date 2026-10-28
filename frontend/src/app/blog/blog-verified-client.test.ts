import { afterEach, describe, expect, it, vi } from 'vitest';
import { verifiedArticleBySlug, verifiedPublicArticles } from './blog-verified-client';
import { hasCountryEdition, isBlogDiscoverable } from './blog-seo';

const row = {
  slug:'2026-10-28-cn-coding-5',country:'CN',locale:'zh-CN',topic:'CODING',
  title:'面向初学者的计算机编程与脚本基础知识',
  excerpt:'现代计算机程序需要正确处理数据、网络请求和结果，并且应该通过官方文档进行验证。',
  content:'## 基础概念\n'+ '编程语言设计有助于理解计算机与网络之间的信息处理和正确数据操作。'.repeat(62),
  primary_source_url:'https://developer.mozilla.org/zh-CN/docs/Web/JavaScript',
  receipt:'12345678-1234-4123-a123-123456789012',
  status:'PUBLISHED',published_at:'2026-10-28T00:00:00.000Z',updated_at:'2026-10-28T00:00:00.000Z',
};
describe('DB-verified country blog public projection',()=>{
 afterEach(()=>{vi.unstubAllEnvs();vi.unstubAllGlobals();});
 it('only renders a verified publication receipt in its native country, without fake analytics',async()=>{
  vi.stubEnv('BLOG_API_ORIGIN','http://127.0.0.1:3000');
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response(JSON.stringify({posts:[row]}),{status:200})));
  const posts=await verifiedPublicArticles();
  expect(posts).toHaveLength(1);
  expect(isBlogDiscoverable(posts[0]!)).toBe(true);
  expect(hasCountryEdition(posts[0]!,'zh')).toBe(true);
  expect(hasCountryEdition(posts[0]!,'ko')).toBe(false);
  expect(hasCountryEdition(posts[0]!,'ja')).toBe(false);
  expect(posts[0]?.views).toBe(0);
  expect(posts[0]?.verificationReceipt).toBe(row.receipt);
 });
 it('rejects server-delivered unpublished, missing-receipt, and fake short posts',async()=>{
  vi.stubEnv('BLOG_API_ORIGIN','http://127.0.0.1:3000');
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response(JSON.stringify({
    posts:[{...row,status:'WITHDRAWN'},{...row,receipt:null},{...row,content:'short'}],
  }),{status:200})));
  expect(await verifiedPublicArticles()).toEqual([]);
 });
 it('never probes an attacker-defined remote origin',async()=>{
  vi.stubEnv('BLOG_API_ORIGIN','http://attacker.test');
  const request=vi.fn();
  vi.stubGlobal('fetch',request);
  expect(await verifiedPublicArticles()).toEqual([]);
  expect(request).not.toHaveBeenCalled();
 });
 it('fetches one canonical slug but not an arbitrary path',async()=>{
  vi.stubEnv('BLOG_API_ORIGIN','http://127.0.0.1:3000');
  const request=vi.fn().mockResolvedValue(new Response(JSON.stringify({post:row}),{status:200}));
  vi.stubGlobal('fetch',request);
  expect((await verifiedArticleBySlug(row.slug))?.slug).toBe(row.slug);
  expect(request).toHaveBeenCalledTimes(1);
  expect(await verifiedArticleBySlug('../admin')).toBeUndefined();
  expect(request).toHaveBeenCalledTimes(1);
 });
});
