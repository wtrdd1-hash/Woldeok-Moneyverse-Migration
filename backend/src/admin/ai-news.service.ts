import { randomUUID } from 'node:crypto';
import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { z } from 'zod';
import type { TotpSealingKey } from '../auth/totp';
import { openSecret, sealSecret } from '../auth/totp';
import type { AiNewsBatchRow, AiNewsRepository, AiNewsSettingsRow, ScenarioProposal } from './ai-news.repository';
import { AiNewsInputError } from './ai-news.repository';

/**
 * Why a generation could not run, in a word the route can turn into a
 * status and the console into a sentence. `detail` is for the operator's
 * eyes on the console and never quotes the key.
 */
export class AiNewsUnavailableError extends Error {
  readonly code: 'ai_news_key_missing' | 'ai_news_sealing_unavailable' | 'ai_news_model_rejected_key'
    | 'ai_news_model_unreachable' | 'ai_news_model_refused' | 'ai_news_model_unusable';

  constructor(code: AiNewsUnavailableError['code'], detail: string) {
    super(detail);
    this.name = 'AiNewsUnavailableError';
    this.code = code;
  }
}

const HOW_MANY = 5;

/** The shape the model is held to. `strength` is the vocabulary 124 fixed. */
const ProposalSchema = z.object({
  stock_symbol: z.string().nullable().describe('The listed symbol this is about, or null for the whole market'),
  direction: z.enum(['up', 'down']),
  strength: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  hours: z.number().int().min(1).max(168),
  headline: z.string().min(2).max(120),
  body: z.string().max(2000),
  rationale: z.string().max(1000).describe('How this follows from the context: what it continues, why now, why this strength'),
});

const BatchSchema = z.object({
  scenarios: z.array(ProposalSchema).min(1).max(HOW_MANY),
});

export type ScenarioBatch = z.infer<typeof BatchSchema>;

/**
 * The one call to the model, as a function so the service can be tested
 * with a fake and the prompt can be read without a key.
 */
export interface ModelCall {
  readonly apiBaseUrl: string;
  readonly apiKey: string;
  readonly model: string;
  readonly system: string;
  readonly user: string;
}

export type ModelCaller = (call: ModelCall) => Promise<ScenarioBatch>;

/**
 * The standing brief. Stable text first so the prefix caches; the context
 * and the operator's wish travel in the user turn.
 */
export const SYSTEM_PROMPT = `You are the newsroom of 월덕 머니버스, a Korean community's virtual economy game with a
virtual stock exchange. You write in-world market news: rumours, announcements, incidents
and reports about the game's fictional companies and its economy. Nothing you write refers
to real companies, real people or the real world.

You will receive the current state of the market as JSON: every listed stock with its price,
today's and the week's move and its current trend; the news events that are running right
now and the ones that ended in the last week, with their times; the scenarios that were
already published, with when; the macro figures; and the clock in Seoul. You may also
receive a wish from the operator.

Propose exactly ${HOW_MANY} scenarios. Each is one piece of news that, if published, leans a
stock (or the whole market) up or down for a number of hours. Follow these rules:

1. CONTINUITY. Every scenario continues the story the context tells. Refer to what is
   running and what recently happened. A company that just announced a product does not
   go bankrupt an hour later; a market that has been falling for two days may steady,
   rebound or fall further, but it does not lurch at random. Put the link into
   "rationale" in one or two sentences, and where natural into the body itself.
2. TIME. Read the clock and the timestamps. Do not reverse a strong piece of news that is
   still running or ended within the last six hours. Prefer follow-ups, second-order
   effects and news about stocks that have been quiet. Choose "hours" to fit the news:
   a rumour lasts hours, a product launch a day or two, a structural shift longer.
3. STRENGTH is a vocabulary of three: 1 = 소폭 (about ±3 % a day of lean, volatility
   ×1.2), 2 = 보통 (±8 %, ×1.5), 3 = 강력 (±20 %, ×2.0). At most one scenario in a batch
   may be strength 3, and only when the story has earned it.
4. VARIETY. Spread the five across different stocks and directions; at most one may be
   about the whole market. Mix good and bad news unless the operator asks otherwise.
5. THE OPERATOR'S WISH, when given, is what the batch should serve -- but it still has to
   be consistent with the context. If the wish contradicts what is running, propose the
   closest consistent story and say so in the rationale.
6. LANGUAGE AND FORM. Headlines and bodies are in Korean, in the register of a game's
   news feed: concrete, a little playful, never real-world. Headline 2-120 characters;
   body up to 2000, two to five sentences. "stock_symbol" must be exactly one of the
   listed symbols, or null for the whole market.

Return only the structured result.`;

