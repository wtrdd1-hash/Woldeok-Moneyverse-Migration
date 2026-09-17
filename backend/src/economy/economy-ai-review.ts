import { z } from 'zod';
import type { Queryable } from '../core/db';
import { queryOne } from '../core/db';

export const ECONOMY_AI_PROMPT_VERSION = 'dual-economy-council-v3';

export const ECONOMY_AI_DOMAINS = [
  'macro',
  'shop',
  'stock',
  'jobs',
  'welfare',
  'integrity',
] as const;
export type EconomyAiDomain = (typeof ECONOMY_AI_DOMAINS)[number];
export type EconomyAiSeat = 'A' | 'B';
const MIN_ACTION_CONFIDENCE = 0.7;

export interface EconomyAiModelConfig {
  readonly apiBaseUrl: string;
  readonly apiKey: string;
  readonly model: string;
}

export interface EconomyAiReviewConfig {
  readonly agents: Readonly<
    Record<EconomyAiDomain, Readonly<Record<EconomyAiSeat, EconomyAiModelConfig>>>
  >;
  readonly timeoutMs: number;
  readonly ttlMinutes: number;
  readonly maxConcurrency: number;
  readonly cacheTtlSeconds: number;
}

export interface EconomyAiReview {
  readonly decision: 'agree' | 'veto' | 'abstain';
  readonly confidence: number;
  readonly rationale: string;
  readonly risks: readonly string[];
  readonly inputTokens?: number;
  readonly outputTokens?: number;
  readonly totalTokens?: number;
}

export interface EconomyAiAgentContext {
  readonly domain: EconomyAiDomain;
  readonly seat: EconomyAiSeat;
  readonly stage: 'independent' | 'rebuttal';
  readonly peerReview?: EconomyAiReview;
}

export interface EconomyAiAgentReview extends EconomyAiReview {
  readonly domain: EconomyAiDomain;
  readonly seat: EconomyAiSeat;
  readonly stage: 'independent' | 'rebuttal';
  readonly model: string;
  readonly latencyMs?: number;
}

export type EconomyAiModelCaller = (
  config: EconomyAiModelConfig & Pick<EconomyAiReviewConfig, 'timeoutMs'>,
  proposal: Record<string, unknown>,
  context: EconomyAiAgentContext,
) => Promise<EconomyAiReview>;

const ReviewSchema = z.object({
  decision: z.enum(['agree', 'veto', 'abstain']),
  confidence: z.number().min(0).max(1),
  rationale: z.string().min(1).max(2000),
  risks: z.array(z.string().min(1).max(300)).max(12).default([]),
});

const ChatResponseSchema = z.object({
  choices: z
    .array(
      z.object({
        message: z.object({
          content: z.union([
            z.string(),
            z.array(z.object({ type: z.string().optional(), text: z.string().optional() })),
          ]),
        }),
      }),
    )
    .min(1),
  usage: z.object({ prompt_tokens: z.number().optional(), completion_tokens: z.number().optional(), total_tokens: z.number().optional() }).optional(),
});

