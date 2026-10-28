import type { BlogPost, BlogCountry, BlogTranslation } from './blog.types';

interface VerifiedRow {
  slug:string; country:'KR'|'US'|'JP'|'CN'; locale:string;
  topic:'ECONOMY'|'CODING'|'COMPUTER';
  title:string; excerpt:string; content:string;
  primary_source_url:string; receipt:string; status:string;
  published_at:string; updated_at:string;
}
function isVerifiedRow(v:unknown):v is VerifiedRow {
  if (!v || typeof v!=='object') return false;
  const r=v as Record<string,unknown>;
  return typeof r.slug==='string' && /^[a-z0-9-]{10,110}$/.test(r.slug)
    && ['KR','US','JP','CN'].includes(String(r.country))
    && ['ECONOMY','CODING','COMPUTER'].includes(String(r.topic))
    && typeof r.title==='string' && typeof r.excerpt==='string'
    && typeof r.content==='string' && r.content.length>=1400
    && typeof r.primary_source_url==='string'
    && /^https:\/\//.test(r.primary_source_url)
    && typeof r.receipt==='string'
    && /^[a-f0-9-]{36}$/i.test(r.receipt)
    && r.status==='PUBLISHED';
}
function toBlogPost(row:VerifiedRow):BlogPost {
  const edition = { KR:'ko',US:'en',JP:'ja',CN:'zh' }[row.country] as 'ko'|'en'|'ja'|'zh';
  const category = row.topic==='ECONOMY' ? 'MACRO':'TECH';
  const tags = row.topic==='ECONOMY'
    ? ['경제원리','기초경제',row.country]
    : [row.topic==='CODING'?'Programming':'Computer Systems',row.country];
  const translated:BlogTranslation = {
    title:row.title,excerpt:row.excerpt,content:row.content,tags,
  };
  const translations = edition==='ko' ? undefined : { [edition]:translated };
  return {
    slug:row.slug,title:row.title,excerpt:row.excerpt,content:row.content,
    category,categoryLabel:row.topic==='ECONOMY'?'경제 원리':'컴퓨터 공학',
    author:{name:'Woldeok Editorial AI',role:'Independent source-grounded education',badge:'AI'},
    publishedAt:row.published_at,updatedAt:row.updated_at,
    readTimeMinutes:Math.max(1,Math.ceil(row.content.length/600)),
    tags,relatedCalculatorHref:row.topic==='ECONOMY'?'/tools/compound-calculator':'/blog',
    relatedCalculatorName:row.topic==='ECONOMY'?'기초 계산':'개발 블로그',
    isAiGenerated:true,views:0,country:row.country as BlogCountry,
    status:'PUBLISHED',verificationReceipt:row.receipt,
    ...(translations ? {translations}:{}),
  };
}
/**
 * Server-side read only. No request cookies or raw internal credentials leave
 * the server; stale/unavailable backend cannot make legacy AI posts public.
 */
async function readVerified(endpoint:string):Promise<unknown> {
  const origin=process.env.BLOG_API_ORIGIN?.trim().replace(/\/$/,'');
  if (!origin || !/^https:\/\/easy-scraping\.com$|^https:\/\/test\.easy-scraping\.com$|^http:\/\/127\.0\.0\.1:\d{2,5}$/.test(origin))
    return null;
  const response=await fetch(origin+'/api/v1/blog/verified'+endpoint,{
    cache:'no-store',signal:AbortSignal.timeout(4500),
    headers:{'Accept':'application/json'},
  });
  if (!response.ok) return null;
  return response.json();
}
export async function verifiedPublicArticles():Promise<BlogPost[]> {
  try {
    const data:unknown=await readVerified('');
    if (!data || typeof data!=='object') return [];
    const rows=(data as {posts?:unknown}).posts;
    return Array.isArray(rows)?rows.filter(isVerifiedRow).map(toBlogPost):[];
  }catch{return [];}
}
export async function verifiedArticleBySlug(slug:string):Promise<BlogPost|undefined> {
  if (!/^[a-z0-9-]{10,110}$/.test(slug)) return undefined;
  try {
    const data:unknown=await readVerified('/'+encodeURIComponent(slug));
    if (!data || typeof data!=='object') return undefined;
    const row=(data as {post?:unknown}).post;
    return isVerifiedRow(row)?toBlogPost(row):undefined;
  }catch{return undefined;}
}
