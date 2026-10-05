import { describe, it, expect, vi } from 'vitest';
import { drawViralCardToCanvas } from './viral-share-card';
import type { ViralCardPayload } from './viral-share-card';

describe('viral-share-card unit tests', () => {
  it('should safely execute drawViralCardToCanvas on mocked 2D context', () => {
    const mockCtx = {
      createLinearGradient: vi.fn().mockReturnValue({
        addColorStop: vi.fn(),
      }),
      createRadialGradient: vi.fn().mockReturnValue({
        addColorStop: vi.fn(),
      }),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      font: '',
      textAlign: '',
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      arcTo: vi.fn(),
      closePath: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      fillText: vi.fn(),
    };

    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn().mockReturnValue(mockCtx),
    } as unknown as HTMLCanvasElement;

    const payload: ViralCardPayload = {
      category: '물타기 진단서',
      title: '삼성전자 -20% 탈출 시나리오',
      subtitle: '목표 평단가 64,200원',
      keyMetricLabel: '탈출 성공률',
      keyMetricValue: '92.5%',
      badgeText: '🔥 초우량 시나리오',
      recommendationNote: '분할 매수를 통해 평단가를 대폭 낮췄습니다.',
      metrics: [
        { label: '기존 평단가', value: '75,000원' },
        { label: '추가 매수액', value: '1,500만원' },
        { label: '손익분기점', value: '64,200원' },
      ],
    };

    // Square 1080x1080
    drawViralCardToCanvas(mockCanvas, payload, 'square');
    expect(mockCanvas.width).toBe(1080);
    expect(mockCanvas.height).toBe(1080);
    expect(mockCtx.fillRect).toHaveBeenCalled();
    expect(mockCtx.fillText).toHaveBeenCalled();

    // Wide 1200x630
    drawViralCardToCanvas(mockCanvas, payload, 'wide');
    expect(mockCanvas.width).toBe(1200);
    expect(mockCanvas.height).toBe(630);
  });
});
