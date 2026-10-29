# 알림 미확인 필터 릴리스 게이트 — HOLD

- 2026-10-29, Draft PR #1893. 최신 main `7ba69348350cea054544dd4c17d782ed8dcf19fb` 재기반. 최종 기록 전 테스트 코드 SHA `a1e7d5991133a658573b8ce94c476074c609cd73`.
- 알림 대상 프론트 33건·백엔드 10건, DB 56건(4 SKIP), 격리 PG, 앱 API 계약, Bot 11건, Build/Typecheck/보안 PASS.
- 전체 Lint 3건 오류, Backend 240건·Frontend 61건 실패, SQL 전체 재적용 020에서 중단, 정확 SHA CI FAIL, 후보 이미지 SKIP. 공식 Test 인증 E2E·복원·금융 출처·마이그레이션 체크섬·GitOps 승인 없음.
- 공식 Test/Production은 모두 기존 `c2129625aa6629c616fb31ce790950618b8d92b2`. 본 후보 배포·DB 변경·롤백 없음.
- 브랜치 2→5, PR 1→4, 삭제/종료 0. 미통합 고유 변경 브랜치 전부 보존.
- **판정: 운영 배포 금지.** 후보를 배포하지 않았으므로 롤백도 실행하지 않음.
