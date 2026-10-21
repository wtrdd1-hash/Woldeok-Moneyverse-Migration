'use client';

import Link from 'next/link';
import { BookOpen, ExternalLink, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { BlogPost } from '@/app/blog/blog.types';

interface Props {
  readonly initialPosts: readonly BlogPost[];
}

/**
 * Published content remains inspectable during the editorial hold.
 * No button here may claim to generate, approve or publish an unverified
 * financial article until the approved durable editorial workflow exists.
 */
export function AdminBlogClient({ initialPosts }: Props) {
  return (
    <div className="space-y-6">
      <Card className="border-amber-500/40 bg-amber-500/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-400" aria-hidden="true" />
            <CardTitle className="text-lg">자동 발행 일시 중단</CardTitle>
          </div>
          <CardDescription className="text-sm">
            신규 금융 AI 콘텐츠는 검증 및 편집 승인 대기 중입니다.
            승인된 자료 출처, 편집 기록과 영구 발행 영수증이 확보되기 전에는
            관리자 및 스케줄러 발행을 허용하지 않습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>IndexNow 자동 요청 중단</p>
          <p>기존 게시물은 읽기 및 검토만 가능합니다.</p>
        </CardContent>
      </Card>
      <Card className="border-border/60 bg-card/80">
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-sm font-bold">
            <span className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" aria-hidden="true" /> 발행된 블로그 아티클 피드 ({initialPosts.length})
            </span>
            <Link href="/blog" className="inline-flex items-center gap-1 text-xs text-sky-400">
              블로그 허브 바로가기 <ExternalLink className="h-3 w-3" />
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-y border-border/60 bg-muted/40 text-muted-foreground">
                <tr><th className="p-3">제목 / 슬러그</th><th className="p-3">카테고리</th><th className="p-3">발행일시</th><th className="p-3">상태</th></tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {initialPosts.map((post) => (
                  <tr key={post.slug}>
                    <td className="p-3">
                      <Link href={`/blog/${post.slug}`} className="font-semibold text-foreground hover:underline">{post.title}</Link>
                      <div className="text-[10px] text-muted-foreground">/blog/{post.slug}</div>
                    </td>
                    <td className="p-3">{post.categoryLabel}</td>
                    <td className="p-3 whitespace-nowrap">{new Date(post.publishedAt).toLocaleString('ko-KR')}</td>
                    <td className="p-3"><Badge variant="outline">기존 게시물</Badge></td>
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
