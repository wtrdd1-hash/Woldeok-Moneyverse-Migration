# API 보안 강화 작업 기록 — v2026.10.01.503

**영문 정본** | 이 문서는 한국어 동반 문서입니다.

## 시작 기록
- Debian 13 기본 체크아웃을 갱신한 뒤 `origin/main` `2bad12eb`에서 시작했습니다.
- 격리 브랜치: `security/api-hardening-v2026.10.01.503`.
- AGENTS, PROJECT_MEMORY, 통합 기획, 보안 마스터/보증 계획, API 카탈로그, 릴리스 지침을 다시 확인했습니다.
- 초기 발견: 백엔드 CORS가 localhost를 항상 허용하고 브라우저 요청 헤더로 `CF-Connecting-IP`를 허용하여 브라우저 경계와 신뢰 엣지 경계가 섞여 있습니다.
- 범위: API 방어 경계 강화. 경제 의미나 DB 권한은 완화하지 않습니다.

## 게이트
- 운영 코드 변경 전에 TDD 회귀 테스트를 작성합니다.
- 작업 중간에 `origin/main`과 최신 기획서를 다시 확인합니다.
- lint/typecheck/test/build 및 적용 가능한 보안·비밀정보 검사를 수행합니다.
- 운영 승격 전 동일 후보를 격리 Test에 배포하고 백엔드/공개 스모크를 확인합니다.

## 중간 기록
- `origin/main`을 다시 가져왔으며 `2bad12eb`로 동일하여 해당 시점에는 메인 재조정이 필요하지 않았습니다.
- 통합/보안 권한 문서를 다시 읽었고 exact-SHA Test 및 운영 보안 게이트가 계속 적용됨을 확인했습니다.
- TDD RED: 정책 모듈이 없어 `cors-policy.test.ts` 실패를 확인했습니다.
- GREEN: 구현 후 신규 CORS 테스트 3/3 통과를 확인했습니다.

## 검증 기록
- API 보안 집중 회귀: CORS, rate limit, 보안 헤더, 인증 guard 합계 61/61 통과.
- 루트 `pnpm typecheck`: 계약 패키지 선행 빌드 포함 통과.
- 변경 파일 ESLint: 통과.
- 백엔드 build: 통과.
- 저장소 전체 lint: 이번 변경과 무관한 기존 treasury/lobby 오류로 차단.
- 문서에 명시된 `scripts/check-secrets.sh`: 현재 main에 없어 통과 주장하지 않음.
- 전체 백엔드 Vitest는 진행했으나 장시간 종료되지 않아 중단했으며 전체 통과 주장하지 않음.

## CI 보안 게이트 발견 및 준비된 개선안
- PR CI에서 삭제된 셸 스캐너/헬퍼를 계속 호출하는 오래된 security policy job을 확인했습니다. 실제 스캔 전에 실패합니다.
- 비셸 대체 스캐너 `scripts/security/check-repository-security.mjs`와 Node 테스트를 추가했습니다. 실제 .env/런타임 데이터 및 private key/GitHub/cloud/Slack/JWT/credential URL 고신뢰 패턴을 차단합니다.
- 로컬 스캐너 검증은 통과했지만 연결된 Git 자격증명에 GitHub `workflow` scope가 없어 `.github/workflows/ci.yml` 연결 변경 push가 차단됐습니다.
- 따라서 CI policy job은 릴리스 차단 상태이며 이 브랜치에서 Test/운영 승격을 승인하지 않습니다.
