import type { BlogLocale } from './blog-seo';

type PublishedItem = { readonly publishedAt: string };

/** Derive publication transparency from discoverable, editorially approved articles only. */
export function getBlogFreshnessNotice(
  posts: readonly PublishedItem[],
  locale: BlogLocale,
  now: Date = new Date(),
): string | null {
  const dates = posts.map(p => Date.parse(p.publishedAt)).filter(Number.isFinite);
  if (!dates.length) return null;
  const latest = Math.max(...dates);
  if (now.getTime() - latest <= 48 * 60 * 60 * 1000) return null;
  const date = new Date(latest).toISOString().slice(0, 10);
  const labels: Record<BlogLocale, string> = {
    en: 'Last approved article: ' + date + '. New finance articles appear after source verification and editorial review; this is not a real-time news feed.',
    ko: '마지막 검증·공개 글: ' + date + '. 새로운 금융 글은 출처 검증과 편집 검토 후에만 공개됩니다. 실시간 뉴스가 아닙니다.',
    ja: '最終確認・公開記事: ' + date + '。新しい金融記事は出典確認と編集審査後にのみ公開されます。リアルタイムニュースではありません。',
    zh: '最近一次审核发布: ' + date + '。新金融文章仅在核实来源并完成编辑审核后发布，本站并非实时新闻。',
  };
  return labels[locale];
}
