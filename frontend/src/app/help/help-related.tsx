import Link from 'next/link';
import { helpArticleHref, type HelpLocale } from './locale';

export type RelatedHelpArticle = { article_id: string; slug: string; title: string };

/** The backend returns only approved, unexpired same-category/locale articles. */
export function RelatedHelp({ locale, articles }: { locale: HelpLocale; articles: readonly RelatedHelpArticle[] }) {
  if (articles.length === 0) return null;
  return <nav aria-label={locale === 'en' ? 'Related verified help' : '관련 검증된 도움말'} className="grid gap-3 rounded-xl border p-4">
    <h2 className="text-lg font-semibold">{locale === 'en' ? 'Related verified help' : '관련 검증된 도움말'}</h2>
    <ul className="grid gap-2">{articles.map(article =>
      <li key={article.article_id}><Link className="underline underline-offset-4" href={helpArticleHref(article.slug, locale)}>{article.title}</Link></li>
    )}</ul>
  </nav>;
}
