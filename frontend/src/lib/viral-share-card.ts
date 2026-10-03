/**
 * SNS & 오픈채팅 1초 바이럴 공유 카드 렌더링 엔진
 * HTML5 Canvas 2D 기반 무의존성 고해상도 그래픽 생성기
 */

export type CardAspect = 'square' | 'wide'; // 1080x1080 (인스타/카톡) vs 1200x630 (트위터/디스코드)

export interface MetricHighlight {
  label: string;
  value: string;
  change?: string | undefined;
  isPositive?: boolean | undefined;
}

export interface ViralCardPayload {
  category: string; // 예: "물타기 진단서", "복리 적금 시뮬레이션", "부동산 임대 수익률", "김치프리미엄", "양도세 절세"
  title: string; // 예: "삼성전자 -25.4% 탈출 시나리오", "1억 모으기 5년 플랜"
  subtitle?: string | undefined;
  keyMetricLabel: string; // 예: "목표 평단가", "만기 세후 총액", "연간 순수익률(Cap Rate)"
  keyMetricValue: string; // 예: "64,200원", "108,420,000원", "7.85%"
  keyMetricSubtext?: string | undefined; // 보조 설명 문구
  metrics?: MetricHighlight[] | undefined; // 보조 지표 3~4개
  summaryRows?: MetricHighlight[] | undefined; // 요약 행 (metrics 대체 호환)
  badgeText?: string | undefined; // 예: "🔥 탈출 성공률 92%", "💎 복리의 마법 A등급", "🏆 3섹터 분산 달성"
  accentColor?: string | undefined; // 테마 강조 색상
  recommendationNote?: string | undefined; // 한줄 총평/조언
  shareUrl?: string | undefined; // 비회원이 클릭 시 진입할 링크
}

/**
 * Canvas 2D로 바이럴 카드를 렌더링합니다.
 */
