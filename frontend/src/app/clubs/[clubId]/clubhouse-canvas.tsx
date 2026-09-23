'use client';

import React, { useState } from 'react';
import {
  LayoutGrid,
  Sun,
  Moon,
  RotateCcw,
  Users,
  Info,
  Lock,
} from 'lucide-react';

interface FurnitureItem {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
  readonly score: number;
  readonly color: string;
  readonly roleRequired: 'ALL' | 'OFFICER';
}

const CLUB_PALETTE: FurnitureItem[] = [
  { id: 'conf_table', name: '중앙 회의 테이블', icon: '🏛️', score: 80, color: 'bg-amber-500/20 border-amber-500/40 text-amber-500', roleRequired: 'OFFICER' },
  { id: 'guild_flag', name: '클럽 상징 깃발', icon: '🚩', score: 60, color: 'bg-rose-500/20 border-rose-500/40 text-rose-500', roleRequired: 'OFFICER' },
  { id: 'trophy_wall', name: '공동 트로피 진열장', icon: '🏆', score: 100, color: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-500', roleRequired: 'OFFICER' },
  { id: 'vault_safe', name: '클럽 공동 금고', icon: '🔒', score: 70, color: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-500', roleRequired: 'OFFICER' },
  { id: 'lounge_bar', name: '에스프레소 라운지', icon: '☕', score: 45, color: 'bg-orange-500/20 border-orange-500/40 text-orange-500', roleRequired: 'ALL' },
  { id: 'neon_sign', name: '클럽 네온 엠블럼', icon: '✨', score: 55, color: 'bg-fuchsia-500/20 border-fuchsia-500/40 text-fuchsia-500', roleRequired: 'ALL' },
  { id: 'member_seat', name: '길드원 전용 좌석', icon: '🪑', score: 25, color: 'bg-sky-500/20 border-sky-500/40 text-sky-500', roleRequired: 'ALL' },
  { id: 'plant_pot', name: '실내 정원 화분', icon: '🪴', score: 20, color: 'bg-green-500/20 border-green-500/40 text-green-500', roleRequired: 'ALL' },
];

const GRID_SIZE = 12;

function createStarterClubGrid(): (string | null)[][] {
  const initial: (string | null)[][] = Array.from({ length: GRID_SIZE }, () =>
    Array<string | null>(GRID_SIZE).fill(null),
  );
  const place = (r: number, c: number, id: string) => {
    const row = initial[r];
    if (row) row[c] = id;
  };
  // Center conference table
  place(5, 5, 'conf_table');
  place(5, 6, 'conf_table');
  place(6, 5, 'conf_table');
  place(6, 6, 'conf_table');
  // Seats around table
  place(4, 5, 'member_seat');
  place(4, 6, 'member_seat');
  place(7, 5, 'member_seat');
  place(7, 6, 'member_seat');
  place(5, 4, 'member_seat');
  place(6, 4, 'member_seat');
  place(5, 7, 'member_seat');
  place(6, 7, 'member_seat');
  // Decorative corners
  place(1, 1, 'guild_flag');
  place(1, 10, 'trophy_wall');
  place(10, 1, 'vault_safe');
  place(10, 10, 'lounge_bar');
  place(1, 5, 'neon_sign');
  return initial;
}

export function ClubhouseCanvas({
  clubId,
  clubName,
  userRole = 'MEMBER',
}: {
  readonly clubId: string;
  readonly clubName: string;
  readonly userRole?: string | null;
}) {
  const [grid, setGrid] = useState<(string | null)[][]>(createStarterClubGrid);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [selectedFurniture, setSelectedFurniture] = useState<FurnitureItem | null>(CLUB_PALETTE[4] ?? null);
  const [isNightMode, setIsNightMode] = useState<boolean>(false);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const isOfficer = userRole === 'OWNER' || userRole === 'MANAGER';

  // 서버에서 저장된 클럽 캔버스 레이아웃 로드
  React.useEffect(() => {
    let cancelled = false;
    async function loadCanvas() {
      try {
        const res = await fetch(`/api/v1/clubs/${clubId}/canvas`);
        if (!res.ok) throw new Error('club canvas request failed');
        const data = await res.json();
        if (!cancelled) {
          if (data.canvas?.grid && Array.isArray(data.canvas.grid)) {
            setGrid(data.canvas.grid);
          }
          setLoadState('ready');
        }
      } catch {
        if (!cancelled) setLoadState('error');
      }
    }
    loadCanvas();
    return () => {
      cancelled = true;
    };
  }, [clubId]);

  // Compute total aesthetic vibe score
  const totalScore = grid.flat().reduce((acc, cellId) => {
    if (!cellId) return acc;
    const item = CLUB_PALETTE.find((p) => p.id === cellId);
    return acc + (item?.score ?? 0);
  }, 0);

  const placedCount = grid.flat().filter(Boolean).length;

  const handleCellClick = (r: number, c: number) => {
    if (loadState !== 'ready') return;
    setGrid((prev) => {
      const next = prev.map((row) => [...row]);
      const row = next[r];
      if (!row) return next;
      const current = row[c];

      if (current !== null && current !== undefined) {
        // If occupied, only officer can remove, or member can remove ALL-tier
        const currentItem = CLUB_PALETTE.find((p) => p.id === current);
        if (!isOfficer && currentItem?.roleRequired === 'OFFICER') {
          alert('운영진 전용 상징 가구는 방장 또는 매니저만 이동/회수할 수 있습니다.');
          return next;
        }
        row[c] = null;
      } else if (selectedFurniture) {
        if (!isOfficer && selectedFurniture.roleRequired === 'OFFICER') {
          alert('이 가구는 클럽 운영진(방장/매니저) 전용 배치 아이템입니다.');
          return next;
        }
        row[c] = selectedFurniture.id;
      }
      return next;
    });
  };

  const handleReset = () => {
    if (!isOfficer) {
      alert('클럽하우스 캔버스 전체 초기화는 운영진만 실행할 수 있습니다.');
      return;
    }
    if (window.confirm('클럽하우스 가구 배치를 기본 상태로 되돌리시겠습니까?')) {
      setGrid(createStarterClubGrid());
    }
  };

  const handleExportJson = () => {
    const layout = {
      clubId,
      clubName,
      grid,
      totalScore,
      updatedAt: new Date().toISOString(),
    };
    navigator.clipboard?.writeText(JSON.stringify(layout, null, 2));
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  const handleSaveServer = async () => {
    if (loadState !== 'ready') {
      setSaveMessage('서버 배치를 확인하기 전에는 저장할 수 없습니다.');
      return;
    }
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch(`/api/v1/clubs/${clubId}/canvas`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grid, totalScore }),
      });
      if (res.ok) {
        setSaveMessage('✓ 서버에 안전하게 영속 저장되었습니다.');
      } else {
        const err = await res.json();
        setSaveMessage(err.message || '저장에 실패했습니다.');
      }
    } catch {
      setSaveMessage('네트워크 저장 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };


  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-card/95 via-card/85 to-card/60 p-4 sm:p-6 shadow-md backdrop-blur-md">
      {/* 앰비언트 글로우 배경 */}
      <div
        className={`pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl transition-colors duration-700 ${
          isNightMode ? 'bg-indigo-600/20' : 'bg-amber-500/15'
        }`}
      />
      <div
        className={`pointer-events-none absolute -left-24 -bottom-24 h-72 w-72 rounded-full blur-3xl transition-colors duration-700 ${
          isNightMode ? 'bg-purple-600/20' : 'bg-primary/15'
        }`}
      />

      {/* 헤더 바 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500 border border-amber-500/30 shadow-inner">
            <LayoutGrid className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
                COOPERATIVE CANVAS 12x12
              </span>
              <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-300">
                클럽 인테리어 VIBE {totalScore}pt
              </span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
                내 권한: {isOfficer ? '운영진 (전체 편집)' : '일반 회원 (기부 슬롯)'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-foreground mt-0.5">
              {clubName} 공유 클럽하우스 캔버스
            </h2>
          </div>
        </div>

        {/* 액션 버튼 그룹 */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsNightMode((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
              isNightMode
                ? 'border-indigo-500/50 bg-indigo-500/20 text-indigo-300'
                : 'border-amber-500/50 bg-amber-500/20 text-amber-600 dark:text-amber-300'
            }`}
          >
            {isNightMode ? <Moon className="size-3.5" /> : <Sun className="size-3.5" />}
            <span>{isNightMode ? '나이트 뷰' : '데이라이트'}</span>
          </button>

          {isOfficer && (
            <button
              type="button"
              onClick={handleReset}
              title="기본 배치로 복원"
              className="inline-flex items-center gap-1 rounded-xl border border-border/70 bg-muted/40 px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted/70 hover:text-foreground active:scale-95"
            >
              <RotateCcw className="size-3.5" />
              <span className="hidden sm:inline">초기화</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSaveServer}
            disabled={isSaving || loadState !== 'ready'}
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 text-xs font-bold shadow-sm active:scale-95 transition-all"
          >
            <span>{isSaving ? '저장 중...' : '서버에 배치 저장'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportJson}
            className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-600 dark:text-amber-300 hover:bg-amber-500/20 active:scale-95"
          >
            {copiedNotification ? '✓ 복사됨' : '배치 JSON 복사'}
          </button>
        </div>
      </div>

      {loadState === 'loading' && (
        <div className="mt-3 rounded-xl border border-border/70 bg-muted/30 px-4 py-2 text-xs font-semibold text-muted-foreground">
          서버의 저장된 클럽 배치를 확인하는 중입니다.
        </div>
      )}
      {loadState === 'error' && (
        <div className="mt-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-2 text-xs font-semibold text-destructive">
          서버 배치를 불러오지 못했습니다. 기존 배치를 보호하기 위해 편집 저장을 차단했습니다.
        </div>
      )}
      {saveMessage && (
        <div className="mt-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          {saveMessage}
        </div>
      )}


      {/* 에디터 메인: 좌측 팔레트 + 우측 12x12 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6 pt-6">
        {/* 좌측 팔레트 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
              <Users className="size-3.5 text-amber-500" /> 클럽 공동 가구 팔레트
            </span>
            <span className="text-[11px] font-mono text-muted-foreground">
              배치 {placedCount}/144
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
            {CLUB_PALETTE.map((item) => {
              const isSelected = selectedFurniture?.id === item.id;
              const isLockedForUser = !isOfficer && item.roleRequired === 'OFFICER';

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedFurniture(item)}
                  className={`flex items-center justify-between rounded-xl border p-2.5 text-left transition-all ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500/15 text-foreground ring-1 ring-amber-500/40 shadow-sm'
                      : 'border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{item.icon}</span>
                    <div>
                      <p className="text-xs font-bold leading-tight flex items-center gap-1">
                        {item.name}
                        {isLockedForUser && <Lock className="size-3 text-muted-foreground" />}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        +{item.score} pt · {item.roleRequired === 'OFFICER' ? '운영진 전용' : '전체 기부 가능'}
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="rounded-xl bg-muted/30 p-3 border border-border/50 text-[11px] text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground flex items-center gap-1">
              <Info className="size-3 text-amber-500" /> 권한 정책 안내
            </p>
            <p>• 방장 및 매니저는 모든 타일을 자유롭게 배치 및 회수할 수 있습니다.</p>
            <p>• 일반 회원은 회원석/라운지/정원 등 자유 기부 가구를 배치할 수 있습니다.</p>
          </div>
        </div>

        {/* 우측 12x12 타일 그리드 뷰어 */}
        <div className="flex flex-col items-center justify-center">
          <div
            className={`relative rounded-2xl border-2 p-2 sm:p-4 shadow-inner transition-colors duration-500 overflow-x-auto max-w-full ${
              isNightMode
                ? 'border-indigo-500/40 bg-slate-950/90'
                : 'border-border/80 bg-amber-500/5'
            }`}
          >
            {/* 12x12 그리드 */}
            <div className="grid grid-cols-12 gap-1 sm:gap-1.5 min-w-[320px]">
              {grid.map((row, r) =>
                row.map((cellId, c) => {
                  const item = cellId ? CLUB_PALETTE.find((p) => p.id === cellId) : null;
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
                      className={`group relative flex size-7 sm:size-9 md:size-11 items-center justify-center rounded-lg sm:rounded-xl border text-sm sm:text-base md:text-xl transition-all duration-150 active:scale-90 ${
                        item
                          ? `${item.color} shadow-sm font-bold scale-[1.02]`
                          : isNightMode
                            ? 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-800/80'
                            : 'border-border/40 bg-background/60 hover:border-border hover:bg-muted/30'
                      }`}
                    >
                      {item ? (
                        <span className="select-none transition-transform group-hover:scale-110">
                          {item.icon}
                        </span>
                      ) : (
                        <span className="text-[8px] font-mono text-muted-foreground/20 opacity-0 group-hover:opacity-100 transition-opacity">
                          {r},{c}
                        </span>
                      )}
                    </button>
                  );
                }),
              )}
            </div>

            {/* 그리드 하단 상태 바 */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-2 text-[11px] text-muted-foreground font-mono">
              <span>{clubName} 클럽하우스 12x12</span>
              <span className="text-amber-500 font-bold">클럽 결속 VIBE: {totalScore}점</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
