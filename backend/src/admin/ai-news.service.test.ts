import { afterEach, describe, expect, it, vi } from 'vitest';
import type { TotpSealingKey } from '../auth/totp';
import { sealSecret } from '../auth/totp';
import type { AiNewsRepository, ScenarioProposal } from './ai-news.repository';
import {
  AiNewsService,
  AiNewsUnavailableError,
  SYSTEM_PROMPT,
  endpoint,
  normalise,
  openAiCaller,
  openAiLister,
  userPrompt,
} from './ai-news.service';
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
      model: 'gpt-4o-mini',
      api_key_sealed: sealSecret(Buffer.from('sk-test-key-1234'), SEALING),
      api_key_key_id: 'test',
    })),
    saveSettings: vi.fn(async () => true),
    context: vi.fn(async () => CONTEXT),
    createBatch: vi.fn(async () => ({ batch_id: '33333333-3333-4333-8333-333333333333', replayed: false })),
    latest: vi.fn(async () => null),
    beginRun: vi.fn(async () => ({ run_id: '44444444-4444-4444-8444-444444444444', started: true })),
    finishRun: vi.fn(async () => true),
    latestRun: vi.fn(async () => null),
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

  it('drops a scenario with no headline left rather than failing the four beside it', () => {
    const out = normalise({ scenarios: [proposal({ headline: '  ' }), proposal()] }, CONTEXT);
    expect(out).toHaveLength(1);
  });

  it('pulls a strength outside the vocabulary back into it', () => {
    const out = normalise({ scenarios: [proposal({ strength: 7 }), proposal({ strength: 0 })] }, CONTEXT);
    expect(out.map((scenario) => scenario.strength)).toEqual([3, 1]);
  });

  it('never stores more than five', () => {
    const out = normalise({ scenarios: Array.from({ length: 5 }, () => proposal()) }, CONTEXT);
    expect(out).toHaveLength(5);
  });
});

