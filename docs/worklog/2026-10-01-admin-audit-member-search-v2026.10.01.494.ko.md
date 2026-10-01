# v2026.10.01.494 — P0 관리자 감사 로그 회원 검색 긴급 수정 작업기록

**상태:** TEST 수용 완료 / 운영 승격 준비
**우선순위:** P0 / 긴급  
**GitHub 이슈:** #765  
**브랜치:** `fix/admin-audit-member-search-v2026.10.01.494`
**시작 origin/main:** `91efe427cccbc012cd71c082d3c9caeb246dcf98`

## 시작 기록

운영 관리자 화면 `/admin/logs`에서 대상 회원 UUID로 검색했을 때 감사 이력이 비어 보이는 화면이 확인됐다. 실제 감사 기록이 있는데도 빈 결과를 보이는 경우는 운영 무결성 결함으로 취급한다.

초기 소스 확인 결과 화면은 회원 필터를 `GET /api/v1/admin/audit/events`로 전달한다. 현재 저장소에는 이미 `174-audit-member-target-search.sql` 마이그레이션이 있으며, 이 마이그레이션은 `subject_user_id`와 `target_id`를 함께 검색하도록 설계돼 있다.

## 조사·수정 계획

1. Test/Production 권위 DB의 마이그레이션 적용 상태와 실제 함수 정의를 확인한다.
2. 감사 이력을 변경하지 않고 대상 회원 검색을 DB 증거로 재현한다.
3. 수정 전에 관측된 실패를 증명하는 회귀 테스트를 먼저 추가한다.
4. 필요한 최소 범위의 forward-only 수정만 적용하고 이미 적용된 마이그레이션은 수정하지 않는다.
5. 작업 중간에 `origin/main`을 다시 가져와 동시 작업을 정합한다.
6. 정확한 후보 SHA를 격리 Test에 올려 backend/DB/관리자 흐름/반응형을 검증한다.
7. Test 수용 후에만 현행 무중단 승격 절차로 Production에 반영한다.
8. 내부용 및 GitHub용 업데이트 내역에 정확한 SHA와 런타임 증거를 남긴다.

## 중간 작업 기록

- `origin/main` 재확인: `91efe427cccbc012cd71c082d3c9caeb246dcf98`; 시작 기준 대비 변경 없음.
- Production에는 `174-audit-member-target-search.sql`이 적용돼 있고 실제 검색 함수에도 `target_id` 보완 검색이 존재한다.
- 화면의 회원은 실제 회원이지만 `audit_logs`에서 actor/subject/target 모두 0건이다. 따라서 운영 감사 로그의 빈 결과 자체는 정상이다.
- 같은 회원의 `user_activity_logs`는 44,676건이며 API 요청 41,548건, 체류 1,803건, 페이지뷰 899건, 클릭 426건이다.
- 원인: 관리자 조작 감사와 일반 회원 활동 로그의 의미가 UI에서 충분히 구분되지 않았고, backend에 이미 있는 `userId` 활동 필터가 frontend에 노출되지 않았다.
- TDD RED: 신규 `admin-member-log-routing.test.ts`의 의도한 3개 검증이 구현 전 모두 실패함을 확인했다.
- GREEN: 회원별 활동 필터·링크·빈 상태 의미를 수정했고 라우팅 회귀 + 관리자 모바일 테스트 10/10 통과했다.

## 공개 격리 Test 수용

애플리케이션 소스 `7080738e656aca099d5c871278d178d69a984fcc`를 Debian 13 권위 호스트의 `/srv/moneyverse-data/releases/test-v494`로 구성했고 공개 Test 포인터를 `test-v489`에서 `test-v494`로 전환했다.

수용 근거:
- backend `/health`: `{"status":"ok"}`;
- 공개 `/api/version`: 정확한 애플리케이션 SHA `7080738e656aca099d5c871278d178d69a984fcc`;
- 공개 `/frontend-version`: 동일한 정확 SHA;
- 공개 `/`: HTTP 200 및 `X-Robots-Tag: noindex, nofollow`;
- 공개 `/status`: HTTP 200;
- 공개 catalog backend/DB 경로: 146개 catalog item;
- 변경된 관리자 활동 로그 경로는 비로그인 요청에서 예상된 로그인 게이트로 이동;
- 수용 구간에 신규 fatal/critical/uncaught/unhandled 서비스 로그 없음.

Test DB의 기존 `seo_crawler_logs` 테이블 없음 경고는 v494 이전 Test 서비스에서도 동일하게 확인되어 이번 변경으로 인한 신규 문제로 판정하지 않았다.

## GitHub 제어면 기록

GitHub `Build Test Candidate` 실행 `36819176468`은 통과로 기록하지 않는다. 현재 `.github/workflows/ci.yml`이 `scripts/check-secrets.sh` 등 shell helper를 호출하지만, 해당 파일들은 commit `58cdcafd`에서 의도적으로 제거됐고 현재 `.gitignore`는 운영용 `*.sh` 추적을 금지한다. 이 별도 main/제어면 불일치는 GitHub issue #768로 추적하며, 긴급 runtime 브랜치에서 제거된 스크립트를 다시 추가하지 않았다.
