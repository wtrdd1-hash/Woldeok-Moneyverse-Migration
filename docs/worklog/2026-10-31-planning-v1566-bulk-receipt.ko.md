# 2026-10-31 기획 v1566 작업일지

시작: Debian 13.6 miniPC·GitHub main·설치 Superpowers 스킬 확인(skills__list 빈 목록).
중간: v1564 토큰/영수증 모순 및 조회 API 누락, PR #2183·이슈 #2182 확인; main 중간 재조회 5bccda44d6db56aff05fa5623ef7f72b2ec0263c 완료.
완료: 최종 SHA·CI 확인 후 추가; RELEASE HOLD.

## v2026.10.31.1566 — F675-197 영수증 우선 재확인 (기능 보완 / DRAFT / RELEASE HOLD)
- **회차:** 이전 추가 v1564 → 현재 보완 v1566 → 다음 추가 v1568(잠정). main 5bccda44d6db56aff05fa5623ef7f72b2ec0263c, 미병합 Draft #2183 후속, 개발 #2182; F675-192~197 미구현.
- **보완:** 첫 적용 커밋 후 응답 유실·121초 재시도는 120초 토큰 만료가 아니라 본인 영수증을 우선 반환해야 한다. HMAC·발급시각·세션 난수를 제외한 안정적 정규 SHA-256 다이제스트, 신규 쓰기만 유효 토큰·현재 상태 요구. 동일키 다른 요청 409, 미확정 UNKNOWN.
- **API/화면:** 본인 인증·CSRF 읽기 전용 POST /api/v1/shop/expiry-reminders/mutes/bulk/receipt-status {idempotencyKey}; 200 VERIFIED_COMMITTED, 미증명 202 UNKNOWN, 400/401/403/429/503. Next/Android VERIFYING_RESULT·결과 확인 CTA, 전체 상태 private/no-store/noindex/no-referrer.
- **DB/QA:** 회원+키 UNIQUE·불변 영수증, 키→설정→정렬 보유→제외 잠금, 제외+영수증 원자성·보존 게이트·부정 권한 시험. P0 OPS1566-01/SEC1566-02/FIN1566-03/REL1566-04, P1 REPLAY1566-05~REPLAY1566-10. PG17 보유 10,001/회원2/워커2, 119/120/121초·응답 유실·동시 동일키·±1µs 시험은 제안만·미실행.
- **근거:** miniPC 서비스 활성·cgroup 814/1027, Test/Production 버전 bc8cd8a6...로 main과 다름. 이전 QA1417 전체 TIMEOUT·감사 13건. 외부 신규 승인 0/누적 검증·중복제거·분류 UNKNOWN/10,000 BLOCKED/IN PROGRESS. 기능 OFF, 정확 SHA Test·독립 복원·Production RELEASE HOLD, 문서만 변경.