export function economyAiConfig(
  env: NodeJS.ProcessEnv = process.env,
): EconomyAiReviewConfig | null {
  const commonBase = env.ECONOMY_AI_API_BASE_URL?.trim();
  const commonKey = env.ECONOMY_AI_API_KEY?.trim() ?? '';
  const genericA = env.ECONOMY_AI_MODEL_A?.trim() || env.ECONOMY_AI_MODEL?.trim();
  const genericB = env.ECONOMY_AI_MODEL_B?.trim();
  const agents = {} as Record<EconomyAiDomain, Record<EconomyAiSeat, EconomyAiModelConfig>>;
  for (const domain of ECONOMY_AI_DOMAINS) {
    agents[domain] = {} as Record<EconomyAiSeat, EconomyAiModelConfig>;
    for (const seat of ['A', 'B'] as const) {
      const prefix = `ECONOMY_AI_${domain.toUpperCase()}_${seat}`;
      const apiBaseUrl =
        env[`${prefix}_API_BASE_URL`]?.trim() ||
        env[`ECONOMY_AI_API_BASE_URL_${seat}`]?.trim() ||
        commonBase;
      const apiKey =
        env[`${prefix}_API_KEY`]?.trim() ?? env[`ECONOMY_AI_API_KEY_${seat}`]?.trim() ?? commonKey;
      const model = env[`${prefix}_MODEL`]?.trim() || (seat === 'A' ? genericA : genericB);
      if (!apiBaseUrl || !model) return null;
      agents[domain][seat] = { apiBaseUrl: apiBaseUrl.replace(/\/+$/, ''), apiKey, model };
    }
  }
  const timeout = Number.parseInt(env.ECONOMY_AI_TIMEOUT_MS ?? '', 10);
  const ttl = Number.parseInt(env.ECONOMY_AI_REVIEW_TTL_MINUTES ?? '', 10);
  const concurrency = Number.parseInt(env.ECONOMY_AI_MAX_CONCURRENCY ?? '', 10);
  const cacheTtl = Number.parseInt(env.ECONOMY_AI_CACHE_TTL_SECONDS ?? '', 10);
  return {
    agents,
    timeoutMs:
      Number.isSafeInteger(timeout) && timeout >= 5_000 && timeout <= 180_000 ? timeout : 60_000,
    ttlMinutes: Number.isSafeInteger(ttl) && ttl >= 15 && ttl <= 1_440 ? ttl : 120,
    maxConcurrency:
      Number.isSafeInteger(concurrency) && concurrency >= 1 && concurrency <= 6 ? concurrency : 2,
    cacheTtlSeconds: Number.isSafeInteger(cacheTtl) && cacheTtl >= 0 && cacheTtl <= 3600 ? cacheTtl : 300,
  };
}

function textContent(value: z.infer<typeof ChatResponseSchema>): string {
  const content = value.choices[0]!.message.content;
  if (typeof content === 'string') return content.trim();
  return content
    .map((part) => part.text ?? '')
    .join('')
    .trim();
}

function parseReview(text: string): EconomyAiReview {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();
  let document: unknown;
  try {
    document = JSON.parse(cleaned);
  } catch {
    throw new Error('economy AI model returned invalid JSON');
  }
  const parsed = ReviewSchema.safeParse(document);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new Error(
      `economy AI review was invalid: ${issue?.path.join('.') || 'response'} ${issue?.message ?? ''}`.trim(),
    );
  }
  return parsed.data;
}

const REVIEW_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['decision', 'confidence', 'rationale', 'risks'],
  properties: {
    decision: { type: 'string', enum: ['agree', 'veto', 'abstain'] },
    confidence: { type: 'number', minimum: 0, maximum: 1 },
    rationale: { type: 'string' },
    risks: { type: 'array', maxItems: 12, items: { type: 'string' } },
  },
} as const;

const SYSTEM_PROMPT = `You are one specialist seat in the Moneyverse economy council, a fictional game economy.
The deterministic/classical engine is the authority for accounting, limits, prices and policy bounds.
You review one exact classical proposal. You cannot invent policy keys or replacement values.

Return AGREE only when the proposal's direction is economically plausible and no material user-welfare,
integrity, manipulation, affordability or model-risk concern is visible in the supplied evidence.
Return VETO only for a concrete material risk that makes automatic application unsafe. Return ABSTAIN when
evidence is insufficient, ambiguous or outside your competence. Never veto merely because another policy
might be better. Never infer private user attributes. WLD/WDX are game-only assets.

Answer with JSON only: {"decision":"agree|veto|abstain","confidence":0..1,
"rationale":"concise evidence-based reason","risks":["..."]}.`;

