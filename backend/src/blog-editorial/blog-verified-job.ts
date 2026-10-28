import { selectTwoHourBlogSlot } from './blog-two-hour-rotation';
import { authorVerifiedArticle, generateLocalOriginalArticle } from './blog-original-author';
import type { BlogVerifiedRepository } from './blog-verified.repository';

/**
 * Invoked only by the existing leader-elected backend hourly scheduler.
 * Failure and missing evidence always skip, never fall back to JSON publishing.
 */
export function createVerifiedBlogJob(
  repository: Pick<BlogVerifiedRepository,'currentPeriod'|'digests'|'publish'>,
  report: (detail:string)=>void = ()=>{},
) {
  return async () => {
    const slot = selectTwoHourBlogSlot(new Date());
    if (!slot) return { skipped:true, reason:'ODD_HOUR' };
    if (process.env.BLOG_TWO_HOUR_PUBLISHER_ENABLED !== 'true')
      return { skipped:true, reason:'PUBLISHER_DISABLED', periodKey:slot.periodKey };
    const existing = await repository.currentPeriod(slot.periodKey);
    if (existing) return { skipped:true, reason:'SLOT_ALREADY_CLAIMED',
      periodKey:slot.periodKey, status:existing.status };
    try {
      const article = await authorVerifiedArticle(
        slot,
        (intent,source)=>generateLocalOriginalArticle(intent,source,{
          model:process.env.BLOG_EDITORIAL_MODEL?.trim() || 'llama3.2:3b',
        }),
        undefined,
        await repository.digests(),
      );
      const receipt = await repository.publish(article);
      return { periodKey:slot.periodKey, country:slot.country,
        topic:slot.topic, inserted:receipt.inserted,
        receipt:receipt.publication_receipt, status:receipt.result_status };
    } catch(error:unknown) {
      const reason = error instanceof Error ? error.message : 'UNKNOWN_WRITER_ERROR';
      report(slot.periodKey + ' ' + reason);
      // The scheduler records a failed claim instead of a false succeeded event.
      throw error instanceof Error ? error : new Error(reason);
    }
  };
}
