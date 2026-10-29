import type { HelpLocale } from './locale';

/** PostgreSQL timestamptz is serialized by the API as a canonical UTC ISO string. */
export function HelpPublicationDate({ publishedAt, locale }: { publishedAt: unknown; locale: HelpLocale }) {
  if (typeof publishedAt !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(publishedAt)) return null;
  const date = new Date(publishedAt);
  if (!Number.isFinite(date.getTime()) || date.toISOString() !== publishedAt) return null;
  const dateLabel = new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'ko-KR', {
    dateStyle: 'medium', timeZone: 'Asia/Seoul',
  }).format(date);
  return <time dateTime={publishedAt} className="text-sm text-muted-foreground">
    {locale === 'en' ? 'Published: ' : '게시일: '}{dateLabel} KST
  </time>;
}
