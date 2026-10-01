# v2026.10.01.494 — P0 관리자 감사 로그 회원 검색 긴급 수정 작업기록

**상태:** INVESTIGATING  
**우선순위:** P0 / 긴급  
**GitHub 이슈:** #765  
**브랜치:** `hotfix/admin-audit-member-search-v2026.10.01.494`  
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
