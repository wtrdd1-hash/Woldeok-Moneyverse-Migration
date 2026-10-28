#!/usr/bin/env node
import assert from 'node:assert/strict';

const origin = process.env.BLOG_QA_ORIGIN || '';
const sha = process.env.BLOG_QA_SHA || '';
if (!/^https:\/\/test\.easy-scraping\.com$|^http:\/\/127\.0\.0\.1:\d{2,5}$/.test(origin)) {
  throw new Error('Use an official Test or localhost candidate, never Production');
}
if (!/^[a-f0-9]{40}$/.test(sha)) throw new Error('Need exact candidate SHA');
const request = (p) => fetch(origin + p, {
  headers:{Accept:'application/json'},
  redirect:'manual',signal:AbortSignal.timeout(10000),cache:'no-store'
});
const version = await request('/api/version');
assert.equal(version.status,200);
assert.equal((await version.json()).id,sha);
const unauthorized = await request('/api/v1/admin/blog-verified');
assert.ok([401,403].includes(unauthorized.status));
const response = await request('/api/v1/blog/verified');
assert.equal(response.status,200);
const body = await response.json();
assert.equal(body.success,true);
assert.ok(Array.isArray(body.posts));
assert.equal(body.count,body.posts.length);
const loc = {KR:'ko-KR',US:'en-US',JP:'ja-JP',CN:'zh-CN'};
const slugs = new Set(), receipts = new Set();
for (const post of body.posts) {
  assert.equal(post.status,'PUBLISHED');
  assert.equal(post.locale,loc[post.country]);
  assert.ok(['ECONOMY','CODING','COMPUTER'].includes(post.topic));
  assert.match(post.slug,/^[a-z0-9-]{10,110}$/);
  assert.match(post.receipt,/^[a-f0-9-]{36}$/i);
  assert.match(post.primary_source_url,/^https:\/\//);
  assert.ok(post.content.length >= 1400);
  assert.ok(post.content.includes(post.primary_source_url));
  assert.ok(!slugs.has(post.slug));
  assert.ok(!receipts.has(post.receipt));
  slugs.add(post.slug);receipts.add(post.receipt);
  const detail = await request('/api/v1/blog/verified/'+encodeURIComponent(post.slug));
  assert.equal(detail.status,200);
  const result = await detail.json();
  assert.equal(result.post?.receipt,post.receipt);
}
if (process.env.BLOG_QA_REQUIRE_POST === 'true') assert.ok(slugs.size > 0);
console.log(JSON.stringify({status:'READ_ONLY_QA_PASS',sha,articles:slugs.size}));
