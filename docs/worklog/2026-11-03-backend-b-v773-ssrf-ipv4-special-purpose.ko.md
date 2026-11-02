# Backend B v773 — 특수 목적 IPv4 SSRF 차단

2026-11-03 KST. **P1 보안 개선 / Draft / RELEASE HOLD.**

`isPrivateIp`가 RFC 5737 TEST-NET 및 192.0.0/24, 192.88.99/24 특수 목적 주소를 공용 IP로 허용하는 문제를 수정했습니다. `backend/src/security/ssrf-defense.ts`의 분류기를 수정하여 직접 URL, DNS 응답, 리다이렉트, IPv4 매핑 IPv6 경로에 동일하게 적용했습니다. API/DB/원장/인증 정책 변경은 없습니다. 실제 공격 증거는 없습니다.

신규 테스트 RED 3건을 확인한 뒤 수정했습니다. SSRF 집중 17 PASS, 보안 66 PASS/6 SKIP, Typecheck·Lint·Backend/Frontend Build PASS, Frontend 전체 2,947 PASS, DB 패키지 72 PASS/5 SKIP, 계약 41 PASS. Backend 전체는 기존 프로필 HTTP 인증 2 FAIL, 2,986 PASS, 518 SKIP. 공식 Test exact-SHA·실제 PostgreSQL·Runtime CI·GitOps 게이트는 미확인/BLOCKED입니다.

시작 main `846844bf0bd573f0c0f0654e27ccb44321847106`, 동기화 main `d22c36dbecad1fe136d3850715f1068a7d1df573`. 기존 IPv6 수정 Draft PR #2588과 동일 파일 일부를 수정하므로 병합 전 통합 검토가 필요합니다. **main 병합, Test/Production 배포, DB 쓰기, 기존 예약 변경 없음.**
