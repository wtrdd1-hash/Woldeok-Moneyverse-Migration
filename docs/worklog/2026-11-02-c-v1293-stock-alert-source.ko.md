# 개발 C v1293 — 회원 조건부 주식 알림 원본 검증 (한국어 보조)

**2026년 11월 2일 KST. 상태: DRAFT / RELEASE HOLD.**

## 기준과 중복 회피
시작 main `a8541927c3a351d980454c66e95a3356c47e0722`, Debian 13.6 미니PC에서 수행. AGENTS, README 영문/국문, 통합 기획서 영문/국문, 기획 v1646, QA v1460, A/B/C 개발 기록, 열린 PR 195개를 검토했다. 기존 주식 리그 Draft #2250과 중복되는 조사 코드는 커밋 전에 전부 되돌렸다. 실제 구현은 중복되지 않는 회원 조건부 주식 알림 화면 및 Android API 보호에 한정한다. 금융 원장·DB 스키마·권한·운영 환경을 변경하지 않는다.

## 결함과 수정
기존 `/stocks/alerts`는 NestJS 시세·회원 알림 규칙·발생 이력의 JSON을 검증하지 않고 화면에 전달했다. 잘못된 배열, 중복 ID, WLD 가격·bp·날짜·조건은 화면 오류 또는 잘못된 알림 표시를 일으킬 수 있었다. 응답을 엄격하게 검증하고 실제 빈 목록과 조회 장애를 구분하며, 장애 시 알림 생성·삭제 컨트롤을 표시하지 않고 키보드로 접근 가능한 재조회 링크를 제공한다. 기존 서버의 세션·동의·CSRF 검사와 회원별 PostgreSQL 조회 함수를 재사용한다.

Android `/app-api/v1/stocks/alerts`와 `/events`는 검증되지 않은 성공 응답을 503으로 차단하고 정상·오류·HEAD에 `private, no-store`, `noindex`, `no-referrer`를 적용한다. 회원 웹 페이지 및 언어 경로에도 동일한 비공개 응답 정책을 적용한다.

## 검증 및 배포
RED 실패 재현 후 집중 회귀 테스트 GREEN. 최종 SHA의 전체 Build/Lint/Typecheck/Unit/Integration/보안/App API/실제 PostgreSQL/CI 및 공식 Test 인증 E2E 결과는 별도 증빙으로 남긴다. 필수 검증 하나라도 실패·미실행이면 병합과 Production 배포를 금지한다. 영문 정본은 `2026-11-02-c-v1293-stock-alert-source.md`. 롤백은 이 PR의 프론트엔드 변경만 되돌리면 되며 DB 롤백은 필요 없다. A/B/QA/Gemini 및 미병합 PR은 보존한다.
