# v2026.11.18.1 — P0 관리자 프론트엔드 로딩 화면 긴급복구

## 작업 전 — 2026-11-18 07:07 KST
- 사용자: Android 브라우저 `/admin/`에서 `페이지를 불러오는 중입니다...` 무한 대기.
- AGENTS.md, 살아있는 통합 기획, 개발 마스터 레퍼런스, UI 방어 명세, 11월 17일 포스트모템 및 관리자 SEO 경로 복구 기록, 실제 Nginx/Spring 상태 확인.
- 재현: `/admin/`, `/login`, `/`가 HTTP 200이나 JavaScript 없이 동일한 475바이트 임시 HTML 반환. `/health`, `/api/version`은 JSON HTTP 200.
- Nginx `prod_frontend`와 `prod_spring`이 모두 :4550(Spring)을 가리킴. Next.js 프론트엔드 런타임 비가동. 정적 출력 및 과거 standalone 빌드 파일은 보존됨.
- 진단: DB 전면 장애가 아니라 프론트 런타임 소실 및 잘못된 업스트림 경로 문제.
- 다른 에이전트의 작업트리, 금융 데이터, 인증 체계 변경 금지. 구성 및 바이너리 롤백 자산 보존.
- 전용 브랜치 및 독립 루프백 테스트→접근제어/에셋/API 검증→main 재확인→PR 및 문서화한 승격 게이트 순서.

## 작업 중
- [x] 사용 가능한 Next.js 빌드 후보의 분리 테스트.
- [x] 가역적 배포 설정 수정 및 사전/사후 테스트.
- [x] 관리자 익명 인증·JS/CSS·API 검증. 실제 로그인 브라우저 긍정 E2E는 미검증으로 격리.
- [x] origin/main 최신성 확인 및 승인 게이트 확인(공식 Test 프론트 502로 main 병합 보류).

## 작업 종료
- 최초 기록 시점에는 운영 환경을 변경하지 않음.

### 작업 중 점검 — 2026-11-18 07:24 KST
- 전용 브랜치 및 코드·작업 기록 GitHub 푸시, PR #3252 작성. `origin/main=e96e8f81f4` 재확인(변동 없음).
- 11월 17일 Next 빌드는 next 모듈 심볼릭 링크 누락으로 실행 불가, 임시 보정 뒤 500이 발생해 승격 대상에서 제외.
- 최종 검증된 예전 릴리스 `prod-v2026.11.14.1217-43ab5a5110`의 Next standalone 실행 경로를 고정하고, 번들 모듈 경로·기존 비공개 환경 파일로 별도 :4524 서비스 실행. `/admin`, `/admin/logs`, `/login`, `/api/viewer` 실 HTTP 200.
- **보안 중요:** Next 내부 API `/api/v1/admin/users` 직접 비인증 접근 시 회원 데이터 200이 관찰됨. 따라서 해당 API로 사용자가 접근하지 않도록 Spring 경로를 절대 변경하지 않으며, 관리자 UI 전 경로는 Nginx의 Spring `/api/v1/admin/me` 세션 검사를 먼저 통과해야 함.
- 분리 Nginx 8/8 PASS: 익명 관리자 302(로그인), 사용자 로그인 화면 200, viewer 200, Spring 관리자 조회 401, CSS/JS 200 및 MIME 정상. 금융·원장·DB 변경 없음.
- 운영 설정 원본 백업·문법·무중단 reload 및 외부 재검증을 남김. 유효한 관리자 계정 세션의 긍정 E2E는 접근권한 부재로 미검증이라고 표시.


### 작업 종료 — 2026-11-18 07:27 KST (제한 복구)
- **버전:** v2026.11.18.1, 공개 관리자 진입 운영 우회 적용. 영속 :4524 Next, 보호 Nginx snippet, 최근 정적 자산 fallback. Nginx 구문 검사 PASS 및 무중단 reload. 백엔드/DB 서비스 중지·원장/금융 변경 없음.
- **운영 증거:** `/admin`, `/admin/`, `/admin/logs` 익명 302→로그인, `/login` 200, `/api/viewer` 200 signedOut, `/api/v1/admin/me`·`/api/v1/admin/users` 익명 401, `/health` 200, JS·CSS 200 및 브라우저 UA 전체 11/11, no-store/noindex 단일 헤더. Nginx·Next·Spring 모두 active, Next 부팅 자동등록 enabled.
- **작업 기록 및 백업:** PR #3252, Nginx 두 원본 백업 `/srv/moneyverse-data/ops-backups/p0-admin-ui-v2026.11.18.1/`, [운영 보고서](../releases/v2026.11.18.1-admin-ui-recovery-prod.ko.md), [내부 업데이트](../updates/v2026.11.18.1-admin-ui-recovery-internal.ko.md), [GitHub 업데이트](../updates/v2026.11.18.1-admin-ui-recovery-github.ko.md).
- **미완/P0:** 공식 Test 웹 `/` 502, 운영 홈 `/`·`/wallet` 임시 화면, OAuth Discord/Google 인가 시작 임시 HTML, 유효 관리자 로그인·전체 페이지 및 실제 시각 QA 미인증. 운영 전체 정상화/PR main 병합을 선언하지 않음. OAuth API/근본 Spring UI 분리는 병렬 작업자와 조율 필요.
