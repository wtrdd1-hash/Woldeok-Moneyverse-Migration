# v2026.09.21.324 — 전 저장소 보안 마스터 기획

- `docs/planning/SECURITY_MASTER_PLAN.md`와 한국어 대응 문서를 추가했다.
- OWASP ASVS 5.0.0을 주 애플리케이션 검증 기준으로 채택하고 OWASP Top 10:2025, API Security Top 10:2023, CWE 2025, CVSS v4.0, CISA KEV, NIST SSDF, SLSA를 보조 기준으로 결합했다.
- 인증, 권한, API, 프론트, DB, 경제, 주식, 은행, 마켓, 커뮤니티, 1:1 채팅, 업로드, 관리자, 국고, AI, 모바일, WebSocket, CI/CD, 공급망, 인프라, secret, 관측, 백업/복구까지 위협모델과 negative test 요구사항을 추가했다.
- double-spend, replay, race, escrow, settlement, privilege, treasury invariant 같은 비즈니스 로직 악용을 별도 보안 위험으로 명시했다.
- P0/P1/P2 취약점 처리 및 배포 차단 정책을 정의했다.
- Security Definition of Done과 exact-SHA Test/Production 보안 gate를 정의했다.
- 문서 전용 변경이며 런타임·DB·테스트·운영 변경 완료를 의미하지 않는다.
