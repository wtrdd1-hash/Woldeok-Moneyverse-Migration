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
  Calculator,
  TrendingUp,
  Tag,
  BookOpen,
  Bot,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { BlogPost } from '../blog.types';

interface Props {
  readonly post: BlogPost;
}

export function BlogPostClient({ post }: Props) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      if (typeof window !== 'undefined') {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        toast.success('칼럼 URL 주소가 클립보드에 복사되었습니다!');
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      toast.error('주소 복사에 실패했습니다.');
    }
  };

  return (
    <article className="max-w-4xl mx-auto space-y-8">
      {/* Top Nav */}
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm" className="text-xs -ml-2 text-muted-foreground hover:text-foreground">
          <Link href="/blog">
            <ArrowLeft className="size-3.5 mr-1.5" /> 블로그 목록으로 돌아가기
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
              <Check className="size-3" /> 복사 완료
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Share2 className="size-3" /> 글 공유하기
            </span>
          )}
        </Button>
      </div>

      {/* Article Header */}
      <div className="space-y-4 border-b border-border/60 pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-indigo-600 text-white text-[11px] font-semibold">
            {post.categoryLabel}
          </Badge>
          <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
            <Calendar className="size-3" /> {new Date(post.publishedAt).toLocaleDateString('ko-KR')}
          </span>
          <span className="text-xs text-muted-foreground font-mono">·</span>
          <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
            <Clock className="size-3" /> 완독 약 {post.readTimeMinutes}분
          </span>
          <span className="text-xs text-muted-foreground font-mono">·</span>
          <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
            <Eye className="size-3" /> 조회 {post.views.toLocaleString()}회
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight leading-tight">
          {post.title}
        </h1>

        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          {post.excerpt}
        </p>

        {/* Author Badge */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold">
              <Bot className="size-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <span>{post.author.name}</span>
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-indigo-500/40 text-indigo-400 bg-indigo-500/10">
                  {post.author.badge}
                </Badge>
              </div>
              <div className="text-[11px] text-muted-foreground">{post.author.role}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Internal Linking High-Converting Banner */}
      <Card className="border-indigo-500/30 bg-gradient-to-r from-indigo-950/30 to-background">
        <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
              <Calculator className="size-3.5" />
              <span>칼럼 속 실전 수치 직접 계산해보기</span>
            </div>
            <p className="text-xs text-muted-foreground">
              본문에서 설명한 공식을 내 자산에 바로 대입하여 무료로 시뮬레이션할 수 있습니다.
            </p>
          </div>
          <Button asChild size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shrink-0">
            <Link href={post.relatedCalculatorHref}>
              {post.relatedCalculatorName} 열기
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Article Body (Markdown Rendering) */}
      <div className="prose prose-invert max-w-none space-y-6 text-foreground/90 text-sm sm:text-base leading-relaxed">
        {post.content.split('\n\n').map((paragraph, idx) => {
          if (paragraph.startsWith('## ')) {
            return (
              <h2 key={idx} className="text-xl sm:text-2xl font-black text-foreground pt-4 pb-1 border-b border-border/50">
                {paragraph.replace('## ', '')}
              </h2>
            );
          }
          if (paragraph.startsWith('### ')) {
            return (
              <h3 key={idx} className="text-base sm:text-lg font-bold text-foreground pt-2">
                {paragraph.replace('### ', '')}
              </h3>
            );
          }
          if (paragraph.startsWith('> ')) {
            return (
              <blockquote key={idx} className="p-3.5 rounded-lg border-l-4 border-indigo-500 bg-muted/30 italic text-muted-foreground my-3">
                {paragraph.replace('> ', '')}
              </blockquote>
            );
          }
          if (paragraph.startsWith('```')) {
            const codeLines = paragraph.replace(/```[a-z]*\n?/g, '').trim();
            return (
              <pre key={idx} className="p-3 rounded-lg bg-zinc-950/80 border border-border/60 text-emerald-400 font-mono text-xs overflow-x-auto my-3">
                <code>{codeLines}</code>
              </pre>
            );
          }
          if (paragraph.startsWith('| ')) {
            // Table
            const rows = paragraph.split('\n').filter((r) => !r.includes('---'));
            return (
              <div key={idx} className="overflow-x-auto my-4 rounded-lg border border-border/60">
                <table className="w-full text-xs text-left">
                  <tbody>
                    {rows.map((row, rIdx) => {
                      const cols = row.split('|').filter(Boolean);
                      const isHeader = rIdx === 0;
                      return (
                        <tr key={rIdx} className={isHeader ? 'bg-muted/50 font-bold border-b border-border' : 'border-b border-border/40'}>
                          {cols.map((col, cIdx) => (
                            <td key={cIdx} className="p-2.5 whitespace-nowrap">
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
          }
          return (
            <p key={idx} className="leading-relaxed text-foreground/80">
              {paragraph}
            </p>
          );
        })}
      </div>

      {/* Tags */}
      <div className="pt-6 border-t border-border/60 space-y-2">
        <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
          <Tag className="size-3.5" /> 관련 검색 태그
        </span>
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map((tag, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs px-2.5 py-1 bg-muted/60 text-muted-foreground">
              #{tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Bottom CTA Card */}
      <Card className="border-border/80 bg-card/60">
        <CardContent className="p-6 text-center space-y-3">
          <Sparkles className="size-6 text-indigo-400 mx-auto" />
          <h3 className="text-base font-bold text-foreground">
            매일 업데이트되는 금융 인사이트를 놓치지 마세요
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            월덕 머니버스는 실시간 복식부기 원장, 가상 주식 거래소, 12대 전문 금융 계산기, 그리고 AI 포트폴리오 진단실을 무료로 제공합니다.
          </p>
          <div className="flex justify-center gap-2 pt-2">
            <Button asChild size="sm" variant="outline" className="text-xs">
              <Link href="/tools">12대 금융 계산기 전체보기</Link>
            </Button>
            <Button asChild size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs">
              <Link href="/advisor">AI 포트폴리오 진단받기</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </article>
  );
}
