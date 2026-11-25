# v2026.11.22.1 — OAuth 로그인 장애 및 작업 이력 감사

**상태:** 문서·증거 확인만 완료. 실제 복구는 차단됨.
- 11월 17일 Spring OAuth 전환과 11월 20일 인증 UI를 승인 기획·보안 정책과 대조.
- Spring Google OAuth는 미완성이고 로그인 UI는 이용 불가로 표시하지만 공급자 API는 활성화라고 응답하는 모순 확인. 기존 Next UI의 공급자 링크도 확인.
- Git 작성자 및 커밋, 민감정보 없는 MCP 실행 이력, 운영·Git Nginx 라우팅 대상 차이를 분리 기록. 실제 사람/AI 실행자 신원은 미검증.
- 사용자의 Discord 로그인 장애 제보와 HTTP 302 인가 시작을 분리; 실제 콜백·세션 결과 미검증.
- 보안상 민감한 조사 기록은 미니PC 제한된 내부 파일로만 보존.
- 애플리케이션 코드 수정, CI 통과 주장, 운영 승격, 인증정보 처리 또는 회원 세션 실험은 수행하지 않음.

[영문 일지](../worklog/2026-11-22-oauth-provider-regression-v2026.11.22.1.md) · [국문 일지](../worklog/2026-11-22-oauth-provider-regression-v2026.11.22.1.ko.md) · [GitHub 업데이트](../updates/v2026.11.22.1-oauth-provider-audit-github.ko.md).
