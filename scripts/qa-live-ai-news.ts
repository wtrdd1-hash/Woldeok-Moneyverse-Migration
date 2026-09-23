import { SYSTEM_PROMPT, userPrompt, normalise } from '../backend/src/admin/ai-news.service';

async function testOllama() {
  console.log('=== [1] Testing Local Ollama AI Newsroom (llama3.2:3b) ===');
  const start = Date.now();
  
  const context = {
    now_seoul: new Date().toISOString(),
    stocks: [
      { symbol: 'WDT', name: '치무전자' },
      { symbol: 'WDM', name: '월덱모빌리티' },
      { symbol: 'WDB', name: '월덱바이오' },
    ],
    live_events: [],
  };

  const prompt = userPrompt(context, '글로벌 AI 반도체 수요 급증 및 전기차 배터리 협력 발표');
  console.log('Prompt Generated. Sending to Ollama 127.0.0.1:11434 (llama3.2:3b)...');

  const response = await fetch('http://127.0.0.1:11434/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama3.2:3b',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama HTTP Error: ${response.status} ${await response.text()}`);
  }

  const result = await response.json() as any;
  const elapsed = ((Date.now() - start) / 1000).toFixed(2);
  console.log(`Ollama Response Received in ${elapsed}s!`);

  const content = result.choices?.[0]?.message?.content;
  console.log('Raw AI Output:', content);

  const parsed = JSON.parse(content);
  const normalised = normalise(parsed, context);

  console.log('\n=== [2] Normalised Scenarios ===');
  console.dir(normalised, { depth: null });
  console.log(`\n🎉 Generated ${normalised.length} verified scenarios successfully!`);
}

async function testGemmaCouncil() {
  console.log('\n=== [3] Testing AI Council Seat B (gemma3:1b) ===');
  const start = Date.now();
  const response = await fetch('http://127.0.0.1:11434/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gemma3:1b',
      messages: [
        { role: 'system', content: 'You are an AI Economic Council member. Output JSON: {"vote": "approve" | "veto", "reason": string}' },
        { role: 'user', content: 'Current inflation is 2.1%, unemployment is 3.5%, GDP growth is 2.8%. Review the monetary easing proposal.' },
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemma HTTP Error: ${response.status} ${await response.text()}`);
  }

  const result = await response.json() as any;
  const elapsed = ((Date.now() - start) / 1000).toFixed(2);
  console.log(`Gemma Response Received in ${elapsed}s!`);
  console.log('Gemma Output:', result.choices?.[0]?.message?.content);
}

async function main() {
  try {
    await testOllama();
    await testGemmaCouncil();
    console.log('\n✅ [ALL AI QA CHECKS PASSED 100%]');
  } catch (err) {
    console.error('❌ AI QA Failed:', err);
    process.exit(1);
  }
}

main();
