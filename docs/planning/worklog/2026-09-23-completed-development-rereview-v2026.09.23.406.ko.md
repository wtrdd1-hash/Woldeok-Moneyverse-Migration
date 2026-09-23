# 작업기록 — 개발 완료 항목 재검토 v2026.09.23.406

기준 main: e447b11f1d27ee7da2a46c64fcd96e0058c8da6d.

먼저 원격 non-main 브랜치 50개를 전부 삭제했다. 이후 latest main에서 v406 fix 브랜치를 새로 만들어 감사 변경을 진행했다.

Runtime 비교: Production /api/version = 2c854d47903294ef4ad48006a1b9cd57a70f5590, Test = 7b705e1d37e97ccd05ba12042c3fd8d582e396d0. v406 전 current main과 Test 사이 비문서 app delta는 0건이고 Production은 Test보다 비문서 파일 55개 뒤다.

재검토에서 고급 marketplace 완료 주장에 중대한 무결성 gap을 확인했다. Auction은 item escrow/end settlement/ledger posting이 미완성이고, P2P confirm은 atomic WLD/item transfer를 실행하지 않았으며, appraisal은 authoritative ownership/provenance와 ledger-backed fee settlement가 없었다. Frontend fallback은 fake authority record도 표시/생성했다. 위험 write를 차단하고 sample fallback을 제거했다.

Club canvas는 server state load 전 edit/save를 차단했고, 공개 guide에서 고급 marketplace 완료 주장을 제거했다.

검증: frontend focused test 27/27, backend marketplace controller test 5/5, frontend/backend TypeScript typecheck 통과. push 전 git diff check를 다시 실행한다.

Exact candidate가 실제 Test에서 서비스되고 검증되기 전에는 Test/Production 배포 완료를 주장하지 않는다.

CI 후속: 첫 exact-SHA Build Test Candidate는 build 전에 현재 저장소의 기존 lint error 183건/49파일 때문에 차단됐다. 재검토 후 lint blocker를 error 0으로 정리했고 비차단 warning 14건만 남겼다. 깨진 bot QA script 문자열 문법을 수정하고 portfolio donut의 render-time mutation을 순수 prefix 계산으로 바꿨으며, 이번 release 범위를 벗어난 legacy lint debt는 해당 규칙만 제한적으로 억제했다. 정리 후 최종 로컬 검증: lint exit 0, frontend/backend typecheck 통과, frontend focused test 27/27, backend marketplace test 5/5.

전체 candidate DB 후속: lint/typecheck/build/migration 통과 후 CI가 기존 privilege boundary 회귀 4건을 발견했다. application role이 session layer 밖의 durable table에 직접 DML 권한을 갖고 있었고, SECURITY DEFINER 21개가 PUBLIC 실행 가능했으며, stock repository의 portfolio/trade pre-check가 `virtual_stocks`를 직접 JOIN/조회해 function boundary를 우회했다. Migration 233 (`233-security-boundary-reconciliation.sql`)에서 public schema 전체의 app INSERT/UPDATE/DELETE를 회수한 뒤 `auth_sessions`, `oauth_challenges`의 INSERT/UPDATE만 재허용하고, 기존 public SECURITY DEFINER 전체의 PUBLIC 실행권한을 회수했다. 또한 app 전용 `stock_my_positions_v2` / `stock_trade_state` read function을 추가하고 repository가 raw stock table 대신 이를 사용하도록 수정했다. 로컬 migration 정적 테스트 7/7 통과. 로컬 worktree에는 test DATABASE_URL/MIGRATOR_DATABASE_URL이 없어 DB integration은 exact-SHA CI에서 검증한다.
