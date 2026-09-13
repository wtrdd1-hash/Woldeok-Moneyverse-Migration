# Banking + Migration Parity — v2026.09.13.19

## 런타임
- 최신 `main` `6ad8304ac743366ae8b9bc445934160b0eaecdee` 위에 Banking Safety Overview를 다시 통합했습니다.
- `/bank`를 virtual/simulated/game-only 금융 학습 화면으로 명확히 표시하고 권위 있는 banking standing 기반 상환 안내를 추가했습니다.
- WLD BigInt/정수 문자열 정밀도를 유지하며 원장·잔액·금리·대출 정책·채권·API 동작은 변경하지 않습니다.

## Migration parity 수정
- 먼저 추가된 `163-merge-forked-member-accounts.sql`은 163을 유지합니다.
- 나중 추가된 local-email migration은 SQL 본문을 바꾸지 않고 `179-local-email-auth.sql`로 이동합니다.
- 운영 checksum manifest는 이 migration들 이전에서 끝나므로 운영 적용 migration을 이름 변경하거나 수정하지 않습니다.

## 배포 게이트
정확한 head SHA에서 CI가 통과한 뒤 동일 immutable SHA를 isolated `wdmv-test`에서 검증해야 합니다. exact-SHA 런타임·migration·API/UI·로그·롤백 증거 없이는 Production으로 승격하지 않습니다.
