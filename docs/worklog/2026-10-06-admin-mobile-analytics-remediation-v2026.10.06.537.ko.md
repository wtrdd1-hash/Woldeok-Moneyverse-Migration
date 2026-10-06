# 관리자 모바일 분석 화면 긴급 수정 작업 기록 — v2026.10.06.537

- 날짜: 2026-10-06
- 브랜치: `fix/admin-mobile-analytics-v2026.10.06.537`
- 기준선: `origin/main=30d1eb2b50ec49e57273e699e6db7b54859bb200`
- 시작 근거: 제공된 모바일 스크린샷에서 SEO/분석 관리자 화면의 버튼·탭 겹침/잘림과 사용자용 플로팅 위젯의 관리자 콘텐츠 가림을 확인했다.
- 범위: 경제/DB 권한 경계는 변경하지 않고 좁은 화면 레이아웃 결함을 재현·수정하며 회귀 테스트를 추가한다. 운영 승격 전 격리 Test 검증을 수행한다.
- 동시작업 경계: 최신 `origin/main`에서 분리된 Git worktree를 만들었으며 다른 작업자의 변경을 reset/덮어쓰기 하지 않는다.
- 작업 전 우선 확인 문서: `DOCUMENTATION_POLICY.md`, 통합기획서, 반응형 가이드, 관리자 모바일 강제 요구사항, v530 긴급 UI 재점검, AGENTS/PROJECT_MEMORY.
- 전체 문서 사전점검: 코드 수정 전에 추적 중인 모든 Markdown 문서를 checksum/title 방식으로 열람·목록화하고, 관련 권위 문서는 본문을 상세 확인한다.

## 작업 전 결함 가설

1. SEO 액션 컨트롤이 좁은 폭에서 재배치되지 않아 긴 라벨이 서로 충돌한다.
2. 통합 분석 탭 레일이 모바일에서도 데스크톱 밀도를 유지해 라벨 겹침과 불명확한 가로 스크롤을 만든다.
3. 전역 온보딩/지원 플로팅 런처가 관리자 라우트에도 표시되어 운영 콘텐츠를 가린다.
4. 기존 반응형 테스트가 제공 스크린샷과 같은 긴 라벨+모바일 조합 상태를 직접 검증하지 않는다.

## 실행 계획

1. 전체 문서 인벤토리 스캔과 관련 소스 점검을 끝낸다.
2. 재현 결함에 대한 실패하는 모바일 회귀 테스트를 먼저 추가한다.
3. 최소 범위의 반응형 수정을 구현한다.
4. 중간에 `origin/main`을 다시 가져오고 관련 경로 변경 시 충돌 없이 재조정한다.
5. 타깃 테스트, 전체 프론트 테스트/typecheck/build, 브라우저 반응형 QA를 실행한다.
6. 브랜치를 push하고 정확한 SHA를 격리 Test에서 검증한 뒤 백엔드 상태를 확인한다. 모든 게이트 통과 시에만 프로젝트 무중단 승격 절차로 운영에 올린다.
7. 중간/종료 기록과 내부용·GitHub용 업데이트 내역을 남긴다.

## 중간 작업 기록 — 2026-10-06

