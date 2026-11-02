# Backend B v754 — 관리자 전체 공지 전송 결과 검증 (2026-11-02)

- **시작:** main `a8541927c3a351d980454c66e95a3356c47e0722` 기반 독립 브랜치. AGENTS, README, 영문·국문 기획서, QA v1464, 열린 PR 및 A/C 병행 작업 확인.
- **문제:** `POST /api/v1/admin/messages/broadcast`는 최대 100명만 조회하면서 일부 전송 실패를 무시하고 `success:true`를 반환했습니다. 수신자별 영속 영수증·멱등성 키가 없어 재시도 중복 위험이 있었습니다.
- **수정:** 인증·관리자 콘솔·CSRF 검사를 유지하면서 HTTP 503 `ADMIN_BROADCAST_DELIVERY_UNVERIFIED`로 안전하게 차단합니다. 수신자 조회·전송·감사 성공 기록을 생성하지 않습니다. 2명/101명 HTTP RED(201)→GREEN(503) 회귀 테스트.
- **계약:** 해당 POST는 전송 완료가 아닌 이용 불가로 처리해야 합니다. 추후 영속 outbox, 전체 수신자 스냅샷, 재시도/중복방지, 실패 증빙 및 E2E가 필요합니다. 기존 관리자 개별 메시지는 변경하지 않습니다.
- **릴리스:** QA v1464의 P0 DB 권한·체크섬·Test DB 불일치 및 exact-SHA·복원 검증이 미해결이므로 Draft/HOLD, 병합·배포 금지. DB/원장/운영 변경 없음.

## 14:51 KST 최종 검증
- 인증 HTTP RED 2건(기존 201), 수정 후 집중 7 PASS, Production 모드 집중 4 PASS.
- Backend 전체 2,981 PASS / 2 FAIL / 518 SKIP(기존 프로필 401, PR #2265). Frontend 전체 최초 140초 시간 초과, 재실행 2,922 PASS.
- Lint 오류 0/경고 1,027, Typecheck·Backend/Frontend Build PASS. DB 패키지 62 PASS/5 SKIP, 모바일 계약 PASS, 릴리스·보안 35 PASS.
- 격리 PostgreSQL 17.11 마이그레이션 322개 적용, 통합 54 PASS/2 SKIP, 직접 잔액 UPDATE/원장 DELETE 권한 차단 확인 후 컨테이너 제거. 운영 DB 권한 문제 해결 증거는 아님.
- 운영 의존성 감사 0건, 전체 감사 취약점 9건(보통 8/낮음 1). CI Runtime 결과 미확인.
- 공식 Test/Production 버전 `510dbe6bf4d5c2a8089fc06b480776053da7a2e3`로 후보 SHA와 불일치. 인증 E2E·독립 복원·GitOps 승인 BLOCKED. main 병합/배포 없음, 예약 유지.
