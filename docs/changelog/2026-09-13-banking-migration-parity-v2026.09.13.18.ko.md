# Banking + Migration Parity — v2026.09.13.18

## 런타임
- 최신 `main` 위에 Banking Safety Overview를 다시 통합했습니다.
- `/bank`가 실제 금융상품이 아닌 virtual/simulated/game-only 기능임을 명확히 표시합니다.
- 서버의 banking standing을 사용한 상환 중심 안내를 추가하며 잔액·금리·대출 정책·채권·API·원장 동작은 변경하지 않습니다.

## Migration parity blocker 수정
현재 `main`에는 신규 migration 번호 `163`이 두 개 존재하고 `179`가 없어 연속 번호 검사가 실패했습니다. 저장소의 권위 production checksum manifest는 `046`에서 끝나므로 두 `163` 파일 모두 해당 운영 적용 baseline 이후에 추가된 신규 migration임을 확인했습니다. 또한 `163-merge-forked-member-accounts.sql`은 2026-09-06, `163-local-email-auth.sql`은 더 늦은 2026-09-12에 추가됐습니다.

따라서 더 늦게 추가된 local-email migration을 SQL 내용 변경 없이 `179-local-email-auth.sql`로 이동했습니다. 먼저 추가된 account-merge migration은 `163`을 유지합니다. production checksum manifest에 기록된 운영 적용 migration은 이름이나 내용을 변경하지 않았습니다.

## 배포 정책
정확한 최종 SHA에서 전체 CI를 통과한 뒤 같은 SHA의 immutable Test 이미지를 만들고 isolated `wdmv-test`에서 실제 실행을 확인해야 합니다. 이 게이트 전까지 main/Production 승격은 하지 않으며 Production은 변경하지 않습니다.
