# Backend B v772 — SSRF IPv6 전환 주소 차단

**시작 (2026-11-03 07:40 KST):** 최신 main f5c3fbedae1c3b3ec2374882b049aac43a655eb4 기준 독립 브랜치·worktree. AGENTS, README, 영문·국문 기획, QA v1483, PR/CI 검토. 다른 개발 작업과 중복되지 않는 P1 후보를 선택함.

**결함:** NAT64 및 6to4 IPv6 전환 주소는 일부 네트워크에서 내부 IPv4 목적지로 변환될 수 있으나 기존 SSRF 분류기는 이를 허용. 실제 악용 또는 운영 침해 증거는 없음.

**중간:** 테스트 선작성 후 3건 실패(14건 통과), 구현 후 집중 17건 통과. NAT64 표준 /96, 로컬 /48, 6to4 /16 범위만 차단. 일반 공용 IPv6 및 인접 범위 허용 유지. 최신 main 및 기획 변경 없음.

**완료 (07:51):** SSRF 집중 23 PASS, 보안 전체 66 PASS/6 SKIP, 계약 41 PASS, DB 패키지 72 PASS/5 SKIP, Frontend 2,947 PASS. Backend 전체 2,986 PASS/2 FAIL/518 SKIP(기존 프로필 인증 401 오류), 전체 Typecheck PASS, Lint 오류 0, Backend Build PASS. Frontend Webpack 빌드는 1GiB Node 힙 제한에서 OOM으로 FAIL. 실제 PostgreSQL·공식 Test exact-SHA·인증 E2E·독립 복원·GitOps 승인 미완료. PR #2588 Draft/HOLD, main 병합 및 Test/Production 배포 없음. DB/원장/기존 예약 미변경.

**검증 중간 (07:49):** SSRF 집중 23 PASS, Backend/Frontend/DB Typecheck PASS, Backend Build PASS, Lint 오류 0(기존 경고 1,027). Backend 전체 2,986 PASS/2 FAIL/518 SKIP(기존 프로필 HTTP 401 불일치), Frontend 2,947 PASS, DB 패키지 72 PASS/5 SKIP. 공식 Test·실제 DB 통합·복원·배포 검증 미완료. 저장공간 위험으로 공유 자원 삭제 없음.
