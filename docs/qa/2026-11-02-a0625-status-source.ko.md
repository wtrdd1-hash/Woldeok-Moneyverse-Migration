# 개발 A 06:25 — 서비스별 공개 상태 상세 조회 QA (2026-11-02)

**판정:** P1 구현, Draft PR #2435. 로컬 빌드·타입검사·단위·계약 테스트 PASS, 전체 의존성 보안 감사 FAIL, 공식 Test 정확 SHA 인증 E2E BLOCKED, **운영 배포 보류**.

## 범위 및 중복 보호
- 기준 main `a8541927c3a351d980454c66e95a3356c47e0722` 시작·중간·종료 재확인. 기능 SHA `da5b372f9ce29281c0e5a56a0d3aedd7b34bf8d8`, 테스트 수정 SHA `29b5fe4c519b02961117d505ed549ebf377849e8`.
- 기존 주의 필요 상태 필터 PR #2264와의 중복을 발견하여 미커밋 중복 구현을 폐기하고, 별개 기능인 서비스 sourceKey별 상세 조회로 변경했다.
- 웹 `/status?sourceKey=api`는 전체 상태 종합 판정을 유지하면서 서비스별 상세·전체로 돌아가기 링크를 제공한다. Nest `/api/v1/status?sourceKey=api`는 유효한 키만 수용하고 적용 키를 응답에 명시한다. Android `/app-api/v1/status?sourceKey=api`는 중복·잘못된 조건과 구버전 서버의 검증되지 않은 HTTP 200(빈 배열 포함)을 503으로 차단한다. 결과는 no-store/noindex. 기존 PostgreSQL SECURITY DEFINER 공개 함수만 조회하며 마이그레이션·권한 확대·금융 쓰기 없음.

## 실측 검증
- RED→GREEN 대상 테스트: Backend 10 PASS, Frontend 13 PASS. 첫 전체 Frontend에서 신규 `status` 그룹이 기존 허용목록 기대값에 누락되어 2,928 PASS / 1 FAIL. 기대값을 올바르게 갱신한 뒤 대상 21 PASS.
- 수정 SHA `29b5fe4c...`: Backend **2,982 PASS / 518 SKIP**, Frontend **2,929 PASS**, DB **62 PASS / 5 SKIP**, Contract **41 PASS**. 전체 typecheck PASS, lint 오류 0/경고 1,027, 모바일 계약 184개 PASS, 전체 빌드 PASS, 보안 정책 11 PASS, 운영 의존성 알려진 취약점 0건.
- 전체 의존성 보안 감사 **FAIL: 9건(낮음 1, 보통 8)**. 운영 의존성만의 감사 결과로 전체 실패를 해소했다고 간주하지 않는다.
- 개발 PostgreSQL 17.11에서 `moneyverse_app` READ ONLY/ROLLBACK: 공개 상태 함수 EXECUTE=true, 공개 소스 `api`, `database`, `web` 3개, `api` 정확 일치 1건·미존재 키 0건. 실제 DB 쓰기 없음.
- 개발 DB **P0 #993** 잔존: `account_balances` 직접 UPDATE=true, `user_items` 직접 DELETE=true. 운영 DB의 동일 문제는 확인되지 않음.
- 공식 Test/Production 공개 SHA 모두 `510dbe6bf4d5c2a8089fc06b480776053da7a2e3`로 후보와 불일치. 정확 SHA 인증 E2E, 독립 백업 복원, GitOps 출처 검증 BLOCKED.
- 기존 상태 PR #2264와 controller/service/gateway/page/계약 파일 충돌, 게시판 PR #2429와 Android gateway 충돌. 고유 변경 보존, 강제 병합·브랜치 삭제 없음.

## 배포·복구
최종 SHA CI·공식 Test 인증 E2E·최소 권한·전체 보안·독립 복원·충돌 해소·GitOps 게이트가 모두 통과하기 전 main 병합 및 Production 배포 금지. 현재 미병합 읽기 전용 변경은 PR 종료/되돌리기로 복구 가능하며 DB 롤백 대상 없음.