export const callEconomyAiModel: EconomyAiModelCaller = async (config, proposal, context) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs);
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (config.apiKey) headers.authorization = `Bearer ${config.apiKey}`;
  const url = `${config.apiBaseUrl}/chat/completions`;
  const domainBrief: Record<EconomyAiDomain, string> = {
    macro:
      'Focus on money supply, issuance, sinks, inflation/deflation, concentration and systemic stability.',
    shop: 'Focus on shop pricing, demand elasticity, supply, affordability, sink diversity and catalog effects.',
    stock:
      'Focus on virtual-stock liquidity, price formation, manipulation risk, stale data and market integrity.',
    jobs: 'Focus on profession rewards, repeat farming, profession supply/shortage, adaptive assignment limits, automatic relaxation, progression and labor-like faucet concentration.',
    welfare:
      'Focus on new-player affordability, retention, fairness, accessibility and avoiding punitive economics.',
    integrity:
      'Focus on abuse, bots, exploitability, data quality, reconciliation, causal uncertainty and rollback safety.',
  };
  const peer = context.peerReview
    ? `\nPeer ${context.seat === 'A' ? 'B' : 'A'} review to challenge:\n${JSON.stringify(context.peerReview)}`
    : '';
  const messages = [
    {
      role: 'system',
      content: `${SYSTEM_PROMPT}\nYour assigned domain is ${context.domain}. ${domainBrief[context.domain]}\nYou are seat ${context.seat}; preserve independent judgment. During rebuttal, explicitly test the peer's strongest claim rather than averaging.`,
    },
    {
      role: 'user',
      content: `Stage: ${context.stage}${peer}\nClassical proposal JSON:\n${JSON.stringify(proposal)}`,
    },
  ];
  const formats: readonly Record<string, unknown>[] = [
    {
      response_format: {
        type: 'json_schema',
        json_schema: { name: 'economy_policy_review', strict: true, schema: REVIEW_SCHEMA },
      },
    },
    { response_format: { type: 'json_object' } },
    {},
  ];
  try {
    let lastError = 'the model rejected every structured-output form';
    for (const format of formats) {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: config.model,
          messages,
          temperature: 0.1,
          max_tokens: 1200,
          ...format,
        }),
        signal: controller.signal,
      });
      const body = await response.text();
      if (!response.ok) {
        lastError = `economy AI model returned HTTP ${response.status}`;
        if (response.status === 400 || response.status === 422) continue;
        throw new Error(lastError);
      }
      let decoded: unknown;
      try {
        decoded = JSON.parse(body);
      } catch {
        throw new Error('economy AI endpoint returned non-JSON response');
      }
      const envelope = ChatResponseSchema.safeParse(decoded);
      if (!envelope.success)
        throw new Error('economy AI endpoint returned an unsupported chat response');
      const review = parseReview(textContent(envelope.data));
      return {
        ...review,
        ...(envelope.data.usage?.prompt_tokens !== undefined ? { inputTokens: envelope.data.usage.prompt_tokens } : {}),
        ...(envelope.data.usage?.completion_tokens !== undefined ? { outputTokens: envelope.data.usage.completion_tokens } : {}),
        ...(envelope.data.usage?.total_tokens !== undefined ? { totalTokens: envelope.data.usage.total_tokens } : {}),
      };
    }
    throw new Error(lastError);
  } finally {
    clearTimeout(timer);
  }
};

async function runWithConcurrency<T>(
  jobs: readonly (() => Promise<T>)[],
  limit: number,
): Promise<T[]> {
  const results = new Array<T>(jobs.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, jobs.length) }, async () => {
    while (true) {
      const index = cursor;
      cursor += 1;
      if (index >= jobs.length) return;
      results[index] = await jobs[index]!();
    }
  });
  await Promise.all(workers);
  return results;
}


export function selectDomainsForProposal(proposal: Record<string, unknown>): EconomyAiDomain[] {
  const selected = new Set<EconomyAiDomain>(['macro', 'welfare', 'integrity']);
  const adjustments = Array.isArray(proposal.adjustments) ? proposal.adjustments : [];
  for (const adjustment of adjustments) {
    if (!adjustment || typeof adjustment !== 'object') continue;
    const knob = String((adjustment as Record<string, unknown>).knob ?? '');
    if (knob.startsWith('shop.') || knob.startsWith('business.')) selected.add('shop');
    if (knob.startsWith('stock.') || knob.startsWith('market.')) selected.add('stock');
    if (knob.startsWith('work.') || knob.startsWith('jobs.')) selected.add('jobs');
  }
  return ECONOMY_AI_DOMAINS.filter((domain) => selected.has(domain));
}

function disputedDomains(reviews: readonly EconomyAiAgentReview[], domains: readonly EconomyAiDomain[]): EconomyAiDomain[] {
  return domains.filter((domain) => {
    const pair = reviews.filter((review) => review.domain === domain);
    if (pair.length !== 2) return true;
    return pair.some((review) => review.decision === 'abstain' || review.confidence < MIN_ACTION_CONFIDENCE)
      || pair[0]!.decision !== pair[1]!.decision;
  });
}

