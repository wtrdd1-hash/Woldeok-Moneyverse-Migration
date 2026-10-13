export type DrawingToolType = 'cursor' | 'trendline' | 'horizontal' | 'fibonacci';

export interface ChartDrawingItem {
  readonly id: string;
  readonly type: Exclude<DrawingToolType, 'cursor'>;
  readonly x1: number;
  readonly y1: number;
  readonly x2?: number | undefined;
  readonly y2?: number | undefined;
  readonly price1?: number | undefined;
  readonly price2?: number | undefined;
  readonly color?: string | undefined;
  readonly createdAt: number;
}

export const FIBONACCI_LEVELS = [
  { ratio: 1.0, label: '100.0%', color: '#94a3b8' },
  { ratio: 0.618, label: '61.8% (황금비)', color: '#38bdf8' },
  { ratio: 0.5, label: '50.0% (중간)', color: '#34d399' },
  { ratio: 0.382, label: '38.2%', color: '#fbbf24' },
  { ratio: 0.0, label: '0.0%', color: '#f87171' },
] as const;

export function getDrawingStorageKey(symbol: string): string {
  return `wdmv_chart_drawings_${symbol.toUpperCase()}_v1`;
}
