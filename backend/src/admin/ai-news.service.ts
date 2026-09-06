import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import type { TotpSealingKey } from '../auth/totp';
import { openSecret, sealSecret } from '../auth/totp';
import type {
  AiNewsBatchRow,
  AiNewsRepository,
  AiNewsRunRow,
  AiNewsSettingsRow,
  ScenarioEffectProposal,
  ScenarioProposal,
} from './ai-news.repository';
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
/** How many stocks one story may move. Four is what a card can show at a glance. */
const MOST_EFFECTS = 4;

/**
 * The shape the model is held to, read leniently: a model that answers
 * "2" for a strength or writes a headline three characters too long has
 * still done the work, and `normalise` puts every value inside the widths
 * and vocabularies 124 and 135 enforce. Only the fields a scenario cannot
 * be built without are required.
 */
const EffectSchema = z.object({
  stock_symbol: z.string().nullish(),
  direction: z.enum(['up', 'down', 'none']),
  strength: z.coerce.number(),
});

const ProposalSchema = z.object({
  /** What the story does to each stock it touches (152). */
  effects: z.array(EffectSchema).min(1).max(6).optional(),
  /** 135's one-stock shape, still read when a server answers in it. */
  stock_symbol: z.string().nullish(),
  direction: z.enum(['up', 'down']).optional(),
  strength: z.coerce.number().optional(),
  hours: z.coerce.number(),
  headline: z.string(),
  body: z.string().nullish(),
  rationale: z.string().nullish(),
});

