# AI 뉴스 QA 응답 계약 — v2026.09.24.423

- 시작 main: `2adc600f6ff666cefa0a3ebb3a37b555c8065fe9`.
- 범위: `scripts/qa-live-ai-news.ts` CI/release 차단 오류이며 DB·migration·ledger·auth·권한은 변경하지 않았다.
- 검증되지 않은 `any` 응답 캐스트를 제한된 chat-completion 응답 계약으로 교체했다.
- JSON 응답이 객체가 아니거나 Ollama message content가 비어 있으면 파싱 전에 fail-closed 처리한다.
- 저장소 전체 lint는 오류 0개이며 남은 warning은 비차단 항목이다.
- frozen-lockfile 의존성 설치 후 backend typecheck와 `git diff --check`가 통과했다.
