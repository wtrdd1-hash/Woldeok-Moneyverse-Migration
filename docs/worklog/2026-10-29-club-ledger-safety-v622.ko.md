# 개발 B v622 — 클럽 WLD 소각 결제 안전 차단

상태: **PARTIAL / BLOCKED**. 시작 main SHA `35971c600f25869c96f1c666d4b9f58927202730`.

Migration 222의 클럽 창설(10,000 WLD) 및 프로젝트 기여는 잔액을 직접 수정하고 `ledger_transactions`에 `ON CONFLICT DO NOTHING`을 사용하지만 복식 `ledger_postings`와 불변 재시도 영수증을 작성하지 않습니다. 따라서 중복 차감 및 원장 불일치의 소스 코드상 위험이 있습니다. 운영 손실이 발생했다는 증거는 아닙니다.

Backend Controller/Service/Repository의 두 금융 변경 경로를 HTTP 503, `CLUB_LEDGER_SETTLEMENT_UNAVAILABLE`로 차단했습니다. 조회 경로는 유지했습니다. 실제 DB 함수 및 권한은 변경하지 않았으므로 **운영 차단이 적용된 것은 아닙니다**. 이전 미병합 PR #1422(원장 결제·DB 권한), #1428(프로젝트 차단)의 고유 작업을 보존해야 합니다.

TDD RED 4건 → GREEN 신규 5/5, 집중 총 7/7, Backend 전체 1,942 PASS/440 SKIP, DB 46 PASS/4 SKIP, Typecheck·Backend Build·Lint 오류 0·API 계약 180·보안 정책 18 PASS. `pnpm audit --prod` Moderate 1건 FAIL. 공식 Test 정확 SHA, 전체 Frontend, 격리 PostgreSQL 금융/권한 검증, GitOps 미완료. 디스크 98%. main 병합/운영 배포 금지. 개발 A/C는 웹·Android의 이용 불가 안내와 기존 PR #1716의 클럽 컨트롤러 변경 통합이 필요합니다.
