'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Eye,
  Share2,
  Check,
  Tag,
  Bot,
  Languages,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { BlogPost } from '../blog.types';
import { blogUrl, blogHubUrl, hasCountryEdition, type BlogLocale } from '../blog-seo';
import { BlogAdBanner } from '@/components/blog/blog-ad-banner';
import { BlogInlineCalculator } from '@/components/blog/blog-inline-calculator';
import { BlogRelatedEcosystem } from '@/components/blog/blog-related-ecosystem';
import { BlogConversionBanner } from '@/components/blog/blog-conversion-banner';
import { BlogInfographicCard } from '@/components/blog/blog-infographic-card';

interface Props {
  readonly post: BlogPost;
  readonly locale: BlogLocale;
}

const LABELS = {
  ko: { back:'블로그 목록으로 돌아가기', share:'글 공유하기', copied:'복사 완료', minutes:'완독 약', unit:'분', views:'조회', viewUnit:'회', tags:'관련 검색 키워드', illustration:'금융 교육용 삽화' },
  en: { back:'Back to articles', share:'Share article', copied:'Copied', minutes:'Read time', unit:'min', views:'Views', viewUnit:'', tags:'Related topics', illustration:'Educational illustration' },
  ja: { back:'記事一覧に戻る', share:'記事を共有', copied:'コピー済み', minutes:'読了目安', unit:'分', views:'閲覧', viewUnit:'回', tags:'関連キーワード', illustration:'教育用イラスト' },
  zh: { back:'返回文章列表', share:'分享文章', copied:'已复制', minutes:'阅读时间', unit:'分钟', views:'浏览', viewUnit:'次', tags:'相关主题', illustration:'教学插图' },
} as const;

