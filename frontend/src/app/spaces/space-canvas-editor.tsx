'use client';

import React, { useState, useEffect } from 'react';
import {
  LayoutGrid,
  Sun,
  Moon,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Award,
  Layers,
  Info,
  Maximize2,
  Box,
  Heart,
  MessageSquare,
  Save,
  Check,
  Crown,
  Flame,
  Send,
  Trash2,
  Share2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/cn';

export type FurnitureCategory = 'all' | 'tech' | 'wealth' | 'lounge' | 'vibe';

export interface FurnitureItem {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
  readonly category: 'tech' | 'wealth' | 'lounge' | 'vibe';
  readonly score: number;
  readonly color: string;
  readonly description: string;
}

export const PALETTE: FurnitureItem[] = [
  // 1. 업무 & 테크 (Tech & Work)
  { id: 'desk', name: '월넛 데스크', icon: '🖥️', category: 'tech', score: 25, color: 'bg-amber-500/20 border-amber-500/40 text-amber-500', description: '고급 원목 기반의 듀얼 모니터 워크스테이션' },
  { id: 'chair', name: '에르고 체어', icon: '🪑', category: 'tech', score: 15, color: 'bg-sky-500/20 border-sky-500/40 text-sky-500', description: '장시간 트레이딩을 위한 프리미엄 인체공학 의자' },
  { id: 'server', name: '퀀텀 서버 랙', icon: '🗄️', category: 'tech', score: 45, color: 'bg-indigo-500/20 border-indigo-500/40 text-indigo-500', description: '초고속 퀀트 알고리즘 연산을 처리하는 엣지 서버' },
  { id: 'terminal', name: '블룸버그 터미널', icon: '📟', category: 'tech', score: 40, color: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-500', description: '전 세계 머니버스 호가와 금융 지표 실시간 수신' },
  { id: 'hologram', name: '3D 홀로그램 지구본', icon: '🌐', category: 'tech', score: 50, color: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-500', description: '글로벌 통화 유통량을 3차원으로 실시간 시각화' },

  // 2. 자산 & 명예 (Wealth & Prestige)
  { id: 'trophy', name: '골드덕 명예 트로피', icon: '🏆', category: 'wealth', score: 50, color: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-500', description: '도시 건립자 및 상위 트레이더에게 주어지는 영예' },
  { id: 'safe', name: '티타늄 비밀금고', icon: '🔒', category: 'wealth', score: 35, color: 'bg-slate-500/20 border-slate-500/40 text-slate-400', description: '대용량 WLD 현금 및 계약서를 안전하게 보관' },
  { id: 'bull_statue', name: '월가 황금 황소상', icon: '🐂', category: 'wealth', score: 60, color: 'bg-amber-400/20 border-amber-400/50 text-amber-400', description: '영구 상승장(Bull Market)의 기운을 담은 24K 조형물' },
  { id: 'crypto_node', name: '제네시스 노드', icon: '🪙', category: 'wealth', score: 55, color: 'bg-purple-500/20 border-purple-500/40 text-purple-400', description: '월덕 머니버스 불변 원장을 동기화하는 검증 노드' },
  { id: 'cert_frame', name: '금융 라이선스 액자', icon: '📜', category: 'wealth', score: 30, color: 'bg-orange-500/20 border-orange-500/40 text-orange-400', description: '중앙은행 공인 1급 펀드 매니저 자격 증서' },

  // 3. 휴식 & 라운지 (Lounge & Comfort)
  { id: 'sofa', name: 'VIP 벨벳 소파', icon: '🛋️', category: 'lounge', score: 30, color: 'bg-rose-500/20 border-rose-500/40 text-rose-500', description: '투자자 및 VIP 파트너 회의용 최고급 소파' },
  { id: 'coffee', name: '에스프레소 머신', icon: '☕', category: 'lounge', score: 20, color: 'bg-orange-600/20 border-orange-600/40 text-orange-500', description: '산미와 바디감이 풍부한 최고급 원두 커피 머신' },
  { id: 'cocktail_bar', name: '스카이라운지 미니바', icon: '🍸', category: 'lounge', score: 35, color: 'bg-pink-500/20 border-pink-500/40 text-pink-500', description: '성공적인 딜 체결을 축하하는 프라이빗 바' },
  { id: 'plant', name: '공기정화 몬스테라', icon: '🪴', category: 'lounge', score: 15, color: 'bg-green-500/20 border-green-500/40 text-green-500', description: '오피스 공기를 정화하고 시각적 안정감을 주는 식물' },
  { id: 'bookshelf', name: '클래식 서재 책장', icon: '📚', category: 'lounge', score: 25, color: 'bg-amber-700/20 border-amber-700/40 text-amber-600', description: '경제학 대가들의 고전과 금융 투자 명저 집대성' },

  // 4. 분위기 & 엔터 (Vibe & Atmosphere)
  { id: 'neon', name: '사이버펑크 네온사인', icon: '✨', category: 'vibe', score: 30, color: 'bg-fuchsia-500/20 border-fuchsia-500/40 text-fuchsia-500', description: '화려한 네온 빛으로 공간의 무드를 극대화' },
  { id: 'turntable', name: '아날로그 LP 턴테이블', icon: '🎵', category: 'vibe', score: 25, color: 'bg-violet-500/20 border-violet-500/40 text-violet-400', description: '따뜻한 재즈와 로파이 비트를 재생하는 음향 기기' },
  { id: 'arcade', name: '레트로 아케이드 머신', icon: '🕹️', category: 'vibe', score: 35, color: 'bg-teal-500/20 border-teal-500/40 text-teal-400', description: '잠시 머리를 식히는 클래식 미니게임 캐비닛' },
  { id: 'fireplace', name: '디지털 벽난로', icon: '🔥', category: 'vibe', score: 40, color: 'bg-red-500/20 border-red-500/40 text-red-500', description: '포근한 장작 타는 소리와 불멍을 제공하는 스마트 스크린' },
  { id: 'aquarium', name: '사이버 수족관', icon: '🐠', category: 'vibe', score: 45, color: 'bg-blue-500/20 border-blue-500/40 text-blue-400', description: '희귀 가상 열대어가 유영하는 나노 아쿠아리움' },
];

const GRID_SIZE = 8;

export interface GuestbookEntry {
  readonly id: string;
  readonly author: string;
  readonly message: string;
  readonly createdAt: string;
}

function createStarterGrid(): (string | null)[][] {
  const initial: (string | null)[][] = Array.from({ length: GRID_SIZE }, () =>
    Array<string | null>(GRID_SIZE).fill(null),
  );
  const place = (r: number, c: number, id: string) => {
    const row = initial[r];
    if (row) row[c] = id;
  };
  place(2, 2, 'desk');
  place(3, 2, 'chair');
  place(1, 1, 'server');
  place(1, 6, 'safe');
  place(6, 1, 'plant');
  place(1, 3, 'trophy');
  place(5, 5, 'sofa');
  place(6, 6, 'coffee');
  place(4, 6, 'neon');
  return initial;
}

interface SpaceCanvasEditorProps {
  readonly spaceId?: string | undefined;
  readonly spaceName?: string | undefined;
  readonly spaceType?: string | undefined;
}

export function SpaceCanvasEditor({
  spaceId,
  spaceName = '스타터 룸',
  spaceType = 'SPACE_ROOM_STARTER',
}: SpaceCanvasEditorProps) {
  const [grid, setGrid] = useState<(string | null)[][]>(createStarterGrid);
  const [selectedFurniture, setSelectedFurniture] = useState<FurnitureItem | null>(PALETTE[0] ?? null);
  const [activeCategory, setActiveCategory] = useState<FurnitureCategory>('all');
  const [isIsometric, setIsIsometric] = useState<boolean>(false);
  const [isNightMode, setIsNightMode] = useState<boolean>(false);
  const [likesCount, setLikesCount] = useState<number>(42);
  const [hasLiked, setHasLiked] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  // 방명록 상태
  const [guestbook, setGuestbook] = useState<GuestbookEntry[]>([
    { id: 'gb-1', author: '알파헌터', message: '인테리어 감각이 대단하네요! 황소상이 인상적입니다.', createdAt: '10분 전' },
    { id: 'gb-2', author: '메트로배달부', message: '배달 완료하고 커피 한 잔 마시고 갑니다 ☕', createdAt: '1시간 전' },
  ]);
  const [newComment, setNewComment] = useState('');

  // 로컬 스토리지 불러오기
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const savedKey = `mv_space_layout_${spaceId ?? 'default'}`;
      const saved = localStorage.getItem(savedKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.grid)) {
          setGrid(parsed.grid);
        }
      }
    } catch {
      // ignore
    }
  }, [spaceId]);

  // Vibe Score 계산
  const totalScore = grid.flat().reduce((acc, cellId) => {
    if (!cellId) return acc;
    const item = PALETTE.find((p) => p.id === cellId);
    return acc + (item?.score ?? 0);
  }, 0);

  const placedCount = grid.flat().filter(Boolean).length;

  // 등급 계산
  const getTierInfo = (score: number) => {
    if (score >= 500) return { name: 'Diamond Cyber-HQ', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30', max: 600, badge: '💎 다이아몬드' };
    if (score >= 300) return { name: 'Platinum Penthouse', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30', max: 500, badge: '👑 플래티넘' };
    if (score >= 150) return { name: 'Gold Executive', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30', max: 300, badge: '🥇 골드' };
    if (score >= 50) return { name: 'Silver Lounge', color: 'text-slate-300 bg-slate-500/10 border-slate-500/30', max: 150, badge: '🥈 실버' };
    return { name: 'Bronze Studio', color: 'text-amber-700 bg-amber-700/10 border-amber-700/30', max: 50, badge: '🥉 브론즈' };
  };

  const tier = getTierInfo(totalScore);

  const filteredPalette = PALETTE.filter((item) => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  const handleCellClick = (r: number, c: number) => {
    setGrid((prev) => {
      const next = prev.map((row) => [...row]);
      const row = next[r];
      if (!row) return next;
      if (row[c] !== null && row[c] !== undefined) {
        row[c] = null;
      } else if (selectedFurniture) {
        row[c] = selectedFurniture.id;
      }
      return next;
    });
  };

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleReset = () => {
    if (window.confirm('룸 배치를 초기 추천 상태로 되돌리시겠습니까?')) {
      setGrid(createStarterGrid());
      showToast('기본 인테리어 프리셋으로 복원되었습니다.');
    }
  };

  const handleClearAll = () => {
    if (window.confirm('모든 가구를 비우시겠습니까?')) {
      setGrid(
        Array(GRID_SIZE)
          .fill(null)
          .map(() => Array(GRID_SIZE).fill(null)),
      );
      showToast('룸 전체가 비워졌습니다.');
    }
  };

  const handleSaveLayout = async () => {
    setIsSaving(true);
    const layout = {
      spaceName,
      spaceType,
      grid,
      totalScore,
      updatedAt: new Date().toISOString(),
    };

    try {
      if (typeof window !== 'undefined') {
        const savedKey = `mv_space_layout_${spaceId ?? 'default'}`;
        localStorage.setItem(savedKey, JSON.stringify(layout));
      }

      if (spaceId) {
        await fetch(`/api/v1/spaces/${spaceId}/layout`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ layout }),
        });
      }

      showToast('인테리어 배치가 안전하게 저장되었습니다!');
    } catch {
      showToast('로컬 브라우저에 배치가 안전하게 저장되었습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportJson = () => {
    const layout = {
      spaceName,
      spaceType,
      grid,
      totalScore,
      tier: tier.name,
      furnitureCount: placedCount,
      updatedAt: new Date().toISOString(),
    };
    navigator.clipboard?.writeText(JSON.stringify(layout, null, 2));
    setCopiedNotification(true);
    showToast('배치 JSON 코드가 클립보드에 복사되었습니다.');
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  const handleLikeToggle = () => {
    if (hasLiked) {
      setLikesCount((prev) => prev - 1);
      setHasLiked(false);
    } else {
      setLikesCount((prev) => prev + 1);
      setHasLiked(true);
      showToast('이 공간에 좋아요를 남겼습니다! ❤️');
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const entry: GuestbookEntry = {
      id: `gb-${Date.now()}`,
      author: '나 (방문자)',
      message: newComment.trim(),
      createdAt: '방금 전',
    };
    setGuestbook((prev) => [entry, ...prev]);
    setNewComment('');
    showToast('방명록에 응원 메시지를 남겼습니다.');
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-card/95 via-card/85 to-card/60 p-5 sm:p-7 shadow-md backdrop-blur-md mb-8">
      {/* 앰비언트 백그라운드 조명 */}
      <div
        className={cn(
          'pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full blur-3xl transition-colors duration-700',
          isNightMode ? 'bg-indigo-600/20' : 'bg-amber-400/15',
        )}
      />
      <div
        className={cn(
          'pointer-events-none absolute -left-20 -bottom-20 h-72 w-72 rounded-full blur-3xl transition-colors duration-700',
          isNightMode ? 'bg-purple-600/20' : 'bg-sky-400/15',
        )}
      />

      {/* 플로팅 토스트 피드백 */}
      {toastMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          {toastMessage}
        </div>
      )}

      {/* 1. 상단 마스트헤드 바 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-inner">
            <LayoutGrid className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                SPACE STUDIO 8x8
              </span>
              <Badge variant="outline" className={cn('text-[11px] font-bold', tier.color)}>
                {tier.badge} · {tier.name}
              </Badge>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-foreground mt-0.5">
              {spaceName} 인터랙티브 룸 캔버스 & 2D/2.5D 에디터
            </h2>
          </div>
        </div>

        {/* 조명 모드, 2.5D 뷰, 저장 액션 */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 좋아요 버튼 */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleLikeToggle}
            className={cn(
              'h-9 rounded-xl gap-1.5 text-xs font-bold transition-all',
              hasLiked ? 'border-rose-500/50 bg-rose-500/10 text-rose-500' : 'text-muted-foreground',
            )}
          >
            <Heart className={cn('size-3.5', hasLiked && 'fill-rose-500 text-rose-500')} />
            <span>{likesCount}</span>
          </Button>

          {/* 2.5D 아이소메트릭 토글 */}
          <Button
            type="button"
            variant={isIsometric ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsIsometric((prev) => !prev)}
            className="h-9 rounded-xl gap-1.5 text-xs font-bold"
          >
            <Box className="size-3.5" />
            <span>{isIsometric ? '2.5D 아이소메트릭' : '2D 평면 그리드'}</span>
          </Button>

          {/* 데이/나이트 뷰 토글 */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsNightMode((prev) => !prev)}
            className={cn(
              'h-9 rounded-xl gap-1.5 text-xs font-bold transition-all',
              isNightMode
                ? 'border-indigo-500/50 bg-indigo-500/20 text-indigo-300'
                : 'border-amber-500/50 bg-amber-500/20 text-amber-600 dark:text-amber-300',
            )}
          >
            {isNightMode ? <Moon className="size-3.5" /> : <Sun className="size-3.5" />}
            <span>{isNightMode ? '나이트 뷰' : '데이라이트'}</span>
          </Button>

          {/* 저장 버튼 */}
          <Button
            type="button"
            size="sm"
            onClick={handleSaveLayout}
            disabled={isSaving}
            className="h-9 rounded-xl gap-1.5 text-xs font-bold bg-primary text-primary-foreground shadow-sm"
          >
            <Save className="size-3.5" />
            <span>{isSaving ? '저장 중...' : '배치 저장'}</span>
          </Button>
        </div>
      </div>

      {/* 2. Vibe 게이지 바 */}
      <div className="mt-4 rounded-2xl bg-muted/30 border border-border/50 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-amber-500" />
            <span className="text-xs font-bold text-foreground">인테리어 Vibe 게이지</span>
            <span className="text-xs font-mono text-muted-foreground">({placedCount}/64 타일 채움)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground">다음 등급까지</span>
            <span className="text-sm font-extrabold font-mono text-primary">{totalScore} pt</span>
          </div>
        </div>
        <Progress value={Math.min(100, Math.round((totalScore / tier.max) * 100))} className="h-2 rounded-full" />
      </div>

      {/* 3. 에디터 메인 영역: 좌측 20종 팔레트 + 우측 캔버스 */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 pt-6">
        {/* 좌측: 카테고리 탭 & 20종 가구 팔레트 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
              <Layers className="size-3.5 text-primary" /> 20종 인테리어 팔레트
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleReset}
                title="기본 배치로 복원"
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <RotateCcw className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                title="모두 비우기"
                className="p-1 rounded-lg hover:bg-rose-500/10 text-rose-500 transition-colors"
              >
                <Trash2 className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={handleExportJson}
                title="JSON 복사"
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <Share2 className="size-3.5" />
              </button>
            </div>
          </div>

          {/* 카테고리 필터 탭 */}
          <div className="flex flex-wrap gap-1 border-b border-border/50 pb-2">
            {[
              { id: 'all', label: '전체 (20)' },
              { id: 'tech', label: '업무/테크' },
              { id: 'wealth', label: '자산/명예' },
              { id: 'lounge', label: '휴식/라운지' },
              { id: 'vibe', label: '분위기/엔터' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id as FurnitureCategory)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors',
                  activeCategory === cat.id
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground',
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* 가구 리스트 */}
          <div className="max-h-[380px] overflow-y-auto space-y-1.5 pr-1">
            {filteredPalette.map((item) => {
              const isSelected = selectedFurniture?.id === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedFurniture(item)}
                  className={cn(
                    'w-full flex items-center justify-between rounded-xl border p-2.5 text-left transition-all',
                    isSelected
                      ? 'border-primary bg-primary/15 text-foreground ring-1 ring-primary/40 shadow-sm'
                      : 'border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/40 hover:text-foreground',
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xl shrink-0">{item.icon}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{item.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 pl-2">
                    <span className="text-[10px] font-mono font-extrabold text-primary">+{item.score}pt</span>
                    {isSelected && <span className="size-2 rounded-full bg-primary animate-pulse" />}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="rounded-xl bg-muted/30 p-3 border border-border/50 text-[11px] text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground flex items-center gap-1">
              <Info className="size-3 text-primary" /> 사용 안내
            </p>
            <p>• 가구를 선택 후 타일을 누르면 배치되며, 재클릭 시 회수됩니다.</p>
            <p>• 2.5D 아이소메트릭 뷰로 전환하여 입체적인 무드를 확인하세요.</p>
          </div>
        </div>

        {/* 우측: 8x8 타일 그리드 / 아이소메트릭 뷰어 & 방명록 */}
        <div className="space-y-6">
          <div className="flex flex-col items-center justify-center min-h-[380px]">
            <div
              className={cn(
                'relative rounded-3xl border-2 p-4 sm:p-6 shadow-inner transition-all duration-500',
                isNightMode ? 'border-indigo-500/40 bg-slate-950/90' : 'border-border/80 bg-amber-500/5',
                isIsometric && 'transform [perspective:900px] [transform:rotateX(38deg)_rotateZ(-18deg)] scale-90 sm:scale-95 my-4',
              )}
            >
              {/* 8x8 그리드 */}
              <div className="grid grid-cols-8 gap-1.5 sm:gap-2.5">
                {grid.map((row, r) =>
                  row.map((cellId, c) => {
                    const item = cellId ? PALETTE.find((p) => p.id === cellId) : null;
                    return (
                      <button
                        key={`${r}-${c}`}
                        type="button"
                        onClick={() => handleCellClick(r, c)}
                        title={
                          item
                            ? `${item.name} (+${item.score}pt) - 클릭하여 회수`
                            : selectedFurniture
                              ? `${selectedFurniture.name} 배치하기`
                              : '타일'
                        }
                        className={cn(
                          'group relative flex size-9 sm:size-12 md:size-14 items-center justify-center rounded-xl border text-xl sm:text-2xl transition-all duration-150 active:scale-90',
                          item
                            ? `${item.color} shadow-sm font-bold scale-[1.03]`
                            : isNightMode
                              ? 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-800/80'
                              : 'border-border/40 bg-background/60 hover:border-border hover:bg-muted/30',
                          isIsometric && item && 'shadow-lg -translate-y-1',
                        )}
                      >
                        {item ? (
                          <span className="select-none transition-transform group-hover:scale-110">
                            {item.icon}
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity">
                            {r},{c}
                          </span>
                        )}
                      </button>
                    );
                  }),
                )}
              </div>

              {/* 그리드 하단 정보 바 */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-2 text-[11px] text-muted-foreground font-mono">
                <span>{spaceName} · {spaceType}</span>
                <span className="text-emerald-500 font-bold">인테리어 VIBE: {totalScore}점</span>
              </div>
            </div>
          </div>

          {/* 4. 하단 방문자 방명록 섹션 */}
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <MessageSquare className="size-3.5 text-primary" /> 룸 방문자 방명록
              </h3>
              <span className="text-[11px] font-mono text-muted-foreground">총 {guestbook.length}개 메시지</span>
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="방문 후기나 응원 한마디를 남겨보세요..."
                className="flex-1 rounded-xl border border-border/70 bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
              <Button type="submit" size="sm" className="h-9 px-3 rounded-xl gap-1 text-xs font-bold">
                <Send className="size-3" />
                <span>등록</span>
              </Button>
            </form>

            <div className="space-y-2 max-h-36 overflow-y-auto pt-1">
              {guestbook.map((entry) => (
                <div key={entry.id} className="rounded-xl bg-background/60 border border-border/50 p-2.5 text-xs">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                    <span className="font-bold text-foreground">{entry.author}</span>
                    <span className="font-mono">{entry.createdAt}</span>
                  </div>
                  <p className="text-muted-foreground text-[11px]">{entry.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