export function drawViralCardToCanvas(
  canvas: HTMLCanvasElement,
  payload: ViralCardPayload,
  aspect: CardAspect = 'square'
): void {
  const width = aspect === 'square' ? 1080 : 1200;
  const height = aspect === 'square' ? 1080 : 630;

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 1. 다크 모던 핀테크 배경 (Slate/Zinc 그라데이션)
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#090d16');
  bgGrad.addColorStop(0.5, '#0d1322');
  bgGrad.addColorStop(1, '#050811');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 미세 그리드 배경 장식
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 1;
  const step = 40;
  for (let x = 0; x < width; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // 2. 외곽 네온 림 하이라이트 & 내부 카드 래퍼
  const pad = aspect === 'square' ? 60 : 40;
  const cardW = width - pad * 2;
  const cardH = height - pad * 2;
  const cardX = pad;
  const cardY = pad;

  // 메인 카드 배경
  ctx.save();
  ctx.fillStyle = 'rgba(18, 24, 38, 0.85)';
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
  ctx.lineWidth = 2;
  roundRect(ctx, cardX, cardY, cardW, cardH, 28);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 상단 글로우 스팟
  const glowGrad = ctx.createRadialGradient(cardX + cardW / 2, cardY, 10, cardX + cardW / 2, cardY, cardW / 2);
  glowGrad.addColorStop(0, 'rgba(16, 185, 129, 0.15)');
  glowGrad.addColorStop(1, 'rgba(16, 185, 129, 0)');
  ctx.fillStyle = glowGrad;
  roundRect(ctx, cardX, cardY, cardW, cardH, 28);
  ctx.fill();

  let curY = cardY + (aspect === 'square' ? 70 : 50);

  // 3. 상단 헤더: 카테고리 뱃지 & 브랜드
  ctx.save();
  // 카테고리 뱃지
  ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 1.5;
  roundRect(ctx, cardX + 40, curY - 24, 180, 42, 10);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#34d399';
  ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(payload.category, cardX + 130, curY + 4);

  // 우측 상단 브랜드 로고
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('월덕 머니버스 핀테크', cardX + cardW - 40, curY + 4);
  ctx.restore();

  curY += aspect === 'square' ? 75 : 55;

  // 4. 타이틀 및 서브타이틀
  ctx.save();
  ctx.fillStyle = '#f8fafc';
  ctx.font = `bold ${aspect === 'square' ? '46px' : '36px'} -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText(payload.title, cardX + 40, curY);

  const subtitleText = payload.subtitle || payload.keyMetricSubtext;
  if (subtitleText) {
    curY += aspect === 'square' ? 42 : 32;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '22px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
    ctx.fillText(subtitleText, cardX + 40, curY);
  }
  ctx.restore();

  curY += aspect === 'square' ? 60 : 45;

  // 5. 핵심 진단 수치 대형 카드 (Hero Metric Card)
  const heroH = aspect === 'square' ? 180 : 130;
  ctx.save();
  const heroGrad = ctx.createLinearGradient(cardX + 40, curY, cardX + cardW - 40, curY + heroH);
  heroGrad.addColorStop(0, 'rgba(30, 41, 59, 0.9)');
  heroGrad.addColorStop(1, 'rgba(15, 23, 42, 0.9)');
  ctx.fillStyle = heroGrad;
  ctx.strokeStyle = 'rgba(52, 211, 153, 0.4)';
  ctx.lineWidth = 1.5;
  roundRect(ctx, cardX + 40, curY, cardW - 80, heroH, 20);
  ctx.fill();
  ctx.stroke();

  // 핵심 지표 라벨
  ctx.fillStyle = '#a7f3d0';
  ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
  ctx.fillText(payload.keyMetricLabel, cardX + 70, curY + (aspect === 'square' ? 50 : 38));

  // 핵심 지표 대형 값
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${aspect === 'square' ? '68px' : '52px'} "Geist Mono", "JetBrains Mono", monospace`;
  ctx.fillText(payload.keyMetricValue, cardX + 70, curY + (aspect === 'square' ? 125 : 95));

  // 우측 상단 뱃지 (존재 시)
  if (payload.badgeText) {
    ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    roundRect(ctx, cardX + cardW - 270, curY + 30, 190, 44, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 19px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(payload.badgeText, cardX + cardW - 175, curY + 58);
  }
  ctx.restore();

  curY += heroH + (aspect === 'square' ? 45 : 30);

  // 6. 보조 지표 3열 그리드 (Sub Metrics)
  const rawList = payload.metrics ?? payload.summaryRows ?? [];
  const cols = rawList.slice(0, 3);
  if (cols.length > 0) {
    const colW = (cardW - 80 - (cols.length - 1) * 20) / cols.length;
    const colH = aspect === 'square' ? 130 : 95;

    cols.forEach((m, idx) => {
      const colX = cardX + 40 + idx * (colW + 20);
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      roundRect(ctx, colX, curY, colW, colH, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '17px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(m.label, colX + 24, curY + (aspect === 'square' ? 42 : 32));

      ctx.fillStyle = '#f1f5f9';
      ctx.font = `bold ${aspect === 'square' ? '28px' : '22px'} "Geist Mono", monospace`;
      ctx.fillText(m.value, colX + 24, curY + (aspect === 'square' ? 88 : 68));

      if (m.change) {
        ctx.fillStyle = m.isPositive ? '#34d399' : '#f87171';
        ctx.font = 'bold 16px -apple-system, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(m.change, colX + colW - 20, curY + (aspect === 'square' ? 88 : 68));
      }
      ctx.restore();
    });

    curY += colH + (aspect === 'square' ? 40 : 25);
  }

  // 7. 총평 / 인사이트 가이드 박스 (Square 뷰에서 풍부하게 렌더링)
  if (aspect === 'square' && payload.recommendationNote) {
    const noteH = 110;
    ctx.save();
    ctx.fillStyle = 'rgba(30, 41, 59, 0.5)';
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.lineWidth = 1;
    roundRect(ctx, cardX + 40, curY, cardW - 80, noteH, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
    ctx.fillText('💡 AI 시뮬레이션 인사이트', cardX + 65, curY + 38);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '19px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
    ctx.fillText(payload.recommendationNote, cardX + 65, curY + 75);
    ctx.restore();

    curY += noteH + 35;
  }

  // 8. 하단 푸터 바: 즉시 수정 계산 CTA & URL 안내
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cardX + 40, cardY + cardH - (aspect === 'square' ? 90 : 65));
  ctx.lineTo(cardX + cardW - 40, cardY + cardH - (aspect === 'square' ? 90 : 65));
  ctx.stroke();

  ctx.fillStyle = '#64748b';
  ctx.font = '18px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('🔗 링크를 열면 이 조건 그대로 1초 만에 무료 수정 계산이 가능합니다', cardX + 40, cardY + cardH - (aspect === 'square' ? 40 : 28));

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('easy-scraping.com', cardX + cardW - 40, cardY + cardH - (aspect === 'square' ? 40 : 28));
  ctx.restore();
}

/**
 * 둥근 모서리 사각형 경로 도우미
 */
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * Blob 생성 및 PNG 다운로드
 */
export async function downloadViralCardPng(canvas: HTMLCanvasElement, filename = 'moneyverse-diagnosis-card.png'): Promise<void> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) return resolve();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      resolve();
    }, 'image/png');
  });
}

/**
 * 클립보드에 이미지 복사 (지원 브라우저)
 */
export async function copyViralCardToClipboard(canvas: HTMLCanvasElement): Promise<boolean> {
  try {
    if (!navigator.clipboard || !window.ClipboardItem) return false;
    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) return resolve(false);
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          resolve(true);
        } catch {
          resolve(false);
        }
      }, 'image/png');
    });
  } catch {
    return false;
  }
}
