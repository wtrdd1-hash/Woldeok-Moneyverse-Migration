'use client';

import { useEffect, useState } from 'react';
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

interface PublisherStatus {
  success: boolean;
  automaticEnabled: boolean;
  manualEnabled: boolean;
  modelVerified: boolean;
  verifiedPublishedCount: number;
  nextSlot: { country: BlogCountry; topic: string; periodKey: string } | null;
  reason: string;
}

function publisherReason(status: PublisherStatus): string {
  if (!status.modelVerified) return 'AI 원고 생성·검증 시험 미통과. 검증 없는 글은 발행하지 않습니다.';
  if (!status.automaticEnabled) return '자동 발행 스케줄러가 운영에서 비활성화되어 있습니다.';
  return '검증형 2시간 자동 발행 스케줄이 설정돼 있습니다.';
}

export function AdminBlogClient({ initialPosts }: Props) {
  const [posts, setPosts] = useState<readonly BlogPost[]>(initialPosts);
  const [publisher, setPublisher] = useState<PublisherStatus | null>(null);
  const [publisherLoading, setPublisherLoading] = useState(false);
  const [publisherError, setPublisherError] = useState<string | null>(null);
  const [actionSlug, setActionSlug] = useState<string | null>(null);
  const [result, setResult] = useState<PublishResult | null>(null);

  const refreshPublisherStatus = async () => {
    setPublisherLoading(true);
    setPublisherError(null);
    try {
      const response = await fetch('/api/admin/blog/publisher-status', {cache:'no-store'});
      if (!response.ok) throw new Error('PUBLISHER_STATUS_UNAVAILABLE');
      const data = await response.json() as PublisherStatus;
      if (!data.success || typeof data.automaticEnabled !== 'boolean'
          || typeof data.modelVerified !== 'boolean') throw new Error('INVALID_PUBLISHER_STATUS');
      setPublisher(data);
    } catch {
      setPublisher(null);
      setPublisherError('발행 서버 상태 조회 실패. 정상 동작으로 간주하지 않습니다.');
    } finally {
      setPublisherLoading(false);
    }
  };

  useEffect(() => { void refreshPublisherStatus(); }, []);

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
      {/* Server-verified operational status, no inert fake publishing CTA. */}
      <Card className="min-w-0 border-sky-500/30 bg-sky-950/10">
        <CardHeader className="min-w-0">
          <div className="flex min-w-0 flex-col items-stretch gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex min-w-0 flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                <div className="flex min-w-0 items-start gap-2">
                  <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-sky-400" aria-hidden="true" />
                  <CardTitle className="min-w-0 text-base font-bold leading-snug sm:text-lg">
                    AI 블로그 발행 엔진 관제
                  </CardTitle>
                </div>
                <Badge variant="outline" className="max-w-full whitespace-normal break-keep border-amber-500/50 bg-amber-500/10 px-2.5 py-1 text-xs leading-5 text-amber-300">
                  {publisher?.automaticEnabled ? '자동 발행 설정됨' : '자동 발행 검증 대기'}
                </Badge>
              </div>
              <CardDescription className="text-sm leading-relaxed text-slate-300">
                공식 출처·독창성·원어 검증을 통과한 글만 공개합니다. 자동 발행과 관리자 즉시 생성은 별도 기능이며, 실제 서버 상태를 아래에서 확인할 수 있습니다.
              </CardDescription>
            </div>
            <Button
              type="button"
              onClick={() => void refreshPublisherStatus()}
              disabled={publisherLoading}
              className="min-h-11 w-full shrink-0 whitespace-normal bg-sky-700 text-white hover:bg-sky-600 sm:w-auto"
              aria-label="블로그 발행 서버 상태 새로고침"
            >
              <Sparkles className="mr-2 h-4 w-4 shrink-0" aria-hidden="true" />
              {publisherLoading ? '서버 상태 확인 중…' : '발행 서버 상태 새로고침'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="min-w-0 space-y-4 pt-0">
          <div role="status" aria-live="polite" className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm leading-relaxed text-amber-200">
            {publisherError ?? (publisher ? publisherReason(publisher) : '발행 서버의 실제 상태를 확인하고 있습니다.')}
            {publisher && (
              <p className="mt-2 text-xs text-slate-300">
                관리자 즉시 생성: {publisher.manualEnabled ? '사용 가능' : '미구현'} ·
                검증형 공개 글: {publisher.verifiedPublishedCount}건 ·
                다음 국가/주제 회차: {publisher.nextSlot ? `${publisher.nextSlot.country} / ${publisher.nextSlot.topic} (${publisher.nextSlot.periodKey})` : '확인 불가'}
              </p>
            )}
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            국가·주제 순환: 한국·미국·일본·중국 / 경제·코딩·컴퓨터.
            2시간 자동 발행은 검증형 모델과 서버 스케줄이 준비된 경우에만 실행됩니다.
            검증 실패 글은 자동 발행하지 않으며 공개 글을 임의로 철회하지 않습니다.
          </p>
          <div className="grid grid-cols-1 gap-2 border-t border-border/40 pt-3 text-xs text-muted-foreground sm:grid-cols-2">
            <div>• 출처 검증: <strong>공식 원문과 중복·언어 검사</strong></div>
            <div>• 게시 기준: <strong>검증형 DB 발행 영수증 필수</strong></div>
            <div>• 즉시 생성: <strong>안전한 관리자 생성 API 구현 전 미제공</strong></div>
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
