# QA — 개발 A 승인 갤러리 사진 설명 정렬 (2026-11-03)

**판정: 구현 / 대상 테스트 PASS / Backend 전체 FAIL / 전체 보안 감사 FAIL / 공식 Test BLOCKED / 배포 HOLD.**

- 기준 main `f5c3fbedae1c3b3ec2374882b049aac43a655eb4`; 격리 브랜치 `auto/hourly-a-20261103-0225-gallery-caption-order`. 다른 개발 작업공간 미수정.
- 웹 `/gallery?sort=caption`, Nest `/api/v1/photos?sort=caption`, Android `/app-api/v1/photos?sort=caption` 및 `/app-api/v1/content/photos?sort=caption`. 운영자가 승인한 최근 24장만 UTF-8 바이트 문자순/UUID순 정렬. 기본 최신순 유지. 잘못된 쿼리 400, 검증 불가 Android 성공 응답 503, no-store/noindex. 원장/마이그레이션/직접 테이블 권한 변경 없음.
- RED 초기 Backend 5, Frontend 5; 별칭 1+1 실패 확인. GREEN Backend/HTTP 12, Frontend/SEO/접근성/Android 10 통과. 실제 개발 PostgreSQL 17.11 읽기 전용 함수 2건 통과, photos 직접 SELECT/UPDATE/DELETE 거부.
- 중간 전체 테스트 Backend 2,989 PASS / 2 FAIL / 518 SKIP(기존 프로필 인증 HTTP 401), Frontend 2,954 PASS, DB 72 PASS / 5 SKIP, 계약 41 PASS, 앱 API 184개. 빌드/타입검사 통과, 전체 ESLint 오류 0/기존 경고 1,027. 운영 의존성 취약점 0, 전체 9건 FAIL. 별칭 수정 이후 최종 SHA 재검증 별도 기록 예정.
- 기존 P0 개발 DB `account_balances` UPDATE 및 `user_items` DELETE 허용, 운영 DB 권한 미확인. 디스크 97% 사용. 공식 Test `0c70a114...`, Production `305d7c7f...` 후보 SHA 불일치, 인증 E2E/독립 복원/GitOps BLOCKED.
- 비-main 브랜치 310개(미통합 292/병합 18), 열린 PR 279개, 충돌 29개. 기존 갤러리 PR #2371/#2331/#2438 파일 중첩. 강제 병합/삭제 없음.
- 증거: `/srv/moneyverse-data/tasks/mv-a-20261103-0225-gallery-caption-order/evidence/`. 최종 SHA 및 CI는 작업일지에 별도 기록.
