import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const load=(n:number)=>readFileSync('migrations/'+n+'-'+
 ({288:'verified-country-blog-publication',289:'verified-blog-publish-function',290:'verified-blog-moderation'} as Record<number,string>)[n]+'.sql','utf8');
const schema=load(288), publish=load(289), admin=load(290);
describe('verified blog schema and permissions v288-v290',()=>{
 it('holds original country, topic, source, digest, receipt and permanent status separately from legacy JSON',()=>{
  for(const column of ['period_key','slug','country','locale','topic','title','excerpt','content','primary_source_url','source_digest','content_digest','evidence','receipt','status','ad_curated']) {
   expect(schema).toContain(column);
  }
  expect(schema).toContain("status IN ('PUBLISHED','WITHDRAWN','DELETED')");
  expect(schema).toContain('UNIQUE');
  expect(schema).toContain('blog_verified_audit');
  expect(schema).not.toContain('blog-posts.json');
 });
 it('denies direct application mutations and PUBLIC execution on the publishing function',()=>{
  expect(schema).toMatch(/REVOKE ALL ON public\.blog_verified_articles,public\.blog_verified_audit FROM PUBLIC,moneyverse_app/);
  expect(publish).toMatch(/REVOKE EXECUTE ON FUNCTION public\.blog_publish_verified/);
  expect(publish).toMatch(/ON CONFLICT \(period_key\) DO NOTHING/);
  expect(publish).toMatch(/different content|conflicting publication slot/);
  expect(publish).toMatch(/p_evidence->>'quality'<>'PASS'/);
 });
 it('allows only admin-authorized explicit status changes, no timeout unpublication',()=>{
  expect(admin).toMatch(/public\.admin_current_roles\(p_actor\)/);
  expect(admin).toContain("p_action NOT IN ('WITHDRAW','DELETE','REVISE')");
  expect(admin).toContain("REVOKE EXECUTE ON FUNCTION public.blog_admin_moderate");
  expect(admin).not.toMatch(/INTERVAL\s*'24 hours'|review_deadline|auto_unpublish/i);
 });
});
