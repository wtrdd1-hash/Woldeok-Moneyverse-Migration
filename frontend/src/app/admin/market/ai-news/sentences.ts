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
