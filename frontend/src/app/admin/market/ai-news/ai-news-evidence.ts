import type { AiNewsBatch, AiNewsModelList, AiNewsRun, AiNewsSettings } from '../../types';

/** Runtime boundary for authenticated NestJS/PostgreSQL AI-news read models. */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PROBLEMS = new Set([
  'ai_news_key_missing', 'ai_news_sealing_unavailable', 'ai_news_model_rejected_key',
  'ai_news_model_unreachable', 'ai_news_model_unusable', 'ai_news_model_refused',
]);
const STATUSES = new Set(['proposed', 'published', 'discarded', 'superseded']);
const DIRECTIONS = new Set(['up', 'down', 'none']);

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function string(value: unknown, max = 2000): value is string {
  return typeof value === 'string' && value.length <= max;
}
function id(value: unknown): value is string {
  return typeof value === 'string' && UUID.test(value);
}
function nullableId(value: unknown): boolean { return value === null || id(value); }
function nullableString(value: unknown, max = 2000): boolean { return value === null || string(value, max); }
function timestamp(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)
    && Number.isFinite(Date.parse(value));
}
function nullableTimestamp(value: unknown): boolean { return value === null || timestamp(value); }
function integer(value: unknown, min: number, max: number): boolean {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= min && value <= max;
}

export function parseAiNewsSettingsResponse(value: unknown): { readonly settings: AiNewsSettings | null } | null {
  if (!record(value) || !('settings' in value)) return null;
  const settings = value.settings;
  if (settings === null) return { settings: null };
  if (!record(settings) || !string(settings.api_base_url, 300) || !/^https?:\/\//.test(settings.api_base_url)
    || !string(settings.model, 100) || settings.model.length === 0
    || typeof settings.has_key !== 'boolean' || !string(settings.api_key_hint, 16)
    || !timestamp(settings.updated_at)) return null;
  return { settings: settings as unknown as AiNewsSettings };
}

export function parseAiNewsModelsResponse(value: unknown): AiNewsModelList | null {
  if (!record(value) || !Array.isArray(value.models) || value.models.length > 256
    || !value.models.every((model: unknown) => string(model, 100) && model.length > 0)
    || new Set(value.models).size !== value.models.length
    || !(value.problem === null || (typeof value.problem === 'string' && PROBLEMS.has(value.problem)))
    || (value.problem !== null && value.models.length !== 0)) return null;
  return value as unknown as AiNewsModelList;
}

function validEffect(value: unknown): boolean {
  return record(value) && id(value.id) && integer(value.ordinal, 1, 20)
    && nullableId(value.stock_id) && nullableString(value.symbol, 40) && nullableString(value.name, 160)
    && DIRECTIONS.has(value.direction as string) && integer(value.strength, 1, 3)
    && nullableId(value.published_event_id);
}
function validScenario(value: unknown): boolean {
  if (!record(value) || !id(value.id) || !integer(value.ordinal, 1, 20)
    || !nullableId(value.stock_id) || !nullableString(value.symbol, 40) || !nullableString(value.name, 160)
    || !['up', 'down'].includes(value.direction as string) || !integer(value.strength, 1, 3)
    || !integer(value.hours, 1, 168) || !string(value.headline, 200)
    || !string(value.body, 4000) || !string(value.rationale, 2000)
    || !STATUSES.has(value.status as string) || !nullableId(value.published_event_id)
    || !nullableTimestamp(value.decided_at) || !Array.isArray(value.effects)
    || value.effects.length < 1 || value.effects.length > 20 || !value.effects.every(validEffect)) return false;
  const effects = value.effects as Record<string, unknown>[];
  return new Set(effects.map((effect) => effect.id)).size === effects.length
    && new Set(effects.map((effect) => effect.ordinal)).size === effects.length;
}
function validBatch(value: unknown): boolean {
  if (value === null) return true;
  if (!record(value) || !id(value.batch_id) || !timestamp(value.created_at)
    || !string(value.operator_prompt, 2000) || !string(value.model, 100)
    || !Array.isArray(value.scenarios) || value.scenarios.length > 20
    || !value.scenarios.every(validScenario)) return false;
  const scenarios = value.scenarios as Record<string, unknown>[];
  return new Set(scenarios.map((scenario) => scenario.id)).size === scenarios.length
    && new Set(scenarios.map((scenario) => scenario.ordinal)).size === scenarios.length;
}
function validRun(value: unknown): boolean {
  if (value === null) return true;
  if (!record(value) || !id(value.run_id) || !timestamp(value.started_at)
    || !nullableTimestamp(value.finished_at) || !string(value.operator_prompt, 2000)
    || !nullableId(value.batch_id) || !nullableString(value.failure_code, 100)
    || !string(value.failure_detail, 4000) || typeof value.running !== 'boolean') return false;
  if (value.running) return value.finished_at === null && value.failure_code === null;
  // Migration 149 marks a >10-minute unfinished run as no longer running
  // even when finished_at is still NULL. That is a legitimate stale run.
  return value.finished_at === null || Date.parse(value.finished_at as string) >= Date.parse(value.started_at as string);
}
export function parseAiNewsLatestResponse(value: unknown): {
  readonly batch: AiNewsBatch | null;
  readonly run: AiNewsRun | null;
} | null {
  if (!record(value) || !('batch' in value) || !('run' in value)
    || !validBatch(value.batch) || !validRun(value.run)) return null;
  return value as { readonly batch: AiNewsBatch | null; readonly run: AiNewsRun | null };
}

export function safeRunningSeconds(run: AiNewsRun | null, now = Date.now()): number {
  if (!run?.running || !timestamp(run.started_at) || !Number.isFinite(now)) return 0;
  return Math.max(0, Math.min(86400, Math.round((now - Date.parse(run.started_at)) / 1000)));
}
