# 릴리스 HOLD — 개발 A 2026-10-31 20:25

**후보:** Draft PR #2198, 브랜치 `auto/hourly-a-20261031-2025-season-rank-limits`, 코드 SHA `cadb1561fd83265e17be96319dd26050f8567015`.

**허용:** 독립 브랜치·worktree 보존, 로컬 전체/대상 테스트, 개발 DB 읽기 전용 확인, 격리 합성 PostgreSQL, GitHub PR 및 증거 기록.

**금지:** main 병합, 공식 Test 배포, GitOps Production 승격, 서비스 재시작, 운영·금융 DB 변경, 미통합 브랜치 삭제.

**차단 사유:** 개발 DB 앱 계정의 이벤트 참여 테이블 직접 SELECT/DELETE 권한(P0 #993), 공식 Test/Production SHA가 후보와 다름, 삭제된 v1515 실행 경로(P0 #1984), 독립 백업 복원·정확 SHA 인증 E2E 미검증, QA v1420 국고·마켓 원장 P0, 전체 의존성 감사 13건. 수정 SHA CI/후보 이미지 결과는 완료 시 확인.

**롤백:** 실행하지 않음. 이번 작업에서 배포·영속 DB 변경이 없었으므로 기존 Test/Production 상태 유지. 후보 이미지 빌드 성공만으로 배포 허용 불가.
