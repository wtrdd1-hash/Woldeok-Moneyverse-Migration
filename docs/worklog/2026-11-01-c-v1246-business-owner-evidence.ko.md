# 개발 C v1246 — 회원 사업체 원본 근거

## 시작 — 2026-11-01 04:50 KST
- 기준 main `f13bbce273ffc65e8576170992d82ea00c27a1c9`; 독립 브랜치 사용. Debian 13.6 미니PC 주요 서비스 7개와 개발 PostgreSQL 연결 확인.
- AGENTS, 영문/국문 README와 통합기획서, 활성 PR/CI 및 A/B/QA 확인. 사업체 소유권 조회 실패를 빈 사업체로 오인하고, 잘못된 금액에서 BigInt 예외가 발생하며, 소유권/자기자본 확인 없이 구매 UI를 노출하는 P1 결함 확인.
- 기존 회원별 PostgreSQL 보안 함수와 Nest API를 재사용하고, 잘못된 데이터는 표시하지 않으며 구매를 보수적으로 차단. 데이터베이스/금융 원장 변경 없음.

## 진행
- [x] RED 실패 4건, 보관함 계약 RED 1건, 날짜 호환 RED 1건 재현.
- [x] 회원 사업체·카탈로그·자기자본·해금·실제 보관함 조회 파서 구현. 미확인 소유권은 빈 목록으로 처리하지 않고 구매/설립을 제한. 44px 재조회, 스크린리더 경고, 비색인 메타데이터 적용. 집중 9건·ESLint·Frontend Typecheck 통과.
- [x] 전체 검증·격리 PostgreSQL·HTTP·릴리스 차단 근거 기록.

## 중간 — 2026-11-01 04:55 KST
- origin/main 재조회 동일 SHA. 잘못된 기존 `/shop/inventory` 호출을 실제 Nest `/shop/holdings` 및 `catalog_id` 계약으로 수정. 기존 PostgreSQL 보안 함수 재사용, 원장·스키마 무변경.
- 전체 검증과 공식 Test 미완료, 릴리스 보류.

## 종료 — 2026-11-01 05:04 KST (소스 SHA `8f1076454de6986e717329c04697c08827213886`)
- RED 4건·보관함 계약 RED 1건·날짜 호환 RED 1건 재현 후 집중 9 PASS. 실제 회원별 Nest 사업체/자기자본/보관함 API를 사용하며 오류와 빈 보유를 구분, 미확인 구매 차단.
- 전체 Lint PASS(오류 0, 기존 경고 1,022), Typecheck PASS, Build PASS, Frontend 2,910 PASS, Backend 2,950 PASS/517 SKIP, Contract 41 PASS, DB 패키지 62 PASS/4 SKIP, app-api 184개 PASS.
- 격리 PostgreSQL 17.11에서 마이그레이션 316개 PASS. 앱 계정의 사업체·자기자본·보관함 읽기 함수 실행 가능, 원본 소유권 테이블 직접 SELECT 및 원장 INSERT 불가. 실제 읽기 실행 확인, 원장 거래 0건, 전용 컨테이너 제거.
- 운영 의존성 High 이상 취약점 0, 전체 감사 9건(낮음 1/보통 8) FAIL. 경로 166개 인벤토리 생성, 전체 QA 실행 증빙 파일 부재로 FAIL. 독립 Next `/businesses` HTTP 200이나 Backend 미연결 오류로 인증 E2E 아님. 실제 X-Robots-Tag `index, follow`로 비색인 FAIL(별도 Draft #2225).
- main 및 영문·국문 통합기획서 시작/중간/종료 동일. 공식 exact-SHA Test 인증 E2E·독립 복원 BLOCKED. main 병합·공식 Test·Production·GitOps·원장·DB 변경 없음. A/B/QA/Gemini·핵심 예약 보존. PARTIAL / RELEASE BLOCKED.
- 문서 최종 커밋 후 HEAD SHA가 바뀌므로 최종 SHA 검증과 원격 CI 결과는 PR에 별도 기록.