export function userPrompt(context: Record<string, unknown>, operatorPrompt: string): string {
  const wish = operatorPrompt.trim();
  return [
    'Market state (JSON):',
    JSON.stringify(context, null, 1),
    '',
    wish === ''
      ? 'Operator wish: none. Continue the story as it stands.'
      : `Operator wish: ${wish}`,
  ].join('\n');
}

/** Calls the model through the official SDK at the address the operator set. */
export const anthropicCaller: ModelCaller = async (call) => {
  const client = new Anthropic({
    apiKey: call.apiKey,
    baseURL: call.apiBaseUrl,
    // Minutes rather than the SDK's ten: the console waits on this call.
    timeout: 180_000,
    maxRetries: 1,
  });
  try {
    const response = await client.messages.parse({
      model: call.model,
      max_tokens: 16_000,
      system: [{ type: 'text', text: call.system, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: call.user }],
      output_config: { format: zodOutputFormat(BatchSchema) },
    });
    if (response.stop_reason === 'refusal') {
      throw new AiNewsUnavailableError('ai_news_model_refused', 'the model declined to write this batch');
    }
    if (!response.parsed_output) {
      throw new AiNewsUnavailableError('ai_news_model_unusable', 'the model answered in a shape that could not be read');
    }
    return response.parsed_output;
  } catch (error: unknown) {
    if (error instanceof AiNewsUnavailableError) throw error;
    if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError) {
      throw new AiNewsUnavailableError('ai_news_model_rejected_key', 'the model API rejected the key');
    }
    if (error instanceof Anthropic.BadRequestError || error instanceof Anthropic.NotFoundError) {
      throw new AiNewsUnavailableError('ai_news_model_unusable', `the model API refused the request: ${error.message}`);
    }
    if (error instanceof Anthropic.APIError) {
      throw new AiNewsUnavailableError('ai_news_model_unreachable', `the model API answered ${error.status ?? 'an error'}`);
    }
    throw new AiNewsUnavailableError('ai_news_model_unreachable', 'the model API could not be reached');
  }
};

/**
 * The newsroom: settings, a generation, and the choice of what to publish.
 *
 * The sealing key is the TOTP one (AES-256-GCM, held only in the
 * environment); the API key is sealed under it before it reaches the
 * database and opened only for the seconds a call takes.
 */
export class AiNewsService {
  constructor(
    private readonly repository: AiNewsRepository,
    private readonly sealing: TotpSealingKey | null,
    private readonly caller: ModelCaller = anthropicCaller,
  ) {}

  settings(actorUserId: string): Promise<AiNewsSettingsRow | null> {
    return this.repository.settings(actorUserId);
  }

  async saveSettings(input: {
    readonly actorUserId: string;
    readonly apiBaseUrl: string;
    readonly model: string;
    /** Absent or empty keeps the stored key. */
    readonly apiKey?: string | undefined;
    readonly idempotencyKey?: string | undefined;
  }): Promise<boolean> {
    const apiKey = input.apiKey?.trim() ?? '';
    let sealed: string | null = null;
    let keyId: string | null = null;
    let hint: string | null = null;
    if (apiKey !== '') {
      if (!this.sealing) {
        throw new AiNewsUnavailableError('ai_news_sealing_unavailable', 'no sealing key is configured on this deployment');
      }
      if (apiKey.length < 8 || apiKey.length > 512) throw new AiNewsInputError('api key must be 8 to 512 characters');
      sealed = sealSecret(Buffer.from(apiKey, 'utf8'), this.sealing);
      keyId = this.sealing.keyId;
      hint = apiKey.slice(-4);
    }
    return this.repository.saveSettings({
      idempotencyKey: input.idempotencyKey ?? randomUUID(),
      actorUserId: input.actorUserId,
      apiBaseUrl: input.apiBaseUrl,
      model: input.model,
      apiKeySealed: sealed,
      apiKeyKeyId: keyId,
      apiKeyHint: hint,
    });
  }

