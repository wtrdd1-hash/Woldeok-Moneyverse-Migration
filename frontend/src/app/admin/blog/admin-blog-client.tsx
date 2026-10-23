'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, ExternalLink, Sparkles, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { BlogPost } from '@/app/blog/blog.types';

interface Props {
  readonly initialPosts: readonly BlogPost[];
}

interface PublishResult {
  readonly success: boolean;
  readonly message?: string;
  readonly post?: {
    readonly slug: string;
    readonly title: string;
    readonly category: string;
    readonly categoryLabel: string;
    readonly publishedAt: string;
    readonly url: string;
  };
}

export function AdminBlogClient({ initialPosts }: Props) {
  const [posts, setPosts] = useState<readonly BlogPost[]>(initialPosts);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PublishResult | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/blog/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = (await res.json()) as PublishResult;
      setResult(data);
      if (res.ok && data.success && data.post) {
        // Optimistically add the new post to the top of the feed
        const newPost: BlogPost = {
          slug: data.post.slug,
          title: data.post.title,
          excerpt: data.post.title,
          content: '',
          category: data.post.category as any,
          categoryLabel: data.post.categoryLabel,
          author: { name: '덕이 (Deoki)', role: '월덕 금융연구소 수석 AI 애널리스트', badge: 'AI Analyst' },
          publishedAt: data.post.publishedAt,
          updatedAt: data.post.publishedAt,
          readTimeMinutes: 6,
          tags: ['AI금융칼럼', data.post.categoryLabel],
          relatedCalculatorHref: '/tools/compound-calculator',
          relatedCalculatorName: '복리 수익 계산기',
          isAiGenerated: true,
          views: 1,
        };
        setPosts((prev) => [newPost, ...prev]);
      }
    } catch (err: unknown) {
      setResult({
        success: false,
        message: err instanceof Error ? err.message : '네트워크 요청 실패',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 관제 및 즉시 발행 액션 카드 */}
      <Card className="border-sky-500/30 bg-sky-950/10">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-sky-400" aria-hidden="true" />
              <CardTitle className="text-lg">AI 블로그 발행 엔진 관제</CardTitle>
              <Badge variant="outline" className="border-emerald-500/50 bg-emerald-500/10 text-emerald-400">
                발행 엔진 활성화됨
              </Badge>
            </div>
            <CardDescription className="text-sm mt-1 text-slate-300">
              실시간 거시경제 지표(FRED, ECOS, Alpha Vantage) 및 핀테크 금융공학 이론을 근거로 고품질 SEO 아티클을 즉시 생성·발행합니다.
            </CardDescription>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="shrink-0 bg-sky-600 hover:bg-sky-500 text-white font-semibold gap-2 shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                AI 분석 및 글 작성 중...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                AI 블로그 즉시 생성 및 발행
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {/* 발행 결과 알림 피드백 */}
          {result && (
            <div
              className={`p-3 rounded-lg flex items-start gap-3 text-sm ${
                result.success
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
              }`}
            >
              {result.success ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 shrink-0 text-rose-400 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="font-semibold">{result.message}</div>
                {result.post && (
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs opacity-80">발행 글:</span>
                    <Link
                      href={result.post.url}
                      target="_blank"
                      className="font-medium underline hover:text-white flex items-center gap-1"
                    >
                      {result.post.title}
                      <ExternalLink className="h-3 w-3 inline" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-xs text-muted-foreground border-t border-border/40">
            <div>• 품질 게이트: <strong>GREEN 자동 검증</strong></div>
            <div>• 데이터 출처: <strong>실시간 거시경제 API</strong></div>
            <div>• 영구 보관: <strong>Durable Shared JSON Store</strong></div>
          </div>
        </CardContent>
      </Card>

      {/* 발행된 블로그 아티클 피드 */}
      <Card className="border-border/60 bg-card/80">
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-sm font-bold">
            <span className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" aria-hidden="true" /> 발행된 블로그 아티클 피드 ({posts.length})
            </span>
            <Link href="/blog" className="inline-flex items-center gap-1 text-xs text-sky-400 hover:underline">
              블로그 허브 바로가기 <ExternalLink className="h-3 w-3" />
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-y border-border/60 bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="p-3">제목 / 슬러그</th>
                  <th className="p-3">카테고리</th>
                  <th className="p-3">발행일시</th>
                  <th className="p-3">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {posts.map((post) => (
                  <tr key={post.slug} className="hover:bg-muted/20">
                    <td className="p-3">
                      <Link href={`/blog/${post.slug}`} className="font-semibold text-foreground hover:underline">
                        {post.title}
                      </Link>
                      <div className="text-[10px] text-muted-foreground">/blog/{post.slug}</div>
                    </td>
                    <td className="p-3">{post.categoryLabel}</td>
                    <td className="p-3 whitespace-nowrap">{new Date(post.publishedAt).toLocaleString('ko-KR')}</td>
                    <td className="p-3">
                      <Badge variant="outline" className="border-sky-500/30 text-sky-400">
                        발행됨
                      </Badge>
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
