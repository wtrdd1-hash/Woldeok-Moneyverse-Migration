# 작업기록 — 광고 기본 활성화 v2026.09.13.42

기준일: 2026-09-13
범위: 광고 기본 정책, 프론트 런타임 스위치, 릴리스 자동화, 회귀 테스트, 기획/운영 문서
배포: Production 전에 격리 Test 검증 필수

## 구현 전 확인한 자료

- 작업 시작 시 최신 애플리케이션 `main` (`4683ee5b40567278f93f1e991fbfc23d4534362d`);
- `docs/planning/PROJECT_PLAN.md` 및 한국어 문서;
- `docs/operations/SEO_ADS_LEGAL_AUDIT.md` 및 한국어 문서;
- `frontend/src/components/adsense-ad.tsx`;
- `frontend/src/components/public-advertisement.tsx`;
- 홈/갤러리/게시판/공지의 현재 공개 광고 배치;
- `frontend/src/lib/adsense.ts`, `frontend/next.config.ts`, `frontend/Dockerfile`;
- `.github/workflows/test-candidate.yml`, `.github/workflows/deploy.yml`;
- `docs/architecture/deployment-flow.md` 및 실제 `wtrdd1-hash/kuber-infrastructure` GitOps 정본.

## 발견사항

광고 구현 자체가 삭제된 것은 아니었다. 문제는 운영 릴리스 경로였다. Production 자동화에서 `enable_ads` 기본값이 false였고 자동 `workflow_run`은 `ADS_ENABLED=false`로 계산됐으며 게시자/슬롯 빌드 인자도 비워졌다. 프론트 라이브러리와 CSP 역시 광고 플래그가 없으면 비활성화로 처리했다.

따라서 검토된 AdSense 컴포넌트와 배치가 코드에 있어도 정상적인 자동 Production 릴리스 뒤 광고가 없는 프론트 이미지가 만들어질 수 있었다.

## 구현 결정

검토된 광고를 기본 활성화하되 다음 두 안전 경계를 유지한다.

1. 광고는 기존 검토 완료 공개 콘텐츠 allowlist에서만 허용하고 민감/거래/게임 조작 경로는 계속 차단한다.
2. Test 또는 긴급 정책·법률 대응에서는 `ADS_ENABLED=false`를 명시해 광고를 끌 수 있다.

격리 Test 후보 워크플로는 실제 광고 노출/요청이 발생하지 않도록 계속 명시적 광고 OFF를 사용한다.

## 변경 파일

- `.github/workflows/deploy.yml`
- `frontend/Dockerfile`
- `frontend/src/lib/adsense.ts`
- `frontend/next.config.ts`
- `frontend/src/lib/adsense.test.ts`
- `frontend/src/security-headers.test.ts`
- `docs/planning/PROJECT_PLAN.md`
- `docs/planning/PROJECT_PLAN.ko.md`
- `docs/operations/SEO_ADS_LEGAL_AUDIT.md`
- `docs/operations/SEO_ADS_LEGAL_AUDIT.ko.md`
- `v2026.09.13.42` 영문/한국어 changelog 및 worklog.

## 1차 검증 증빙

최종 문서 추가 전 구현 SHA: `2b984ae556cdead7f757d889dd9117b7eeb151cd`.

Test Candidate 워크플로 실행: `34747780450`.

재사용 검증 job에서 다음 항목이 모두 성공했다.

- 커밋된 secret 검사;
- lint;
- 비정상 control byte 검사;
- typecheck;
- production build;
- PostgreSQL migration;
- 전체 test;
- Prisma schema 임의 변경 방지 검사;
- production dependency audit.

같은 SHA의 backend Test 후보 이미지 빌드도 최종 문서 작업 전에 완료됐고 frontend 후보 이미지도 같은 exact-SHA 워크플로에서 이어서 빌드됐다. 문서 추가로 최종 SHA가 바뀌므로 병합 전에 최종 HEAD 기준 exact-SHA Test 후보 및 공개 테스트 게이트를 다시 수행한다.

## 필수 작업 중간 재확인

작업 중 애플리케이션 `main`을 다시 읽었고 해당 시점에도 `4683ee5b40567278f93f1e991fbfc23d4534362d`에서 변경되지 않았다.

GitOps 저장소도 다시 확인했다. 현재 `main`에서 격리 Test 승격 작업이 이미 프로젝트 운영 버전 `v2026.09.13.41`을 사용한 것이 확인됐다. 작업 순서별 버전 충돌을 피하기 위해 광고 작업의 최종 버전을 초기 임시 `v2026.09.13.37`에서 다음 순서인 **v2026.09.13.42**로 올렸다.

## Test / Production 릴리스 절차

1. 최종 애플리케이션 SHA로 CI와 불변 Test 이미지 빌드를 다시 수행한다.
2. 그 exact SHA를 `kuber-infrastructure/staging/wdmv-test`로 승격한다.
3. `https://test.easy-scraping.com/api/version`에서 exact SHA를 확인한다.
4. 공개 backend/database smoke 경로와 frontend/noindex 동작을 확인한다.
5. 병합 직전 애플리케이션 `main`을 다시 확인한다.
6. Test 증빙이 정상일 때만 애플리케이션 PR을 병합한다.
7. 동일 SHA의 Production 이미지를 Production 릴리스 워크플로로 만든다.
8. 같은 SHA를 GitOps로 운영에 조정하고 Production health, `/ads.txt`, 검토된 광고 설정을 확인한다.

## 롤백

DB schema/data 변경은 없다. 긴급 시 `ADS_ENABLED=false`로 광고만 끄거나 Production GitOps frontend 이미지 참조를 직전 검증 SHA로 되돌린다.

## 남은 위험

실제 광고 creative/no-fill은 Google 및 지역별 동의·정책 상태에 따라 결정된다. AdSense loader, 게시자/슬롯 설정, CSP, ads.txt가 정상이어도 creative가 표시되지 않을 수 있으며 이 경우를 애플리케이션 장애로 오인하지 않는다.