describe('AiNewsService.begin', () => {
  const settled = async (repository: AiNewsRepository): Promise<void> => {
    await vi.waitFor(() => expect(repository.finishRun as ReturnType<typeof vi.fn>).toHaveBeenCalled());
  };

  it('refuses before opening a run when no key is stored', async () => {
    const repository = fakeRepository({
      credential: vi.fn(async () => ({ api_base_url: 'x', model: 'm', api_key_sealed: null, api_key_key_id: null })),
    } as Partial<AiNewsRepository>);
    const caller = vi.fn();
    const service = new AiNewsService(repository, SEALING, caller);
    await expect(service.begin({ actorUserId: ACTOR })).rejects.toMatchObject({ code: 'ai_news_key_missing' });
    expect(repository.beginRun).not.toHaveBeenCalled();
    expect(caller).not.toHaveBeenCalled();
  });

  it('refuses when the stored key was sealed under a key this deployment does not hold', async () => {
    const service = new AiNewsService(fakeRepository(), { keyId: 'other', key: Buffer.alloc(32, 1) }, vi.fn());
    await expect(service.begin({ actorUserId: ACTOR })).rejects.toMatchObject({ code: 'ai_news_sealing_unavailable' });
  });

  it('answers with the run and calls the model after, so no gateway is waiting on it', async () => {
    const calls: ModelCall[] = [];
    const caller = async (call: ModelCall): Promise<ScenarioBatch> => {
      calls.push(call);
      return { scenarios: [proposal(), proposal({ stock_symbol: null, direction: 'down' })] };
    };
    const repository = fakeRepository();
    const service = new AiNewsService(repository, SEALING, caller);

    await service.begin({ actorUserId: ACTOR, prompt: '  조용한 하루  ', idempotencyKey: '22222222-2222-4222-8222-222222222222' });
    expect(repository.beginRun).toHaveBeenCalledWith({
      idempotencyKey: '22222222-2222-4222-8222-222222222222',
      actorUserId: ACTOR,
      prompt: '조용한 하루',
    });
    await settled(repository);

    expect(calls[0]).toMatchObject({ apiBaseUrl: 'https://api.example', apiKey: 'sk-test-key-1234', model: 'gpt-4o-mini', system: SYSTEM_PROMPT });
    expect(calls[0]?.user).toContain('Operator wish: 조용한 하루');
    const stored = (repository.createBatch as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as {
      prompt: string; model: string; scenarios: ScenarioProposal[]; context: unknown;
    };
    expect(stored.prompt).toBe('조용한 하루');
    expect(stored.model).toBe('gpt-4o-mini');
    expect(stored.context).toEqual(CONTEXT);
    expect(stored.scenarios).toHaveLength(2);
    expect(stored.scenarios[1]?.stock_symbol).toBeNull();
    expect(repository.finishRun).toHaveBeenCalledWith({
      actorUserId: ACTOR,
      runId: '44444444-4444-4444-8444-444444444444',
      batchId: '33333333-3333-4333-8333-333333333333',
    });
  });

  it('writes why a run produced nothing against the run, since nobody is left to throw at', async () => {
    const caller = async (): Promise<ScenarioBatch> => {
      throw new AiNewsUnavailableError('ai_news_model_refused', 'declined');
    };
    const repository = fakeRepository();
    const service = new AiNewsService(repository, SEALING, caller);
    await service.begin({ actorUserId: ACTOR });
    await settled(repository);

    expect(repository.createBatch).not.toHaveBeenCalled();
    expect((repository.finishRun as ReturnType<typeof vi.fn>).mock.calls[0]?.[0]).toMatchObject({
      failureCode: 'ai_news_model_refused',
      failureDetail: 'declined',
    });
  });

  it('asks the model once while a run is already open', async () => {
    const repository = fakeRepository({
      beginRun: vi.fn(async () => ({ run_id: '44444444-4444-4444-8444-444444444444', started: false })),
    } as Partial<AiNewsRepository>);
    const caller = vi.fn();
    const service = new AiNewsService(repository, SEALING, caller);
    await service.begin({ actorUserId: ACTOR });
    expect(caller).not.toHaveBeenCalled();
    expect(repository.latestRun).toHaveBeenCalledWith(ACTOR);
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

// ---------------------------------------------------------------------------
// The OpenAI standard, against a stubbed server
// ---------------------------------------------------------------------------

const CALL = {
  apiBaseUrl: 'https://api.example/v1',
  apiKey: 'sk-test-key-1234',
  model: 'gpt-4o-mini',
  system: 'the brief',
  user: 'the market',
};

const BATCH = {
  scenarios: [
    { stock_symbol: 'MYUY', direction: 'up', strength: 2, hours: 6, headline: '뮤야얌 전자, 신제품 발표', body: '기대가 높다.', rationale: '지난 소식을 잇는다.' },
  ],
};

function completion(content: string): Response {
  return new Response(JSON.stringify({ choices: [{ message: { content } }] }), { status: 200 });
}

/** Answers each attempt in turn, so a test can say what the server does not know. */
function server(...answers: readonly Response[]): ReturnType<typeof vi.fn> {
  let turn = 0;
  return vi.fn(async () => answers[Math.min(turn++, answers.length - 1)] as Response);
}

function bodyOf(fetcher: ReturnType<typeof vi.fn>, turn: number): Record<string, unknown> {
  const init = fetcher.mock.calls[turn]?.[1] as { body?: string } | undefined;
  return JSON.parse(init?.body ?? '{}') as Record<string, unknown>;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('endpoint', () => {
  it('hangs both paths off the address, however the operator wrote it', () => {
    expect(endpoint('https://api.example/v1', 'chat/completions')).toBe('https://api.example/v1/chat/completions');
    expect(endpoint('https://api.example/v1/', 'models')).toBe('https://api.example/v1/models');
    expect(endpoint('https://api.example/v1/chat/completions', 'models')).toBe('https://api.example/v1/models');
  });
});

describe('openAiCaller', () => {
  it('posts to {base}/chat/completions with the model, the two turns and a strict schema', async () => {
    const fetcher = server(completion(JSON.stringify(BATCH)));
    vi.stubGlobal('fetch', fetcher);

    const batch = await openAiCaller(CALL);

    expect(batch.scenarios).toHaveLength(1);
    expect(fetcher.mock.calls[0]?.[0]).toBe('https://api.example/v1/chat/completions');
    const init = fetcher.mock.calls[0]?.[1] as { method: string; headers: Record<string, string> };
    expect(init.method).toBe('POST');
    expect(init.headers.authorization).toBe('Bearer sk-test-key-1234');
    const body = bodyOf(fetcher, 0);
    expect(body.model).toBe('gpt-4o-mini');
    expect(body.messages).toEqual([
      { role: 'system', content: 'the brief' },
      { role: 'user', content: 'the market' },
    ]);
    expect(body.response_format).toMatchObject({ type: 'json_schema' });
  });

  it('asks for less when the server does not know an option, rather than giving up', async () => {
    const fetcher = server(
      new Response('{"error":{"message":"response_format json_schema is not supported"}}', { status: 400 }),
      new Response('{"error":{"message":"Unsupported parameter: max_tokens"}}', { status: 400 }),
      completion(JSON.stringify(BATCH)),
    );
    vi.stubGlobal('fetch', fetcher);

    await expect(openAiCaller(CALL)).resolves.toMatchObject({ scenarios: [{ headline: '뮤야얌 전자, 신제품 발표' }] });
    expect(fetcher).toHaveBeenCalledTimes(3);
    expect(bodyOf(fetcher, 1).response_format).toEqual({ type: 'json_object' });
    expect(bodyOf(fetcher, 2)).not.toHaveProperty('response_format');
    expect(bodyOf(fetcher, 2)).not.toHaveProperty('max_tokens');
  });

  it('reads an answer a server wrapped in a code fence', async () => {
    vi.stubGlobal('fetch', server(completion(`Here you go:\n\`\`\`json\n${JSON.stringify(BATCH)}\n\`\`\``)));
    await expect(openAiCaller(CALL)).resolves.toMatchObject({ scenarios: [{ direction: 'up' }] });
  });

  it('reads a bare array as the batch it plainly is', async () => {
    vi.stubGlobal('fetch', server(completion(JSON.stringify(BATCH.scenarios))));
    await expect(openAiCaller(CALL)).resolves.toMatchObject({ scenarios: [{ strength: 2 }] });
  });

  it('says the key was refused when the API answers 401', async () => {
    vi.stubGlobal('fetch', server(new Response('no', { status: 401 })));
    await expect(openAiCaller(CALL)).rejects.toMatchObject({ code: 'ai_news_model_rejected_key' });
  });

  it('says the API could not be reached when it answers 500 or not at all', async () => {
    vi.stubGlobal('fetch', server(new Response('boom', { status: 500 })));
    await expect(openAiCaller(CALL)).rejects.toMatchObject({ code: 'ai_news_model_unreachable' });

    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('fetch failed'); }));
    await expect(openAiCaller(CALL)).rejects.toMatchObject({ code: 'ai_news_model_unreachable' });
  });

  it('never carries the key back into the sentence the console shows', async () => {
    vi.stubGlobal('fetch', server(new Response(`bad key sk-test-key-1234 rejected`, { status: 400 })));
    const error = await openAiCaller(CALL).catch((reason: unknown) => reason);
    expect(String((error as Error).message)).not.toContain('sk-test-key-1234');
  });

  it('lets a refusal through as a refusal', async () => {
    vi.stubGlobal('fetch', server(
      new Response(JSON.stringify({ choices: [{ message: { refusal: 'I cannot' } }] }), { status: 200 }),
    ));
    await expect(openAiCaller(CALL)).rejects.toMatchObject({ code: 'ai_news_model_refused' });
  });

  it('says the answer could not be read rather than storing nonsense', async () => {
    vi.stubGlobal('fetch', server(completion('오늘은 소식이 없습니다.')));
    await expect(openAiCaller(CALL)).rejects.toMatchObject({ code: 'ai_news_model_unusable' });
  });
});

describe('openAiLister', () => {
  it('reads {base}/models with the key, without repeats and in order', async () => {
    const fetcher = server(new Response(JSON.stringify({ data: [{ id: 'gpt-4o' }, { id: 'gpt-4o-mini' }, { id: 'gpt-4o' }] }), { status: 200 }));
    vi.stubGlobal('fetch', fetcher);

    await expect(openAiLister({ apiBaseUrl: 'https://api.example/v1', apiKey: 'sk-test-key-1234' }))
      .resolves.toEqual(['gpt-4o', 'gpt-4o-mini']);
    expect(fetcher.mock.calls[0]?.[0]).toBe('https://api.example/v1/models');
    expect((fetcher.mock.calls[0]?.[1] as { method: string }).method).toBe('GET');
  });

  it('says so when the address will not list its models', async () => {
    vi.stubGlobal('fetch', server(new Response('not found', { status: 404 })));
    await expect(openAiLister({ apiBaseUrl: 'https://api.example/v1', apiKey: 'k' }))
      .rejects.toMatchObject({ code: 'ai_news_model_unusable' });
  });
});

describe('AiNewsService.models', () => {
  it('offers what the key can reach', async () => {
    const service = new AiNewsService(fakeRepository(), SEALING, vi.fn(), async () => ['gpt-4o', 'gpt-4o-mini']);
    await expect(service.models(ACTOR)).resolves.toEqual({ models: ['gpt-4o', 'gpt-4o-mini'], problem: null });
  });

  it('returns an empty list and why, so the field stays a field', async () => {
    const repository = fakeRepository({
      credential: vi.fn(async () => ({ api_base_url: 'x', model: 'm', api_key_sealed: null, api_key_key_id: null })),
    } as Partial<AiNewsRepository>);
    const service = new AiNewsService(repository, SEALING, vi.fn(), vi.fn());
    await expect(service.models(ACTOR)).resolves.toEqual({ models: [], problem: 'ai_news_key_missing' });

    const unreachable = new AiNewsService(fakeRepository(), SEALING, vi.fn(), async () => {
      throw new AiNewsUnavailableError('ai_news_model_unreachable', 'nope');
    });
    await expect(unreachable.models(ACTOR)).resolves.toEqual({ models: [], problem: 'ai_news_model_unreachable' });
  });
});