function isHighRiskProposal(proposal: Record<string, unknown>): boolean {
  const adjustments = Array.isArray(proposal.adjustments) ? proposal.adjustments : [];
  return adjustments.some((adjustment) => {
    if (!adjustment || typeof adjustment !== 'object') return false;
    const knob = String((adjustment as Record<string, unknown>).knob ?? '');
    return /(?:daily_cap|weekly_cap|daily_limit|deposit_rate|stock\.|market\.|credit|loan|casino)/.test(knob);
  });
}

export function aggregateCouncil(
  reviews: readonly EconomyAiAgentReview[],
  domains: readonly EconomyAiDomain[] = ECONOMY_AI_DOMAINS,
): EconomyAiReview {
  const latest = domains.flatMap((domain) =>
    (['A', 'B'] as const).flatMap((seat) => {
      const candidates = reviews.filter((review) => review.domain === domain && review.seat === seat);
      const chosen = candidates.find((review) => review.stage === 'rebuttal') ?? candidates.find((review) => review.stage === 'independent');
      return chosen ? [chosen] : [];
    }),
  );
  if (latest.length < domains.length * 2) {
    return { decision: 'abstain', confidence: 0, rationale: 'the specialist council was incomplete', risks: ['council_incomplete'] };
  }
  const disputed: EconomyAiDomain[] = [];
  const vetoDomains: EconomyAiDomain[] = [];
  const agreeDomains: EconomyAiDomain[] = [];
  for (const domain of domains) {
    const pair = latest.filter((review) => review.domain === domain);
    const actionable = pair.filter((review) => review.confidence >= MIN_ACTION_CONFIDENCE && review.decision !== 'abstain');
    if (actionable.some((review) => review.decision === 'veto') && actionable.some((review) => review.decision === 'agree')) disputed.push(domain);
    else if (actionable.length === 2 && actionable.every((review) => review.decision === 'veto')) vetoDomains.push(domain);
    else if (actionable.length === 2 && actionable.every((review) => review.decision === 'agree')) agreeDomains.push(domain);
    else disputed.push(domain);
  }
  const criticalVeto = vetoDomains.some((domain) => domain === 'integrity' || domain === 'welfare');
  const decision: EconomyAiReview['decision'] = criticalVeto || vetoDomains.length >= 2
    ? 'veto'
    : disputed.length === 0 && agreeDomains.length === domains.length ? 'agree' : 'abstain';
  const confidence = latest.reduce((sum, review) => sum + review.confidence, 0) / latest.length;
  const risks = [...new Set(latest.flatMap((review) => review.risks))].slice(0, 12);
  return { decision, confidence: Number(confidence.toFixed(4)), risks, rationale: `council decision=${decision}; domains=${domains.join(',')}; agree=${agreeDomains.join(',') || 'none'}; veto=${vetoDomains.join(',') || 'none'}; disputed=${disputed.join(',') || 'none'}` };
}

export class EconomyAiReviewer {
  private readonly cache = new Map<string, { expiresAt: number; aggregate: EconomyAiReview; evidence: EconomyAiAgentReview[]; domains: EconomyAiDomain[]; mode: string }>();

  constructor(
    private readonly db: Queryable,
    private readonly config: EconomyAiReviewConfig | null,
    private readonly caller: EconomyAiModelCaller = callEconomyAiModel,
  ) {}

