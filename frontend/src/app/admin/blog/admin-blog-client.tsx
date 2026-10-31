'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  BookOpen,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Trash2,
  EyeOff,
  Globe2,
  Code2,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { BlogPost, BlogCountry } from '@/app/blog/blog.types';

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
  { id: 'CN', label: '중국 (CNY)', flag: '🇨🇳' },
];

export function AdminBlogClient({ initialPosts }: Props) {
  const [posts, setPosts] = useState<readonly BlogPost[]>(initialPosts);
  const [selectedCountry, setSelectedCountry] = useState<BlogCountry>('KR');
  const [selectedCategory, setSelectedCategory] = useState<'ECONOMY' | 'TECH'>('ECONOMY');
  const [actionSlug, setActionSlug] = useState<string | null>(null);
  const [result, setResult] = useState<PublishResult | null>(null);
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      router.refresh();
      await new Promise((resolve) => setTimeout(resolve, 600));
      toast.success('블로그 게시물 및 발행 관제 데이터가 최신으로 동기화되었습니다.');
    } catch {
      toast.error('블로그 데이터 갱신에 실패했습니다.');
    } finally {
      setIsRefreshing(false);
    }
  };

  // 관리자 삭제 및 철회 (소프트 삭제 vs 영구 소거)
  const handleDelete = async (slug: string, purge: boolean) => {
    if (purge && !window.confirm(
      posts.find((post) => post.slug === slug)?.verificationReceipt
        ? `[주의] '${slug}' 글을 공개 목록에서 삭제하고 복구 불가 상태로 변경합니다. 감사 영수증은 보존됩니다. 계속하시겠습니까?`
        : `[주의] '${slug}' 글을 디스크에서 완전히 영구 삭제하시겠습니까?`
    )) {
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
          message: purge
            ? (posts.find((post)=>post.slug===slug)?.verificationReceipt
              ? '공개 게시물이 삭제 처리되었습니다. 감사 기록은 보존됩니다.' : '글이 영구 삭제되었습니다.')
            : '글이 철회(비공개) 처리되었습니다.',
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
                <Badge variant="outline" className="border-amber-500/50 bg-amber-500/10 text-amber-300">
                  품질 검증 기반 · 서버 상태 확인 필요
                </Badge>
              </div>
              <CardDescription className="text-sm mt-1 text-slate-300">
                사람의 사전·사후 승인을 요구하지 않습니다. 국가별 공식 출처·독창성·언어 검증을 통과한 글만 서버 스케줄러가 공개할 수 있으며, 실제 자동발행은 서버 스위치와 배포 상태에 따릅니다.
              </CardDescription>
            </div>
            <Button
              disabled
              aria-describedby="blog-editorial-hold"
              className="shrink-0 min-h-11 bg-slate-700 text-slate-200 font-semibold gap-2"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              AI 블로그 즉시 생성 및 발행
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <p id="blog-editorial-hold" role="status" className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200">
            검증 미통과 원고는 게시하지 않습니다. 이 화면의 수동 즉시 생성은 아직 제공하지 않으며, 기존에 게시한 글의 비공개·삭제는 관리자만 수행합니다.
          </p>
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
                    disabled
                    aria-describedby="blog-editorial-hold"
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
                  disabled
                  aria-describedby="blog-editorial-hold"
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
                  disabled
                  aria-describedby="blog-editorial-hold"
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
            <div>• 품질 게이트: <strong>독립 출처·언어·중복 검사</strong></div>
            <div>• 출처 검증: <strong>공식 출처 영수증 필수</strong></div>
            <div>• 자동 발행: <strong>서버 스케줄/스위치 상태 별도 확인</strong></div>
            <div>• 삭제 정책: <strong>관리자 명시적 조치만 허용</strong></div>
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
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                disabled={isRefreshing}
                className="h-7 px-2.5 text-xs gap-1 border-border/80"
              >
                <RefreshCw className={`size-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                새로고침
              </Button>
              <Link href="/blog" className="inline-flex items-center gap-1 text-xs text-sky-400 hover:underline ml-1">
                블로그 피드 바로가기 <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
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
