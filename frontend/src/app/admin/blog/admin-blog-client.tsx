'use client';

import { useState } from 'react';
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
  Loader2,
  PieChart,
  Percent,
  Receipt,
  CandlestickChart,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { BlogPost, BlogCategory, BlogCountry } from '@/app/blog/blog.types';

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
    readonly categoryLabel?: string;
    readonly country?: string;
    readonly publishedAt?: string;
    readonly charCount?: number;
    readonly readTimeMinutes?: number;
    readonly heroImage?: string;
    readonly infographicType?: string;
    readonly url: string;
  };
}

const COUNTRY_OPTIONS: ReadonlyArray<{ id: BlogCountry; label: string; flag: string }> = [
  { id: 'KR', label: '대한민국 (KRW)', flag: '🇰🇷' },
  { id: 'US', label: '미국 (USD)', flag: '🇺🇸' },
  { id: 'JP', label: '일본 (JPY)', flag: '🇯🇵' },
  { id: 'VN', label: '베트남 (VND)', flag: '🇻🇳' },
];

const CATEGORY_OPTIONS: ReadonlyArray<{ id: BlogCategory; label: string; icon: typeof TrendingUp; color: string }> = [
  { id: 'MACRO', label: '거시경제 & 외환', icon: TrendingUp, color: 'text-emerald-400' },
  { id: 'COMPOUND', label: '복리 & 72의법칙', icon: Percent, color: 'text-sky-400' },
  { id: 'WEALTH', label: '자산배분 로드맵', icon: PieChart, color: 'text-amber-400' },
  { id: 'STOCKS', label: '가치평가 & DCA', icon: CandlestickChart, color: 'text-purple-400' },
  { id: 'TAX', label: '비과세 & ISA 절세', icon: Receipt, color: 'text-teal-400' },
  { id: 'TECH', label: '핀테크 & 분산원장', icon: Code2, color: 'text-indigo-400' },
];

export function AdminBlogClient({ initialPosts }: Props) {
  const [posts, setPosts] = useState<readonly BlogPost[]>(initialPosts);
  const [selectedCountry, setSelectedCountry] = useState<BlogCountry>('KR');
  const [selectedCategory, setSelectedCategory] = useState<BlogCategory>('MACRO');
  const [actionSlug, setActionSlug] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [result, setResult] = useState<PublishResult | null>(null);

  // 즉시 생성 및 발행
  const handlePublish = async () => {
    setIsPublishing(true);
    setResult(null);
    try {
      const res = await fetch('/api/blog/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory,
          country: selectedCountry,
        }),
      });
      const data = await res.json().catch(() => ({ success: false, message: 'JSON 파싱 실패' }));
      if (res.ok && data.success && data.post) {
        const catObj = CATEGORY_OPTIONS.find((c) => c.id === selectedCategory);
        const newPost: BlogPost = {
          slug: data.post.slug,
          title: data.post.title,
          excerpt: data.post.excerpt || `${data.post.title}에 관한 7,000자+ 학술·수학적 심층 분석 기사입니다.`,
          content: '',
          category: data.post.category as BlogCategory,
          categoryLabel: catObj?.label || data.post.category,
          author: {
            name: '덕이 (Deoki)',
            role: '월덕 금융연구소 수석 AI 애널리스트',
            badge: 'AI Analyst',
          },
          publishedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          readTimeMinutes: data.post.readTimeMinutes || 15,
          tags: ['거시경제', '복리', '자산배분', '심층분석'],
          status: 'PUBLISHED',
          country: selectedCountry,
          views: 0,
          heroImage: data.post.heroImage,
          infographicType: data.post.infographicType as any,
        };
        setPosts((prev) => [newPost, ...prev.filter((p) => p.slug !== newPost.slug)]);
        setResult({
          success: true,
          message: `[발행 완료] 7,000자+ 심층 분석 기사와 고해상도 인포그래픽이 성공적으로 생성 및 발행되었습니다.`,
          post: data.post,
        });
      } else {
        setResult({
          success: false,
          message: data.message || '발행 생성 실패 (권한 또는 서버 오류)',
        });
      }
    } catch (err: unknown) {
      setResult({
        success: false,
        message: err instanceof Error ? err.message : '요청 전송 중 네트워크 에러 발생',
      });
    } finally {
      setIsPublishing(false);
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
                <Badge variant="outline" className="border-emerald-500/50 bg-emerald-500/10 text-emerald-300">
                  실시간 엔진 가동 중
                </Badge>
              </div>
              <CardDescription className="text-sm mt-1 text-slate-300">
                AI 금융·공학 롱폼 아티클(7,000자+ 및 수치 모델링 공식, 수식 카드, 맞춤 인포그래픽 보장)을 실시간 생성하여 즉시 발행합니다.
              </CardDescription>
            </div>
            <Button
              disabled={isPublishing}
              onClick={handlePublish}
              className="shrink-0 min-h-11 bg-sky-600 hover:bg-sky-500 text-white font-semibold gap-2 shadow-md shadow-sky-600/20 cursor-pointer disabled:cursor-not-allowed"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  7,000자 심층 분석 및 그래픽 빌드 중...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-sky-200" aria-hidden="true" />
                  AI 블로그 즉시 생성 및 발행
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="rounded-lg border border-sky-500/30 bg-sky-950/30 p-3 text-xs sm:text-sm text-sky-200 flex items-center gap-2">
            <span className="text-base">💡</span>
            <span>2시간 주기 자동 크론 및 관리자 즉시 발행이 활성화되어 있습니다. 모든 글은 7,000자 이상의 학술적 심층 분석, 수식 모델링 카드, 고해상도 인포그래픽(1200×630)을 100% 보장합니다.</span>
          </div>

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
                    disabled={isPublishing}
                    className={`px-2.5 py-1 rounded text-xs transition-colors border cursor-pointer ${
                      selectedCountry === c.id
                        ? 'bg-sky-500/20 border-sky-400 text-sky-200 font-bold shadow-xs'
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
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {CATEGORY_OPTIONS.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      disabled={isPublishing}
                      className={`py-1 px-2 rounded text-[11px] transition-colors border flex items-center justify-center gap-1 cursor-pointer ${
                        isSelected
                          ? 'bg-sky-500/20 border-sky-400 text-sky-100 font-bold shadow-xs'
                          : 'bg-muted/40 border-border text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon className={`h-3 w-3 ${cat.color}`} />
                      <span className="truncate">{cat.label}</span>
                    </button>
                  );
                })}
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
            <div>• 품질 게이트: <strong>7,000자+ 검증 완료</strong></div>
            <div>• 수식/인포그래픽: <strong>100% 필수 렌더링</strong></div>
            <div>• 자동 발행: <strong>2시간 주기 활성</strong></div>
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
                              className="h-7 px-2 text-[11px] border-amber-500/30 text-amber-300 hover:bg-amber-500/10 cursor-pointer"
                            >
                              <EyeOff className="h-3 w-3 mr-1" /> 철회
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isProcessing}
                            onClick={() => handleDelete(post.slug, true)}
                            className="h-7 px-2 text-[11px] border-rose-500/40 text-rose-400 hover:bg-rose-500/20 cursor-pointer"
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