- 필수 중간 fetch 결과 `origin/main`은 여전히 `30d1eb2b50ec49e57273e699e6db7b54859bb200`이며 변경 드리프트와 v537 수정 경로 충돌이 없다.
- 전체 Markdown 문서 사전점검 완료: 1,767개 파일 / 161,931줄, corpus SHA-256 `c53772d9ac72d013c7f7c783004fbd0dfa41a8b357a163ba600e8d6f836ade0e`; 관리자/모바일/분석/SEO 광범위 관련 검색에 1,159개가 포함됐다. 실제 권위 문서는 별도로 본문까지 상세 확인했다.
- 원인 확정: SEO 긴 액션들이 flex 행 안에서 축소됐고, 분석 카테고리 버튼도 nowrap 스크롤 안에서 축소됐으며, 온보딩/지원 fixed 위젯이 관리자 라우트에도 전역 마운트되고 있었다.
- RED 증거: 구현 전 관리자 반응형 타깃 회귀 테스트는 route-aware 플로팅 유틸리티 경계가 없어 실패했다.
- GREEN 증거: 관리자 반응형 + SEO + 분석 타깃 테스트 3개 파일 / 18개 테스트 통과.
- 구현 내용: SEO 액션은 모바일 1열·sm 2열·데스크톱 flex로 재배치하고 긴 라벨 줄바꿈 허용, 분석 탭은 축소되지 않는 고유 폭 버튼을 로컬 터치 스크롤러에 배치, 코호트 카드 제목/배지 모바일 재배치, `/admin/**`에서는 온보딩/지원 플로팅 유틸리티 자체를 마운트하지 않도록 변경.
- 실수로 넓게 실행된 테스트에서는 이번 수정과 무관한 기준선 실패도 확인됐다. 기존 SEO 테스트 4개가 `/bank`를 비공개로 기대하지만 현재 sitemap/indexability 코드는 공개로 취급하며, 해당 광범위 실행에서 suite-load 실패 3개도 있었다. 이를 v537 회귀로 숨기거나 오인하지 않고 별도 기준선 증거로 기록한다.

## Test 전 검증 기록
- 관리자 모바일/SEO/분석 타깃: 3개 파일 / 18개 테스트 통과.
- 저장소 TypeScript typecheck: 통과.
- Production build: 통과.
- 저장소 lint: 오류 0개, 기존 warning 부채만 존재.
- `git diff --check`: 통과.
- 전체 저장소 테스트는 1,059개 통과 / 프론트 assertion 4개 실패이며, 모두 수정하지 않은 `/bank` sitemap/robots/indexability 기대값에 한정된다. 같은 불일치는 v537 최종 구현 전에도 확인됐고 실패 파일은 이번 패치에서 변경하지 않았다. 따라서 현재 main 기준선 불일치로 기록하며 v537 회귀로 오인하지 않는다.
- 다음 게이트: exact candidate를 commit/push하고 격리 Test에 배포한 뒤 Test 백엔드/version을 확인하고, 운영 작업 전에 인증 관리자 5회 viewport QA를 수행한다.

## exact-SHA Test 발견 및 후속 수정 — 2026-10-06
- 첫 candidate commit/push: `8f33ba92cb45ae7bc88e9b5ee7a1e0c36250f687`.
- 격리 Test를 `/srv/moneyverse-data/releases/test-v537-admin-mobile-8f33ba92`에 구성했고, public Test version이 exact SHA와 일치했으며 backend `:3100/health`는 `status=ok`, public `/status`는 200, Test는 `X-Robots-Tag: noindex, nofollow`를 유지했다.
- 최초 인증 브라우저 sweep은 관리자 25개 route × 대표 viewport 5회 = 125개 검사로, non-200 0, wrong-path 0, document overflow 0, 관리자 사용자용 floating widget 0, blank main 0이었다.
- 같은 sweep에서 `/admin/seo` candidate blocker 2개를 발견했다. 430px/landscape pass에서 React minified error #418이 발생했고 변경한 핵심 액션 4개의 실제 높이가 필수 44px가 아니라 40px였다.
- 원인 분석 결과 첫 렌더 시간 텍스트가 `Date.now()`와 locale 기반 가짜 초기 Indexing API 성공 이력에 의존했고, `Button size="sm"`은 높이를 40px로 고정하며 뒤쪽 `.moneyverse-button` 규칙 때문에 시도한 utility min-height가 cascade에서 이기지 못했다.
- 후속 구현은 하나의 서버 기준 시각을 `SeoClientView`로 직렬화해 상대시간 첫 렌더에 사용하고, 크롤러 로그 표시 시간대를 Asia/Seoul로 고정하며, 가짜 초기 색인 성공 행을 제거하고, SEO 핵심 액션 4개를 44px default 버튼 크기로 변경했다.
- 후속 TDD: 구현 전 RED 10개 통과 / 1개 실패, 구현 후 GREEN 3개 파일 / 20개 테스트 통과. 저장소 typecheck 통과, 타깃 ESLint 오류 0개(기존 warning만 존재), `git diff --check` 통과.
- Test 발견 후 필수 refetch에서도 `origin/main=30d1eb2b50ec49e57273e699e6db7b54859bb200`이며 upstream 드리프트가 없다.
- 첫 candidate는 Test 증거로만 유지한다. 후속 commit은 새로운 exact SHA로 다시 build/stage해야 Test 또는 Production 수용이 가능하다.


