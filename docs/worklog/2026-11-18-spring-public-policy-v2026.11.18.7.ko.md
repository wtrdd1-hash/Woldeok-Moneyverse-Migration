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
