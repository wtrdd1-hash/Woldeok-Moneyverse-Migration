# Google Search Console 사이트맵/API 연동 작업 기록 — v2026.10.07.541

- 날짜: 2026-10-07
- 브랜치: `feat/gsc-search-console-api-v2026.10.07.541`
- 기준선: `origin/main=d49ab2dca79012dc4029e9497eeab53c46094c9e`
- 시작 근거: 관리자 SEO 화면은 이미 Google Search Console 서비스 계정 키를 저장하지만, 별도 "Indexing API" 카드가 일반 금융/계산기 URL을 Google에 직접 제출한다고 표시하는 반면 실제 라우트는 폐기된 사이트맵 ping 엔드포인트를 호출하고 있다.
- 사용자 목적: Search Console 계정 등록 후 관리자 SEO 화면에서 실제 Google API를 클릭으로 실행할 수 있게 한다.
- 범위: 기존 서비스 계정 키를 재사용해 Search Console Sitemaps API로 운영 사이트맵을 실제 제출하고 제출/상태 증거를 표시한다. Search Analytics는 유지하고 필요 시 URL Inspection 상태를 제공한다. 일반 페이지에 대한 가짜 Google 직접 색인 성공 표현은 제거한다.
- 동시작업 경계: 최신 `origin/main`에서 분리된 Git worktree를 사용하며 다른 작업자의 변경을 reset/덮어쓰기 하지 않는다.
- 구현 전 우선 확인 권위: `AGENTS.md`, `PROJECT_MEMORY.md`, 문서 정책/카탈로그/인덱스/현재 런타임 기준, 통합기획서, 검색 유입 운영 명세, 관리자 SEO 명세, 기존 GSC 프론트/백엔드 구현.
- 외부 API 확인 결과: Search Console Sitemaps API는 `webmasters` scope로 사이트맵 제출을 지원한다. URL Inspection API는 상태 조회 전용이다. Google Indexing API는 여전히 `JobPosting`/라이브 `BroadcastEvent` 전용으로 Moneyverse 금융/계산기 URL에는 사용할 수 없다.
- 소스 수정 전 전체 저장소 문서 사전점검을 완료하고, 통합기획서를 최우선 계획 권위로 취급한다.

## 구현 전 원인 기록

1. 기존 GSC 클라이언트는 `webmasters.readonly`만 요청하므로 Search Analytics 조회는 가능하지만 Sitemaps submit 호출 권한은 없다.
2. `/api/admin/seo/indexing-submit`은 저장된 GSC 키도, 실제 Google Indexing API도 사용하지 않는다. 구형 Google/Bing 사이트맵 ping URL을 호출하고 HTTP 상태와 무관하게 fetch가 완료되기만 하면 성공으로 처리하며, 응답 문구는 Google Indexing API 성공이라고 표시한다.
3. 별도 `/api/seo/submit` BFF는 백엔드 장애 시 성공 응답을 만들어 내므로 운영자 화면에 가짜 성공이 표시될 수 있다.
4. 이 사이트에서 지원되는 Google 경로는 Search Console Sitemaps API로 발견/갱신을 통보하고 URL Inspection API로 색인 상태를 확인하는 것이다. 수동 "색인 생성 요청"과 동등한 일반 Search Console API 엔드포인트는 없다.

## 실행 순서

1. 전체 문서 인벤토리/checksum 스캔과 관련 권위/소스 상세 확인.
2. 격리 worktree 의존성 및 깨끗한 기준 테스트 확인.
3. 쓰기 Search Console OAuth scope, 실제 사이트맵 제출/상태, BFF fail-closed, 관리자 UI 표현에 대한 실패 테스트를 먼저 추가.
4. 최소 범위로 backend/client/BFF/UI 구현.
5. 작업 중간에 `origin/main`을 다시 fetch하고 겹치는 변경을 조정.
6. 타깃 테스트, 저장소 typecheck/tests/lint/build, diff 검증.
7. 브랜치 push 후 exact candidate를 격리 Test에 배포하여 backend health와 Search Console API 동작을 확인한 뒤 무중단 운영 승격 게이트를 적용.
8. 중간/최종 증거와 내부용/GitHub용 업데이트 내역 기록.

## RED / 기준선 중간 기록 — 2026-10-07

- 소스 수정 전 전체 추적 Markdown 사전점검 완료: 1,856개 파일 / 175,148줄, SEO/Search/Google 광범위 관련 문서 646개, 전체 corpus SHA-256 `40eff48e4f4f528ef337dc35bba04e0799cb5085f3bf57df66ffc8db96d97e23`.
- 고정 pnpm lockfile 기준 격리 worktree 의존성 설치 완료.
- 깨끗한 기준선 `pnpm test` exit 0 완료. 프론트는 190개 테스트 파일 / 1,065개 테스트 통과. 기존 jsdom canvas 경고와 비동기 act 경고는 있었지만 기준선 실패는 아니다.
- 현재 소스와 Google 공식 API 문서를 대조해 원인을 확정했다. Moneyverse 일반 URL은 Google Indexing API 대상이 아니며, 지원되는 쓰기 경로는 `webmasters` scope를 사용하는 Search Console Sitemaps API이다. URL Inspection은 색인 상태 조회 전용이다.
- 구현 전 TDD RED 확인: backend GSC 사이트맵 helper가 없고, controller mutation guard 테스트는 사이트맵 메서드 부재 및 기존 범용 SEO submit의 guard 부재로 실패한다. 프론트의 1클릭 사이트맵 등록 버튼도 없으며 기존 SEO submit BFF는 backend 호출 예외 시 HTTP 200 성공을 만들어 낸다. 별도 SeoService 테스트도 `submitGscSitemap` 미존재로 실패한다.
- 동시 작업 브랜치 `origin/auto/hourly-c-seo-indexing-truth-v2026.10.06.539`는 읽기 전용으로 확인했다. 해당 브랜치는 `indexing-api-card.tsx` 한 파일만 수정하므로, v541에서는 그 파일을 수정하지 않아 동시 작업을 덮어쓰지 않는다.