export function BlogPostClient({ post, locale }: Props) {
  const labels = LABELS[locale];
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      if (typeof window !== 'undefined') {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        toast.success(
          locale === 'en'
            ? 'Article URL copied to clipboard!'
            : locale === 'ja'
            ? '記事のURLがクリップボードにコピーされました！'
            : locale === 'zh'
            ? '文章链接已复制到剪贴板！'
            : '칼럼 URL 주소가 클립보드에 복사되었습니다!'
        );
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      toast.error('주소 복사에 실패했습니다.');
    }
  };

  const activeTitle = (locale !== 'ko' && post.translations?.[locale]?.title) || post.title;
  const activeExcerpt = (locale !== 'ko' && post.translations?.[locale]?.excerpt) || post.excerpt;
  const activeContent = (locale !== 'ko' && post.translations?.[locale]?.content) || post.content;
  const activeTags = (locale !== 'ko' && post.translations?.[locale]?.tags) || post.tags;

  const paragraphs = activeContent.split('\n\n');

  return (
    <article className="max-w-4xl mx-auto space-y-8">
      {/* Top Nav */}
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm" className="text-xs -ml-2 text-muted-foreground hover:text-foreground">
          <Link href={blogHubUrl(locale).replace("https://easy-scraping.com", "")}>
            <ArrowLeft className="size-3.5 mr-1.5" /> {labels.back}
          </Link>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="text-xs h-8 border-border/60 hover:bg-muted"
        >
          {copied ? (
            <span className="flex items-center gap-1 text-emerald-400">
              <Check className="size-3" /> {labels.copied}
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Share2 className="size-3" /> {labels.share}
            </span>
          )}
        </Button>
      </div>

      {/* Locale selection changes the public URL so crawlers receive the same content as readers. */}
      <nav aria-label="Article language" className="flex flex-wrap items-center gap-2 p-2 rounded-xl border border-border/80">
        <Languages className="size-4 text-emerald-400" aria-hidden="true" />
        {(['en', 'ko', 'ja', 'zh'] as const).filter(l => hasCountryEdition(post,l)).map(l => (
          <Link key={l} href={blogUrl(post.slug,l).replace('https://easy-scraping.com','')}
            hrefLang={{ en:'en-US',ko:'ko-KR',ja:'ja-JP',zh:'zh-CN' }[l]}
            aria-current={locale === l ? 'page' : undefined}
            className={locale === l ? 'px-2.5 py-1 text-xs rounded-lg font-bold bg-emerald-500 text-black' : 'px-2.5 py-1 text-xs rounded-lg text-muted-foreground hover:bg-muted'}>
            {{ ko:'🇰🇷 한국어',en:'🇺🇸 English',ja:'🇯🇵 日本語',zh:'🇨🇳 中文' }[l]}
          </Link>
        ))}
      </nav>

      {/* 1. 상단 리더보드 수익화 광고 슬롯 */}
      <BlogAdBanner position="top" />

      {/* Article Header */}
      <div className="space-y-4 border-b border-border/60 pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-blue-600 text-white text-[11px] font-semibold">
            {post.categoryLabel}
          </Badge>
          <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
            <Calendar className="size-3" /> {new Date(post.publishedAt).toLocaleDateString(({ko:'ko-KR',en:'en-US',ja:'ja-JP',zh:'zh-CN'})[locale])}
          </span>
          <span className="text-xs text-muted-foreground font-mono">·</span>
          <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
            <Clock className="size-3" /> {labels.minutes} {post.readTimeMinutes}{labels.unit}
          </span>
          <span className="text-xs text-muted-foreground font-mono">·</span>
          <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
            <Eye className="size-3" /> {labels.views} {post.views.toLocaleString()} {labels.viewUnit}
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight leading-tight">
          {activeTitle}
        </h1>

        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          {activeExcerpt}
        </p>

        {/* Author Badge */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold">
              <Bot className="size-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <span>{post.author.name}</span>
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-blue-500/40 text-blue-400 bg-blue-500/10">
                  {post.author.badge}
                </Badge>
              </div>
              <div className="text-[11px] text-muted-foreground">{post.author.role}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 🖼️ 대표 고해상도 인포그래픽 히어로 이미지 (Hero Graphic Asset) */}
      {post.heroImage && (
        <div className="rounded-2xl overflow-hidden border border-border/70 shadow-lg bg-card/60 backdrop-blur-xs">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.heroImage}
            alt={activeTitle}
            className="w-full h-auto aspect-[1200/630] object-cover"
            loading="eager"
          />
          <div className="px-4 py-2 bg-muted/40 border-t border-border/40 text-[11px] text-muted-foreground font-mono flex items-center justify-between">
            <span>📊 {activeTitle} — {labels.illustration}</span>
            <span className="text-emerald-400 font-bold">Illustration · not live data</span>
          </div>
        </div>
      )}

      {/* 📊 수학적 금융 인포그래픽 시각화 배너 (선형 원금 대비 복리 기하급수 성장 곡선) */}
      {post.infographicType && <BlogInfographicCard type={post.infographicType} currentLocale={locale} />}

      {/* Article Body (Markdown Rendering with Injected Interactive Widgets & Ads) */}
      <div className="prose prose-invert max-w-none space-y-6 text-foreground/90 text-sm sm:text-base leading-relaxed">
        {paragraphs.map((paragraph, idx) => {
          let renderedElement: React.ReactNode = null;

          if (paragraph.startsWith('## ')) {
            renderedElement = (
              <h2 key={`h2-${idx}`} className="text-xl sm:text-2xl font-black text-foreground pt-4 pb-1 border-b border-border/50">
                {paragraph.replace('## ', '')}
              </h2>
            );
          } else if (paragraph.startsWith('### ')) {
            renderedElement = (
              <h3 key={`h3-${idx}`} className="text-base sm:text-lg font-bold text-foreground pt-2">
                {paragraph.replace('### ', '')}
              </h3>
            );
          } else if (paragraph.startsWith('> ')) {
            renderedElement = (
              <blockquote key={`bq-${idx}`} className="p-3.5 rounded-lg border-l-4 border-blue-500 bg-muted/30 italic text-muted-foreground my-3">
                {paragraph.replace('> ', '')}
              </blockquote>
            );
          } else if (paragraph.startsWith('```')) {
            const codeLines = paragraph.replace(/```[a-z]*\n?/g, '').trim();
            renderedElement = (
              <pre key={`code-${idx}`} className="p-3 rounded-lg bg-zinc-950/80 border border-border/60 text-emerald-400 font-mono text-xs overflow-x-auto my-3">
                <code>{codeLines}</code>
              </pre>
            );
          } else if (paragraph.startsWith('| ')) {
            const rows = paragraph.split('\n').filter((r) => !r.includes('---'));
            renderedElement = (
              <div key={`table-${idx}`} className="overflow-x-auto my-4 rounded-xl border border-border/60">
                <table className="w-full text-xs text-left">
                  <tbody>
                    {rows.map((row, rIdx) => {
                      const cols = row.split('|').filter(Boolean);
                      const isHeader = rIdx === 0;
                      return (
                        <tr key={rIdx} className={isHeader ? 'bg-muted/60 font-bold border-b border-border' : 'border-b border-border/40 hover:bg-muted/20'}>
                          {cols.map((col, cIdx) => (
                            <td key={cIdx} className="p-3 whitespace-nowrap">
                              {col.trim()}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          } else if (paragraph.startsWith('![') && paragraph.includes('](')) {
            const match = paragraph.match(/^!\[(.*?)\]\((.*?)\)$/);
            if (match) {
              const [, altText, imgSrc] = match;
              renderedElement = (
                <figure key={`img-${idx}`} className="my-6 rounded-2xl overflow-hidden border border-border/70 shadow-md bg-card/50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imgSrc} alt={altText || activeTitle} className="w-full h-auto aspect-[1200/630] object-cover" loading="lazy" />
                  {altText && (
                    <figcaption className="px-4 py-2 bg-muted/30 border-t border-border/40 text-[11px] text-muted-foreground font-mono flex items-center justify-between">
                      <span>🖼️ {altText}</span>
                      <span className="text-emerald-400 font-bold">{labels.illustration}</span>
                    </figcaption>
                  )}
                </figure>
              );
            } else {
              renderedElement = (
                <p key={`p-${idx}`} className="leading-relaxed text-foreground/80">
                  {paragraph}
                </p>
              );
            }
          } else {
            renderedElement = (
              <p key={`p-${idx}`} className="leading-relaxed text-foreground/80">
                {paragraph}
              </p>
            );
          }

          return (
            <React.Fragment key={`block-${idx}`}>
              {renderedElement}

              {/* 본문 중간 인터랙티브 미니 계산기 위젯 삽입 (2번째 단락 이후) */}
              {idx === 1 && (
                <BlogInlineCalculator
                  fullCalculatorHref={post.relatedCalculatorHref}
                  fullCalculatorName={post.relatedCalculatorName}
                />
              )}

              {/* 본문 중간 인피드 네이티브 광고 슬롯 삽입 (4번째 단락 이후) */}
              {idx === 4 && <BlogAdBanner position="in-feed" />}
            </React.Fragment>
          );
        })}
      </div>

      {/* 2. 본문 하단 매칭형 수익화 광고 슬롯 */}
      <BlogAdBanner position="bottom" />

      {/* Tags */}
      <div className="pt-4 border-t border-border/60 space-y-2">
        <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
          <Tag className="size-3.5" /> {labels.tags}
        </span>
        <div className="flex flex-wrap gap-1.5">
          {activeTags.map((tag, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs px-2.5 py-1 bg-muted/60 text-muted-foreground font-mono">
              #{tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* 3. 본문 맞춤형 머니버스 생태계 3대 도구 및 가상 주식 퀵 큐레이션 */}
      <BlogRelatedEcosystem
        relatedCalculatorHref={post.relatedCalculatorHref}
        relatedCalculatorName={post.relatedCalculatorName}
        relatedStockTicker={post.relatedStockTicker}
        category={post.category}
      />

      {/* 4. 신규 가입 웰컴 지원금(10,000 WLD + 복권) 및 AI 어드바이저 덕이 진단실 고전환 락인 배너 */}
      <BlogConversionBanner />
    </article>
  );
}