  async run(): Promise<Record<string, unknown>> {
    const switchRow = await queryOne<{ state: string }>(
      this.db,
      "SELECT public.feature_switch_state('economy_ai_policy_review') AS state",
    );
    if (switchRow?.state !== 'enabled') {
      return { reviewed: false, status: 'disabled', switchState: switchRow?.state ?? 'disabled' };
    }

    const proposalRow = await queryOne<{ proposal: Record<string, unknown> }>(
      this.db,
      'SELECT public.economy_propose_policy_adjustment(7) AS proposal',
    );
    const proposal = proposalRow?.proposal ?? {};
    const adjustments = Array.isArray(proposal.adjustments) ? proposal.adjustments : [];
    if (proposal.eligible !== true || adjustments.length === 0) {
      return { reviewed: false, status: 'no_eligible_classical_proposal' };
    }
    if (!this.config) {
      return { reviewed: false, status: 'unconfigured_classical_fallback' };
    }

    const domains = selectDomainsForProposal(proposal);
    const cacheKey = JSON.stringify({ proposal, prompt: ECONOMY_AI_PROMPT_VERSION, models: domains.map((domain) => this.config!.agents[domain]) });
    const cached = this.cache.get(cacheKey);
    let aggregate: EconomyAiReview;
    let finalReviews: EconomyAiAgentReview[];
    let mode: string;
    if (cached && cached.expiresAt > Date.now()) {
      aggregate = cached.aggregate;
      finalReviews = cached.evidence;
      mode = 'cache_hit';
    } else {
      const independent = await this.runCouncilStage(proposal, 'independent', [], domains);
      const initialAggregate = aggregateCouncil(independent, domains);
      const disputed = disputedDomains(independent, domains);
      const highRisk = isHighRiskProposal(proposal);
      const rebuttalDomains = highRisk ? domains : disputed;
      if (initialAggregate.decision === 'agree' && initialAggregate.risks.length === 0 && rebuttalDomains.length === 0) {
        finalReviews = independent;
        aggregate = initialAggregate;
        mode = 'early_exit';
      } else if (rebuttalDomains.length > 0) {
        const rebuttal = await this.runCouncilStage(proposal, 'rebuttal', independent, rebuttalDomains);
        finalReviews = [...independent, ...rebuttal];
        aggregate = aggregateCouncil(finalReviews, domains);
        mode = highRisk ? 'full_risk_rebuttal' : 'targeted_rebuttal';
      } else {
        finalReviews = independent;
        aggregate = initialAggregate;
        mode = 'independent_only';
      }
      if (this.config.cacheTtlSeconds > 0) this.cache.set(cacheKey, { expiresAt: Date.now() + this.config.cacheTtlSeconds * 1000, aggregate, evidence: finalReviews, domains, mode });
    }
    const stored = await queryOne<{ id: string }>(
      this.db,
      `SELECT public.economy_record_ai_policy_review(
         $1::jsonb, $2, $3::numeric, $4, $5::jsonb, $6, $7, $8, $9::jsonb
       )::text AS id`,
      [
        JSON.stringify(proposal),
        aggregate.decision,
        aggregate.confidence,
        aggregate.rationale,
        JSON.stringify(aggregate.risks),
        'multi-agent-council',
        ECONOMY_AI_PROMPT_VERSION,
        this.config.ttlMinutes,
        JSON.stringify(finalReviews),
      ],
    );

    return {
      reviewed: true,
      status:
        aggregate.decision === 'abstain' ? 'council_abstained' : `council_${aggregate.decision}`,
      reviewId: stored?.id ?? null,
      decision: aggregate.decision,
      confidence: aggregate.confidence,
      risks: aggregate.risks,
      agentCount: finalReviews.length,
      domainCount: domains.length,
      domains,
      mode,
      totalTokens: finalReviews.reduce((sum, review) => sum + (review.totalTokens ?? 0), 0),
      totalLatencyMs: finalReviews.reduce((sum, review) => sum + (review.latencyMs ?? 0), 0),
    };
  }

  private async runCouncilStage(
    proposal: Record<string, unknown>,
    stage: 'independent' | 'rebuttal',
    previous: readonly EconomyAiAgentReview[] = [],
    domains: readonly EconomyAiDomain[] = ECONOMY_AI_DOMAINS,
  ): Promise<EconomyAiAgentReview[]> {
    if (!this.config) return [];
    const jobs = domains.flatMap((domain) =>
      (['A', 'B'] as const).map((seat) => async () => {
        const modelConfig = this.config!.agents[domain][seat];
        const peer = previous.find((review) => review.domain === domain && review.seat !== seat);
        try {
          const startedAt = Date.now();
          const context: EconomyAiAgentContext = peer
            ? { domain, seat, stage, peerReview: peer }
            : { domain, seat, stage };
          const review = await this.caller(
            { ...modelConfig, timeoutMs: this.config!.timeoutMs },
            proposal,
            context,
          );
          const decision = review.confidence >= MIN_ACTION_CONFIDENCE ? review.decision : 'abstain';
          return { ...review, decision, domain, seat, stage, model: modelConfig.model, latencyMs: Date.now() - startedAt };
        } catch (error: unknown) {
          return {
            decision: 'abstain' as const,
            confidence: 0,
            domain,
            seat,
            stage,
            model: modelConfig.model,
            rationale:
              error instanceof Error
                ? `model unavailable: ${error.message.slice(0, 240)}`
                : 'model unavailable',
            risks: ['model_unavailable'],
          };
        }
      }),
    );
    return runWithConcurrency(jobs, this.config.maxConcurrency);
  }
}
