# 개발 A — 최근 보안 활동 유형 필터

## 작업 전 (2026-10-30 12:56 KST)
- 미니PC Debian 13 연결, Backend·Frontend·Nginx·Docker·DB 정상 응답. 기준 main `9da6545c4ff4809b5bd84ab6a28b9d2f1db74cef`.
- QA v1388: Production 실행 프로세스 경로 불일치, Test 국고 가상 데이터 HTTP 200. 운영 승격 보류.
- 독립 `auto/hourly-a-20261030-1256-security-event-category` 브랜치와 worktree. 기존 열린 PR 7개와 고유 미통합 변경 보존.

## 진행 중
- 본인 최근 20건에만 적용하는 `all/login/settings` 필터. 기존 SECURITY DEFINER 함수 재사용, 마이그레이션·금액 변경 없음.
- 테스트 먼저 실패(RED) 확인 후 Backend 9건·Frontend/Android 62건·추가 gateway 52건 통과(GREEN). 비정상·불일치 응답은 빈 결과로 처리하지 않고 거부.
- 최신 main 중간 재확인: 변동 없음. 전체 게이트·격리 PostgreSQL 검증 진행 예정.

## 종료 (2026-10-30 13:14 KST, 초안·배포 보류)
- Draft PR #1996, 기능 코드/계약 SHA `5b9d46a9d476c9c2a6b602ae98bfa27fd747df28`. 최신 main `9da6545c4ff4809b5bd84ab6a28b9d2f1db74cef` 작업 전·중·통합 직전 재확인. 변경 파일 18개.
- 최종 로컬 타입검사·빌드·변경 파일 ESLint·전체 린트(오류 0/경고 1,043)·앱 API 계약 PASS. Backend 대상 10 PASS, Frontend/Android 대상 68 PASS, DB 단위 56 PASS/4 SKIP, 보안·릴리스 26 PASS, 운영 의존성 취약점 0건, 격리 PG 마이그레이션 305개 및 권한·롤백 PASS.
- Backend 전체 2,567 PASS/119 FAIL/495 SKIP, Frontend 전체 2,614 PASS/54 FAIL. 정확 SHA 후보 빌드 CI #41001065886은 모바일 계약 파일 분류 UNKNOWN으로 FAIL(별도 수정 초안 #1986 미병합). 전체 게이트 통과 아님.
- 공식 Test는 기존 `c2129625...`, 국고 미검증 응답 HTTP 200. Production 공개 버전 `94d38f476...`, 국고 HTTP 503 UNVERIFIED, 실행 프로세스는 삭제된 v1515 경로. 공식 Test 인증 E2E·독립 백업 복원·GitOps·롤백 검증 BLOCKED.
- 시작 열린 PR 7개→종료 9개, 종료 origin 브랜치 59개(비-main 58개, main에 완전 병합 49개, 고유 미통합 9개). 최초 로컬 remote-tracking ref 1,109개에는 과거 `pr/*` 참조 1,054개가 포함되어 GitHub 브랜치 수와 다름. 브랜치 삭제·PR 강제 종료 없음.
- main 병합·운영 DB/원장 변경·서비스 재시작·Test/Production 배포·롤백 없음. 격리 테스트 컨테이너만 중지. 향후 승인된 배포 이후 롤백은 코드 revert, DB migration 없음.
- 최종 판정: **대상 PASS / 전체 게이트 FAIL / 공식 Test BLOCKED / Production HOLD**.

## 진행 중 추가 (13:07 KST)
- 전체 타입검사 PASS, 전체 린트 오류 0건(기존 경고 1,043건), 로컬 빌드 PASS.
- DB 단위 56 PASS/4 SKIP, Backend 대상 9 PASS, Frontend/Android 대상 68 PASS, OpenAPI 유형 테스트 4 PASS.
- 격리 PostgreSQL 17.11에 마이그레이션 305개(002~306) 적용. 본인 최근 20건, 타인 분리, 20건 밖 오래된 이벤트 제외, 앱 역할 원본 테이블 직접 조회/수정 차단, 함수 실행권한, 롤백 후 0건 검증 PASS. 운영 DB 변경 없음.
- Android 기계 판독 API 계약 및 영문·국문 스키마 참조에 `category` 파라미터 추가. 전체 회귀/CI 재검증 대기.
