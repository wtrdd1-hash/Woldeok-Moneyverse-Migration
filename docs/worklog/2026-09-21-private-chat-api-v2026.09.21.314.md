# Private chat API — v2026.09.21.314

## English canonical
- Added authenticated/CSRF-protected server routes for opening a 1:1 chat, idempotent message send, and monotonic read acknowledgement.
- Actor identity is derived only from the resolved server session; clients cannot choose the sender.
- The API delegates authorization, sequence allocation, replay detection, and read monotonicity to the least-privilege PostgreSQL contracts introduced by migration 219.
- Added repository regression tests for actor binding and idempotency-key forwarding.

## 한국어
- 세션 기반 1:1 채팅 생성, 멱등 메시지 전송, 단조 증가 읽음 확인 API를 추가했습니다.
- 발신자 식별자는 요청 본문이 아니라 서버 세션에서만 결정됩니다.
- 권한·sequence·재시도 판정은 PostgreSQL의 제한된 서버 계약에 위임합니다.
