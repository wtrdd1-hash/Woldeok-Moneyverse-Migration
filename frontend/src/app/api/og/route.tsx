import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const title = searchParams.get('title')?.slice(0, 100) || '월덕 머니버스';
    const description =
      searchParams.get('description')?.slice(0, 150) ||
      '가상경제와 커뮤니티 게임이 결합된 디스코드 연동 메타버스';
    const type = searchParams.get('type') || 'default';
    const badge =
      searchParams.get('badge') ||
      (type === 'stock'
        ? '가상 주식 시세'
        : type === 'board'
          ? '커뮤니티 토론'
          : type === 'announcement'
            ? '운영 공지'
            : type === 'quest'
              ? '퀘스트 & 도전과제'
              : '월덕 머니버스');
    const metric = searchParams.get('metric');
    const metricLabel = searchParams.get('metricLabel');
    const subMetric = searchParams.get('subMetric');

    const badgeColor =
      type === 'stock'
        ? { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)', text: '#34d399' }
        : type === 'announcement'
          ? { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)', text: '#fbbf24' }
          : type === 'board'
            ? { bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.4)', text: '#60a5fa' }
            : type === 'quest'
              ? { bg: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.4)', text: '#c084fc' }
              : { bg: 'rgba(234, 179, 8, 0.15)', border: 'rgba(234, 179, 8, 0.4)', text: '#fde047' };

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: '#090d16',
            backgroundImage:
              'radial-gradient(circle at 15% 20%, rgba(30, 58, 138, 0.35) 0%, transparent 45%), radial-gradient(circle at 85% 80%, rgba(88, 28, 135, 0.3) 0%, transparent 45%)',
            padding: '60px 70px',
            fontFamily: 'sans-serif',
            boxSizing: 'border-box',
          }}
        >
          {/* Header row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              {/* Brand icon / glyph */}
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '24px',
                  boxShadow: '0 0 24px rgba(245, 158, 11, 0.4)',
                }}
              >
                W
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <span
                  style={{
                    color: '#f8fafc',
                    fontSize: '22px',
                    fontWeight: 800,
                    letterSpacing: '-0.5px',
                  }}
                >
                  WOLDEOK MONEYVERSE
                </span>
                <span
                  style={{
                    color: '#94a3b8',
                    fontSize: '13px',
                    fontWeight: 600,
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                  }}
                >
                  Virtual Economy & Community
                </span>
              </div>
            </div>

            {/* Dynamic Category Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: badgeColor.bg,
                border: `1.5px solid ${badgeColor.border}`,
                borderRadius: '9999px',
                padding: '8px 20px',
                color: badgeColor.text,
                fontSize: '16px',
                fontWeight: 700,
                letterSpacing: '0.2px',
              }}
            >
              {badge}
            </div>
          </div>

          {/* Main title & description block */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              maxWidth: '960px',
              marginTop: '20px',
              marginBottom: '20px',
            }}
          >
            <h1
              style={{
                color: '#ffffff',
                fontSize: title.length > 30 ? '48px' : '56px',
                fontWeight: 900,
                lineHeight: 1.2,
                letterSpacing: '-1.5px',
                margin: 0,
                wordBreak: 'keep-all',
              }}
            >
              {title}
            </h1>
            <p
              style={{
                color: '#cbd5e1',
                fontSize: '22px',
                fontWeight: 500,
                lineHeight: 1.5,
                margin: 0,
                wordBreak: 'keep-all',
              }}
            >
              {description}
            </p>
          </div>

          {/* Footer & Metrics bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              paddingTop: '24px',
            }}
          >
            {/* Metric or sub-information */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
              }}
            >
              {metric && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '10px',
                  }}
                >
                  {metricLabel && (
                    <span
                      style={{
                        color: '#94a3b8',
                        fontSize: '16px',
                        fontWeight: 600,
                      }}
                    >
                      {metricLabel}
                    </span>
                  )}
                  <span
                    style={{
                      color: '#38bdf8',
                      fontSize: '28px',
                      fontWeight: 800,
                      letterSpacing: '-0.5px',
                    }}
                  >
                    {metric}
                  </span>
                  {subMetric && (
                    <span
                      style={{
                        color: subMetric.startsWith('+')
                          ? '#4ade80'
                          : subMetric.startsWith('-')
                            ? '#f87171'
                            : '#e2e8f0',
                        fontSize: '18px',
                        fontWeight: 700,
                      }}
                    >
                      {subMetric}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Right domain badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#64748b',
                fontSize: '16px',
                fontWeight: 600,
              }}
            >
              <span>easy-scraping.com</span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch {
    return new Response('Failed to generate OG image', { status: 500 });
  }
}
