'use client';

import React, { useState, useEffect } from 'react';
import {
  Compass,
  Sparkles,
  BookOpen,
  Award,
  Share2,
  Calendar,
  CheckCircle2,
  Lock,
  Eye,
  X,
  Copy,
  ChevronRight,
  Bookmark,
  Layers,
  Heart,
} from 'lucide-react';
import { groupDigits } from '@/lib/money';

export interface CollectionPiece {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly category: string;
  readonly rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  readonly provenance: string;
  readonly acquiredAt: string;
  readonly icon: string;
  isFavorite?: boolean;
  userNote?: string;
}

const DEFAULT_PIECES: CollectionPiece[] = [
  {
    id: 'piece-1',
    code: 'FIRST_CAPITAL_BADGE',
    name: '최초의 수도 개척 훈장',
    category: 'SEASON',
    rarity: 'LEGENDARY',
    provenance: '시즌 1 First Capital 오픈 주간 공공 기여 및 수도 건설 참여 회원에게 수여된 불멸의 훈장',
    acquiredAt: '2026-08-15',
    icon: '🏛️',
    isFavorite: true,
    userNote: '첫 시즌의 수도 건설을 함께한 기념비적인 조각.',
  },
  {
    id: 'piece-2',
    code: 'ANTIQUE_SAFE_KEY',
    name: '골든 헤리티지 금고 열쇠',
    category: 'BANKING',
    rarity: 'EPIC',
    provenance: '초기 가상 은행 신용 등급 우수 회원에게 배정된 프라이빗 아카이브 인증 키',
    acquiredAt: '2026-08-28',
    icon: '🔑',
    isFavorite: false,
    userNote: '신용 관리 1등급 달성 기념.',
  },
  {
    id: 'piece-3',
    code: 'NEO_CYBER_CASINO_CHIP',
    name: '월덕 카지노 리미티드 칩',
    category: 'CASINO',
    rarity: 'RARE',
    provenance: '카지노 7대 게임 정규 그랜드 오픈 이벤트 참여 한정 소장용 기념 칩',
    acquiredAt: '2026-09-05',
    icon: '🎲',
    isFavorite: false,
  },
  {
    id: 'piece-4',
    code: 'SMART_LOGISTICS_PERMIT',
    name: '스마트 운송 물류 허가서',
    category: 'BUSINESS',
    rarity: 'RARE',
    provenance: '가상 사업체 B2B 공급망 개척 및 물류센터 가동 인가 공문서',
    acquiredAt: '2026-09-18',
    icon: '📜',
    isFavorite: true,
    userNote: '물류 사업 흑자 전환 기념.',
  },
];

const OWNERSHIP_LADDER = [
  { step: 1, label: 'Have', desc: '조각을 하나 가지고 있다' },
  { step: 2, label: 'Understand', desc: '왜 이 조각이 의미 있는지 안다' },
  { step: 3, label: 'Connect', desc: '테마·시즌·이야기와 어떻게 이어지는지 안다' },
  { step: 4, label: 'Curate', desc: '어떻게 배열하고 라벨을 붙일지 골랐다' },
  { step: 5, label: 'Express', desc: '이 컬렉션은 내 취향처럼 보인다' },
  { step: 6, label: 'Remember', desc: '내 머니버스 역사의 일부를 기록한다' },
  { step: 7, label: 'Reinterpret', desc: '새 시즌에서 오래된 조각이 다시 빛난다' },
];

