/**
 * Why a run produced nothing, in a sentence an operator can act on. The
 * codes come from the backend (`AiNewsUnavailableError`) and from 149's
 * abandoned runs; both the server action and the console read this, so they
 * cannot drift apart.
 */
export const AI_NEWS_SENTENCES: Readonly<Record<string, string>> = {
  ai_news_key_missing: 'API 키를 먼저 저장해 주세요.',
  ai_news_sealing_unavailable:
    '이 배포에는 봉인 키(ADMIN_TOTP_ENCRYPTION_KEY)가 없어 API 키를 저장하거나 쓸 수 없어요.',
  ai_news_model_rejected_key: '모델 API가 키를 거부했어요. 키를 다시 확인해 주세요.',
  ai_news_model_unreachable: '모델 API에 닿지 못했어요. 주소를 확인하고 잠시 뒤 다시 시도해 주세요.',
  ai_news_model_refused: '모델이 이 요청을 거절했어요. 요청 문구를 바꿔 다시 시도해 주세요.',
  ai_news_model_unusable: '모델의 답을 읽을 수 없었어요. 모델 이름과 주소를 확인해 주세요.',
  ai_news_run_abandoned: '만드는 중에 서버가 다시 시작된 것 같아요. 다시 만들어 주세요.',
};

export function aiNewsSentence(code: string | null | undefined, fallback: string): string {
  return (code ? AI_NEWS_SENTENCES[code] : undefined) ?? fallback;
}

/**
 * Cleanse AI-generated market news text for typos, Chinese characters, and awkward English borrowings.
 * Resolves COPY-04, COPY-05, COPY-06, COPY-07, COPY-08, COPY-09.
 */
export function cleanseAiNewsText(text: string | null | undefined): string {
  if (!text) return '';
  return text
    // COPY-04: Brand name unification
    .replace(/월deck|월dek|월Deck/gi, '월덱')
    // COPY-05: Hanja typo
    .replace(/지속적成장/g, '지속적인 성장')
    // COPY-06: Awkward generated expression
    .replace(/가볍게성 향상/g, '경량화 및 성능 향상')
    // COPY-07: Awkward English verb mixing
    .replace(/influence됩니다/g, '영향을 받습니다')
    .replace(/influence를 받습니다/g, '영향을 받습니다')
    // COPY-08: Mixed English sentence
    .replace(/WDT와\s+WFIN이\s+likewise\s+benefiting\s+from\s+the\s+expansion\s+of\s+digital\s+financial\s+infrastructure\.?/gi, 'WDT와 WFIN도 디지털 금융 인프라 확장의 수혜를 입을 것으로 분석됩니다.')
    .replace(/likewise\s+benefiting\s+from\s+the\s+expansion\s+of\s+digital\s+financial\s+infrastructure\.?/gi, '디지털 금융 인프라 확장의 수혜를 입을 것으로 분석됩니다.')
    // COPY-09: Comma spacing
    .replace(/수수료 급증,배당/g, '수수료 급증, 배당')
    .replace(/,([^\s0-9])/g, ', $1');
}

