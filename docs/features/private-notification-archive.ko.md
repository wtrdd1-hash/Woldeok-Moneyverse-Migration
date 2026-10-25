# 본인 알림 보관 기록 CSV — A0751 후보 (배포 보류)

**운영 서비스에 제공되지 않습니다.** 로그인·동의 회원의 서버 세션 ID로 본인 알림을 조회하는 `GET /api/v1/notifications/archive-snapshot`, 비공개 CSV 경로 `/account/notifications/notifications.csv`, 실제 조회 성공 시에만 표시되는 다운로드 버튼, Android `GET /app-api/v1/notifications/archive-snapshot` 계약을 추가했습니다.

단일 SQL 조회로 최대 101건을 확인하고 100건 이하일 때만 `complete: true`를 반환합니다. 101건 이상이면 일부 기록을 전체인 것처럼 내려받지 않고 HTTP 409로 차단합니다. 금융 보상 증빙이나 영구 보관 원장이 아닙니다. CSV 수식 삽입·제어 문자·잘못된 응답을 차단하고 개인정보 캐시·검색 색인을 방지합니다.

**실제 DB 차단 원인:** 격리 PostgreSQL 17.11의 `wdmv_v761_test_acl`에 마이그레이션 281개가 적용됐으나 `public.in_app_notifications`와 `notification_%` 함수가 없습니다. 기존 main 알림 서비스부터 없는 테이블을 참조하고 있습니다. main은 279번까지이며 280/281은 별도 미병합 변경과 충돌할 수 있어 새 마이그레이션을 만들지 않았습니다. 원본 데이터 경로가 정식으로 구현·검증되기 전에는 병합·운영 승격할 수 없습니다.
