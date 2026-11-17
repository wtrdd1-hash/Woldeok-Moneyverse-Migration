# v2026.11.18.3 — 사용자 지시 실제 Spring SSR 공개 카나리 운영 승격

**한국어** · [English](2026-11-18-spring-web-public-canary-v2026.11.18.3.md) · 시작 / 승격 범위 제한

## 작업 전 — 2026-11-18 07:50 KST
- 사용자 지시: 프론트엔드 전체 Spring 전환 및 즉시 운영 승격. 범위는 Next 페이지 178·BFF 124. G0–G6 미충족 상황에서 미리보기를 전체 전환이라고 허위 보고하지 않음. 검증 가능한 공개 경로만 단계적으로 승격.
- 권위: origin/main e96e8f81f4d6b99b221392a2b6fe46356361b145, 통합 기획·프로젝트 기획, AGENTS.md, 릴리스 지침. 기존 PR #3255 Java21 141/141 통과. 정식 경로 동등성 0, 인증/금융 Test 미승인.
- 미니PC: 운영 Spring :4550·Next 관리자 긴급 복구 :4524 가동. 운영 기본 Spring fallback에서 Next 로딩 화면 발생. Test `/frontend-version` 502, 운영은 200 HTML. 공식 Test 서비스 비활성.
- **안전 설계:** 실제 운영 PostgreSQL을 전혀 이용하지 않는 H2 메모리 DB 기반 독립 Spring 공개 프리뷰 프로파일. HTTP는 Spring 미리보기 GET/HEAD 및 CSS·헬스 외 모두 404 차단. 정확한 JAR 버전·해시 확인 후 별도 Test 로컬/외부 경로 검증하고 운영에서는 `/spring-web` 전용 경로만 Nginx로 승격. 기존 홈·관리자·API·정식 계정삭제·소켓·Next 복구는 보존. 운영 금융 데이터 쓰기 없음.
- Nginx 이전 설정 백업·롤백 명령 기록, syntax test 후 reload, Test 언어/헤더/에셋 검증 후 운영 외부 응답 확인, 실패 시 즉시 복귀. 승격 전 main 재확인.

## 작업 중
대기.

## 종료
대기.

## 작업 중 — 2026-11-18 07:53 KST
- 운영 PostgreSQL 대신 H2 메모리 DB, 격리 스키마·로컬 임의 소켓만 사용하는 `spring-web-preview` 프로파일 구축. 미리보기 페이지 3개·CSS 2개·`/health`의 GET/HEAD 외 관리자·API·금융·쓰기 요청 전부 차단하는 필터 및 MockMvc 테스트 추가.
- 최소 권한 systemd 단위 템플릿, Nginx 정확한 경로 5개·나머지 preview 404 차단 스니펫 추가. edge에서 사용자 쿠키·인증·내부 토큰 헤더 전달 차단. 현재까지 운영 변경 없음, 검증 후 단계적 적용.
