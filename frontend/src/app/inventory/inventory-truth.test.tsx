import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { sampleHolding } from '@/testing/inventory-holding-fixture';

const { api, apiOrNull, gate } = vi.hoisted(() => ({
  api: vi.fn(),
  apiOrNull: vi.fn(),
  gate: vi.fn(),
}));
vi.mock('@/lib/api', () => ({ api, apiOrNull }));
vi.mock('@/lib/session', () => ({ requireMember: gate }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
import Page, { metadata } from './page';

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('INVENTORY_LIFECYCLE_DETAILS_ENABLED', '');
  apiOrNull.mockResolvedValue({ chosenName: 'Member' });
});

afterEach(() => vi.unstubAllEnvs());

describe('member inventory evidence and condition', () => {
  it('does not present a backend outage as a verified zero inventory', async () => {
    api.mockRejectedValueOnce(new Error('upstream 503'));
    const html = renderToStaticMarkup(await Page());
    expect(html).toContain('보관함 정보를 확인할 수 없습니다');
    expect(html).not.toContain('보유한 아이템이 없습니다');
    expect(html).not.toContain('보유 중인 치장 아이템:');
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
  it('distinguishes malformed success from verified empty', async () => {
    api.mockResolvedValueOnce({ holdings: null });
    expect(renderToStaticMarkup(await Page())).toContain('보관함 정보를 확인할 수 없습니다');
    api.mockResolvedValueOnce({ holdings: [] });
    expect(renderToStaticMarkup(await Page())).toContain('보유한 아이템이 없습니다');
  });
  it('keeps condition details hidden by default and shows source-labelled details only when enabled', async () => {
    api.mockResolvedValue({ holdings: [sampleHolding] });
    expect(renderToStaticMarkup(await Page())).not.toContain('상태 상세 보기');
    vi.stubEnv('INVENTORY_LIFECYCLE_DETAILS_ENABLED', 'true');
    const html = renderToStaticMarkup(await Page());
    expect(html).toContain('상태 상세 보기');
    expect(html).toContain('9007199254740993');
    expect(html).toContain('납부 완료를 증명하지 않습니다');
    expect(html).not.toContain('영구 유지</dd>');
  });
});
