import { describe, expect, it, vi } from 'vitest';
import type { TotpSealingKey } from '../auth/totp';
import { sealSecret } from '../auth/totp';
import type { AiNewsRepository, ScenarioProposal } from './ai-news.repository';
import { AiNewsService, AiNewsUnavailableError, SYSTEM_PROMPT, normalise, userPrompt } from './ai-news.service';
import type { ModelCall, ScenarioBatch } from './ai-news.service';

const ACTOR = '11111111-1111-4111-8111-111111111111';
const SEALING: TotpSealingKey = { keyId: 'test', key: Buffer.alloc(32, 7) };

const CONTEXT = {
  now_seoul: '2026-09-04 21:00',
  stocks: [{ symbol: 'MYUY', name: '뮤야얌 전자' }, { symbol: 'DUCK', name: '덕덕 상사' }],
  live_events: [],
};

const proposal = (overrides: Partial<ScenarioBatch['scenarios'][number]> = {}): ScenarioBatch['scenarios'][number] => ({
  stock_symbol: 'MYUY',
  direction: 'up',
  strength: 2,
  hours: 6,
  headline: '뮤야얌 전자, 신제품 발표',
  body: '시장의 기대가 높다.',
  rationale: '지난 소식을 잇는다.',
  ...overrides,
});

function fakeRepository(overrides: Partial<AiNewsRepository> = {}): AiNewsRepository {
  return {
    settings: vi.fn(),
    credential: vi.fn(async () => ({
      api_base_url: 'https://api.example',
      model: 'claude-opus-5',
      api_key_sealed: sealSecret(Buffer.from('sk-test-key-1234'), SEALING),
      api_key_key_id: 'test',
    })),
    saveSettings: vi.fn(async () => true),
    context: vi.fn(async () => CONTEXT),
    createBatch: vi.fn(async () => ({ batch_id: 'b', replayed: false })),
    latest: vi.fn(async () => null),
    publish: vi.fn(async () => ({ event_id: 'e', replayed: false })),
    discard: vi.fn(async () => true),
    ...overrides,
  } as unknown as AiNewsRepository;
}

describe('the prompt', () => {
  it('states the rules the database enforces, so the model and the function agree', () => {
    expect(SYSTEM_PROMPT).toContain('exactly 5 scenarios');
    expect(SYSTEM_PROMPT).toContain('six hours');
    expect(SYSTEM_PROMPT).toContain('At most one scenario in a batch');
  });

  it('hands the model the whole context and the wish, and says when there is none', () => {
    expect(userPrompt(CONTEXT, '')).toContain('Operator wish: none');
    expect(userPrompt(CONTEXT, ' 악재 위주로 ')).toContain('Operator wish: 악재 위주로');
    expect(userPrompt(CONTEXT, '')).toContain('"symbol": "MYUY"');
  });
});

describe('normalise', () => {
  it('turns an unlisted symbol into the whole market and says so, rather than refusing the batch', () => {
    const [only] = normalise({ scenarios: [proposal({ stock_symbol: 'ghost' })] }, CONTEXT);
    expect(only?.stock_symbol).toBeNull();
    expect(only?.rationale).toContain('GHOST');
  });

  it('keeps at most one strength-3 scenario per batch', () => {
    const out = normalise({ scenarios: [proposal({ strength: 3 }), proposal({ strength: 3 }), proposal({ strength: 1 })] }, CONTEXT);
    expect(out.map((s) => s.strength)).toEqual([3, 2, 1]);
  });

  it('clamps hours and trims text to the widths the database enforces', () => {
    const [only] = normalise({ scenarios: [proposal({ hours: 400, headline: ` ${'x'.repeat(200)} ` })] }, CONTEXT);
    expect(only?.hours).toBe(168);
    expect(only?.headline).toHaveLength(120);
  });

  it('never stores more than five', () => {
    const out = normalise({ scenarios: Array.from({ length: 5 }, () => proposal()) }, CONTEXT);
    expect(out).toHaveLength(5);
  });
});

