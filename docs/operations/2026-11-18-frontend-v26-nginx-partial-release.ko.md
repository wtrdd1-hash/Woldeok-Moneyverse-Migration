# Nginx 프론트엔드 과도기 v2026.11.18.26 — 운영 변경 기록

**2026-11-18 KST · [영문 정본](2026-11-18-frontend-v26-nginx-partial-release.md).** 관리자 화면2개와 혼합 배포 버전 API1개만 실제 수정. 전체 180화면 전환 아님. [정밀 분석](../findings/2026-11-18-frontend-production-visibility-v2026.11.18.26.ko.md).

1. v24 빌드 ID1794990553432, 불변 HTML18/실제 운영13 확인, 통합문서·GitHub main 재확인. 변경 전 Nginx SHA `2da8306ab5b02c8894d6abcfeafef17ac04650150a6b8da764715975db7588c1`, SEO 스니펫 SHA `f84c6abbf23b1f071acc23e8b212a16ba7f767805f881e423ca62b674ad28367`.
2. 별도 Nginx 127.0.0.1:4451에서 기존 Spring 실제 관리자 역할 검사 `/api/v1/admin/me`와 신규 HTML 버전 ID 대상 테스트 **9/9 PASS**, 문법 PASS. 테스트 Nginx 종료.
3. 운영 SEO-v3 `location = /admin/seo`·`/admin/seo-audit` 내 잘못된 인증 `auth_request /__mv_seo_authorize_20261117`(존재하지 않는 API404) 대신 기존 관리자 실제 세션 확인 `auth_request /__mv_p0_admin_auth_20261118`, `error_page 401 = @mv_p0_admin_signin_20261118` 추가. 원래 SEO 민감 API 보호, no-store/noindex 보존. 기본 관리자 경로보다 정확 위치가 우선하는 문제 해결.
4. 운영 공개 서버에만 `/frontend-version` 정확 경로를 추가해 **실제 v24 신규 13페이지의 같은 출처 Referer**에서 ID JSON200, 구버전·알 수 없는 Referer/없음204, POST405, no-store. 옛 페이지까지 신규 버전이라고 주장하지 않아 강제 새로고침 반복 위험 억제.
5. 비공개 Nginx 원본 두 파일 백업(600권한)→예상 SHA 확인→`nginx -t`→무중단 reload 후 실제 HTTPS24/24 확인. 변경 후 Nginx SHA `8702a578f7c91348c98c90c7a44341e9863bbfeeac23cceed9dff284a6b8c2b4`, SEO 스니펫 `c6a2642e748c88d1e94bb90f2682d4b7dc0c0950d6f233d78524a2a14edeb74a`. 구 Spring/금융 원장·개인정보 미수정, v25.2 P0 보호 유지.
6. GitHub에는 **민감 설정 전체 파일을 게시하지 않음**. `scripts/qa/verify-frontend-origin-v26.py`로 HTML13/13, 정적 파일1005/1005, 신규 버전 정합성 회귀 가능; `scripts/qa/inventory-frontend-pages-v26.py`로 Next180·비로그인147 경로 QA. 운영 설정 원복은 현 SHA와 백업 원본 SHA 모두 비교한 뒤 *두 파일을 함께* 복구·문법 확인·reload·API/보안 검증. 타 작업자가 설정을 변경한 경우 임의 덮어쓰기 절대 금지. 원복하면 과거 SEO 관리자503도 재발할 수 있음.
7. 아직 **실제 관리자 로그인 화면 양성, v17 신디자인, 회원 전 화면, 채팅 동글 전역 반영, 동적 공개5, Next Flight, 실 브라우저/모바일 320·390** 미검증. 운영 수정2건 완료를 전체 프론트엔드 완료로 표시하지 말 것.