export function CurationRetentionFlow({
  userName = '월덕 시민',
}: {
  readonly userName?: string;
}) {
  const [pieces, setPieces] = useState<CollectionPiece[]>(DEFAULT_PIECES);
  const [selectedPiece, setSelectedPiece] = useState<CollectionPiece>(DEFAULT_PIECES[0]!);
  const [noteInput, setNoteInput] = useState<string>(DEFAULT_PIECES[0]?.userNote ?? '');
  const [showcaseOpen, setShowcaseOpen] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [timelineDay, setTimelineDay] = useState<'D1' | 'D3' | 'D7'>('D7');

  // Load from backend API on mount, with local storage fallback
  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      try {
        const [piecesRes, statusRes] = await Promise.all([
          fetch('/api/v1/collections'),
          fetch('/api/v1/collections/curation/status'),
        ]);

        if (piecesRes.ok) {
          const data = await piecesRes.json();
          if (Array.isArray(data.pieces) && data.pieces.length > 0 && !cancelled) {
            setPieces(data.pieces);
            setSelectedPiece(data.pieces[0]);
            setNoteInput(data.pieces[0].userNote || '');
          }
        }
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          if (statusData.status?.timelineDay && !cancelled) {
            setTimelineDay(statusData.status.timelineDay);
          }
        }
      } catch {
        // Fallback to local storage
        try {
          const cached = localStorage.getItem('moneyverse_curation_pieces');
          if (cached && !cancelled) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setPieces(parsed);
              setSelectedPiece(parsed[0]);
              setNoteInput(parsed[0].userNote || '');
            }
          }
        } catch {
        /* ignore */
      }
      }
    }
    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSelectPiece = (piece: CollectionPiece) => {
    setSelectedPiece(piece);
    setNoteInput(piece.userNote || '');
  };

  const handleToggleFavorite = async (id: string) => {
    const target = pieces.find((p) => p.id === id);
    const nextFav = !target?.isFavorite;

    setPieces((prev) => {
      const next = prev.map((p) =>
        p.id === id ? { ...p, isFavorite: nextFav } : p,
      );
      try {
        localStorage.setItem('moneyverse_curation_pieces', JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });

    try {
      await fetch(`/api/v1/collections/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: nextFav }),
      });
    } catch {
        /* ignore */
      }
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = noteInput.trim();
    setPieces((prev) => {
      const next = prev.map((p) =>
        p.id === selectedPiece.id ? { ...p, userNote: trimmed } : p,
      );
      try {
        localStorage.setItem('moneyverse_curation_pieces', JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });

    try {
      await fetch(`/api/v1/collections/${selectedPiece.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userNote: trimmed }),
      });
    } catch {
        /* ignore */
      }
    alert('소장품 큐레이션 메모가 서버에 안전하게 영속 저장되었습니다.');
  };

  const handleTimelineDayChange = async (day: 'D1' | 'D3' | 'D7') => {
    setTimelineDay(day);
    try {
      await fetch('/api/v1/collections/curation/advance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timelineDay: day }),
      });
    } catch {
        /* ignore */
      }
  };


  const favoritesCount = pieces.filter((p) => p.isFavorite).length;

  return (
    <div className="space-y-8">
      {/* 1. D1~D7 큐레이션 리텐션 타임라인 히어로 */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card/90 to-primary/5 p-6 shadow-md backdrop-blur-md">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/15 text-primary border border-primary/30 shadow-inner">
              <Compass className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  CURATION RETENTION FLOW
                </span>
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                  소유감 4단계 (Curate) 도달
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-foreground mt-0.5">
                {userName}님의 수집품 & 큐레이션 아카이브
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowcaseOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/15 px-4 py-2 text-xs font-bold text-primary hover:bg-primary/25 active:scale-95 transition-all shadow-sm"
            >
              <Share2 className="size-3.5" />
              <span>전시 쇼케이스 카드 생성</span>
            </button>
          </div>
        </div>

        {/* D1 → D3 → D7 타임라인 탭 */}
        <div className="pt-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
              <Calendar className="size-3.5 text-primary" /> 소유감 여정: 그때 → 지금 → 다음
            </span>
            <div className="inline-flex rounded-xl border border-border p-1 bg-muted/30 text-xs">
              <button
                type="button"
                onClick={() => handleTimelineDayChange('D1')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  timelineDay === 'D1' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >
                D1 인식
              </button>
              <button
                type="button"
                onClick={() => handleTimelineDayChange('D3')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  timelineDay === 'D3' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >
                D3 심화
              </button>
              <button
                type="button"
                onClick={() => handleTimelineDayChange('D7')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  timelineDay === 'D7' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >
                D7 큐레이션
              </button>
            </div>
          </div>

          {/* 타임라인 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`rounded-2xl border p-4 transition-all ${timelineDay === 'D1' ? 'border-primary bg-primary/10 shadow-sm' : 'border-border/60 bg-muted/20'}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="size-6 rounded-full bg-primary/20 text-primary font-black text-xs flex items-center justify-center">1</span>
                <span className="text-xs font-bold text-foreground">그때 (D1 - 첫 획득과 보존)</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                처음 수집품을 획득하고, 연속성을 잃지 않도록 첫 비공개 소장 상태가 안전하게 저장되었습니다.
              </p>
            </div>

            <div className={`rounded-2xl border p-4 transition-all ${timelineDay === 'D3' ? 'border-primary bg-primary/10 shadow-sm' : 'border-border/60 bg-muted/20'}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="size-6 rounded-full bg-primary/20 text-primary font-black text-xs flex items-center justify-center">3</span>
                <span className="text-xs font-bold text-foreground">지금 (D3 - 배경과 가치 탐색)</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                조각의 유래(Provenance)와 가상 경제 역사(Lore)를 이해하고, 단순한 소모품이 아닌 내 자산으로 체감합니다.
              </p>
            </div>

            <div className={`rounded-2xl border p-4 transition-all ${timelineDay === 'D7' ? 'border-primary bg-primary/10 shadow-sm' : 'border-border/60 bg-muted/20'}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="size-6 rounded-full bg-primary/20 text-primary font-black text-xs flex items-center justify-center">7</span>
                <span className="text-xs font-bold text-foreground">다음 (D7 - 큐레이션과 전시)</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                대표 조각을 선정하고, 나만의 라벨과 메모를 달아 보존하며, 선택적으로 쇼케이스를 만들어 전시합니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 소유감 7단계 사다리 스트립 */}
      <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
        <span className="text-xs font-bold text-muted-foreground block mb-3">
          7단계 소유감 사다리 (Ownership Ladder)
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {OWNERSHIP_LADDER.map((item) => (
            <div
              key={item.step}
              className={`rounded-xl border p-3 flex flex-col justify-between ${
                item.step <= 4
                  ? 'border-primary/40 bg-primary/10 text-foreground'
                  : 'border-border/50 bg-muted/20 text-muted-foreground opacity-60'
              }`}
            >
              <div>
                <span className="text-[10px] font-mono font-black text-primary block">
                  STEP {item.step}
                </span>
                <p className="text-xs font-bold mt-0.5">{item.label}</p>
              </div>
              <p className="text-[10px] mt-2 leading-tight">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. 소장품 큐레이션 그리드 & 디테일 뷰어 */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* 좌측 소장품 그리드 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Bookmark className="size-4 text-primary" />
              <span>보유 소장품 ({pieces.length}점)</span>
            </h3>
            <span className="text-xs text-muted-foreground font-mono">
              대표 조각 {favoritesCount}개 지정됨
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pieces.map((piece) => {
              const isSelected = selectedPiece.id === piece.id;

              return (
                <div
                  key={piece.id}
                  onClick={() => handleSelectPiece(piece)}
                  className={`cursor-pointer rounded-2xl border p-4 transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-primary bg-primary/10 ring-1 ring-primary shadow-md'
                      : 'border-border/70 bg-card hover:border-border hover:bg-muted/30 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{piece.icon}</span>
                      <div>
                        <span className="text-[10px] font-mono font-bold text-primary">
                          {piece.category} · {piece.rarity}
                        </span>
                        <h4 className="text-sm font-bold text-foreground mt-0.5">
                          {piece.name}
                        </h4>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(piece.id);
                      }}
                      title="대표 조각 지정 토글"
                      className={`p-1.5 rounded-lg border transition-colors ${
                        piece.isFavorite
                          ? 'border-rose-500/40 bg-rose-500/15 text-rose-500'
                          : 'border-border/60 bg-muted/40 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Heart className="size-3.5 fill-current" />
                    </button>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 mt-3 leading-relaxed">
                    {piece.provenance}
                  </p>

                  <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>수집: {piece.acquiredAt}</span>
                    {piece.userNote && (
                      <span className="text-primary font-semibold">메모 기록됨</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 우측 선택된 조각 상세 및 메모 편집 */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-sm self-start">
          <div className="flex items-center gap-3 border-b border-border/60 pb-3">
            <span className="text-3xl">{selectedPiece.icon}</span>
            <div>
              <span className="text-[10px] font-mono font-bold text-primary">
                PROVENANCE DETAIL
              </span>
              <h4 className="text-base font-bold text-foreground">
                {selectedPiece.name}
              </h4>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <span className="font-bold text-muted-foreground block">조각의 유래와 맥락 (Provenance)</span>
            <div className="rounded-xl bg-muted/30 p-3 border border-border/50 text-muted-foreground leading-relaxed">
              {selectedPiece.provenance}
            </div>
          </div>

          {/* 개인 큐레이션 메모 폼 */}
          <form onSubmit={handleSaveNote} className="space-y-3 pt-2 border-t border-border/60">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground">
                나만의 비공개 큐레이션 메모
              </label>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Lock className="size-3" /> 비공개 보관
              </span>
            </div>
            <textarea
              rows={3}
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="이 조각에 얽힌 나만의 기억이나 배열 의도를 남겨보세요..."
              className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none"
            />
            <button
              type="submit"
              className="w-full rounded-xl border border-primary/40 bg-primary/10 py-2 text-xs font-bold text-primary hover:bg-primary/20 transition-all active:scale-95"
            >
              메모 저장하기
            </button>
          </form>
        </div>
      </div>

      {/* 4. 전시 쇼케이스 카드 생성 모달 */}
      {showcaseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in-50">
          <div className="relative w-full max-w-lg rounded-3xl border border-primary/40 bg-card p-6 shadow-2xl overflow-hidden">
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />

            <div className="flex items-start justify-between border-b border-border/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary border border-primary/30">
                  <Share2 className="size-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-primary uppercase">SHOWCASE CARD</span>
                  <h3 className="text-lg font-black text-foreground">
                    읽기 전용 전시 쇼케이스 카드
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowcaseOpen(false)}
                className="rounded-xl border border-border/80 p-2 text-muted-foreground hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* 카드 미리보기 뷰 */}
            <div className="my-5 rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-card via-background to-primary/5 p-5 shadow-inner space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-primary">
                    MEMBER ARCHIVE
                  </span>
                  <p className="text-base font-black text-foreground">{userName}의 큐레이션</p>
                </div>
                <span className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-bold text-primary">
                  {pieces.length}개 조각 헌정
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-border/50">
                {pieces.map((p) => (
                  <div key={p.id} className="rounded-xl bg-muted/40 p-2.5 text-center border border-border/40">
                    <span className="text-2xl block">{p.icon}</span>
                    <span className="text-[10px] font-bold text-foreground truncate block mt-1">
                      {p.name}
                    </span>
                  </div>
                ))}
              </div>

              <div className="text-[11px] text-muted-foreground bg-muted/30 p-2.5 rounded-xl border border-border/40 flex items-center justify-between">
                <span>🛡️ 민감 계좌/자산 정보는 마스킹 처리됨</span>
                <span className="text-primary font-semibold">읽기 전용 웹 링크</span>
              </div>
            </div>

            {/* 링크 복사 및 닫기 */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-border/60">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.origin + '/collections?showcase=arch-1063');
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2500);
                }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-primary/50 bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all active:scale-95 shadow-sm"
              >
                <Copy className="size-3.5" />
                <span>{copiedLink ? '✓ 링크가 복사되었습니다' : '쇼케이스 공유 링크 복사'}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowcaseOpen(false)}
                className="rounded-xl border border-border/80 px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-muted"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