const BatchSchema = z.object({
  scenarios: z.array(ProposalSchema).min(1),
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

/** What the console offers in the model field. Empty when the API will not say. */
export type ModelLister = (call: { readonly apiBaseUrl: string; readonly apiKey: string }) => Promise<readonly string[]>;

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
3. WHO IT MOVES. One story, several stocks. "effects" is one to four entries, each a
   listed symbol (or null for the whole market) with a direction and a strength. A
   direction of "up" is 호재 for that stock, "down" is 악재, and "none" is a stock the
   story names without moving -- use it when a company is mentioned but unaffected. At
   least one entry must move. News that helps one company at another's expense is the
   most interesting kind: a supplier's win is its rival's loss, a rate cut lifts the
   borrowers and squeezes the lender.
4. STRENGTH is a vocabulary of three, per entry: 1 = 소폭 (about ±3 % a day of lean plus
   a 0.8 % step when it lands), 2 = 보통 (±8 %, 2.5 %), 3 = 강력 (±20 %, 6 %). At most one
   entry in a scenario may be strength 3, and only when the story has earned it.
5. VARIETY. Spread the five scenarios across different stocks; at most one scenario may
   move the whole market. Mix good and bad news unless the operator asks otherwise.
6. THE OPERATOR'S WISH, when given, is what the batch should serve -- but it still has to
   be consistent with the context. If the wish contradicts what is running, propose the
   closest consistent story and say so in the rationale.
7. LANGUAGE AND FORM. Headlines and bodies are in Korean, in the register of a game's
   news feed: concrete, a little playful, never real-world. Headline 2-120 characters;
   body up to 2000, two to five sentences. Every "stock_symbol" must be exactly one of
   the listed symbols, or null for the whole market. "hours" is a whole number from 1 to
   168 and belongs to the story, not to one stock.

Answer with one JSON object and nothing else -- no prose, no code fence -- of this shape:

{"scenarios": [{"effects": [{"stock_symbol": "MYUY or null", "direction": "up" | "down" | "none",
  "strength": 1 | 2 | 3}], "hours": 6, "headline": "...", "body": "...", "rationale": "..."}]}`;

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

// ---------------------------------------------------------------------------
// The model, spoken to in the OpenAI standard
// ---------------------------------------------------------------------------

/**
 * Everything below talks to `POST {base}/chat/completions` and
 * `GET {base}/models` -- the shape OpenAI published and that OpenAI itself,
 * every gateway (OpenRouter, Together, Groq, Azure's compatible routes),
 * Anthropic's compatibility endpoint and every self-hosted server (vLLM,
 * llama.cpp, LM Studio, Ollama) answer. That is why there is no vendor SDK
 * here: the operator types an address and a key, and whatever is at that
 * address is what writes the news.
 */

const MAX_TOKENS = 16_000;
/** The console waits on this call, so minutes rather than the usual seconds. */
const CALL_TIMEOUT_MS = 180_000;
const LIST_TIMEOUT_MS = 15_000;
const DETAIL_LIMIT = 200;

/**
 * Strict structured output, as the standard spells it. No bounds: several
 * servers reject `minimum`/`maxLength` inside a strict schema, and
 * `normalise` is what actually holds a proposal to the database's widths.
 */
const BATCH_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['scenarios'],
  properties: {
    scenarios: {
      type: 'array',
      description: `Exactly ${HOW_MANY} scenarios`,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['effects', 'hours', 'headline', 'body', 'rationale'],
        properties: {
          effects: {
            type: 'array',
            description: 'One to four stocks this story touches, and what it does to each',
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['stock_symbol', 'direction', 'strength'],
              properties: {
                stock_symbol: {
                  type: ['string', 'null'],
                  description: 'A listed symbol, or null for the whole market',
                },
                direction: {
                  type: 'string',
                  enum: ['up', 'down', 'none'],
                  description: 'up is 호재 for this stock, down is 악재, none is mentioned but unmoved',
                },
                strength: { type: 'integer', enum: [1, 2, 3] },
              },
            },
          },
          hours: { type: 'integer', description: 'How long the lean lasts, 1 to 168' },
          headline: { type: 'string', description: 'Korean, 2 to 120 characters' },
          body: { type: 'string', description: 'Korean, up to 2000 characters' },
          rationale: {
            type: 'string',
            description: 'How this follows from the context: what it continues, why now, why this strength',
          },
        },
      },
    },
  },
} as const;

/**
 * The same request, asking for less each time. Structured output and
 * `max_tokens` are the two options a compatible server is most likely not
 * to know, and it says so with a 400 rather than a field it ignores; the
 * prompt asks for the JSON in words, so the last attempt still works.
 */
const ATTEMPTS: readonly Record<string, unknown>[] = [
  {
    response_format: {
      type: 'json_schema',
      json_schema: { name: 'market_scenarios', strict: true, schema: BATCH_JSON_SCHEMA },
    },
    max_tokens: MAX_TOKENS,
  },
  { response_format: { type: 'json_object' }, max_tokens: MAX_TOKENS },
  {},
];

/**
 * Where the two endpoints live under the address an operator typed. A
 * trailing slash, or the completions path pasted whole, is still an
 * address this can work from.
 */
export function endpoint(apiBaseUrl: string, path: 'chat/completions' | 'models'): string {
  const base = apiBaseUrl.trim().replace(/\/+$/, '');
  const completions = '/chat/completions';
  const root = base.endsWith(completions) ? base.slice(0, -completions.length) : base;
  return `${root}/${path}`;
}

/** Never let a key travel back to the console inside an error the API echoed. */
function redact(detail: string, apiKey: string): string {
  const short = detail.replace(/\s+/g, ' ').trim().slice(0, DETAIL_LIMIT);
  return apiKey === '' ? short : short.split(apiKey).join('…');
}

function statusError(status: number, detail: string): AiNewsUnavailableError {
  if (status === 401 || status === 403) {
    return new AiNewsUnavailableError('ai_news_model_rejected_key', 'the model API rejected the key');
  }
  if (status === 404) {
    return new AiNewsUnavailableError('ai_news_model_unusable', `nothing at that address or model: ${detail}`);
  }
  if (status === 400 || status === 422) {
    return new AiNewsUnavailableError('ai_news_model_unusable', `the model API refused the request: ${detail}`);
  }
  return new AiNewsUnavailableError('ai_news_model_unreachable', `the model API answered ${status}`);
}

async function send(
  url: string,
  apiKey: string,
  init: { readonly method: 'GET' | 'POST'; readonly body?: string; readonly timeoutMs: number },
): Promise<{ readonly ok: boolean; readonly status: number; readonly text: string }> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: init.method,
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${apiKey}`,
        ...(init.body === undefined ? {} : { 'content-type': 'application/json' }),
      },
      ...(init.body === undefined ? {} : { body: init.body }),
      signal: AbortSignal.timeout(init.timeoutMs),
    });
  } catch {
    // The address, the network or the clock: an operator can act on all
    // three from the same sentence, and none of them names the key.
    throw new AiNewsUnavailableError('ai_news_model_unreachable', 'the model API could not be reached');
  }
  let text = '';
  try {
    text = await response.text();
  } catch {
    text = '';
  }
  return { ok: response.ok, status: response.status, text };
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new AiNewsUnavailableError('ai_news_model_unusable', 'the model API answered something that is not JSON');
  }
}

