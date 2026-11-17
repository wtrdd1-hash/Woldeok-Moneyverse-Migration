# v2026.11.18.1 — Spring 웹 계정 삭제 안내 화면 전환

**상태:** 작업 중 / 운영 승격 보류 (소스 변경만)  
**날짜:** 2026-11-18 KST · [English canonical](2026-11-18-spring-web-account-deletion-v2026.11.18.1.md)

## 작업 전 (코드 변경 이전 기록)
- 사용자 지시: 웹 프론트엔드와 백엔드까지 Spring으로 전환. 이번 단위는 정식 경로가 아닌 독립적인 공개 화면 전환 후보임.
- 최초 병합 `origin/main` SHA: `e96e8f81f4d6b99b221392a2b6fe46356361b145`. AGENTS, 최신 통합 기획, 프로젝트 계획, 문서 정책, Spring 기획·점검 문서를 조회함.
- 독립 브랜치 `feature/spring-web-account-deletion-v2026.11.18.1`를 Spring 웹 기반 PR #3213 위에 적층. 기존 프론트 복원·로그 PR #3249는 수정하지 않음.
- 기존 Next `/account-deletion`은 `DeletionRequestInfo`를 사용. 삭제 요청 절차, 보관 기간, 주의 문구의 의미를 그대로 유지해야 함. 정식 화면의 단일 소유자는 Next로 유지.
- 미니PC Desktop Commander 연결 대상은 모두 오프라인. 따라서 호스트 Gradle·공식 Test·Nginx·실제 DB·운영 환경 검증 불가.
- 범위: 기본 비활성 Spring MVC 읽기 전용 미리보기 `/spring-web/account-deletion`, 영어·한국어, 반응형·접근성, noindex/private 헤더, 테스트와 대조 기록.
- 계정 변경·금전 기록·세션 변경·비밀값·정식 경로 스위치·운영 배포 없음.

## 진행 중
- 독립 웹 컨트롤러와 Thymeleaf 템플릿 추가.
- 양언어 HTML, 보안 헤더, 링크 안전성, 기본 비활성 상태 회귀 테스트 추가.
- 마무리 전 `origin/main` 재확인 및 적층 초안 PR.

## 종료
- 코드·검증 기록 전. **공식 Test 및 운영 검증 완료로 간주하지 않음.**
