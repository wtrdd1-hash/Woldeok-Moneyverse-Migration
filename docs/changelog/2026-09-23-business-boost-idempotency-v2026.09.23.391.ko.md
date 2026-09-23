# v2026.09.23.391 — 사업 부스트 멱등성

개발 B / P1 경제 무결성.

- 인벤토리를 소비하는 사업 부스트 적용 시 호출자가 소유한 UUID 멱등성 키를 필수로 요구합니다.
- 불변 migration에 비공개 command receipt 테이블과 payload-bound replay 규칙을 추가했습니다.
- 동일 키 요청은 인벤토리 소비 전에 직렬화하고 정확한 재시도에는 저장된 결과를 반환합니다.
- 같은 키를 다른 actor, ownership 또는 boost code에 재사용하면 거부합니다.
- 기존 3-인자 DB 함수는 `PUBLIC`과 `moneyverse_app`에서 실행 권한을 회수하고, 앱 역할에는 4-인자 멱등 함수만 허용합니다.
- 기존 ownership/inventory lock, 부스트 계산, ledger 동작 및 최소권한 경계는 유지합니다.
