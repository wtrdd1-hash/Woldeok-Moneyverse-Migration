# A 2026-11-01 12:25 KST — 공개 사진 게시일 검색

## 작업 전 — 진행 중
- 기준 main: `f13bbce273ffc65e8576170992d82ea00c27a1c9`, 독립 `auto/hourly-a-20261101-1225-gallery-day` worktree.
- 목적: 기존 공개 승인 사진 최근 24건 안에서 한국시간 게시일로 필터. 전체 과거 사진 검색으로 오인시키지 않음.
- Nest/Next/Android 앱 API/기존 PostgreSQL 읽기 함수 범위, 신규 마이그레이션·금융·권한 변경 없음.
- 타 개발 PR #2249 등 미통합 변경 보존. 모든 검증 전 병합·운영배포 금지.
- 위험: 24건 범위, 자정 경계, 중복 날짜, 미필터 HTTP 200, 잘못된 시간, 장애 시 가짜 빈 결과.
- 테스트 실패 확인→최소 구현→실제 DB 읽기→품질 게이트→초안 PR 순서. Test/Production 불변, 롤백은 브랜치 코드 되돌리기.

## 작업 중 — 테스트 선작성 및 실패 확인
- Nest 서비스·컨트롤러와 Android/갤러리 계약 테스트 먼저 작성. Backend 11 실패/4 통과, 기존 구현은 날짜·중복 쿼리 무시.
- Frontend 날짜 검증 모듈 부재 및 앱 API 검증 누락. 테스트용 내부 토큰 환경변수 보정(실제 비밀정보 미사용). 상세 로그는 작업 폴더에 보존.

## 작업 중 — 구현·검증 중간 기록 (12:38 KST)
- 공개 `/api/v1/photos?day=` 및 Android `/api/v1/content/photos?day=`에서 단일 유효 날짜 검증, 기존 최근 승인 사진 24건 DB 함수 재사용. 신규 SQL/권한/금융 쓰기 없음.
- 웹 날짜 선택·초기화·검색 범위·검증된 빈 결과와 오류 구분·검색결과 noindex. Android는 필터 미적용·비JSON·204 응답을 성공으로 인정하지 않음.
- 대상 테스트 Backend 15/15, Frontend 10/10 PASS, Backend 타입검사 PASS, Android 계약 184개 PASS, 변경 파일 Lint 오류 0(기존 이미지 경고 1). 전체 검증 진행 중.
- 실제 PostgreSQL 17.11 읽기 전용 앱 역할: 공개 승인 사진 2건, 함수 EXECUTE 허용, 사진 원본 테이블 직접 SELECT 불허. 개발 DB의 잔액 UPDATE/보유품 DELETE/사용자 SELECT 권한은 여전히 허용(P0 #993); 운영 DB로 일반화 금지.
- 원격 참조 82개(심볼릭 origin 포함), 열린 PR 79개, 충돌 보고 0, 미통합 고유 브랜치 81개 보존. #2249 동일 갤러리 파일 변경 통합 주의.
- 공식 Test 정확 SHA E2E·독립 복원 미완료, Production HOLD. Test/Production 변경 없음.

## 작업 중 — v2 오류 수정 (12:43 KST)
- 최초 Frontend 전체 빌드는 Next 자동 생성 PageProps 타입 제약 오류로 **FAIL**(webpack 컴파일 성공 후 타입검사 실패). 페이지·메타데이터의 선택적 인자 기본값 제거, 새 SHA 전체 빌드 재검증 필요.
- Android `/app-api/v1/photos?day=` 별칭이 `/content/photos` 검증을 우회하는 문제를 RED(503 예상, 실제 200)로 재현 후 공통 경로 판별로 수정. 대상 Frontend 11/11 PASS. 동시 작업에 따른 `pthread_create` 경고는 게이트 성공 근거로 사용하지 않음.
- Test/Production 변경 없음. 기존 빌드 실패 기록 보존, Backend 전체 테스트 진행 중, 공식 Test 정확 SHA BLOCKED.
