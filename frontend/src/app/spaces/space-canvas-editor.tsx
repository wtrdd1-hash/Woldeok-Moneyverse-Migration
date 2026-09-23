'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';

interface FurnitureItem {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
  readonly score: number;
  readonly color: string;
}

const PALETTE: FurnitureItem[] = [
  { id: 'desk', name: '월넛 데스크', icon: '🖥️', score: 25, color: 'bg-amber-500/20 border-amber-500/40 text-amber-500' },
  { id: 'chair', name: '에르고 체어', icon: '🪑', score: 15, color: 'bg-sky-500/20 border-sky-500/40 text-sky-500' },
  { id: 'server', name: '서버 랙', icon: '🗄️', score: 40, color: 'bg-indigo-500/20 border-indigo-500/40 text-indigo-500' },
  { id: 'trophy', name: '명예 트로피장', icon: '🏆', score: 50, color: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-500' },
  { id: 'safe', name: '월덕 비밀금고', icon: '🔒', score: 35, color: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-500' },
  { id: 'plant', name: '몬스테라 화분', icon: '🪴', score: 10, color: 'bg-green-500/20 border-green-500/40 text-green-500' },
  { id: 'neon', name: '네온 사인', icon: '✨', score: 30, color: 'bg-fuchsia-500/20 border-fuchsia-500/40 text-fuchsia-500' },
  { id: 'coffee', name: '에스프레소 머신', icon: '☕', score: 20, color: 'bg-orange-500/20 border-orange-500/40 text-orange-500' },
];

const GRID_SIZE = 8;

function createStarterGrid(): (string | null)[][] {
  const initial: (string | null)[][] = Array.from({ length: GRID_SIZE }, () =>
    Array<string | null>(GRID_SIZE).fill(null),
  );
  const place = (r: number, c: number, id: string) => {
    const row = initial[r];
    if (row) row[c] = id;
  };
  place(2, 3, 'desk');
  place(3, 3, 'chair');
  place(1, 1, 'trophy');
  place(1, 6, 'safe');
  place(6, 1, 'plant');
  return initial;
}

export function SpaceCanvasEditor({
  spaceName = '스타터 룸',
  spaceType = 'SPACE_ROOM_STARTER',
}: {
  readonly spaceName?: string;
  readonly spaceType?: string;
}) {
  // 8x8 grid state (null or FurnitureItem id)
  const [grid, setGrid] = useState<(string | null)[][]>(createStarterGrid);

  const [selectedFurniture, setSelectedFurniture] = useState<FurnitureItem | null>(PALETTE[0] ?? null);
  const [isNightMode, setIsNightMode] = useState<boolean>(false);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  // Compute total aesthetic vibe score
  const totalScore = grid.flat().reduce((acc, cellId) => {
    if (!cellId) return acc;
    const item = PALETTE.find((p) => p.id === cellId);
    return acc + (item?.score ?? 0);
  }, 0);

  const placedCount = grid.flat().filter(Boolean).length;

  const handleCellClick = (r: number, c: number) => {
    setGrid((prev) => {
      const next = prev.map((row) => [...row]);
      const row = next[r];
      if (!row) return next;
      if (row[c] !== null && row[c] !== undefined) {
        // If clicked on occupied cell, remove it
        row[c] = null;
      } else if (selectedFurniture) {
        // Place selected furniture
        row[c] = selectedFurniture.id;
      }
      return next;
    });
  };

  const handleReset = () => {
    if (window.confirm('룸 배치를 초기 기본 상태로 되돌리시겠습니까?')) {
      setGrid(createStarterGrid());
    }
  };

  const handleClearAll = () => {
    setGrid(
      Array(GRID_SIZE)
        .fill(null)
        .map(() => Array(GRID_SIZE).fill(null)),
    );
  };

  const handleExportJson = () => {
    const layout = {
      spaceName,
      spaceType,
      grid,
      totalScore,
      updatedAt: new Date().toISOString(),
    };
    navigator.clipboard?.writeText(JSON.stringify(layout, null, 2));
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-card/95 via-card/85 to-card/60 p-5 sm:p-7 shadow-md backdrop-blur-md mb-8">
      {/* 앰비언트 백그라운드 조명 */}
      <div
        className={`pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl transition-colors duration-700 ${
          isNightMode ? 'bg-indigo-600/20' : 'bg-amber-400/15'
        }`}
      />
      <div
        className={`pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full blur-3xl transition-colors duration-700 ${
          isNightMode ? 'bg-purple-600/20' : 'bg-sky-400/15'
        }`}
      />

      {/* 헤더 바 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-inner">
            <LayoutGrid className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                SPACE CANVAS 8x8
              </span>
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                룸 분위기 점수 {totalScore}pt
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-foreground mt-0.5">
              프라이빗 룸 캔버스 & 인터랙티브 가구 배치
            </h2>
          </div>
        </div>

        {/* 조명 모드 및 액션 버튼들 */}
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

          <button
            type="button"
            onClick={handleReset}
            title="기본 배치로 복원"
            className="inline-flex items-center gap-1 rounded-xl border border-border/70 bg-muted/40 px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted/70 hover:text-foreground active:scale-95"
          >
            <RotateCcw className="size-3.5" />
            <span className="hidden sm:inline">초기화</span>
          </button>

          <button
            type="button"
            onClick={handleClearAll}
            title="모두 비우기"
            className="rounded-xl border border-border/70 bg-muted/40 px-2.5 py-1.5 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 active:scale-95"
          >
            전체 비우기
          </button>

          <button
            type="button"
            onClick={handleExportJson}
            className="rounded-xl border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 active:scale-95"
          >
            {copiedNotification ? '✓ 복사됨' : '배치 JSON 복사'}
          </button>
        </div>
      </div>

      {/* 에디터 메인 영역: 팔레트 + 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 pt-6">
        {/* 좌측 팔레트 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
              <Layers className="size-3.5 text-primary" /> 인테리어 가구 팔레트
            </span>
            <span className="text-[11px] font-mono text-muted-foreground">
              배치 {placedCount}/64
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
            {PALETTE.map((item) => {
              const isSelected = selectedFurniture?.id === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedFurniture(item)}
                  className={`flex items-center justify-between rounded-xl border p-2.5 text-left transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/15 text-foreground ring-1 ring-primary/40 shadow-sm'
                      : 'border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{item.icon}</span>
                    <div>
                      <p className="text-xs font-bold leading-tight">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground">+{item.score} pt</p>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="size-2 rounded-full bg-primary animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="rounded-xl bg-muted/30 p-3 border border-border/50 text-[11px] text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground flex items-center gap-1">
              <Info className="size-3 text-primary" /> 사용 안내
            </p>
            <p>• 팔레트에서 가구를 선택한 뒤 타일을 클릭하여 배치합니다.</p>
            <p>• 이미 가구가 놓인 타일을 다시 클릭하면 회수됩니다.</p>
          </div>
        </div>

        {/* 우측 8x8 타일 그리드 뷰어 */}
        <div className="flex flex-col items-center justify-center">
          <div
            className={`relative rounded-2xl border-2 p-3 sm:p-4 shadow-inner transition-colors duration-500 ${
              isNightMode
                ? 'border-indigo-500/40 bg-slate-950/80'
                : 'border-border/80 bg-amber-500/5'
            }`}
          >
            {/* 8x8 그리드 */}
            <div className="grid grid-cols-8 gap-1.5 sm:gap-2">
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
                      className={`group relative flex size-9 sm:size-12 md:size-14 items-center justify-center rounded-xl border text-xl sm:text-2xl transition-all duration-150 active:scale-90 ${
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
                        <span className="text-[9px] font-mono text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity">
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
              <span>{spaceName} ({spaceType})</span>
              <span className="text-emerald-500 font-bold">인테리어 VIBE: {totalScore}점</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
