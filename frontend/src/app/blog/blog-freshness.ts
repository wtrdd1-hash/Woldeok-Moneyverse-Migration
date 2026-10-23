import type { BlogLocale } from './blog-seo';

type PublishedItem = { readonly publishedAt: string };

/** Derive publication transparency from discoverable, editorially approved articles only. */
export function getBlogFreshnessNotice(
  posts: readonly PublishedItem[],
  locale: BlogLocale,
  now: Date = new Date(),
): string | null {
  const nowTime = now.getTime();
  if (!Number.isFinite(nowTime)) return null;
  const dates = posts.map(p => Date.parse(p.publishedAt)).filter(date => Number.isFinite(date) && date <= nowTime);
  if (!dates.length) return null;
  const latest = Math.max(...dates);
  if (nowTime - latest <= 48 * 60 * 60 * 1000) return null;
  const date = new Date(latest).toISOString().slice(0, 10);
  const labels: Record<BlogLocale, string> = {
    en: 'Most recent public educational post: ' + date + '. Financial articles require source and editorial review before further publication; this is not a real-time news feed.',
    ko: '마지막 공개 교육 글: ' + date + '. 새로운 금융 글의 발행에는 출처 검증과 편집 검토가 필요합니다. 실시간 뉴스가 아닙니다.',
    ja: '最後の公開教育記事: ' + date + '。新しい金融記事は出典確認と編集審査後にのみ公開されます。リアルタイムニュースではありません。',
    zh: '最近一次公开教育文章: ' + date + '。新金融文章仅在核实来源并完成编辑审核后发布，本站并非实时新闻。',
  };
  return labels[locale];
}