/** What the standard's answer looks like, down to the one field we read. */
const CompletionSchema = z.object({
  choices: z.array(z.object({
    message: z.object({
      content: z.union([
        z.string(),
        z.array(z.object({ text: z.string().nullish() })),
        z.null(),
      ]).optional(),
      refusal: z.string().nullish(),
    }).optional(),
  })).min(1),
});

const ModelsSchema = z.object({ data: z.array(z.object({ id: z.string() })) });

function contentOf(message: z.infer<typeof CompletionSchema>['choices'][number]['message']): string {
  const content = message?.content;
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) return content.map((part) => part.text ?? '').join('');
  return '';
}

/**
 * The JSON inside the answer. A server without structured output hands
 * back a string that may carry a fence or a sentence around the object, and
 * that is still an answer.
 */
export function readBatchJson(text: string): unknown {
  const trimmed = text.trim();
  const fenced = /^```(?:json)?\s*([\s\S]*?)\s*```$/.exec(trimmed);
  const candidate = (fenced?.[1] ?? trimmed).trim();
  try {
    return JSON.parse(candidate) as unknown;
  } catch {
    const first = candidate.indexOf('{');
    const last = candidate.lastIndexOf('}');
    if (first >= 0 && last > first) {
      try {
        return JSON.parse(candidate.slice(first, last + 1)) as unknown;
      } catch {
        // Falls through to the one message an operator can act on.
      }
    }
  }
  throw new AiNewsUnavailableError('ai_news_model_unusable', 'the model answered in a shape that could not be read');
}

function readBatch(body: string): ScenarioBatch {
  const completion = CompletionSchema.safeParse(parseJson(body));
  if (!completion.success) {
    throw new AiNewsUnavailableError('ai_news_model_unusable', 'the model API answered outside the chat-completions shape');
  }
  const message = completion.data.choices[0]?.message;
  if (message?.refusal) {
    throw new AiNewsUnavailableError('ai_news_model_refused', 'the model declined to write this batch');
  }
  const document = readBatchJson(contentOf(message));
  // A model that answers with the bare array has still answered.
  const batch = BatchSchema.safeParse(Array.isArray(document) ? { scenarios: document } : document);
  if (!batch.success) {
    throw new AiNewsUnavailableError('ai_news_model_unusable', 'the model answered in a shape that could not be read');
  }
  return batch.data;
}

/** Asks whatever is at the operator's address for the batch, in the OpenAI standard. */
export const openAiCaller: ModelCaller = async (call) => {
  const url = endpoint(call.apiBaseUrl, 'chat/completions');
  const messages = [
    { role: 'system', content: call.system },
    { role: 'user', content: call.user },
  ];
  let refused: AiNewsUnavailableError | null = null;
  for (const options of ATTEMPTS) {
    const response = await send(url, call.apiKey, {
      method: 'POST',
      body: JSON.stringify({ model: call.model, messages, ...options }),
      timeoutMs: CALL_TIMEOUT_MS,
    });
    if (response.ok) return readBatch(response.text);
    if (response.status === 400 || response.status === 422) {
      // How a compatible server says it does not know one of these options.
      refused = statusError(response.status, redact(response.text, call.apiKey));
      continue;
    }
    throw statusError(response.status, redact(response.text, call.apiKey));
  }
  throw refused ?? new AiNewsUnavailableError('ai_news_model_unusable', 'the model API refused every form of the request');
};

