# 긴급 전수 QA 및 관리자 runtime 결함 — v2026.09.22.335

날짜: 2026-09-22
기준 기획 브랜치: `docs/qa-defect-tracking-v2026.09.22.334`
현재 main: `55cea0ba49fa53e17c924cc54bff5689e2bad172`
분류: QA/기획 증거 전용, 이번 회차 배포 없음

## 재현 결함
- Production split release: frontend는 `prod-cd29db4-v336`, backend는 `prod-5cc3641-v328`에서 실행 중이고 `production-current`는 v336을 가리킨다.
- Production backend `/api/version`은 `7298bb92d44bd1122cea0929b1d2eb4afbb1a258`을 보고한다.
- Test backend도 같은 구버전을 보고하고 Test process는 `test-5cc3641-v328`에서 실행한다. 현재 main보다 74 commits 뒤다.
- Test public smoke에서 `/`만 200이고 핵심 public route 12개가 500이다.
- Test 관리자 smoke에서 표본 admin route 10개가 모두 500이며 Production 동일 경로는 비인증 HTTP smoke에서 200이다.
- 따라서 최신 관리자 보안 수정 v329/v331/v332/v333이 실행 backend에 활성화됐다는 증거가 없다.
- frontend admin surface는 20 page route, 직접 admin test file은 9개이므로 인증된 route-by-route Test 증거를 필수화한다.

## 기존 자동화 증거
- PR #653 exact head `a0ff5dc2cfc3a30c7810e714018a8e13b2b2fb7f`의 CI runtime-check는 PostgreSQL service, migrations, lint, typecheck, build, full tests, production dependency audit를 통과했다.
- 그러나 현재 Test/Production backend가 다른 구버전을 실행하므로 이 CI 성공만으로 runtime 결함은 종료되지 않는다.

## 릴리스 판단
긴급 수정요망. Test 정상화와 frontend/backend exact-SHA lineage 일치가 끝날 때까지 Production 승격을 차단한다.
