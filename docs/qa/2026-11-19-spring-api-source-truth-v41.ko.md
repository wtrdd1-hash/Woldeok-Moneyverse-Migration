# v2026.11.19.41 — Spring 관리자·회원·게시판 API 통합 QA

본 후보는 금융 보안 PR #3302와 웹 PR #3301/#3303의 미니PC 격리 통합 소스에서 별도 브랜치 `fix/spring-canonical-board-api-v2026.11.19.41`로 구현. **운영 Java/JAR/UI 승격이 아닙니다.**

| 검사 | 결과 |
| --- | --- |
| 게시판 실제 DB 조회·쓰기/신원·CSRF·멱등성 검증 JUnit | **10/10 통과** |
| 관리자 Discord 배송 내역 실제 소스/인증/오류 JUnit | **3/3 통과** |
| 전체 Spring `clean test bootJar` | **266/266 통과, 실패 0, 스킵 0**, 후보 JAR SHA256 `5c0b480e62444c9bb5a27be6185bd849d7e59c786429dab03f6ec1a3f6c032ad` |
| 사용자 웹 실제 Chromium 픽스처 | 16/16 |
| 관리자 웹 실제 Chromium 픽스처 | 13/13 |
| 최신 게시글 정상·503·가짜 응답 차단·빈 목록/반응형 | 6/6 |
| 번역 자동·수동 EN/KO/JA/ZH/VI | 112개 키×5 언어, 누락 없음 |
| 실제 DEV PostgreSQL 읽기 확인 | `member_board_public_list_with_stock(50)` 실제 1건, app 역할 함수 EXECUTE 허용. 작성/실계정 연동 미실행 |
| 운영 공개 GET 208개 익명 검사 | 200=96 / 401=71 / 302=29 / 403=8 / 301=1 / 406=1 / 502=1 / 503=1. 모든 기능 검증 아님 |
| 운영 Nginx 관리자 HTML·블로그 접근 보호 | 8경로 비로그인 302, 실제 HTTPS 검증. 기존 일반 사이트 정상 |
| 공식 HTTPS Test 정확한 SHA·실관리자/원장/180페이지/롤백 | **미검증 (Test 403), 전체 승격 보류** |

**수정된 코드:** 가짜 게시글 대신 실제 공개 DB 함수, 신원은 로그인 세션 UUID만, CSRF와 유효한 UUID 멱등성 키, 실제 DB 작성 영수증 성공 시에만 200. 미검증 종목 태그는 422, 오류는 503. H2 테스트에서 PostgreSQL 함수가 없으면 허위 200 대신 503. 관리자 Discord 이력은 유효 관리자 세션·현재 역할 필요, 배송 완료 미확인 상태를 `delivered`로 위장하지 않음. UI는 실제 UUID·`ok:true`만 글 표시하고 가짜 ID와 오류를 차단. **현재 운영 API는 예전 JAR이므로 게시판 허위 응답·Discord 길드상태 502 등이 그대로 남아 있습니다.**

별도 읽기 전용 테스트 Spring은 기본 DB localhost5432 연결 오류로 기동 불가. 운영 DB 비밀번호·환경변수 복사 또는 권한 우회는 하지 않았습니다. G442 모든 웹 경로 5회·실계정·금융 원장·공식 Test·복구 게이트 전부 통과 전 Java/UI 전체 승격 금지. [영문 QA](2026-11-19-spring-api-source-truth-v41.md) / [운영 접근 보호](../operations/2026-11-19-scoped-admin-edge-v41.md).
