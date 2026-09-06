import type { Queryable } from '../core/db';
import { queryOne, queryRows } from '../core/db';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class AiNewsInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AiNewsInputError';
  }
}

function uuid(value: unknown, name: string): string {
  if (typeof value !== 'string' || !UUID.test(value)) throw new AiNewsInputError(`${name} must be a UUID`);
  return value.toLowerCase();
}

/** `ai_news_settings_get` (135): what the console shows. Never the key. */
export interface AiNewsSettingsRow {
  readonly api_base_url: string;
  readonly model: string;
  readonly has_key: boolean;
  readonly api_key_hint: string;
  readonly updated_at: Date;
}

/** `ai_news_settings_credential` (135): what the application calls the model with. */
export interface AiNewsCredentialRow {
  readonly api_base_url: string;
  readonly model: string;
  readonly api_key_sealed: string | null;
  readonly api_key_key_id: string | null;
}

/** One proposal as the model wrote it and as `ai_news_batch_create` stores it. */
export interface ScenarioProposal {
  readonly stock_symbol: string | null;
  readonly direction: 'up' | 'down';
  readonly strength: 1 | 2 | 3;
  readonly hours: number;
  readonly headline: string;
  readonly body: string;
  readonly rationale: string;
}

export interface AiNewsScenarioRow {
  readonly id: string;
  readonly ordinal: number;
  readonly stock_id: string | null;
  readonly symbol: string | null;
  readonly name: string | null;
  readonly direction: 'up' | 'down';
  readonly strength: number;
  readonly hours: number;
  readonly headline: string;
  readonly body: string;
  readonly rationale: string;
  readonly status: 'proposed' | 'published' | 'discarded' | 'superseded';
  readonly published_event_id: string | null;
  readonly decided_at: string | null;
}

/**
 * `ai_news_run_latest` (149): one attempt at asking the model. The console
 * reads this while it waits, and reads `failure_code` when there is nothing
 * to read instead.
 */
export interface AiNewsRunRow {
  readonly run_id: string;
  readonly started_at: Date;
  readonly finished_at: Date | null;
  readonly operator_prompt: string;
  readonly batch_id: string | null;
  readonly failure_code: string | null;
  readonly failure_detail: string;
  readonly running: boolean;
}

export interface AiNewsBatchRow {
  readonly batch_id: string;
  readonly created_at: Date;
  readonly operator_prompt: string;
  readonly model: string;
  readonly scenarios: readonly AiNewsScenarioRow[];
}

/**
 * The AI newsroom's tables, reached through 135's functions and nothing
 * else. Every call takes the actor because every function checks the
 * operator role itself.
 */
export class AiNewsRepository {
  constructor(private readonly pool: Queryable) {
    if (!pool || typeof pool.query !== 'function') throw new TypeError('a PostgreSQL pool is required');
  }

  async settings(actorUserId: unknown): Promise<AiNewsSettingsRow | null> {
    uuid(actorUserId, 'actor user id');
    return queryOne<AiNewsSettingsRow>(
      this.pool,
      'SELECT api_base_url, model, has_key, api_key_hint, updated_at FROM public.ai_news_settings_get($1)',
      [actorUserId],
    );
  }

  async credential(actorUserId: unknown): Promise<AiNewsCredentialRow | null> {
    uuid(actorUserId, 'actor user id');
    return queryOne<AiNewsCredentialRow>(
      this.pool,
      'SELECT api_base_url, model, api_key_sealed, api_key_key_id FROM public.ai_news_settings_credential($1)',
      [actorUserId],
    );
  }

  async saveSettings(input: {
    readonly idempotencyKey: unknown;
    readonly actorUserId: unknown;
    readonly apiBaseUrl: unknown;
    readonly model: unknown;
    /** Already sealed. Null keeps the stored key. */
    readonly apiKeySealed: string | null;
    readonly apiKeyKeyId: string | null;
    readonly apiKeyHint: string | null;
  }): Promise<boolean> {
    uuid(input.idempotencyKey, 'idempotency key');
    uuid(input.actorUserId, 'actor user id');
    if (typeof input.apiBaseUrl !== 'string' || !/^https?:\/\/\S{3,300}$/.test(input.apiBaseUrl.trim())) {
      throw new AiNewsInputError('api base url must be an http(s) URL');
    }
    if (typeof input.model !== 'string' || input.model.trim().length < 1 || input.model.trim().length > 100) {
      throw new AiNewsInputError('model must be 1 to 100 characters');
    }
    const row = await queryOne<{ saved: boolean }>(
      this.pool,
      'SELECT public.ai_news_settings_set($1,$2,$3,$4,$5,$6,$7) AS saved',
      [
        input.idempotencyKey, input.actorUserId, input.apiBaseUrl.trim(), input.model.trim(),
        input.apiKeySealed, input.apiKeyKeyId, input.apiKeyHint,
      ],
    );
    return row?.saved === true;
  }

  async context(actorUserId: unknown): Promise<Record<string, unknown>> {
    uuid(actorUserId, 'actor user id');
    const row = await queryOne<{ context: Record<string, unknown> }>(
      this.pool,
      'SELECT public.ai_news_context($1) AS context',
      [actorUserId],
    );
    return row?.context ?? {};
  }

