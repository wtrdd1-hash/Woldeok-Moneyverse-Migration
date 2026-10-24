import { afterEach, describe, expect, it, vi } from 'vitest';
import { openAiCaller, openAiLister } from './ai-news.service';

const call = {
  apiBaseUrl: 'https://1.1.1.1/v1',
  apiKey: 'test-key',
  model: 'test-model',
  system: 'system',
  user: 'user',
};

const scenario = {
  stock_symbol: 'MYUY',
  direction: 'up',
  strength: 2,
  hours: 6,
  headline: 'Verified headline',
  body: 'Verified body',
  rationale: 'Verified rationale',
};

function mockJsonResponse(data: unknown): void {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(data), { status: 200 })));
}

afterEach(() => vi.unstubAllGlobals());

describe('untrusted model response collection bounds', () => {
  it('rejects oversized scenario batches rather than parsing all proposals', async () => {
    mockJsonResponse({
      choices: [{ message: { content: JSON.stringify({ scenarios: Array.from({ length: 9 }, () => scenario) }) } }],
    });
    await expect(openAiCaller(call)).rejects.toMatchObject({ code: 'ai_news_model_unusable' });
  });

  it('rejects oversized completion choice arrays before processing the first result', async () => {
    mockJsonResponse({
      choices: Array.from({ length: 9 }, () => ({ message: { content: JSON.stringify({ scenarios: [scenario] }) } })),
    });
    await expect(openAiCaller(call)).rejects.toMatchObject({ code: 'ai_news_model_unusable' });
  });

  it('rejects excessive multipart model content before joining text', async () => {
    mockJsonResponse({
      choices: [{
        message: {
          content: [
            { text: JSON.stringify({ scenarios: [scenario] }) },
            ...Array.from({ length: 16 }, () => ({ text: '' })),
          ],
        },
      }],
    });
    await expect(openAiCaller(call)).rejects.toMatchObject({ code: 'ai_news_model_unusable' });
  });

  it('rejects oversized model inventories rather than enumerating arbitrary entries', async () => {
    mockJsonResponse({ data: Array.from({ length: 513 }, (_, i) => ({ id: `model-${i}` })) });
    await expect(openAiLister(call)).rejects.toMatchObject({ code: 'ai_news_model_unusable' });
  });
});
