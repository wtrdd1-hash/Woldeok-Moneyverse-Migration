/**
 * Decorative hero scenes from the approved G1 mockups
 * (docs/design/game-ui-v2026.11.24.G1). Purely illustrative: aria-hidden, no
 * data, and every colour comes from a --g1-* token so the art follows the theme.
 * Server-renderable on purpose; the scenes carry no state.
 */
import type { CSSProperties } from 'react';

export type G1SceneKind = 'skyline' | 'vault' | 'chart' | 'board' | 'stall' | 'tavern' | 'citadel' | 'lab' | 'gate';

const fill = (token: string, opacity?: number): CSSProperties => ({ fill: `var(${token})`, ...(opacity === undefined ? {} : { opacity }) });
const stroke = (token: string, width = 1, opacity?: number): CSSProperties => ({
  fill: 'none',
  stroke: `var(${token})`,
  strokeWidth: width,
  ...(opacity === undefined ? {} : { strokeOpacity: opacity }),
});

function Stars({ w, h }: { readonly w: number; readonly h: number }) {
  return (
    <>
      {Array.from({ length: 22 }, (_, i) => (
        <circle key={i} cx={(i * 97) % w} cy={(i * 53) % (h / 2)} r={1 + (i % 3) * 0.5} style={fill('--g1-moon', 0.25 + (i % 4) * 0.15)} />
      ))}
    </>
  );
}

