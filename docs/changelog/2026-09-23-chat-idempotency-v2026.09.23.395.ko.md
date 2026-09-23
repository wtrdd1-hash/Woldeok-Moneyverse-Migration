# v2026.09.23.395 — 채팅 메시지 멱등성

- `POST /api/v1/chat/conversations/:id/messages`가 호출자 소유 UUID `idempotencyKey`를 필수로 요구합니다.
- 서버 UUID 자동생성을 제거하여 타임아웃 재시도가 별도 메시지 명령으로 처리되는 경로를 차단했습니다.
- 기존 웹 채팅은 메시지 전송마다 이미 UUID를 보내므로 정상 사용자 흐름은 유지됩니다.
- 키 누락, 잘못된 UUID, 정상 UUID에 대한 DTO 계약 회귀 테스트를 추가했습니다.
- DB 스키마, migration, 권한, ledger 동작은 변경하지 않았습니다.
