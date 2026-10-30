import { Inject, Injectable, ServiceUnavailableException } from '@nestjs/common';
import type { Queryable } from '../core/db';
import { queryOne, queryRows } from '../core/db';
import { PG_POOL } from '../core/pool.provider';
import type { VerifiedOriginalArticle } from './blog-original-author';

export interface PublicationReceipt {
  publication_receipt: string;
  inserted: boolean;
  result_status: string;
}
export interface PublishedArticleRow {
  slug: string;
  country: string;
  locale: string;
  topic: string;
  title: string;
  excerpt: string;
  content: string;
  primary_source_url: string;
  receipt: string;
  status: string;
  published_at: string;
  updated_at: string;
}
@Injectable()
export class BlogVerifiedRepository {
  constructor(@Inject(PG_POOL) private readonly db: Queryable | null) {}
  private pool(): Queryable {
    if (!this.db) throw new ServiceUnavailableException('blog database unavailable');
    return this.db;
  }
  currentPeriod(period: string) {
    return queryOne<{receipt:string;content_digest:string;status:string}>(this.pool(),
      'SELECT receipt,content_digest,status FROM public.blog_verified_period_receipt($1)',[period]);
  }
  async digests(): Promise<ReadonlySet<string>> {
    const rows = await queryRows<{content_digest:string}>(this.pool(),
      'SELECT content_digest FROM public.blog_verified_recent_digests()');
    return new Set(rows.map(row => row.content_digest));
  }
  list() {
    return queryRows<PublishedArticleRow>(this.pool(),
      'SELECT * FROM public.blog_verified_public_list()');
  }
  listForAdmin(actor: string) {
    return queryRows<PublishedArticleRow>(this.pool(),
      'SELECT * FROM public.blog_verified_admin_list($1::uuid)', [actor]);
  }
  find(slug: string) {
    return queryOne<PublishedArticleRow>(this.pool(),
      'SELECT * FROM public.blog_verified_public_by_slug($1)',[slug]);
  }
  moderate(input:{actor:string;slug:string;action:string;reason:string;
     title?:string;excerpt?:string;content?:string}) {
    return queryOne<{publication_receipt:string;result_status:string}>(this.pool(),
      'SELECT * FROM public.blog_admin_moderate($1::uuid,$2,$3,$4,$5,$6,$7)',
      [input.actor,input.slug,input.action,input.reason,
       input.title ?? null,input.excerpt ?? null,input.content ?? null]);
  }
  async publish(article: VerifiedOriginalArticle): Promise<PublicationReceipt> {
    const s = article.slot;
    const slug = s.editorialDay + '-' + s.country.toLowerCase() + '-' + s.topic.toLowerCase() + '-' + s.slotIndex;
    const evidence = JSON.stringify({
      quality:'PASS',sourceUrl:article.source.url,
      sourceDigest:article.source.digest, verifiedLocale:s.locale,
      humanReviewRequired:false, automaticallyUnpublish:false, googleAdsAllowed:false,
    });
    const row = await queryOne<PublicationReceipt>(this.pool(),
      'SELECT * FROM public.blog_publish_verified($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb)',
      [s.periodKey,slug,s.country,s.locale,s.topic,article.title,article.excerpt,
       article.content,article.source.url,article.source.digest,article.contentDigest,evidence]);
    if (!row) throw new Error('PUBLICATION_RECEIPT_MISSING');
    return row;
  }
}
