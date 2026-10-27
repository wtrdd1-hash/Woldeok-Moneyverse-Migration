import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

vi.mock('@/lib/session', () => ({ adminConsole: vi.fn().mockResolvedValue({ consoleSession: { state: 'open' } }) }));
vi.mock('@/lib/api', () => ({ apiOrNull: vi.fn().mockResolvedValue(null) }));
vi.mock('next/navigation', () => ({ redirect: vi.fn() }));
vi.mock('./admin-quick-search', () => ({ AdminQuickUserSearch: () => null }));
vi.mock('./console-gate', () => ({ CloseConsole: () => null, OpenConsole: () => null }));
vi.mock('./components/telemetry-pulse', () => ({ TelemetryPulse: () => null }));
vi.mock('./components/admin-telemetry-metrics-table', () => ({ AdminTelemetryMetricsTable: () => <p>TELEMETRY TABLE</p> }));
vi.mock('./components/admin-comprehensive-telemetry-matrix', () => ({ AdminComprehensiveTelemetryMatrix: () => <p>GLOBAL MATRIX</p> }));

import AdminPage from './page';

describe('administrator cockpit API failure rendering', () => {
  it('withholds fabricated global population, all-green control and chain-integrity claims', async () => {
    const markup = renderToStaticMarkup(await AdminPage({ searchParams: Promise.resolve({}) }));
    expect(markup).toContain('일부 지표 확인 불가');
    expect(markup).toContain('원장 정합성 확인 불가');
    expect(markup).toContain('전체 인구 아님');
    expect(markup).not.toContain('14대 API 온라인');
    expect(markup).not.toContain('전 기능 정상 가동');
    expect(markup).not.toContain('SHA-256 원장 체인 무결성 확인');
    expect(markup).not.toContain('GLOBAL MATRIX');
    expect(markup).not.toContain('TELEMETRY TABLE');
  });
});
