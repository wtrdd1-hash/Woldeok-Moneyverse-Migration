import { describe, expect, it } from 'vitest';
import {
  parseAiNewsSettingsResponse, parseAiNewsModelsResponse,
  parseAiNewsLatestResponse, safeRunningSeconds,
} from './ai-news-evidence';

const ID = 'a2b3c4d5-1111-4111-8111-123456789012';
const ID2 = 'a2b3c4d5-2222-4222-8222-123456789012';
const TIME = '2026-10-27T07:00:00.000Z';
const effect = { id: ID2, ordinal: 1, stock_id: null, symbol: null, name: null, direction: 'none', strength: 1, published_event_id: null };
const scenario = { id: ID, ordinal: 1, stock_id: null, symbol: null, name: null, direction: 'up', strength: 1, hours: 6, headline: 'News', body: 'Body', rationale: 'Why', status: 'proposed', published_event_id: null, decided_at: null, effects: [effect] };
const batch = { batch_id: ID, created_at: TIME, operator_prompt: '', model: 'verified-model', scenarios: [scenario] };
const run = { run_id: ID2, started_at: TIME, finished_at: null, operator_prompt: '', batch_id: null, failure_code: null, failure_detail: '', running: true };

describe('AI newsroom verified read contracts', () => {
  it('accepts legitimate no-settings and no-batch states', () => {
    expect(parseAiNewsSettingsResponse({ settings: null })).toEqual({ settings: null });
    expect(parseAiNewsLatestResponse({ batch: null, run: null })).toEqual({ batch: null, run: null });
  });
  it('accepts actual NestJS settings, models, and PostgreSQL batch/run evidence', () => {
    expect(parseAiNewsSettingsResponse({ settings: { api_base_url: 'https://api.example/v1', model: 'm', has_key: true, api_key_hint: '1234', updated_at: TIME } })?.settings?.has_key).toBe(true);
    expect(parseAiNewsModelsResponse({ models: ['m'], problem: null })?.models).toEqual(['m']);
    expect(parseAiNewsLatestResponse({ batch, run })?.batch?.scenarios).toHaveLength(1);
  });
  it('distinguishes unavailable endpoints from legitimate empty records', () => {
    expect(parseAiNewsSettingsResponse(null)).toBeNull();
    expect(parseAiNewsModelsResponse(null)).toBeNull();
    expect(parseAiNewsLatestResponse(null)).toBeNull();
  });
  it('rejects untrusted settings key status, timestamps and hints', () => {
    expect(parseAiNewsSettingsResponse({ settings: { has_key: 'true', model: 'm' } })).toBeNull();
    expect(parseAiNewsSettingsResponse({ settings: { api_base_url: 'https://x', model: 'm', has_key: true, api_key_hint: '1234', updated_at: 'bad' } })).toBeNull();
  });
  it('rejects invalid or duplicate model inventory and bogus problem state', () => {
    expect(parseAiNewsModelsResponse({ models: ['m', 'm'], problem: null })).toBeNull();
    expect(parseAiNewsModelsResponse({ models: [42], problem: null })).toBeNull();
    expect(parseAiNewsModelsResponse({ models: ['m'], problem: 'untrusted' })).toBeNull();
    expect(parseAiNewsModelsResponse({ models: ['m'], problem: 'ai_news_model_unreachable' })).toBeNull();
    expect(parseAiNewsModelsResponse({ models: [], problem: 'ai_news_model_unreachable' })?.problem).toBe('ai_news_model_unreachable');
  });
  it('rejects forged or contradictory run evidence', () => {
    expect(parseAiNewsLatestResponse({ batch, run: { ...run, running: true, finished_at: TIME } })).toBeNull();
    expect(parseAiNewsLatestResponse({ batch, run: { ...run, started_at: 'not-a-date' } })).toBeNull();
    expect(parseAiNewsLatestResponse({ batch, run: { ...run, run_id: 'not-uuid' } })).toBeNull();
    // SQL migration 149 deliberately expires an unfinished run after 10 minutes.
    expect(parseAiNewsLatestResponse({ batch, run: { ...run, running: false, finished_at: null } })?.run?.running).toBe(false);
  });
  it('rejects malformed and duplicate scenario IDs before rendering publish controls', () => {
    expect(parseAiNewsLatestResponse({ batch: { ...batch, scenarios: [scenario, scenario] }, run })).toBeNull();
    expect(parseAiNewsLatestResponse({ batch: { ...batch, scenarios: [{ ...scenario, id: 'bad' }] }, run })).toBeNull();
    expect(parseAiNewsLatestResponse({ batch: { ...batch, scenarios: [{ ...scenario, hours: 0 }] }, run })).toBeNull();
    expect(parseAiNewsLatestResponse({ batch: { ...batch, scenarios: [{ ...scenario, effects: [{ ...effect, strength: 999 }] }] }, run })).toBeNull();
    expect(parseAiNewsLatestResponse({ batch: { ...batch, scenarios: [{ ...scenario, status: 'approved' }] }, run })).toBeNull();
  });
  it('bounds runtime elapsed time and never renders NaN or negative duration', () => {
    const now = Date.parse('2026-10-27T07:10:00Z');
    expect(safeRunningSeconds(run, now)).toBe(600);
    expect(safeRunningSeconds({ ...run, started_at: 'bad' }, now)).toBe(0);
    expect(safeRunningSeconds({ ...run, started_at: '2099-01-01T00:00:00Z' }, now)).toBe(0);
    expect(safeRunningSeconds(null, now)).toBe(0);
  });
});
