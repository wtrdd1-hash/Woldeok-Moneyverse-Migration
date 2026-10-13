'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  RefreshCw,
  BookOpen,
  Send,
  ExternalLink,
  CheckCircle2,
  Clock,
  Eye,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { BlogPost } from '@/app/blog/blog.types';

interface Props {
  readonly initialPosts: readonly BlogPost[];
}

export function AdminBlogClient({ initialPosts }: Props) {
  const [posts, setPosts] = useState<BlogPost[]>([...initialPosts]);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/blog/generate', {
        method: 'POST',
      });
      const data = await res.json();

      if (res.ok && data.success && data.post) {
        setPosts((prev) => [data.post, ...prev]);
        toast.success('신규 AI 블로그 글이 발행되었습니다!', {
          description: `IndexNow 핑 전송 완료 | ${data.post.title}`,
        });
      } else {
        toast.error('AI 블로그 글 생성 실패', {
          description: data.error || '생성 엔진 상태를 확인해 주세요.',
        });
      }
    } catch {
      toast.error('네트워크 오류가 발생했습니다.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Banner */}
      <Card className="border-indigo-500/40 bg-gradient-to-r from-indigo-950/40 to-background">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-indigo-600 text-white text-xs font-bold">
                  SEO 자동화 엔진
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">
                  매일 09:00 KST 자동 스케줄 가동 중
                </span>
              </div>
              <CardTitle className="text-lg sm:text-xl font-black text-foreground">
                내부 AI 일일 금융 블로그 자동 집필 & 실시간 IndexNow 관제
              </CardTitle>
              <CardDescription className="text-xs">
                5대 고수익 롱테일 키워드 풀에서 주제를 자동 선별하여 고품질 마크다운 아티클을 생성하고 검색엔진 봇에 색인을 요청합니다.
              </CardDescription>
            </div>

            <Button
              variant="default"
              size="sm"
              onClick={handleGenerate}
              disabled={generating}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 shrink-0 shadow-md cursor-pointer"
            >
              {generating ? (
                <span className="flex items-center gap-1.5">
                  <RefreshCw className="size-3.5 animate-spin" /> AI 글 집필 및 색인 요청 중...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Zap className="size-3.5" /> ⚡ AI 블로그 아티클 1편 즉시 생성
                </span>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-0">
          <div className="p-3 rounded-lg border border-border/60 bg-muted/20">
            <span className="text-[11px] text-muted-foreground block">총 발행 포스트</span>
            <span className="text-base font-extrabold font-mono text-foreground">{posts.length}편</span>
          </div>
          <div className="p-3 rounded-lg border border-border/60 bg-muted/20">
            <span className="text-[11px] text-muted-foreground block">발행 주기</span>
            <span className="text-base font-extrabold font-mono text-indigo-400">1일 1편 (09:00 KST)</span>
          </div>
          <div className="p-3 rounded-lg border border-border/60 bg-muted/20">
            <span className="text-[11px] text-muted-foreground block">검색엔진 색인</span>
            <span className="text-base font-extrabold font-mono text-emerald-400">IndexNow 활성</span>
          </div>
          <div className="p-3 rounded-lg border border-border/60 bg-muted/20">
            <span className="text-[11px] text-muted-foreground block">전용 사이트맵</span>
            <Link
              href="/sitemap-blog.xml"
              target="_blank"
              className="text-xs font-semibold text-sky-400 hover:underline flex items-center gap-1 mt-1 font-mono"
            >
              /sitemap-blog.xml <ExternalLink className="size-3" />
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Post Table */}
      <Card className="border-border/60 bg-card/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-foreground flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="size-4 text-indigo-400" />
              <span>발행된 블로그 아티클 피드</span>
            </div>
            <Button asChild variant="outline" size="sm" className="text-xs h-7">
              <Link href="/blog" target="_blank">
                블로그 허브 바로가기 <ExternalLink className="size-3 ml-1" />
              </Link>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 text-muted-foreground border-y border-border/60 font-semibold">
                <tr>
                  <th className="p-3">제목 / 슬러그</th>
                  <th className="p-3">카테고리</th>
                  <th className="p-3">연관 계산기</th>
                  <th className="p-3">발행일시</th>
                  <th className="p-3 text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {posts.map((post) => (
                  <tr key={post.slug} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3 max-w-md">
                      <div className="font-bold text-foreground line-clamp-1">{post.title}</div>
                      <div className="font-mono text-[10px] text-muted-foreground mt-0.5">
                        /blog/{post.slug}
                      </div>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <Badge variant="outline" className="text-[10px]">
                        {post.categoryLabel}
                      </Badge>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="font-medium text-indigo-400">
                        {post.relatedCalculatorName}
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap font-mono text-muted-foreground text-[11px]">
                      {new Date(post.publishedAt).toLocaleString('ko-KR')}
                    </td>
                    <td className="p-3 whitespace-nowrap text-right">
                      <Button asChild size="sm" variant="ghost" className="h-7 text-xs text-indigo-400 hover:text-indigo-300">
                        <Link href={`/blog/${post.slug}`} target="_blank">
                          보기 <ExternalLink className="size-3 ml-1" />
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
