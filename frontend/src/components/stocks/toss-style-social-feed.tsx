'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  Flame,
  Rocket,
  Droplet,
  MessageSquare,
  Award,
  CheckCircle2,
  Share2,
  Filter,
  PlusCircle,
} from 'lucide-react';

export interface FeedPost {
  readonly id: string;
  readonly authorName: string;
  readonly authorBadge: string;
  readonly returnRatePercent: number; // 수익률 (%)
  readonly isVerifiedHolder: boolean; // 실제 보유 주주 인증 마크
  readonly stockSymbol: string;
  readonly stockName: string;
  readonly entryPrice: number;
  readonly targetPrice?: number;
  readonly stance: 'bullish' | 'bearish' | 'neutral';
  readonly category: '전략' | '일지' | '질문' | '잡담';
  readonly content: string;
  readonly createdAt: string;
  readonly reactions: {
    flame: number;
    rocket: number;
    droplet: number;
  };
  readonly commentsCount: number;
}

const INITIAL_FEED_POSTS: FeedPost[] = [
  {
    id: 'feed-1',
    authorName: '여의도덕이',
    authorBadge: '골든 트레이더',
    returnRatePercent: 48.5,
    isVerifiedHolder: true,
    stockSymbol: 'CHIPS',
    stockName: '치무 초전도',
    entryPrice: 3200,
    targetPrice: 5500,
    stance: 'bullish',
    category: '전략',
    content: '눌림목 3,200 WLD 부근에서 4차 분할 매수 완료했습니다. 볼린저 밴드 하단 터치 후 거래량 동반 반등 중이라 5,000 WLD 1차 저항선까지 흔들림 없이 홀딩합니다!',
    createdAt: '10분 전',
    reactions: { flame: 34, rocket: 89, droplet: 2 },
    commentsCount: 14,
  },
  {
    id: 'feed-2',
    authorName: '한강뷰가즈아',
    authorBadge: '존버의 달인',
    returnRatePercent: -12.4,
    isVerifiedHolder: true,
    stockSymbol: 'WDG',
    stockName: '월덱 게임즈',
    entryPrice: 1250,
    targetPrice: 1400,
    stance: 'neutral',
    category: '일지',
    content: '신작 출시 기대감에 살짝 물렸지만(-12.4%), 실적 발표 전까지 물타기(DCA) 2차 들어가서 평단 1,180 WLD로 맞췄습니다. 본전 탈출 각 나옵니다.',
    createdAt: '35분 전',
    reactions: { flame: 19, rocket: 12, droplet: 45 },
    commentsCount: 8,
  },
  {
    id: 'feed-3',
    authorName: '퀀트마스터',
    authorBadge: '알고리즘 봇',
    returnRatePercent: 112.8,
    isVerifiedHolder: true,
    stockSymbol: 'SPACE',
    stockName: '월덱 우주항공',
    entryPrice: 8500,
    targetPrice: 20000,
    stance: 'bullish',
    category: '전략',
    content: '스페이스 섹터 실시간 모멘텀 지표 94점 돌파. 20일선 지지 확인하고 비중 40%로 확대했습니다. 가상경제 최초 우주 정거장 수주 모멘텀 기대 중입니다.',
    createdAt: '1시간 전',
    reactions: { flame: 78, rocket: 156, droplet: 1 },
    commentsCount: 29,
  },
  {
    id: 'feed-4',
    authorName: '소액개미탈출',
    authorBadge: '신규 루키',
    returnRatePercent: 6.2,
    isVerifiedHolder: false,
    stockSymbol: 'WFIN',
    stockName: '월덱 파이낸셜',
    entryPrice: 4800,
    stance: 'bullish',
    category: '질문',
    content: '배당락일 전에 WFIN 매수하면 이번 분기 배당금(7.5%) 100% 들어오나요? 배당소득세 계산기로 돌려보니 일반 계좌보다 ISA가 유리하네요!',
    createdAt: '2시간 전',
    reactions: { flame: 12, rocket: 25, droplet: 0 },
    commentsCount: 11,
  },
];

