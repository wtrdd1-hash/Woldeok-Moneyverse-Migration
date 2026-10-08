'use client';

import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Flame,
  Users,
  Copy,
  CheckCircle2,
  AlertCircle,
  X,
  TrendingUp,
  Clock,
  Coins,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';

interface StockLeagueSeason {
  id: string;
  seasonNumber: number;
  title: string;
  startsAt: string;
  endsAt: string;
  entryFee: number;
  prizePool: number;
  treasurySubsidy: number;
  totalParticipants: number;
}

interface StockLeagueParticipant {
  id: string;
  userId: string;
  userName: string;
  initialAsset: number;
  currentAsset: number;
  roiRate: number;
  rankPosition: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Master' | 'Challenger';
  isWhale: boolean;
  followerCount: number;
}

interface CopyTradingSubscription {
  id: string;
  whaleId: string;
  whaleName: string;
  allocatedBudget: number;
  usedBudget: number;
  copyRatio: number;
  totalProfitShared: number;
  status: 'active' | 'paused' | 'cancelled';
}

interface StockLeagueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const TIER_COLORS: Record<string, string> = {
  Challenger: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  Master: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  Diamond: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
  Platinum: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  Gold: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
  Silver: 'bg-slate-400/20 text-slate-300 border-slate-400/40',
  Bronze: 'bg-amber-700/20 text-amber-500 border-amber-700/40',
};

