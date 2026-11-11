#!/usr/bin/env node
/** Read-only blog publisher + public discovery smoke test; never issues writes. */
const rawBase = process.argv.find(arg => arg.startsWith('--base='))?.slice('--base='.length);
const base = rawBase ? new URL(rawBase) : new URL('http://127.0.0.1:4391');
const host = process.argv.find(arg => arg.startsWith('--host='))?.slice('--host='.length);
const maxAgeHours = Number(process.argv.find(arg => arg.startsWith('--max-age-hours='))?.slice(16) ?? '4');
if (!['http:', 'https:'].includes(base.protocol) || !Number.isFinite(maxAgeHours) || maxAgeHours <= 0 || maxAgeHours > 168) {
  throw new Error('INVALID_QA_ARGUMENTS');
}
const locales = { KR: '', US: '/en', JP: '/ja', CN: '/zh' };
const requestHeaders = host ? { Host: host, 'X-Forwarded-Proto': 'https' } : {};
async function get(path) {
  const response = await fetch(new URL(path, base), { headers: requestHeaders, signal: AbortSignal.timeout(8000), redirect: 'manual', cache: 'no-store' });
  if (response.status !== 200) throw new Error(`${path} status=${response.status}`);
  return response.text();
}
try {
  const payload = JSON.parse(await get('/api/blog'));
  if (!payload.success || !Array.isArray(payload.posts)) throw new Error('BLOG_API_BAD_SHAPE');
  const visible = payload.posts.filter(post => post && post.status === 'PUBLISHED' && typeof post.slug === 'string');
  const freshest = [...visible].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))[0];
  if (!freshest || !Number.isFinite(Date.parse(freshest.publishedAt))) throw new Error('NO_PUBLISHED_ARTICLE');
  const ageHours = (Date.now() - Date.parse(freshest.publishedAt)) / 3600000;
  if (ageHours < -0.25 || ageHours > maxAgeHours) throw new Error(`PUBLISHER_STALE: age_hours=${ageHours.toFixed(2)}`);
  const recentForeign = [...visible].filter(post => ['US','JP','CN'].includes(post.country)).sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))[0];
  if (!recentForeign) throw new Error('NO_FOREIGN_ARTICLE');
  const nativePath = `${locales[recentForeign.country]}/blog/${encodeURIComponent(recentForeign.slug)}`;
  const [hub, nativeArticle, sitemap] = await Promise.all([get('/blog'), get(nativePath), get('/sitemap-blog.xml')]);
  if (!hub.includes('전 세계 최신 발행 글') || !hub.includes(recentForeign.slug)) throw new Error('KOREAN_HUB_MISSING_WORLDWIDE_ARTICLE');
  if (!nativeArticle.includes(recentForeign.slug)) throw new Error('NATIVE_ARTICLE_NOT_RENDERED');
  if (!sitemap.includes(nativePath)) throw new Error('NATIVE_ARTICLE_MISSING_FROM_SITEMAP');
  console.log(JSON.stringify({ ok: true, articleCount: visible.length, freshestSlug: freshest.slug,
    freshnessHours: Number(ageHours.toFixed(2)), nativePath, source: base.href }, null, 2));
} catch (error) {
  console.error(JSON.stringify({ ok: false, source: base.href, reason: String(error?.message ?? error) }));
  process.exitCode = 1;
}