  async createBatch(input: {
    readonly idempotencyKey: unknown;
    readonly actorUserId: unknown;
    readonly prompt: string;
    readonly model: string;
    readonly context: Record<string, unknown>;
    readonly scenarios: readonly ScenarioProposal[];
  }): Promise<{ readonly batch_id: string; readonly replayed: boolean }> {
    uuid(input.idempotencyKey, 'idempotency key');
    uuid(input.actorUserId, 'actor user id');
    if (input.scenarios.length < 1 || input.scenarios.length > 5) {
      throw new AiNewsInputError('a batch holds one to five scenarios');
    }
    const row = await queryOne<{ batch_id: string; replayed: boolean }>(
      this.pool,
      'SELECT batch_id::text AS batch_id, replayed FROM public.ai_news_batch_create($1,$2,$3,$4,$5::jsonb,$6::jsonb)',
      [
        input.idempotencyKey, input.actorUserId, input.prompt, input.model,
        JSON.stringify(input.context), JSON.stringify(input.scenarios),
      ],
    );
    if (!row?.batch_id) throw new Error('database did not return a scenario batch receipt');
    return row;
  }

  async latest(actorUserId: unknown): Promise<AiNewsBatchRow | null> {
    uuid(actorUserId, 'actor user id');
    const rows = await queryRows<AiNewsBatchRow>(
      this.pool,
      'SELECT batch_id::text AS batch_id, created_at, operator_prompt, model, scenarios FROM public.ai_news_batch_latest($1)',
      [actorUserId],
    );
    return rows[0] ?? null;
  }

  /** Starts a run, or hands back the one already going (149). */
  async beginRun(input: {
    readonly idempotencyKey: unknown;
    readonly actorUserId: unknown;
    readonly prompt: string;
  }): Promise<{ readonly run_id: string; readonly started: boolean }> {
    uuid(input.idempotencyKey, 'idempotency key');
    uuid(input.actorUserId, 'actor user id');
    if (input.prompt.length > 2000) throw new AiNewsInputError('the wish must be at most 2000 characters');
    const row = await queryOne<{ run_id: string; started: boolean }>(
      this.pool,
      'SELECT run_id::text AS run_id, started FROM public.ai_news_run_begin($1,$2,$3)',
      [input.idempotencyKey, input.actorUserId, input.prompt],
    );
    if (!row?.run_id) throw new Error('database did not return a run receipt');
    return row;
  }

  /** Closes a run with the batch it produced, or with why it produced none. */
  async finishRun(input: {
    readonly actorUserId: unknown;
    readonly runId: unknown;
    readonly batchId?: string | null;
    readonly failureCode?: string | null;
    readonly failureDetail?: string | null;
  }): Promise<boolean> {
    uuid(input.actorUserId, 'actor user id');
    uuid(input.runId, 'run id');
    const row = await queryOne<{ finished: boolean }>(
      this.pool,
      'SELECT public.ai_news_run_finish($1,$2,$3,$4,$5) AS finished',
      [input.actorUserId, input.runId, input.batchId ?? null, input.failureCode ?? null, input.failureDetail ?? ''],
    );
    return row?.finished === true;
  }

  async latestRun(actorUserId: unknown): Promise<AiNewsRunRow | null> {
    uuid(actorUserId, 'actor user id');
    const rows = await queryRows<AiNewsRunRow>(
      this.pool,
      `SELECT run_id::text AS run_id, started_at, finished_at, operator_prompt,
              batch_id::text AS batch_id, failure_code, failure_detail, running
       FROM public.ai_news_run_latest($1)`,
      [actorUserId],
    );
    return rows[0] ?? null;
  }

  async publish(input: {
    readonly idempotencyKey: unknown;
    readonly actorUserId: unknown;
    readonly scenarioId: unknown;
    readonly direction: unknown;
    readonly strength: unknown;
    readonly hours: unknown;
    readonly headline: unknown;
    readonly body: unknown;
  }): Promise<{ readonly event_id: string; readonly replayed: boolean }> {
    uuid(input.idempotencyKey, 'idempotency key');
    uuid(input.actorUserId, 'actor user id');
    uuid(input.scenarioId, 'scenario id');
    if (input.direction !== 'up' && input.direction !== 'down') throw new AiNewsInputError('direction must be up or down');
    if (![1, 2, 3].includes(input.strength as number)) throw new AiNewsInputError('strength must be 1, 2 or 3');
    if (typeof input.hours !== 'number' || !Number.isSafeInteger(input.hours) || input.hours < 1 || input.hours > 168) {
      throw new AiNewsInputError('hours must be between 1 and 168');
    }
    const headline = typeof input.headline === 'string' ? input.headline.trim() : '';
    if (headline.length < 2 || headline.length > 120) throw new AiNewsInputError('headline must be 2 to 120 characters');
    const body = typeof input.body === 'string' ? input.body.trim() : '';
    if (body.length > 2000) throw new AiNewsInputError('body must be at most 2000 characters');
    const row = await queryOne<{ event_id: string; replayed: boolean }>(
      this.pool,
      'SELECT event_id::text AS event_id, replayed FROM public.ai_news_scenario_publish($1,$2,$3,$4,$5,$6,$7,$8)',
      [input.idempotencyKey, input.actorUserId, input.scenarioId, input.direction, input.strength, input.hours, headline, body],
    );
    if (!row?.event_id) throw new Error('database did not return a market event receipt');
    return row;
  }

  async discard(input: {
    readonly idempotencyKey: unknown;
    readonly actorUserId: unknown;
    readonly scenarioId: unknown;
  }): Promise<boolean> {
    uuid(input.idempotencyKey, 'idempotency key');
    uuid(input.actorUserId, 'actor user id');
    uuid(input.scenarioId, 'scenario id');
    const row = await queryOne<{ discarded: boolean }>(
      this.pool,
      'SELECT public.ai_news_scenario_discard($1,$2,$3) AS discarded',
      [input.idempotencyKey, input.actorUserId, input.scenarioId],
    );
    return row?.discarded === true;
  }
}
