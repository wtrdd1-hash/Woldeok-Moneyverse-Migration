import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import {
  EconomyAiReviewer,
  aggregateCouncil,
  economyAiConfig,
  type EconomyAiModelCaller,
  type EconomyAiReviewConfig,
} from './economy-ai-review';

const config: EconomyAiReviewConfig = {
  agents: Object.fromEntries(
    ['macro', 'shop', 'stock', 'jobs', 'welfare', 'integrity'].map((domain) => [
      domain,
      {
        A: { apiBaseUrl: 'http://model-a.test/v1', apiKey: 'a', model: `${domain}-a` },
        B: { apiBaseUrl: 'http://model-b.test/v1', apiKey: 'b', model: `${domain}-b` },
      },
    ]),
  ) as EconomyAiReviewConfig['agents'],
  timeoutMs: 10_000,
  ttlMinutes: 120,
  maxConcurrency: 2,
  cacheTtlSeconds: 300,
};

function dbFor(options: {
  readonly state?: string;
  readonly proposal?: Record<string, unknown>;
  readonly storedId?: string;
}) {
  const calls: Array<{ text: string; values: readonly unknown[] }> = [];
  const db: Queryable = {
    async query(text, values = []) {
      calls.push({ text, values });
      if (text.includes('feature_switch_state')) {
        return { rows: [{ state: options.state ?? 'enabled' }] } as never;
      }
      if (text.includes('economy_propose_policy_adjustment')) {
        return {
          rows: [
            {
              proposal:
                options.proposal ??
                ({
                  eligible: true,
                  sourceMetrics: { days: 7 },
                  adjustments: [{ knob: 'shop.general_price_percent', from: 100, to: 105 }],
                } as Record<string, unknown>),
            },
          ],
        } as never;
      }
      if (text.includes('economy_record_ai_policy_review')) {
        return {
          rows: [{ id: options.storedId ?? '11111111-1111-4111-8111-111111111111' }],
        } as never;
      }
      throw new Error(`unexpected query: ${text}`);
    },
  };
  return { db, calls };
}