describe('AiNewsService.generate', () => {
  it('refuses before calling the model when no key is stored', async () => {
    const repository = fakeRepository({
      credential: vi.fn(async () => ({ api_base_url: 'x', model: 'm', api_key_sealed: null, api_key_key_id: null })),
    } as Partial<AiNewsRepository>);
    const caller = vi.fn();
    const service = new AiNewsService(repository, SEALING, caller);
    await expect(service.generate({ actorUserId: ACTOR })).rejects.toMatchObject({ code: 'ai_news_key_missing' });
    expect(caller).not.toHaveBeenCalled();
  });

  it('refuses when the stored key was sealed under a key this deployment does not hold', async () => {
    const service = new AiNewsService(fakeRepository(), { keyId: 'other', key: Buffer.alloc(32, 1) }, vi.fn());
    await expect(service.generate({ actorUserId: ACTOR })).rejects.toMatchObject({ code: 'ai_news_sealing_unavailable' });
  });

  it('opens the key, calls the model at the stored address with the context, and stores what came back', async () => {
    const calls: ModelCall[] = [];
    const caller = async (call: ModelCall): Promise<ScenarioBatch> => {
      calls.push(call);
      return { scenarios: [proposal(), proposal({ stock_symbol: null, direction: 'down' })] };
    };
    const repository = fakeRepository();
    const service = new AiNewsService(repository, SEALING, caller);
    await service.generate({ actorUserId: ACTOR, prompt: '  조용한 하루  ', idempotencyKey: '22222222-2222-4222-8222-222222222222' });

    expect(calls[0]).toMatchObject({ apiBaseUrl: 'https://api.example', apiKey: 'sk-test-key-1234', model: 'claude-opus-5', system: SYSTEM_PROMPT });
    expect(calls[0]?.user).toContain('Operator wish: 조용한 하루');
    const stored = (repository.createBatch as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as {
      prompt: string; model: string; scenarios: ScenarioProposal[]; context: unknown;
    };
    expect(stored.prompt).toBe('조용한 하루');
    expect(stored.model).toBe('claude-opus-5');
    expect(stored.context).toEqual(CONTEXT);
    expect(stored.scenarios).toHaveLength(2);
    expect(stored.scenarios[1]?.stock_symbol).toBeNull();
    expect(repository.latest).toHaveBeenCalledWith(ACTOR);
  });

  it('lets the model\'s own refusal through untouched', async () => {
    const caller = async (): Promise<ScenarioBatch> => {
      throw new AiNewsUnavailableError('ai_news_model_refused', 'declined');
    };
    const repository = fakeRepository();
    const service = new AiNewsService(repository, SEALING, caller);
    await expect(service.generate({ actorUserId: ACTOR })).rejects.toMatchObject({ code: 'ai_news_model_refused' });
    expect(repository.createBatch).not.toHaveBeenCalled();
  });
});

describe('AiNewsService.saveSettings', () => {
  it('seals the key and keeps only its last four characters in the clear', async () => {
    const repository = fakeRepository();
    const service = new AiNewsService(repository, SEALING, vi.fn());
    await service.saveSettings({ actorUserId: ACTOR, apiBaseUrl: 'https://api.example', model: 'm', apiKey: 'sk-ant-secret-9876' });
    const saved = (repository.saveSettings as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as {
      apiKeySealed: string | null; apiKeyKeyId: string | null; apiKeyHint: string | null;
    };
    expect(saved.apiKeySealed).not.toContain('secret');
    expect(saved.apiKeyKeyId).toBe('test');
    expect(saved.apiKeyHint).toBe('9876');
  });

  it('sends no key at all when the field was left empty, so the stored one stays', async () => {
    const repository = fakeRepository();
    const service = new AiNewsService(repository, SEALING, vi.fn());
    await service.saveSettings({ actorUserId: ACTOR, apiBaseUrl: 'https://api.example', model: 'm', apiKey: '' });
    const saved = (repository.saveSettings as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as { apiKeySealed: string | null };
    expect(saved.apiKeySealed).toBeNull();
  });

  it('refuses to store a key without a sealing key rather than storing it in the clear', async () => {
    const service = new AiNewsService(fakeRepository(), null, vi.fn());
    await expect(
      service.saveSettings({ actorUserId: ACTOR, apiBaseUrl: 'https://api.example', model: 'm', apiKey: 'sk-ant-secret-9876' }),
    ).rejects.toMatchObject({ code: 'ai_news_sealing_unavailable' });
  });
});
