# 개발 A — 본인 지갑 기록 입출금 방향 필터 (2026-10-30 05:03 KST)

**상태:** P1 대상 기능 구현·검증 완료, 전체 릴리스 게이트 **실패 / HOLD**. main 병합, Test 승격, Production 배포, 운영 DB 변경, 브랜치 삭제 없음.

## 기준 및 분리 작업

- 시작·중간 main `62c6cd038951d65c94b709302bdaec6e75b080b6`. AGENTS.md, README.md, 영문 원본·국문 프로젝트/통합기획서, QA, 열린 PR 확인.
- 분리 브랜치 `auto/hourly-a-wallet-direction-20261030-0503`. 시작 원격 브랜치 31개(main 포함), 열린 PR 25개. B 인증/세션, C 시장/알림, QA #1940, 지갑 북마크 기획 #1937과 중복 수정하지 않음.

## 실제 사용자 기능

- `/wallet/activity`에서 **전체·입금·출금·순변동 없음** 선택. 전체/7일/30일 기간을 유지하고, 50건 단위 이전 기록까지 DB에서 필터링. 방향 변경 시 기존 커서 초기화.
- Nest API는 잘못된 값·중복 파라미터를 HTTP 400으로 거절. HMAC 커서는 사용자·세션·기간·방향을 묶어 다른 조건에서 재사용 불가. 기존 전체 방향 커서 호환 유지.
- PostgreSQL에서 본인 현금·은행 원장만 집계하고 `LIMIT 51`보다 앞선 `HAVING`으로 부호별 필터링. 금액은 정수 문자열 그대로, 현금↔은행 내부 이동은 합계 0인 '순변동 없음'. 마이그레이션/권한/원장/멱등성 변경 없음.
- Android app-api는 동일 쿼리 전달, `private, no-store`·`noindex` 강제. 웹은 로그인 필수, 색인 금지, 접근 가능한 필터 내비게이션 제공.

## QA 결과

- RED → GREEN: Backend 신규 3건 실패, Frontend/Android 신규 2건 실패를 재현 후 각각 Backend 8 PASS, Frontend 6 PASS.
- Nest HTTP 계약 4 PASS, 웹 렌더링·접근성 2 PASS, Android/SEO/라우팅 대상 53 PASS.
- 독립 PostgreSQL 17.11에서 **304/304 마이그레이션 적용**. 합성 본인 70건+타인 1건, 입금 24·출금 23·순변동 없음 23, 타인 기록 0건 노출, 정수 문자열 `9007199254740993`, 51+20 커서 페이지, 합성 거래 불균형 0, 앱 역할 원장 직접 INSERT/UPDATE 불가. 실제 PG 테스트 1 PASS. 운영 금융 원장의 검증 결과가 아님.
- 전체 Typecheck PASS, 로컬 Build PASS, 운영 의존성 취약점 0건, DB 단위 56 PASS/4 SKIP, 변경 코드 Lint 오류 0건.
- **전체 실패:** Lint 기존 오류 3건/경고 1053건, Backend 2615 PASS/240 FAIL/457 SKIP, Frontend 전체 90초 제한 초과, `pnpm test`·모바일 API 계약 검사 기존 NPC affinity 생성문서 불일치(별도 QA #1927). 생성문서 변경은 본 PR에서 제외.
- 공식 Test 정확 SHA 인증 E2E, 독립 백업 복원, 금융 원장·국고 출처 및 GitOps 운영 게이트 **BLOCKED**.

## Release / Rollback

- 전체 CI·공식 Test·금융 및 백업 증거 통과 전 **main 병합과 운영 배포 금지**. 운영 DB/서비스 미변경. 미병합 브랜치 보존이 현재 롤백이며, 추후 승인 배포 시 앱 코드 되돌리기만 필요(스키마 변경 없음).
- 브랜치 삭제 없음, 모든 기존 고유 커밋 보호. 증거: `/srv/moneyverse-data/reports/Moneyverse-A-2026-10-30-0503-wallet-direction/`.
