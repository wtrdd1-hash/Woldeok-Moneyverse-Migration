'use client';

import React from 'react';
import {
  MousePointer,
  TrendingUp,
  Minus,
  Layers,
  Trash2,
} from 'lucide-react';
import type { DrawingToolType } from './stock-chart-drawing.types';

interface StockChartDrawingToolbarProps {
  readonly activeTool: DrawingToolType;
  readonly onSelectTool: (tool: DrawingToolType) => void;
  readonly drawingCount: number;
  readonly onClearAll: () => void;
  readonly isEn?: boolean | undefined;
}

export function StockChartDrawingToolbar({
  activeTool,
  onSelectTool,
  drawingCount,
  onClearAll,
  isEn = false,
}: StockChartDrawingToolbarProps) {
  return (
    <div
      className="inline-flex items-center gap-0.5 rounded-xl border border-border/80 bg-background/95 backdrop-blur-md p-1 shadow-md z-10 text-xs select-none"
      role="toolbar"
      aria-label={isEn ? 'Chart Drawing Tools' : '차트 작도 도구 모음'}
    >
      {/* 1. 기본 커서 / 선택 모드 */}
      <button
        type="button"
        onClick={() => onSelectTool('cursor')}
        aria-pressed={activeTool === 'cursor'}
        title={isEn ? 'Cursor / Pan (Esc)' : '기본 커서 / 탐색 (Esc)'}
        className={`flex items-center justify-center size-7 rounded-lg transition-all ${
          activeTool === 'cursor'
            ? 'bg-primary text-primary-foreground shadow-xs font-bold'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
        }`}
      >
        <MousePointer className="size-3.5" />
      </button>

      {/* 2. 추세선 (Trendline) */}
      <button
        type="button"
        onClick={() => onSelectTool('trendline')}
        aria-pressed={activeTool === 'trendline'}
        title={isEn ? 'Trendline (Drag start to end)' : '추세선 (시작점~끝점 드래그)'}
        className={`flex items-center justify-center size-7 rounded-lg transition-all ${
          activeTool === 'trendline'
            ? 'bg-sky-500 text-white shadow-xs font-bold ring-1 ring-sky-400'
            : 'text-muted-foreground hover:text-sky-400 hover:bg-muted/60'
        }`}
      >
        <TrendingUp className="size-3.5" />
      </button>

      {/* 3. 수평선 (Horizontal Support/Resistance Line) */}
      <button
        type="button"
        onClick={() => onSelectTool('horizontal')}
        aria-pressed={activeTool === 'horizontal'}
        title={isEn ? 'Horizontal Line (Support/Resistance)' : '수평 지지/저항선 (원클릭)'}
        className={`flex items-center justify-center size-7 rounded-lg transition-all ${
          activeTool === 'horizontal'
            ? 'bg-emerald-500 text-white shadow-xs font-bold ring-1 ring-emerald-400'
            : 'text-muted-foreground hover:text-emerald-400 hover:bg-muted/60'
        }`}
      >
        <Minus className="size-3.5" />
      </button>

      {/* 4. 피보나치 되돌림 (Fibonacci Retracement) */}
      <button
        type="button"
        onClick={() => onSelectTool('fibonacci')}
        aria-pressed={activeTool === 'fibonacci'}
        title={isEn ? 'Fibonacci Retracement (High to Low)' : '피보나치 5단계 되돌림 (고점~저점)'}
        className={`flex items-center justify-center size-7 rounded-lg transition-all ${
          activeTool === 'fibonacci'
            ? 'bg-amber-500 text-white shadow-xs font-bold ring-1 ring-amber-400'
            : 'text-muted-foreground hover:text-amber-400 hover:bg-muted/60'
        }`}
      >
        <Layers className="size-3.5" />
      </button>

      {/* 구분선 */}
      <div className="w-[1px] h-4 bg-border/80 mx-0.5" />

      {/* 5. 드로잉 개수 및 전체 지우기 */}
      <button
        type="button"
        onClick={onClearAll}
        disabled={drawingCount === 0}
        title={isEn ? `Clear All Drawings (${drawingCount})` : `작도 전체 지우기 (${drawingCount}개)`}
        className={`flex items-center justify-center size-7 rounded-lg transition-all ${
          drawingCount > 0
            ? 'text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 active:scale-95'
            : 'text-muted-foreground/30 cursor-not-allowed'
        }`}
      >
        <Trash2 className="size-3.5" />
      </button>

      {drawingCount > 0 && (
        <span className="text-[10px] font-mono font-bold text-muted-foreground px-1 select-none">
          {drawingCount}
        </span>
      )}
    </div>
  );
}
