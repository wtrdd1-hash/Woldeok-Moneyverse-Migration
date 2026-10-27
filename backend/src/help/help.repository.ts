import type { Queryable } from '../core/db';
import { queryOne, queryRows } from '../core/db';

export interface HelpSummary {
  readonly article_id: string;
  readonly locale: string;
  readonly slug: string;
  readonly category: string;
  readonly title: string;
  readonly summary: string;
  readonly published_at: Date;
}
export interface HelpArticle extends HelpSummary {
  readonly body_plain: string;
  readonly source_url: string;
}

/** Only SECURITY DEFINER published-only reads; no app-table access. */
export class HelpRepository {
  constructor(private readonly pool: Queryable) {}
  search(locale: string, category: string | null, query: string, limit: number) {
    return queryRows<HelpSummary>(this.pool,
      'SELECT article_id::text,locale,slug,category,title,summary,published_at FROM public.help_public_search($1,$2,$3,$4)',
      [locale, category, query, limit]);
  }
  article(locale: string, slug: string) {
    return queryOne<HelpArticle>(this.pool,
      'SELECT article_id::text,locale,slug,category,title,summary,body_plain,source_url,published_at FROM public.help_public_article($1,$2)',
      [locale, slug]);
  }
  async adminCreate(actor: string, session: string, key: string, draft: HelpDraftInput): Promise<string | null> {
    const row = await queryOne<{ article_id: string }>(this.pool,
      'SELECT public.help_admin_create_draft($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)::text AS article_id',
      [actor,session,key,draft.locale,draft.slug,draft.category,draft.title,draft.summary,draft.body,draft.sourceUrl,draft.sourceSha256,draft.reviewedUntil]);
    return row?.article_id ?? null;
  }
  async adminPublish(actor: string, session: string, key: string, article: string, expectedVersion: string): Promise<string | null> {
    const row = await queryOne<{ article_id: string }>(this.pool,
      'SELECT public.help_admin_publish($1,$2,$3,$4,$5)::text AS article_id',
      [actor,session,key,article,expectedVersion]);
    return row?.article_id ?? null;
  }
  async adminRetract(actor: string, session: string, key: string, article: string, expectedVersion: string): Promise<string | null> {
    const row = await queryOne<{ article_id: string }>(this.pool,
      'SELECT public.help_admin_retract($1,$2,$3,$4,$5)::text AS article_id',
      [actor,session,key,article,expectedVersion]);
    return row?.article_id ?? null;
  }
  adminQueue(actor: string, session: string) {
    return queryRows<HelpAdminRow>(this.pool,
      'SELECT article_id::text,locale,slug,category,title,body_plain,source_url,source_sha256,reviewed_until,state,version::text,author_id::text FROM public.help_admin_queue($1,$2)',
      [actor,session]);
  }

}

export interface HelpDraftInput {
  readonly locale: string;
  readonly slug: string;
  readonly category: string;
  readonly title: string;
  readonly summary: string;
  readonly body: string;
  readonly sourceUrl: string;
  readonly sourceSha256: string;
  readonly reviewedUntil: string;
}

export interface HelpAdminRow {
  readonly article_id: string;
  readonly locale: string;
  readonly slug: string;
  readonly category: string;
  readonly title: string;
  readonly body_plain: string;
  readonly source_url: string;
  readonly source_sha256: string;
  readonly reviewed_until: Date;
  readonly state: string;
  readonly version: string;
  readonly author_id: string;
}
