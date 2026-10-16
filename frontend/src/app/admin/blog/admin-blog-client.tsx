'use client';

import Link from 'next/link';
import { BookOpen, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { BlogPost } from '@/app/blog/blog.types';

interface Props {
  readonly initialPosts: readonly BlogPost[];
}

export function AdminBlogClient({ initialPosts }: Props) {
  const posts = initialPosts;

  return (
    <div className="space-y-6">
      {/* Control Banner */}
      <Card className="border-amber-500/40 bg-gradient-to-r from-amber-950/30 to-background">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-indigo-600 text-white text-xs font-bold">
                  편집 검증 보류
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">
                  자동 발행 일시 중단
                </span>
              </div>
              <CardTitle className="text-lg sm:text-xl font-black text-foreground">
                AI 블로그 콘텐츠 검토 및 SEO 현황
              </CardTitle>
              <CardDescription className="text-xs">
                기존 AI 생성 글에 대한 출처·수치·중복 콘텐츠 검토가 완료될 때까지 신규 자동 발행과 해당 글의 IndexNow 요청은 중단되어 있습니다.
              </CardDescription>
            </div>

            <Button variant="outline" size="sm" disabled className="text-xs h-auto min-h-9 whitespace-normal text-left">
              검증 및 편집 승인 대기
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-0">
          <div className="p-3 rounded-lg border border-border/60 bg-muted/20">
            <span className="text-[11px] text-muted-foreground block">총 발행 포스트</span>
            <span className="text-base font-extrabold font-mono text-foreground">{posts.length}편</span>
          </div>
          <div className="p-3 rounded-lg border border-border/60 bg-muted/20">
            <span className="text-[11px] text-muted-foreground block">자동 발행</span>
            <span className="text-base font-extrabold font-mono text-indigo-400">검증 완료 전 중단</span>
          </div>
          <div className="p-3 rounded-lg border border-border/60 bg-muted/20">
            <span className="text-[11px] text-muted-foreground block">검색엔진 색인</span>
            <span className="text-xs sm:text-sm font-semibold text-amber-400">IndexNow 자동 요청 중단</span>
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
                  <th className="p-3">검토 상태</th>
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
                    <td className="p-3 whitespace-nowrap">
                      <Badge variant="outline" className="text-[10px]">
                        {post.isAiGenerated ? 'AI 생성 · 사실 검증 필요' : '편집 콘텐츠'}
                      </Badge>
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