export function StockLeagueChampionshipModal({ isOpen, onClose, onSuccess }: StockLeagueModalProps) {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'whales' | 'my'>('leaderboard');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [season, setSeason] = useState<StockLeagueSeason | null>(null);
  const [leaderboard, setLeaderboard] = useState<StockLeagueParticipant[]>([]);
  const [whales, setWhales] = useState<StockLeagueParticipant[]>([]);
  const [myParticipation, setMyParticipation] = useState<StockLeagueParticipant | null>(null);
  const [mySubscriptions, setMySubscriptions] = useState<CopyTradingSubscription[]>([]);

  // 카피 트레이딩 구독 다이얼로그 상태
  const [selectedWhale, setSelectedWhale] = useState<StockLeagueParticipant | null>(null);
  const [copyBudget, setCopyBudget] = useState(100000);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stocks/league');
      const data = await res.json();
      if (data.success) {
        setSeason(data.season);
        setLeaderboard(data.leaderboard || []);
        setWhales(data.whales || []);
        setMyParticipation(data.myParticipation || null);
        setMySubscriptions(data.mySubscriptions || []);
      }
    } catch {
      setMessage({ type: 'error', text: '리그 데이터를 불러오는데 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
      setMessage(null);
    }
  }, [isOpen]);

  const handleJoinLeague = async () => {
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch('/api/stocks/league/join', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        await fetchData();
        if (onSuccess) onSuccess();
      } else {
        setMessage({ type: 'error', text: data.error || '참가에 실패했습니다.' });
      }
    } catch {
      setMessage({ type: 'error', text: '네트워크 통신 중 오류가 발생했습니다.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubscribeCopyTrade = async () => {
    if (!selectedWhale) return;
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch('/api/stocks/league/copy-trade/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          whaleId: selectedWhale.userId,
          whaleName: selectedWhale.userName,
          allocatedBudget: copyBudget,
          copyRatio: 1.0,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        setSelectedWhale(null);
        await fetchData();
      } else {
        setMessage({ type: 'error', text: data.error || '카피 트레이딩 구독에 실패했습니다.' });
      }
    } catch {
      setMessage({ type: 'error', text: '통신 중 오류가 발생했습니다.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelCopyTrade = async (whaleId: string) => {
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch('/api/stocks/league/copy-trade/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whaleId }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        await fetchData();
      } else {
        setMessage({ type: 'error', text: data.error || '해제에 실패했습니다.' });
      }
    } catch {
      setMessage({ type: 'error', text: '통신 중 오류가 발생했습니다.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden">
        {/* 헤더 */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/80 bg-zinc-900/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate flex items-center gap-2">
                {season?.title || '가상 주식 실전 챔피언십 리그'}
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                  14일 시즌제
                </span>
              </h2>
              <p className="text-xs text-zinc-400 truncate">
                상위 1% 고래 포트폴리오 1클릭 복제 & 100만 WLD 국고 보조 상금 대결
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors shrink-0"
            aria-label="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 상금 풀 및 시즌 현황 카드 */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-950/20 via-zinc-900/40 to-orange-950/20 border-b border-zinc-800/60 shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <span className="text-[11px] text-zinc-400 block mb-0.5">총 상금 풀</span>
              <span className="text-sm sm:text-base font-mono font-bold text-amber-400 tabular-nums">
                {season ? season.prizePool.toLocaleString() : '1,000,000'} WLD
              </span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <span className="text-[11px] text-zinc-400 block mb-0.5">국고 지원 보조금</span>
              <span className="text-sm sm:text-base font-mono font-bold text-emerald-400 tabular-nums">
                +1,000,000 WLD
              </span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <span className="text-[11px] text-zinc-400 block mb-0.5">총 참가 트레이더</span>
              <span className="text-sm sm:text-base font-mono font-bold text-white tabular-nums">
                {season?.totalParticipants.toLocaleString() || '1'}명
              </span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <span className="text-[11px] text-zinc-400 block mb-0.5">참가비</span>
              <span className="text-sm sm:text-base font-mono font-bold text-zinc-300 tabular-nums">
                {season?.entryFee.toLocaleString() || '10,000'} WLD
              </span>
            </div>
          </div>

          {/* 내 참가 상태 및 참가 액션 */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
            <div className="flex items-center gap-2 min-w-0">
              {myParticipation ? (
                <>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-md border ${TIER_COLORS[myParticipation.tier] || ''} shrink-0`}>
                    {myParticipation.tier}
                  </span>
                  <span className="text-xs text-zinc-300 truncate font-mono">
                    내 순위: <strong className="text-amber-400">{myParticipation.rankPosition}위</strong> (수익률 {myParticipation.roiRate >= 0 ? '+' : ''}{myParticipation.roiRate}%)
                  </span>
                </>
              ) : (
                <span className="text-xs text-zinc-400 flex items-center gap-1.5 truncate">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  현재 시즌에 아직 참가하지 않았습니다. 참가 시 실시간 랭킹에 등록됩니다.
                </span>
              )}
            </div>
            {!myParticipation && (
              <button
                onClick={handleJoinLeague}
                disabled={submitting}
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0 shadow-lg shadow-amber-500/10"
              >
                <Coins className="w-3.5 h-3.5" />
                10,000 WLD 참가하기
              </button>
            )}
          </div>
        </div>

        {/* 탭 내비게이션 */}
        <div className="flex border-b border-zinc-800 px-4 bg-zinc-900/30 shrink-0">
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'leaderboard'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Trophy className="w-4 h-4" />
            실전 챔피언십 랭킹
          </button>
          <button
            onClick={() => setActiveTab('whales')}
            className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'whales'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Flame className="w-4 h-4 text-orange-400" />
            상위 1% 고래 카피 트레이딩
          </button>
          <button
            onClick={() => setActiveTab('my')}
            className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'my'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Users className="w-4 h-4" />
            내 구독 관리 ({mySubscriptions.length})
          </button>
        </div>

        {/* 메시지 알림 바 */}
        {message && (
          <div
            className={`px-4 py-2.5 text-xs flex items-center gap-2 shrink-0 ${
              message.type === 'success'
                ? 'bg-emerald-950/40 text-emerald-300 border-b border-emerald-800/40'
                : 'bg-rose-950/40 text-rose-300 border-b border-rose-800/40'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span className="truncate">{message.text}</span>
          </div>
        )}

        {/* 탭 콘텐츠 영역 */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 min-h-0 space-y-4">
          {loading ? (
            <div className="py-16 text-center text-xs text-zinc-500 font-mono">
              실시간 리그 데이터를 동기화하는 중...
            </div>
          ) : activeTab === 'leaderboard' ? (
            <div className="space-y-2">
              <div className="grid grid-cols-12 text-[11px] font-semibold text-zinc-400 px-3 py-1.5 uppercase tracking-wider">
                <span className="col-span-2 sm:col-span-1">순위</span>
                <span className="col-span-5 sm:col-span-4">트레이더</span>
                <span className="col-span-2 text-center">티어</span>
                <span className="col-span-3 text-right">수익률(ROI)</span>
                <span className="hidden sm:block sm:col-span-2 text-right">평가 자산</span>
              </div>
              {leaderboard.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                  아직 참가한 트레이더가 없습니다. 첫 번째 챔피언으로 등록해보세요!
                </div>
              ) : (
                leaderboard.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`grid grid-cols-12 items-center p-3 rounded-xl border transition-colors ${
                      idx === 0
                        ? 'bg-amber-950/20 border-amber-500/40 hover:border-amber-500/60'
                        : idx === 1
                        ? 'bg-zinc-900/60 border-slate-700/60'
                        : idx === 2
                        ? 'bg-zinc-900/40 border-amber-800/40'
                        : 'bg-zinc-900/20 border-zinc-800/60 hover:bg-zinc-900/40'
                    }`}
                  >
                    <div className="col-span-2 sm:col-span-1 flex items-center font-mono font-bold text-sm">
                      {idx === 0 ? (
                        <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs border border-amber-500/40">
                          🥇
                        </span>
                      ) : idx === 1 ? (
                        <span className="w-6 h-6 rounded-full bg-slate-400/20 text-slate-300 flex items-center justify-center text-xs border border-slate-400/40">
                          🥈
                        </span>
                      ) : idx === 2 ? (
                        <span className="w-6 h-6 rounded-full bg-amber-700/20 text-amber-500 flex items-center justify-center text-xs border border-amber-700/40">
                          🥉
                        </span>
                      ) : (
                        <span className="text-zinc-500 pl-1.5">{item.rankPosition || idx + 1}</span>
                      )}
                    </div>
                    <div className="col-span-5 sm:col-span-4 flex items-center gap-2 min-w-0 pr-2">
                      <span className="font-semibold text-xs sm:text-sm text-white truncate">
                        {item.userName}
                      </span>
                      {item.isWhale && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shrink-0">
                          WHALE
                        </span>
                      )}
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border ${TIER_COLORS[item.tier] || ''} shrink-0`}>
                        {item.tier}
                      </span>
                    </div>
                    <div className="col-span-3 text-right font-mono font-bold text-xs sm:text-sm tabular-nums">
                      <span className={item.roiRate >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {item.roiRate >= 0 ? '+' : ''}{item.roiRate.toFixed(2)}%
                      </span>
                    </div>
                    <div className="hidden sm:block sm:col-span-2 text-right font-mono text-xs text-zinc-400 tabular-nums">
                      {item.currentAsset.toLocaleString()} WLD
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : activeTab === 'whales' ? (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-800/40 text-xs text-cyan-300 flex items-center gap-2">
                <Copy className="w-4 h-4 shrink-0 text-cyan-400" />
                <span>
                  고래 카피 트레이딩을 구독하면, 해당 고래가 주식을 매매할 때 동일 비율로 자동 추종 매수/매도됩니다. (수익 실현 매도 시 순익의 10%가 원작자에게 분배됩니다)
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {whales.length === 0 ? (
                  <div className="col-span-2 p-8 text-center text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                    현재 공개된 상위 고래 트레이더가 없습니다.
                  </div>
                ) : (
                  whales.map((whale) => (
                    <div
                      key={whale.id}
                      className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-sm text-white truncate">{whale.userName}</h4>
                            <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                              상위 1%
                            </span>
                          </div>
                          <span className="text-[11px] text-zinc-400 font-mono mt-0.5 block">
                            팔로워 {whale.followerCount}명 · 티어 {whale.tier}
                          </span>
                        </div>
                        <span className="text-sm font-mono font-bold text-emerald-400 tabular-nums shrink-0">
                          +{whale.roiRate.toFixed(1)}% ROI
                        </span>
                      </div>
                      <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                        <span className="text-zinc-400 font-mono">
                          운용자산: <strong className="text-zinc-200">{whale.currentAsset.toLocaleString()} WLD</strong>
                        </span>
                        <button
                          onClick={() => setSelectedWhale(whale)}
                          className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-1 transition-colors shrink-0 shadow-md shadow-cyan-500/10"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          1클릭 복제
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {mySubscriptions.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                  현재 활성화된 카피 트레이딩 구독이 없습니다. 상위 1% 고래 탭에서 복제를 시작해보세요!
                </div>
              ) : (
                mySubscriptions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-wrap items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white truncate">{sub.whaleName}</span>
                        <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {sub.status === 'active' ? '실시간 복제 중' : sub.status}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-zinc-400 font-mono space-x-3">
                        <span>할당 자본: <strong className="text-zinc-200">{sub.allocatedBudget.toLocaleString()} WLD</strong></span>
                        <span>누적 분배 수익: <strong className="text-amber-400">{sub.totalProfitShared.toLocaleString()} WLD</strong></span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCancelCopyTrade(sub.whaleId)}
                      disabled={submitting}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-rose-950/60 text-zinc-300 hover:text-rose-400 border border-zinc-700 hover:border-rose-800/60 text-xs font-semibold transition-colors shrink-0"
                    >
                      구독 해제
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* 카피 트레이딩 자본금 설정 모달 (Nested Sub-Dialog) */}
        {selectedWhale && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl bg-zinc-950 border border-cyan-800 p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Copy className="w-4 h-4 text-cyan-400" />
                  [{selectedWhale.userName}] 고래 카피 트레이딩 설정
                </h3>
                <button
                  onClick={() => setSelectedWhale(null)}
                  className="w-6 h-6 rounded text-zinc-400 hover:text-white flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-zinc-400 block">복제에 투입할 할당 자본금 (WLD)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={10000}
                    step={10000}
                    value={copyBudget}
                    onChange={(e) => setCopyBudget(Math.max(10000, Number(e.target.value)))}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-cyan-500"
                  />
                  <span className="text-xs text-zinc-400 font-mono shrink-0">WLD</span>
                </div>
                <div className="flex gap-1.5 pt-1">
                  {[50000, 100000, 500000, 1000000].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setCopyBudget(preset)}
                      className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] font-mono text-zinc-300 transition-colors"
                    >
                      {(preset / 10000).toFixed(0)}만
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
                <p>• 고래의 실시간 매수/매도 주문이 할당 자본금 내에서 동일 비율로 복제됩니다.</p>
                <p>• 매도 시 발생한 순이익의 10%는 원작자 고래 트레이더에게 리워드로 송금됩니다.</p>
                <p>• 언제든 자유롭게 구독을 해제하고 잔여 자본을 회수할 수 있습니다.</p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  onClick={() => setSelectedWhale(null)}
                  className="px-3.5 py-2 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white text-xs font-semibold"
                >
                  취소
                </button>
                <button
                  onClick={handleSubscribeCopyTrade}
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  실시간 복제 시작
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 푸터 */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/40 shrink-0 flex items-center justify-between text-xs text-zinc-400">
          <span className="font-mono text-[11px]">
            시즌 종료 시 상위 10명에게 국고 지원 상금이 자동 차등 지급됩니다.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-semibold transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
