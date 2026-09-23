'use client';

import React, { useState, useEffect, useActionState } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Minus,
  PlusCircle,
  ShieldCheck,
  Tag,
  Clock,
  Sparkles,
  User,
  Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { EmptyState } from '@/components/empty-state';
import { IDLE } from '@/lib/action-state';
import { formatMoment } from '@/lib/money';
import { createStockAwarePost } from '../../board/stock-actions';

export interface StockDiscussionPost {
  readonly postId: string;
  readonly title: string;
  readonly authorName: string;
  readonly createdAt: string;
  readonly commentCount: number;
  readonly stock: {
    readonly stockId: string;
    readonly symbol: string;
    readonly name: string;
    readonly category: string;
    readonly stance: string;
    readonly positionDisclosure: string;
  } | null;
}

interface StockDiscussionSectionProps {
  readonly stockId: string;
  readonly symbol: string;
  readonly name: string;
  readonly posts: readonly StockDiscussionPost[];
  readonly isEn?: boolean;
}

export function StockDiscussionSection({
  symbol,
  name,
  posts,
  isEn = false,
}: StockDiscussionSectionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [stance, setStance] = useState<'bullish' | 'neutral' | 'bearish'>('bullish');
  const [positionDisclosure, setPositionDisclosure] = useState<'holder' | 'no_position'>('holder');
  const [category, setCategory] = useState<'analysis' | 'question' | 'journal' | 'business'>('analysis');
  const [formState, formAction] = useActionState(createStockAwarePost, IDLE);

  // Close dialog on successful post creation
  useEffect(() => {
    if (formState.status === 'ok') {
      const timer = setTimeout(() => {
        setIsDialogOpen(false);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [formState.status]);

  // Calculate sentiment ratio
  const bullishCount = posts.filter((p) => p.stock?.stance === 'bullish').length;
  const bearishCount = posts.filter((p) => p.stock?.stance === 'bearish').length;
  const totalSentiment = bullishCount + bearishCount;
  const bullishRatio = totalSentiment > 0 ? Math.round((bullishCount / totalSentiment) * 100) : 50;

  return (
    <Card className="border-border/80">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="size-5 text-primary" />
            <CardTitle>{isEn ? `${symbol} Stock Discussions` : `${symbol} 종목 실시간 토론`}</CardTitle>
          </div>
          <CardDescription>
            {isEn
              ? `Real-time community opinions and investment analysis for ${name}.`
              : `${name}에 대한 주주 및 투자자들의 실시간 의견과 심층 분석입니다.`}
          </CardDescription>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 font-semibold">
                <PlusCircle className="size-4" />
                {isEn ? 'Share Opinion' : '의견 남기기'}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {isEn ? `Write Discussion for ${symbol}` : `${symbol} · ${name} 토론 작성`}
                </DialogTitle>
                <DialogDescription>
                  {isEn
                    ? 'Share your investment stance and insights with the community. Stance and position disclosure are transparently tagged.'
                    : '투자 의견과 분석을 작성해 공유하세요. 매매 관점과 보유 여부가 투명하게 태그됩니다.'}
                </DialogDescription>
              </DialogHeader>

              <form action={formAction} className="grid gap-4 py-2">
                <input type="hidden" name="stockSymbol" value={symbol} />
                <input type="hidden" name="stance" value={stance} />
                <input type="hidden" name="positionDisclosure" value={positionDisclosure} />
                <input type="hidden" name="category" value={category} />

                {/* Stance Selector */}
                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    {isEn ? 'Investment Stance' : '투자 의견 (스탠스)'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setStance('bullish')}
                      className={`flex items-center justify-center gap-1.5 rounded-md border p-2.5 text-xs font-medium transition-all ${
                        stance === 'bullish'
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold shadow-sm'
                          : 'border-border/60 hover:bg-muted/50'
                      }`}
                    >
                      <TrendingUp className="size-3.5 text-emerald-500" />
                      {isEn ? 'Bullish (Buy)' : '상승 (매수)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setStance('neutral')}
                      className={`flex items-center justify-center gap-1.5 rounded-md border p-2.5 text-xs font-medium transition-all ${
                        stance === 'neutral'
                          ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold shadow-sm'
                          : 'border-border/60 hover:bg-muted/50'
                      }`}
                    >
                      <Minus className="size-3.5 text-amber-500" />
                      {isEn ? 'Neutral (Hold)' : '중립 (관망)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setStance('bearish')}
                      className={`flex items-center justify-center gap-1.5 rounded-md border p-2.5 text-xs font-medium transition-all ${
                        stance === 'bearish'
                          ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold shadow-sm'
                          : 'border-border/60 hover:bg-muted/50'
                      }`}
                    >
                      <TrendingDown className="size-3.5 text-rose-500" />
                      {isEn ? 'Bearish (Sell)' : '하락 (매도)'}
                    </button>
                  </div>
                </div>

                {/* Position Disclosure & Category */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">
                      {isEn ? 'Position Disclosure' : '보유 여부 공개'}
                    </label>
                    <select
                      value={positionDisclosure}
                      onChange={(e) => setPositionDisclosure(e.target.value as 'holder' | 'no_position')}
                      className="h-10 rounded-md border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="holder">{isEn ? 'Currently holding' : '종목 보유 중'}</option>
                      <option value="no_position">{isEn ? 'No position' : '미보유 (관심)'}</option>
                    </select>
                  </div>

                  <div className="grid gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">
                      {isEn ? 'Category' : '글 분류'}
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as 'analysis' | 'question' | 'journal' | 'business')}
                      className="h-10 rounded-md border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="analysis">{isEn ? 'Stock Analysis' : '종목 분석'}</option>
                      <option value="question">{isEn ? 'Question' : '종목 질문'}</option>
                      <option value="journal">{isEn ? 'Trade Journal' : '매매 일지'}</option>
                      <option value="business">{isEn ? 'Business Insight' : '사업 연계'}</option>
                    </select>
                  </div>
                </div>

                {/* Title */}
                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    {isEn ? 'Title' : '제목'}
                  </label>
                  <input
                    name="title"
                    required
                    maxLength={120}
                    placeholder={isEn ? 'e.g. Analysis on Q3 momentum' : '예: 이번 분기 실적 모멘텀과 지지선 분석'}
                    className="h-10 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                {/* Body */}
                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    {isEn ? 'Content' : '분석 내용'}
                  </label>
                  <textarea
                    name="body"
                    required
                    rows={4}
                    maxLength={5000}
                    placeholder={
                      isEn
                        ? 'Share your thesis, technical levels, or market catalysts...'
                        : '근거, 기술적 지표, 시장 이벤트에 대한 본인만의 분석 의견을 적어주세요...'
                    }
                    className="rounded-md border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="mt-2 grid gap-2">
                  <SubmitButton className="w-full">
                    {isEn ? 'Post Discussion' : '토론 글 등록하기'}
                  </SubmitButton>
                  <ActionAlert state={formState} />
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Button asChild variant="outline" size="sm">
            <Link href={`/board?stock=${encodeURIComponent(symbol)}`}>
              {isEn ? 'All Discussions' : '게시판 전체보기'}
            </Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="grid gap-4">
        {/* Market Sentiment Bar */}
        {totalSentiment > 0 && (
          <div className="rounded-lg border bg-surface/50 p-3 text-xs">
            <div className="flex items-center justify-between font-semibold mb-1.5">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="size-3.5" />
                {isEn ? `Bullish ${bullishRatio}%` : `상승 전망 ${bullishRatio}%`}
              </span>
              <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                <TrendingDown className="size-3.5" />
                {isEn ? `Bearish ${100 - bullishRatio}%` : `하락 전망 ${100 - bullishRatio}%`}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-rose-500/20">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${bullishRatio}%` }}
              />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground text-center">
              {isEn
                ? `Based on ${totalSentiment} community stance ratings`
                : `커뮤니티 투자자 ${totalSentiment}명의 스탠스 투표 기반`}
            </p>
          </div>
        )}

        {/* Post List */}
        {posts.length === 0 ? (
          <EmptyState
            title={isEn ? 'No discussion for this stock yet.' : '아직 작성된 종목 토론이 없어요.'}
            description={
              isEn
                ? 'Be the first to share your investment analysis and market stance!'
                : '첫 번째로 매매 관점과 분석 글을 작성해 토론을 시작해 보세요!'
            }
          />
        ) : (
          <div className="grid gap-2.5">
            {posts.map((post) => {
              const stanceKind = post.stock?.stance;
              const positionKind = post.stock?.positionDisclosure;

              return (
                <Link
                  key={post.postId}
                  href={`/board/${post.postId}`}
                  className="group flex flex-col gap-2 rounded-lg border border-border/70 bg-card/60 p-3.5 transition-all duration-150 hover:border-primary/40 hover:bg-muted/30"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    {stanceKind === 'bullish' && (
                      <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 gap-1 text-[11px]">
                        <TrendingUp className="size-3" />
                        {isEn ? 'Bullish' : '상승'}
                      </Badge>
                    )}
                    {stanceKind === 'bearish' && (
                      <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 gap-1 text-[11px]">
                        <TrendingDown className="size-3" />
                        {isEn ? 'Bearish' : '하락'}
                      </Badge>
                    )}
                    {stanceKind === 'neutral' && (
                      <Badge variant="secondary" className="gap-1 text-[11px]">
                        <Minus className="size-3" />
                        {isEn ? 'Neutral' : '중립'}
                      </Badge>
                    )}

                    {positionKind === 'holder' && (
                      <Badge variant="outline" className="border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[10px] gap-0.5">
                        <span>👑</span>
                        <span>{isEn ? 'Shareholder' : '주주'}</span>
                      </Badge>
                    )}

                    <span className="text-xs font-semibold group-hover:text-primary transition-colors line-clamp-1 flex-1">
                      {post.title}
                    </span>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full hover:text-rose-500 transition-colors">
                        <Heart className="size-3 text-rose-500/70" />
                        <span>추천</span>
                      </span>

                      {post.commentCount > 0 && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
                          <MessageSquare className="size-3" />
                          {post.commentCount}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                    <span className="flex items-center gap-1">
                      <User className="size-3" />
                      {post.authorName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {formatMoment(post.createdAt, isEn ? 'Time unavailable' : '시간 확인 중')}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
