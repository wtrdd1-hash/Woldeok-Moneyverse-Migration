import { ImageResponse } from 'next/og';

export const alt = '월덕 머니버스 — Discord 커뮤니티 가상경제';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0d211b',
          color: '#f7f4e8',
          padding: '72px 84px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 28, letterSpacing: 3, color: '#a9d8bd' }}>
          WOLDEOK MONEYVERSE
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{ display: 'flex', fontSize: 72, fontWeight: 800, letterSpacing: -3 }}>
            월덕 머니버스
          </div>
          <div style={{ display: 'flex', fontSize: 38, color: '#d8e9dd' }}>
            Discord 커뮤니티 가상경제와 게임 보상
          </div>
        </div>
        <div style={{ display: 'flex', fontSize: 25, color: '#9fb8aa' }}>
          활동 기록 · WLD 보상 · 게임 상점 · 시즌 이벤트
        </div>
      </div>
    ),
    size,
  );
}