function Body({ kind, h }: { readonly kind: G1SceneKind; readonly h: number }) {
  switch (kind) {
    case 'skyline':
      return (
        <>
          {[
            [10, 70, 90],
            [90, 110, 60],
            [160, 50, 130],
            [220, 90, 80],
            [320, 60, 120],
            [390, 80, 70],
          ].map(([x, bw, bh]) => (
            <g key={x}>
              <rect x={x} y={h - bh!} width={Math.round(bw! * 0.7)} height={bh} style={{ ...fill('--g1-plum-2'), stroke: 'var(--g1-line)' }} />
              {[0, 1, 2].map((k) => (
                <rect key={k} x={x! + 8 + k * 14} y={h - bh! + 14} width={4} height={7} style={fill('--g1-gold', k === 1 ? 0.55 : 0.25)} />
              ))}
            </g>
          ))}
        </>
      );
    case 'vault':
      return (
        <>
          <circle cx={150} cy={h - 70} r={62} style={{ ...fill('--g1-plum-2'), stroke: 'var(--g1-gold)', strokeWidth: 4 }} />
          <circle cx={150} cy={h - 70} r={40} style={{ ...stroke('--g1-gold'), strokeDasharray: '6 6' }} />
          <rect x={146} y={h - 110} width={8} height={80} transform={`rotate(35 150 ${h - 70})`} style={fill('--g1-gold')} />
          {Array.from({ length: 6 }, (_, i) => (
            <ellipse key={i} cx={270 + i * 34} cy={h - 22 - (i % 3) * 10} rx={16} ry={6} style={{ ...fill('--g1-gold'), stroke: 'var(--g1-gold-deep)' }} />
          ))}
        </>
      );
    case 'chart': {
      let y = h - 60;
      const pts: string[] = [];
      const bars = Array.from({ length: 14 }, (_, i) => {
        const o = y;
        y = Math.max(30, Math.min(h - 20, y + (i % 3 ? -18 : 22) + (i % 5) * 3));
        pts.push(`${26 + i * 26},${y}`);
        return <rect key={i} x={20 + i * 26} y={Math.min(o, y)} width={12} height={Math.abs(o - y) + 4} style={fill(y < o ? '--g1-mint' : '--g1-ember')} />;
      });
      return (
        <>
          {bars}
          <polyline points={pts.join(' ')} style={stroke('--g1-gold', 2)} />
        </>
      );
    }
    case 'board':
      return (
        <>
          <rect x={40} y={40} width={300} height={h - 50} rx={6} style={{ ...fill('--g1-plum-2'), stroke: 'var(--g1-gold-deep)', strokeWidth: 4 }} />
          {[
            [60, 60],
            [150, 70],
            [240, 58],
            [90, 120],
            [200, 125],
          ].map(([x, yy], i) => (
            <g key={i} transform={`rotate(${((i % 3) - 1) * 4} ${x! + 36} ${yy! + 25})`}>
              <rect x={x} y={yy} width={72} height={50} style={fill('--g1-moon', 0.9)} />
              <circle cx={x! + 36} cy={yy! + 4} r={4} style={fill('--g1-ember')} />
            </g>
          ))}
        </>
      );
    case 'stall':
      return (
        <>
          <path d="M40 70 L360 70 L340 40 L60 40 Z" style={fill('--g1-violet')} />
          {Array.from({ length: 8 }, (_, i) => (
            <path key={i} d={`M${60 + i * 40} 70 q20 24 40 0`} style={fill(i % 2 ? '--g1-gold' : '--g1-violet-ink')} />
          ))}
          <rect x={60} y={94} width={280} height={h - 100} style={{ ...fill('--g1-plum-2'), stroke: 'var(--g1-gold)', strokeOpacity: 0.5 }} />
          {['--g1-rare-common', '--g1-rare-rare', '--g1-rare-epic', '--g1-gold'].map((token, i) => (
            <rect key={token} x={80 + i * 64} y={h - 70} width={44} height={44} rx={6} style={{ ...fill('--g1-plum'), stroke: `var(${token})`, strokeWidth: 3 }} />
          ))}
        </>
      );
    case 'tavern':
      return (
        <>
          <rect x={40} y={h - 90} width={320} height={16} style={fill('--g1-gold-deep')} />
          {Array.from({ length: 4 }, (_, i) => (
            <rect key={i} x={70 + i * 70} y={h - 130} width={28} height={40} rx={4} style={fill('--g1-gold', 0.85)} />
          ))}
          <path d="M60 60 h120 a14 14 0 0 1 14 14 v30 a14 14 0 0 1 -14 14 h-80 l-20 18 v-18 h-20 a14 14 0 0 1 -14 -14 v-30 a14 14 0 0 1 14 -14z" style={fill('--g1-violet', 0.8)} />
        </>
      );
    case 'citadel':
      return (
        <>
          <path d={`M80 ${h} V90 l30 -30 l30 30 V${h}z M200 ${h} V60 l40 -40 l40 40 V${h}z`} style={{ ...fill('--g1-plum-3'), stroke: 'var(--g1-ember)', strokeOpacity: 0.5 }} />
          {['--g1-mint', '--g1-gold', '--g1-mint', '--g1-ember'].map((token, i) => (
            <circle key={i} cx={240} cy={80 + i * 28} r={5} style={fill(token)} />
          ))}
        </>
      );
    case 'lab':
      return (
        <>
          <path d="M120 50 h40 v40 l40 70 a14 14 0 0 1 -12 20 h-96 a14 14 0 0 1 -12 -20 l40 -70z" style={{ ...fill('--g1-plum-2'), stroke: 'var(--g1-mint)', strokeWidth: 3 }} />
          <path d="M96 150 h128 l-10 22 h-108z" style={fill('--g1-mint', 0.6)} />
        </>
      );
    case 'gate':
    default:
      return (
        <>
          <path d={`M120 ${h} V90 a80 80 0 0 1 160 0 V${h}z`} style={{ ...fill('--g1-plum-2'), stroke: 'var(--g1-gold)', strokeWidth: 4 }} />
          <path d={`M150 ${h} V100 a50 50 0 0 1 100 0 V${h}z`} style={fill('--g1-night')} />
        </>
      );
  }
}

export function G1Scene({ kind, className }: { readonly kind: G1SceneKind; readonly className?: string | undefined }) {
  const w = 520;
  const h = 200;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMaxYMax slice" aria-hidden="true" focusable="false" className={className}>
      <Stars w={w} h={h} />
      {/* A crescent reads as night without a flat disc dominating the banner. */}
      <circle cx={w - 90} cy={52} r={26} style={fill('--g1-gold', 0.9)} />
      <circle cx={w - 80} cy={46} r={24} style={fill('--g1-plum')} />
      <Body kind={kind} h={h} />
    </svg>
  );
}
