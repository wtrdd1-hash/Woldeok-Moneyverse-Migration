import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { apiOrNull } from '@/lib/api';
import AiNewsPage from './page';

vi.mock('@/lib/api', () => ({ apiOrNull: vi.fn() }));
vi.mock('@/lib/session', () => ({ requireAdminConsole: vi.fn(async () => undefined) }));
vi.mock('./ai-news-console', () => ({
  AiNewsSettingsForm: ({ settings }: { settings: unknown }) => <div data-testid="settings">{settings ? 'verified settings' : 'new settings'}</div>,
  AiNewsAutoGenerateCard: ({ ready }: { ready: boolean }) => <div data-testid="auto">{ready ? 'ready' : 'blocked'}</div>,
  AiNewsGenerateForm: ({ ready }: { ready: boolean }) => <div data-testid="generate">{ready ? 'ready' : 'blocked'}</div>,
  ScenarioCard: ({ scenario }: { scenario: { headline: string } }) => <div data-testid="scenario">{scenario.headline}</div>,
}));
const apiMock = vi.mocked(apiOrNull);
const TIME = '2026-10-27T07:00:00.000Z';
const settings = { settings: { api_base_url: 'https://example.com/v1', model: 'm', has_key: true, api_key_hint: '1234', updated_at: TIME } };
const latest = { batch: null, run: null };
const models = { models: ['m'], problem: null };
function responses(a: unknown, b: unknown, c: unknown) {
  apiMock.mockImplementation(async (url) => {
    if (String(url).endsWith('/settings')) return a as never;
    if (String(url).endsWith('/latest')) return b as never;
    return c as never;
  });
}

describe('AI newsroom fail-closed rendering', () => {
  beforeEach(() => vi.resetAllMocks());
  it('shows a retryable accessible alert and withholds forms when read endpoints fail', async () => {
    responses(null, null, null);
    const html = renderToStaticMarkup(await AiNewsPage());
    expect(html).toContain('role="alert"');
    expect(html).toContain('다시 조회');
    expect(html).not.toContain('data-testid="generate"');
    expect(html).not.toContain('data-testid="scenario"');
    expect(html).not.toContain('data-testid="settings"');
  });
  it('withholds unverified scenarios while allowing verified settings repair', async () => {
    responses(settings, { batch: { scenarios: [{ id: 'forged' }] }, run: null }, models);
    const html = renderToStaticMarkup(await AiNewsPage());
    expect(html).toContain('role="alert"');
    expect(html).toContain('verified settings');
    expect(html).not.toContain('data-testid="generate"');
    expect(html).not.toContain('data-testid="scenario"');
  });
  it('distinguishes legitimate empty batch and enables verified model settings', async () => {
    responses(settings, latest, models);
    const html = renderToStaticMarkup(await AiNewsPage());
    expect(html).not.toContain('role="alert"');
    expect(html).toContain('아직 만든 시나리오가 없어요.');
    expect(html).toContain('data-testid="generate">ready');
  });
  it('does not claim generation ready when model inventory API is unavailable', async () => {
    responses(settings, latest, null);
    const html = renderToStaticMarkup(await AiNewsPage());
    expect(html).toContain('role="alert"');
    expect(html).toContain('data-testid="generate">blocked');
  });
});