## 최종 exact-SHA Test 승인 증거 — 2026-10-06
- 후속 candidate: `b1a49d1fe379ce550c6f7602e8f3d5e2250fa2e7`.
- 격리 Test 릴리스: `/srv/moneyverse-data/releases/test-v537-admin-mobile-b1a49d1f`; 현재 Test 심볼릭 링크가 이 릴리스를 가리키며 백엔드 health는 `{"status":"ok"}`를 반환한다.
- 인증 관리자 5회 반응형 QA 완료: 26개 라우트, 5개 pass group, 13개 viewport/state 조합으로 **338/338 검사 통과**.
- 실패 카운터: non-200 0, 잘못된 경로 0, page/body 가로 overflow 0, 관리자 화면 사용자용 플로팅 위젯 0, blank main 0, page error 0.
- 변경 화면 검사: 26/26 통과; SEO 핵심 액션 최소 높이 실측 44px, SEO 액션 겹침 0, 분석 탭 겹침 0, 분석 제목/상태 겹침 0.
- `origin/main`은 `30d1eb2b50ec49e57273e699e6db7b54859bb200`으로 유지되며 작업 중 upstream drift가 없었다.
- GitHub 통합/릴리스 게이트 충족 전까지 운영은 의도적으로 변경하지 않는다. 현재 Production에 v537이 포함됐다고 주장하지 않는다.

## main 드리프트 조정 및 최종 PR 전 검증 — 2026-10-06
- 동시작업 QA 전용 수정 브랜치가 `871539a7cba45e25a9aef87753f74d8d6ad20f2a`에서 Build Test Candidate를 통과했고, PR #796으로 main `103e0aa2a134eb533a2cf5cbd17cbb1e95b7dfeb`에 병합됐다. 변경은 테스트 파일 3개뿐이며 애플리케이션 런타임 동작은 바꾸지 않는다.
- 필수 fetch에서 원래 `30d1eb2b` 기준선 이후 main 드리프트를 확인했다. 다른 작업을 덮어쓰지 않고 v537 소스 커밋을 `103e0aa2` 위로 정상 재베이스했다.
- 재베이스 후 로컬 게이트는 모두 정상이다: 관리자 반응형/SEO/분석 타깃 20/20, 저장소 typecheck 통과, root/contract/database/backend/frontend 테스트 명령 통과(backend 1,076 통과, 로컬 환경에서 DB 연동 391개 skip; frontend 1,065 통과), lint 통과, Production build 통과, `git diff --check` 통과.
- 기존 `b1a49d1f` Test 증거는 진단/수용 이력으로 보존하지만 재베이스 SHA의 릴리스 증거로 대체할 수 없다. 최종 push 브랜치 SHA가 Build Test Candidate와 격리 Test exact-version/backend/noindex/관리자 5회 QA를 다시 통과한 뒤에만 병합 또는 Production 작업을 진행한다.

## CI 의존성 감사 게이트 — 2026-10-06
- PR #797 CI는 policy, lint, typecheck, build, migration, test를 통과한 뒤 새로 공개된 전이 의존성 보안 권고 2건 때문에 운영 의존성 감사에서 fail-closed 했다.
- 감사 게이트를 약화하거나 우회하지 않고 루트 package override와 lockfile을 수정 버전으로 갱신했다.
- 로컬 수정 후 운영 의존성 감사와 전체 typecheck/test/lint/build/diff-check 체인이 모두 exit 0으로 완료됐다.
- candidate 식별자가 변경되므로 새 브랜치 HEAD는 merge 또는 Production 전에 GitHub CI와 exact-SHA 격리 Test를 다시 통과해야 한다.