export function TossStyleSocialFeed() {
  const [posts, setPosts] = useState<FeedPost[]>(INITIAL_FEED_POSTS);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('ALL');
  const [selectedStance, setSelectedStance] = useState<string>('ALL');
  const [userReactions, setUserReactions] = useState<Record<string, Record<string, boolean>>>({});
  const [isWriteOpen, setIsWriteOpen] = useState(false);

  // 실제 사용자 포트폴리오 보유 종목 DB 상태
  const [userHoldings, setUserHoldings] = useState<Record<string, { quantity: number; avgCostPrice: number; returnPct: number }>>({});
  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState(false);

  // 작성 폼 상태
  const [newSymbol, setNewSymbol] = useState('CHIPS');
  const [newContent, setNewContent] = useState('');
  const [newStance, setNewStance] = useState<'bullish' | 'bearish' | 'neutral'>('bullish');
  const [newCategory, setNewCategory] = useState<'전략' | '일지' | '질문' | '잡담'>('전략');

  // 포트폴리오 DB 실시간 자동 조회
  React.useEffect(() => {
    let mounted = true;
    async function loadPortfolio() {
      setIsLoadingPortfolio(true);
      try {
        const res = await fetch('/api/v1/stocks/portfolio', { credentials: 'include' });
        if (res.ok) {
          const data = (await res.json()) as {
            holdings?: Array<{
              symbol?: string;
              quantity?: string | number;
              avg_cost_price?: string | number;
              return_pct?: string | number;
            }>;
          };
          if (mounted && Array.isArray(data.holdings)) {
            const map: Record<string, { quantity: number; avgCostPrice: number; returnPct: number }> = {};
            for (const h of data.holdings) {
              if (h.symbol) {
                map[h.symbol.toUpperCase()] = {
                  quantity: Number(h.quantity ?? 0),
                  avgCostPrice: Number(h.avg_cost_price ?? 0),
                  returnPct: Number(h.return_pct ?? 0),
                };
              }
            }
            setUserHoldings(map);
          }
        }
      } catch {
        // non-blocking for unauthenticated or guests
      } finally {
        if (mounted) setIsLoadingPortfolio(false);
      }
    }
    loadPortfolio();
    return () => {
      mounted = false;
    };
  }, []);

  const symbols = ['ALL', 'CHIPS', 'WDG', 'SPACE', 'WFIN', 'MYUY', 'DUCK'];

  const currentHolding = userHoldings[newSymbol.toUpperCase()];

  const filteredPosts = posts.filter((p) => {
    if (selectedSymbol !== 'ALL' && p.stockSymbol !== selectedSymbol) return false;
    if (selectedStance !== 'ALL' && p.stance !== selectedStance) return false;
    return true;
  });

  const handleReaction = (postId: string, type: 'flame' | 'rocket' | 'droplet') => {
    const postReactions = userReactions[postId] || {};
    const hasReacted = Boolean(postReactions[type]);

    setUserReactions((prev) => ({
      ...prev,
      [postId]: {
        ...(prev[postId] || {}),
        [type]: !hasReacted,
      },
    }));

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        return {
          ...p,
          reactions: {
            ...p.reactions,
            [type]: p.reactions[type] + (hasReacted ? -1 : 1),
          },
        };
      })
    );
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    const isHolder = Boolean(currentHolding && currentHolding.quantity > 0);
    const returnRate = isHolder
      ? currentHolding!.returnPct
      : newStance === 'bullish' ? 0.0 : newStance === 'bearish' ? -0.0 : 0.0;
    const entryPrice = isHolder ? currentHolding!.avgCostPrice : 0;

    const newPost: FeedPost = {
      id: `feed-${Date.now()}`,
      authorName: '나 (실전 투자자)',
      authorBadge: isHolder ? '인증 주주' : '시장 관망자',
      returnRatePercent: returnRate,
      isVerifiedHolder: isHolder,
      stockSymbol: newSymbol,
      stockName:
        newSymbol === 'CHIPS'
          ? '치무 초전도'
          : newSymbol === 'WDG'
            ? '월덱 게임즈'
            : newSymbol === 'SPACE'
              ? '월덱 우주항공'
              : newSymbol === 'WFIN'
                ? '월덱 파이낸셜'
                : '가상 우량주',
      entryPrice,
      stance: newStance,
      category: newCategory,
      content: newContent.trim(),
      createdAt: '방금 전',
      reactions: { flame: 1, rocket: 1, droplet: 0 },
      commentsCount: 0,
    };

    setPosts([newPost, ...posts]);
    setNewContent('');
    setIsWriteOpen(false);

    // 백엔드 게시판 동기화 백그라운드 호출
    try {
      fetch('/api/v1/board/stock-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `[${newSymbol} 주주 피드] ${newContent.slice(0, 30)}...`,
          body: newContent,
          stockSymbol: newSymbol,
          category: newCategory === '전략' ? 'analysis' : 'journal',
          stance: newStance,
          positionDisclosure: isHolder ? 'holder' : 'no_position',
        }),
      }).catch(() => {});
    } catch {
      // non-blocking
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* 헤더 & 상단 액션 */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              토스형 실명·수익률 인증 피드
            </span>
            <span className="text-xs text-slate-400">모의투자 주주 토론방</span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">주주 라운지 & 실전 매매 소셜 피드</h2>
          <p className="text-sm text-slate-400 mt-1">
            실제 주식 보유 유저들의 실시간 수익률 인증과 한 줄 매매 전략을 확인하고 의견을 나눠보세요.
          </p>
        </div>

        <button
          onClick={() => setIsWriteOpen(!isWriteOpen)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-medium text-sm transition shadow-lg shadow-indigo-600/30 shrink-0 min-h-[44px]"
        >
          <PlusCircle className="w-4 h-4" />
          내 수익률 & 매매전략 공유하기
        </button>
      </div>

      {/* 새 글 작성 폼 (토글) */}
      {isWriteOpen && (
        <form
          onSubmit={handleCreatePost}
          className="bg-slate-900 border border-indigo-500/40 rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-4 duration-200"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-400" />
              내 포트폴리오 수익률 인증 피드 작성
            </h3>
            <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              보유 주주 자동 인증 마크 부착
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">대상 종목</label>
              <select
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 min-h-[44px]"
              >
                <option value="CHIPS">CHIPS (치무 초전도)</option>
                <option value="WDG">WDG (월덱 게임즈)</option>
                <option value="SPACE">SPACE (월덱 우주항공)</option>
                <option value="WFIN">WFIN (월덱 파이낸셜)</option>
                <option value="MYUY">MYUY (뮤야 엔터)</option>
                <option value="DUCK">DUCK (덕덕 물산)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">투자 스탠스</label>
              <select
                value={newStance}
                onChange={(e) => setNewStance(e.target.value as 'bullish' | 'bearish' | 'neutral')}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 min-h-[44px]"
              >
                <option value="bullish">🚀 강력 매수 / 상승 (Bullish)</option>
                <option value="neutral">⚖️ 중립 / 관망 (Neutral)</option>
                <option value="bearish">💧 매도 / 하락 경계 (Bearish)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">카테고리</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as '전략' | '일지' | '질문' | '잡담')}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 min-h-[44px]"
              >
                <option value="전략">전략 분석</option>
                <option value="일지">매매 일지</option>
                <option value="질문">종목 질문</option>
                <option value="잡담">주주 수다</option>
              </select>
            </div>
          </div>

          {/* DB 실시간 인증 상태 안내 */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">포트폴리오 DB 연동 상태:</span>
            {currentHolding && currentHolding.quantity > 0 ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" />
                실제 주주 인증 ({currentHolding.quantity.toLocaleString()}주 | 평단 {currentHolding.avgCostPrice.toLocaleString()} WLD | {currentHolding.returnPct > 0 ? '+' : ''}{currentHolding.returnPct.toFixed(1)}%)
              </span>
            ) : (
              <span className="text-slate-400 font-medium">
                미보유 종목 (시장 관망 포지션으로 자동 등록)
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              매매 전략 및 코멘트 (최대 500자)
            </label>
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="매수 근거, 목표가, 평단가 관리 전략을 자유롭게 작성해 보세요..."
              rows={3}
              maxLength={500}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsWriteOpen(false)}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white transition"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition shadow-md min-h-[44px]"
            >
              피드에 게시하기
            </button>
          </div>
        </form>
      )}

      {/* 필터 툴바 */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 rounded-xl p-3">
        {/* 종목 태그 필터 */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-1 shrink-0" />
          {symbols.map((sym) => (
            <button
              key={sym}
              onClick={() => setSelectedSymbol(sym)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 min-h-[36px] ${
                selectedSymbol === sym
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              {sym === 'ALL' ? '전체 종목' : sym}
            </button>
          ))}
        </div>

        {/* 스탠스 필터 */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSelectedStance('ALL')}
            className={`px-2.5 py-1 rounded text-xs transition ${
              selectedStance === 'ALL' ? 'text-white font-semibold' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            전체
          </button>
          <span className="text-slate-700">|</span>
          <button
            onClick={() => setSelectedStance('bullish')}
            className={`px-2.5 py-1 rounded text-xs transition flex items-center gap-1 ${
              selectedStance === 'bullish' ? 'text-emerald-400 font-semibold' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <TrendingUp className="w-3 h-3" /> 매수세
          </button>
          <span className="text-slate-700">|</span>
          <button
            onClick={() => setSelectedStance('bearish')}
            className={`px-2.5 py-1 rounded text-xs transition flex items-center gap-1 ${
              selectedStance === 'bearish' ? 'text-blue-400 font-semibold' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <TrendingDown className="w-3 h-3" /> 매도세
          </button>
        </div>
      </div>

      {/* 피드 게시글 리스트 */}
      <div className="space-y-4">
        {filteredPosts.map((post) => {
          const isProfitable = post.returnRatePercent > 0;
          const userFlflamed = Boolean(userReactions[post.id]?.flame);
          const userRocketed = Boolean(userReactions[post.id]?.rocket);
          const userDropleted = Boolean(userReactions[post.id]?.droplet);

          return (
            <article
              key={post.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg hover:border-slate-700 transition space-y-4"
            >
              {/* 유저 정보 & 수익률 뱃지 헤더 */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {post.authorName.slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">{post.authorName}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {post.authorBadge}
                      </span>
                      {post.isVerifiedHolder && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          주주인증
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">{post.createdAt}</span>
                  </div>
                </div>

                {/* 핵심: 토스형 수익률 인증 뱃지 */}
                <div
                  className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-mono text-sm font-bold shadow-inner ${
                    isProfitable
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      : post.returnRatePercent < 0
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {isProfitable ? (
                    <TrendingUp className="w-4 h-4 text-rose-400" />
                  ) : post.returnRatePercent < 0 ? (
                    <TrendingDown className="w-4 h-4 text-blue-400" />
                  ) : null}
                  <span>
                    {isProfitable ? '+' : ''}
                    {post.returnRatePercent.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* 종목 태그 & 평단가 카드 */}
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/stocks/${post.stockSymbol}`}
                    className="font-bold text-indigo-400 hover:underline flex items-center gap-1 text-sm"
                  >
                    <span>{post.stockName}</span>
                    <span className="text-xs font-mono text-slate-400">({post.stockSymbol})</span>
                  </Link>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {post.category}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-slate-400 font-mono">
                  <span>
                    매수가: <strong className="text-white">{post.entryPrice.toLocaleString()} WLD</strong>
                  </span>
                  {post.targetPrice && (
                    <span>
                      목표가: <strong className="text-emerald-400">{post.targetPrice.toLocaleString()} WLD</strong>
                    </span>
                  )}
                  <span
                    className={`font-semibold px-2 py-0.5 rounded ${
                      post.stance === 'bullish'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : post.stance === 'bearish'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {post.stance === 'bullish' ? '상승 베팅' : post.stance === 'bearish' ? '하락 경계' : '관망'}
                  </span>
                </div>
              </div>

              {/* 본문 코멘트 */}
              <p className="text-sm text-slate-200 leading-relaxed break-keep whitespace-pre-wrap">
                {post.content}
              </p>

              {/* 하단 인터랙션 툴바: 좋아요/응원/댓글 */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                <div className="flex items-center gap-2">
                  {/* 불꽃 리액션 */}
                  <button
                    onClick={() => handleReaction(post.id, 'flame')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition min-h-[36px] ${
                      userFlflamed
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-sm'
                        : 'bg-slate-800/60 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    <span>응원해요 {post.reactions.flame}</span>
                  </button>

                  {/* 로켓 리액션 */}
                  <button
                    onClick={() => handleReaction(post.id, 'rocket')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition min-h-[36px] ${
                      userRocketed
                        ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40 shadow-sm'
                        : 'bg-slate-800/60 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <Rocket className="w-3.5 h-3.5 text-indigo-400" />
                    <span>가즈아 {post.reactions.rocket}</span>
                  </button>

                  {/* 물타기 리액션 */}
                  <button
                    onClick={() => handleReaction(post.id, 'droplet')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition min-h-[36px] ${
                      userDropleted
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/40 shadow-sm'
                        : 'bg-slate-800/60 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <Droplet className="w-3.5 h-3.5 text-blue-400" />
                    <span>물타기 {post.reactions.droplet}</span>
                  </button>
                </div>

                <div className="flex items-center gap-3 text-slate-400">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    댓글 {post.commentsCount}
                  </span>
                  <button
                    onClick={() => {
                      if (typeof navigator !== 'undefined' && navigator.clipboard) {
                        navigator.clipboard.writeText(window.location.href);
                        alert('피드 링크가 복사되었습니다!');
                      }
                    }}
                    className="hover:text-white transition flex items-center gap-1"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    공유
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
