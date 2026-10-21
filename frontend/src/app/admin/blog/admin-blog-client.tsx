'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, ExternalLink, Sparkles, Send, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { BlogPost } from '@/app/blog/blog.types';

interface Props {
  readonly initialPosts: readonly BlogPost[];
}

export function AdminBlogClient({ initialPosts }: Props) {
  const [posts, setPosts] = useState<readonly BlogPost[]>(initialPosts);
  const [draft, setDraft] = useState<BlogPost | null>(null);
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // 1. AI 칼럼 초안 생성 요청
  const handleGenerateDraft = async () => {
    setLoadingDraft(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/blog/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'draft' }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.draft) {
        setDraft(data.draft);
        setFeedback({
          type: 'success',
          message: '최신 거시경제 지표 및 공인 출처가 바인딩된 AI 칼럼 초안이 생성되었습니다.',
        });
      } else {
        setFeedback({
          type: 'error',
          message: data.message || '초안 생성에 실패했습니다.',
        });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || '네트워크 오류가 발생했습니다.' });
    } finally {
      setLoadingDraft(false);
    }
  };

  // 2. 1클릭 원터치 승인 발행
  const handlePublish = async () => {
    if (!draft) return;
    setPublishing(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/blog/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'publish', post: draft }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPosts((prev) => [draft, ...prev.filter((p) => p.slug !== draft.slug)]);
        setDraft(null);
        setFeedback({
          type: 'success',
          message: `성공적으로 정식 발행되었습니다! URL: ${data.publishedUrl}`,
        });
      } else {
        setFeedback({
          type: 'error',
          message: data.message || '발행 처리에 실패했습니다.',
        });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || '발행 중 오류가 발생했습니다.' });
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Banner */}
      <Card className="border-indigo-500/40 bg-gradient-to-r from-indigo-950/30 via-slate-900/50 to-background">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-indigo-600 text-white text-xs font-bold">
                  관리자 1클릭 발행 게이트
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">
                  실시간 거시경제 펄스 연동
                </span>
              </div>
              <CardTitle className="text-lg sm:text-xl font-black text-foreground">
                AI 블로그 콘텐츠 검토 및 원터치 발행 관제
              </CardTitle>
              <CardDescription className="text-xs">
                무단 자동 대량 발행은 차단되어 있으며, 최신 거시경제(USD/KRW, S&P 500, KOSPI)와 공식 출처를 바인딩한 후 관리자 1클릭 승인으로 안전하게 즉시 발행합니다.
              </CardDescription>
            </div>

            <Button
              onClick={handleGenerateDraft}
              disabled={loadingDraft || publishing}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5"
            >
              {loadingDraft ? (
                <>
                  <RefreshCw className="size-3.5 animate-spin" />
                  실시간 데이터 분석 중...
                </>
              ) : (
                <>
                  <Sparkles className="size-3.5" />
                  AI 칼럼 초안 생성
                </>
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
            <span className="text-[11px] text-muted-foreground block">발행 정책</span>
            <span className="text-base font-extrabold font-mono text-emerald-400">관리자 1클릭 승인</span>
          </div>
          <div className="p-3 rounded-lg border border-border/60 bg-muted/20">
            <span className="text-[11px] text-muted-foreground block">자동 스케줄러</span>
            <span className="text-xs sm:text-sm font-semibold text-amber-400">안전 가드(503) 작동</span>
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

      {/* Feedback Message */}
      {feedback && (
        <div
          className={`flex items-center gap-2 p-3.5 rounded-lg border text-xs sm:text-sm font-medium ${
            feedback.type === 'success'
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
              : 'border-red-500/40 bg-red-500/10 text-red-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="size-4 shrink-0 text-red-400" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* AI Draft Preview Card */}
      {draft && (
        <Card className="border-indigo-500 bg-card shadow-lg">
          <CardHeader className="border-b border-border/60 pb-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-xs">
                  초안 검토 중 (미발행)
                </Badge>
                <Badge variant="outline" className="text-xs font-mono">
                  {draft.categoryLabel}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDraft(null)}
                  disabled={publishing}
                  className="text-xs text-muted-foreground"
                >
                  취소
                </Button>
                <Button
                  onClick={handlePublish}
                  disabled={publishing}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  {publishing ? (
                    <>
                      <RefreshCw className="size-3.5 animate-spin" />
                      영구 발행 중...
                    </>
                  ) : (
                    <>
                      <Send className="size-3.5" />
                      1클릭 즉시 승인 발행
                    </>
                  )}
                </Button>
              </div>
            </div>
            <CardTitle className="text-base sm:text-lg font-bold text-foreground mt-2">
              {draft.title}
            </CardTitle>
            <CardDescription className="text-xs leading-relaxed text-muted-foreground">
              {draft.excerpt}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-3 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2 rounded border border-border/50 bg-muted/20">
                <span className="text-muted-foreground block text-[10px]">연관 계산기</span>
                <span className="font-semibold text-foreground">{draft.relatedCalculatorName}</span>
              </div>
              <div className="p-2 rounded border border-border/50 bg-muted/20">
                <span className="text-muted-foreground block text-[10px]">연관 주식 종목</span>
                <span className="font-semibold text-foreground">{draft.relatedStockTicker}</span>
              </div>
              <div className="p-2 rounded border border-border/50 bg-muted/20 col-span-2 sm:col-span-1">
                <span className="text-muted-foreground block text-[10px]">슬러그</span>
                <span className="font-mono text-muted-foreground truncate block">/blog/{draft.slug}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {draft.tags.map((tag) => (
                <span key={tag} className="text-[11px] font-mono text-indigo-400 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-800/40">
                  #{tag}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
                  <th className="p-3">상태</th>
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
                      <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-400">
                        정식 발행됨
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
