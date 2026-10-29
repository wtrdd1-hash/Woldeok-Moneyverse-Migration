'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, ExternalLink, Sparkles, AlertCircle, Trash2, EyeOff, Loader2, FileText, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { BlogPost } from '@/app/blog/blog.types';

interface Props {
  readonly initialPosts: readonly BlogPost[];
}

interface PublisherStatus {
  readonly success: true;
  readonly automaticEnabled: boolean;
  readonly manualEnabled: boolean;
  readonly modelVerified: boolean;
  readonly verifiedPublishedCount?: number;
  readonly reason?: string;
}

export function AdminBlogClient({ initialPosts }: Props) {
  const [posts, setPosts] = useState<readonly BlogPost[]>(initialPosts);
  const [actionSlug, setActionSlug] = useState<string | null>(null);
  const [result, setResult] = useState<{success:boolean; message:string} | null>(null);
  const [publisherStatus, setPublisherStatus] = useState<PublisherStatus | null>(null);
  const [statusError, setStatusError] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const refreshPublisherStatus = useCallback(async (signal?: AbortSignal) => {
    setStatusLoading(true);
    setStatusError(false);
    try {
      const response = await fetch('/api/admin/blog/publisher-status', { cache: 'no-store', ...(signal ? { signal } : {}) });
      const payload: unknown = await response.json();
      if (!response.ok || !payload || typeof payload !== 'object' ||
        (payload as Partial<PublisherStatus>).success !== true ||
        typeof (payload as Partial<PublisherStatus>).automaticEnabled !== 'boolean' ||
        typeof (payload as Partial<PublisherStatus>).modelVerified !== 'boolean') {
        throw new Error('Unverified publisher status');
      }
      if (!signal?.aborted) setPublisherStatus(payload as PublisherStatus);
    } catch {
      if (!signal?.aborted) {
        setPublisherStatus(null);
        setStatusError(true);
      }
    } finally {
      if (!signal?.aborted) setStatusLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void refreshPublisherStatus(controller.signal);
    return () => controller.abort();
  }, [refreshPublisherStatus]);

  // Moderation remains a separate administrator-authorized endpoint.
  const handleDelete = async (slug: string, purge: boolean) => {
    if (purge && !window.confirm(`[주의] '${slug}' 글을 디스크에서 완전히 영구 삭제하시겠습니까?`)) return;
    setActionSlug(slug);
    try {
      const res = await fetch(`/api/admin/blog/${encodeURIComponent(slug)}?purge=${purge ? 'true' : 'false'}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        if (purge) setPosts((prev) => prev.filter((p) => p.slug !== slug));
        else setPosts((prev) => prev.map((p) => p.slug === slug ? { ...p, status: 'WITHDRAWN' as const } : p));
        setResult({ success: true, message: purge ? '글이 영구 삭제되었습니다.' : '글이 철회(비공개) 처리되었습니다.' });
      } else setResult({ success: false, message: data.message || '삭제 실패' });
    } catch {
      setResult({ success: false, message: '삭제 요청 오류' });
    } finally {
      setActionSlug(null);
    }
  };

  const configured = publisherStatus?.automaticEnabled && publisherStatus.modelVerified;

  return (
    <div className="space-y-6">
      <Card className="border-sky-500/30 bg-sky-950/10">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Sparkles className="h-5 w-5 text-sky-400" aria-hidden="true" />
                <CardTitle className="text-lg">AI 블로그 발행 엔진 관제</CardTitle>
                <Badge variant="outline">{configured ? '자동 발행 설정 확인됨' : '자동 발행 검증 대기'}</Badge>
              </div>
              <CardDescription className="mt-1 text-sm text-slate-300">
                검증된 서버 발행 상태만 표시합니다. 자동 발행 설정은 실제 발행 성공을 보장하지 않습니다.
              </CardDescription>
            </div>
            <Button type="button" variant="outline" disabled={statusLoading}
              onClick={() => void refreshPublisherStatus()}
              aria-label="블로그 발행 서버 상태 새로고침"
              className="min-h-11 shrink-0 whitespace-normal">
              {statusLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              발행 서버 상태 새로고침
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p role="status" aria-live="polite">
            {statusError ? '발행 서버 상태 확인 실패 — 다시 시도해 주세요.' :
              publisherStatus ? (configured ? '서버에서 자동 발행 설정을 확인했습니다. 실제 발행 기록은 별도 검증이 필요합니다.' :
                '검증된 자동 발행이 활성 상태로 확인되지 않았습니다.') :
              '발행 서버의 실제 상태를 확인하고 있습니다.'}
          </p>
          <p>지원 국가: 한국·미국·일본·중국</p>
          <p>수동 발행: <strong>안전한 관리자 생성 API 구현 전 미제공</strong></p>
          {publisherStatus?.verifiedPublishedCount !== undefined &&
            <p>서버에서 조회한 검증된 게시물: {publisherStatus.verifiedPublishedCount}건</p>}
          {result && <p role="alert" className={result.success ? 'text-emerald-300' : 'text-rose-300'}>{result.message}</p>}
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
                  <th className="p-3 w-16">썸네일</th>
                  <th className="p-3">제목 / 슬러그</th>
                  <th className="p-3">카테고리</th>
                  <th className="p-3">국가</th>
                  <th className="p-3">분량 / 읽기시간</th>
                  <th className="p-3">발행일시</th>
                  <th className="p-3">상태</th>
                  <th className="p-3 text-right">관리자 액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {posts.map((post) => {
                  const isWithdrawn = post.status === 'WITHDRAWN';
                  const isProcessing = actionSlug === post.slug;
                  const thumb = post.heroImage || '/images/blog/compound-interest-72-rule.svg';
                  const charEstimate = (post.content && post.content.length > 0)
                    ? post.content.length
                    : (post.readTimeMinutes ? post.readTimeMinutes * 500 : 7000);
                  return (
                    <tr key={post.slug} className={`hover:bg-muted/20 ${isWithdrawn ? 'opacity-60 bg-rose-950/10' : ''}`}>
                      <td className="p-3">
                        <div className="relative h-9 w-16 overflow-hidden rounded border border-border/60 bg-black/40">
                          <Image
                            src={thumb}
                            alt=""
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      </td>
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
                          {post.categoryLabel || post.category}
                        </Badge>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="font-mono text-xs">{post.country || 'KR'}</span>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5 text-[11px]">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <FileText className="h-3 w-3 text-sky-400" />
                            {charEstimate.toLocaleString()}자
                          </span>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3 w-3 text-emerald-400" />
                            약 {post.readTimeMinutes || 15}분
                          </span>
                        </div>
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
