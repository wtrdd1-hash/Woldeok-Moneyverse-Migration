# 개발 B v600 — DNS 고정 SSRF 외부 요청 보안 강화 (Draft / HOLD)

일자: 2026-10-28 KST. 대상 이슈: #1369. 시작 main: `b1cd54fda1123fb07ca81b6e5b3ead70f59f556c`. 독립 브랜치: `auto/hourly-b-ssrf-pin-v600-20261028-0535`.

기존 `safeFetch`는 DNS 결과를 검사한 뒤 호스트명으로 다시 연결해 검증 후 DNS 변경(TOCTOU) 가능성이 있었습니다. 이번 변경은 검증된 A/AAAA 주소를 요청별 Undici 연결에 고정합니다. 원래 호스트명을 TLS 인증서 검증/SNI/HTTP Host에 사용하며, 리다이렉트마다 새 주소를 검증하고 민감 헤더·본문의 타 출처 전달을 차단합니다. 호출자가 전달한 URL의 사후 변경, Host 헤더 강제 지정, 16진수 IPv4 매핑 IPv6 우회도 차단했습니다. 응답은 16MiB로 제한하고 소켓을 정리합니다.

수정 전 테스트에서 4건 실패를 재현했고, 수정 후 집중 보안 테스트 20건을 통과했습니다. 격리 로컬 HTTP 서버로 원래 Host 유지와 별도 DNS 재조회 없는 연결을 검증했습니다. 전체 Typecheck 및 빌드 PASS, Backend 1,693 PASS / 430 SKIP, Frontend 1,681 PASS, 변경 파일 Lint PASS입니다.

기존 main의 블로그 ESLint 오류 2건과 DB 마이그레이션 283 중복·285 누락으로 전체 Lint 및 root test FAIL입니다. 전체 의존성 감사 11건(Moderate 9, Low 2), 봇 감사 6건(Critical 1, High 5)도 미해결입니다. DB·API 경로·원장·잔액·운영 환경은 변경하지 않았습니다.

공식 Test exact-SHA, 인증 E2E, 전체 CI, GitOps 게이트 미완료로 PR은 Draft + hold이며 병합 및 Production 배포를 금지합니다. 다른 개발자의 작업과 핵심 예약은 변경하지 않았습니다.