  latest(actorUserId: string): Promise<AiNewsBatchRow | null> {
    return this.repository.latest(actorUserId);
  }

  /**
   * Asks the model for five and stores what it said. The context is read
   * once and stored with the batch, so each scenario can be read against
   * the state it was written for.
   */
  async generate(input: {
    readonly actorUserId: string;
    readonly prompt?: string | undefined;
    readonly idempotencyKey?: string | undefined;
  }): Promise<AiNewsBatchRow | null> {
    const prompt = (input.prompt ?? '').trim();
    if (prompt.length > 2000) throw new AiNewsInputError('the wish must be at most 2000 characters');

    const credential = await this.repository.credential(input.actorUserId);
    if (!credential?.api_key_sealed || !credential.api_key_key_id) {
      throw new AiNewsUnavailableError('ai_news_key_missing', 'no API key has been set');
    }
    if (!this.sealing || this.sealing.keyId !== credential.api_key_key_id) {
      throw new AiNewsUnavailableError('ai_news_sealing_unavailable', 'the stored key was sealed under a key this deployment does not hold');
    }
    const apiKey = openSecret(credential.api_key_sealed, this.sealing).toString('utf8');

    const context = await this.repository.context(input.actorUserId);
    const batch = await this.caller({
      apiBaseUrl: credential.api_base_url,
      apiKey,
      model: credential.model,
      system: SYSTEM_PROMPT,
      user: userPrompt(context, prompt),
    });

    const scenarios = normalise(batch, context);
    await this.repository.createBatch({
      idempotencyKey: input.idempotencyKey ?? randomUUID(),
      actorUserId: input.actorUserId,
      prompt,
      model: credential.model,
      context,
      scenarios,
    });
    return this.repository.latest(input.actorUserId);
  }

  publish(input: {
    readonly actorUserId: string;
    readonly scenarioId: string;
    readonly direction: unknown;
    readonly strength: unknown;
    readonly hours: unknown;
    readonly headline: unknown;
    readonly body?: unknown;
    readonly idempotencyKey?: string | undefined;
  }) {
    return this.repository.publish({
      ...input,
      body: input.body ?? '',
      idempotencyKey: input.idempotencyKey ?? randomUUID(),
    });
  }

  discard(input: { readonly actorUserId: string; readonly scenarioId: string; readonly idempotencyKey?: string | undefined }) {
    return this.repository.discard({ ...input, idempotencyKey: input.idempotencyKey ?? randomUUID() });
  }
}

/**
 * What the model said, held to the rules the prompt stated: symbols must be
 * listed ones (an unknown one becomes market-wide rather than refusing the
 * whole batch, and says so in the rationale), at most one strength 3, at
 * most five. Trimmed to the column widths the database enforces.
 */
export function normalise(batch: ScenarioBatch, context: Record<string, unknown>): ScenarioProposal[] {
  const listed = new Set(
    (Array.isArray(context.stocks) ? context.stocks : [])
      .map((stock) => (typeof stock === 'object' && stock !== null ? (stock as { symbol?: unknown }).symbol : undefined))
      .filter((symbol): symbol is string => typeof symbol === 'string')
      .map((symbol) => symbol.toUpperCase()),
  );
  let strongSeen = false;
  return batch.scenarios.slice(0, HOW_MANY).map((scenario) => {
    const symbol = scenario.stock_symbol?.trim().toUpperCase() ?? null;
    const known = symbol !== null && listed.has(symbol);
    const rationale = scenario.rationale.trim();
    let strength = scenario.strength;
    if (strength === 3) {
      if (strongSeen) strength = 2;
      strongSeen = true;
    }
    return {
      stock_symbol: known ? symbol : null,
      direction: scenario.direction,
      strength,
      hours: Math.min(168, Math.max(1, Math.round(scenario.hours))),
      headline: scenario.headline.trim().slice(0, 120),
      body: scenario.body.trim().slice(0, 2000),
      rationale: (symbol !== null && !known
        ? `(${symbol}은 상장 종목이 아니라 시장 전체로 바꿨습니다) ${rationale}`
        : rationale
      ).slice(0, 1000),
    };
  });
}
