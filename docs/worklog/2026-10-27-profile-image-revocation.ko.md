# 개발 A — 프로필 사진 공개범위 변경 후 캐시 차단

- 2026-10-27 20:56 KST 시작, Debian 13.6 미니PC 정상 접속. 기준 main `59cdc2e02f0e83e5401049309c4cb89ff57c2d4c`, 분리 브랜치 `auto/hourly-a-profile-image-revocation-20261027-2056`.
- **작업 전:** 영문/한국어 통합기획·AGENTS·README·QA·전체 PR/브랜치 확인. 기존 프로필 사진의 300초 캐시가 공개 철회 후에도 남는 P1 개인정보 위험 확인.
- **작업 중:** Backend/Frontend/Android app-api에서 `private, no-store`를 적용하고 연결·설정 오류도 안전하게 503 처리. RED→GREEN 회귀테스트, 격리 PostgreSQL 17.11에서 001~097 엄격 적용 및 공개→비공개 전환 8건 통과. 기존 SQL 권한·마이그레이션·금융 원장 불변.
- **종료:** 코드 SHA `59572d70b5d987e70fd3cfddc9f202ca1a319a05`, Draft/HOLD PR #1579. Backend 1,550 PASS/413 SKIP, Frontend 1,492 PASS, Build/Typecheck/Lint/API 계약/Bot PASS. main의 마이그레이션 280 중복, 보안 Critical/High, 공식 Test 신원·E2E·GitOps 미충족으로 통합 및 운영 배포 BLOCKED.
- 시작 브랜치/PR 367/358 → 종료 369/360. 미병합 고유 변경 보존, 브랜치 삭제 0. Test/Production/DB/기능스위치/롤백 변경 0. 병합 전 PR 폐기, 추후 병합 시 코드 revert로 롤백 계획. 영문 보고서가 원본이며 이 문서는 한국어 보조 기록.
