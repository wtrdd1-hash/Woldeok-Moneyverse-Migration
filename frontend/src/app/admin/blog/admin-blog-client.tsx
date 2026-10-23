'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  EyeOff,
  Globe2,
  Code2,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { BlogPost, BlogCountry, BlogCategory } from '@/app/blog/blog.types';

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
    readonly country?: string;
    readonly publishedAt: string;
    readonly url: string;
  };
}

const COUNTRY_OPTIONS: ReadonlyArray<{ id: BlogCountry; label: string; flag: string }> = [
  { id: 'KR', label: '대한민국 (KRW)', flag: '🇰🇷' },
  { id: 'US', label: '미국 (USD)', flag: '🇺🇸' },
  { id: 'JP', label: '일본 (JPY)', flag: '🇯🇵' },
  { id: 'VN', label: '베트남 (VND)', flag: '🇻🇳' },
];

export function AdminBlogClient({ initialPosts }: Props) {
  const [posts, setPosts] = useState<readonly BlogPost[]>(initialPosts);
  const [selectedCountry, setSelectedCountry] = useState<BlogCountry>('KR');
  const [selectedCategory, setSelectedCategory] = useState<'ECONOMY' | 'TECH'>('ECONOMY');
  const [loading, setLoading] = useState(false);
  const [actionSlug, setActionSlug] = useState<string | null>(null);
  const [result, setResult] = useState<PublishResult | null>(null);

  // AI 블로그 발행 트리거
  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const targetCategory: BlogCategory =
        selectedCategory === 'TECH' ? 'TECH' : 'WEALTH';

      const res = await fetch('/api/blog/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country: selectedCountry,
          category: targetCategory,
        }),
      });
      const data = (await res.json()) as PublishResult;
      setResult(data);
      if (res.ok && data.success && data.post) {
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
          tags: ['AI칼럼', data.post.categoryLabel, selectedCountry],
          relatedCalculatorHref: '/tools/compound-calculator',
          relatedCalculatorName: '복리 수익 계산기',
          isAiGenerated: true,
          views: 1,
          country: selectedCountry,
          status: 'PUBLISHED',
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

  // 관리자 삭제 및 철회 (소프트 삭제 vs 영구 소거)
  const handleDelete = async (slug: string, purge: boolean) => {
    if (purge && !window.confirm(`[주의] '${slug}' 글을 디스크에서 완전히 영구 삭제하시겠습니까?`)) {
      return;
    }
    setActionSlug(slug);
    try {
      const res = await fetch(`/api/admin/blog/${encodeURIComponent(slug)}?purge=${purge ? 'true' : 'false'}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (purge) {
          setPosts((prev) => prev.filter((p) => p.slug !== slug));
        } else {
          setPosts((prev) =>
            prev.map((p) => (p.slug === slug ? { ...p, status: 'WITHDRAWN' as const } : p))
          );
        }
        setResult({
          success: true,
          message: purge ? '글이 영구 삭제되었습니다.' : '글이 철회(비공개) 처리되었습니다.',
        });
      } else {
        setResult({
          success: false,
          message: data.message || '삭제 실패',
        });
      }
    } catch (err: unknown) {
      setResult({
        success: false,
        message: err instanceof Error ? err.message : '삭제 요청 오류',
      });
    } finally {
      setActionSlug(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* AI 다국어 & 주제 맞춤 관제 카드 */}
      <Card className="border-sky-500/30 bg-sky-950/10">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-sky-400" aria-hidden="true" />
                <CardTitle className="text-lg">AI 블로그 발행 엔진 관제</CardTitle>
                <Badge variant="outline" className="border-emerald-500/50 bg-emerald-500/10 text-emerald-400">
                  발행 엔진 활성화됨
                </Badge>
              </div>
              <CardDescription className="text-sm mt-1 text-slate-300">
                국가별 제도와 실시간 거시경제 및 최신 컴퓨터공학 연구자료(NBER, ArXiv, IEEE, BOK)를 바탕으로 전문 칼럼을 자동 생성합니다.
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
                  AI 분석 및 맞춤 작성 중...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  AI 블로그 즉시 생성 및 발행
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          {/* 타겟 국가 & 주제 선택 컨트롤 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 rounded-lg border border-border/50 bg-card/60 text-xs">
            {/* 국가 선택 */}
            <div className="space-y-1.5">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Globe2 className="h-3.5 w-3.5 text-sky-400" /> 대상 국가 분기:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {COUNTRY_OPTIONS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCountry(c.id)}
                    className={`px-2.5 py-1 rounded text-xs transition-colors border ${
                      selectedCountry === c.id
                        ? 'bg-sky-500/20 border-sky-400 text-sky-200 font-bold'
                        : 'bg-muted/40 border-border text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {c.flag} {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 주제 선택 */}
            <div className="space-y-1.5">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" /> 콘텐츠 도메인:
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('ECONOMY')}
                  className={`flex-1 py-1 px-3 rounded text-xs transition-colors border flex items-center justify-center gap-1.5 ${
                    selectedCategory === 'ECONOMY'
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-bold'
                      : 'bg-muted/40 border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <TrendingUp className="h-3.5 w-3.5" /> 경제 & 금융 분석
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('TECH')}
                  className={`flex-1 py-1 px-3 rounded text-xs transition-colors border flex items-center justify-center gap-1.5 ${
                    selectedCategory === 'TECH'
                      ? 'bg-indigo-500/20 border-indigo-400 text-indigo-200 font-bold'
                      : 'bg-muted/40 border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <Code2 className="h-3.5 w-3.5" /> 핀테크 & 소프트웨어 공학
                </button>
              </div>
            </div>
          </div>

          {/* 작업 결과 피드백 */}
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

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1 text-xs text-muted-foreground border-t border-border/40">
            <div>• 품질 게이트: <strong>GREEN 자동 검증</strong></div>
            <div>• 연구 DB: <strong>ArXiv, NBER, IEEE</strong></div>
            <div>• 자동 주기: <strong>매일 04:00 KST</strong></div>
            <div>• 삭제 정책: <strong>2단계 안전 제어</strong></div>
          </div>
        </CardContent>
      </Card>

      {/* 발행된 아티클 피드 및 관리자 제어 테이블 */}
      <Card className="border-border/60 bg-card/80">
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-sm font-bold">
            <span className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" aria-hidden="true" /> 발행된 블로그 아티클 관리 ({posts.length})
            </span>
            <Link href="/blog" className="inline-flex items-center gap-1 text-xs text-sky-400 hover:underline">
              블로그 피드 바로가기 <ExternalLink className="h-3 w-3" />
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
                  <th className="p-3">국가</th>
                  <th className="p-3">발행일시</th>
                  <th className="p-3">상태</th>
                  <th className="p-3 text-right">관리자 액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {posts.map((post) => {
                  const isWithdrawn = post.status === 'WITHDRAWN';
                  const isProcessing = actionSlug === post.slug;
                  return (
                    <tr key={post.slug} className={`hover:bg-muted/20 ${isWithdrawn ? 'opacity-60 bg-rose-950/10' : ''}`}>
                      <td className="p-3 max-w-xs">
                        <Link
                          href={`/blog/${post.slug}`}
                          className={`font-semibold text-foreground hover:underline line-clamp-1 ${
                            isWithdrawn ? 'line-through text-muted-foreground' : ''
                          }`}
                        >
                          {post.title}
                        </Link>
                        <div className="text-[10px] text-muted-foreground">/blog/{post.slug}</div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="text-[10px]">
                          {post.categoryLabel}
                        </Badge>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="font-mono text-xs">{post.country || 'KR'}</span>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {new Date(post.publishedAt).toLocaleString('ko-KR', {
                          month: 'numeric',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {isWithdrawn ? (
                          <Badge variant="outline" className="border-rose-500/40 text-rose-400 bg-rose-500/10">
                            철회됨 (비공개)
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-sky-500/30 text-sky-400 bg-sky-500/10">
                            정상 게시
                          </Badge>
                        )}
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {!isWithdrawn && (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isProcessing}
                              onClick={() => handleDelete(post.slug, false)}
                              className="h-7 px-2 text-[11px] border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
                            >
                              <EyeOff className="h-3 w-3 mr-1" /> 철회
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isProcessing}
                            onClick={() => handleDelete(post.slug, true)}
                            className="h-7 px-2 text-[11px] border-rose-500/40 text-rose-400 hover:bg-rose-500/20"
                          >
                            <Trash2 className="h-3 w-3 mr-1" /> 영구삭제
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
