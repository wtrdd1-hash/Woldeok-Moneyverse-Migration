# 배포 보류 — 개발 A / 게시판 댓글 필터 / 2026-11-02

**상태: main 병합 금지 / 공식 Test 승격 금지 / Production 승격 금지.** Draft PR #2399, 기준 main `510dbe6bf4d5c2a8089fc06b480776053da7a2e3`.

로컬 Backend·Frontend 전체 테스트, 빌드, 타입검사, 린트, Android API 계약 및 개발 PostgreSQL 읽기 검증은 통과했으나 운영 배포 증거가 아님. 공식 Test가 후보 SHA를 실행하지 않았으며 인증 E2E·실제 DB·Android 흐름·독립 백업 복원·금융 원장 검증·최소 권한 심사가 남아 있음. 개발 DB에서 앱 계정의 `account_balances UPDATE` 및 `user_items DELETE`가 허용되는 P0 #993 문제가 지속됨. 이전 QA v1448은 별도의 운영 P0 문제를 보고함. 최종 SHA GitHub CI 확인도 필수.

**롤백:** 운영 배포가 없으므로 운영 롤백 불필요. 검토 후 기능 커밋을 되돌리면 선택적 필터를 제거할 수 있으며 DB 마이그레이션·금융 원장 변경은 없음. 다른 개발자의 고유 미통합 브랜치와 운영 GitOps 설정은 보호.