/** `GET {base}/models`, so the console can offer what this key can actually reach. */
export const openAiLister: ModelLister = async (call) => {
  const response = await send(endpoint(call.apiBaseUrl, 'models'), call.apiKey, {
    method: 'GET',
    timeoutMs: LIST_TIMEOUT_MS,
  });
  if (!response.ok) throw statusError(response.status, redact(response.text, call.apiKey));
  const listed = ModelsSchema.safeParse(parseJson(response.text));
  if (!listed.success) {
    throw new AiNewsUnavailableError('ai_news_model_unusable', 'the model list was not in the standard shape');
  }
  return [...new Set(listed.data.data.map((model) => model.id))].sort((left, right) => left.localeCompare(right));
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
    private readonly caller: ModelCaller = openAiCaller,
    private readonly lister: ModelLister = openAiLister,
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
   * What the stored key can reach, for the console's model field. A list
   * this cannot fetch is not a failure worth a page of its own: the field
   * stays a field an operator can type into, and `problem` says why the
   * list beside it is empty.
   */
  async models(actorUserId: string): Promise<{
    readonly models: readonly string[];
    readonly problem: AiNewsUnavailableError['code'] | null;
  }> {
    try {
      const credential = await this.open(actorUserId);
      return {
        models: await this.lister({ apiBaseUrl: credential.apiBaseUrl, apiKey: credential.apiKey }),
        problem: null,
      };
    } catch (error: unknown) {
      if (error instanceof AiNewsUnavailableError) return { models: [], problem: error.code };
      throw error;
    }
  }

  latestRun(actorUserId: string): Promise<AiNewsRunRow | null> {
    return this.repository.latestRun(actorUserId);
  }

  /**
   * Starts a run and answers at once.
   *
   * The model takes as long as it takes -- a minute is ordinary, three is
   * possible -- and in front of this deployment sit an nginx that stops
   * reading at sixty seconds and a tunnel that gives up around a hundred.
   * Waiting for the answer inside the request meant the operator never saw
   * one: the gateway cut the connection first and the browser drew its own
   * error over a run that was still going. So the request starts a run (149)
   * and returns it; the call to the model goes on in this process and writes
   * its outcome against that row; the console reads the row while it waits.
   */
  async begin(input: {
    readonly actorUserId: string;
    readonly prompt?: string | undefined;
    readonly idempotencyKey?: string | undefined;
  }): Promise<AiNewsRunRow | null> {
    const prompt = (input.prompt ?? '').trim();
    if (prompt.length > 2000) throw new AiNewsInputError('the wish must be at most 2000 characters');
    // A run needs a key that can call the model, and saying so now is worth
    // more than a run that exists only to fail.
    const credential = await this.open(input.actorUserId);

    const run = await this.repository.beginRun({
      idempotencyKey: input.idempotencyKey ?? randomUUID(),
      actorUserId: input.actorUserId,
      prompt,
    });
    if (run.started) {
      // Deliberately not awaited: this is the work the response is not
      // waiting for. `perform` settles the run itself, whatever happens.
      void this.perform(run.run_id, input.actorUserId, prompt, credential);
    }
    return this.repository.latestRun(input.actorUserId);
  }

  /**
   * The run itself: the context as the model was shown it, the call, and the
   * batch -- or the reason there is none -- written against the run's row.
   * Nothing here throws: a run nobody is waiting on can only report.
   */
  private async perform(
    runId: string,
    actorUserId: string,
    prompt: string,
    credential: { readonly apiBaseUrl: string; readonly model: string; readonly apiKey: string },
  ): Promise<void> {
    try {
      const context = await this.repository.context(actorUserId);
      const batch = await this.caller({
        apiBaseUrl: credential.apiBaseUrl,
        apiKey: credential.apiKey,
        model: credential.model,
        system: SYSTEM_PROMPT,
        user: userPrompt(context, prompt),
      });
      const scenarios = normalise(batch, context);
      if (scenarios.length === 0) {
        throw new AiNewsUnavailableError('ai_news_model_unusable', 'the model wrote nothing that could be published');
      }
      const created = await this.repository.createBatch({
        idempotencyKey: randomUUID(),
        actorUserId,
        prompt,
        model: credential.model,
        context,
        scenarios,
      });
      await this.repository.finishRun({ actorUserId, runId, batchId: created.batch_id });
    } catch (error: unknown) {
      const code = error instanceof AiNewsUnavailableError ? error.code : 'ai_news_model_unusable';
      const detail = error instanceof Error ? error.message : 'the run ended without a reason';
      try {
        await this.repository.finishRun({ actorUserId, runId, failureCode: code, failureDetail: detail });
      } catch {
        // The row is left open; `ai_news_run_begin` abandons it after ten
        // minutes rather than leaving the console waiting forever.
      }
    }
  }

  publish(input: {
    readonly actorUserId: string;
    readonly scenarioId: string;
    readonly hours: unknown;
    readonly headline: unknown;
    readonly body?: unknown;
    readonly effects: unknown;
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

  /** The stored address, model and key, opened for the seconds a call takes. */
  private async open(actorUserId: string): Promise<{
    readonly apiBaseUrl: string;
    readonly model: string;
    readonly apiKey: string;
  }> {
    const credential = await this.repository.credential(actorUserId);
    if (!credential?.api_key_sealed || !credential.api_key_key_id) {
      throw new AiNewsUnavailableError('ai_news_key_missing', 'no API key has been set');
    }
    if (!this.sealing || this.sealing.keyId !== credential.api_key_key_id) {
      throw new AiNewsUnavailableError('ai_news_sealing_unavailable', 'the stored key was sealed under a key this deployment does not hold');
    }
    return {
      apiBaseUrl: credential.api_base_url,
      model: credential.model,
      apiKey: openSecret(credential.api_key_sealed, this.sealing).toString('utf8'),
    };
  }
}

/**
 * What the model said, held to the rules the prompt stated.
 *
 * Every leg must name a listed symbol or the whole market; a leg naming
 * something unlisted is dropped and said so in the rationale, because a
 * story about a company that does not exist is worse than a story with one
 * fewer stock in it. Four legs at most, one strength-3 leg at most, and a
 * scenario that moves nothing -- or has no headline left after trimming --
 * is dropped rather than taking the four beside it down.
 */
export function normalise(batch: ScenarioBatch, context: Record<string, unknown>): ScenarioProposal[] {
  const listed = new Set(
    (Array.isArray(context.stocks) ? context.stocks : [])
      .map((stock) => (typeof stock === 'object' && stock !== null ? (stock as { symbol?: unknown }).symbol : undefined))
      .filter((symbol): symbol is string => typeof symbol === 'string')
      .map((symbol) => symbol.toUpperCase()),
  );
  const proposals: ScenarioProposal[] = [];
  for (const scenario of batch.scenarios.slice(0, HOW_MANY)) {
    const headline = scenario.headline.trim().slice(0, 120);
    if (headline.length < 2) continue;

    // A model answering in 135's one-stock shape has still answered.
    const legs = scenario.effects ?? (scenario.direction
      ? [{ stock_symbol: scenario.stock_symbol, direction: scenario.direction, strength: scenario.strength ?? 2 }]
      : []);

    const unknown: string[] = [];
    const seen = new Set<string>();
    const effects: ScenarioEffectProposal[] = [];
    let strongSeen = false;
    for (const leg of legs) {
      const symbol = leg.stock_symbol?.trim().toUpperCase() || null;
      if (symbol !== null && !listed.has(symbol)) {
        unknown.push(symbol);
        continue;
      }
      // One leg per stock: a story cannot lean a stock two ways.
      const key = symbol ?? '__market__';
      if (seen.has(key)) continue;
      seen.add(key);
      let strength = strengthOf(leg.strength);
      if (strength === 3 && leg.direction !== 'none') {
        if (strongSeen) strength = 2;
        strongSeen = true;
      }
      effects.push({ stock_symbol: symbol, direction: leg.direction, strength });
      if (effects.length === MOST_EFFECTS) break;
    }
    if (!effects.some((effect) => effect.direction !== 'none')) continue;

    const rationale = (scenario.rationale ?? '').trim();
    proposals.push({
      effects,
      hours: Math.min(168, Math.max(1, Math.round(scenario.hours) || 1)),
      headline,
      body: (scenario.body ?? '').trim().slice(0, 2000),
      rationale: (unknown.length > 0
        ? `(${unknown.join(', ')}은 상장 종목이 아니라 뺐습니다) ${rationale}`
        : rationale
      ).slice(0, 1000),
    });
  }
  return proposals;
}

function strengthOf(value: number | undefined): 1 | 2 | 3 {
  const whole = Math.round(value ?? 2);
  if (whole >= 3) return 3;
  if (whole <= 1) return 1;
  return 2;
}