describe('economy AI review lane', () => {
  it('parses environment config without requiring a key for a local compatible server', () => {
    expect(
      economyAiConfig({
        ECONOMY_AI_API_BASE_URL: 'http://127.0.0.1:11434/v1/',
        ECONOMY_AI_MODEL_A: 'local-a',
        ECONOMY_AI_MODEL_B: 'local-b',
        ECONOMY_AI_TIMEOUT_MS: '25000',
        ECONOMY_AI_REVIEW_TTL_MINUTES: '45',
        ECONOMY_AI_MAX_CONCURRENCY: '1',
      }),
    ).toMatchObject({
      agents: {
        macro: {
          A: { apiBaseUrl: 'http://127.0.0.1:11434/v1', model: 'local-a' },
          B: { apiBaseUrl: 'http://127.0.0.1:11434/v1', model: 'local-b' },
        },
      },
      timeoutMs: 25_000,
      ttlMinutes: 45,
      maxConcurrency: 1,
      cacheTtlSeconds: 300,
    });
  });

  it('does nothing while the feature switch is disabled', async () => {
    const { db, calls } = dbFor({ state: 'disabled' });
    const caller = vi.fn<EconomyAiModelCaller>();
    const result = await new EconomyAiReviewer(db, config, caller).run();
    expect(result).toEqual({ reviewed: false, status: 'disabled', switchState: 'disabled' });
    expect(caller).not.toHaveBeenCalled();
    expect(calls).toHaveLength(1);
  });

  it('falls back to the classical lane when model configuration is absent', async () => {
    const { db, calls } = dbFor({});
    const result = await new EconomyAiReviewer(db, null).run();
    expect(result).toEqual({ reviewed: false, status: 'unconfigured_classical_fallback' });
    expect(calls.some((call) => call.text.includes('economy_record_ai_policy_review'))).toBe(false);
  });

  it('stores an agreeing review for the exact proposal', async () => {
    const { db, calls } = dbFor({});
    const caller: EconomyAiModelCaller = async () => ({
      decision: 'agree',
      confidence: 0.91,
      rationale: 'The bounded move follows the observed low burn ratio.',
      risks: ['Watch new-member affordability after rollout.'],
    });
    const result = await new EconomyAiReviewer(db, config, caller).run();
    expect(result).toMatchObject({ reviewed: true, status: 'council_agree', decision: 'agree' });
    const insert = calls.find((call) => call.text.includes('economy_record_ai_policy_review'));
    expect(insert?.values[1]).toBe('agree');
    expect(insert?.values[5]).toBe('multi-agent-council');
    expect(JSON.parse(String(insert?.values[8]))).toHaveLength(8);
    expect(result).toMatchObject({ domainCount: 4, agentCount: 8, mode: 'independent_only' });
  });

  it('downgrades a low-confidence veto to abstain instead of blocking policy', async () => {
    const { db, calls } = dbFor({});
    const caller: EconomyAiModelCaller = async () => ({
      decision: 'veto',
      confidence: 0.49,
      rationale: 'Possible concern, but evidence is weak.',
      risks: ['Insufficient evidence.'],
    });
    const result = await new EconomyAiReviewer(db, config, caller).run();
    expect(result).toMatchObject({
      reviewed: true,
      status: 'council_abstained',
      decision: 'abstain',
    });
    const insert = calls.find((call) => call.text.includes('economy_record_ai_policy_review'));
    expect(insert?.values[1]).toBe('abstain');
  });

  it('returns a classical fallback without writing when the model fails', async () => {
    const { db, calls } = dbFor({});
    const caller: EconomyAiModelCaller = async () => {
      throw new Error('model offline');
    };
    const result = await new EconomyAiReviewer(db, config, caller).run();
    expect(result).toMatchObject({
      reviewed: true,
      status: 'council_abstained',
      decision: 'abstain',
    });
    expect(calls.some((call) => call.text.includes('economy_record_ai_policy_review'))).toBe(true);
  });
  it('abstains when a domain pair disagrees after rebuttal', () => {
    const reviews = ['macro', 'shop', 'stock', 'jobs', 'welfare', 'integrity'].flatMap((domain) =>
      (['A', 'B'] as const).map((seat) => ({
        domain: domain as 'macro' | 'shop' | 'stock' | 'jobs' | 'welfare' | 'integrity',
        seat,
        stage: 'rebuttal' as const,
        model: `${domain}-${seat}`,
        decision: 'agree' as const,
        confidence: 0.9,
        rationale: 'ok',
        risks: [],
      })),
    );
    reviews[0] = { ...reviews[0]!, decision: 'veto', rationale: 'macro disagreement' };
    expect(aggregateCouncil(reviews)).toMatchObject({ decision: 'abstain' });
  });

  it('vetoes when both integrity specialists independently veto', () => {
    const reviews = ['macro', 'shop', 'stock', 'jobs', 'welfare', 'integrity'].flatMap((domain) =>
      (['A', 'B'] as const).map((seat) => ({
        domain: domain as 'macro' | 'shop' | 'stock' | 'jobs' | 'welfare' | 'integrity',
        seat,
        stage: 'rebuttal' as const,
        model: `${domain}-${seat}`,
        decision: (domain === 'integrity' ? 'veto' : 'agree') as 'agree' | 'veto',
        confidence: 0.92,
        rationale: 'evidence',
        risks: domain === 'integrity' ? ['exploit risk'] : [],
      })),
    );
    expect(aggregateCouncil(reviews)).toMatchObject({ decision: 'veto' });
  });

  it('routes shop proposals only to macro, shop, welfare and integrity specialists', async () => {
    const { db } = dbFor({});
    const seen: string[] = [];
    const caller: EconomyAiModelCaller = async (_config, _proposal, context) => {
      seen.push(`${context.stage}:${context.domain}:${context.seat}`);
      return { decision: 'agree', confidence: 0.95, rationale: 'safe', risks: [] };
    };
    const result = await new EconomyAiReviewer(db, config, caller).run();
    expect(result).toMatchObject({ mode: 'early_exit', domainCount: 4, agentCount: 8 });
    expect(seen).toHaveLength(8);
    expect(seen.some((entry) => entry.includes(':stock:'))).toBe(false);
    expect(seen.some((entry) => entry.includes(':jobs:'))).toBe(false);
    expect(seen.some((entry) => entry.startsWith('rebuttal:'))).toBe(false);
  });

  it('runs full rebuttal for selected domains when a job-cap proposal is high risk', async () => {
    const { db } = dbFor({
      proposal: {
        eligible: true,
        sourceMetrics: { days: 7 },
        adjustments: [{ knob: 'jobs.assignment_daily_limit_delta.developer', from: 0, to: -1 }],
      },
    });
    const seen: string[] = [];
    const caller: EconomyAiModelCaller = async (_config, _proposal, context) => {
      seen.push(`${context.stage}:${context.domain}:${context.seat}`);
      return { decision: 'agree', confidence: 0.95, rationale: 'bounded', risks: [] };
    };
    const result = await new EconomyAiReviewer(db, config, caller).run();
    expect(result).toMatchObject({ mode: 'full_risk_rebuttal', domainCount: 4, agentCount: 16 });
    expect(seen.filter((entry) => entry.startsWith('independent:'))).toHaveLength(8);
    expect(seen.filter((entry) => entry.startsWith('rebuttal:'))).toHaveLength(8);
  });
});
