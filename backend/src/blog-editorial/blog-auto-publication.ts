import { createHash } from 'node:crypto';
import { selectTwoHourBlogSlot } from './blog-two-hour-rotation';
import { generateLocalOriginalArticle } from './blog-original-author';
import { retrievePrimarySource } from './blog-primary-sources';
import { checkOriginalArticle } from './blog-original-quality';
import type { BlogVerifiedRepository } from './blog-verified.repository';
import { publishUnverifiedArticle, readUnverifiedPosts } from './blog-unverified-store';

/** Both outcomes are PUBLISHED, but only evidence-PASS may reach DB verified APIs. */
export function createBlogAutoPublicationJob(
  repo:Pick<BlogVerifiedRepository,'currentPeriod'|'digests'|'publish'>,
  report:(detail:string)=>void=()=>{}, clock:()=>Date=()=>new Date(),
  dependencies:Partial<{
    readSource:typeof retrievePrimarySource;
    generate:typeof generateLocalOriginalArticle;
    check:typeof checkOriginalArticle;
    readUnverified:typeof readUnverifiedPosts;
    publishUnverified:typeof publishUnverifiedArticle;
  }>={},
) {
  return async()=>{
    const slot=selectTwoHourBlogSlot(clock());
    if (!slot) return {skipped:true,reason:'ODD_HOUR'};
    if (process.env.BLOG_TWO_HOUR_PUBLISHER_ENABLED!=='true')
      return {skipped:true,reason:'PUBLISHER_DISABLED',periodKey:slot.periodKey};
    const existing=await repo.currentPeriod(slot.periodKey);
    if(existing) return {skipped:true,reason:'SLOT_ALREADY_CLAIMED',periodKey:slot.periodKey,status:existing.status};
    const unverified = (dependencies.readUnverified ?? readUnverifiedPosts)().find(p=>p.periodKey===slot.periodKey);
    if(unverified) return {skipped:true,reason:'UNVERIFIED_SLOT_ALREADY_CLAIMED',periodKey:slot.periodKey,status:unverified.status};
    try {
      const source=await (dependencies.readSource ?? retrievePrimarySource)(slot);
      const draft=await (dependencies.generate ?? generateLocalOriginalArticle)(slot,source,{
        model:process.env.BLOG_EDITORIAL_MODEL?.trim()||'qwen2.5:3b',
      });
      const quality=(dependencies.check ?? checkOriginalArticle)(draft,slot,source,await repo.digests());
      if(quality.eligible) {
        const receipt=await repo.publish({ ...draft,slot,source,contentDigest:quality.digest });
        return {periodKey:slot.periodKey,country:slot.country,topic:slot.topic,
          inserted:receipt.inserted,receipt:receipt.publication_receipt,
          status:receipt.result_status,verificationState:'VERIFIED'};
      }
      if(process.env.BLOG_UNVERIFIED_PUBLICATION_ENABLED!=='true')
        throw new Error('ARTICLE_QUALITY_HOLD:'+quality.reasons.join(','));
      const stored=(dependencies.publishUnverified ?? publishUnverifiedArticle)(slot,draft,quality.reasons);
      return {periodKey:slot.periodKey,country:slot.country,topic:slot.topic,
        inserted:stored.inserted,status:stored.status,slug:stored.slug,
        verificationState:'UNVERIFIED',qualityIssues:quality.reasons,
        auditDigest:createHash('sha256').update(draft.content).digest('hex')};
    } catch(error) {
      report(slot.periodKey+' '+(error instanceof Error?error.message:'UNKNOWN_BLOG_FAILURE'));
      throw error;
    }
  };
}