## GREEN / 보안 게이트 중간 기록 — 2026-10-07

- RED→GREEN 타깃 사이클 완료: backend SEO 테스트 19/19 통과, frontend SEO/BFF 테스트 8/8 통과.
- 저장소 typecheck exit 0.
- 현재 호스트의 Test/Production 런타임 환경을 직접 확인했다. Test는 `APP_BASE_URL=https://test.easy-scraping.com`, `SEO_INDEXING_ENABLED=false`; Production은 `APP_BASE_URL=https://easy-scraping.com`, `SEO_INDEXING_ENABLED=true`이다. 따라서 신규 Search Console 사이트맵 mutation은 Test에서 fail-closed 하고 운영 색인 런타임에서만 허용된다.
- 실제 구현은 기존 암호화 저장 GSC 서비스 계정을 재사용하고, Search Analytics는 readonly OAuth scope를 유지한다. 명시적 사이트맵 mutation에서만 `webmasters` scope를 요청해 Search Console Sitemaps API로 `/sitemap.xml`을 제출하고, 제출 직후 sitemap resource를 다시 읽어 마지막 제출/다운로드, 처리 대기, 경고/오류, 제출 URL 수 상태를 표시한다.
- 관리자 BFF는 backend 장애 시 더 이상 SEO 제출 성공을 조작하지 않는다. 범용 URL 변경 통보도 인증 mutation helper 및 backend 관리자 세션 + CSRF 가드 체인을 통과한다.
- 동시 v539 작업 경계를 보존하기 위해 legacy “Google Indexing API” 배치 카드 소스는 수정하지 않고 활성 SEO 화면에서만 제거했다. 남은 범용 액션은 Google 색인/사이트맵 성공이 아니라 IndexNow URL 변경 통보로 정확히 표시한다.
- 전체 검증은 테스트/lint/build를 통과한 뒤 새로 공개된 `sharp <0.35.5` / CVE-2026-96889 운영 의존성 감사에서 fail-closed 했다. 기존 루트 override 정책으로 `sharp=0.35.5`를 고정하고 lockfile/node_modules를 갱신했으며, 재감사 결과는 **No known vulnerabilities found**이다. 의존성 그래프가 변경됐으므로 candidate commit 전 정확한 최종 트리에서 전체 검증 게이트를 다시 실행한다.

## 최종 로컬 소스 검증 기록 — 2026-10-07

- 필수 최종 refetch 결과도 `origin/main=d49ab2dca79012dc4029e9497eeab53c46094c9e`이며 구현 주기 중 upstream drift가 없었다.
- 최신 전체 소스 게이트 `gsc541-finalverify2` exit 0 완료: 저장소 typecheck, 전체 tests, lint, Production build, 운영 의존성 audit, `git diff --check` 모두 성공.
- Backend 전체 스위트: 테스트 파일 120개 통과, 로컬 환경의 DB 연동 파일 53개 skip; 테스트 1,081개 통과 / 391개 skip. DB skip 그룹은 통과로 주장하지 않으며 runtime/Test 수용 게이트에서 별도 확인 대상이다.
- Frontend 전체 스위트: 테스트 파일 191개 / 테스트 1,067개 통과. 기존 jsdom canvas/navigation/act 경고는 실패하지 않는 기준선 warning 부채이다.
- Lint 오류 0, 기존 warning 부채만 존재. Production build 완료. `sharp 0.35.5` override 반영 후 운영 의존성 audit는 알려진 취약점 0건이다.
- 이 체크포인트는 런타임 소스/build 트리를 검증했다. 이후 worklog/update-note 추가는 문서 전용 변경이며 candidate commit 전 최종 diff check를 다시 실행한다.

## Exact-candidate 격리 Test 수용 기록 — 2026-10-07

- Candidate commit: `58f872c4c1d35595322ba4aeb4d27ac6e8dc9dba`; 격리 Test release: `/srv/moneyverse-data/releases/test-v541-gsc-58f872c4`.
- 첫 Test 기동에서 backend candidate SHA는 정확했지만 frontend를 `BUILD_ID` 없이 빌드해 Next.js가 timestamp를 `NEXT_PUBLIC_BUILD_ID`에 내장한 릴리스 패키징 결함을 발견했다. 이를 무시하지 않고 release blocker로 처리했다.
- 동일 런타임 소스를 `BUILD_ID=58f872c4c1d35595322ba4aeb4d27ac6e8dc9dba`로 다시 빌드해 exact frontend artifact만 재스테이징했고 backend/frontend identity가 모두 candidate SHA와 일치함을 확인했다.
- 공개 Test 수용 검사 exit 0: root 200, `/status` 200, `/sitemap.xml` 200, backend health 정상, Test backend/frontend 서비스 active, 공개 `/api/version` exact SHA, `X-Robots-Tag: noindex, nofollow` 유지.
- 실제 Test release 정책에서 컴파일된 `SeoService.submitGscSitemap()`을 호출해 `Google Search Console 사이트맵 제출은 운영 환경에서만 허용됩니다.`로 fail-closed 되는 것을 확인했으며 Test에서 Google 사이트맵 mutation은 발송되지 않았다.
- candidate 재기동 후 Test backend/frontend의 error priority journal 항목은 0건이었다.
- 이 Test 수용 중 Production은 변경하지 않았다.
