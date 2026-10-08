'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Swords,
  Dices,
  Hand,
  Layers,
  Sparkles,
  Trophy,
  Flame,
  Plus,
  RefreshCw,
  X,
  AlertCircle,
  Coins,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/cn';

export interface PvpRoom {
  id: string;
  creatorUserId: string;
  creatorName: string;
  opponentUserId: string | null;
  opponentName: string | null;
  gameType: 'dice' | 'rps' | 'hilo';
  stakeAmount: number;
  feeRate: number;
  status: 'waiting' | 'in_progress' | 'settled' | 'cancelled';
  winnerId: string | null;
  battleResult: any | null;
  createdAt: string;
  settledAt: string | null;
}

interface PvpWagerArenaModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly currentUserId?: string | undefined;
  readonly userBalance?: number | undefined;
  readonly onBalanceUpdate?: ((newBalance: number) => void) | undefined;
}

const QUICK_PRESETS = [10000, 50000, 100000, 500000, 1000000];

export function PvpWagerArenaModal({
  isOpen,
  onClose,
  currentUserId,
  userBalance = 0,
  onBalanceUpdate,
}: PvpWagerArenaModalProps) {
  const [activeTab, setActiveTab] = useState<'lobby' | 'create' | 'battle'>('lobby');
  const [gameType, setGameType] = useState<'dice' | 'rps' | 'hilo'>('dice');
  const [stakeAmount, setStakeAmount] = useState<number>(10000);
  const [myMove, setMyMove] = useState<string>('rock');
  const [waitingRooms, setWaitingRooms] = useState<PvpRoom[]>([]);
  const [recentBattles, setRecentBattles] = useState<PvpRoom[]>([]);
  const [activeBattle, setActiveBattle] = useState<any | null>(null);
  const [battlePhase, setBattlePhase] = useState<'idle' | 'rolling' | 'finished'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // 대결방 목록 새로고침
  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/arena/rooms');
      if (res.ok) {
        const data = await res.json();
        setWaitingRooms(data.waitingRooms || []);
        setRecentBattles(data.recentBattles || []);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRooms();
      const interval = setInterval(fetchRooms, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  // 대결방 생성
  const handleCreateRoom = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (stakeAmount < 1000 || stakeAmount > 50000000) {
      setErrorMsg('판돈은 1,000 WLD ~ 50,000,000 WLD 범위여야 합니다.');
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/arena/rooms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gameType,
            stakeAmount,
            creatorMove: myMove,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setErrorMsg(data.error || '대결방 생성에 실패했습니다.');
          return;
        }

        setSuccessMsg('대결방이 성공적으로 등록되었습니다! 상대방의 도전을 기다립니다.');
        setActiveTab('lobby');
        fetchRooms();
      } catch {
        setErrorMsg('네트워크 오류가 발생했습니다.');
      }
    });
  };

  // 대결방 참가 및 즉시 승부
  const handleJoinBattle = async (room: PvpRoom) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (currentUserId && room.creatorUserId === currentUserId) {
      setErrorMsg('자신이 생성한 대결방에는 참가할 수 없습니다.');
      return;
    }

    let joinMove = 'rock';
    if (room.gameType === 'rps') {
      joinMove = prompt('가위, 바위, 보 중 하나를 선택하세요 (rock, paper, scissors)', 'rock') || 'rock';
    } else if (room.gameType === 'hilo') {
      joinMove = prompt('하이(high) 또는 로우(low)를 선택하세요', 'high') || 'high';
    }

    startTransition(async () => {
      try {
        setBattlePhase('rolling');
        setActiveTab('battle');

        const res = await fetch(`/api/arena/rooms/${room.id}/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            opponentMove: joinMove,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setErrorMsg(data.error || '대결 참가에 실패했습니다.');
          setActiveTab('lobby');
          setBattlePhase('idle');
          return;
        }

        // 드라마틱 연출 후 결과 표시
        setTimeout(() => {
          setActiveBattle(data.outcome);
          setBattlePhase('finished');
          if (data.outcome?.newBalance && onBalanceUpdate) {
            onBalanceUpdate(parseFloat(data.outcome.newBalance));
          }
          fetchRooms();
        }, 1200);
      } catch {
        setErrorMsg('대결 중 오류가 발생했습니다.');
        setActiveTab('lobby');
        setBattlePhase('idle');
      }
    });
  };

  // 대결방 취소
  const handleCancelRoom = async (roomId: string) => {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/arena/rooms/${roomId}/cancel`, {
          method: 'POST',
        });
        if (res.ok) {
          fetchRooms();
        }
      } catch {
        // ignore
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl w-full p-0 overflow-hidden bg-card border-border shadow-2xl rounded-2xl flex flex-col max-h-[90vh]">
        {/* 상단 헤더 */}
        <div className="relative border-b border-border/80 bg-zinc-950/60 p-5 sm:p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                <Swords className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  1:1 라이브 승부존
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-rose-500">
                    <Flame className="h-3 w-3" /> 실시간 매칭
                  </span>
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  상대 유저와 1:1로 판돈을 걸고 즉석 결투를 펼치세요. 승자 97% 수취, 3% 국고 자동 귀속!
                </DialogDescription>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-muted-foreground hover:bg-zinc-800 hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* 탭 네비게이션 */}
          <div className="flex items-center gap-2 mt-5 border-b border-border/60">
            <button
              onClick={() => setActiveTab('lobby')}
              className={cn(
                'px-4 py-2 text-xs sm:text-sm font-semibold transition-all border-b-2 -mb-[1px]',
                activeTab === 'lobby'
                  ? 'border-amber-500 text-amber-500'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              대결 대기실 ({waitingRooms.length})
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={cn(
                'px-4 py-2 text-xs sm:text-sm font-semibold transition-all border-b-2 -mb-[1px]',
                activeTab === 'create'
                  ? 'border-amber-500 text-amber-500'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              + 대결방 개설
            </button>
            {activeBattle && (
              <button
                onClick={() => setActiveTab('battle')}
                className={cn(
                  'px-4 py-2 text-xs sm:text-sm font-semibold transition-all border-b-2 -mb-[1px]',
                  activeTab === 'battle'
                    ? 'border-rose-500 text-rose-500'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                결투 전장
              </button>
            )}
          </div>
        </div>

        {/* 바디 콘텐츠 */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {errorMsg && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-500 text-xs sm:text-sm font-medium">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 text-xs sm:text-sm font-medium">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: 대결 대기실 */}
          {activeTab === 'lobby' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  참가 가능한 대결 목록
                </span>
                <button
                  onClick={fetchRooms}
                  disabled={isPending}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <RefreshCw className={cn('h-3.5 w-3.5', isPending && 'animate-spin')} />
                  새로고침
                </button>
              </div>

              {waitingRooms.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-border/80 rounded-2xl p-6">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-muted-foreground mb-3">
                    <Swords className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">현재 대기 중인 대결방이 없습니다.</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    직접 대결방을 생성하고 다른 시민들의 도전을 기다려보세요!
                  </p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold rounded-xl transition-all shadow-md active:scale-95"
                  >
                    새 대결방 만들기
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {waitingRooms.map((room) => {
                    const isMine = currentUserId && room.creatorUserId === currentUserId;
                    return (
                      <div
                        key={room.id}
                        className="rounded-xl border border-border/80 bg-zinc-900/40 hover:border-amber-500/40 p-4 transition-all flex flex-col justify-between"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-foreground">{room.creatorName}</span>
                              {isMine && (
                                <span className="text-[10px] bg-amber-500/20 text-amber-400 font-semibold px-1.5 py-0.5 rounded">
                                  내 방
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                              {room.gameType === 'dice' && <Dices className="h-3 w-3 text-amber-500" />}
                              {room.gameType === 'rps' && <Hand className="h-3 w-3 text-sky-500" />}
                              {room.gameType === 'hilo' && <Layers className="h-3 w-3 text-emerald-500" />}
                              {room.gameType === 'dice' ? '주사위 쇼다운 (3개)' : room.gameType === 'rps' ? '가위바위보 심리전' : '하이로우 카드 (1~10)'}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold font-mono text-amber-400">
                              {room.stakeAmount.toLocaleString()} WLD
                            </span>
                            <span className="block text-[10px] text-zinc-500">판돈 1:1 매칭</span>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
                          <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3 text-emerald-500" /> 수수료 3% 국고 귀속
                          </span>
                          {isMine ? (
                            <button
                              onClick={() => handleCancelRoom(room.id)}
                              className="px-2.5 py-1 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                            >
                              방 취소
                            </button>
                          ) : (
                            <button
                              onClick={() => handleJoinBattle(room)}
                              disabled={isPending}
                              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95"
                            >
                              도전하기 ⚔️
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 최근 전적 전광판 */}
              {recentBattles.length > 0 && (
                <div className="pt-4 border-t border-border/80">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-3">
                    실시간 승부 전광판 (최근 완료)
                  </span>
                  <div className="space-y-2">
                    {recentBattles.slice(0, 5).map((battle) => (
                      <div
                        key={battle.id}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950/40 border border-border/50 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <Trophy className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          <span className="font-semibold text-foreground">
                            {battle.winnerId === battle.creatorUserId ? battle.creatorName : battle.opponentName}
                          </span>
                          <span className="text-emerald-500 font-bold">승리!</span>
                          <span className="text-zinc-500">vs</span>
                          <span className="text-zinc-400">
                            {battle.winnerId === battle.creatorUserId ? battle.opponentName : battle.creatorName}
                          </span>
                        </div>
                        <span className="font-mono text-amber-400 font-semibold">
                          +{(battle.stakeAmount * 1.94).toLocaleString()} WLD
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: 대결방 개설 */}
          {activeTab === 'create' && (
            <div className="space-y-5 max-w-xl mx-auto">
              {/* 종목 선택 */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  대결 종목 선택
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setGameType('dice')}
                    className={cn(
                      'p-3.5 rounded-xl border flex flex-col items-center gap-2 transition-all',
                      gameType === 'dice'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-500 shadow-sm'
                        : 'border-border/80 bg-zinc-900/40 text-muted-foreground hover:border-border',
                    )}
                  >
                    <Dices className="h-6 w-6" />
                    <span className="text-xs font-bold">주사위 쇼다운</span>
                    <span className="text-[10px] text-zinc-500">3개 주사위 합계</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGameType('rps')}
                    className={cn(
                      'p-3.5 rounded-xl border flex flex-col items-center gap-2 transition-all',
                      gameType === 'rps'
                        ? 'border-sky-500 bg-sky-500/10 text-sky-400 shadow-sm'
                        : 'border-border/80 bg-zinc-900/40 text-muted-foreground hover:border-border',
                    )}
                  >
                    <Hand className="h-6 w-6" />
                    <span className="text-xs font-bold">가위바위보</span>
                    <span className="text-[10px] text-zinc-500">단판 심리 대결</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGameType('hilo')}
                    className={cn(
                      'p-3.5 rounded-xl border flex flex-col items-center gap-2 transition-all',
                      gameType === 'hilo'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-sm'
                        : 'border-border/80 bg-zinc-900/40 text-muted-foreground hover:border-border',
                    )}
                  >
                    <Layers className="h-6 w-6" />
                    <span className="text-xs font-bold">하이로우 카드</span>
                    <span className="text-[10px] text-zinc-500">1~10 카드 오픈</span>
                  </button>
                </div>
              </div>

              {/* 판돈 입력 */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  베팅 판돈 (WLD)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={1000}
                    max={50000000}
                    step={1000}
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full rounded-xl border border-border/80 bg-zinc-950 px-4 py-3 text-lg font-mono font-bold text-foreground focus:border-amber-500 focus:outline-none"
                  />
                  <span className="absolute right-4 top-3.5 text-sm font-bold text-amber-500">WLD</span>
                </div>

                {/* 퀵 프리셋 버튼 */}
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {QUICK_PRESETS.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setStakeAmount((prev) => prev + amount)}
                      className="px-2.5 py-1 rounded-lg border border-border/60 bg-zinc-900/60 text-[11px] font-mono text-zinc-400 hover:text-foreground hover:border-border transition-colors"
                    >
                      +{amount.toLocaleString()}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setStakeAmount(10000)}
                    className="px-2.5 py-1 rounded-lg border border-border/60 bg-zinc-900/60 text-[11px] text-zinc-400 hover:text-foreground hover:border-border transition-colors"
                  >
                    초기화
                  </button>
                </div>
              </div>

              {/* 가위바위보 패 선택 (RPS일 때) */}
              {gameType === 'rps' && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                    내 가위바위보 패 미리 선택
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['rock', 'paper', 'scissors'].map((move) => (
                      <button
                        key={move}
                        type="button"
                        onClick={() => setMyMove(move)}
                        className={cn(
                          'p-3 rounded-xl border text-xs font-bold transition-all',
                          myMove === move
                            ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                            : 'border-border/60 bg-zinc-900/40 text-muted-foreground',
                        )}
                      >
                        {move === 'rock' ? '✊ 바위' : move === 'paper' ? '✋ 보' : '✌️ 가위'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 하이로우 선택 (Hi-Lo일 때) */}
              {gameType === 'hilo' && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                    내 목표 카드 기준
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['high', 'low'].map((move) => (
                      <button
                        key={move}
                        type="button"
                        onClick={() => setMyMove(move)}
                        className={cn(
                          'p-3 rounded-xl border text-xs font-bold transition-all',
                          myMove === move
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                            : 'border-border/60 bg-zinc-900/40 text-muted-foreground',
                        )}
                      >
                        {move === 'high' ? '🔼 하이 (High 6~10)' : '🔽 로우 (Low 1~5)'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 상금 요약 */}
              <div className="rounded-xl border border-border/80 bg-zinc-900/30 p-3.5 space-y-1.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>총 판돈 (1:1 매칭)</span>
                  <span className="font-mono text-foreground font-semibold">
                    {(stakeAmount * 2).toLocaleString()} WLD
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>국고 귀속 수수료 (3%)</span>
                  <span className="font-mono text-rose-400 font-semibold">
                    -{(Math.round(stakeAmount * 2 * 0.03)).toLocaleString()} WLD
                  </span>
                </div>
                <div className="flex justify-between font-bold pt-1.5 border-t border-border/50 text-foreground">
                  <span>승리 시 최종 수령액</span>
                  <span className="font-mono text-amber-400 text-sm">
                    {(stakeAmount * 2 - Math.round(stakeAmount * 2 * 0.03)).toLocaleString()} WLD
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCreateRoom}
                disabled={isPending}
                className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm transition-all shadow-lg active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <Swords className="h-4 w-4" />
                대결방 개설하기 (도전자 모집)
              </button>
            </div>
          )}

          {/* TAB 3: 결투 전장 연출 */}
          {activeTab === 'battle' && (
            <div className="text-center py-6 space-y-6">
              {battlePhase === 'rolling' && (
                <div className="space-y-4 py-8">
                  <div className="animate-spin text-amber-500 mx-auto flex items-center justify-center">
                    <Swords className="h-16 w-16" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">실시간 결투가 진행 중입니다!</h3>
                  <p className="text-xs text-muted-foreground">
                    양측의 주사위와 패가 충돌하고 있습니다. 잠시만 기다려주세요...
                  </p>
                </div>
              )}

              {battlePhase === 'finished' && activeBattle && (
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                    <Trophy className="h-8 w-8" />
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider block">
                      결투 종료
                    </span>
                    <h3 className="text-2xl font-black text-foreground mt-1">
                      {activeBattle.winnerId === currentUserId ? '🏆 당신의 승리입니다!' : '⚔️ 아쉽게 패배했습니다!'}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activeBattle.creatorName} vs {activeBattle.opponentName}
                    </p>
                  </div>

                  {/* 세부 점수 카드 */}
                  {activeBattle.creatorScore !== undefined && (
                    <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                      <div className="p-3.5 rounded-xl border border-border/80 bg-zinc-900/60">
                        <span className="text-xs text-muted-foreground block">{activeBattle.creatorName}</span>
                        <span className="text-2xl font-black font-mono text-foreground mt-1 block">
                          {activeBattle.creatorScore}점
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          [{activeBattle.creatorRoll?.join(', ')}]
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl border border-border/80 bg-zinc-900/60">
                        <span className="text-xs text-muted-foreground block">{activeBattle.opponentName}</span>
                        <span className="text-2xl font-black font-mono text-foreground mt-1 block">
                          {activeBattle.opponentScore}점
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          [{activeBattle.opponentRoll?.join(', ')}]
                        </span>
                      </div>
                    </div>
                  )}

                  {/* 상금 정산 */}
                  <div className="p-4 rounded-xl border border-border/80 bg-zinc-900/40 max-w-sm mx-auto text-xs space-y-1.5">
                    <div className="flex justify-between text-muted-foreground">
                      <span>총 판돈</span>
                      <span className="font-mono text-foreground">
                        {activeBattle.totalPot?.toLocaleString()} WLD
                      </span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>국고 수수료 (3%)</span>
                      <span className="font-mono text-rose-400">
                        -{activeBattle.treasuryFee?.toLocaleString()} WLD
                      </span>
                    </div>
                    <div className="flex justify-between font-bold pt-1.5 border-t border-border/50 text-foreground">
                      <span>승자 지급 상금</span>
                      <span className="font-mono text-amber-400 text-sm font-bold">
                        {activeBattle.winnerPayout?.toLocaleString()} WLD
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab('lobby');
                      setActiveBattle(null);
                      setBattlePhase('idle');
                    }}
                    className="px-6 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-foreground font-semibold text-xs transition-colors"
                  >
                    대기실로 돌아가기
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
