# v2026.11.18.7 — 프론트엔드 전체 Spring 전환: 공개 정책 화면

**한국어** | [English](2026-11-18-spring-public-policy-v2026.11.18.7.md) | 시작 / PR·승격 미확정

## 작업 전 — 2026-11-18 08:33 KST
- 사용자 목표: 웹 프론트엔드·BFF 모두 Spring MVC/Java로 전환하고 최종 Next 제거. 직전 v2026.11.18.6은 정식 `/`, `/guide`만 실제 Spring 배포, 사용자 대시보드 기능 동등성 미확보. 나머지 Next :4524는 아직 필요. G0~G6 경로별 검증 전 전환 완료 보고 금지.
- 최신 `origin/main` SHA `e96e8f81f4d6b99b221392a2b6fe46356361b145`, 이전 Spring 브랜치 및 AGENTS.md, 문서 상태/정책, 배포 지침, 최신 프로젝트 기획·통합 기획(우선) 확인. 전환 목표 Next 페이지 178·BFF124, 완전 동등성 인증 0, SEC1/CSRF·금융·인증 부채. 기존 독립 브랜치 위에 적층한 별도 작업트리, 다른 AI 홈/가이드·관리자 복구 작업트리는 수정하지 않음.
- 운영 실제 Spring :4550, H2-only 정식 Spring Test :4578/운영 :4579, 임시 Next :4524 가동. `/terms`, `/privacy`, `/account-deletion`은 여전히 Next HTML 200. Discord 시작 `/auth/discord/authorize`는 잘못된 200/475바이트 화면(별도 P0).
- 원본 준거: `frontend/src/components/policy/terms-document.tsx`, `privacy-document.tsx`, `frontend/src/components/deletion-request-info.tsx`, 각 Next 페이지 파일과 기존 Spring 계정삭제 프리뷰. 약관·보존 문구를 임의 변경하지 않음. 기본 영어·한국어 선택, SEO canonical/의미론적 헤더, 모바일 320px·200% 확대·키보드 포커스, JS 없는 페이지 목표.
- 순서: RED 테스트 → 기능 플래그를 둔 `/terms`, `/privacy`, `/account-deletion` 정식 Spring MVC/Thymeleaf → 기존 정적 JSX 정책 문구를 결정적 생성으로 변환·동등성 테스트 → H2 읽기 전용 라우트만 허용, 회원 DB/쓰기/인증 API 차단 → JDK21 불변 빌드·실제 Test 외부 HTML/보안/스타일 검증 → 가능할 때만 정확한 운영 정책 경로 Nginx 승격·원복·EN/KO 기록·main 중간 재조회. 나머지 기능과 금융 데이터 변경 금지.

## 작업 중
테스트 대기.

## 종료
대기.

## 작업 중 — 2026-11-18 08:39 KST (RED/원인)
- 법적 문서 원문 동등성 Python RED는 Spring 템플릿이 없어 실패. 결정적 템플릿 생성 후 **Python 2/2 통과**, 4개 영/한 문서에서 정책 본문의 모든 텍스트 노드·링크·제목 순서를 원본 JSX와 일대일 비교. 영문·한국어 법적 조항 차이도 그대로 유지, 축약·임의 정책 작성 없음.
- 첫 Java21 Spring 전체 `clean test bootJar`는 **161개 중 2개 실패**, 배포 안 함. 하나는 원본 & 기호와 `&amp;`의 테스트 기대값 불일치(실제 문구 정상), 다른 하나는 기본 OFF 정책/계정 정식 플래그를 기존 필터 테스트에서 켜지 않아 475바이트 SPA 폴백 응답. 테스트 기대값과 활성화 플래그만 수정 후 전체 재실행 예정.
- 기본 OFF Spring MVC 정식 약관/개인정보 컨트롤러, 기존 프리뷰 계정삭제와 같은 원문을 사용하는 정식 계정삭제 안내 분리(미리보기 문구·noindex 조건부), 영/한 Thymeleaf 4종, 모바일 CSS, H2-only 허용 경로, Test/운영 Nginx 정확한 경로 및 원자적 원복 코드 구현. 운영 PostgreSQL/원장/API/OAuth/세션 변경 없음.

### 2026-11-18 08:42 KST — 소스 GREEN·공식 Test 실제 검증
- 코드 커밋 `86497e60a4e89684ac80f2266fb690d35c59eb3b`. 이후 문서만 추가하여 JAR 불변. Java21 전체 `clean test bootJar` **42개 스위트, 161개 테스트 전부 성공, 실패/오류/건너뜀 0**. 정책 원문→Thymeleaf 노드 일치 Python 2/2, Next 178페이지+124 BFF 경로 인벤토리 4/4 통과. 불변 JAR SHA256 `b3c1b0dac9e5bb809a9f2dc6e2e51f2012361c1e7efda9ea9427a71d5adee5d6`, 배포 파일 `/srv/moneyverse-data/releases/spring-public-policy-v2026.11.18.7-86497e60a4e/spring-public-frontend.jar`, 버전 매니페스트 및 해시 검증.
- H2 메모리 독립 Spring Test 서비스 `moneyverse-spring-public-test-v20261118.service` 127.0.0.1:4580 기동. 로그인/금융/관리자 API 요청 차단 404. 로컬 한/영 홈·가이드·약관·개인정보·계정삭제·CSS 세 개 200. 운영 PostgreSQL 사용 안 함.
- 최신 main SHA `e96e8f81f4d6b99b221392a2b6fe46356361b145` 재조회 후 Test Nginx 버전 스니펫을 원자적 백업·문법 검사·무중단 reload. **공식 Test 공개 HTTPS** 5개 정식 경로 한/영·CSS 3개 전부 **실제 Spring SSR HTTP 200**, 버전 헤더 `v2026.11.18.7-test`, 기존 정책 원문·CSP·캐시 헤더 확인, 계정 삭제 POST 405. 기존 API/version 및 spring-web 미리보기 유지. 운영 /privacy는 승격 전 기존 Next HTML이므로 운영 전환은 다음 단계.
